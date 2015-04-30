/**
 * Created by kelvin on 4/24/15.
 */
'use strict';
/* Controllers */
var eventCaptureControllers = angular.module('eventCaptureControllers', [])

//Controller for settings page
    .controller('MainController',
    function($scope,
             $modal,
             $timeout,
             $translate,
             $anchorScroll,
             storage,
             Paginator,
             OptionSetService,
             ProgramFactory,
             ProgramStageFactory,
             DHIS2EventFactory,
             DHIS2EventService,
             ContextMenuSelectedItem,
             DateUtils,
             $filter,
             $http,
             CalendarService,
             GridColumnService,
             CustomFormService,
             ErrorMessageService,
             ModalService,
             DialogService) {
        //selected org unit
        $scope.today = DateUtils.getToday();
        $scope.data = {};

        $scope.programUrl = "../../programs.json?filters=type:eq:3&paging=false&fields=id,name,version,programStages[id,version,programStageSections[id],programStageDataElements[dataElement[id,name,type,code,optionSet[id,name,options[id,name],version]]]]";
        $http.get($scope.programUrl).success(function(data){
            $scope.data.programs = {};
            angular.forEach(data.programs, function(program1){
                $scope.data.programs[program1.name] = {};

                $scope.data.programs[program1.name].name= program1.name;
                 $scope.data.programs[program1.name].id= program1.id;
                 $scope.data.programs[program1.name].version= 1;
                 $scope.data.programs[program1.name].programStages= program1.programStages;
            });
//            $scope.data.programs = data.programs;
            angular.forEach($scope.data.programs,function(program){
                program.dataValues = {};
                program.dataValues.events = [];
                $http.get('../../../api/events.json?program='+program.id).success(function(data){
                    if(data.events){
                        angular.forEach(data.events,function(datas){
                            var event = datas.event;
                            var program1 = datas.program;
                            var programstage = datas.programStage;
                            var orgunit = datas.orgUnit;
                            var orgunitName = datas.orgUnitName;
                            var eventDate = datas.eventDate;
                            var datavalues = {};
                            angular.forEach(program.programStages[0].programStageDataElements, function (dataVal) {
                                var dataelement = {};
                                datavalues[dataVal.dataElement.name] = {}
                                dataelement.id = dataVal.dataElement.id;
                                dataelement.name = dataVal.dataElement.name;
                                dataelement.type = dataVal.dataElement.type;
                                if(dataVal.dataElement.optionSet){
                                    dataelement.optionSet = dataVal.dataElement.optionSet;
                                }

                                angular.forEach(datas.dataValues, function (newDatval) {
                                    if (newDatval.dataElement == dataVal.dataElement.id) {
                                        if(dataelement.name.indexOf("Program_")!= -1){
                                            var arr = (dataelement.name.split("_"));
                                            arr.splice(0,1);
                                            console.log(JSON.stringify(arr))
                                            var name = arr.join(" ");
                                            name.trim();
                                            $http.get('../../../api/events/'+newDatval.value+'.json').success(function(data1){
                                                dataelement[name] = data1;
                                                dataelement.value = newDatval.value;
                                            });
                                        }else{
                                            dataelement.value = newDatval.value;
                                        }
                                    }
                                })
                                datavalues[dataVal.dataElement.name] =  dataelement;
                            })
                            program.dataValues.events.push({event: event, program: program1, programStage: programstage, orgUnit: orgunit, orgUnitName: orgunitName, eventDate: eventDate, dataValues: datavalues});

                        });

                    }
                    $scope.getSelectedProgram("Vehicle");
                });
            });


        });

        $scope.data.selectedprogram = [];
        $scope.getSelectedProgram = function(name,manyToMany){
            angular.forEach($scope.data.programs, function (prog) {
                if (prog.name == name) {
                    $scope.data.selectedprogram = prog;
                }
            });
        }

        $scope.normalClass= "col-sm-12";
        $scope.normalStyle= { "z-index": '1000'};
        $scope.enableEdit  = function(events){
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "col-sm-9";
            $scope.editing = "true";
            angular.forEach($scope.data.programs, function (prog) {
                if (prog.id == events.program) {
                    $scope.editingProgram = prog;
                }
            });
            $scope.editingEvent = events;
        }

        $scope.enableAdding  = function(){
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "col-sm-9";
            $scope.adding = "true";
            $scope.editing = "false";
        }

        $scope.cancelEdit = function(){
            $scope.normalClass= "col-sm-12";
            $scope.editing = "false";
            $scope.adding = "false";
        }

        $scope.cancelAdd = function(){
            $scope.normalClass= "col-sm-12";
            $scope.adding = "false";
            $scope.editing = "false";
        }

        $scope.AddVehicle =function(value){
            var program = $scope.data.programs['Vehicle'].id;
            var programStage = $scope.data.programs['Vehicle'].programStages[0].id;
            var date1 = new Date();
            $scope.savingDate = date1.toISOString();
            var datavaluess = [];
            angular.forEach(value,function(data,key){
                datavaluess.push({
                    dataElement: key,
                    value: data
                })
            })
            var dhis2Event = {
                program: program,
                programStage: programStage,
                status: "ACTIVE",
                orgUnit: "ij7JMOFbePH",
                eventDate: $scope.savingDate,
                dataValues: datavaluess
            };
            $scope.currentSaving = true;
            $.postJSON = function(url, data, callback,failureCallback) {
                return jQuery.ajax({
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'admin':'district'
                    },
                    'type': 'POST',
                    'url': url,
                    'data': JSON.stringify(data),
                    'dataType': 'json',
                    'success': callback,
                    'failure':failureCallback
                });
            };
            $.postJSON('../../../api/events',dhis2Event,function(response){
                alert("success")
            },function(response){
                 alert("failed");
            });
//            $http.post("../../api/events", dhis2Event).success(function (newVehicle) {
//                console.log(newVehicle);
//                $scope.kayaSavedSuccess = true;
//                $scope.currentSaving = false;
//                $scope.kayaSavedFalue = false;
//            }).error(function(){
//                $scope.kayaSavedSuccess = false;
//                $scope.currentSaving = false;
//                $scope.kayaSavedFalue = true;
//            });

        }

//        angular.forEach($scope.data.programs, function (prog) {
//            if (prog.name == "Vehicle") {
//                $scope.data.selectedprogram = prog;
//            }
//        });

//        ProgramFactory.getAll().then(function(programs){
//            $scope.data.programs = [];
//            angular.forEach(programs, function(program){
//                $scope.data.programs.push(
//                    {
//                        name: program.name,
//                        id: program.id,
//                        version: 1,
//                        programStages: program.programStages});
//
//            });
//            angular.forEach($scope.data.programs,function(program){
//                ProgramStageFactory.get(program.programStages[0].id).then(function (programStage){
//                    program.programStages[0].programStageDataElements = [];
//                    angular.forEach(programStage.programStageDataElements,function(dataElement){
//                        //check if there is optionsets and add them
//                        if(dataElement.dataElement.optionSet){
//                            OptionSetService.get(dataElement.dataElement.optionSet.id).then(function (optionSet){
//                                dataElement.dataElement.optionSet.name =  optionSet.name;
//                                dataElement.dataElement.optionSet.options =  optionSet.options;
//                            });
//                        }
//                        program.programStages[0].programStageDataElements.push({dataElement:dataElement.dataElement})
//                    });
//                    program.dataValues = {};
//                    program.dataValues.events = [];
//                    var programStage = program.programStages[0].id
//                    DHIS2EventFactory.getByStage("ij7JMOFbePH" , program.programStages[0].id ).then(function(data){
//                        if(data.events){
//                            angular.forEach(data.events,function(datas){
//                                var event = datas.event;
//                                var program1 = datas.program;
//                                var programstage = datas.programStage;
//                                var orgunit = datas.orgUnit;
//                                var orgunitName = datas.orgUnitName;
//                                var eventDate = datas.eventDate;
//                                var datavalues = [];
//                                angular.forEach(program.programStages[0].programStageDataElements, function (dataVal) {
//                                    var dataelement = {};
//                                    dataelement.id = dataVal.dataElement.id;
//                                    dataelement.name = dataVal.dataElement.name;
//                                    dataelement.type = dataVal.dataElement.type;
//                                    if(dataVal.dataElement.optionSet){
//                                        dataelement.optionSet = dataVal.dataElement.optionSet;
//                                    }
//                                    angular.forEach(datas.dataValues, function (newDatval) {
//                                        if (newDatval.dataElement == dataVal.dataElement.id) {
//                                            dataelement.value = newDatval.value;
//                                        }
//                                    })
//                                    datavalues.push(dataelement);
//                                })
//                                program.dataValues.events.push({event: event, program: program1, programStage: programstage, orgUnit: orgunit, orgUnitName: orgunitName, eventDate: eventDate, dataValues: datavalues});
//
//                            });
//
//                        }else{
//
//                        }
//                    });
//                });
//            });
//            $scope.data.events ={};
//            $scope.data.selectedprogram = [];
//            angular.forEach($scope.data.programs, function (prog) {
//                if (prog.name == "Vehicle") {
//                    $scope.data.selectedprogram = prog;
//                }
//            });
//            $scope.vehiclepriorityList = [{'name':'Model', 'display':'Model'},
//                {'name':'Model', 'display':'Fuel'},
//                {'name':'Model', 'display':'Make'},
//                {'name':'Ownership Category', 'display':'Ownership Category'},
//                {'name':'Vehicle Plate Number', 'display':'Plate Number'}]
//            $scope.data.events.programs =  ($filter('orderBy')($scope.data.programs, "name"));
//
//
//
//
//
//
//        });

        $scope.normalClass= "col-sm-12";
        $scope.normalStyle= { "z-index": '1000'};
        $scope.enableEdit  = function(events){
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "col-sm-9";
            $scope.editing = "true";
            angular.forEach($scope.data.programs, function (prog) {
                if (prog.id == events.program) {
                    $scope.editingProgram = prog;
                }
            });
            $scope.editingEvent = events;
        }

        $scope.cancelEdit = function(){
            $scope.normalClass= "col-sm-12";
            $scope.editing = "false";
        }

        /**Add new event for first time
         *
         * @param dataelen
         * @param value
         * @param newVal
         * @param program
         */
//        $scope.addData = function(dataelen,value,newVal,program,item){
//            if(value && value != ""){
//                if($scope.getRowLength(newVal) == 1 ) {
//                    if ($scope.isInt(value, item.type)) {
//                        var dhis2Event = {
//                            program: program.id,
//                            programStage: program.programStages[0].id,
//                            status: "ACTIVE",
//                            orgUnit: $scope.currentOrgUnit,
//                            eventDate: $scope.savingDate,
//                            dataValues: [
//                                {
//                                    dataElement: dataelen,
//                                    value: value
//                                }
//                            ]
//                        };
//                        item.color = { "background-color": $scope.colorYellow, 'width': $scope.cellWidth, 'text-align': $scope.textAlign  };
//
//                        //send the new event to server
//                        DHIS2EventFactory.create(dhis2Event).then(function(data) {
//                            if (data.importSummaries[0].status === 'ERROR') {
//                                alert(failed)
//                                console.log(data)
//                            }
//                            else {
//                                var event1 = data.importSummaries[0].reference;
//                                var program1 = program.id;
//                                var programstage =  program.programStages[0].id;
//                                var orgunit = $scope.currentOrgUnit;
//                                var eventDate = $scope.savingDate;
//                                var datavalues = [];
//                                angular.forEach(program.programStages[0].programStageDataElements, function (program1) {
//                                    var dataelement = {};
//                                    dataelement.id = program1.dataElement.id;
//                                    dataelement.name = program1.dataElement.name;
//                                    dataelement.type = program1.dataElement.type;
//                                    dataelement.color = { "background-color": $scope.normalColor, 'width': $scope.cellWidth, 'text-align': $scope.textAlign  };
//                                    if(program1.dataElement.optionSet){
//                                        dataelement.optionSet = program1.dataElement.optionSet;
//                                    }
//                                    if (dataelen == program1.dataElement.id) {
//                                        dataelement.color = { "background-color": $scope.colorGreen, 'width': $scope.cellWidth, 'text-align': $scope.textAlign  };
//                                        dataelement.value = value
//                                    }
//                                    datavalues.push(dataelement);
//                                });
//                                console.log({event: event1, program: program1, programStage: programstage, orgUnit: orgunit, eventDate: eventDate, dataValues: datavalues})
//                                program.dataValues.events.push({event: event1, program: program1, programStage: programstage, orgUnit: orgunit, eventDate: eventDate, dataValues: datavalues});
//                                $scope.data.newValue = {};
//                            }
//                        });
//
//
//                    } else {
//                        alert("Value must be a number \n \n " + item.name);
//                        item.color = { "background-color": $scope.colorYellow, 'width': $scope.cellWidth, 'text-align': $scope.textAlign  };
//                        $scope.data.newValue = {};
//                    }
//                }
//            }else{
//                console.log('cant send empty')
//            }
//
//
//        }

        $scope.clickMe = function(event){
            $(event.target).datepicker();
            console.log(event.target)
        }

        /**send new update to server
         *
         * TODO send this value to server and manage color change and offline support
         * @param dataElement
         * @param newVal
         * @param program
         * @param event
         * @param item
         * @param programArray
         */
//        $scope.updateData = function(dataElement,newVal,program,event,item,programArray){
//
//            if($scope.isInt(newVal,item.type)){
//                var updatedSingleValueEvent = {event: program.event, dataValues: [{value: newVal, dataElement: dataElement}]};
//                var e = {};
//
//                e.event         = program.event;
//                e.status        = 'ACTIVE';
//                e.program       = program.program;
//                e.programStage  = program.programStage;
//                e.orgUnit       = program.orgUnit;
//                e.eventDate     = program.eventDate;;
//
//                var dvs = [];
//                angular.forEach(program.dataValues, function(prStDe){
//                    if(prStDe.value){
//                        dvs.push({dataElement: prStDe.id, value: prStDe.value });
//                    }
//                });
//
//                e.dataValues = dvs;
//
//                var updatedFullValueEvent = e;
//                item.color = { "background-color": $scope.colorYellow, 'width': $scope.cellWidth, 'text-align': $scope.textAlign  };
//                $http.put('/api/events/' + updatedSingleValueEvent.event + '/' + updatedSingleValueEvent.dataValues[0].dataElement, updatedSingleValueEvent ).then(function(response){
//                    return response.data;
//                });
////                    DHIS2EventFactory.updateForSingleValue(updatedSingleValueEvent, updatedFullValueEvent).then(function(data){
////                        if(newVal && newVal != "") {
////                            item.color = { "background-color": $scope.colorGreen, 'width': $scope.cellWidth, 'text-align': $scope.textAlign  };
////                        }else{
////                            item.color = { "background-color": $scope.normalColor, 'width': $scope.cellWidth, 'text-align': $scope.textAlign  };
////                        }
////                    });
//            }else{
//                alert("Value must be a number \n \n "+item.name);
//                item.value = null;
////                    item.color = { "background-color" : $scope.colorYellow,'width':$scope.cellWidth,'text-align':$scope.textAlign  };
//            }
//        }

        /**CheckForIntegerType
         *
         * @param value
         * @param type
         * @returns {boolean}
         */
        $scope.isInt = function(value,type){
            if(type == 'int' && value != null){
                if(value != ""){
                    var number = new Number( value );
                    if ( isNaN( number ))
                    {
                        return false;
                    }
                }
                return true;
            }else{
                return true;
            }

        }

        /**Check if column is empty
         *
         */
        $scope.checkColumDataLength = function(event){
            var counter = 0;
            angular.forEach(event.dataValues,function(ev) {
                if (ev.value == null || ev.value == "") {

                } else {
                    counter++
                }
            });
            return counter;
        }


    });