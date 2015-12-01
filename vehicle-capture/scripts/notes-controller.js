//Controller for notes
eventCaptureControllers.controller('NotesController',
    function($scope,
             $modalInstance,
             dhis2Event){

        $scope.dhis2Event = dhis2Event;

        $scope.close = function () {
            $modalInstance.close();
        };
    });
eventCaptureControllers.controller('', function($scope,$modalInstance,dhis2Event){

    $scope.VehicleEvent = dhis2Event;
    var vehicleId = dhis2Event.event;

    $scope.vehicleInspections = [];
    //fetching vehicle inspection history
    var vehicleInspectionsModel = new iroad2.data.Modal('Vehicle Owner History',[]);
    vehicleInspectionsModel.get(new iroad2.data.SearchCriteria('Program_Vehicle',"=",vehicleId),function(result) {
        if($scope.vehicleInspections == result){
            console.log('Data found');
        }
        else{
            $scope.vehicleInspections = result;
            $scope.$apply();
        }

    });

    $scope.close = function () {
        $modalInstance.close();
    };
});
eventCaptureControllers.controller('ShowVehicleInfoController',
	    function($scope,$modalInstance,events){
	        $scope.events = events;
	        
	        $scope.close = function(){
	            $modalInstance.close();       

	        };
	    });
eventCaptureControllers.controller('VehicleOwnerHistoryController',
    function($scope,
             $modalInstance,
             dhis2Event){

        $scope.VehicleEvent = dhis2Event;
        var vehicleId = dhis2Event.event;

        $scope.vehicleOwners = [];
        //fetching vehicle owner history
        var vehicleOwnerHistoryModel = new iroad2.data.Modal('Vehicle Owner History',[]);
        vehicleOwnerHistoryModel.get(new iroad2.data.SearchCriteria('Program_Vehicle',"=",vehicleId),function(result) {
            if($scope.vehicleOwners == result){
                console.log('Data found');
            }
            else{
                $scope.vehicleOwners = result;
                $scope.$apply();
            }

        });

        $scope.close = function () {
            $modalInstance.close();
        };
    });


eventCaptureControllers.controller('DeleteController',
    function($scope,
             $modalInstance,
             dhis2Event,events){

        $scope.dhis2Event = dhis2Event;
        $scope.events = events;

        $scope.close = function () {
            $modalInstance.close();
        };
        $scope.delete = function (event,events) {
            $scope.deleting= true;
            $.postJSON = function(url, data, callback,failureCallback) {
                return jQuery.ajax({
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'admin':'district'
                    },
                    'type': 'DELETE',
                    'url': url,
                    'data': JSON.stringify(data),
                    'dataType': 'json',
                    'success': callback,
                    'failure':failureCallback
                });
            };
            $.postJSON('../../../api/events/' + event.event,function(response){
                $scope.deleting= false;
                events.splice(events.indexOf(event), 1);
                alert('Deleted Successful');
                $modalInstance.close();
            },function(response){
                alert('delete Failed');
                $modalInstance.close();
            });
//        $modalInstance.close();
        };
    });

eventCaptureControllers.controller('VehicleController',
    function($scope,
             $modalInstance,
             dhis2Event){

        $scope.dhis2Event = dhis2Event;

        $scope.close = function () {
            $modalInstance.close();
        };
    });

eventCaptureControllers.controller('VehicleInsuranceController',
    function($scope,
             $modalInstance,
             dhis2Event,events){

        $scope.dhis2Event = dhis2Event;
        $scope.events = events;

        $scope.close = function () {
            $modalInstance.close();
        };
    });


eventCaptureControllers.controller('VehicleBussinessController',
    function($scope,
             $modalInstance,
             dhis2Event,events){

        $scope.dhis2Event = dhis2Event;
        $scope.events = events;

        $scope.close = function () {
            $modalInstance.close();
        };
    });

eventCaptureControllers.controller('DriverAccidentController',
    function($scope,
             $modalInstance,
             dhis2Event,events){

        $scope.dhis2Event = dhis2Event;
        $scope.events = events;

        $scope.close = function () {
            $modalInstance.close();
        };
    });

eventCaptureControllers.controller('DriverOffenceController',
    function($scope,
             $modalInstance,
             dhis2Event,events){

        $scope.dhis2Event = dhis2Event;
        $scope.events = events;

        $scope.close = function () {
            $modalInstance.close();
        };
    });