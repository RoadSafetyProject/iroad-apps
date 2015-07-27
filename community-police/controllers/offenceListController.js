angular.module('rsmsaApp').controller('offenceListController',function($scope,$http,$routeParams) {
		$scope.offenceList = [];
		$scope.onInitialize = function(){
			
			if($routeParams.id){//If there is an id on the route
				
				//Fetch
				$http.get("/api/offence/registry/"+$routeParams.id+"/offences").success(function(data) {
					$scope.offenceList = data;
				});
			}else if($routeParams.license){
				$http.get("/api/driver/"+$routeParams.license+"/offences").success(function(data) {
					$scope.offenceList = data.offences;
				});
			}else if($routeParams.plate_number){
				$http.get("/api/vehicle/"+$routeParams.plate_number+"/offences").success(function(data) {
					$scope.offenceList = data.offences;
				});
			}else
			{
				var offenceModal = new dhis2.data.Modal("Offence Event",[]);
				offenceModal.getAll(function(result){
					$scope.offenceList = result;
					$scope.$apply();
				});
			}
		};
		/*var config = 
			{
				baseUrl:"/dhis/",
				refferencePrefix:"Program_",
				onLoad : function(){
					$scope.onInitialize();
				}
			};*/
		dhisConfigs.onLoad = function(){
			$scope.onInitialize();
		}
		dhis2.Init(dhisConfigs);
		
		
		/**
		 * Delete offence
		 * 
		 * @param Object(Offence) offence
		 */
		$scope.deleteOffence = function(offence){
			if(confirm("Are you sure you want to delete this offence"))//If confrims deletion
			{
				//Delete offence from the server
				$http.get("/api/offence/"+offence.id+"/delete/").success(function(data){
					//Remove the deleted offence from the offenceList Model.
					for(i = 0;i < $scope.offenceList.length;i++)
					{
						if($scope.offenceList[0].id = offence.id)//If offence is in the list
						{
							//Delete offence
							$scope.offenceList.splice(i,1);
							break;
						}
					}
					
				}).error(function(error) {
					//TODO Handle error
				});
			}
			
		};
});
