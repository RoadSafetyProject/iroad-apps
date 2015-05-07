
'use strict';

/* Controllers */
var eventCaptureControllers = angular.module('eventCaptureControllers', ["ui.date","multi-select"])

//Controller for settings page
    .controller('MainController',
    function($scope,$modal,$timeout,$translate,$anchorScroll,storage,Paginator,
             OptionSetService,ProgramFactory,ProgramStageFactory,DHIS2EventFactory,DHIS2EventService,
             ContextMenuSelectedItem,DateUtils,$filter,$http,CalendarService,GridColumnService,
             CustomFormService,ErrorMessageService,ModalService,DialogService) {
    	$scope.offenceEventModal = new iroad2.data.Modal("Offence Event",[new iroad2.data.Relation("Offence Registry","Offence")]);
    	$scope.converts = {"Offence":{"name":"Section","button":"Nature"}};
        //selected org unit
        $scope.today = DateUtils.getToday();
        $scope.panel = {vehicle:false,driver : false,offences:false,edit:false,payment:false};
        $scope.show = function(panel){
        	$scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "mws-panel grid_6";
        	for(var key in $scope.panel){
        		$scope.panel[key] = false;
        	}
        	$scope.panel[panel] = true;
        }
        $scope.data = {};
        $scope.onInitialize = function(){
        	$scope.offenceEventModal.getAll(function(result){
        		console.log("Result:" + JSON.stringify(result));
				$scope.data.offences = result;
				$scope.$apply();
			});
        }
        dhisConfigs.onLoad = function(){
			$scope.onInitialize();
		}
		iroad2.Init(dhisConfigs);
		$scope.normalClass= "mws-panel grid_8";
		$scope.addNew = function(){
			var modalName = $scope.offenceEventModal.getModalName();
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
			angular.forEach($scope.offenceEventModal.getRelationships(), function (relationship) {
				if(relationship.pivot){
					event[relationship.pivot] = [];
				}
			});
			$scope.enableEdit(event);
		}
		$scope.makePayment = false;
		$scope.startPayment = function(){
			$scope.makePayment = true;
		}
		$scope.cancelPayment  = function(){
			$scope.makePayment = false;
			$scope.data.payment['Offence Reciept Amount'] = "";
			$scope.data.payment['Offence Reciept Reciept'] = "";
		}
		$scope.savePayment = function(){
			if($scope.data.payment['Offence Reciept Amount'] != "" && $scope.data.payment['Offence Reciept Reciept'] != ""){
				$scope.data.payment['Offence Paid'] = true;
				var otherData = {orgUnit:"ij7JMOFbePH",status: "COMPLETED",storedBy: "admin",eventDate:$scope.data.payment['Offence Date']};
				$scope.offenceEventModal.save($scope.data.payment,otherData,function(result){
	        		console.log("Result:" + JSON.stringify(result));
	        		$scope.makePayment = false;
	        		$scope.$apply();
				});
			}
		}
		$scope.showRegistries = function(registries){
			$scope.show("offences");
			$scope.data.offenceRegistries = registries;
		}
		$scope.showPayment = function(offence){
			$scope.show("payment");
			console.log(JSON.stringify(offence));
			$scope.data.payment = offence;
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
		$scope.inputModal = {};
		$scope.multiselectBools = {};
		$scope.isManyRelation = function(key){
			var relationships = $scope.offenceEventModal.getRelationships();
			for(var z = 0;z < relationships.length;z++) {
				var relationship = relationships[z];
				if(relationship.pivot){
					if(relationship.pivot == key){
						var relationshipProgram = new iroad2.data.Modal(relationship.name,[]);
						relationshipProgram.getAll(function(results){
			        		//console.log("Relation Result:" + JSON.stringify(results));
			        		var inputModal = [];
			        		angular.forEach(results, function(result) {
			        			var input = result;
			        			for(var column in $scope.converts[key]){
			        				input[column] = result[$scope.converts[key][column]]; 
			        			}
			        			input.selected = false;
			        			angular.forEach($scope.editingEvent[key],function(element){
			        				if(element[relationship.name.replace(" ","_")].id == input.id){
			        					input.selected = true;
			        				}
			        			});
			        			inputModal.push(input);
			        		});
			        		
			        		$scope.inputModal[key] = inputModal;
			        		
			        		console.log("Input Modals:" + JSON.stringify($scope.inputModal[key]));
							$scope.$apply();
						});
						return true;
					}
				}    
			}
			return false;
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
		$scope.hasDataSets = function(key){
			for(j = 0 ;j < iroad2.data.dataElements.length;j++){
				if(iroad2.data.dataElements[j].name == key){
					return (iroad2.data.dataElements[j].optionSet != undefined);
				}
			};
			return false;
		}
		$scope.getOptionSets = function(key){
			for(j = 0 ;j < iroad2.data.dataElements.length;j++){
				if(iroad2.data.dataElements[j].name == key){
					return iroad2.data.dataElements[j].optionSet.options;
				}
			};
			return false;
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
			return object;
		}
		$scope.showOffence = function(aOffence){
			var modalInstance = $modal.open({
                templateUrl: 'views/offenceForm.html',
                controller: 'offenceFormController',
                resolve: {
                    aOffence : function () {
                        return aOffence;
                    }
                }
            });

            modalInstance.result.then(function (){
            });
		}
		$scope.showDriver = function(driver){
			$scope.show("driver");
			$scope.data.driver = driver;
			for(var key in driver.Person){
				$scope.data.driver[key] = driver.Person[key]; 
			}
			delete driver.Person;
		}
		$scope.showVehicle = function(vehicle){
			$scope.show("vehicle");
			$scope.data.vehicle = vehicle;
		}
		$scope.enableEdit  = function(event){
            $scope.show("edit");
            angular.forEach(iroad2.data.programs, function (program) {
                if (program.name == $scope.offenceEventModal.getModalName()) {
                    $scope.editingProgram = program;
                }
            });
            $scope.savableEventData = [];
            $scope.editingEvent = event;
            for (var key in event) {
            	if(Array.isArray(event[key])){
            		console.log(key + " Event:" + JSON.stringify(event));
            		$scope.multiselectBools[key] = $scope.isManyRelation(key);
            	}else if(typeof event[key] == "object") {
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
			
			var otherData = {orgUnit:"ij7JMOFbePH",status: "COMPLETED",storedBy: "admin",eventDate:$scope.editingEvent['Offence Date']};
			//var saveEvent = $scope.editingEvent;
			var relationSaveData = [];
			
			console.log("Saving this:" + JSON.stringify($scope.editingEvent));
			$scope.offenceEventModal.save($scope.editingEvent,otherData,function(result){
				console.log("Save Made Result:" + JSON.stringify(result));
				if(!result.updatedEvent){
					alert("Reached Here");
					$scope.editingEvent.id = result.importSummaries[0].reference;
				}
				for(var key in $scope.editingEvent){
					var relationships = $scope.offenceEventModal.getRelationships();
					for(var z = 0;z < relationships.length;z++) {
						var relationship = relationships[z];
						if(relationship.pivot){
							if(relationship.pivot == key){
								var pivotProgram = new iroad2.data.Modal(relationship.pivot,[]);
								var saveDataArray = [];
								angular.forEach($scope.editingEvent[key], function (relationNameValue) {
									var saveData = {};
									saveData[$scope.offenceEventModal.getModalName()] = $scope.editingEvent;
									saveData[relationship.name] = relationNameValue;
									saveDataArray.push(saveData);
					            });
								
								console.log("Saving Relation:" + JSON.stringify(saveDataArray));
								pivotProgram.save(saveDataArray,otherData,function(result){
									console.log("Relation Save Made Result:" + JSON.stringify(result));
								},function(error){
									console.log("Error Saving Relation:" + JSON.stringify(error));
								},pivotProgram.getModalName());
							}
						}
					}
				}
			},function(error){
				console.log("Error Saving:" + JSON.stringify(error));
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