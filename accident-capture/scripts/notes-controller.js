//Controller for notes
eventCaptureControllers.controller('AccidentController',
    function($scope){

    	//taking data to the popo view for viewing info for a given accident
    	$scope.AccidentData = angular.element("#offenceScope").scope().AccidentData;
    	$scope.VehicleData = angular.element("#offenceScope").scope().VehicleData;
    	$scope.DriverData = angular.element("#offenceScope").scope().DriverData;

		//console.log('Driver '+JSON.stringify($scope.DriverData)+'\n');    	
		//console.log('Vehicle '+JSON.stringify($scope.VehicleData)+'\n');    	
		//console.log('accident '+JSON.stringify($scope.AccidentData)+'\n'); 


    });

///controller for AddAccidentController
eventCaptureControllers.controller('AddAccidentController',function($scope){

	$scope.emptyForm = angular.element("#offenceScope").scope().formData;

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


		$scope.saveAccident = function(){

			console.log('data before : ' + JSON.stringify($scope.newAccident));
	        angular.forEach($scope.savableEventData, function (savableData) {
	            delete $scope.newAccident[savableData.name];
	            $scope.newAccident[savableData.key] = savableData.value;
	        });

	        console.log("Saving Data:" + JSON.stringify($scope.newAccident));
        } 

}) 
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
	
	/**
	 * Updates the amount payable by calculating the sum of the amounts
	 * in offenceEvents 
	 */
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
	/**
	 * Delete offence from from the list of offenceEvents
	 * 
	 * @param Object(Offence) offence
	 */
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
	/**
	 * Watch and wait for a model change and fetch from a url and execute
	 * on success
	 * 
	 * @param string model
	 * 
	 * @param string url(Url to fetch the data)
	 * 
	 * @param function success (To execute after success fetch)
	 */
	$scope.watchAndFetch = function(model,url,success){
		$scope.$watch(model, function (value, oldValue) {
			
			if(value != '')//If the changed value is not empty
			{
				//Fetch station information given the station_id
				/*$http.get(url + value).success(
						function(data) {
							success(data);
						})
				.error(function(error) {
					///alert(error);
					$scope.data.error = error;
				});
*/			}
		});
	}
	$scope.payment = {};
	$scope.formTitle = "Report Offence";
	dhisConfigs.onLoad = function(){
	//Is there a request in the route parameters
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
		}else{*/
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
	/**
	 * 
	 * Sets payment
	 */
	$scope.setPayment = function(receipt){
		//Set paid if payment is made
		$scope.offence.paid = (receipt.receipt_number != undefined);
		if($scope.offence.paid){
			$scope.payment = receipt;
			
		}
	}
	/**
	 * 
	 * Checks if the form is readonly
	 */
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
	
	
	/**
	 * Get a Yes or No value from a boolean value
	 * 
	 * @param boolean value
	 * 
	 */
	$scope.getAnswerValue = function(value) {
		if(value)
		{
			return "Yes";
		}else
		{
			return "No";
		}
	};
	/**
	 * Get a Block or None value from a boolean value
	 * 
	 * @param boolean value
	 * 
	 */
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
	/**
	 * Get a Block or None value from a boolean value
	 * 
	 * @param boolean value
	 * 
	 */
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
});