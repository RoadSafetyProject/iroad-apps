/**
 * Offence payment Controller
 * 
 * @author Vincent P. Minde
 * 
 */
angular.module('rsmsaApp').controller('offencePaymentController',function($scope,$http) {
	
	//Initialize entity Model
	$scope.entity = { id: 'driver', name: 'Driver' , ref :'License No.'};
	//Initialize entities for the listbox
	$scope.entities = [
		                 { id: 'driver', name: 'Driver' , ref :'License No.'},
		                 { id: 'vehicle', name: 'Vehicle' , ref :'Plate No.'}
		               ];
	//Initialize status Model 'Stores whether it is paid or not paid status
	$scope.status = { id: '', name: 'All'};
	//Initialize statuses for the listbox
	$scope.statuses = [
		                 { id: '', name: 'All'},
		                 { id: 'paid', name: 'Paid'},
		                 { id: 'notpaid', name: 'Not Paid'}
		               ];
	//Initialize request which stores the id for the request to be done
	//"id" can hold the license number or vehicle plate number
	$scope.request = {
				"id" : ""
			};
		//Initialize offence list
		$scope.offences = [];
		
		//
		$scope.$watch('status.id', function (newValue, oldValue) {
			//if(newValue != '')
			{
				$scope.getData();
			}
	    });
		$scope.$watch('entity.id', function (newValue, oldValue) {
			if(newValue != ''){
				$scope.request.id = "";
			}
	    });
		$scope.$watch('request.id', function (newValue, oldValue) {
			if(newValue != ''){
				$scope.getData();
			}
	    });
		/**
		 * 
		 * Get offences from server
		 * 
		 */
		$scope.getData = function(){
			//Initialize url for the request
			var url = "/api/"+$scope.entity.id+"/"+$scope.request.id+"/offences";
			if($scope.status.id != '')//If status id is not empty
			{
				//Append the url with the status
				url = url +'/' + $scope.status.id;
			}
			//Fetch offences from server
			$http.get(url).success(function(data){
				//set offences
				var offencestatus = "offences";
				if($scope.status.id == "paid"){
					offencestatus = "paid_"+offencestatus;
				}else if($scope.status.id == "notpaid")
				{
					offencestatus = "not_paid_"+offencestatus;
				}
				$scope.offences = data[$scope.entity.id][offencestatus];
			}).error(function(error) {
				//alert(error);
				console.log(error);
				//TODO Handle error
			});
		}
		//Get offence from server
		$scope.getOffence = function(){
			if($scope.request.id != "")//If request id is not empty
			{
				
			}
		}
		/**
		 * Get status string
		 * 
		 * @param boolean paid
		 */
		$scope.getStatus = function(receipt){
			//alert("Status:"+status);
			if(receipt)
			{
				return "Paid";
			}else
			{
				return "Not Paid";
			}
		};
		/**
		 * Get payment mode from reciept
		 * 
		 * @param srting payment mode
		 */
		$scope.getPaymentMode = function(receipt){
			//alert("Status:"+status);
			if(receipt)
			{
				return receipt.payment_mode;
			}else
			{
				return "-";
			}
		};
		/**
		 * Get amount from reciept
		 * 
		 * @param srting amount
		 */
		$scope.getAmount = function(receipt){
			if(receipt)
			{
				return receipt.amount;
			}else
			{
				return "-";
			}
		};
});