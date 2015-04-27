/**
 * Created by PAUL on 2/18/2015.
 */
angular.module('configApp')
    .controller('InsuranceController',function($scope,$http,$mdDialog){
//DHIS2 Way Starts
        $scope.insuranceList = [];
        $scope.onInitialize = function(){

            var insuranceModal = new dhis2.data.Modal("Insurance Company",[]);
            insuranceModal.getAll(function(result){
                console.log(JSON.stringify(result));
                $scope.insuranceList = result;
                $scope.$apply();
            });

        };
        dhisConfigs.onLoad = function(){
            $scope.onInitialize();
        }
        dhis2.Init(dhisConfigs);
//DHIS2 Way Ends

//Delete the Insurance
        $scope.deleteInsurance= function (insurance) {
            $scope.data.insurance.splice($scope.data.insurance.indexOf(insurance), 1);
            $http.post("/configure/insurance/delete", insurance).success(function () {

            });

        }

        $scope.deleteConfirm = function(ev,insurance) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete this Company')
                .content('This action is irreversible')
                .ariaLabel('Company Deleted')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                $scope.deleteInsurance(insurance);
            }, function() {

            });
        };

        $scope.addInsurance= function(ev) {
            $mdDialog.show({
                controller: InsuranceDialogController,
                templateUrl: 'views/add_insurance.html',
                targetEvent: ev
            })
                .then(function(answer) {

                }, function() {
                });
        }

        $scope.showInsurance = function(ev,insurance) {
            console.log(insurance);
            $scope.selectedInsurance= insurance;
            $mdDialog.show({
                controller: InsuranceDialogController,
                templateUrl: 'views/insurance_dialog.html',
                targetEvent: ev
            })
                .then(function(answer) {

                }, function() {
                });
        };

    });

function InsuranceDialogController($scope, $mdDialog,$http) {

    $scope.insurance={
        "name":"",
        "type":"",
        "officer":"",
        "policy_no":"",
        "policy_period":"",
        "physical_address":"",
        "address":"",
        "phone_no": "",
        "fax" : "",
        "website":"",
        "email":"",
        "date":""
    };

    $scope.insurance = angular.element("#listTable").scope().selectedInsurance;
    console.log($scope.insurance);
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };




    $scope.saveInsurance = function(insurance){
        $scope.InsuranceCurrentSaving = true;
        event ={
            "program": "goCY6uvLPxY",
            "orgUnit": "ij7JMOFbePH",
            "status": "COMPLETED",
            "eventDate": insurance.date,
            "storedBy": "admin",
            "dataValues": [
                //Company Name
                { "dataElement": "qOTXO7xhO9H", "value": insurance.name },
                //Company Type
                {"dataElement": "hbnudTFdTWg", "value": insurance.type },
                //Principal Officer
                {"dataElement": "DhVUoPlLMxN", "value": insurance.officer },
                //Phone Number
                { "dataElement": "dTaWcFxtMYR", "value": insurance.phone_no },
                //Postal Address
                { "dataElement": "o2CIL8aMPEa", "value": insurance.address},
                //Fax
                { "dataElement": "JbaeLBAaWDd", "value": insurance.fax },
                //Email
                { "dataElement": "zgworgBKMEh", "value": insurance.email },
                //Website
                { "dataElement": "a6lJOaPkwq4", "value": insurance.website },
                //Policy Period
                { "dataElement": "j5iHnWt83be", "value": insurance.policy_period },
                //Policy Number
                { "dataElement": "RN25sH9zcDE", "value": insurance.policy_no }
            ]

        };
        console.log(JSON.stringify(event));
        //send an accident event
        $http.post('/demo/api/events' , event).
            success(function(data) {
                console.log("data");
                $scope.InsuranceSavedSuccess = true;
                $scope.InsuranceCurrentSaving = false;
                $scope.InsuranceSavedFailure = false;
            }).
            error(function(error) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log(error);
                $scope.InsuranceSavedSuccess = false;
                $scope.InsuranceCurrentSaving = false;
                $scope.InsuranceSavedFailure = true;
            });


    }

    $scope.updateInsurance = function(insurance){
        $scope.InsuranceCurrentSaving = true;
        $http.post("/configure/insurance/update/", insurance).success(function (newInsurance) {

            console.log(newInsurance);
            $scope.newInsurance = {};
            $scope.InsuranceSavedSuccess = true;
            $scope.InsuranceCurrentSaving = false;
            $scope.InsuranceSavedFailure = false;

        }).error(function(){
            $scope.InsuranceSavedSuccess = false;
            $scope.InsuranceCurrentSaving = false;
            $scope.InsuranceSavedFailure = true;
        });
    }
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}