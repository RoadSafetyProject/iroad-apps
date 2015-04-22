angular.module('rsmsaApp')
.controller('offenceFormController',
	function($scope,$http, $mdDialog,$rootScope, $scope, $routeParams, $route) {
	//Initialize readonly value for the offence form. View is readonly
	$scope.isreadonly = false;
	//Initialize Date options for ui-date
	$scope.dateOptions = {
	        changeYear: true,
	        changeMonth: true,
	        yearRange: '1900:-0'
	    };
	//Initialize Offence as mirrored in the database
	$scope.offence = {
			"Offence Admission Status":false
		};
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
				$http.get(url + value).success(
						function(data) {
							success(data);
						})
				.error(function(error) {
					///alert(error);
					$scope.data.error = error;
				});
			}
		});
	}
	$scope.payment = {};
	$scope.formTitle = "Report Offence";
	dhisConfigs.onLoad = function(){
	//Is there a request in the route parameters
		if($routeParams.request){
			//There is a request in the route parameters
			$scope.formTitle = "Offence Details";
			$scope.isreadonly = true;
			
			
			var offenceModal = new dhis2.data.Modal("Offence Event",[{name:"Offence Registry",type:"MANY_MANY",pivot:"Offence"}]);
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
		}else{
			$scope.$watch("offence.Driver['Driver License Number']", function (value, oldValue) {
				if(value != '')//If the changed value is not empty
				{
					var driver = new dhis2.data.Modal("Driver",[]);
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
					var vehicle = new dhis2.data.Modal("Vehicle",[]);
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
					var police = new dhis2.data.Modal("Police",[]);
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
		}
	}
	dhis2.Init(dhisConfigs);
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
		
		var offenceEvent = new dhis2.data.Modal("Offence Event",[]);
		var otherData = {orgUnit:"ij7JMOFbePH",status: "COMPLETED",storedBy: "admin",eventDate:$scope.offence['Offence Date']};
		offenceEvent.save($scope.offence,otherData,function(result){
			console.log("Offence Save successfully:"+JSON.stringify(result));
			var offence = new dhis2.data.Modal("Offence",[]);
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
	
	//Show a dialog box of offence registry
	$scope.showOffences = function(ev) {
		/**
		 * Push offenceEvent to the list of offenceEvents
		 * 
		 * @param Object(OffenceEvent) offenceEvent
		 * 
		 */
		$mdDialog.push = function(offenceEvent){
			//Push offence event
			$scope.offenceEvents.push(angular.copy(offenceEvent));
			//Update amount payable
			$scope.updateAmountPayable();
		};
		//Show dialog box with a list of offences to choose from
		$mdDialog.show({
			controller : OffenceDialogController,
			templateUrl : 'views/offencelistdialog.html',
			targetEvent : ev,
		});
	};
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
	//Show a dialog box of offence registry
	$scope.openPaymentForm = function(ev) {
		$mdDialog.setPayment = function(receipt){
			$scope.setPayment(receipt);
			$scope.submitOffence();
		};
		//Show dialog box with a list of offences to choose from
		$mdDialog.show({
			controller : PaymentDialogController,
			templateUrl : 'views/paymentForm.html',
			targetEvent : ev,
		});
	};
});
/**
 * Converts 1 or 0 to true or false in an offence object
 * 
 * @param Object(Offence) offence
 * 
 * @returns Object(Offence) offence
 * 
 */
function offenceConversion(offence){
	if(offence.admit == 1)
	{
		offence.admit = true;
	}else{
		offence.admit = false;
	}
	if(offence.paid == 1)
	{
		offence.paid = true;
	}else{
		offence.paid = false;
	}
	return offence;
}
/**
 * Dialog box to select offences from list of offences
 */
function OffenceDialogController($scope, $mdDialog,$http) {
	//Initialize offenceRegistry list
	$scope.offenceRegistry = [];
	//Hide the dialog box
	$scope.hide = function() {
		$mdDialog.hide();
	};
	/**
	 * Push the check offence to the offence form
	 * 
	 * @param Object(OffenceEvent) offenceEvent
	 * 
	 */
	$scope.checkClick = function(offenceEvent) {
		$mdDialog.push(offenceEvent);
	}
	var offenceRegs = new dhis2.data.Modal("Offence Registry",[]);
	offenceRegs.getAll(function(result){
		$scope.offenceRegistry = result;
		$scope.$apply();
	});
}
/**
 * Dialog box to make payments
 */
function PaymentDialogController($scope, $mdDialog,$http) {
	//Hide the dialog box
	$scope.complete = function(receipt) {
		//Set payment to parent scope
		$mdDialog.setPayment(receipt);
		$mdDialog.hide();
	};
}
