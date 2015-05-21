
'use strict';
var accidentPopup = [];
/* Controllers */
var eventCaptureControllers = angular.module('eventCaptureControllers', ["ui.date"]);

//Controller for settings page
eventCaptureControllers.controller('MainController',
    function($scope,$modal,$timeout,$translate,$anchorScroll,storage,Paginator,OptionSetService,ProgramFactory,ProgramStageFactory,
             DHIS2EventFactory,DHIS2EventService,ContextMenuSelectedItem,DateUtils,$filter,$http,CalendarService,GridColumnService,
             CustomFormService,ErrorMessageService,ModalService,DialogService)
    {
        var accidentEventModal = new iroad2.data.Modal("Accident Vehicle",[]);
        //var accidentEventModal = new iroad2.data.Modal("Accident",[]);
        //selected org unit

        $scope.today = DateUtils.getToday();
        $scope.data = {};


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


        $scope.onInitializeAccident = function(){

            $scope.recentAccidents = new Array();

            accidentEventModal.getAll(function(result){
                //console.log("Accidents:" + JSON.stringify(result));
                $scope.data.accidents = result;
                $scope.$apply();

                angular.forEach($scope.data.accidents, function (recent_accident) {
                    console.log('recent_accident:' + JSON.stringify(recent_accident));
                    $scope.recentAccidents.push(recent_accident);
                });



                //Map
                // Define your accidents: HTML content for the info window, latitude, longitude


                var accidents = $scope.recentAccidents ;

            /*    var accidents = [
                    ['Bondi Accident', -6.63883676, 39.19136727],
                    ['Coogee Accident', -6.7841000000000005, 39.208666666666666],
                    ['Cronulla Accident',-6.77151607, 39.23985423]
                ];
            */
                // Setup the different icons and shadows
                var iconURLPrefix = 'http://maps.google.com/mapfiles/ms/icons/';

                var icons = [
                    iconURLPrefix + 'red-dot.png',
                    iconURLPrefix + 'green-dot.png',
                    iconURLPrefix + 'blue-dot.png',
                    iconURLPrefix + 'orange-dot.png',
                    iconURLPrefix + 'purple-dot.png',
                    iconURLPrefix + 'pink-dot.png',
                    iconURLPrefix + 'yellow-dot.png'
                ]
                var iconsLength = icons.length;

                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 20,
                    center: new google.maps.LatLng(-37.92, 151.25),
                    mapTypeId: google.maps.MapTypeId.HYBRID,
                    mapTypeControl: false,
                    streetViewControl: false,
                    panControl: false,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.LEFT_BOTTOM
                    }
                });

                var infowindow = new google.maps.InfoWindow({
                    maxWidth: 160
                });

                var markers = new Array();

                var iconCounter = 0;

                // Add the markers and infowindows to the map
                for (var i = 0; i < accidents.length; i++) {
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(accidents[i]['Accident']['Latitude'], accidents[i]['Accident']['Longitude']),
                        animation:google.maps.Animation.BOUNCE,
                        map: map,
                        icon: iconURLPrefix + 'green-dot.png'
                    });

                    markers.push(marker);

                    google.maps.event.addListener(marker, 'click', (function(marker, i) {
                        return function() {
                            //infowindow.setContent( accidents[i]['Accident Registration Number'] + "</a>" );
                            //infowindow.open(map, marker);
                            $scope.ViewAccident(accidents[i]);
                            //accidentPopup.push({callback:$scope.ViewAccident(accidents[i])});
                        }
                    })(marker, i));

                    iconCounter++;
                    // We only have a limited number of possible icon colors, so we may have to restart the counter
                    if(iconCounter >= iconsLength) {
                        iconCounter = 0;
                    }
                }

                function autoCenter() {
                    //  Create a new viewpoint bound
                    var bounds = new google.maps.LatLngBounds();
                    //  Go through each...
                    for (var i = 0; i < markers.length; i++) {
                        bounds.extend(markers[i].position);
                    }
                    //  Fit these bounds to the map
                    map.fitBounds(bounds);
                }
                autoCenter();

                //End Map

            });

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


        $scope.normalClass= "mws-panel grid_8";

        $scope.addNewAccident = function(modalName){
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
            });console.log('Event Accident' + event);
            $scope.enableEdit(event);
        }

        $scope.save = function(){
            $scope.UpdatedSuccess = true;
            angular.forEach($scope.savableEventData, function (savableData) {
                delete $scope.editingEvent[savableData.name];
                $scope.editingEvent[savableData.key] = savableData.value;
            });

        //console.log("Saving Data:" + JSON.stringify($scope.editingEvent));
            var otherData = {orgUnit:"zs9X8YYBOnK",
                             status: "COMPLETED",
                             storedBy: "admin",
                             eventDate:$scope.editingEvent['Accident Date']};

            var saveEvent = $scope.editingEvent;
            accidentEventModal.save(saveEvent,otherData,function(result){
            //console.log("Update Made:" + JSON.stringify(result));
                $scope.CurrentSaving = false;
                $scope.UpdatedSuccess = true;
                $scope.UpdateFailure = false;
            //console.log($scope.CurrentSaving);

                //$scope.editing = false;
                //$scope.normalClass= "mws-panel grid_8";
                //$scope.normalClassDriver= "mws-panel grid_8";
                //$scope.normalClassVehicle= "mws-panel grid_8";

            },function(error){
                $scope.CurrentSaving = false;
                $scope.UpdatedSuccess = false;
                $scope.UpdateFailure = true;

            },accidentEventModal.getModalName());



        }

        $scope.enableEdit  = function(event){
            $scope.editing = "true";
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "mws-panel grid_6";
            $scope.normalClassDriver= "mws-panel grid_6";
            $scope.normalClassVehicle= "mws-panel grid_6";
            $scope.normalClassMedia= "mws-panel grid_6";
            $scope.normalStyleDriver= { "padding": '0px'};
            $scope.normalStyleVehicle= { "padding": '0px'};
            $scope.normalStyleMedia= { "padding": '0px'};
            //console.log(JSON.stringify(iroad2.data.programs));
            angular.forEach(iroad2.data.programs, function (program) {
                if (program.name == accidentEventModal.getModalName()) {
                    $scope.editingProgram = program;
                }
            });
            $scope.savableEventData = [];
            $scope.editingEvent = event;
            //console.log('Editing' + JSON.stringify(event));
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
        }

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
        var otherData = {orgUnit:"zs9X8YYBOnK",status: "COMPLETED",storedBy: "admin",eventDate:$scope.editingEvent['Time of Accident']};
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

        var otherData = {orgUnit:"zs9X8YYBOnK",status: "COMPLETED",storedBy: "admin"};

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

        var otherData = {orgUnit:"zs9X8YYBOnK",status: "COMPLETED",storedBy: "admin"};

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

        var otherData = {orgUnit:"zs9X8YYBOnK",status: "COMPLETED",storedBy: "admin"};

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