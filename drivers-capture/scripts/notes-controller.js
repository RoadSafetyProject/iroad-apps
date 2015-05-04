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