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
			"place" : "",
			"facts" : "",
			"admit": false,
			"paid":false,
			"amount":"",
			"offence_date" : Date(),
			"vehicle_plate_number":"",
			"driver_license_number":"",
			"rank_no":""
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
			$scope.amountPayable += parseInt($scope.offenceEvents[i].amount);
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
					alert(error);
					$scope.data.error = error;
				});
			}
		});
	}
	$scope.payment = {};
	$scope.formTitle = "Report Offence";
	//Is there a request in the route parameters
	if($routeParams.request){
		//There is a request in the route parameters
		$scope.formTitle = "Offence Details";
		$scope.isreadonly = true;
		//Fetch the offence involved
		$http.get("/api/offence/"+$routeParams.id).success(function(data){
			//Set the offence
			$scope.offence = offenceConversion(data);
			//Fetch the payment of the offence involved
			$http.get("/api/offence/"+$routeParams.id+"/payment/")
				.success(
					function(payment) {
						$scope.setPayment(payment);
				})
				.error(function(error) {
					//TODO Handle error
			});
		}).error(function(error) {
			//TODO Handle error
		});
		//Fetch the events of the offence involved
		$http.get("/api/offence/"+$routeParams.id+"/events/")
			.success(
				function(offenceEvents) {
					//Set the offenceEvents array
					$scope.offenceEvents = offenceEvents;
			})
			.error(function(error) {
				//TODO Handle error
		});
		if($routeParams.request == "view" || $routeParams.request == "edit")// if the route is /view or /edit
		{
			
		}
	}
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
	
	//Initialize driver as in the database
	$scope.driver ={};
	
	//Watch/wait for changes on the license number
	$scope.watchAndFetch('offence.driver_license_number',"/api/driver/",function(driver) {
		//Set the driver
		$scope.driver = driver;
		if(driver.first_name != undefined)
		{
			//Set the full name of the driver
			$scope.offence.to = driver.first_name +" "+ driver.last_name;
			//Set the offence address
			$scope.offence.address = driver.address;
		}
		
	});
	
	//Initialize Vehicle  mirrors the one on the database
	$scope.vehicle ={};
	//Watch/wait for changes on the plate number
	$scope.watchAndFetch('offence.vehicle_plate_number',"/api/vehicle/",function(vehicle) {
		//Set vehicle
		$scope.vehicle = vehicle;
	});
	
	//Initialize Police  mirrors the one on the database
	$scope.police = {};
	
	//Watch/wait for changes on the rank_no
	$scope.watchAndFetch('offence.rank_no',"/api/police/",function(police) {
		//Set Police
		$scope.police = police;
		
		$scope.watchAndFetch('police.person_id',"/api/person/",function(person) {
			//Set Police
			$scope.police.person = person;
		});
	});
	
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
		$http({
		    url: '/api/offence/',
		    method: "POST",
		    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		    responseType: "json",
		    data: {
		    	offence:$scope.offence,
		    	events:$scope.offenceEvents,
		    	receipt:$scope.payment
		    }
		})
		.then(
				function(data) {
					alert("Task added."+data.status);
					$scope.offenceAdded = true;
				}, 
				function(data) { 
					//TODO Handle Error
					alert(data);
				}
			);
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
	//Fetch Offence registry list from server
	$http.get("/api/offence/registry").success(function(data) {
		$scope.offenceRegistry = data;
		
	}).error(function(error) {
		//TODO Handle error
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
