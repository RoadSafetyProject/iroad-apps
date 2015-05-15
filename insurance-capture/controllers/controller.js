
'use strict';

/* Controllers */
var eventCaptureControllers = angular.module('eventCaptureControllers', ["ui.date"]);

//Controller for settings page
eventCaptureControllers.controller('MainController',
    function($scope,$modal,$timeout,$translate,$anchorScroll,storage,Paginator,OptionSetService,ProgramFactory,ProgramStageFactory,
             DHIS2EventFactory,DHIS2EventService,ContextMenuSelectedItem,DateUtils,$filter,$http,CalendarService,GridColumnService,
             CustomFormService,ErrorMessageService,ModalService,DialogService)
    {
        var insuranceEventModal = new iroad2.data.Modal("Vehicle Insurance History",[]);
        var insuranceCompanyModal = new iroad2.data.Modal("Insurance Company",[]);
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
            insuranceCompanyModal.getAll(function(result){
            console.log("Companies:" + JSON.stringify(result));
                $scope.data.insurance = result;
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

        $scope.addNewCompany = function(){
            var modalName = insuranceCompanyModal.getModalName();
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
            angular.forEach(insuranceCompanyModal.getRelationships(), function (relationship) {
                if(relationship.pivot){
                    event[relationship.pivot] = [];
                }
            });
            $scope.enableEdit(event);
        }

        $scope.InsureNewVehicle= function(){
            //$scope.companyName = company ;
            var modalName = insuranceEventModal.getModalName();
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
            angular.forEach(insuranceEventModal.getRelationships(), function (relationship) {
                if(relationship.pivot){
                    event[relationship.pivot] = [];
                }
            });
            $scope.InsureEdit(event);
        }

        $scope.save = function(){
            $scope.UpdatedSuccess = true;
            angular.forEach($scope.savableEventData, function (savableData) {
                delete $scope.editingEvent[savableData.name];
                $scope.editingEvent[savableData.key] = savableData.value;
            });

        //console.log("Saving Data:" + JSON.stringify($scope.editingEvent));
            var otherData = {orgUnit:"zs9X8YYBOnK",status: "COMPLETED",storedBy: "admin"};
            var saveEvent = $scope.editingEvent;
            insuranceCompanyModal.save(saveEvent,otherData,function(result){
            //console.log("Update Made:" + JSON.stringify(result));
                $scope.CurrentSaving = false;
                $scope.UpdatedSuccess = true;
                $scope.UpdateFailure = false;

            },function(error){
                $scope.CurrentSaving = false;
                $scope.UpdatedSuccess = false;
                $scope.UpdateFailure = true;

            },insuranceCompanyModal.getModalName());

            $scope.editing = false;
        }

        $scope.saveInsuredVehicle = function(){
            $scope.UpdatedSuccess = true;
            angular.forEach($scope.savableEventData, function (savableData) {
                delete $scope.editingEventInsured[savableData.name];
                $scope.editingEventInsured[savableData.key] = savableData.value;
            });


            var otherData = {orgUnit:"zs9X8YYBOnK",status: "COMPLETED",storedBy: "admin",eventDate:$scope.editingEventInsured['Accident Date']};
            var saveEvent = $scope.editingEventInsured;
            insuranceCompanyModal.save(saveEvent,otherData,function(result){
                //console.log("Update Made:" + JSON.stringify(result));
                $scope.CurrentSaving = false;
                $scope.UpdatedSuccess = true;
                $scope.UpdateFailure = false;

            },function(error){
                $scope.CurrentSaving = false;
                $scope.UpdatedSuccess = false;
                $scope.UpdateFailure = true;

            },insuranceCompanyModal.getModalName());

            $scope.register = false ;

        }

        $scope.insureVehicle  = function(event){
            $scope.register = "true";
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
                if (program.name == insuranceEventModal.getModalName()) {
                    $scope.editingProgram = program;
                }
            });
            $scope.savableEventData = [];
            $scope.editingEventInsured = event;
            //console.log('Editing' + JSON.stringify(event));
            for (var key in event) {
                if (typeof event[key] == "object") {
                    var program = insuranceEventModal.getProgramByName(key);
                    angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
                        if (dataElement.dataElement.code) {
                            if(dataElement.dataElement.code.startsWith("id_")){
                                $scope.editingEventInsured[dataElement.dataElement.name] = event[key][dataElement.dataElement.name];
                                $scope.savableEventData.push({"name":dataElement.dataElement.name,"key":key,"value":event[key]});
                                $scope.watchEditing(program,dataElement.dataElement);
                                delete $scope.editingEventInsured[key];
                            }
                        }
                    });
                }
            }
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
                if (program.name == insuranceCompanyModal.getModalName()) {
                    $scope.editingProgram = program;
                }
            });
            $scope.savableEventData = [];
            $scope.editingEvent = event;
            //console.log('Editing' + JSON.stringify(event));
            for (var key in event) {
                if (typeof event[key] == "object") {
                    var program = insuranceCompanyModal.getProgramByName(key);
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

        $scope.InsureEdit = function(event){
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
                if (program.name == insuranceEventModal.getModalName()) {
                    $scope.editingProgram = program;
                }
            });
            $scope.savableEventData = [];
            $scope.editingEventInsured = event;
            //console.log('Editing' + JSON.stringify(event));
            for (var key in event) {
                if (typeof event[key] == "object") {
                    var program = insuranceEventModal.getProgramByName(key);
                    angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
                        if (dataElement.dataElement.code) {
                            if(dataElement.dataElement.code.startsWith("id_")){
                                $scope.editingEventInsured[dataElement.dataElement.name] = event[key][dataElement.dataElement.name];
                                $scope.savableEventData.push({"name":dataElement.dataElement.name,"key":key,"value":event[key]});
                                $scope.watchEditing(program,dataElement.dataElement);
                                delete $scope.editingEventInsured[key];
                            }
                        }
                    });
                }
            }
        }


        $scope.cancelEdit = function(){
            $scope.normalClass= "mws-panel grid_8";
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

        $scope.ViewInsurance = function(dhis2Event){
            //console.log(JSON.stringify(dhis2Event));
            var modalInstance = $modal.open({
                templateUrl: 'views/insurance_dialog.html',
                controller: 'InsuranceController',
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

eventCaptureControllers.controller('InsuranceController',
    function($scope,$modalInstance,dhis2Event){

        $scope.dhis2Event = dhis2Event;
        //console.log('Accident' +JSON.stringify($scope.dhis2Event));

        $scope.close = function () {
            $modalInstance.close();
        };
    });



