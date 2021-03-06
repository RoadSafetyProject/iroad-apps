
'use strict';
var accidentPopup = [];
/* Controllers */
var eventCaptureControllers = angular.module('eventCaptureControllers', ["ui.date"]);

//Controller for settings page
eventCaptureControllers.controller('MainController',
    function($scope,$modal,$timeout,$translate,$anchorScroll,storage,Paginator,OptionSetService,ProgramFactory,ProgramStageFactory,
             DHIS2EventFactory,DHIS2EventService,ContextMenuSelectedItem,DateUtils,$filter,$http,CalendarService,GridColumnService,
             CustomFormService,ErrorMessageService,ModalService,DialogService,$interval)
    {
        $scope.accidentEventModal = new iroad2.data.Modal("Accident",[]);
        $scope.today = DateUtils.getToday();
        $scope.data = {};
        $scope.isValidAccident = function(recent_accident){
   
        	var returnValue = true; 
        	angular.forEach($scope.recentAccidents,function(accident){
        		if(accident.id == recent_accident.id){
        			returnValue = false;
        		}
        	});
        	return returnValue;// && !(recent_accident.coordinate.latitude == 0 && recent_accident.coordinate.longitude == 0);
        }
        $scope.recentAccidents = [];
        $scope.loadAccidents = function(){
        	var d = new Date();
        	$scope.accidentEventModal.getAll(function(result){
        		console.log(JSON.stringify(result));
        		angular.forEach(result.data, function (recent_accident) {
        			//alert(recent_accident.id + ":" + $scope.recentAccidents.length);
                    if($scope.isValidAccident(recent_accident)){
                    	//alert("here");
                    	console.log(JSON.stringify(recent_accident));
                    	$scope.recentAccidents.push(recent_accident);
                    	
                    	$scope.loadedAccidentIds.push(recent_accident.id);
                    	var image = new google.maps.MarkerImage(
                                '../resources/images/marker.png',
                                null, // size
                                null, // origin
                                new google.maps.Point( 8, 8 ), // anchor (move to center of marker)
                                new google.maps.Size( 17, 17 ) // scaled size (required for Retina display icon)
                            );

                    	
                    	
                            var marker = new google.maps.Marker({
                                //position: new google.maps.LatLng(coords[i][0], coords[i][1]),
                            	position: new google.maps.LatLng(recent_accident.coordinate.latitude, recent_accident.coordinate.longitude),//(recent_accident.Accident.Latitude, recent_accident.Accident.Longitude),
                            	//position: new google.maps.LatLng(-6.776751, 39.256210),
                                map: $scope.map,
                                optimized: false,
                                icon: $scope.iconURLPrefix + 'green-dot.png',
                                interval:0,
                                visible:true
                            });

                            marker.startBlinking();
                            $scope.markers.push(marker);

                            google.maps.event.addListener(marker, 'click', (function(marker) {
                                return function() {
                                    //$scope.ViewAccident(recent_accident);
                                    $scope.viewAccidentInfo(recent_accident);
                                    marker.stopBlinking();
                                }
                            })(marker));
                    }
                    
                });
        		console.log("Number of Markers:" + $scope.markers.length);
            },500,1,"&startDate="+$scope.getTodaysDate()+"&endDate="+$scope.getTodaysDate());
        }
        $scope.viewAccidentInfo = function(dhis2Event){
            
            $scope.AccidentData = dhis2Event;
             var modalInstance = $modal.open({
                    templateUrl: '../accident-capture/views/viewAccidentInfo.html',
                    controller: 'AccidentController'
                    //size:"lg"

                });

                modalInstance.result.then(function (){
                });
            
            
        }
        $scope.getTodaysDate = function(){
        	var date = new Date();
        	var day = date.getDate();
        	if(day < 10){
        		day = "0" + day;
        	}
        	var month = date.getMonth() + 1;
        	if(month < 10){
        		month = "0" + month;
        	}
        	return date.getFullYear() +"-"+month+"-"+day;
        }
        $scope.autoCenter = function(){
        //  Create a new viewpoint bound
            var bounds = new google.maps.LatLngBounds();
            //  Go through each...
            for (var i = 0; i < $scope.markers.length; i++) {
                bounds.extend($scope.markers[i].position);
            }
            //  Fit these bounds to the map
            $scope.map.fitBounds(bounds);
        }
        $scope.onInitializeAccident = function(){
        	$scope.iconURLPrefix = 'http://maps.google.com/mapfiles/ms/icons/';

            $scope.icons = [
                $scope.iconURLPrefix + 'red-dot.png',
                $scope.iconURLPrefix + 'green-dot.png',
                $scope.iconURLPrefix + 'blue-dot.png',
                $scope.iconURLPrefix + 'orange-dot.png',
                $scope.iconURLPrefix + 'purple-dot.png',
                $scope.iconURLPrefix + 'pink-dot.png',
                $scope.iconURLPrefix + 'yellow-dot.png'
            ]
            $scope.iconsLength = $scope.icons.length;
            var options = {
                    zoom: 8,
                    center: { lat: -6.184234, lng: 35.676095}
                };
            $scope.map = new google.maps.Map(document.getElementById('map'),options );
            google.maps.Marker.prototype.accidentId = null;
            google.maps.Marker.prototype.startBlinking=function(){
                var mar = this;
                this.interval = setInterval(function(){mar.setVisible(!mar.visible)}, 1000);
            };
            google.maps.Marker.prototype.stopBlinking=function(){

                clearInterval(this.interval);
                this.setVisible(true);
            };
            $scope.recentAccidents = new Array();
            console.log("Modal Name:" + $scope.accidentEventModal.getModalName());
            $scope.markers = new Array();
            
            $scope.loadedAccidentIds = [];
            $scope.loadAccidents();
            $interval($scope.loadAccidents,5000);
        }
        $scope.isAccidentIdLoaded = function(id){
        	for(var i = 0;i < $scope.loadedAccidentIds.length;i++){
        		if($scope.loadedAccidentIds[i] == id){
        			return true;
        		}
        	}
        	return false;
        }
        /*
         dhisConfigs.onLoad = function(){
         $scope.onInitializeAccident();
         }
         */
        dhisConfigs.onLoad = function(){
            $scope.onInitializeAccident();
        }

        iroad2.Init(dhisConfigs);

        //Show Media involved in an accident
        $scope.showMedia  = function(media) {
            $scope.normalClassMedia= "mws-panel grid_8";
            $scope.showingMedia = 'true';
            $scope.showingVehicle = "false";
            $scope.showingDriver = "false";
            $scope.editing = "false";
            $scope.normalClass= "mws-panel grid_8";
            $scope.data.accident = media;
        }

        //Show Driver involved in an accident
        $scope.showDriver  = function(driver) {
            $scope.normalClassDriver= "mws-panel grid_8";
            $scope.showingDriver = "true";
            $scope.showingVehicle = "false";
            $scope.editing = "false";
            $scope.normalClass= "mws-panel grid_8";
            $scope.data.accident = driver;
            //alert("Driver:" + JSON.stringify($scope.data.accident));
        }


        //Show Vehicle involved in an accident
        $scope.showVehicle  = function(vehicle) {
            $scope.normalClassVehicle= "mws-panel grid_8";
            $scope.showingVehicle = "true";
            $scope.showingDriver = "false";
            $scope.normalClass= "mws-panel grid_8";
            $scope.editing = "false";
            $scope.data.accident = vehicle;
        }

        $scope.cancelEdit = function(){
            $scope.normalClass= "mws-panel grid_8";
            $scope.editing = "false";
        }

        $scope.cancelDriver = function(){
            $scope.normalClass= "mws-panel grid_8";
            $scope.showingDriver = "false";
            $scope.editing = "false";
        }

        $scope.cancelVehicle = function(){
            $scope.normalClass= "mws-panel grid_8";
            $scope.showingVehicle = "false";
            $scope.editing = "false";
        }



        $scope.addAccident = function(dhis2Event){
            // console.log(JSON.stringify(dhis2Event));
            var modalInstance = $modal.open({
                templateUrl: 'views/add_accident_dialog.html',
                controller: 'AccidentFormController',
                resolve: {
                    dhis2Event: function () {
                        return dhis2Event;
                    }
                }
            });

            modalInstance.result.then(function (){
            });
        };

        $scope.ViewAccident = function(dhis2Event){
            //console.log(JSON.stringify(dhis2Event));
            var modalInstance = $modal.open({
                templateUrl: 'views/accident_dialog.html',
                controller: 'AccidentController',
                resolve: {
                    dhis2Event: function () {
                        return dhis2Event;
                    }
                }
            });

            modalInstance.result.then(function (){
            });
        };

        $scope.watchEditing = function(program,dataElement){
            $scope.$watch("editingEvent['"+dataElement.name+"']", function (newValue, oldValue) {
                //alert("Program:" + JSON.stringify(program));
                if(newValue != "")
                {
                    var relationModal = new  iroad2.data.Modal(program.name,[]);
                    relationModal.get(new iroad2.data.SearchCriteria(dataElement.name,"=",newValue),function(result){
                        //console.log("Relation Modal:" + JSON.stringify(result));
                        if(result.length > 0)
                        {
                            angular.forEach($scope.savableEventData, function (savableData) {
                                if(savableData.name == dataElement.name){
                                    savableData.value = result[0];

                                }
                            });
                        }else{
                            angular.forEach($scope.savableEventData, function (savableData) {
                                if(savableData.name == dataElement.name){
                                    savableData.value = null;
                                }
                            });
                        }
                        $scope.$apply();
                    });
                }
            });
        };
    });

