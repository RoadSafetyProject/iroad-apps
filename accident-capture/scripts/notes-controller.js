//Controller for notes
eventCaptureControllers.controller('AccidentController',
	function($scope){

		//taking data to the pop up view for viewing info for a given accident
		$scope.AccidentData = angular.element("#offenceScope").scope().AccidentData;
		$scope.accident_id = $scope.AccidentData['id'];

		//message during loading data
		$scope.loadAccidentVihecles = true;
		$scope.loadAccidentWitnesses = true;

		$scope.accidentVehicleEventModal = new iroad2.data.Modal('Accident Vehicle',[]);

		//fetching accident vehicle based on accident id
		$scope.accidentVehicleEventModal.get({value:$scope.accident_id},function(result){
			//console.log('accident vehicles data : ' + JSON.stringify(result));
			console.log('Loading vehicles');
			$scope.accidentVehicles = result;
			$scope.loadAccidentVihecles = false;
			$scope.$apply();
		});

		//fetching accident witness
		$scope.accidentWitnessEventModel = new iroad2.data.Modal('Accident Witness',[]);

		$scope.accidentWitnessEventModel.get(new iroad2.data.SearchCriteria('Program_Accident',"=",$scope.accident_id),function(results){
			//console.log('Witness on accident : ' + JSON.stringify(results));
			console.log('Loading witness');
			$scope.accidentWitnesses = results;
			$scope.loadAccidentWitnesses = false;
			$scope.$apply();

		});

	});


