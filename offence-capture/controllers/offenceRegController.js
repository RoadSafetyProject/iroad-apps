/**
 * Offence registry controller to show all the registry and enable viewing of their corresponding offences
 * 
 * @author Vincent P. Minde
 * 
 */
angular.module('rsmsaApp').controller('offenceRegController',function($scope,$http) {
		//Initialize offence registry
		$scope.offenceRegs = {};
		var offRegistry = new dhis2.data.Modal("Offence Registry",[]);
		offRegistry.getAll(function(results){
			$scope.offenceRegs = results;
			$scope.$apply();
		});
		//Fetch offence registry
		$http.get("/api/offence/registry").success(function(data) {
			$scope.offenceRegs = data;
			
		}).error(function(error) {
			//TODO Handle Error
		});
});