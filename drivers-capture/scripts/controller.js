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
        $scope.dateOptions1 = {
            changeYear: true,
            changeMonth: true,
            dateFormat: 'yy-mm-dd'
        };
        $scope.today = DateUtils.getToday();
        $scope.data = {};

        $scope.programUrl = "../../programs.json?filters=type:eq:3&paging=false&fields=id,name,version,programStages[id,version,programStageSections[id],programStageDataElements[dataElement[id,name,type,code,optionSet[id,name,options[id,name],version]]]]";
        $http.get($scope.programUrl).success(function(data){
            $scope.data.programs = {};
            var resultProg = data.programs;
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
                                                var event1 = data1.event;
                                                var program11 = data1.program;
                                                var programstage1 = data1.programStage;
                                                var orgunit1 = data1.orgUnit;
                                                var orgunitName1 = data1.orgUnitName;
                                                var eventDate1 = data1.eventDate;
                                                var datavalues1 = {};
                                                angular.forEach(resultProg,function(value2){
                                                    if(value2.id == program11){
                                                        angular.forEach(value2.programStages[0].programStageDataElements, function (dataVal1) {
                                                            var dataelement1 = {};
                                                            datavalues1[dataVal1.dataElement.name] = {}
                                                            dataelement1.id = dataVal1.dataElement.id;
                                                            dataelement1.name = dataVal1.dataElement.name;
                                                            dataelement1.type = dataVal1.dataElement.type;
                                                            if(dataVal1.dataElement.optionSet){
                                                                dataelement1.optionSet = dataVal1.dataElement.optionSet;
                                                            }
                                                            angular.forEach(data1.dataValues, function (newDatval1) {
                                                                if (newDatval1.dataElement == dataVal1.dataElement.id) {
                                                                    dataelement1.value = newDatval1.value;
                                                                }
                                                            });

                                                            datavalues1[dataVal1.dataElement.name] =  dataelement1;

                                                        });
                                                    }

                                                })


                                                dataelement[name] = {event: event1, program: program11, programStage: programstage1, orgUnit: orgunit1, orgUnitName: orgunitName1, eventDate: eventDate1, dataValues: datavalues1};
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

        $scope.AddDriver =function(value,keyValue){
            var program = $scope.data.programs['Driver'].id;
            var programStage = $scope.data.programs['Driver'].programStages[0].id;
            var date1 = new Date();
            $scope.savingDate = date1.toISOString();
            var datavaluess = [];
            angular.forEach(value,function(data,key){
                if(data instanceof Date){
                    datavaluess.push({
                        dataElement: key,
                        value:  DateUtils.formatFromUserToApi(data)
                    })
                }
                datavaluess.push({
                    dataElement: key,
                    value: data
                })
            });
            console.log(keyValue);
            datavaluess.push({dataElement: 'vz0PAS4uCul',value:keyValue})
            var dhis2Event = {
                program: program,
                programStage: programStage,
                status: "ACTIVE",
                orgUnit: "ij7JMOFbePH",
                eventDate: $scope.savingDate,
                dataValues: datavaluess
            };
            console.log(dhis2Event);
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
                alert("success");
            },function(response){
                alert("failed");
            });
        }

            $scope.AddPerson =function(value,value1){
            var program = $scope.data.programs['Person'].id;
            var programStage = $scope.data.programs['Person'].programStages[0].id;
            var date1 = new Date();
            $scope.savingDate = date1.toISOString();
            var datavaluess = [];
            angular.forEach(value,function(data,key){
                if(data instanceof Date){
                    datavaluess.push({
                        dataElement: key,
                        value: DateUtils.formatFromUserToApi(data)
                    })
                }
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
                $scope.AddDriver(value1,response.importSummaries[0].reference);
                console.log(response);
                console.log(response.importSummaries[0].reference);

            },function(response){
                alert("failed");
                console.log(response);
            });
            }
//

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
            $scope.editingPerson = events.dataValues['Program_Person'].Person;
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

        $scope.showNotes = function(dhis2Event){
            var modalInstance = $modal.open({
                templateUrl: 'views/notes.html',
                controller: 'NotesController',
                resolve: {
                    dhis2Event: function () {
                        return dhis2Event;
                    }
                }
            });

            modalInstance.result.then(function (){
            });
        };

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
        $scope.updateData = function(dataElement,newVal,program,event,item,programArray){
            if($scope.isInt(newVal,item.type)){
                var updatedSingleValueEvent = {event: program.event, dataValues: [{value: newVal, dataElement: dataElement}]};
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
                item.color = { "background-color": $scope.colorYellow, 'width': $scope.cellWidth, 'text-align': $scope.textAlign  };
                $.postJSON = function(url, data, callback,failureCallback) {
                    return jQuery.ajax({
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'admin':'district'
                        },
                        'type': 'PUT',
                        'url': url,
                        'data': JSON.stringify(data),
                        'dataType': 'json',
                        'success': callback,
                        'failure':failureCallback
                    });
                };
                $.postJSON('../../../api/events/' + updatedSingleValueEvent.event + '/' + updatedSingleValueEvent.dataValues[0].dataElement,updatedSingleValueEvent,function(response){
                    console.log(response)
                },function(response){
                });

//                    DHIS2EventFactory.updateForSingleValue(updatedSingleValueEvent, updatedFullValueEvent).then(function(data){
//                        if(newVal && newVal != "") {
//                            item.color = { "background-color": $scope.colorGreen, 'width': $scope.cellWidth, 'text-align': $scope.textAlign  };
//                        }else{
//                            item.color = { "background-color": $scope.normalColor, 'width': $scope.cellWidth, 'text-align': $scope.textAlign  };
//                        }
//                    });
            }else{
                alert("Value must be a number \n \n "+item.name);
                item.value = null;
//                    item.color = { "background-color" : $scope.colorYellow,'width':$scope.cellWidth,'text-align':$scope.textAlign  };
            }
        }

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