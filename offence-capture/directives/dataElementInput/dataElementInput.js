angular.module('eventCapture').directive('elementInput', function ($modal,$http,$q) {
	
	var controller = ['$scope',function ($scope) {
        function init() {
            $scope.items = angular.copy($scope.datasource);
        }

        init();
        $scope.data = {
        		
        }
        model = new iroad2.data.Modal();
        $scope.dataElement = model.getDataElementByName($scope.ngDataElementName);
        $scope.functions = null;
        $scope.response = {status:"",message:"Does Not Exist"};
        angular.forEach($scope.dataElement.attributeValues,function(attributeValue){
        	
        	if(attributeValue.attribute.name == "Function"){
        		$scope.functions = eval("(" + attributeValue.value+ ')');
        	}
        })
        //Code for drivers license
        /*$scope.functions = {
        	init:function(){
        		$scope.defaultPhotoID = "";
        		$http.get('../../../api/documents.json?filter=name:eq:Default Driver Photo').
				success(function(data) {
					if(data.documents.length != 0){
						$scope.defaultPhotoID = data.documents[0].id;
						console.log($scope.defaultPhotoID);
					}
				}).
				error(function(data) {
					onError("Error uploading file.");
				});
        	},
        	pattern:"^[0-9]{10}$",
        	search:function(searchValue){
        		if($scope.crudOperation == 'create'){
        			return;
        		}
        		var deffered = $q.defer();
        		var driverEventModal = new iroad2.data.Modal("Driver",[]);
        		driverEventModal.getAll(function(result){
        			
        			var data = [];
        			angular.forEach(result.data,function(driver){
        				if(driver["Driver License Number"].indexOf(searchValue) != -1)
        				{
        					data.push({name:driver["Driver License Number"]});
        				}
        			});
        			deffered.resolve(data);
            		$scope.$apply();
        			
        		},50,1,true);
        		return deffered.promise;
        	},
        	setValidation:function(areThereResults){
        		if(areThereResults){
    				if($scope.crudOperation == 'create'){
    					$scope.response.status = "ERROR";
    					$scope.response.message = "The license number has already been used.";
    				}else if($scope.crudOperation == 'update'){
    					$scope.response.status = "SUCCESS";
    					$scope.response.message = "The license is valid.";
    				}
    			}else{
    				if($scope.crudOperation == 'create'){
    					$scope.response.status = "SUCCESS";
    					$scope.response.message = "The license number can be used.";
    				}else if($scope.crudOperation == 'update'){
    					$scope.response.status = "ERROR";
    					$scope.response.message = "The license is not valid.";
    				}
    			}
        	},
        	onSearchSelect:function(){
        		this.setValidation(true);
        	},
        	valid:function(){
        		console.log(JSON.stringify(value));
        		return false;
        	},
        	checkIfDriverExists:function(input,response){
        		var dataElement = this;
        		if(input == "" || !input){
                	response.status = "ERROR";
                    response.message = "The license is not valid.";
                	return;
                }
        		response.status = "LOADING";
        		var driverEventModal = new iroad2.data.Modal("Driver",[]);
        		driverEventModal.get(new iroad2.data.SearchCriteria("Driver License Number","=",input),function(result){
        			dataElement.setValidation(result.length > 0);
        			$scope.$apply();
        		},function(error){console.log(error)})
        	},
        	showDriverInfo:function(input,response){
        		var modalInstance = null;
        		driverEventModal = new iroad2.data.Modal("Driver",[]);
        		driverEventModal.get(new iroad2.data.SearchCriteria("Driver License Number","=",input),function(result){
        			if(result.length > 0 && modalInstance == null){
        				var driver = driverEventModal.convertToEvent("Driver",result[0],{});
        				var dataValues = {};
        				angular.forEach(driver.dataValues,function(dataValue){
        					if(dataValue.dataElement){
        						angular.forEach(iroad2.data.dataElements,function(dataElement){
            						if(dataElement.id == dataValue.dataElement){
            							dataValues[dataElement.name] = {value:dataValue.value};
            						}
            						
            					});
        					}
        				});
        				driver.dataValues = dataValues;
        				modalInstance = $modal.open({
                            templateUrl: '../drivers-capture/views/showDriverInfo.html',
                            controller: 'ShowDriverInfoController',

                            resolve: {
                                
                                events: function () {
                                    return driver;
                                },
                                defaultPhotoID: function () {
                                    return $scope.defaultPhotoID;
                                }
                            }
                                            
                        });

                        modalInstance.result.then(function (){
                        });
        			}
        			$scope.$apply();
        		})
             },
        	showDriverAccidents:function(input,response){
        		var modalInstance = null;
        		driverEventModal = new iroad2.data.Modal("Driver",[]);
        		driverEventModal.get(new iroad2.data.SearchCriteria("Driver License Number","=",input),function(result){
        			if(result.length > 0 && modalInstance == null){
        				var driver = driverEventModal.convertToEvent("Driver",result[0],{});
        				var dataValues = {};
        				angular.forEach(driver.dataValues,function(dataValue){
        					if(dataValue.dataElement){
        						angular.forEach(iroad2.data.dataElements,function(dataElement){
            						if(dataElement.id == dataValue.dataElement){
            							dataValues[dataElement.name] = {value:dataValue.value};
            						}
            						
            					});
        					}
        				});
        				driver.dataValues = dataValues;
        				modalInstance = $modal.open({
        	                templateUrl: '../drivers-capture/views/accidents.html',
        	                controller: 'DriverAccidentController',
        	                resolve: {
        	                    dhis2Event: function () {
        	                        return driver;
        	                    },
        	                    events: function () {
        	                        return driver;
        	                    }
        	                }
        	            });

        	            modalInstance.result.then(function (){
        	            });
        			}
        			$scope.$apply();
        		})
             },
        	showDriverOffences:function(input,response){
        		var modalInstance = null;
        		driverEventModal = new iroad2.data.Modal("Driver",[]);
        		driverEventModal.get(new iroad2.data.SearchCriteria("Driver License Number","=",input),function(result){
        			if(result.length > 0 && modalInstance == null){
        				var driver = driverEventModal.convertToEvent("Driver",result[0],{});
        				var dataValues = {};
        				angular.forEach(driver.dataValues,function(dataValue){
        					if(dataValue.dataElement){
        						angular.forEach(iroad2.data.dataElements,function(dataElement){
            						if(dataElement.id == dataValue.dataElement){
            							dataValues[dataElement.name] = {value:dataValue.value};
            						}
            						
            					});
        					}
        				});
        				driver.dataValues = dataValues;
        				modalInstance = $modal.open({
        	                templateUrl: '../drivers-capture/views/offences.html',
        	                controller: 'DriverOffenceController',
        	                resolve: {
        	                    dhis2Event: function () {
        	                        return driver;
        	                    },
        	                    events: function () {
        	                        return driver;
        	                    }
        	                }
        	            });

        	            modalInstance.result.then(function (){
        	            });

        	            modalInstance.result.then(function (){
        	            });
        			}
        			$scope.$apply();
        		})
             },
        	actions:[{name:"Driver Exists",functionName:"checkIfDriverExists"},{name:"View Driver Details",functionName:"showDriverInfo"},{name:"View Driver Accidents",functionName:"showDriverAccidents"},{name:"View Driver Accidents",functionName:"showDriverOffences"}],
        	events:{onBlur:"checkIfDriverExists"}
        }*/
        //Code for Vehicle registration
        	/*$scope.functions = {
                	init:function(){
                		
                	},
                	pattern:"^T[0-9]{3} [A-Z]{3}$",
                	search:function(searchValue){
		        		if($scope.crudOperation == 'create'){
		        			return;
		        		}
		        		var deffered = $q.defer();
		        		var driverEventModal = new iroad2.data.Modal("Vehicle",[]);
		        		driverEventModal.getAll(function(result){
		        			
		        			var data = [];
		        			console.log(result.data.length);
		        			angular.forEach(result.data,function(driver){
		        				if(driver["Vehicle Plate Number/Registration Number"].indexOf(searchValue) != -1)
		        				{
		        					data.push({name:driver["Vehicle Plate Number/Registration Number"]});
		        				}
		        			});
		        			//console.clear()
		        			console.log(JSON.stringify(data));
		        			deffered.resolve(data);
		            		$scope.$apply();
		        			
		        		},50,1,true);
		        		return deffered.promise;
		        	},
		        	setValidation:function(areThereResults){
		        		if(areThereResults){
            				if($scope.crudOperation == 'create'){
            					$scope.response.status = "ERROR";
            					$scope.response.message = "The Vehicle Registration Number has already been used.";
            				}else if($scope.crudOperation == 'update'){
            					$scope.response.status = "SUCCESS";
            					$scope.response.message = "The Vehicle Registration Number is valid.";
            				}
            			}else{
            				if($scope.crudOperation == 'create'){
            					$scope.response.status = "SUCCESS";
            					$scope.response.message = "The Vehicle Registration Number can be used.";
            				}else if($scope.crudOperation == 'update'){
            					$scope.response.status = "ERROR";
            					$scope.response.message = "The Vehicle Registration Number is not valid.";
            				}
            			}
		        	},
		        	onSearchSelect:function(){
		        		this.setValidation(true);
		        	},
		        	valid:function(){
		        		console.log(JSON.stringify(value));
		        		return false;
		        	},
                	checkIfVehicleExists:function(input,response){
                		var dataElementInput = this;
                		if(input == "" || !input){
                			response.status = "ERROR";
                    		response.message = "The Vehicle Registration Number is not valid.";
                			return;
                		}
                		response.status = "LOADING";
                		var vehicleEventModal = new iroad2.data.Modal("Vehicle",[]);
                		vehicleEventModal.get(new iroad2.data.SearchCriteria("Vehicle Plate Number/Registration Number","=",input),function(result){
                			dataElementInput.setValidation(result.length > 0);
                			$scope.$apply();
                		},function(error){console.log(error)})
                	},
                	showVehicleInfo:function(input,response){
                		var modalInstance = null;
                		var vehicleEventModal = new iroad2.data.Modal("Vehicle",[]);
                		vehicleEventModal.get(new iroad2.data.SearchCriteria("Vehicle Plate Number/Registration Number","=",input),function(result){
                			if(result.length > 0 && modalInstance == null){
                				var vehicel = vehicleEventModal.convertToEvent("Vehicle",result[0],{});
                				var dataValues = {};
                				angular.forEach(vehicle.dataValues,function(dataValue){
                					if(dataValue.dataElement){
                						angular.forEach(iroad2.data.dataElements,function(dataElement){
                    						if(dataElement.id == dataValue.dataElement){
                    							dataValues[dataElement.name] = {value:dataValue.value};
                    						}
                    						
                    					});
                					}
                				});
                				vehicle.dataValues = dataValues;
                				modalInstance = $modal.open({
                                    templateUrl: '../drivers-capture/views/showDriverInfo.html',
                                    controller: 'ShowDriverInfoController',

                                    resolve: {
                                        
                                        events: function () {
                                            return vehicle;
                                        },
                                        defaultPhotoID: function () {
                                            return $scope.defaultPhotoID;
                                        }
                                    }
                                                    
                                });

                                modalInstance.result.then(function (){
                                });
                			}
                			$scope.$apply();
                		})
                     },
                	showVehicleAccidents:function(input,response){
                		var modalInstance = null;
                		var vehicleEventModal = new iroad2.data.Modal("Vehicle",[]);
                		vehicleEventModal.get(new iroad2.data.SearchCriteria("Vehicle Registration/Plate Number","=",input),function(result){
                			if(result.length > 0 && modalInstance == null){
                				var vehicle = vehicleEventModal.convertToEvent("Vehicle",result[0],{});
                				var dataValues = {};
                				angular.forEach(vehicle.dataValues,function(dataValue){
                					if(dataValue.dataElement){
                						angular.forEach(iroad2.data.dataElements,function(dataElement){
                    						if(dataElement.id == dataValue.dataElement){
                    							dataValues[dataElement.name] = {value:dataValue.value};
                    						}
                    						
                    					});
                					}
                				});
                				vehicle.dataValues = dataValues;
                				modalInstance = $modal.open({
                	                templateUrl: '../drivers-capture/views/accidents.html',
                	                controller: 'DriverAccidentController',
                	                resolve: {
                	                    dhis2Event: function () {
                	                        return vehicle;
                	                    },
                	                    events: function () {
                	                        return vehicle;
                	                    }
                	                }
                	            });

                	            modalInstance.result.then(function (){
                	            });
                			}
                			$scope.$apply();
                		})
                     },
                	showVehicleOffences:function(input,response){
                		var modalInstance = null;
                		var vehicleEventModal = new iroad2.data.Modal("Vehicle",[]);
                		vehicleEventModal.get(new iroad2.data.SearchCriteria("Vehicle Registration/Plate Number","=",input),function(result){
                			if(result.length > 0 && modalInstance == null){
                				var vehicle = vehicleEventModal.convertToEvent("Vehicle",result[0],{});
                				var dataValues = {};
                				angular.forEach(vehicle.dataValues,function(dataValue){
                					if(dataValue.dataElement){
                						angular.forEach(iroad2.data.dataElements,function(dataElement){
                    						if(dataElement.id == dataValue.dataElement){
                    							dataValues[dataElement.name] = {value:dataValue.value};
                    						}
                    						
                    					});
                					}
                				});
                				vehicle.dataValues = dataValues;
                				modalInstance = $modal.open({
                	                templateUrl: '../drivers-capture/views/offences.html',
                	                controller: 'DriverOffenceController',
                	                resolve: {
                	                    dhis2Event: function () {
                	                        return vehicle;
                	                    },
                	                    events: function () {
                	                        return vehicle;
                	                    }
                	                }
                	            });

                	            modalInstance.result.then(function (){
                	            });

                	            modalInstance.result.then(function (){
                	            });
                			}
                			$scope.$apply();
                		})
                     },
                	actions:[{name:"Vehicle Exists",functionName:"checkIfVehicleExists"},{name:"View Vehicle Details",functionName:"showVehicleInfo"},{name:"View Vehicle Accidents",functionName:"showVehicleAccidents"},{name:"View Vehicle Accidents",functionName:"showVehicleOffences"}],
                	events:{onBlur:"checkIfVehicleExists"}
                }
        */
        /*if($scope.functions == null){
        	//Code for Payment
        	$scope.functions = {
                	init:function(){
                		
                	},
                	search:function(searchValue){
		        		if($scope.crudOperation == 'create'){
		        			return;
		        		}
		        		var deffered = $q.defer();
		        		var driverEventModal = new iroad2.data.Modal("Payment Reciept",[]);
		        		driverEventModal.getAll(function(result){
		        			
		        			var data = [];
		        			console.log(result.data.length);
		        			angular.forEach(result.data,function(driver){
		        				if(driver["Reciept Number"].indexOf(searchValue) != -1)
		        				{
		        					data.push({name:driver["Reciept Number"]});
		        				}
		        			});
		        			//console.clear()
		        			console.log(JSON.stringify(data));
		        			deffered.resolve(data);
		            		$scope.$apply();
		        			
		        		},50,1,true);
		        		return deffered.promise;
		        	},
		        	setValidation:function(areThereResults){
		        		if(areThereResults){
                				if($scope.crudOperation == 'create'){
                					$scope.response.status = "ERROR";
                    				$scope.response.message = "The Reciept Number is not valid.";
                				}else if($scope.crudOperation == 'update'){
                					$scope.response.status = "SUCCESS";
                    				$scope.response.message = "The Recipt Number is valid.";
                				}
                			}else{
                				if($scope.crudOperation == 'create'){
                					$scope.response.status = "SUCCESS";
                    				$scope.response.message = "The Reciept Number can be used.";
                				}else if($scope.crudOperation == 'update'){
                					$scope.response.status = "ERROR";
                    				$scope.response.message = "The Reciept Number is not valid.";
                				}
                			}
		        	},
		        	onSearchSelect:function(){
		        		this.setValidation(true);
		        	},
		        	valid:function(){
		        		console.log(JSON.stringify(value));
		        		return false;
		        	},
                	checkIfPaymentExists:function(input,response){
                		var dataElementInput = this;
                		response.status = "LOADING";
                		var vehicleEventModal = new iroad2.data.Modal("Payment Reciept",[]);
                		vehicleEventModal.get(new iroad2.data.SearchCriteria("Reciept Number","=",input),function(result){
                			dataElementInput.setValidation(result.length > 0);
                			$scope.$apply();
                		},function(error){console.log(error)})
                	},
                	viewPayment:function(input,response){
                		response.status = "LOADING";
                		var vehicleEventModal = new iroad2.data.Modal("Payment Reciept",[]);
                		vehicleEventModal.get(new iroad2.data.SearchCriteria("Reciept Number","=",input),function(result){
                			
                			if(result.length > 0){
                				
                				$scope.data.payment = result[0];
                				$scope.showModal("Payment");
                				if($scope.crudOperation == 'create'){
                					response.status = "ERROR";
                    				response.message = "The Reciept Number is not valid.";
                				}else if($scope.crudOperation == 'update'){
                					response.status = "SUCCESS";
                    				response.message = "The Recipt Number is valid.";
                				}
                			}else{
                				if($scope.crudOperation == 'create'){
                					response.status = "SUCCESS";
                    				response.message = "The Reciept Number can be used.";
                				}else if($scope.crudOperation == 'update'){
                					response.status = "ERROR";
                    				response.message = "The Reciept Number is not valid.";
                				}
                			}
                			$scope.$apply();
                		},function(error){console.log(error)})
                	},
                	actions:[{name:"Verify Reciept",functionName:"checkIfPaymentExists"},{name:"Veiw Reciept",functionName:"viewPayment"}],
                	events:{onBlur:"checkIfVehicleExists"}
                }
        }*/
        $scope.envoke = function(functionName){
        	$scope.functions[functionName]($scope.ngModel,$scope.response);
        }
        $scope.onBlur = function(){
        	if($scope.functions.events.onBlur){
        		$scope.functions[$scope.functions.events.onBlur]($scope.ngModel,$scope.response);
        	}
        }
        $scope.functions.init();
        $scope.dataName = "";
        $scope.dataTitle = "";
        $scope.showModal = function(dataName){
        	$('#dataInputModal').modal('show');
        	$scope.dataName = dataName.toLowerCase();
            $scope.dataTitle = dataName;
        }
    }];
    return {
        restrict: 'AEC',
        require: '^form',
        scope: {
            //actions:actions,
            ngModel: '=',
            crudOperation: '=',
            ngDataElementName:'='
        },
        controller: controller,
        templateUrl: '../offence-capture/directives/dataElementInput/dataElementInput.html'
    };
});