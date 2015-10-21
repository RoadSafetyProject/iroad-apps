angular.module('eventCapture').directive('elementInput', function () {
	
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
        		offenceEventModal = new iroad2.data.Modal("Driver",[]);
        		offenceEventModal.get(new iroad2.data.SearchCriteria("Driver License Number","=",input),function(result){
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
        	actions:[{name:"Driver Exists",functionName:"checkIfDriverExists"},{name:"View Driver Details",functionName:"showDriver"}],
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