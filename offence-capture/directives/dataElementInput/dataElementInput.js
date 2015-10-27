angular.module('eventCapture').directive('elementInput', function ($modal) {
	
	var controller = ['$scope',function ($scope) {
        function init() {
            $scope.items = angular.copy($scope.datasource);
        }

        init();
        model = new iroad2.data.Modal();
        $scope.functions = {};
        $scope.dataElement = model.getDataElementByName($scope.ngDataElementName);
        
        $scope.response = {status:"",message:"Does Not Exist"};
        angular.forEach($scope.dataElement.attributeValues,function(attributeValue){
        	if(attributeValue.attribute.name == "Function"){
        		console.log(JSON.stringify(attributeValue.value.replace("\n","").replace("\t","").replace("\"","'")));
        		$scope.functions = eval("(" + attributeValue.value+ ')');
        	}
        })
        $scope.dataElement.attributeValues[0]
        $scope.functions = {
        	checkIfDriverExists:function(input,response){
        		driverEventModal = new iroad2.data.Modal("Driver",[]);
        		driverEventModal.get(new iroad2.data.SearchCriteria("Driver License Number","=",input),function(result){
        			if(result.length > 0){
        				response.status = "SUCCESS";
        				response.message = "The license number is valid";
        			}else{
        				console.log($scope.response);
        				response.status = "ERROR";
        				response.message = "The license number does not exist";
        				
        			}
        			$scope.$apply();
        			console.log(JSON.stringify(result));
        		})
        	},
        	showDriverInfo:function(input){
                // alert(events.dataValues['Gender'].value);
        		driverEventModal = new iroad2.data.Modal("Driver",[]);
        		driverEventModal.get(new iroad2.data.SearchCriteria("Driver License Number","=",input),function(result){
        			if(result.length > 0){
        				var driver = driverEventModal.convertToEvent("Driver",result[0],{});
        				var modalInstance = $modal.open({
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
        				response.status = "SUCCESS";
        				response.message = "The license number is valid";
        			}else{
        				console.log($scope.response);
        				response.status = "ERROR";
        				response.message = "The license number does not exist";
        				
        			}
        			$scope.$apply();
        			console.log(JSON.stringify(result));
        		})
                 
             },
        	actions:[{name:"Driver Exists",functionName:"checkIfDriverExists"},{name:"View Driver Details",functionName:"showDriverInfo"}],
        	events:{}
        }
        $scope.envoke = function(functionName){
        	$scope.response.status = "LOADING";
        	$scope.functions[functionName]($scope.ngModel,$scope.response);
        }

    }];
    return {
        restrict: 'AEC',
        scope: {
            //actions:actions,
            ngModel: '=',
            ngDataElementName:'='
        },
        controller: controller,
        templateUrl: 'directives/dataElementInput/dataElementInput.html'
    };
})