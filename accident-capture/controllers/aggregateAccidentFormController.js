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


//for vehicle inspection
var aggregateVehicleInspectionApp = angular.module('aggregateVehicleInspectionFormApp',["ui.date"]);
aggregateVehicleInspectionApp.controller('aggregateVehicleInspectionFormController',function($scope,$http){
    //loading necessary files for library
    dhisConfigs.onLoad = function(){
        console.log('success loading library');
    }
    iroad2.Init(dhisConfigs);

    //data variable
    $scope.data = {};
    $scope.ReportData = {};

    $scope.generateVehicleInspection = function(){
        console.log('data ' + JSON.stringify($scope.data));
        if(($scope.data.plateNumber)){
            var vehicleModal = new iroad2.data.Modal('Vehicle',[]);
            var vehicle = {};
            vehicleModal.get({value:$scope.data.plateNumber},function(result){
               if(vehicle  == result[0]){
                   console.log('data found');
               }
                else{
                   vehicle  = result[0];
                   $scope.ReportData.Vehicle = vehicle;
                   $scope.$apply();
                   var vehicleId = vehicle.id;
                   var inspectionData = [];
                   var vehicleInspectionModal = new iroad2.data.Modal('Vehicle Inspection',[]);
                   vehicleInspectionModal.get(new iroad2.data.SearchCriteria('Program_Vehicle',"=",vehicleId),function(result){
                        if(inspectionData == result){
                            console.log('data found');
                        }
                       else{
                            inspectionData = result;
                            var latestInspection = {};
                            var currentInspectionData = {}
                            for(var i =0; i < inspectionData.length; i++){
                                currentInspectionData = inspectionData[i];
                                if(! latestInspection['Inspection Date']){
                                    latestInspection = currentInspectionData;
                                }
                                if(currentInspectionData['Inspection Date']){
                                    if(latestInspection['Inspection Date'] < currentInspectionData['Inspection Date']){
                                        latestInspection = currentInspectionData;
                                    }
                                }
                            }
                            console.log('latest Inspection : ' + JSON.stringify(latestInspection));
                            $scope.ReportData.InspectionData = latestInspection;
                            $scope.$apply();
                        }
                   });

                   //latest owner of vehicle
                   var vehicleOwners = [];
                   var vehicleOwnerHistoryModel = new iroad2.data.Modal('Vehicle Owner History',[]);
                   vehicleOwnerHistoryModel.get(new iroad2.data.SearchCriteria('Program_Vehicle',"=",vehicleId),function(result) {
                       if(vehicleOwners == result){
                           console.log('Data found');
                       }
                       else{
                           vehicleOwners = result;
                           var latestOwner = {};
                           var currentOwner = {};
                           for(var i = 0; i < vehicleOwners.length; i ++){
                               currentOwner = vehicleOwners[i];
                               if(! latestOwner['Ownership End Date']){
                                   latestOwner = currentOwner;
                               }
                               //checking for latest owner of the given
                               if(currentOwner['Ownership End Date']){
                                   if(latestOwner['Ownership End Date'] < currentOwner['Ownership End Date']){
                                       latestOwner = currentOwner;
                                   }
                               }
                           }
                           console.log('Latest owner : ' + JSON.stringify(latestOwner));
                           $scope.ReportData.Owner = latestOwner;
                           $scope.$apply();
                       }

                   });
               }
            });
        }
        else{
            alert('Please enter Vehicle Registration Number');
        }

    }
});