if (typeof String.prototype.startsWith != 'function') {
    /**
     * Checks if a string starts with a given string
     *
     * @param string
     *
     * @return boolean
     *
     */
    String.prototype.startsWith = function (str){
        return this.indexOf(str) === 0;
    };
}

if (typeof String.prototype.endsWith != 'function') {
    /**
     * Checks if a string ends with a given string
     *
     * @param string
     *
     * @return boolean
     *
     */
    String.prototype.endsWith = function (str){
        return this.slice(-str.length) == str;
    };

}

eventCaptureControllers.controller('AccidentController',
    function($scope,$modalInstance,dhis2Event){

        $scope.dhis2Event = dhis2Event;
        //console.log('Accident' +JSON.stringify($scope.dhis2Event));

        $scope.close = function () {
            $modalInstance.close();
        };
    });


eventCaptureControllers.controller('AccidentFormController',function($scope,$modal,$modalInstance,dhis2Event){


    var accidentEventModal = new iroad2.data.Modal("Accident",[]);

    $scope.dhis2Event = dhis2Event;
    //console.log(dhis2Event);
    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.isInteger = function(key){
        return $scope.is(key,"int");
    }
    $scope.isDate = function(key){
        return $scope.is(key,"date");
    }
    $scope.isString = function(key){
        return $scope.is(key,"string");
    }

    $scope.is = function(key,dataType){
        for(j = 0 ;j < iroad2.data.dataElements.length;j++){
            if(iroad2.data.dataElements[j].name == key){
                if(iroad2.data.dataElements[j].type == dataType){
                    return true;
                }
                break;
            }
        };
        return false;
    }
    $scope.isBoolean = function(key){
        return $scope.is(key,"bool");
    }
    $scope.hasDataSets = function(key){
        for(j = 0 ;j < iroad2.data.dataElements.length;j++){
            if(iroad2.data.dataElements[j].name == key){
                return (iroad2.data.dataElements[j].optionSet != undefined);
            }
        };
        return false;
    }
    $scope.getOptionSets = function(key){
        for(j = 0 ;j < iroad2.data.dataElements.length;j++){
            if(iroad2.data.dataElements[j].name == key){
                return iroad2.data.dataElements[j].optionSet.options;
            }
        };
        return false;
    }

    $scope.addAccidentVehicle = function(dhis2Event){

        var modalInstance = $modal.open({
            templateUrl: 'views/add_accident_vehicle_dialog.html',
            controller: 'VehicleFormController',
            resolve: {
                dhis2Event: function () {
                    return dhis2Event;
                }
            }
        });

        modalInstance.result.then(function (){
        });
    };

    $scope.watchEditing = function(program,dataElement){
        $scope.$watch("editingEvent['"+dataElement.name+"']", function (newValue, oldValue) {
            //alert("Program:" + JSON.stringify(program));
            if(newValue != "")
            {
                var relationModal = new  iroad2.data.Modal(program.name,[]);
                relationModal.get(new iroad2.data.SearchCriteria(dataElement.name,"=",newValue),function(result){
                    //console.log("Relation Modal:" + JSON.stringify(result));
                    if(result.length > 0)
                    {
                        angular.forEach($scope.savableEventData, function (savableData) {
                            if(savableData.name == dataElement.name){
                                savableData.value = result[0];

                            }
                        });
                    }else{
                        angular.forEach($scope.savableEventData, function (savableData) {
                            if(savableData.name == dataElement.name){
                                savableData.value = null;
                            }
                        });
                    }
                    $scope.$apply();
                });
            }
        });
    };


    $scope.EditAccident  = function(event){
        //console.log(JSON.stringify(iroad2.data.programs));
        angular.forEach(iroad2.data.programs, function (program) {
            if (program.name == accidentEventModal.getModalName()) {
                $scope.editingProgram = program;
            }
        });
        $scope.savableEventData = [];
        $scope.editingEvent = event;
        //console.log('Adding' + JSON.stringify(event));
        for (var key in event) {
            if (typeof event[key] == "object") {
                var program = accidentEventModal.getProgramByName(key);
                angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
                    if (dataElement.dataElement.code) {
                        if(dataElement.dataElement.code.startsWith("id_")){
                            $scope.editingEvent[dataElement.dataElement.name] = event[key][dataElement.dataElement.name];
                            $scope.savableEventData.push({"name":dataElement.dataElement.name,"key":key,"value":event[key]});
                            $scope.watchEditing(program,dataElement.dataElement);
                            delete $scope.editingEvent[key];
                        }
                    }
                });
            }
        }
    };


    $scope.addNewAccident = function(){

        var modalName = accidentEventModal.getModalName();
        var event = {};
        angular.forEach(iroad2.data.programs, function (program) {
            if (program.name == modalName) {
                angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
                    if(dataElement.dataElement.name.startsWith(iroad2.config.refferencePrefix)){
                        event[dataElement.dataElement.name.replace(iroad2.config.refferencePrefix,"")] = {};
                    }else{
                        event[dataElement.dataElement.name] = "";
                    }

                });
            }
        });
        angular.forEach(accidentEventModal.getRelationships(), function (relationship) {
            if(relationship.pivot){
                event[relationship.pivot] = [];
            }
        });
        $scope.EditAccident(event);
    }


    $scope.addNewAccident();


    $scope.saveAccident = function(){

        $scope.AccCurrentSaving = true;
        $scope.AccSavingSuccess = false;
        $scope.AccSavingFailure = false;

        angular.forEach($scope.savableEventData, function (savableData) {
            delete $scope.editingEvent[savableData.name];
            $scope.editingEvent[savableData.key] = savableData.value;
        });

        //console.log("Saving Data:" + JSON.stringify($scope.editingEvent));
        var otherData = {orgUnit:"wardNwId314",status: "COMPLETED",storedBy: "admin",eventDate:$scope.editingEvent['Time of Accident']};
        var saveEvent = $scope.editingEvent;

        //console.log("Save Made:" + JSON.stringify(saveEvent));

        accidentEventModal.save(saveEvent,otherData,function(result){
            $scope.AccCurrentSaving = false;
            $scope.AccSavingSuccess = true;
            $scope.AccSavingFailure = false;

            //console.log("Save Made:" + JSON.stringify(result.importSummaries[0].reference));
            $scope.accident_id = result.importSummaries[0].reference;
            $scope.close();
            $scope.addAccidentVehicle(result);

        },function(error){
            $scope.AccCurrentSaving = false;
            $scope.AccSavingSuccess = false;
            $scope.AccSavingFailure = true;

        },accidentEventModal.getModalName());



    }


});

