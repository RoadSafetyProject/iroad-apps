'use strict';

/* Controllers */
var eventCaptureControllers = angular.module('eventCaptureControllers', ["ui.date","multi-select"]);





//Controller for settings page
eventCaptureControllers.controller('MainController',
    function($scope,$modal,$timeout,$translate,$anchorScroll,storage,Paginator,
             OptionSetService,ProgramFactory,ProgramStageFactory,DHIS2EventFactory,DHIS2EventService,
             ContextMenuSelectedItem,DateUtils,$filter,$http,CalendarService,GridColumnService,
             CustomFormService,ErrorMessageService,ModalService,DialogService) {
    	$scope.pageSize = 10;
    	$scope.pageChanged = function(page) {
    	                	$scope.fetchAccidents($scope.pageSize,page);
    	                };
    	//$scope.converts = {"Offence":{"name":"Section","button":"Nature"}};
    	$scope.feedBack = false;
        $scope.progresMessage = false;
        $scope.showFeedback = function(data){
            $scope.messagess = data;
            $scope.feedBack = true;

            $timeout( function(){
                $scope.feedBack = false;
            }, 3000);
        }
        $scope.showProgresMessage = function(data){
            $scope.progresMessagess = data;
            $scope.progresMessage = true;
        }
        $scope.hideProgresMessage = function(){
            $scope.progresMessagess = "";
            $scope.progresMessage = false;
        }
        //selected org unit
        $scope.today = DateUtils.getToday();
        $scope.panel = {vehicle:false,driver : false,offences:false,edit:false,payment:false};
        $scope.show = function(panel){
        	$scope.normalStyle= { "z-index": '10'};
        	if(panel != "offences"){
        		$scope.normalClass= "mws-panel grid_6";
        	}else{
        		$scope.normalClass= "mws-panel grid_8";
        	}
        	for(var key in $scope.panel){
        		$scope.panel[key] = false;
        	}
        	$scope.panel[panel] = true;
        }
        $scope.pager = {};
        $scope.data = {};

        //function to fetch accident accident details includes police,Driver,vehicle 
        $scope.fetchAccidents = function(page){
        	$scope.showProgresMessage("Loading Accidents...");
        	//new iroad2.data.Relation('Accident Passenger','Accident Vehicle','Police')
        	$scope.AccidentModal = new iroad2.data.Modal("Accident Vehicle",[]);
        	$scope.AccidentModal.getAll(function(result){
        		
        		$scope.pager = result.pager;
				$scope.data.accidents = result.data;
				//console.log(JSON.stringify(result.data));
				
				$scope.$apply();

				$scope.hideProgresMessage();
				
			},$scope.pageSize,page,true);
        }
        $scope.onInitialize = function(){

        	$scope.fetchAccidents(1);
        	/*
			var registries = new iroad2.data.Modal("Offence Registry",[]);
        	registries.getAll(function(result){
				$scope.data.registries = result;
				$scope.$apply();
				$scope.fetchOffences(1);
			});
        	
        	/*var registries = new iroad2.data.Modal("Offence Registry",[]);
        	registries.getAll(function(result){
				$scope.data.registries = result;
				$scope.$apply();
			});*/
        }
        dhisConfigs.onLoad = function(){
			$scope.onInitialize();
		}
		iroad2.Init(dhisConfigs);
		$scope.normalClass= "mws-panel grid_8";

		// view information of agiven accident 
		$scope.viewAccidentInfo = function(dhis2Event){
            
            //$scope.Vehicle = dhis2Event;
            $scope.AccidentData = dhis2Event.Accident;
            $scope.VehicleData = dhis2Event.Vehicle;
            $scope.DriverData = dhis2Event.Driver;
            
            var modalInstance = $modal.open({
                templateUrl: 'views/viewAccidentInfo.html',
                controller: 'AccidentController',
                resolve: {
                    AccidentData: function () {
                        return $scope.AccidentData;
                    },
                    VehicleData : function(){
                    	return  $scope.VehicleData;
                    },
                    DriverData : function(){
                    	return $scope.DriverData;
                    }
                }
            });

            modalInstance.result.then(function (){
            });
        }

        //function to add new accident
        $scope.addAccident = function(){

        	$scope.accident = new iroad2.data.Modal('Accident Vehicle',[]);
        	var modalName = $scope.accident.getModalName();
			var event = {};

			angular.forEach(iroad2.data.programs, function (program) {
                if (program.name == modalName) {
                	console.log('Porgram ' + JSON.stringify(program));
                	angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
                		if(dataElement.dataElement.name.startsWith(iroad2.config.refferencePrefix)){
                			event[dataElement.dataElement.name.replace(iroad2.config.refferencePrefix,"")] = {};
                		}else{
                			event[dataElement.dataElement.name] = "";
                		}
                       
                    });
                }
            });

			$scope.formData = event;

			console.log('\nForm ' + JSON.stringify($scope.formData));
        	var modalInstance = $modal.open({
        		templateUrl: 'views/addAccidentForm.html',
        		controller:'AddAccidentController'
        	});

        }



		$scope.addNew = function(){


			var modalName = $scope.AccidentModal.getModalName();
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
            /*
			angular.forEach($scope.AccidentModal.getRelationships(), function (relationship) {
				if(relationship.pivot){
					event[relationship.pivot] = [];
				}
			});*/

			console.log(JSON.stringify(event));
			
			//$scope.enableEdit(event);
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
			var relationships = $scope.AccidentModal.getRelationships();
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
			for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
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
			for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
				if(iroad2.data.dataElements[j].name == key){
					return (iroad2.data.dataElements[j].optionSet != undefined);
				}
			};
			return false;
		}
		$scope.getOptionSets = function(key){
			for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
				if(iroad2.data.dataElements[j].name == key){
					return iroad2.data.dataElements[j].optionSet.options;
				}
			};
			return false;
		}
		$scope.filterObject = function(object,fields){
			con:
			for(var key in object){
				for(var j = 0 ;j < fields.length;j++){
					if(fields[j] == key){
						delete object[key];
						continue con;
					}
				}
			};
			return object;
		}
		

		$scope.showDriver = function(driver){
			$scope.show("driver");
			$scope.data.driver = driver;

			console.log(JSON.stringify($scope.data.driver));
			
			for(var key in driver.Person){
				$scope.data.driver[key] = driver.Person[key]; 
			}
			delete driver.Person;
		}
		//function to show vichicle involved
		$scope.showVehicle = function(vehicle){
			$scope.show("vehicle");
			$scope.data.vehicle = vehicle;

			console.log(JSON.stringify($scope.data.vehicle));
		}

		$scope.enableEdit  = function(e){
			if(iroad2.data.user.organisationUnits.length == 0){
				alert("You cannot perform this action. You are not assigned an organisation unit.");
				return;
			}
            $scope.show("edit");
            angular.forEach(iroad2.data.programs, function (program) {
                if (program.name == $scope.AccidentModal.getModalName()) {
                    $scope.editingProgram = program;
                }
            });
            $scope.savableEventData = [];
            var event = e;
            $scope.editingEvent = event;
            for (var key in event) {
            	if(Array.isArray(event[key])){
            		$scope.multiselectBools[key] = $scope.isManyRelation(key);
            	}else if(typeof event[key] == "object") {
            		var program = $scope.AccidentModal.getProgramByName(key);
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
            $scope.editInputModal = [];
            angular.forEach($scope.data.registries, function (registry) {
            	registry.selected = false;
            	angular.forEach($scope.editingEvent.Offence, function (off) {
            		if(off.Offence_Registry.id == registry.id){
            			registry.selected = true;
            		}
                });
            	$scope.editInputModal.push(registry);
            	console.log(key + " Registries:" + JSON.stringify($scope.editInputModal));
            });
            /*var out = {};
            var program = $scope.offenceEventModal.getProgramByName($scope.offenceEventModal.getModalName());
            console.log("Event:" + JSON.stringify(event));
    		angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
    			
    			if(event[dataElement.dataElement.name]){
    				
    				if(Array.isArray(event[dataElement.dataElement.name])){
                		$scope.multiselectBools[key] = $scope.isManyRelation(key);
                		out[dataElement.dataElement.name] = event[dataElement.dataElement.name]
                	}else if(typeof event[dataElement.dataElement.name] == "object") {
                		alert("here1");
                		var program2 = $scope.offenceEventModal.getProgramByName(dataElement.dataElement.name);
                		angular.forEach(program2.programStages[0].programStageDataElements, function (dataElement2) {
                            if (dataElement2.dataElement.code) {
                            	if(dataElement2.dataElement.code.startsWith("id_")){
                            		alert("here");
                    				out[dataElement2.dataElement.name] = event[dataElement.dataElement.name][dataElement2.dataElement.name];
                    				$scope.savableEventData.push({"name":dataElement2.dataElement.name,"key":key,"value":event[dataElement.dataElement.name]});
                    				$scope.watchEditing(program2,dataElement2.dataElement);
                    				//delete $scope.editingEvent[key];
                    			}
                            }
                        });
                	}else{
                		out[dataElement.dataElement.name] = event[dataElement.dataElement.name];
                	}
    			}else{
    				if(dataElement.dataElement.name.startsWith("Program_")){
    					var program2 = $scope.offenceEventModal.getProgramByName(dataElement.dataElement.name.replace("Program_",""));
                		angular.forEach(program2.programStages[0].programStageDataElements, function (dataElement2) {
                            if (dataElement2.dataElement.code) {
                            	if(dataElement2.dataElement.code.startsWith("id_")){
                    				out[dataElement2.dataElement.name] = "";
                    				$scope.savableEventData.push({"name":dataElement2.dataElement.name,"key":key,"value":event[dataElement.dataElement.name]});
                    				$scope.watchEditing(program2,dataElement2.dataElement);
                    				//delete $scope.editingEvent[key];
                    			}
                            }
                        });
    				}
    			}
            });*/
    		
    		//$scope.editingEvent = out;
    		
        }
		$scope.data.editingOutputModal = [];
		$scope.save = function(){
			console.log("JSON Before:" + JSON.stringify($scope.editingEvent));
			var canSave = true;
			angular.forEach($scope.savableEventData, function (savableData) {
				if(savableData.value == null){
					alert("The "+savableData.name+" does not exist.");
					canSave = false;
				}
				
            });
			if(canSave){
				angular.forEach($scope.savableEventData, function (savableData) {
					delete $scope.editingEvent[savableData.name];
		            $scope.editingEvent[savableData.key] = savableData.value;
	            });
			}else{
				return;
			}
			$scope.editingEvent["Full Name"] = $scope.editingEvent.Driver["Full Name"];
			$scope.editingEvent["Driver License Number"] = $scope.editingEvent.Driver["Driver License Number"];
			$scope.editingEvent["Gender"] = $scope.editingEvent.Driver["Gender"];
			$scope.editingEvent["Date of Birth"] = $scope.editingEvent.Driver["Date of Birth"];
			
			$scope.editingEvent["Vehicle Plate Number"] = $scope.editingEvent.Vehicle["Vehicle Plate Number"];
			$scope.editingEvent["Vehicle Owner Name"] = $scope.editingEvent.Vehicle["Vehicle Owner Name"];
			$scope.editingEvent["Model"] = $scope.editingEvent.Vehicle["Model"];
			$scope.editingEvent["Make"] = $scope.editingEvent.Vehicle["Make"];
			$scope.editingEvent["Vehicle Class"] = $scope.editingEvent.Vehicle["Vehicle Class"];
			$scope.editingEvent["Vehicle Ownership Category"] = $scope.editingEvent.Vehicle["Vehicle Ownership Category"];
			
			
			console.log("JSON After:" + JSON.stringify($scope.editingEvent));
			var otherData = {orgUnit:iroad2.data.user.organisationUnits[0].id,status: "COMPLETED",storedBy: "admin",eventDate:$scope.editingEvent['Offence Date']};
			//var saveEvent = $scope.editingEvent;
			var relationSaveData = [];
			console.log($scope.editingEvent);
			$scope.AccidentModal.save($scope.editingEvent,otherData,function(result){
				$scope.data.offences.push($scope.editingEvent);
				$scope.$apply();
				console.log("Save Made Result:" + JSON.stringify(result));
				if(!result.updatedEvent){
					$scope.editingEvent.id = result.importSummaries[0].reference;
				}
				var saveDataArray = [];
				console.log("$scope.editingOutputModal:"+JSON.stringify($scope.data.editingOutputModal));
				angular.forEach($scope.data.editingOutputModal,function(registry){
					var off = {
							"Offence_Event":{"id": $scope.editingEvent.id},
							"Offence_Registry":{"id":registry.id}
						};
					console.log("Saving Offence Off:"+JSON.stringify(off));
					saveDataArray.push(off);
					console.log("Saving Offence:"+JSON.stringify(saveDataArray));
				});
				//console.log("Saving Offence:"+JSON.stringify(saveDataArray));
				var offence = new iroad2.data.Modal("Offence",[]);
				offence.save(saveDataArray,otherData,function(result){
					$scope.offences.push($scope.editingEvent);
					$scope.$apply();
					console.log("Relation Save Made Result:" + JSON.stringify(result));
				},function(error){
					console.log("Error Saving Relation:" + JSON.stringify(error));
				},offence.getModalName());
			},function(error){
				console.log("Error Saving:" + JSON.stringify(error));
			},$scope.AccidentModal.getModalName());
			$scope.cancelEdit();
        }
		$scope.cancelEdit = function(){
			
            $scope.show("");
            $scope.normalClass= "mws-panel grid_8";
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



