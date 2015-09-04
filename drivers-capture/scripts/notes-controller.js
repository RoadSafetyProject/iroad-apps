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

//controller for provide viewing informatation of a given
eventCaptureControllers.controller('ShowDriverInfoController',
    function($scope,$modalInstance,events,defaultPhotoID){ 
	//alert(defaultPhotoID);
	$scope.defaultPhotoID = defaultPhotoID;
	$scope.getImage = function(data){
		//console.log(JSON.stringify(data));
		//.dataValues['Driver Photo'].value
    	if(data.value){
    		if(data.value != ""){
    			return "../../../api/documents/"+data.value+"/data";
    		}else{
    			return "../../../api/documents/"+$scope.defaultPhotoID+"/data";
    		}
    	}else{
    		return "../../../api/documents/"+$scope.defaultPhotoID+"/data";
    	}
    }
        $scope.events = events;
        
        $scope.close = function(){
            $modalInstance.close();       

        };
    });

eventCaptureControllers.controller('ShowSuccessInfoController', function($scope,$modalInstance,message){

    $scope.message = message;

    $scope.close = function(){
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

eventCaptureControllers.controller('DriverLicenceController',
    function($scope,
            $modalInstance,
            dhis2Event,events){

    $scope.dhis2Event = dhis2Event;
    $scope.events = events;

    $scope.close = function () {
        $modalInstance.close();
    };
});