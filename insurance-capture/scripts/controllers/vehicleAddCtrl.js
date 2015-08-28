/**
 * Created by kelvin on 2/10/15.
 */
angular.module('rsmsaApp')
    .controller('vehicleAddCtrl',function($scope,$http){
        $scope.data = {};
        $scope.currentKaya = {};
        $scope.currentSaving = false;
        $scope.currentUpdating = false;
        $scope.currentEditting = false;
        $scope.kayaSavedSuccess = false;
        $scope.kayaUpdatedSuccess = false;
        $scope.kayaSavedFalue = false;
        $scope.kayaUpdateFalue = false;

        //getting a list options
        $http.get('../../api/optionSets.json?fields=name,code,options[name,code]&paging=false').success(function(data1){
            $scope.data.options = data1.optionSets;
            angular.forEach(data1.optionSets,function(values){
                if(values.name == "CarClass"){ $scope.data.class = values.options; }
                if(values.name == "CarColor"){ $scope.data.color = values.options;; }
                if(values.name == "CarFuel"){ $scope.data.fuel = values.options; }
                if(values.name == "CarImportCountry"){ $scope.data.countries = values.options; }
                if(values.name == "CarMake"){ $scope.data.make = values.options; }
                if(values.name == "CarModel"){ $scope.data.model = values.options; }
                if(values.name == "CarOwnershipCategory"){ $scope.data.ownership_category = values.options; }
                if(values.name == "CarYearOfMake"){ $scope.data.yom = values.options; }
                if(values.name == "DrivingClass"){ $scope.data.drivingclass = values.options; }
            })

        });

        //getting a list options
        $http.get('../../api/programs.json?filters=type:eq:3&paging=false&fields=id,name,version,programStages[id,version,programStageSections[id],programStageDataElements[dataElement[id,name,type,optionSet[id,name,options[id,name],version]]]]').success(function(data){
            $scope.data.programs = data;

        });

       //getting a list of car models
        $scope.getModels = function(make){
            $scope.data.model = [];
            console.log(make)
            angular.forEach($scope.data.options,function(values){
                if(values.name == "CarModel"){
                    angular.forEach(values.options,function(values1){
                       if(values1.code == make ){
                           $scope.data.model.push(values1);
                       }
                    })
                }
            });
        }


        //getting a list of driving classes
        $http.get('../../driving_classes').success(function(data){
            $scope.data.driving_classes = [];
            angular.forEach(data,function(classes){
                $scope.data.driving_classes.push({icon: "<img src='/img/"+classes.name+".jpg' />",name: classes.name, descr: classes.description,ticked: false})
            })

        });

        $scope.dateOptions = {
            changeYear: true,
            changeMonth: true,
            dateFormat: 'mm-dd-yy'
        };

        $scope.saveVehicle = function(vehicle){
            var dhis2Event = {
                program: "mvaPflItU7H",
                programStage: "x1FJJqkIgEV",
                status: "ACTIVE",
                orgUnit: "",
                eventDate: $scope.savingDate,
                dataValues: [
                    {
                        dataElement: 'k0UQtLZ418y',
                        value: vehicle.axial_distance
                    },{
                        dataElement: "UuCjK33fkKk",
                        value: vehicle.body_type
                    },{
                        dataElement: 'DHvqL6QEd3V',
                        value: vehicle.chasis_no
                    },{
                        dataElement:'DapKfY2rVE4',
                        value: vehicle.color
                    },{
                        dataElement: 'DwqLJhM7PJg',
                        value: vehicle.engine_capacity
                    },{
                        dataElement: 'LoyOcmeGpCz',
                        value: vehicle.engine_number
                    },{
                        dataElement: 'tqKetnXCNO3',
                        value: vehicle.fuel
                    },{
                        dataElement: 'fxmqYCVjYnY',
                        value: vehicle.gross_wheight
                    },{
                        dataElement:'iBiENuSYZul',
                        value: vehicle.make
                    },{
                        dataElement: 'zKf1OKbJKFf',
                        value: vehicle.model
                    },{
                        dataElement: 'cOtJ48WQyVZ',
                        value: vehicle.model_number
                    },{
                        dataElement: 'cWXx6oXbvIE',
                        value: vehicle.number_of_axial
                    },{
                        dataElement: 'WkkwNbDGwKx',
                        value: vehicle.ownership_category
                    },{
                        dataElement: 'I4EHCzI5Aea' ,
                        value: vehicle.seating_capacity
                    },{
                        dataElement: 'gOsv5XIprYW',
                        value: vehicle.vehicle_control_number
                    },{
                        dataElement: 'lhiAlpCwDAD',
                        value: vehicle.plate_number
                    },{
                        dataElement: 'UONX2f31yZ7',
                        value: vehicle.yom
                    }
                ]
            };
           $scope.currentSaving = true;
            $http.post("../../api/events.json", dhis2Event).success(function (newVehicle) {
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