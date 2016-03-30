/**
 * Created by kelvin on 2/20/15.
 */
angular.module('rsmsaApp')
    .controller('insuranceAddCtrl',function($scope,$http){
        $scope.data = {};
        $scope.currentKaya = {};
        $scope.currentSaving = false;
        $scope.currentUpdating = false;
        $scope.currentEditting = false;
        $scope.kayaSavedSuccess = false;
        $scope.kayaUpdatedSuccess = false;
        $scope.kayaSavedFalue = false;
        $scope.kayaUpdateFalue = false;

        $http.get('/api/insurance/companies').success(function(data){
            $scope.data.insurance = data;
        });

        $http.get('../../vehicle').success(function(data){
            $scope.data.vehicles = data;
        });

        $scope.changeCar = function(car,cars){
            $scope.currCar = null;
            angular.forEach(cars,function(value){
                if(value.plate_number == car){
                    $scope.currCar = value;
                }
            })
        }

        $scope.checkCar = function(car,cars){
            if(car && car != ""){
                if(car.length > 5){
                    angular.forEach(cars,function(value){
                        if(value.plate_number == car){
                            $scope.currCar = value;
                            //getting insurance
                            $http.get("/vehicle/insurance/"+value.plate_number).success(function(data) {
                                $scope.currCar.insurance = data;
                                if($scope.currCar.insurance.length != 0){
                                    $scope.dateOptions.minDate =  new Date(data[0].end_date);
                                    $scope.currentKaya.start_date =  data[0].end_date;
                                }
                            });

                            //getting insurance
                            $http.get("/vehicle/road_license/"+value.plate_number).success(function(data) {

                            });
                        }
                    })
                }
            }
        }
        $scope.dateOptions = {
            changeYear: true,
            changeMonth: true,
            dateFormat: 'mm-dd-yy'
        };


        $scope.saveVehicleInsurance = function(Insurance){
            $scope.currentSaving = true;
            $http.post("../../vehicle/insurance", Insurance).success(function (newVehicle) {
                $scope.currentKaya = {};
                $scope.kayaSavedSuccess = true;
                $scope.currentSaving = false;
                $scope.kayaSavedFalue = false;
            }).error(function(){
                $scope.kayaSavedSuccess = false;
                $scope.currentSaving = false;
                $scope.kayaSavedFalue = true;
            });
        }



    });