eventCaptureControllers.controller('VehicleFormController',function($scope,$modal,$modalInstance,dhis2Event){

    var accidentVehicleEventModal = new iroad2.data.Modal("Accident Vehicle",[]);
    //console.log(dhis2Event.importSummaries[0].reference);
    $scope.accident_reg_id = dhis2Event.importSummaries[0].reference;
    //console.log($scope.accident_reg_id);

    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.isInteger = function(key){
        return $scope.is(key,"int");
    }
    $scope.isDate = function(key){
        return $scope.is(key,"date");
    }
    $scope.isString = function(key){
        return $scope.is(key,"string");
    }

    $scope.is = function(key,dataType){
        for(j = 0 ;j < iroad2.data.dataElements.length;j++){
            if(iroad2.data.dataElements[j].name == key){
                if(iroad2.data.dataElements[j].type == dataType){
                    return true;
                }
                break;
            }
        };
        return false;
    }
    $scope.isBoolean = function(key){
        return $scope.is(key,"bool");
    }
    $scope.hasDataSets = function(key){
        for(j = 0 ;j < iroad2.data.dataElements.length;j++){
            if(iroad2.data.dataElements[j].name == key){
                return (iroad2.data.dataElements[j].optionSet != undefined);
            }
        };
        return false;
    }
    $scope.getOptionSets = function(key){
        for(j = 0 ;j < iroad2.data.dataElements.length;j++){
            if(iroad2.data.dataElements[j].name == key){
                return iroad2.data.dataElements[j].optionSet.options;
            }
        };
        return false;
    }

    $scope.addAccidentPassenger = function(dhis2Event){

        var modalInstance = $modal.open({
            templateUrl: 'views/add_accident_passenger_dialog.html',
            controller: 'PassengerFormController',
            resolve: {
                dhis2Event: function () {
                    return dhis2Event;
                }
            }
        });

        modalInstance.result.then(function (){
        });
    };

    $scope.watchEditingVehicle = function(program,dataElement){
        $scope.$watch("editingEventVehicle['"+dataElement.name+"']", function (newValue, oldValue) {
            //alert("Program:" + JSON.stringify(program));
            if(newValue != "")
            {
                var relationModal = new  iroad2.data.Modal(program.name,[]);
                relationModal.get(new iroad2.data.SearchCriteria(dataElement.name,"=",newValue),function(result){
                    //console.log("Relation Modal:" + JSON.stringify(result));
                    if(result.length > 0)
                    {
                        angular.forEach($scope.savableEventData, function (savableData) {
                            if(savableData.name == dataElement.name){
                                savableData.value = result[0];

                            }
                        });
                    }else{
                        angular.forEach($scope.savableEventData, function (savableData) {
                            if(savableData.name == dataElement.name){
                                savableData.value = null;
                            }
                        });
                    }
                    $scope.$apply();
                });
            }
        });
    };


    $scope.EditAccidentVehicle  = function(event){
        //console.log(JSON.stringify(iroad2.data.programs));
        angular.forEach(iroad2.data.programs, function (program) {
            if (program.name == accidentVehicleEventModal.getModalName()) {
                $scope.editingProgram = program;
            }
        });
        $scope.savableEventData = [];
        $scope.editingEventVehicle = event;
        //console.log('Editing' + JSON.stringify(event));
        for (var key in event) {
            if (typeof event[key] == "object") {
                var program = accidentVehicleEventModal.getProgramByName(key);
                angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
                    if (dataElement.dataElement.code) {
                        if(dataElement.dataElement.code.startsWith("id_")){
                            $scope.editingEventVehicle[dataElement.dataElement.name] = event[key][dataElement.dataElement.name];
                            $scope.savableEventData.push({"name":dataElement.dataElement.name,"key":key,"value":event[key]});
                            $scope.watchEditingVehicle(program,dataElement.dataElement);
                            delete $scope.editingEventVehicle[key];
                        }
                    }
                });
            }
        }
    };


    $scope.addNewAccidentVehicle = function(){

        var modalName = accidentVehicleEventModal.getModalName();
        var event = {};
        angular.forEach(iroad2.data.programs, function (program) {
            if (program.name == modalName) {
                angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
                    if(dataElement.dataElement.name.startsWith(iroad2.config.refferencePrefix)){
                        event[dataElement.dataElement.name.replace(iroad2.config.refferencePrefix,"")] = {};
                    }else{
                        event[dataElement.dataElement.name] = "";
                    }

                });
            }
        });
        angular.forEach(accidentVehicleEventModal.getRelationships(), function (relationship) {
            if(relationship.pivot){
                event[relationship.pivot] = [];
            }
        });
        $scope.EditAccidentVehicle(event);
    }

    $scope.addNewAccidentVehicle();

    $scope.saveAccidentVehicle = function(){
        $scope.VehicleCurrentSaving = true;
        $scope.VehicleSavingSuccess = false;
        $scope.VehicleSavingFailure = false;

        angular.forEach($scope.savableEventData, function (savableData) {
            delete $scope.editingEventVehicle[savableData.name];
            $scope.editingEventVehicle[savableData.key] = savableData.value;
        });

        var otherData = {orgUnit:"wardNwId314",status: "COMPLETED",storedBy: "admin"};

        $scope.editingEventVehicle.Accident['id'] = $scope.accident_reg_id ;
        var saveEvent = $scope.editingEventVehicle;

        console.log("Saving Data:" + JSON.stringify(saveEvent));

        accidentVehicleEventModal.save(saveEvent,otherData,function(result){
            $scope.VehicleCurrentSaving = false;
            $scope.VehicleSavingSuccess = true;
            $scope.VehicleSavingFailure = false;

            console.log("Save Made:" + JSON.stringify(result));
            result['accident_id'] = $scope.accident_reg_id ;
            $scope.close();
            $scope.addAccidentPassenger(result);

        },function(error){
            $scope.VehicleCurrentSaving = false;
            $scope.VehicleSavingSuccess = false;
            $scope.VehicleSavingFailure = true;

        },accidentVehicleEventModal.getModalName());


    }



});

