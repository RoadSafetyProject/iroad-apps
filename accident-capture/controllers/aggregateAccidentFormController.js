/**
 * Created by joseph on 9/2/15.
 */
var aggregateAccidentFormApp = angular.module('aggregateAccidentForm',[]);
aggregateAccidentFormApp.controller('aggregateAccidentFormController',function($scope,$http){

    //taking registration number of a given accident :
    $scope.data = {};
    $scope.accidentStatus = false;

    //loading necessary files for library
    dhisConfigs.onLoad = function(){
       console.log('success loading library');
    }
    iroad2.Init(dhisConfigs);

    console.log(JSON.stringify(dhisConfigs));

    $scope.searchAccident = function(){
        if($scope.data['accidentRegistrationNumber']){
            var regNumber = $scope.data['accidentRegistrationNumber'];
            $scope.accidentStatus = true;
            var accidentModal = new iroad2.data.Modal('Accident',[]);

            accidentModal.get(new iroad2.data.SearchCriteria('Accident Registration Number',"=",regNumber),function(result){
               console.log('Loading accident');
                //chsking if result have been found
                if(result.length > 0){
                    $scope.acccident = result[0];
                    $scope.$apply();
                }

            });
        }
        else{
            alert('fill registration number');
        }

    }

});