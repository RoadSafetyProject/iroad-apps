
'use strict';

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
            accidentEventModal.getAll(function(result){
                console.log("Accidents:" + JSON.stringify(result));
                $scope.data.accidents = result;
                $scope.$apply();
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

            console.log("Saving Data:" + JSON.stringify($scope.editingEvent));
            var otherData = {orgUnit:"ij7JMOFbePH",status: "COMPLETED",storedBy: "admin",eventDate:$scope.editingEvent['Accident Date']};
            var saveEvent = $scope.editingEvent;
            accidentEventModal.save(saveEvent,otherData,function(result){
                console.log("Update Made:" + JSON.stringify(result));
                $scope.CurrentSaving = false;
                $scope.UpdatedSuccess = true;
                $scope.UpdateFailure = false;
                console.log($scope.CurrentSaving);

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
            $scope.normalStyleDriver= { "padding": '0px'};
            $scope.normalStyleVehicle= { "padding": '0px'};
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


        //Show Driver involved in an accident
        $scope.showDriver  = function(driver) {
            $scope.normalClassDriver= "mws-panel grid_8";
            $scope.showingDriver = "true";
            $scope.showingVehicle = "false";
            $scope.data.accident = driver;
            //alert("Driver:" + JSON.stringify($scope.data.accident));
        }


        //Show Vehicle involved in an accident
        $scope.showVehicle  = function(vehicle) {
            $scope.normalClassVehicle= "mws-panel grid_8";
            $scope.showingVehicle = "true";
            $scope.showingDriver = "false";
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
        console.log('Accident' +JSON.stringify($scope.dhis2Event));

        $scope.close = function () {
            $modalInstance.close();
        };
    });

eventCaptureControllers.controller('AccidentFormController',function($scope,$modal,$modalInstance,dhis2Event){


   var accidentEventModal = new iroad2.data.Modal("Accident",[]);

    $scope.dhis2Event = dhis2Event;
    console.log(dhis2Event);
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
        console.log('Adding' + JSON.stringify(event));
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
        $scope.AccSavingSuccess = false;
        $scope.AccSavingFailure = false;

        angular.forEach($scope.savableEventData, function (savableData) {
            delete $scope.editingEvent[savableData.name];
            $scope.editingEvent[savableData.key] = savableData.value;
        });

        console.log("Saving Data:" + JSON.stringify($scope.editingEvent));
        var otherData = {orgUnit:"zs9X8YYBOnK",status: "COMPLETED",storedBy: "admin",eventDate:$scope.editingEvent['Accident Date']};
        var saveEvent = $scope.editingEvent;

        //console.log("Save Made:" + JSON.stringify(saveEvent));

        accidentEventModal.save(saveEvent,otherData,function(result){
            $scope.AccCurrentSaving = false;
            $scope.AccSavingSuccess = true;
            $scope.AccSavingFailure = false;

            console.log("Save Made:" + JSON.stringify(result.importSummaries[0].reference));
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
    console.log($scope.accident_reg_id);

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
    console.log($scope.accident_reg_id);

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

        console.log("Saving Data:" + JSON.stringify(saveEvent));
        accidentVehicleEventModal.save(saveEvent,otherData,function(result){
            $scope.PassengerCurrentSaving = false;
            $scope.PassengerSavingSuccess = true;
            $scope.PassengerSavingFailure = false;

            console.log("Save Made:" + JSON.stringify(result));
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
    console.log($scope.accident_reg_id);

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

        console.log("Saving Data:" + JSON.stringify(saveEvent));
        accidentVehicleEventModal.save(saveEvent,otherData,function(result){

            $scope.WitnessCurrentSaving = false;
            $scope.WitnessSavingSuccess = true;
            $scope.WitnessSavingFailure = false;

            console.log("Save Made:" + JSON.stringify(result));
            $scope.close();

        },function(error){
            $scope.WitnessCurrentSaving = false;
            $scope.WitnessSavingSuccess = false;
            $scope.WitnessSavingFailure = true;

        },accidentVehicleEventModal.getModalName());


    }



});