//Controller for notes
eventCaptureControllers.controller('AccidentController',
	function($scope){

		//taking data to the pop up view for viewing info for a given accident
		$scope.AccidentData = angular.element("#offenceScope").scope().AccidentData;
		$scope.accident_id = $scope.AccidentData['id'];

		//message during loading data
		$scope.loadAccidentVihecles = true;
		$scope.loadAccidentWitnesses = true;
		$scope.loadAccidentPasssenger = true;


		$scope.accidentVehicleEventModal = new iroad2.data.Modal('Accident Vehicle',[]);

		//fetching accident vehicle based on accident id
		$scope.accidentVehicleEventModal.get({value:$scope.accident_id},function(result){
			console.log('Loading vehicles');
			$scope.accidentVehicles = result;
			console.log('data vehicle '  +JSON.stringify(result));

			var passangerVisibity = [];
			//loop through all vehicles to have passenger visibility
			for(var i = 0; i < result.length; i ++){
				passangerVisibity.push(
					{
						'vehicle': i,
						'visibility' : false
					}
				);
			}
			$scope.accidentPasengerVisibility = passangerVisibity;
			passangerVisibity = [];
			$scope.loadAccidentVihecles = false;
			$scope.$apply();
		});

		//fetching accident witness
		$scope.accidentWitnessEventModel = new iroad2.data.Modal('Accident Witness',[]);

		$scope.accidentWitnessEventModel.get(new iroad2.data.SearchCriteria('Program_Accident',"=",$scope.accident_id),function(results){
			console.log('Loading witness');
			$scope.accidentWitnesses = results;
			$scope.loadAccidentWitnesses = false;
			console.log('data witness '  +JSON.stringify(results));
			$scope.$apply();

		});

		//fetching accident passengers
		$scope.accidentPassengersEvent = new iroad2.data.Modal('Accident Passenger',[]);

		$scope.accidentPassengersEvent.get(new iroad2.data.SearchCriteria('Program_Accident',"=",$scope.accident_id),function(results){
			console.log('Loading accidentPassengers');
			$scope.accidentPassengers = results;
			$scope.loadAccidentPasssenger = false;
			console.log('data passenger '  +JSON.stringify(results));
			$scope.$apply();

		});

		//function to hide or show passengers
		$scope.showHideAccidentPassengers = function(vehicle){
			for(var i = 0; i < $scope.accidentPasengerVisibility.length;i++ ){
				if( $scope.accidentPasengerVisibility[i].vehicle == vehicle){
					$scope.accidentPasengerVisibility[i].visibility = !$scope.accidentPasengerVisibility[i].visibility;
				}
			}

		}
	});


