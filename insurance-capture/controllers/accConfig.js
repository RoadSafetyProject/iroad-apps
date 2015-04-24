/**
 * Created by PAUL on 3/12/2015.
 */
/**
 * Created by paul on 1/29/15.
 */
angular.module('configApp')
    .controller('AccConfigCtrl',function($scope,$http,$mdDialog) {

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


        $scope.addClass = function(ev) {
            $mdDialog.show({
                controller: ClassDialogController,
                templateUrl: 'views/add_class.html',
                targetEvent: ev
            })
                .then(function(answer) {

                }, function() {
                });
        }

        $scope.addCause = function(ev) {
            $mdDialog.show({
                controller: ClassDialogController,
                templateUrl: 'views/add_cause.html',
                targetEvent: ev
            })
                .then(function(answer) {

                }, function() {
                });
        }
        $scope.showClass = function(ev,Acc_class) {
            $scope.selectedClass= Acc_class;
            $mdDialog.show({
                controller: ClassDialogController,
                templateUrl: 'views/class_dialog.html',
                targetEvent: ev
            })
                .then(function(answer) {

                }, function() {
                });
        };

});

function ClassDialogController($scope, $mdDialog,$http) {

    //$scope.class = angular.element("#acc_class_view").scope().selectedClass;
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };




    $scope.saveClass = function(acc_class){
        $scope.offenceCurrentSaving = true;
        $http.post("/configure/class/save", acc_class).success(function (newAccClass) {

            console.log(newAccClass);
            $scope.newAccClass = {};
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

    $scope.updateClass = function(acc_class){
        $scope.offCurrentSaving = true;
        $http.post("/configure/offence/update/"+ acc_class.id).success(function (newAccClass) {

            console.log(newAccClass);
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