eventCaptureControllers.controller('PassengerFormController',function($scope,$modal,$modalInstance,dhis2Event){

    var accidentVehicleEventModal = new iroad2.data.Modal("Accident Passenger",[]);
    //console.log(dhis2Event.importSummaries[0].reference);
    $scope.accident_reg_id = dhis2Event.accident_id;
    //console.log($scope.accident_reg_id);

    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.isInteger = function(key){
        return $scope.is(key,"int");
    }
    $scope.isDate = function(key){
        return $scope.is(key,"date");
    }
    $scope.isString = function(key){
        return $scope.is(key,"string");
    }

    $scope.is = function(key,dataType){
        for(j = 0 ;j < iroad2.data.dataElements.length;j++){
            if(iroad2.data.dataElements[j].name == key){
                if(iroad2.data.dataElements[j].type == dataType){
                    return true;
                }
                break;
            }
        };
        return false;
    }
    $scope.isBoolean = function(key){
        return $scope.is(key,"bool");
    }
    $scope.hasDataSets = function(key){
        for(j = 0 ;j < iroad2.data.dataElements.length;j++){
            if(iroad2.data.dataElements[j].name == key){
                return (iroad2.data.dataElements[j].optionSet != undefined);
            }
        };
        return false;
    }
    $scope.getOptionSets = function(key){
        for(j = 0 ;j < iroad2.data.dataElements.length;j++){
            if(iroad2.data.dataElements[j].name == key){
                return iroad2.data.dataElements[j].optionSet.options;
            }
        };
        return false;
    }

    $scope.addAccidentWitness = function(dhis2Event){

        var modalInstance = $modal.open({
            templateUrl: 'views/add_accident_witness_dialog.html',
            controller: 'WitnessFormController',
            resolve: {
                dhis2Event: function () {
                    return dhis2Event;
                }
            }
        });

        modalInstance.result.then(function (){
        });
    };

    $scope.watchEditingVehicle = function(program,dataElement){
        $scope.$watch("editingEventVehicle['"+dataElement.name+"']", function (newValue, oldValue) {
            //alert("Program:" + JSON.stringify(program));
            if(newValue != "")
            {
                var relationModal = new  iroad2.data.Modal(program.name,[]);
                relationModal.get(new iroad2.data.SearchCriteria(dataElement.name,"=",newValue),function(result){
                    //console.log("Relation Modal:" + JSON.stringify(result));
                    if(result.length > 0)
                    {
                        angular.forEach($scope.savableEventData, function (savableData) {
                            if(savableData.name == dataElement.name){
                                savableData.value = result[0];

                            }
                        });
                    }else{
                        angular.forEach($scope.savableEventData, function (savableData) {
                            if(savableData.name == dataElement.name){
                                savableData.value = null;
                            }
                        });
                    }
                    $scope.$apply();
                });
            }
        });
    };


    $scope.EditAccidentVehicle  = function(event){
        //console.log(JSON.stringify(iroad2.data.programs));
        angular.forEach(iroad2.data.programs, function (program) {
            if (program.name == accidentVehicleEventModal.getModalName()) {
                $scope.editingProgram = program;
            }
        });
        $scope.savableEventData = [];
        $scope.editingEventVehicle = event;
        //console.log('Editing' + JSON.stringify(event));
        for (var key in event) {
            if (typeof event[key] == "object") {
                var program = accidentVehicleEventModal.getProgramByName(key);
                angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
                    if (dataElement.dataElement.code) {
                        if(dataElement.dataElement.code.startsWith("id_")){
                            $scope.editingEventVehicle[dataElement.dataElement.name] = event[key][dataElement.dataElement.name];
                            $scope.savableEventData.push({"name":dataElement.dataElement.name,"key":key,"value":event[key]});
                            $scope.watchEditingVehicle(program,dataElement.dataElement);
                            delete $scope.editingEventVehicle[key];
                        }
                    }
                });
            }
        }
    };


    $scope.addNewAccidentVehicle = function(){

        var modalName = accidentVehicleEventModal.getModalName();
        var event = {};
        angular.forEach(iroad2.data.programs, function (program) {
            if (program.name == modalName) {
                angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
                    if(dataElement.dataElement.name.startsWith(iroad2.config.refferencePrefix)){
                        event[dataElement.dataElement.name.replace(iroad2.config.refferencePrefix,"")] = {};
                    }else{
                        event[dataElement.dataElement.name] = "";
                    }

                });
            }
        });
        angular.forEach(accidentVehicleEventModal.getRelationships(), function (relationship) {
            if(relationship.pivot){
                event[relationship.pivot] = [];
            }
        });
        $scope.EditAccidentVehicle(event);
    }

    $scope.addNewAccidentVehicle();

    $scope.saveAccidentPassenger = function(){
        $scope.PassengerCurrentSaving = true;
        $scope.PassengerSavingSuccess = false;
        $scope.PassengerSavingFailure = false;

        angular.forEach($scope.savableEventData, function (savableData) {
            delete $scope.editingEventVehicle[savableData.name];
            $scope.editingEventVehicle[savableData.key] = savableData.value;
        });

        var otherData = {orgUnit:"wardNwId314",status: "COMPLETED",storedBy: "admin"};

        $scope.editingEventVehicle.Accident['id'] = $scope.accident_reg_id ;
        var saveEvent = $scope.editingEventVehicle;

        //console.log("Saving Data:" + JSON.stringify(saveEvent));
        accidentVehicleEventModal.save(saveEvent,otherData,function(result){
            $scope.PassengerCurrentSaving = false;
            $scope.PassengerSavingSuccess = true;
            $scope.PassengerSavingFailure = false;

            //console.log("Save Made:" + JSON.stringify(result));
            result['accident_id'] = $scope.accident_reg_id ;
            $scope.addAccidentWitness(result);
            $scope.close();

        },function(error){
            $scope.PassengerCurrentSaving = false;
            $scope.PassengerSavingSuccess = false;
            $scope.PassengerSavingFailure = true;

        },accidentVehicleEventModal.getModalName());


    }



});

