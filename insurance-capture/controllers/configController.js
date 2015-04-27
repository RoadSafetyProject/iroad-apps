/**
 * Created by PAUL on 2/18/2015.
 */
angular.module('configApp')
    .controller('ConfigAppCtrl',function($scope,$http,$mdDialog){

        $scope.data = {};
        $id = "";
        $scope.insuranceCurrentSaving = false;
        $scope.insuranceSavedSuccess = false;
        $scope.insuranceSavedFalue = false;

//get All Apps
        $http.get('/api/config/apps').success(function(data){
            $scope.data.apps = data;

        });



//GEt all standard apps
        $http.get('/api/offence/registry').success(function(data){
            $scope.data.offenceRegs = data;

        });


//Delete the Offence
        $scope.deleteOffRegistry= function (off) {
            $scope.data.offenceRegs.splice($scope.data.offenceRegs.indexOf(off), 1);
            $http.post("/configure/off/delete", off).success(function () {

            });

        }

        $scope.deleteConfirm = function(ev,off) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete this Offence')
                .content('This action is irreversible')
                .ariaLabel('Offence Deleted')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                $scope.deleteOffRegistry(off);
            }, function() {

            });
        };


        $scope.showApp = function(ev,app) {
            $scope.selectedApp= app;
            $mdDialog.show({
                controller: APPDialogController,
                templateUrl: 'views/app_dialog.html',
                targetEvent: ev
            })
                .then(function(answer) {

                }, function() {
                });
        };


        $scope.addOffence = function(ev) {
            $mdDialog.show({
                controller: OffDialogController,
                templateUrl: 'views/addOffence.html',
                targetEvent: ev
            })
                .then(function(answer) {

                }, function() {
                });
        }

        $scope.showOffence = function(ev,offence) {
            $scope.selectedOffence= offence;
            $mdDialog.show({
                controller: OffDialogController,
                templateUrl: 'views/offence_dialog.html',
                targetEvent: ev
            })
                .then(function(answer) {

                }, function() {
                });
        };

        //Fetch driver information given the license number.
        $scope.getStandard = function ($selection) {

            $http.get('/api/config/standards/' + $selection)
                .success(function (data) {
                    $scope.data.standard = data;
                    console.log(data);
                }).error(function (error) {
                    //alert(error);
                    console.log(error);
                });
        }



    });





function APPDialogController($scope, $mdDialog,$http) {
    $scope.app = angular.element("#listTable").scope().selectedApp;
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };


    $scope.updateApp = function(app){
        $scope.AppCurrentSaving = true;
        $http.post("/configure/app/update/" ,app)

            .success(function (newApp) {
            console.log(newApp);
            $scope.AppSavedSuccess = true;
            $scope.AppCurrentSaving = false;
            $scope.AppSavedFailure = false;

        }).error(function(error){
            console.log('error');
            $scope.AppSavedSuccess = false;
            $scope.AppCurrentSaving = false;
            $scope.AppSavedFailure = true;
        });
    }

    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}

function OffDialogController($scope, $mdDialog,$http) {
    $scope.off = angular.element("#listTable").scope().selectedOffence;
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };




    $scope.saveOffence = function(offence){
        $scope.offenceCurrentSaving = true;
        $http.post("/configure/offence/save", offence).success(function (newOffence) {

            console.log(newOffence);
            $scope.newOffence = {};
            $scope.offenceSavedSuccess = true;
            $scope.offenceCurrentSaving = false;
            $scope.offenceSavedFailure = false;
        })
            .error(function(){
                $scope.offenceSavedSuccess = false;
                $scope.offenceCurrentSaving = false;
                $scope.offenceSavedFailure = true;
            });
    }

    $scope.updateOffence = function(offence){
        $scope.offCurrentSaving = true;
        $http.post("/configure/offence/update/", offence).success(function (newOffence) {

            console.log(newOffence);
            $scope.newOffence = {};
            $scope.offSavedSuccess = true;
            $scope.offCurrentSaving = false;
            $scope.offSavedFailure = false;

        }).error(function(){
            $scope.offSavedSuccess = false;
            $scope.offCurrentSaving = false;
            $scope.offSavedFailure = true;
        });
    }
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}
