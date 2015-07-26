/**
 * Created by kelvin on 2/27/15.
 */
angular.module('rsmsaApp')
    .controller('licenceCtrl',function($scope,$http,$mdDialog){
        $scope.data = {};
        $scope.currentKaya = {};
        $scope.currentSaving = false;
        $scope.currentUpdating = false;
        $scope.currentEditting = false;
        $scope.kayaSavedSuccess = false;
        $scope.kayaUpdatedSuccess = false;
        $scope.kayaSavedFalue = false;
        $scope.kayaUpdateFalue = false;

        $http.get('../../vehicle').success(function(data){
            $scope.data.vehicles = data;
        });

        $scope.checkCar = function(car,cars){
            $scope.currCar = null;
            if(car && car != ""){
                if(car.length > 5){
                    angular.forEach(cars,function(value){
                        if(value.plate_number == car){
                            $scope.currCar = value;
                            //getting insurance
                            $http.get("/vehicle/insurance/"+value.plate_number).success(function(data) {
                                $scope.currCar.insurance = data;
                            });

                            //getting insurance
                            $http.get("/vehicle/road_license/"+value.plate_number).success(function(data) {
                                $scope.currCar.roadLicence = data;
                                $scope.dateOptions.minDate =  new Date(data[0].end_date);
                                $scope.currentKaya.start_date =  data[0].end_date;
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


        $scope.saveVehicleLicence = function(Licence){
            $scope.currentSaving = true;
            $http.post("../../vehicle/road_licence", Licence).success(function (newVehicle) {
                $scope.currentKaya = {};
                $scope.kayaSavedSuccess = true;
                $scope.currentSaving = false;
                $scope.kayaSavedFalue = false;
                $scope.currCar = null;
            }).error(function(){
                $scope.kayaSavedSuccess = false;
                $scope.currentSaving = false;
                $scope.kayaSavedFalue = true;
            });
        }
        $scope.saveBussinesLicence = function(Licence){
            $scope.currentSaving = true;
            $http.post("../../vehicle/business_licence", Licence).success(function (newVehicle) {
                $scope.currentKaya = {};
                $scope.kayaSavedSuccess = true;
                $scope.currentSaving = false;
                $scope.kayaSavedFalue = false;
                $scope.currCar = null;
            }).error(function(){
                $scope.kayaSavedSuccess = false;
                $scope.currentSaving = false;
                $scope.kayaSavedFalue = true;
            });
        }

    }).controller('ViewAccidentController', ['$scope', '$routeParams','$http',
        function($scope, $routeParams ,$http) {
            $accident_id = $routeParams.accident_id;
            $scope.accidents = {};

            $http.get("/api/accident/" + $routeParams.accident_id)
                .success(function(data) {
                    console.log(data[0]);
                    $scope.accident_no = data[0].accident_reg_number;
                    $scope.ocs_check = data[0].ocs_check;
                    $scope.supervisor_check = data[0].ocs_check;
                    $scope.sign_date = data[0].sign_date;
                    $scope.accident_fatal = data[0].accident_fatal;
                    $scope.accident_severe_injury = data[0].accident_severe_injury;
                    $scope.accident_simple_injury = data[0].accident_simple_injury;
                    $scope.accident_only_damage = data[0].accident_only_damage;
                    $scope.latitude = data[0].latitude;
                    $scope.longitude = data[0].longitude;
                    $scope.alcohol = data[0].alcohol;
                    $scope.seat_belt = data[0].seat_belt;
                    $scope.phone_use = data[0].phone_use;
                    $scope.cause = data[0].cause;
                    $scope.weather = data[0].weather;
                    $scope.hit_run = data[0].hit_run;
                    $scope.accident_date_time = data[0].accident_date_time;
                    $scope.accident_area = data[0].accident_area;
                    $scope.area_region = data[0].area_region;
                    $scope.area_district = data[0].area_district;
                    $scope.road_name = data[0].road_name;
                    $scope.road_number = data[0].road_number;
                    $scope.road_mark = data[0].road_mark;
                    $scope.intersection_name = data[0].intersection_name;
                    $scope.intersection_number = data[0].intersection_number;
                    $scope.intersection_mark = data[0].intersection_mark;
                    $scope.vehicle_severe_injury = data[0].vehicle_severe_injury;

                    //get passenger details on this accident
                    $scope.pass_name = data[0].pass_name;
                    $scope.pass_gender = data[0].pass_gender;
                    $scope.pass_dob = data[0].pass_dob;
                    $scope.pass_physical_address = data[0].pass_physical_address;
                    $scope.pass_address = data[0].pass_address;
                    $scope.pass_national_id = data[0].pass_national_id;
                    $scope.pass_phone_number = data[0].pass_phone_number;
                    $scope.pass_alcohol = data[0].pass_alcohol;
                    $scope.pass_seat_belt = data[0].pass_seat_belt;
                    $scope.pass_casuality = data[0].pass_casuality;

                    //get witness details on this accident
                    $scope.witness_name = data[0].witness_name;
                    $scope.witness_gender = data[0].witness_gender;
                    $scope.witness_dob = data[0].witness_dob;
                    $scope.witness_physical_address = data[0].witness_physical_address;
                    $scope.witness_address = data[0].witness_address;
                    $scope.witness_national_id = data[0].witness_national_id;
                    $scope.witness_phone_number = data[0].witness_phone_number;

                    //get police info

                    $rank = data[0].rank_no;
                    $http.get("/accident/police/" + $rank)
                        .success(function(police) {
                            console.log(police[0]);
                            $scope.police_name = police[0].first_name + " " + police[0].last_name;
                            $scope.police_station = police[0].name;
                            $scope.station_district = police[0].district;
                            $scope.station_region = police[0].region;
                            $scope.rank_no = police[0].rank_no;

                        }).error(function(error) {
                            console.log(error);
                        });


                    //driver details
                    $driver_id = data[0].driver_id;
                    $scope.drivers_id = $driver_id;
                    $http.get("/api/accident/driver/" + $driver_id)
                        .success(function(driver) {
                            console.log(driver[0]);
                            $scope.license_number = driver[0].license_number;
                            $scope.first_name = driver[0].first_name;
                            $scope.last_name = driver[0].last_name;
                            $scope.physical_address = driver[0].physical_address;
                            $scope.address = driver[0].address;
                            $scope.national_id = driver[0].national_id;
                            $scope.gender = driver[0].gender;
                            $scope.birthdate = driver[0].birthdate;
                            $scope.nationality = driver[0].nationality;
                            $scope.phone_number = driver[0].phone_number;
                            $scope.occupation = driver[0].occupation;


                        }).error(function(error) {
                            console.log(error);
                        });

                    //vehicle details
                    $vehicle_id = data[0].vehicle_id;
                    $scope.cars_id = $vehicle_id;
                    $http.get("/api/accident/vehicle/" + $vehicle_id)
                        .success(function(vehicle) {
                            console.log(vehicle[0]);
                            $scope.plate_number = vehicle[0].plate_number;
                            $scope.owner_name = vehicle[0].owner_name;
                            $scope.owner_nationality = vehicle[0].owner_nationality;
                            $scope.owner_physical_address = vehicle[0].owner_physical_address;
                            $scope.owner_address = vehicle[0].owner_address;
                            $scope.make = vehicle[0].make;
                            $scope.yom = vehicle[0].yom;
                            $scope.chasis_no = vehicle[0].chasis_no;

                        }).error(function(error) {
                            console.log(error);
                        });

                }).error(function(error) {
                    console.log(error);
                });



        }]).controller('ViewBusinessController', ['$scope', '$routeParams','$http',
        function($scope, $routeParams ,$http) {
            $inspection_id = $routeParams.bus_id;
            $scope.currentKaya = {};

            $http.get("/bus_license/" + $routeParams.bus_id)
                .success(function(data) {
                    $scope.currentKaya = data;
                    $http.get('../../vehicle').success(function(data1){
                        angular.forEach(data1,function(value){
                            if(value.plate_number == data.car_id){
                                $scope.currCar = value;
                            }
                        })
                    });
                });

        }]);