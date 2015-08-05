/**
 * Created by kelvin on 3/13/15.
 */
angular.module('rsmsaApp')
    .controller('singleCarController',
    function($scope, $routeParams ,$http) {
        $scope.car = {};
        if($routeParams.id){//If there is an id on the route
            //Fetch
            $http.get("/vehicle/"+$routeParams.id).success(function(data) {
                $scope.car = data;
                //getting offences
                $http.get("/api/vehicle/"+data.plate_number+"/offences").success(function(data) {
                    $scope.car.offences = data.offences;
                });
                //getting insurance
                $http.get("/vehicle/insurance/"+data.plate_number).success(function(data) {
                   $scope.car.insurance = data;
                });

                //getting insurance
                $http.get("/vehicle/road_license/"+data.plate_number).success(function(data) {
                   $scope.car.roadLicence = data;
                });

                //getting insurance
                $http.get("/vehicle/bus_license/"+data.plate_number).success(function(data) {
                   $scope.car.busLicence = data;
                });

                //getting insurance
                $http.get("/vehicle/inspection/"+data.plate_number).success(function(data) {
                   $scope.car.inspection = data;
                });

                //getting accidents inforamation
                $http.get("/accidents/vehicle/"+data.plate_number).success(function(data2) {
                    $scope.car.accidents = data2;
                });
            });
        }
    });