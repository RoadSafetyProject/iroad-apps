/**
 * Created by kelvin on 4/24/15.
 */
'use strict';

/* Controllers */
var eventCaptureControllers = angular.module('eventCaptureControllers', [])

//Controller for settings page
    .controller('MainController',
    function($scope,
             $modal,
             $timeout,
             $translate,
             $anchorScroll,
             storage,
             Paginator,
             OptionSetService,
             ProgramFactory,
             ProgramStageFactory,
             DHIS2EventFactory,
             DHIS2EventService,
             ContextMenuSelectedItem,
             DateUtils,
             $filter,
             $http,
             CalendarService,
             GridColumnService,
             CustomFormService,
             ErrorMessageService,
             ModalService,
             DialogService) {
        //selected org unit
        $scope.today = DateUtils.getToday();
        $scope.data = {};
        $scope.onInitialize = function(){
        	$scope.modal = new iroad2.data.Modal("Offence Event",[]);
        	$scope.modal.getAll(function(result){
				$scope.data.offences = result;
				$scope.$apply();
			});
        	var driver = new  iroad2.data.Modal("Driver",[]);
        	driver.getAll(function(result){
        		console.log("Divers:" + JSON.stringify(result));
				$scope.data.drivers = result;
				$scope.$apply();
			});
        	var vehicle = new  iroad2.data.Modal("Vehicle",[]);
        	vehicle.getAll(function(result){
        		console.log("Vehicles:" + JSON.stringify(result));
				$scope.data.drivers = result;
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
                	console.log("Program:" + JSON.stringify(program));
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
		$scope.hasOptionSet = function(dataElementName){
			var event = {};
			angular.forEach(iroad2.data.dataElements, function (dataElement) {
                if (dataElement.dataElement.name == modalName) {
                	console.log("Program:" + JSON.stringify(program));
                	angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
                       event[dataElement.dataElement.name] = "";
                    });
                }
            });
			$scope.enableEdit(event);
		}
		$scope.enableEdit  = function(event){
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "mws-panel grid_6";
            $scope.editing = "true";
            //console.log(JSON.stringify(iroad2.data.programs));
            angular.forEach(iroad2.data.programs, function (program) {
                if (program.name == $scope.modal.getModalName()) {
                    $scope.editingProgram = program;
                }
            });
            $scope.savableEventData = [];
            $scope.editingEvent = event;
            for (var key in event) {
            	if (typeof event[key] == "object") {
            		var program = $scope.modal.getProgramByName(key);
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
			console.log("Saving data:" + JSON.stringify($scope.editingEvent));
			var otherData = {orgUnit:"ij7JMOFbePH",status: "COMPLETED",storedBy: "admin",eventDate:$scope.editingEvent['Offence Date']};
			$scope.modal.save($scope.editingEvent,otherData,function(result){
				console.log("Save Made:" + JSON.stringify(result));
			});
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
		        					console.log("See if changes:" + JSON.stringify($scope.savableEventData));
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