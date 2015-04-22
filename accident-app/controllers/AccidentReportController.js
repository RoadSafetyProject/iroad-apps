/**
 * Created by PAUL on 2/10/2015.
 */
angular.module('accidentApp')
    .controller('AccidentReportController' , function($scope,$http){

        $scope.selected_region = {

            "id" : "",
            "name" : ""
        }

        $scope.selected_district = {

            "id" : "",
            "name" : ""
        }

        $scope.accident = {

            "accident_total" : 0,
            "driver_killed_total" :0,
            "driver_injured_total" : 0,
            "passenger_killed_total" : 0,
            "passenger_injured_total" : 0,
            "pedestrians_killed_total" : 0,
            "pedestrians_injured_total" : 0,
            "motor_cyclists_killed_total" :0,
            "motor_cyclists_injured_total" : 0,
            "rickshawers_killed_total" : 0,
            "rickshawers_injured_total" : 0,
            "killed_total" :0,
            "injured_total" : 0,
            "pedal_killed_total" : 0,
            "pedal_injured_total" : 0
        };

        $http.get('/api/regions')
            .success(function(data){
                $scope.regions = data;
                console.log(data[0]);
            })
            .error(function(error) {
                console.log(error);
            });

        $scope.getDistrict = function(){
            $http.get('/accident/region/' + $scope.selected_region.name)
                .success(function(data){
                    $scope.districts = data;
                    console.log(data);
                }).error(function(error) {
                    console.log(error);
                });
        }

        $scope.getAccidentReport = function() {

            $http.get('/api/accidents/' + $scope.accident_class + '/' + $scope.selected_district.name + '/' + $scope.report_year)

                .success(function (data) {
                    $scope.accident = data;
                    $scope.accident.accident_total = data.length;
                    console.log(data[0]);
                })
                .error(function (error) {
                    console.log(error);
                });
        }

    }
)
    .controller('DateController', function($scope){

        //options for angular date picker
        $scope.dateOptions = {
            changeYear: true,
            changeMonth: true,
            yearRange: '1900:-0'
        };


    });