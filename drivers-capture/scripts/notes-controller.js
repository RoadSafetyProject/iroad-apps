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
	$scope.isLicenseExpiry = function(){
			var dateString = events.dataValues['Current License Expiry Date'].value;
			var date = new Date(parseInt(dateString.substr(0,4)),parseInt(dateString.substr(5,2)),parseInt(dateString.substr(8,2)))
			console.log((new Date()).getTime() - date.getTime());
			return ((new Date()).getTime() - date.getTime()) > 0;
	}
	$scope.expireColor = "";
	$scope.expired = "(License has Expired)";
	if($scope.isLicenseExpiry()){
		$scope.expireColor = "red";
	}
	$scope.getImage = function(data){
		var photo = data.dataValues["Driver Photo"];
		//console.log(JSON.stringify(data));
		if(photo)
		{
			if(photo.value){
	    		if(photo.value != ""){
	    			return "../../../api/documents/"+photo.value+"/data";
	    		}else{
	    			return "../../../api/documents/"+$scope.defaultPhotoID+"/data";
	    		}
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
eventCaptureControllers.controller('SnapShotController',
	    function($scope,$modalInstance,photoEvent){
	
	$scope.init = function(){

		Webcam.set({
			width: 240,
			height: 240,
			dest_width: 220,
	        dest_height: 220,
			image_format: 'jpeg',
			jpeg_quality: 90
		});
		Webcam.attach('#my_camera');
	};
	

    $scope.take_snapshot = function() {
        Webcam.snap( function(data_uri) {
            document.getElementById('my_camera').innerHTML = '<img src="'+data_uri+'"/>';
            photoEvent.setPhotoData(data_uri);
        });
    }
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