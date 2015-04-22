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

        //getting a list of countries
        $http.get('../../countries').success(function(data){
            $scope.data.countries = data;
        });

        //getting a list of vehicle ownership category
        $http.get('../../ownership_category').success(function(data){
            $scope.data.ownership_category = data;
        });

      //getting a list of car makes
        $http.get('../../car_make').success(function(data){
            $scope.data.make = data;
        });

        //getting a list of car makes
        $http.get('../../car_year').success(function(data){
            $scope.data.yom = data;
        });

       //getting a list of car models
        $scope.getModels = function(make){
            $http.get('../../car_model/'+make).success(function(data){
                $scope.data.model = data;
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
           $scope.currentSaving = true;
            $http.post("../../vehicle", vehicle).success(function (newVehicle) {
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