eventCaptureControllers.controller('WitnessFormController',function($scope,$modal,$modalInstance,dhis2Event){

    var accidentVehicleEventModal = new iroad2.data.Modal("Accident Witness",[]);
    //console.log(dhis2Event.importSummaries[0].reference);
    $scope.accident_reg_id = dhis2Event.accident_id;
    //console.log($scope.accident_reg_id);

    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.isInteger = function(key){
        return $scope.is(key,"int");
    }
    $scope.isDate = function(key){
        return $scope.is(key,"date");
    }
    $scope.isString = function(key){
        return $scope.is(key,"string");
    }

    $scope.is = function(key,dataType){
        for(j = 0 ;j < iroad2.data.dataElements.length;j++){
            if(iroad2.data.dataElements[j].name == key){
                if(iroad2.data.dataElements[j].type == dataType){
                    return true;
                }
                break;
            }
        };
        return false;
    }
    $scope.isBoolean = function(key){
        return $scope.is(key,"bool");
    }
    $scope.hasDataSets = function(key){
        for(j = 0 ;j < iroad2.data.dataElements.length;j++){
            if(iroad2.data.dataElements[j].name == key){
                return (iroad2.data.dataElements[j].optionSet != undefined);
            }
        };
        return false;
    }
    $scope.getOptionSets = function(key){
        for(j = 0 ;j < iroad2.data.dataElements.length;j++){
            if(iroad2.data.dataElements[j].name == key){
                return iroad2.data.dataElements[j].optionSet.options;
            }
        };
        return false;
    }

    $scope.addAccidentWitness = function(dhis2Event){

        var modalInstance = $modal.open({
            templateUrl: 'views/add_accident_witness_dialog.html',
            controller: 'WitnessFormController',
            resolve: {
                dhis2Event: function () {
                    return dhis2Event;
                }
            }
        });

        modalInstance.result.then(function (){
        });
    };

    $scope.watchEditingVehicle = function(program,dataElement){
        $scope.$watch("editingEventVehicle['"+dataElement.name+"']", function (newValue, oldValue) {
            //alert("Program:" + JSON.stringify(program));
            if(newValue != "")
            {
                var relationModal = new  iroad2.data.Modal(program.name,[]);
                relationModal.get(new iroad2.data.SearchCriteria(dataElement.name,"=",newValue),function(result){
                    //console.log("Relation Modal:" + JSON.stringify(result));
                    if(result.length > 0)
                    {
                        angular.forEach($scope.savableEventData, function (savableData) {
                            if(savableData.name == dataElement.name){
                                savableData.value = result[0];

                            }
                        });
                    }else{
                        angular.forEach($scope.savableEventData, function (savableData) {
                            if(savableData.name == dataElement.name){
                                savableData.value = null;
                            }
                        });
                    }
                    $scope.$apply();
                });
            }
        });
    };


    $scope.EditAccidentVehicle  = function(event){
        //console.log(JSON.stringify(iroad2.data.programs));
        angular.forEach(iroad2.data.programs, function (program) {
            if (program.name == accidentVehicleEventModal.getModalName()) {
                $scope.editingProgram = program;
            }
        });
        $scope.savableEventData = [];
        $scope.editingEventVehicle = event;
        //console.log('Editing' + JSON.stringify(event));
        for (var key in event) {
            if (typeof event[key] == "object") {
                var program = accidentVehicleEventModal.getProgramByName(key);
                angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
                    if (dataElement.dataElement.code) {
                        if(dataElement.dataElement.code.startsWith("id_")){
                            $scope.editingEventVehicle[dataElement.dataElement.name] = event[key][dataElement.dataElement.name];
                            $scope.savableEventData.push({"name":dataElement.dataElement.name,"key":key,"value":event[key]});
                            $scope.watchEditingVehicle(program,dataElement.dataElement);
                            delete $scope.editingEventVehicle[key];
                        }
                    }
                });
            }
        }
    };


    $scope.addNewAccidentVehicle = function(){

        var modalName = accidentVehicleEventModal.getModalName();
        var event = {};
        angular.forEach(iroad2.data.programs, function (program) {
            if (program.name == modalName) {
                angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
                    if(dataElement.dataElement.name.startsWith(iroad2.config.refferencePrefix)){
                        event[dataElement.dataElement.name.replace(iroad2.config.refferencePrefix,"")] = {};
                    }else{
                        event[dataElement.dataElement.name] = "";
                    }

                });
            }
        });
        angular.forEach(accidentVehicleEventModal.getRelationships(), function (relationship) {
            if(relationship.pivot){
                event[relationship.pivot] = [];
            }
        });
        $scope.EditAccidentVehicle(event);
    }

    $scope.addNewAccidentVehicle();

    $scope.saveAccidentWitness = function(){

        $scope.WitnessCurrentSaving = true;
        $scope.WitnessSavingSuccess = false;
        $scope.WitnessSavingFailure = false;

        angular.forEach($scope.savableEventData, function (savableData) {
            delete $scope.editingEventVehicle[savableData.name];
            $scope.editingEventVehicle[savableData.key] = savableData.value;
        });

        var otherData = {orgUnit:"wardNwId314",status: "COMPLETED",storedBy: "admin"};

        $scope.editingEventVehicle.Accident['id'] = $scope.accident_reg_id ;
        var saveEvent = $scope.editingEventVehicle;

        //console.log("Saving Data:" + JSON.stringify(saveEvent));
        accidentVehicleEventModal.save(saveEvent,otherData,function(result){

            $scope.WitnessCurrentSaving = false;
            $scope.WitnessSavingSuccess = true;
            $scope.WitnessSavingFailure = false;

            //console.log("Save Made:" + JSON.stringify(result));
            $scope.close();

        },function(error){
            $scope.WitnessCurrentSaving = false;
            $scope.WitnessSavingSuccess = false;
            $scope.WitnessSavingFailure = true;

        },accidentVehicleEventModal.getModalName());


    }



});
function viewAccident(i){
    console.log(JSON.stringify(accidentPopup[i]));
    accidentPopup[i].callback();
}
