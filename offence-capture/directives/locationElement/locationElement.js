angular.module('eventCapture').directive('locationElement', function ($timeout) {
	
	var controller = ['$scope',function ($scope) {
        function init() {
            $scope.items = angular.copy($scope.datasource);
        }

        init();
        if(!$scope.ngCoordinate){
        	$scope.ngCoordinate = {latitude:-6.771339, longitude:39.239913,};
        }
        $scope.marker = {
        	    location: $scope.ngCoordinate,
        	    locationName: $scope.ngModel,
        	    radius: 0,
        	    zoom: 10,
        	    scrollwheel: true,
        	    inputBinding: {
        	        latitudeInput: null,
        	        longitudeInput: null,
        	        radiusInput: null,
        	        locationNameInput: $('#locationName')
        	    },
        	    enableAutocomplete: false,
        	    enableReverseGeocode: true,
        	    onchanged: function (currentLocation, radius, isMarkerDropped) {
        	        var addressComponents = $(this).locationpicker('map').location.addressComponents;
        	        console.log(JSON.stringify(addressComponents));
        	        $scope.ngModel = addressComponents.stateOrProvince +"," +addressComponents.addressLine1 +"," + +"," +addressComponents.addressLine2;
        	        $scope.ngCoordinate = currentLocation;
        	    }
        	}

    	
        $scope.toggleMadel = function(){
        	$('#locationModal').modal('toggle');
        	$timeout($scope.loadMap, 1000);
        }
        $scope.loadMap = function(){
        	
        	$('#somecomponent').locationpicker($scope.marker);
        }
    }];
    return {
        restrict: 'AEC',
        scope: {
            //actions:actions,
            ngModel: '=',
            ngCoordinate: '=',
            ngDataElementName:'='
        },
        controller: controller,
        templateUrl: '../offence-capture/directives/locationElement/locationElement.html'
    };
})