//controller for edit accident information
eventCaptureControllers.controller('EditAccidentController',function($scope,$http){

	//prepare form for editing
	$scope.editAccidentForm = angular.element("#offenceScope").scope().formAccident;
	$scope.editAccidentWitness  = angular.element("#offenceScope").scope().formAccidentWitness;
	$scope.editAccidentVehicleForm = angular.element("#offenceScope").scope().formAccidentVehicle;
	$scope.editAccidentVehiclePassengerForm = angular.element("#offenceScope").scope().formAccidentVehiclePassenger;

	//controller for messages during update process
	$scope.updateAccident = false;


	//taking accident
	$scope.editedAccident = angular.element("#offenceScope").scope().accident;
	$scope.accident_id = $scope.editedAccident['id'];
	delete $scope.editedAccident['$$hashKey'];

	//message during loading data
	$scope.loadAccidentVihecles = true;
	$scope.loadAccidentWitnesses = true;

	// fetching accident Vehicle
	var accidentVehicles = [];
	$scope.accidentVehicleEventModal = new iroad2.data.Modal('Accident Vehicle',[]);
	//fetching accident vehicle
	$scope.accidentVehicleEventModal.get(new iroad2.data.SearchCriteria('Program_Accident',"=",$scope.accident_id),function(result){
		console.log('Loading accidents')
		$scope.editedAccidentVehicles = result;
		$scope.loadAccidentVihecles = false;

		var passangerVisibity = [];
		//loop through all vehicles to have passenger visibility
		for(var i = 0; i < result.length; i ++){
			passangerVisibity.push(
				{
					'vehicle': i,
					'visibility' : false
				}
			);
		}

		$scope.accidentPasengerVisibility = passangerVisibity;
		passangerVisibity = []

		//determine number of vehicles
		for(var i = 0; i < $scope.editedAccidentVehicles.length; i++){
			accidentVehicles.push(i);
		}
		$scope.vehicles = accidentVehicles;
		accidentVehicles = [];
		$scope.$apply();


	});

	//fetching accident witness
	var accidentWitness = [];
	$scope.accidentWitnessEventModel = new iroad2.data.Modal('Accident Witness',[]);
	$scope.accidentWitnessEventModel.get(new iroad2.data.SearchCriteria('Program_Accident',"=",$scope.accident_id),function(results){
		console.log('Loading witness');
		$scope.editedaccidentWitnesses = results;
		$scope.loadAccidentWitnesses = false;for(var i = 0; i < $scope.editedaccidentWitnesses.length; i++){
			accidentWitness.push(i);
		}
		$scope.witnesses = accidentWitness;
		accidentWitness = [];
		$scope.$apply();

	});

	//fetching accident passengers
	$scope.accidentPassengersEvent = new iroad2.data.Modal('Accident Passenger',[]);

	$scope.accidentPassengersEvent.get(new iroad2.data.SearchCriteria('Program_Accident',"=",$scope.accident_id),function(results){
		console.log('Loading accidentPassengers');
		var list = [];
		$scope.editedAccidentPassengers = results;

		//update the list
		for(var i = 0;i < results.length; i++){
			list.push(i);

		}
		$scope.editedPassengersList = list;
		$scope.editedPassengerVehicleList = {};
		list = [];
		$scope.loadAccidentPasssenger = false;
		$scope.$apply();

	});


	//function to hide or show passengers
	$scope.showHideAccidentPassengers = function(vehicle){
		for(var i = 0; i < $scope.accidentPasengerVisibility.length;i++ ){
			if( $scope.accidentPasengerVisibility[i].vehicle == vehicle){
				$scope.accidentPasengerVisibility[i].visibility = !$scope.accidentPasengerVisibility[i].visibility;
			}
		}

	}


	//getting user Information
	$http.get("../../../api/me.json?fields=organisationUnits[id,name],name").success(function(data){
		$scope.logedInUser = data;
	});


	//function to save changes on accident information
	$scope.saveEditing = function(){
		//enable updates messages
		$scope.updateAccident = true;
		$scope.updateAccidentProgress = [];

		var otherData = {orgUnit:$scope.logedInUser.organisationUnits[0].id,status: "COMPLETED",storedBy: "admin",eventDate:new Date()};
		var saveEvent = $scope.editedAccident;
		$scope.updateAccidentProgress.push('Saving changes on basic information of Accident');
		console.log('Starting saving accident');

		if(saveEvent.coordinate){
			otherData.coordinate =saveEvent.coordinate;
		}else{
			otherData.coordinate = {"latitude": "","longitude": ""};
		}

		//saving basic information for accidents
		$scope.accidentEventModal = new iroad2.data.Modal('Accident',[]);
		$scope.accidentEventModal.save(saveEvent,otherData,function(result){
			console.log(" accident info updated successful ");

		},function(error){
			console.log('fail to update basic info for a given accidents');

		},$scope.accidentEventModal.getModalName());

		//saving updates on accident witness information
		if($scope.editedaccidentWitnesses.length > 0){
			$scope.updateAccidentProgress.push('Saving accident witness information');

		}

		$scope.accidentWitnessEventModel = new iroad2.data.Modal('Accident Witness',[]);
		for(var i = 0; i < $scope.editedaccidentWitnesses.length; i++){
			//prepare accident witness for saving changes
			var saveWitnessEvent = $scope.editedaccidentWitnesses[i];
			$scope.accidentWitnessEventModel.save(saveWitnessEvent,otherData,function(result){
				console.log(" accident witness updated successful ");

			},function(error){
				console.log('fail to update basic info for a given accidents');

			},$scope.accidentWitnessEventModel.getModalName());
		}

		//saving updates on accident vehicles
		var drivers = [];
		var vehicles = [];

		if($scope.editedAccidentVehicles.length > 0){
			$scope.updateAccidentProgress.push('Saving Accident Vehicles');

		}

		for (var i=0; i < $scope.editedAccidentVehicles.length; i++ ) {
			var licenceNumber = $scope.editedAccidentVehicles[i]['Licence Number'];
			$scope.driver = null;
			$scope.accidentVehicle = $scope.editedAccidentVehicles[i];
			$scope.driverModel =  new iroad2.data.Modal('Driver',[]);
			$scope.driverModel.get({value:licenceNumber},function(result){

				if($scope.driver == result[0]){
					console.log('Driver found');
				}
				else{
					$scope.driver = result[0];
					drivers.push(result[0]);

					if(drivers.length == $scope.editedAccidentVehicles.length){
						//fetching all vehicles
						console.log('fetching vehicles');
						$scope.updateAccidentProgress.push();
						for (var i=0; i < $scope.editedAccidentVehicles.length; i++ ) {
							$scope.vehicle = null;
							var plateNumber = $scope.editedAccidentVehicles[i]['Vehicle Plate Number/Registration Number'];

							$scope.vehicleDriver = new iroad2.data.Modal('Vehicle',[]);

							$scope.vehicleDriver.get({value:plateNumber},function(result) {
								if ($scope.vehicle == result[0]) {
									console.log('Vehicle found');
								}
								else {
									$scope.vehicle = result[0];
									vehicles.push(result[0]);

									//checking if number vehicle met
									if(vehicles.length == $scope.editedAccidentVehicles.length){
										console.log('Complete fetching Vehicles');

										////saving edited passenger information
										for(var passengerCounter = 0; passengerCounter < $scope.editedAccidentPassengers.length; passengerCounter ++){

											var passenger = $scope.editedAccidentPassengers[passengerCounter];
											var vehicleNumber = $scope.editedPassengerVehicleList[passengerCounter]['vehicle'];
											passenger.Vehicle = vehicles[vehicleNumber];

											$scope.accidentPassengerEvent = new iroad2.data.Modal('Accident Passenger',[]);
											//saving passenger
											$scope.accidentPassengerEvent.save(passenger,otherData,function(resultSavingPassenger){

												console.log('Successful update accident passenger ');

											},function(error){
												console.log('Fail to update accident passenger');

											},$scope.accidentPassengerEvent.getModalName());

										}
										//loop through to save each accident vehicles
										for(var i = 0; i < $scope.editedAccidentVehicles.length ; i++){
											$scope.accidentVehicle.Vehicle = vehicles[i];
											$scope.accidentVehicle.Driver = drivers[i];

											//add other data for driver
											$scope.accidentVehicle['Full Name'] = $scope.accidentVehicle.Driver['Full Name'];
											$scope.accidentVehicle['Gender'] = $scope.accidentVehicle.Driver['Gender'];
											$scope.accidentVehicle['Date of Birth'] = $scope.accidentVehicle.Driver['Date of Birth'];
											$scope.accidentVehicle['Licence Number'] = $scope.accidentVehicle.Driver['Driver License Number'];

											//add other data for vehicle
											$scope.accidentVehicle['Vehicle Plate Number/Registration Number'] = $scope.accidentVehicle.Vehicle['Vehicle Plate Number/Registration Number'];
											$scope.accidentVehicle['Vehicle Ownership Category'] = $scope.accidentVehicle.Vehicle['Vehicle Ownership Category'];
											$scope.accidentVehicle['Vehicle Owner Name'] = $scope.accidentVehicle.Vehicle['Vehicle Owner Name'];
											$scope.accidentVehicle['Vehicle Class'] = $scope.accidentVehicle.Vehicle['Vehicle Class'];
											$scope.accidentVehicle['Make'] = $scope.accidentVehicle.Vehicle['Make'];
											$scope.accidentVehicle['Model'] = $scope.accidentVehicle.Vehicle['Model'];

											//add accident object
											$scope.accidentVehicle.Accident = $scope.editedAccident;

											//saving accident
											$scope.accidentVehicleEventModal = new iroad2.data.Modal('Accident Vehicle',[]);
											var savedAccidentVehicle = $scope.accidentVehicle;

											$scope.accidentVehicleEventModal.save(savedAccidentVehicle,otherData,function(result){
												console.log('Successful update accident Vehicle');

											},function(error){
												console.log('Fail to update accident Vehicle');

											},$scope.accidentVehicleEventModal.getModalName());
										}
									}
								}
							});
						}//end of loop for fetching vehicles
					}//end of checking condition for number of driver meet
				}//end for fetching drivers
			});

		}
		$scope.updateAccidentProgress.push('Complete Updates');

	}



	//functions for adding flexibility in form inputs
	$scope.setDescription = function(key){

		for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
			if(iroad2.data.dataElements[j].name == key){
				if(iroad2.data.dataElements[j].description){
					return iroad2.data.dataElements[j].description;
				}
			}
		}
	}

	$scope.isInteger = function(key){
		return $scope.is(key,"int");
	}

	$scope.isFile = function(key){
		return $scope.is(key,"file");
	}
	$scope.isDate = function(key){
		console.log(key);
		return $scope.is(key,"date");
	}
	$scope.isString = function(key){
		return $scope.is(key,"string");
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
		for(j = 0 ;j < iroad2.data.dataElements.length;j++){
			if(iroad2.data.dataElements[j].name == key){
				return iroad2.data.dataElements[j].optionSet.options;
			}
		};
		return false;
	}


});


