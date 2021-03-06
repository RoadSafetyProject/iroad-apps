'use strict';

/* Controllers */
var eventCaptureControllers = angular.module('eventCaptureControllers', ["ui.date","multi-select","ui.bootstrap",'ui.bootstrap.datetimepicker'])
/*.directive('iroadInput', function () {
    return {
        template: 'Name:'
    };
})*/

//Controller for settings page
    .controller('MainController',
    function($scope,$modal,$timeout,$translate,$anchorScroll,storage,Paginator,
             OptionSetService,ProgramFactory,ProgramStageFactory,DHIS2EventFactory,DHIS2EventService,
             ContextMenuSelectedItem,DateUtils) {
    	$scope.pageSize = 10;
    	$scope.pageChanged = function(page) {
    	                	$scope.fetchOffences(page);
    	                };
    	                $scope.dateOptions = {
    	                	    startingDay: 1,
    	                	    showWeeks: false
    	                	  };
    	$scope.converts = {"Offence":{"name":"Section","button":"Nature"}};
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
        $scope.boundaryLinks  = true;
        $scope.directionLinks = true;
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
        $scope.applyFunctions = function(){
        	iroad
        }
        $scope.fetchOffences = function(page){
        	
        	$scope.showProgresMessage("Loading Offences...");
        	$scope.offenceEventModal = new iroad2.data.Modal("Offence Event",[new iroad2.data.Relation("Offence Registry","Offence")]);
        	$scope.offenceEventModal.getAll(function(result){
        		
        		$scope.hideProgresMessage();
        		$scope.pager = result.pager;
				$scope.data.offences = result.data;
				$scope.$apply();
				console.clear();
				console.log(JSON.stringify($scope.pager));
			},$scope.pageSize,page,true);
        }
        $scope.onInitialize = function(){
        	/*$scope.offenceEventModal = new iroad2.data.Modal("Offence Event",[new iroad2.data.Relation("Offence Registry","Offence")]);
        	$scope.offenceEventModal.getAll(function(result){
        		$scope.pager = result.pager;
				$scope.data.offences = result.data;
				$scope.$apply();
				
			},$scope.pageSize,1,true);*/
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
			$scope.editOffenceTitle = "Add New Offence";
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
			$scope.data.payment['Offence Paid'] = true;
			//alert("Payment made successfully.")
			$scope.show("offences");
			if($scope.data.payment['Offence Reciept Amount'] != "" && $scope.data.payment['Offence Reciept Reciept'] != ""){
				$scope.data.payment['Offence Paid'] = true;
				var otherData = {orgUnit:iroad2.data.user.organisationUnits[0].id,status: "COMPLETED",storedBy: "admin",eventDate:$scope.data.payment['Offence Date']};
				$scope.offenceEventModal.save($scope.data.payment,otherData,function(result){
	        		
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

		$scope.setDescription = function(key){
			for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
				if(iroad2.data.dataElements[j].name == key){
					if(iroad2.data.dataElements[j].description){
						return iroad2.data.dataElements[j].description;
					}
				}
			}
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
		$scope.getOffences = function(offences){
			return offences;
		}
		$scope.showOffence = function(aOffence){
			$scope.offence = aOffence;
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
		$scope.editOffenceTitle = "";
		$scope.enableEdit  = function(e){
			$scope.editOffenceTitle = "Edit Offence";
			if(iroad2.data.user.organisationUnits.length == 0){
				alert("You cannot perform this action. You are not assigned an organisation unit.");
				return;
			}
            $scope.show("edit");
            angular.forEach(iroad2.data.programs, function (program) {
                if (program.name == $scope.offenceEventModal.getModalName()) {
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
            		var program = $scope.offenceEventModal.getProgramByName(key);
            		if(program != undefined)
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
		$scope.$watch("data.editingOutputModal",function(){
			if($scope.editingEvent){
				$scope.editingEvent['Offence Reciept Amount'] = 0;
				angular.forEach($scope.data.editingOutputModal,function(offence){
					$scope.editingEvent['Offence Reciept Amount'] += parseInt(offence.Amount);
				});
			}
			
		});
		$scope.save = function(){
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
			/*console.log("JSON After:" + JSON.stringify($scope.editingEvent));
			
			
			
			*/
			if(!$scope.editingEvent.id){
				$scope.editingEvent["Full Name"] = $scope.editingEvent.Driver["Full Name"];
				$scope.editingEvent["Driver License Number"] = $scope.editingEvent.Driver["Driver License Number"];
				$scope.editingEvent["Gender"] = $scope.editingEvent.Driver["Gender"];
				$scope.editingEvent["Date of Birth"] = $scope.editingEvent.Driver["Date of Birth"];
				
				$scope.editingEvent["Vehicle Plate Number/Registration Number"] = $scope.editingEvent.Vehicle["Vehicle Plate Number/Registration Number"];
				$scope.editingEvent["Vehicle Owner Name"] = $scope.editingEvent.Vehicle["Vehicle Owner Name"];
				$scope.editingEvent["Model"] = $scope.editingEvent.Vehicle["Model"];
				$scope.editingEvent["Make"] = $scope.editingEvent.Vehicle["Make"];
				$scope.editingEvent["Vehicle Class"] = $scope.editingEvent.Vehicle["Vehicle Class"];
				$scope.editingEvent["Vehicle Ownership Category"] = $scope.editingEvent.Vehicle["Vehicle Ownership Category"];
			}
			var otherData = {orgUnit:iroad2.data.user.organisationUnits[0].id,status: "COMPLETED",storedBy: "admin",eventDate:$scope.editingEvent['Offence Date']};
			if($scope.editingEvent.coordinate){
				otherData.coordinate =$scope.editingEvent.coordinate; 
			}else{
				otherData.coordinate = {"latitude": "","longitude": ""};
			}
			//var saveEvent = $scope.editingEvent;
			var relationSaveData = [];
			$scope.offenceEventModal.save($scope.editingEvent,otherData,function(result){
				//alert("here");
				//console.log(JSON.stringify(result));
				if(!result.httpStatus){
					$scope.editingEvent.id = result.importSummaries[0].reference;
					$scope.data.offences.push($scope.editingEvent);
					$scope.$apply();
					if(!result.updatedEvent){
						$scope.editingEvent.id = result.importSummaries[0].reference;
					}
					var saveDataArray = [];
					angular.forEach($scope.data.editingOutputModal,function(registry){
						var off = {
								"Offence_Event":{"id": $scope.editingEvent.id},
								"Offence_Registry":{"id":registry.id}
							};
						saveDataArray.push(off);
					});
					//console.log("Saving Offence:"+JSON.stringify(saveDataArray));
					var offence = new iroad2.data.Modal("Offence",[]);
					offence.save(saveDataArray,otherData,function(result){
						$scope.offences.push($scope.editingEvent);
						$scope.$apply();
					},function(error){
					},offence.getModalName());
				}else{
					
				}
				
			},function(error){
				console.log("Error Saving:" + JSON.stringify(error));
			},$scope.offenceEventModal.getModalName());
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
