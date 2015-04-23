/**
 * Created by PAUL on 3/18/2015.
 */

angular.module('configApp')
    .controller('InspectionController',function($scope,$http,$mdDialog){

        $scope.data = {};
        $http.get('/config/vehicle/model').success(function(data){
            $scope.data.vehicle = data;

        });
//Delete the vehicle company
        $scope.deleteVehicle= function (vehicle) {
            $scope.data.vehicle.splice($scope.data.vehicle.indexOf(vehicle), 1);
            $http.post("/configure/vehicle/delete", vehicle).success(function () {

            });

        }

        $scope.deleteConfirm = function(ev,vehicle) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete this Insurance Company')
                .content('This action is irreversible')
                .ariaLabel('Insurance Deleted')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                $scope.deleteInsurance(vehicle);
            }, function() {

            });
        };

        $scope.addVehicleModel= function(ev) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'views/add_vehicle.html',
                targetEvent: ev
            })
                .then(function(answer) {

                }, function() {
                });
        }

        $scope.showVehicle = function(ev,vehicle) {
            $scope.selectedVehicle = vehicle;
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'views/vehicle_dialog.html',
                targetEvent: ev
            })
                .then(function(answer) {

                }, function() {
                });
        };
    });

function DialogController($scope, $mdDialog,$http) {
    $scope.vehicle = angular.element("#listTable").scope().selectedVehicle;
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    $scope.saveVehicle = function(vehicle){
        $scope.vehicleCurrentSaving = true;
        $http.post("/config/vehicle/save", vehicle).success(function (newVehicle) {

            console.log(newVehicle);
            $scope.newVehicle = {};
            $scope.vehicleSavedSuccess = true;
            $scope.vehicleCurrentSaving = false;
            $scope.vehicleSavedFailure = false;
        })
            .error(function(){
                $scope.vehicleSavedSuccess = false;
                $scope.vehicleCurrentSaving = false;
                $scope.vehicleSavedFailure = true;
            });
    }

    $scope.updateVehicle = function(vehicle){
        $scope.vehicleCurrentSaving = true;
        $http.post("/configure/vehicle/update/", vehicle).success(function (newVehicle) {

            console.log(newVehicle);
            $scope.newVehicle = {};
            $scope.vehicleSavedSuccess = true;
            $scope.vehicleCurrentSaving = false;
            $scope.vehicleSavedFailure = false;

        }).error(function(){
            $scope.vehicleSavedSuccess = false;
            $scope.vehicleCurrentSaving = false;
            $scope.vehicleSavedFailure = true;
        });
    }
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}