///controller for AddAccidentController
eventCaptureControllers.controller('AddAccidentController',function($scope,$http){

	//form visibility controllers
	$scope.savingNewAccident = false;
	$scope.accidentBasicInfo = true;
	$scope.accidentVehicle = false;
	$scope.accidentWitness = false;

	$scope.accidentBasicInfoVisibility = false;
	$scope.accidentBasicInfoVisibilityButton = true;

	//prepare forms
	$scope.newAccidentForm = angular.element("#offenceScope").scope().formAccident;
	$scope.newAccidentWitnessForm  = angular.element("#offenceScope").scope().formAccidentWitness;
	$scope.newAccidentVehicleForm = angular.element("#offenceScope").scope().formAccidentVehicle;
	$scope.newAccidentPassengerForm = angular.element("#offenceScope").scope().formAccidentVehiclePassenger;

	$scope.otherDataForm = {};
	$scope.newAccidentVehiclePassengers = {};
	$scope.passengerFormsVisibility = {};

	$scope.numberOfVehicles = 0;
	$scope.numberOfWitness = 0;


	//functions for adding flexibility in form inputs
	$scope.setDescription = function(key){

		for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
			if(iroad2.data.dataElements[j].name == key){
				if(iroad2.data.dataElements[j].description){
					return iroad2.data.dataElements[j].description;
				}
			}
		}
	}

	$scope.isInteger = function(key){
		return $scope.is(key,"int");
	}
	$scope.isRequired = function(key){
    	
    	var compulsory = false;
    	angular.forEach(iroad2.data.programs,function(program){
    		angular.forEach(program.programStages[0].programStageDataElements,function(programStageDataElement){
    			
    			compulsory = programStageDataElement.compulsory;
        	});
    	});
        return compulsory;
    }
	$scope.isDate = function(key){
		return $scope.is(key,"date");
	}
	$scope.isFile = function(key){
		return $scope.is(key,"file");
	}
	$scope.isString = function(key){
		return $scope.is(key,"string");
	}

	$scope.is = function(key,dataType){
		
		for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
			if(iroad2.data.dataElements[j].type == "file"){
				console.log(iroad2.data.dataElements[j].name +":"+key);
			}
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
		for(j = 0 ;j < iroad2.data.dataElements.length;j++){
			if(iroad2.data.dataElements[j].name == key){
				return iroad2.data.dataElements[j].optionSet.options;
			}
		};
		return false;
	}

	$scope.changeAccidentBasicInfoVisibility = function () {

		$scope.accidentBasicInfoVisibilityButton = !$scope.accidentBasicInfoVisibilityButton;
		$scope.accidentBasicInfo = !$scope.accidentBasicInfo;
		$scope.accidentBasicInfoVisibility = !$scope.accidentBasicInfoVisibility;

	}

	//function to provide form for adding accident vehicle info
	var numberOfVehicle = [];
	var numberOfPassengers = []
	var formsVisibility = [];
	$scope.vehicles = [];
	$scope.addAccidentVehicle = function(){
		//fill other data onto variables
		$scope.numberOfVehicles = $scope.otherDataForm['numberOfAccidentVehicles'];
		$scope.numberOfWitness = $scope.otherDataForm['numberOfAccidentWitness'];
		$scope.accidentAttendant = $scope.otherDataForm['accidentAttendant'];

		console.log('acccident form data : ' + JSON.stringify($scope.newAccidentForm));

		//$scope.accidentBasicInfoVisibility = !$scope.accidentBasicInfoVisibility;

		for (var i=0; i < $scope.numberOfVehicles; i++ ){
			numberOfVehicle.push(i);
			var passengerInfo = {
				'vehicle': i,
				'counter' : [],
				'Data' : {}
			}
			formsVisibility.push(
				{
					'vehicle' : i,
					'visibility' : true
				}
			);
			numberOfPassengers.push(passengerInfo);
		}
		$scope.passengerFormsVisibility = formsVisibility;
		$scope.newAccidentVehiclePassengers = numberOfPassengers;
		$scope.vehicles = numberOfVehicle;
		//empty variable number of vehicles
		numberOfVehicle = [];

		//checking if number of vehicles as witness has been filled
		if($scope.otherDataForm['numberOfAccidentVehicles'] && $scope.otherDataForm['numberOfAccidentWitness']){
			$scope.accidentBasicInfo = false;
			$scope.accidentVehicle = true;
			$scope.accidentWitness = false;
		}
		else{
			$scope.otherDataMessage = "Please fill number of witnesses and vehicles";
		}
	}

	//function to provide form for adding accident witness
	var numberOfWitnesses = []
	$scope.witnesses = [];
	$scope.addAccidentWitness = function(){

		for (var i=0; i < $scope.numberOfWitness; i++ ){

			numberOfWitnesses.push(i);
		}
		$scope.witnesses = numberOfWitnesses;
		//empty variable for number of witness
		numberOfWitnesses = []

		$scope.accidentBasicInfo = false;
		$scope.accidentVehicle = false;
		$scope.accidentWitness = true;

	}

	//function to add new passenger
	$scope.addPasseger = function(vehicle){

		if($scope.newAccidentVehiclePassengers[vehicle].counter.length > 0){
			var numberOfPassenger = $scope.newAccidentVehiclePassengers[vehicle].counter.length;
			$scope.newAccidentVehiclePassengers[vehicle].counter.push({'passengerCounter':(numberOfPassenger)});
		}
		else{
			$scope.newAccidentVehiclePassengers[vehicle].counter.push({'passengerCounter': 0});
		}
	}

	//function to show or hide forms for passengers on a given accident vehicle
	$scope.showHidePassengerForms = function(vehicle){
		$scope.passengerFormsVisibility[vehicle].visibility = !$scope.passengerFormsVisibility[vehicle].visibility;

	}


	//getting user Information
	$http.get("../../../api/me.json?fields=organisationUnits[id,name],name").success(function(data){
		$scope.logedInUser = data;
	});


	//function to save accident into the system
	$scope.saveAccident = function(){

		$scope.savingNewAccident = true;
		$scope.addingAccidentProgress = [];

		$scope.addingAccidentProgress.push('Saving accident information');
		var otherData = {orgUnit:$scope.logedInUser.organisationUnits[0].id,status: "COMPLETED",storedBy: "admin",eventDate:new Date()};
		//otherData.coordinate = {"latitude": "","longitude": ""}
		var saveEvent = $scope.newAccidentForm;

		//saving basic information for an accident
		var accidentEventModal = new iroad2.data.Modal('Accident',[]);
		$scope.accident_id = null;

		accidentEventModal.save(saveEvent,otherData,function(result){
			console.log(JSON.stringify(result));
			if(result.httpStatus){
				result = result.response;
				$scope.accident_id = result.importSummaries[0].reference
				$scope.newAccidentForm['id'] = $scope.accident_id;
				console.log('accident data : ' + JSON.stringify($scope.newAccidentForm));

				//saving witness
				if($scope.numberOfWitness > 0){
					$scope.addingAccidentProgress.push('Saving accident witnesses');

				}
				//loop through all witness
				for (var i=0; i < $scope.numberOfWitness; i++ ){
					///prepare data for saving accident witness
					$scope.accidentWitnessModel = new iroad2.data.Modal('Accident Witness',[]);
					$scope.newAccidentWitnessForm[i].Accident = $scope.newAccidentForm;
					var saveAccidentWitnesEvent = $scope.newAccidentWitnessForm[i];

					//saving a given witness
					$scope.accidentWitnessModel.save(saveAccidentWitnesEvent,otherData,function(result){
						console.log('Success to add the witness to the accident');

					},function(error){
						console.log('Fail to add the witness to the accident');

					},$scope.accidentWitnessModel.getModalName());
				}

				//saving accident vehicles
				var drivers = [];
				var vehicles = [];
				for (var i=0; i < $scope.numberOfVehicles; i++ ) {

					//prepare data for saving
					$scope.driver = null;
					$scope.accidentVehicle = $scope.newAccidentVehicleForm[i];
					var licenceNumber = $scope.accidentVehicle['Licence Number'];

					$scope.driverModel =  new iroad2.data.Modal('Driver',[]);
					$scope.driverModel.get({value:licenceNumber},function(result){
						if($scope.driver == result[0]){
							console.log('Driver found');
						}
						else{
							$scope.driver = result[0];
							drivers.push(result[0]);
							if(drivers.length == $scope.numberOfVehicles){
								//fetching all vehicles
								for (var i=0; i < drivers.length; i++ ) {
									$scope.vehicle = null;
									$scope.accidentVehicle = $scope.newAccidentVehicleForm[i];;
									var plateNumber = $scope.accidentVehicle['Vehicle Plate Number/Registration Number'];
									var vehicleModel = new iroad2.data.Modal('Vehicle',[]);
									vehicleModel.get({value:plateNumber},function(result) {
										if($scope.vehicle == result[0]){
											console.log('vehicle found');
										}
										else{
											$scope.vehicle = result[0];
											vehicles.push($scope.vehicle);
											//checking for all vehicles
											if(vehicles.length == $scope.numberOfVehicles){
												console.log('Start saving accident passengers data');
												//loop through all vehicle to save passengers
												for(var i = 0; i < $scope.numberOfVehicles ; i++){
													//$scope.newAccidentVehiclePassengers[i].accident =  $scope.newAccidentForm;
													var accidentPassengers = $scope.newAccidentVehiclePassengers[i].Data;
													var vehicle = vehicles[i];

													//loop passengers data
													for(var passengerCounter = 0; passengerCounter < $scope.newAccidentVehiclePassengers[i].counter.length; passengerCounter ++){
														//prepare data for saving
														var passenger = accidentPassengers[passengerCounter];
														passenger.Vehicle = vehicle;
														passenger.Accident = $scope.newAccidentForm;

														$scope.accidentPassengerEvent = new iroad2.data.Modal('Accident Passenger',[]);
														//saving passenger
														$scope.accidentPassengerEvent.save(passenger,otherData,function(resultSavingPassenger){

															console.log('Successful accident passenger ');

														},function(error){
															console.log('Fail to add accident passenger');

														},$scope.accidentPassengerEvent.getModalName());

													}

												}

												console.log('Start saving accident vehicles data');
												//loop through to save each accident vehicles
												for(var i = 0; i < $scope.numberOfVehicles ; i++){
													console.log('accident data : ' + JSON.stringify($scope.newAccidentForm));
													//add vehicle and driver objects ready for saving
													$scope.accidentVehicle.Vehicle = vehicles[i];
													$scope.accidentVehicle.Driver = drivers[i];

													//add other data for driver
													$scope.accidentVehicle['Full Name'] = $scope.accidentVehicle.Driver['Full Name'];
													$scope.accidentVehicle['Gender'] = $scope.accidentVehicle.Driver['Gender'];
													$scope.accidentVehicle['Date of Birth'] = $scope.accidentVehicle.Driver['Date of Birth'];
													$scope.accidentVehicle['Licence Number'] = $scope.accidentVehicle.Driver['Driver License Number'];

													//add other data for vehicle
													$scope.accidentVehicle['Vehicle Plate Number/Registration Number'] = $scope.accidentVehicle.Vehicle['Vehicle Plate Number/Registration Number'];
													$scope.accidentVehicle['Vehicle Ownership Category'] = $scope.accidentVehicle.Vehicle['Vehicle Ownership Category'];
													$scope.accidentVehicle['Vehicle Owner Name'] = $scope.accidentVehicle.Vehicle['Vehicle Owner Name'];
													$scope.accidentVehicle['Vehicle Class'] = $scope.accidentVehicle.Vehicle['Vehicle Class'];
													$scope.accidentVehicle['Make'] = $scope.accidentVehicle.Vehicle['Make'];
													$scope.accidentVehicle['Model'] = $scope.accidentVehicle.Vehicle['Model'];

													//add accident object
													$scope.accidentVehicle.Accident = $scope.newAccidentForm;

													//saving accident
													$scope.accidentVehicleEventModal = new iroad2.data.Modal('Accident Vehicle',[]);
													var savedAccidentVehicle = $scope.accidentVehicle;
													$scope.accidentVehicleEventModal = new iroad2.data.Modal('Accident Vehicle',[]);
													var savedAccidentVehicle = $scope.accidentVehicle;
													$scope.accidentVehicleEventModal.save(savedAccidentVehicle,otherData,function(resultSavingAccidentVehicle){
														console.log('Successful add accident Vehicle ' );

													},function(error){
														console.log('Fail to add accident Vehicle');

													},$scope.accidentVehicleEventModal.getModalName());

												}
											}
										}
									});
								}//end of loop for fetching vehicles
							}//end of checking condition for number of driver meet
						}//end for fetching drivers
					});
				}
			}


		},function(error){
			alert('fails');

		},accidentEventModal.getModalName());

	}

}) ;

