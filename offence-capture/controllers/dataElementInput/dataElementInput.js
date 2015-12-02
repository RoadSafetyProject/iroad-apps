angular.module('eventCaptureControllers', []).directive('dataElementInput',function(){
	var controller = ['$scope',function ($scope) {
        function init() {
            $scope.items = angular.copy($scope.datasource);
        }

        init();

    }];
    return {
        restrict: 'AEC',
        require: '^ngModel',
        scope: {
            //actions:actions,
            ngModel: '='
        },
        controller: controller,
        templateUrl: 'dataElementInput.html'
    }

})