//controller for edit accident information
eventCaptureControllers.controller('EditAccidentController',function($scope,$http){

	//prepare form for editing
	$scope.editAccidentForm = angular.element("#offenceScope").scope().formAccident;
	$scope.editAccidentWitness  = angular.element("#offenceScope").scope().formAccidentWitness;
	$scope.editAccidentVehicleForm = angular.element("#offenceScope").scope().formAccidentVehicle;
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
		$scope.editedAcciedentVehicles = result;
		$scope.loadAccidentVihecles = false;
		for(var i = 0; i < $scope.editedAcciedentVehicles.length; i++){
			accidentVehicles.push(i);
		}
		$scope.vehicles = accidentVehicles;
		accidentVehicles = []

		//console.log('accident Vehicle : ' + JSON.stringify($scope.editedAcciedentVehicles));
		$scope.$apply();


	});

	//fetching accident witness
	var accidentWitness = [];
	$scope.accidentWitnessEventModel = new iroad2.data.Modal('Accident Witness',[]);
	$scope.accidentWitnessEventModel.get(new iroad2.data.SearchCriteria('Program_Accident',"=",$scope.accident_id),function(results){
		//console.log('Witness on accident : ' + JSON.stringify(results));
		console.log('Loading witness');
		$scope.editedaccidentWitnesses = results;
		$scope.loadAccidentWitnesses = false;for(var i = 0; i < $scope.editedaccidentWitnesses.length; i++){
			accidentWitness.push(i);
		}
		$scope.witnesses = accidentWitness;
		accidentWitness = []
		//console.log('Accident witness : ' + JSON.stringify($scope.editedaccidentWitnesses));
		$scope.$apply();

	});


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

		//saving basic informations for accidents
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

		if($scope.editedAcciedentVehicles.length > 0){
			$scope.updateAccidentProgress.push('Saving Accident Vehicles');

		}

		for (var i=0; i < $scope.editedAcciedentVehicles.length; i++ ) {
			var licenceNumber = $scope.editedAcciedentVehicles[i]['Licence Number'];

			$scope.driver = null;
			$scope.accidentVehicle = $scope.editedAcciedentVehicles[i];

			$scope.driverModel =  new iroad2.data.Modal('Driver',[]);

			$scope.driverModel.get({value:licenceNumber},function(result){

				if($scope.driver == result[0]){
					console.log('Driver found');
				}
				else{
					$scope.driver = result[0];
					drivers.push(result[0]);

					if(drivers.length == $scope.editedAcciedentVehicles.length){
						//fetching all vehicles
						console.log('fetching vehicles');
						$scope.updateAccidentProgress.push();
						for (var i=0; i < $scope.editedAcciedentVehicles.length; i++ ) {
							$scope.vehicle = null;
							var plateNumber = $scope.editedAcciedentVehicles[i]['Vehicle Plate Number'];

							$scope.vehicleDriver = new iroad2.data.Modal('Vehicle',[]);

							$scope.vehicleDriver.get({value:plateNumber},function(result) {
								if ($scope.vehicle == result[0]) {
									console.log('Vehicle found');
								}
								else {
									$scope.vehicle = result[0];
									vehicles.push(result[0]);

									//checking if number vehicle met
									if(vehicles.length == $scope.editedAcciedentVehicles.length){
										console.log('Complete fetching Vehicles');

										//loop through to save each accident vehicles
										for(var i = 0; i < $scope.editedAcciedentVehicles.length ; i++){
											$scope.accidentVehicle.Vehicle = vehicles[i];
											$scope.accidentVehicle.Driver = drivers[i];

											//add other data for driver
											$scope.accidentVehicle['Full Name'] = $scope.accidentVehicle.Driver['Full Name'];
											$scope.accidentVehicle['Gender'] = $scope.accidentVehicle.Driver['Gender'];
											$scope.accidentVehicle['Date of Birth'] = $scope.accidentVehicle.Driver['Date of Birth'];
											$scope.accidentVehicle['Licence Number'] = $scope.accidentVehicle.Driver['Driver License Number'];

											//add other data for vehicle
											$scope.accidentVehicle['Vehicle Plate Number'] = $scope.accidentVehicle.Vehicle['Vehicle Plate Number'];
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
		otherData.coordinate = {"latitude": "","longitude": ""}
		var saveEvent = $scope.newAccidentForm;

		//saving basic information for an accident
		$scope.accidentEventModal = new iroad2.data.Modal('Accident',[]);
		$scope.accident_id = null;
		$scope.accidentEventModal.save(saveEvent,otherData,function(result){
			console.log("success add accident basic info");
			$scope.accident_id = result.importSummaries[0].reference;
			$scope.newAccidentForm['id'] = $scope.accident_id;


			if($scope.numberOfWitness > 0){
				$scope.addingAccidentProgress.push('Saving accident witnesses');

			}

			//loop through witnesses
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


			if($scope.numberOfVehicles > 0){
				$scope.addingAccidentProgress.push('Saving accident Vehicles');

			}
			//process for saving accident vehicles
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
							console.log('start fetching vehicles');
							for (var i=0; i < $scope.numberOfVehicles; i++ ) {
								$scope.vehicle = null;
								$scope.accidentVehicle = $scope.newAccidentVehicleForm[i];
								var plateNumber = $scope.accidentVehicle['Vehicle Plate Number'];

								$scope.vehicleDriver = new iroad2.data.Modal('Vehicle',[]);
								$scope.vehicleDriver.get({value:plateNumber},function(resultVehilce) {
									if ($scope.vehicle == resultVehilce[0]) {
										console.log('Vehicle found');
									}
									else {
										$scope.vehicle = resultVehilce[0];
										vehicles.push(resultVehilce[0]);
										//checking if number vehicle met
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

														console.log('Successful accident passenger ' + resultSavingPassenger.importSummaries[0].reference );

													},function(error){
														console.log('Fail to add accident passenger');

													},$scope.accidentPassengerEvent.getModalName());

												}

											}

											console.log('Start saving accident vehicles data');
											//loop through to save each accident vehicles
											for(var i = 0; i < $scope.numberOfVehicles ; i++){
												//add vehicle and driver objects ready for saving
												$scope.accidentVehicle.Vehicle = vehicles[i];
												$scope.accidentVehicle.Driver = drivers[i];


												//add other data for driver
												$scope.accidentVehicle['Full Name'] = $scope.accidentVehicle.Driver['Full Name'];
												$scope.accidentVehicle['Gender'] = $scope.accidentVehicle.Driver['Gender'];
												$scope.accidentVehicle['Date of Birth'] = $scope.accidentVehicle.Driver['Date of Birth'];
												$scope.accidentVehicle['Licence Number'] = $scope.accidentVehicle.Driver['Driver License Number'];

												//add other data for vehicle
												$scope.accidentVehicle['Vehicle Plate Number'] = $scope.accidentVehicle.Vehicle['Vehicle Plate Number'];
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
												$scope.accidentVehicleEventModal.save(savedAccidentVehicle,otherData,function(resultSavingAccidentVehicle){

													console.log('Successful add accident Vehicle ' + resultSavingAccidentVehicle.importSummaries[0].reference );

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


		},function(error){
			console.log('Fail to add accident basic info');

		},$scope.accidentEventModal.getModalName());
	}






}) ;


/*
eventCaptureControllers.controller('offenceFormController',
	function($scope) {
		//console.log(JSON.stringify($scope));
		$scope.offence = angular.element("#offenceScope").scope().offence;
		console.log(JSON.stringify($scope.offence));
		//Initialize Offence as mirrored in the database
		var offenceModal = new iroad2.data.Modal("Offence",[new iroad2.data.Relation("Offence Registry")])
		offenceModal.get(new iroad2.data.SearchCriteria("","=",$scope.offence.id),function(results){
			console.log("Registries:"+JSON.stringify(results));
			var registries = [];
			angular.forEach(results,function(registry){
				registries.push(registry.Offence_Registry);
			});
			$scope.offenceEvents = registries;
			$scope.$apply();
		});
		//Initialize offence events of an offence
		$scope.offenceEvents = [];
		//Initialize the amount payable for the offence events
		$scope.amountPayable = 0;

		*/
/**
		 * Updates the amount payable by calculating the sum of the amounts
		 * in offenceEvents
		 *//*

		$scope.updateAmountPayable = function(){
			$scope.amountPayable = 0;
			//Loop through the events to get amount
			for(i = 0;i < $scope.offenceEvents.length;i++)
			{
				$scope.amountPayable += parseInt($scope.offenceEvents[i].Amount);
			}
		}
		//Watch/wait for changes on offenceEvents and update the amount payable
		$scope.$watch('offenceEvents', function (newValue, oldValue) {
			$scope.updateAmountPayable();
		});
		*/
/**
		 * Delete offence from from the list of offenceEvents
		 *
		 * @param Object(Offence) offence
		 *//*

		$scope.deleteOffence = function(offence){
			//Loop through the offenceEvents
			for(i = 0; i < $scope.offenceEvents.length;i++)
			{
				if($scope.offenceEvents[i].id == offence.id)//If event is in the list delete it
				{
					//Delete offence from offenceEvent
					$scope.offenceEvents.splice(i,1);
					break;
				}
			}
		};
		*/
/**
		 * Watch and wait for a model change and fetch from a url and execute
		 * on success
		 *
		 * @param string model
		 *
		 * @param string url(Url to fetch the data)
		 *
		 * @param function success (To execute after success fetch)
		 *//*

		$scope.watchAndFetch = function(model,url,success){
			$scope.$watch(model, function (value, oldValue) {

				if(value != '')//If the changed value is not empty
				{
					//Fetch station information given the station_id
					*/
/*$http.get(url + value).success(
					 function(data) {
					 success(data);
					 })
					 .error(function(error) {
					 ///alert(error);
					 $scope.data.error = error;
					 });
					 *//*
			}
			});
		}
		$scope.payment = {};
		$scope.formTitle = "Report Offence";
		dhisConfigs.onLoad = function(){
			//Is there a request in the route parameters
			*/
/*if($routeParams.request){
			 //There is a request in the route parameters
			 $scope.formTitle = "Offence Details";
			 $scope.isreadonly = true;


			 var offenceModal = new iroad2.data.Modal("Offence Event",[new iroad2.data.Relation("Offence Registry","Offence")]);
			 offenceModal.find($routeParams.id,function(result){
			 console.log(JSON.stringify(result));
			 $scope.offence = result;
			 for(i = 0;i < result.Offences.length;i++){
			 $scope.offenceEvents.push(result.Offences[i].Offence_Registry);
			 }
			 $scope.$apply();
			 });

			 //$scope.$apply();
			 if($routeParams.request == "view" || $routeParams.request == "edit")// if the route is /view or /edit
			 {

			 }
			 }else{*//*

			$scope.$watch("offence.Driver['Driver License Number']", function (value, oldValue) {
				if(value != '')//If the changed value is not empty
				{
					var driver = new iroad2.data.Modal("Driver",[]);
					driver.get({value:$scope.offence.Driver['Driver License Number']},function(result){
						if(result.length == 1)
						{
							$scope.offence.Driver = result[0];

						}else{
							$scope.offence.Driver.id = undefined;
						}
						$scope.$apply();
					});
				}
			});
			$scope.$watch("offence.Vehicle['Vehicle Plate Number']", function (value, oldValue) {
				if(value != '')//If the changed value is not empty
				{
					var vehicle = new iroad2.data.Modal("Vehicle",[]);
					vehicle.get({value:$scope.offence.Vehicle['Vehicle Plate Number']},function(result){
						if(result.length == 1)
						{
							$scope.offence.Vehicle = result[0];
						}else{
							$scope.offence.Vehicle.id = undefined;
						}
						$scope.$apply();
					});
				}
			});
			$scope.$watch("offence.Police['Rank Number']", function (value, oldValue) {
				if(value != '')//If the changed value is not empty
				{
					var police = new iroad2.data.Modal("Police",[]);
					police.get({value:$scope.offence.Police['Rank Number']},function(result){
						if(result.length == 1)
						{
							$scope.offence.Police = result[0];
						}else{
							$scope.offence.Police.id = undefined;
						}
						$scope.$apply();
					});
				}
			});
			//}
		}
		iroad2.Init(dhisConfigs);
		*/
/**
		 *
		 * Sets payment
		 *//*

		$scope.setPayment = function(receipt){
			//Set paid if payment is made
			$scope.offence.paid = (receipt.receipt_number != undefined);
			if($scope.offence.paid){
				$scope.payment = receipt;

			}
		}
		*/
/**
		 *
		 * Checks if the form is readonly
		 *//*

		$scope.getWriteAccess = function(){
			if($scope.isreadonly){
				return "readonly";
			}
		}
		$scope.data = {};

		//Initialize Station  mirrors the one on the database
		$scope.station = {};

		//Watch/wait for changes on the station id
		$scope.watchAndFetch('police.station_id',"/api/station/",function(station) {
			//Set Station
			$scope.station = station;
		});

		$scope.offenceAdded = false;
		//submit the offence object to the server
		$scope.submitOffence = function() {

			$scope.offence.Offences = [];
			for(i = 0; i < $scope.offenceEvents.length;i++)
			{
				$scope.offence.Offences.push({Offence_Registry: $scope.offenceEvents[i]});
			}

			var offenceEvent = new iroad2.data.Modal("Offence Event",[]);
			var otherData = {orgUnit:"ij7JMOFbePH",status: "COMPLETED",storedBy: "admin",eventDate:$scope.offence['Offence Date']};
			offenceEvent.save($scope.offence,otherData,function(result){
				console.log("Offence Save successfully:"+JSON.stringify(result));
				var offence = new iroad2.data.Modal("Offence",[]);
				var offences = [];
				for(i = 0; i < $scope.offenceEvents.length;i++)
				{
					offences.push({Offence_Event:result.importSummaries[0].reference,Offence_Registry: $scope.offenceEvents[i].id});
				}
				console.log(JSON.stringify(offences));
				offence.save(offences,otherData,function(result){
					alert("Offence save su")
					console.log("Result:"+JSON.stringify(result));
				},function(result){
					console.log("Error:"+JSON.stringify(result));
				});
			},function(result){
				console.log("Error:"+JSON.stringify(result));
			});
		}


		*/
/**
		 * Get a Yes or No value from a boolean value
		 *
		 * @param boolean value
		 *
		 *//*

		$scope.getAnswerValue = function(value) {
			if(value)
			{
				return "Yes";
			}else
			{
				return "No";
			}
		};
		*/
/**
		 * Get a Block or None value from a boolean value
		 *
		 * @param boolean value
		 *
		 *//*

		$scope.getDisplayValue = function(value) {
			if(value)
			{
				return "inline-block";
			}else
			{
				return "none";
			}
		};
		$scope.isExpired = function(date1) {
			var date2 = new Date();
			var timestamp=Date.parse(date1)
			if (isNaN(timestamp)==false)
			{
				var d=new Date(timestamp);
				return ((date2.getDate() - d.getDate()) <= 0);
			}
			return false;
		};
		*/
/**
		 * Get a Block or None value from a boolean value
		 *
		 * @param boolean value
		 *
		 *//*

		$scope.showDetails = function(id,e) {
			var elem = e.currentTarget;
			var display = document.getElementById(id).style.display;
			if(display == 'none'){
				document.getElementById(id).style.display = 'inline-block';
				elem.innerHTML = 'Hide Details';
			}else{
				document.getElementById(id).style.display = 'none';
				elem.innerHTML = 'Show Details';
			}
		};
	});*/
