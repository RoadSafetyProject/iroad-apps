/**
 * Created by joseph on 9/2/15.
 */
var aggregateAccidentFormApp = angular.module('aggregateAccidentForm',["ui.date"]);
aggregateAccidentFormApp.controller('aggregateAccidentFormController',function($scope,$http){

    //taking registration number of a given accident :
    $scope.data = {};
    $scope.accidentStatus = false;
    $scope.accidentRegNumber = "";
    //loading necessary files for library
    dhisConfigs.onLoad = function(){
       console.log('success loading library');
    }
    iroad2.Init(dhisConfigs);

    console.log(JSON.stringify(dhisConfigs));

    $scope.searchAccident = function(){
        if($scope.data['accidentRegistrationNumber']){
            var regNumber = $scope.data['accidentRegistrationNumber'];

            $scope.accidentRegNumber = regNumber;
            $scope.accidentStatus = true;
            //fetching accident
            var accidentModal = new iroad2.data.Modal('Accident',[]);
            $scope.acccident = null;
            accidentModal.get(new iroad2.data.SearchCriteria('Accident Registration Number',"=",regNumber),function(result){
               console.log('Loading accident');
                //checking if result have been found
                if(result.length > 0){
                    if($scope.acccident == result[0]){
                        console.log('accident found');
                    }
                    else{
                        $scope.acccident = result[0];
                        var accidentId = result[0].id;
                        $scope.$apply();
                        //fetching accident witness
                        $scope.accidentWitnesses = null;
                        var accidentWitness = new iroad2.data.Modal('Accident Witness',[]);
                        accidentWitness.get(new iroad2.data.SearchCriteria('Program_Accident',"=",accidentId),function(results){

                            $scope.accidentWitnesses = results;
                            $scope.$apply();
                        });
                        //fetching accident vehicles
                        var accidentVehiclesModal = new iroad2.data.Modal('Accident Vehicle',[]);
                        $scope.accidentVehicles = null;
                        accidentVehiclesModal.get(new iroad2.data.SearchCriteria('Program_Accident',"=",accidentId),function(result){
                            console.log('loading accident vehicles');
                            $scope.accidentVehicles = result;
                            $scope.$apply();

                        });
                    }
                }
            });
        }
        else{
            alert('fill registration number');
        }

    }

});