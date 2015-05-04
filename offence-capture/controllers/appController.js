
'use strict';

/* Controllers */
var eventCaptureControllers = angular.module('eventCaptureControllers', ["ui.date"])

//Controller for settings page
    .controller('MainController',
    function($scope,$modal,$timeout,$translate,$anchorScroll,storage,Paginator,
             OptionSetService,ProgramFactory,ProgramStageFactory,DHIS2EventFactory,DHIS2EventService,
             ContextMenuSelectedItem,DateUtils,$filter,$http,CalendarService,GridColumnService,
             CustomFormService,ErrorMessageService,ModalService,DialogService) {
    	$scope.offenceEventModal = new iroad2.data.Modal("Offence Event",[new iroad2.data.Relation("Offence Registry","Offence")]);
        //selected org unit
        $scope.today = DateUtils.getToday();
        $scope.panel = {vehicle:false,driver : false,offences:false};
        $scope.show = function(panel){
        	for(var key in $scope.panel){
        		$scope.panel[key] = false;
        	}
        	$scope.panel[panel] = true;
        }
        $scope.data = {};
        $scope.onInitialize = function(){
        	$scope.offenceEventModal.getAll(function(result){
				$scope.data.offences = result;
				$scope.$apply();
			});
        }
        dhisConfigs.onLoad = function(){
			$scope.onInitialize();
		}
		iroad2.Init(dhisConfigs);
		$scope.normalClass= "mws-panel grid_8";
		$scope.addNew = function(modalName){
			var event = {};
			angular.forEach(iroad2.data.programs, function (program) {
                if (program.name == modalName) {
                	angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
                		if(dataElement.dataElement.name.startsWith(iroad2.config.refferencePrefix)){
                			event[dataElement.dataElement.name.replace(iroad2.config.refferencePrefix,"")] = {};
                		}else{
                			event[dataElement.dataElement.name] = "";
                		}
                       
                    });
                }
            });
			$scope.enableEdit(event);
		}
		$scope.showRegistries = function(registries){
			$scope.show("offences");
			$scope.data.offenceRegistries = registries;
		}
		$scope.isInteger = function(key){
			return $scope.is(key,"int");
		}
		$scope.isDate = function(key){
			return $scope.is(key,"date");
		}
		$scope.isString = function(key){
			return $scope.is(key,"string");
		}
		$scope.is = function(key,dataType){
			for(j = 0 ;j < iroad2.data.dataElements.length;j++){
				if(iroad2.data.dataElements[j].name == key){
					if(iroad2.data.dataElements[j].type == dataType){
						
						return true;
					}
					break;
				}
			};
			return false;
		}
		$scope.isBoolean = function(key){
			return $scope.is(key,"bool");
		}
		$scope.filterObject = function(object,fields){
			con:
			for(var key in object){
				for(j = 0 ;j < fields.length;j++){
					if(fields[j] == key){
						delete object[key];
						continue con;
					}
				}
			};
			console.log(JSON.stringify(object));
			return object;
		}
		$scope.showDriver = function(driver){
			$scope.show("driver");
			$scope.data.driver = driver;
		}
		$scope.showVehicle = function(vehicle){
			$scope.show("vehicle");
			$scope.data.vehicle = vehicle;
		}
		$scope.enableEdit  = function(event){
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "mws-panel grid_6";
            $scope.editing = "true";
            //console.log(JSON.stringify(iroad2.data.programs));
            angular.forEach(iroad2.data.programs, function (program) {
                if (program.name == $scope.offenceEventModal.getModalName()) {
                    $scope.editingProgram = program;
                }
            });
            $scope.savableEventData = [];
            $scope.editingEvent = event;
            for (var key in event) {
            	if (typeof event[key] == "object") {
            		var program = $scope.offenceEventModal.getProgramByName(key);
            		angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
                        if (dataElement.dataElement.code) {
                        	if(dataElement.dataElement.code.startsWith("id_")){
                				$scope.editingEvent[dataElement.dataElement.name] = event[key][dataElement.dataElement.name];
                				$scope.savableEventData.push({"name":dataElement.dataElement.name,"key":key,"value":event[key]});
                				$scope.watchEditing(program,dataElement.dataElement);
                				delete $scope.editingEvent[key];
                			}
                        }
                    });
            	}
            }
        }
		$scope.save = function(){
			angular.forEach($scope.savableEventData, function (savableData) {
            	delete $scope.editingEvent[savableData.name];
            	$scope.editingEvent[savableData.key] = savableData.value;
            });
			
			console.log("Saving Data:" + JSON.stringify($scope.editingEvent));
			var otherData = {orgUnit:"ij7JMOFbePH",status: "COMPLETED",storedBy: "admin",eventDate:$scope.editingEvent['Offence Date']};
			var saveEvent = $scope.editingEvent;
			$scope.offenceEventModal.save(saveEvent,otherData,function(result){
				console.log("Save Made:" + JSON.stringify(result));
			},function(error){
				
			},$scope.offenceEventModal.getModalName());
			$scope.cancelEdit();
        }
		$scope.cancelEdit = function(){
			$scope.normalClass= "mws-panel grid_8";
            $scope.editing = "false";
        }
		$scope.watchEditing = function(program,dataElement){
			$scope.$watch("editingEvent['"+dataElement.name+"']", function (newValue, oldValue) {
				//alert("Program:" + JSON.stringify(program));
				if(newValue != "")
				{
					var relationModal = new  iroad2.data.Modal(program.name,[]);
					relationModal.get(new iroad2.data.SearchCriteria(dataElement.name,"=",newValue),function(result){
		        		//console.log("Relation Modal:" + JSON.stringify(result));
		        		if(result.length > 0)
		        		{
		        			angular.forEach($scope.savableEventData, function (savableData) {
		        				if(savableData.name == dataElement.name){
		        					savableData.value = result[0];
		        					
		        				}
		                    });
		        		}else{
		        			angular.forEach($scope.savableEventData, function (savableData) {
		        				if(savableData.name == dataElement.name){
		        					savableData.value = null;
		        				}
		                    });
		        		}
		        		$scope.$apply();
					});
				}
			});
		};
    });
if (typeof String.prototype.startsWith != 'function') {
	/**
	 * Checks if a string starts with a given string
	 * 
	 * @param string
	 * 
	 * @return boolean
	 * 
	 */
	  String.prototype.startsWith = function (str){
	    return this.indexOf(str) === 0;
	  };
}
if (typeof String.prototype.endsWith != 'function') {
	/**
	 * Checks if a string ends with a given string
	 * 
	 * @param string
	 * 
	 * @return boolean
	 * 
	 */
	  String.prototype.endsWith = function (str){
	    return this.slice(-str.length) == str;
	};
}