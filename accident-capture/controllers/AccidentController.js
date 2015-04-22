/**
 * Created by PAUL on 2/1/2015.
 */

//Controller to handle accident form .
angular.module("accidentApp")

    .controller('DateController', function($scope) {

        //options for angular date picker
        $scope.dateOptions = {
            changeYear: true,
            changeMonth: true,
            yearRange: '1900:-0'
        }
    })
    .controller('AccidentFormCtrl' , function($scope,$http){

 $scope.accident={
     "accident_reg_no":"",
     "class":"",
     "ocs_check":"",
     "supervisor_check":"",
     "PoliceProgramId":"",
     "police_station":"",
     "station_region":"",
     "office1_name": "",
     "office1_rank_no" : "",
     "dt":"",
     "fatal":"",
     "simple":"",
     "station_district":"",
     "cause":"",
     "weather":"",
     "severe":"",
     "damage":"",
     "latitude":"",
     "longitude":"",
     "hit":"",
     "area_name":"",
     "road_name":"",
     "intersection_name":"",
     "region":"",
     "road_no":"",
     "intersection_no":"",
     "district":"",
     "road_mark":"",
     "intersection_mark":"",
     //vehicle details
     "vehicle_fatal":"",
     "vehicle_severe":"",
     "vehicle_simple":"",
     "vehicle_not_injured":"",
     //driver details
     "DriverProgramId":"",
     "driver_license_id" : "",
     "driver1_surname":"",
     "driver1_othernames":"",
     "driver1_p_add":"",
     "driver1_address":"",
     "driver1_national_id":"",
     "driver1_gender":"",
     "driver1_phone_no":"",
     "driver1_dob":"",
     "driver1_nationality":"",
     "driver_severity":"",
     "driver_phone_use":"",
     "driver1_occupation":"",
     "driver1_alcohol":"",
     "seat_belt":"",
     //detailed vehicle details
     "VehicleProgramId":"",
     "vehicle_reg_no":"",
     "vehicle_type":"",
     "vehicle_owner_name":"",
     "vehicle_owner_nationality":"",
     "vehicle_owner_p_addr":"",
     "vehicle_owner_address":"",
     "vehicle_damage":"",
     "vehicle_yom":"",
     "vehicle_chasis_no":"",
     //insurance details
     "insurance_company_name" : "",
     "insurance_company_type":"",
     "insurance_company_phone":"",
     "insurance_policy_no":"",
     "insurance_exp_date":"",
     "insurance_est_repair":"",
     //passenger
     "passenger_name":"",
     "passenger_gender":"",
     "passenger_dob":"",
     "passenger_p_address":"",
     "passenger_address":"",
     "passenger_nationality":"",
     "passenger_phone":"",
     "passenger_alcohol":"",
     "passenger_seat_belt":"",
     "passenger_casuality":"",
     //witness
     "witness_name":"",
     "witness_gender":"",
     "witness_dob":"",
     "witness_p_address":"",
     "witness_address":"",
     "witness_nationality":"",
     "witness_phone":""
 };

        $scope.accidentCurrentSaving = false;
        $scope.accidentSavedSuccess = false;
        $scope.accidentSavedFalue = false;

    //Function to handle Accident form submission

    $scope.sendAccident = function(accident){

        //get Police Program UID for the given Police
        event ={
            "program": "cEz9CBPr9gV",
            "orgUnit": "ij7JMOFbePH",
            "eventDate": accident.dt,
            "status": "COMPLETED",
            "storedBy": "admin",
            "coordinate": {
                "latitude": accident.latitude,
                "longitude": accident.longitude
            },
            "dataValues": [
                //Police
                { "dataElement": "G4b6VFkzFvr", "value": accident.PoliceProgramId },
                { "dataElement": "A3FpQZtWUIp", "value": accident.DriverProgramId },
                { "dataElement": "mn434pDp3x5", "value": accident.VehicleProgramId },
                //accident registration number
                {"dataElement": "V3ewbUX7Fbx", "value": accident.accident_reg_no },
                //accident cause
                {"dataElement": "IcWaz62i2nW", "value": accident.cause },
                 //Accident Class
                { "dataElement": "UzMI8ML55mk", "value": accident.class },
                //Time of Accident
                { "dataElement": "mn6GnuTJvwu", "value": accident.dt },
                //Weather
                { "dataElement": "fpprUTxfRtj", "value": accident.weather },
                //Number of Severe Injuries
                { "dataElement": "c2wuqWKEqot", "value": accident.severe },
                //Number of Fatal Injuries
                { "dataElement": "Hvf0nmC7mjY", "value": accident.fatal },
                //Accident Type
                { "dataElement": "zYBDkbKKUpV", "value": accident.class},
                //Accident Type Detail
                { "dataElement": "IdY95tm1s7t", "value": "This is a" + accident.class  },
                //Number of Simple Injuries
                { "dataElement": "QSOlea66Zu0", "value": accident.simple },
                //Road Number
                { "dataElement": "fUZCWulnQTc", "value": accident.road_no },
                //Intersection Name
                { "dataElement": "RnwIFcYOjCA", "value": accident.intersection_name},
                //Intersection Number
                { "dataElement": "NTg7sm8UmNr", "value": accident.intersection_no },
                //Road Name
                { "dataElement": "HLpX7AwkZv9", "value": accident.road_name},
                //Latitude
                { "dataElement": "zhotUjwW8hR", "value": accident.latitude },
                //Longitude
                { "dataElement": "zd5RdgHHbTD", "value": accident.longitude },
                //Area of Accident
                { "dataElement": "qYWbTt1tVxb", "value": accident.area_name },
                //Supervisor Check
                { "dataElement": "v2T0L21HxG8", "value": accident.supervisor_check },
                //Road Mark
                { "dataElement": "DfQeMJyi8yh", "value": accident.road_mark },
                //OCS Check
                { "dataElement": "a6pJtqxNbwA", "value": accident.ocs_check },
                //Signature
                { "dataElement": "jDMX86W1lTA", "value": "signature" },
                //Intersection Mark
                { "dataElement": "Re89Y4L7pvG", "value": accident.intersection_mark }
            ]

        };
           console.log(JSON.stringify(event));
        //send an accident event
        $http.post('/demo/api/events' , event).
            success(function(data) {
                // this callback will be called asynchronously
                // when the response is available
                console.log("data");
                $scope.accidentCurrentSaving = false;
                $scope.accidentSavedSuccess = true;
                $scope.accidentSavedFalue = false;
            }).
            error(function(error) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log(error);
                $scope.accidentCurrentSaving = false;
                $scope.accidentSavedSuccess = false;
                $scope.accidentSavedFailure = true;
            });
    }






//get police information given the rank number
    $scope.getPolice = function() {

        $scope.onInitialize = function(){
            policeDetails = [];
            var policeModal = new dhis2.data.Modal("Police",[]);
            policeModal.get({value:$scope.accident.office1_rank_no},function(result){

                console.log(JSON.stringify(result));

                result.forEach(function(entry){
                    policeDetails = entry;
                    $scope.accident.police_station= "station";
                    $scope.accident.station_region = "region";
                    $scope.accident.station_district = "district";
                    $scope.accident.office1_name = entry.Person['First Name'] + " " + entry.Person['Last name'];
                    $scope.accident.PoliceProgramId = entry.id;
                });

            });

        };
        dhisConfigs.onLoad = function(){
            $scope.onInitialize();
        }
        dhis2.Init(dhisConfigs);

    }

    //Fetch driver information given the license number.
    $scope.getDriver = function() {

        $scope.onInitialize = function(){

            var driverModal = new dhis2.data.Modal("Driver",[]);
            driverModal.get({value:$scope.accident.driver_license_id},function(result){

                console.log(JSON.stringify(result));

                result.forEach(function(entry){

                    $scope.accident.driver1_surname = entry.Person['First Name'];
                    $scope.accident.driver1_othernames = entry.Person['Middle Name'] + " "+ entry.Person['Last name'];
                    $scope.accident.driver1_p_add = entry.Person['Postal Address'];
                    $scope.accident.driver1_address = entry.Person['Postal Address'];
                    $scope.accident.driver1_national_id = entry.Person['Nationality'];
                    $scope.accident.driver1_gender = entry.Person['Gender'];
                    $scope.accident.driver1_phone_no = entry.Person['Phone Number'];
                    $scope.accident.driver1_dob = entry.Person['Date of Birth'];
                    $scope.accident.driver1_nationality = entry.Person['Nationality'];
                    $scope.accident.driver1_occupation = "Driver";
                    $scope.accident.DriverProgramId = entry.id;
                });
            });

        };
        dhisConfigs.onLoad = function(){
            $scope.onInitialize();
        }
        dhis2.Init(dhisConfigs);

    }


    //Fetch vehicle information given the plate number.
    $scope.getVehicle = function() {

        $scope.onInitialize = function(){

            var vehicleModal = new dhis2.data.Modal("Vehicle",[]);
            vehicleModal.get({value:$scope.accident.vehicle_reg_no},function(result){

                console.log(JSON.stringify(result));

                result.forEach(function(entry){
                    $scope.accident.vehicle_type = entry.Make;
                    $scope.accident.vehicle_chasis_no = entry['Chasis Number'];
                    $scope.accident.vehicle_yom = entry['Year of Make'];
                    $scope.accident.VehicleProgramId = entry.id;

                });


            });

        };
        dhisConfigs.onLoad = function(){
            $scope.onInitialize();
        }
        dhis2.Init(dhisConfigs);

        //DHIS2 END
        $http.get("/api/accident/vehicle/plate/" + $scope.accident.vehicle_reg_no)
            .success(function(data) {
                console.log(data[0]);
                $scope.vehicle_type = data[0].make;
                $scope.vehicle_owner_name = data[0].owner_name;
                $scope.vehicle_owner_nationality = data[0].owner_nationality;
                $scope.vehicle_owner_p_addr = data[0].owner_physical_address;
                $scope.vehicle_owner_address = data[0].owner_address;
                $scope.vehicle_yom = data[0].yom;
                $scope.vehicle_chasis_no = data[0].chasis_no;


            }).error(function(error) {
                //alert(error);
                console.log(error);
            });
    }

});

