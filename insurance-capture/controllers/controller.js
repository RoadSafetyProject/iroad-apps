
'use strict';

/* Controllers */
var eventCaptureControllers = angular.module('eventCaptureControllers', ["ui.date"]);

//Controller for settings page
eventCaptureControllers.controller('MainController',
    function($scope,$modal,$timeout,$translate,$anchorScroll,storage,Paginator,OptionSetService,ProgramFactory,ProgramStageFactory,
             DHIS2EventFactory,DHIS2EventService,ContextMenuSelectedItem,DateUtils)
    {
        var insuranceEventModal = new iroad2.data.Modal("Vehicle Insurance History",[]);
        var insuranceCompanyModal = new iroad2.data.Modal("Insurance Company",[]);



        //selected org unit
        $scope.today = DateUtils.getToday();
        $scope.data = {};
        $scope.pager = {};
        $scope.pageSize = 10;
    	$scope.pageChanged = function(page) {
    	                	$scope.fetchCompanies(page);
    	                };
    	$scope.fetchCompanies = function(pageSize,page){
    		insuranceCompanyModal.getAll(function(result){
            	$scope.data.insurance = result.data;
                $scope.pager = result.pager;
                $scope.$apply();
            },pageSize,page,true);
    	}

        $scope.setDescription = function(key){

            for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
                if(iroad2.data.dataElements[j].name == key){
                    if(iroad2.data.dataElements[j].description){
                        return iroad2.data.dataElements[j].description;
                    }
                }
            }
        }
        $scope.isRequired = function(key){
        	console.log(JSON.stringify(iroad2.data.programs));
        	var compulsory = false;
        	angular.forEach(iroad2.data.programs,function(program){
        		angular.forEach(program.programStages[0].programStageDataElements,function(programStageDataElement){
        			compulsory = programStageDataElement.compulsory;
            	});
        	});
            return compulsory;
        }
        $scope.isInteger = function(key){
            return $scope.is(key,"NUMBER");
        }
        $scope.isDate = function(key){
            return $scope.is(key,"DATE");
        }
        $scope.isString = function(key){
            return $scope.is(key,"TEXT");
        }
        $scope.isBoolean = function(key){
            return $scope.is(key,"BOOLEAN");
        };
        $scope.is = function(key,dataType){
            for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
                if(iroad2.data.dataElements[j].name == key){
                    if(iroad2.data.dataElements[j].valueType == dataType){
                        return true;
                    }
                    break;
                }
            }
            return false;
        };
        $scope.hasDataSets = function(key){
            for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
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
            $scope.fetchCompanies($scope.pageSize,1);
        }
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
            $scope.registerInsurance(event);
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

            var otherData = {orgUnit:iroad2.data.user.organisationUnits[0].id,status: "COMPLETED",storedBy: "admin",eventDate:new Date()};
            var saveEvent = $scope.editingEvent;
            insuranceCompanyModal.save(saveEvent,otherData,function(result){
            	if(result.importSummaries[0].status == "SUCCESS")
            	{
            		$scope.CurrentSaving = false;
                    $scope.UpdatedSuccess = true;
                    $scope.UpdateFailure = false;
                    saveEvent.id = result.importSummaries[0].reference;
                    $scope.data.insurance.push(saveEvent);
                    $scope.$apply();
                    alert("Insurance information saved successfully.");
            	}


            },function(error){
                $scope.CurrentSaving = false;
                $scope.UpdatedSuccess = false;
                $scope.UpdateFailure = true;

            },insuranceCompanyModal.getModalName());

            //iniate hiding form for adding or editing insurance comapany
            $scope.editing = false;
            $scope.normalClass= "mws-panel grid_8";
            $scope.viewinsuranceComp = false;
        }

        $scope.saveInsuredVehicle = function(){
            $scope.UpdatedSuccess = true;
            angular.forEach($scope.savableEventData, function (savableData) {
                delete $scope.editingEventInsured[savableData.name];
                $scope.editingEventInsured[savableData.key] = savableData.value;
            });


            var otherData = {orgUnit:"ij7JMOFbePH",status: "COMPLETED",storedBy: "admin",eventDate:$scope.editingEventInsured['Accident Date']};
            var saveEvent = $scope.editingEventInsured;
            insuranceCompanyModal.save(saveEvent,otherData,function(result){
                $scope.CurrentSaving = false;
                $scope.UpdatedSuccess = true;
                $scope.UpdateFailure = false;

            },function(error){
                $scope.CurrentSaving = false;
                $scope.UpdatedSuccess = false;
                $scope.UpdateFailure = true;

            },insuranceCompanyModal.getModalName());

            //hiding aside form and view for manupulation of
            $scope.register = false ;
            $scope.normalClass= "mws-panel grid_8";
            $scope.viewinsuranceComp = false;

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
            angular.forEach(iroad2.data.programs, function (program) {
                if (program.name == insuranceEventModal.getModalName()) {
                    $scope.editingProgram = program;
                }
            });
            $scope.savableEventData = [];
            $scope.editingEventInsured = event;
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


        //function to enable adding new insurance company
        $scope.registerInsurance = function(event){
            $scope.header = "Add New Insurance Company";
            $scope.editing = true;
            $scope.viewinsuranceComp = false;
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "mws-panel grid_6";
            $scope.normalClassDriver= "mws-panel grid_6";
            $scope.normalClassVehicle= "mws-panel grid_6";
            $scope.normalClassMedia= "mws-panel grid_6";
            $scope.normalStyleDriver= { "padding": '0px'};
            $scope.normalStyleVehicle= { "padding": '0px'};
            $scope.normalStyleMedia= { "padding": '0px'};
            angular.forEach(iroad2.data.programs, function (program) {
                if (program.name == insuranceCompanyModal.getModalName()) {
                    $scope.editingProgram = program;
                }
            });
            $scope.savableEventData = [];
            $scope.editingEvent = event;
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

        //function for editng insurance company
        $scope.enableEdit  = function(event){
            $scope.editing = true;
            $scope.viewinsuranceComp = false;
            $scope.header = "Edit Insurance Company";
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "mws-panel grid_6";
            $scope.normalClassDriver= "mws-panel grid_6";
            $scope.normalClassVehicle= "mws-panel grid_6";
            $scope.normalClassMedia= "mws-panel grid_6";
            $scope.normalStyleDriver= { "padding": '0px'};
            $scope.normalStyleVehicle= { "padding": '0px'};
            $scope.normalStyleMedia= { "padding": '0px'};
            angular.forEach(iroad2.data.programs, function (program) {
                if (program.name == insuranceCompanyModal.getModalName()) {
                    $scope.editingProgram = program;
                }
            });
            $scope.savableEventData = [];
            $scope.editingEvent = event;
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
            $scope.editing = true;
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "mws-panel grid_6";
            $scope.normalClassDriver= "mws-panel grid_6";
            $scope.normalClassVehicle= "mws-panel grid_6";
            $scope.normalClassMedia= "mws-panel grid_6";
            $scope.normalStyleDriver= { "padding": '0px'};
            $scope.normalStyleVehicle= { "padding": '0px'};
            $scope.normalStyleMedia= { "padding": '0px'};
            angular.forEach(iroad2.data.programs, function (program) {
                if (program.name == insuranceEventModal.getModalName()) {
                    $scope.editingProgram = program;
                }
            });
            $scope.savableEventData = [];
            $scope.editingEventInsured = event;
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

        //function to cancel sidebar nav
        $scope.cancelEdit = function(){
            $scope.normalClass= "mws-panel grid_8";
            $scope.editing = false;
            $scope.viewinsuranceComp = false;
        }


        //function to view insurance comapany profile
        $scope.ViewInsurance = function(dhis2Event){
            $scope.editing = false;
            $scope.viewinsuranceComp = true;
            $scope.normalClass= "mws-panel grid_6";
            $scope.event = dhis2Event;

        };

        $scope.watchEditing = function(program,dataElement){
            $scope.$watch("editingEvent['"+dataElement.name+"']", function (newValue, oldValue) {
                //alert("Program:" + JSON.stringify(program));
                if(newValue != "")
                {
                    var relationModal = new  iroad2.data.Modal(program.name,[]);
                    relationModal.get(new iroad2.data.SearchCriteria(dataElement.name,"=",newValue),function(result){
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
        $scope.close = function () {
            $modalInstance.close();
        };
    });



