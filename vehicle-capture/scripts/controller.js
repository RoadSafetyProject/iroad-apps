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



        $scope.programUrl = "../../programs.json?filters=type:eq:3&paging=false&fields=id,name,version,programStages[id,version,programStageSections[id],programStageDataElements[sortOrder,dataElement[id,name,type,code,optionSet[id,name,options[id,name],version]]]]";
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
                                dataelement.sortOrder = dataVal.sortOrder;
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
                });
            });


        });

        $scope.normalClass= "col-sm-12";
        $scope.normalStyle= { "z-index": '1000'};
        $scope.enableEdit  = function(events){
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "col-sm-9";
            $scope.editing = true;
            $scope.adding = false;
            angular.forEach($scope.data.programs, function (prog) {
                if (prog.id == events.program) {
                    $scope.editingProgram = prog;
                }
            });
            $scope.editingEvent = events;
        }

        $scope.enableAdding  = function(){
            $scope.cancelEdit();
            $scope.normalStyle= { "z-index": '10'};
             $scope.normalClass= "col-sm-9";
            $scope.adding = true;
        }

        $scope.enableAddingInsurance  = function(events){
            $scope.cancelEdit();
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "col-sm-9";
            $scope.addingInsurance = true;
            $scope.vehicle = events;
        }

         $scope.enableAddingBusLicence  = function(events){
             $scope.cancelEdit();
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "col-sm-9";
             $scope.addingBusLicence = true;
            $scope.vehicle = events;
        }
        $scope.enableAddingLicence  = function(events){
            $scope.cancelEdit();
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "col-sm-9";
            $scope.addingLicence = true;
            $scope.vehicle = events;
        }

        $scope.enableaddingInspection = function(events){
            $scope.cancelEdit();
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "col-sm-9";
            $scope.addingInspection = true;
            $scope.data.
            $scope.vehicle = events;
        }

        $scope.cancelEdit = function(){
            $scope.normalClass= "col-sm-12";
            $scope.editing = false;
            $scope.adding = false;
            $scope.addingInsurance = false;
            $scope.addingBusLicence = false;
            $scope.addingLicence = false;
            $scope.addingInspection = false;
        }

        //adding a new Vehicle
        $scope.AddVehicle =function(value){
            var program = $scope.data.programs['Vehicle'].id;
            var programStage = $scope.data.programs['Vehicle'].programStages[0].id;
            var d = new Date();
            var curr_date	= d.getDate();
            var curr_month	= d.getMonth()+1;
            var curr_year 	= d.getFullYear();
            if(curr_month<10){
                curr_month="0"+curr_month;
            }
            if(curr_date<10){
                curr_date="0"+curr_date;
            }
            $scope.savingDate = curr_year+"-"+curr_month+"-"+curr_date;
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
                alert("success");
                $scope.cancelEdit();
            },function(response){
                 alert("failed");
            });
        }

        //adding a new Vehicle Insurance Information
        $scope.AddInsurance =function(value,vehicle_id){
            var program = $scope.data.programs['Vehicle Insurance History'].id;
            var programStage = $scope.data.programs['Vehicle Insurance History'].programStages[0].id;
            value[$scope.getPrimaryId($scope.data.programs['Vehicle Insurance History'],'Program_Vehicle')] = vehicle_id;
            var d = new Date();
            var curr_date	= d.getDate();
            var curr_month	= d.getMonth()+1;
            var curr_year 	= d.getFullYear();
            if(curr_month<10){
                curr_month="0"+curr_month;
            }
            if(curr_date<10){
                curr_date="0"+curr_date;
            }
            $scope.savingDate = curr_year+"-"+curr_month+"-"+curr_date;
            var datavaluess = [];
            angular.forEach(value,function(data,key){
                if(data instanceof Date){
                    var curr_date	= data.getDate();
                    var curr_month	= data.getMonth()+1;
                    var curr_year 	= data.getFullYear();
                    if(curr_month<10){
                        curr_month="0"+curr_month;
                    }
                    if(curr_date<10){
                        curr_date="0"+curr_date;
                    }
                    var data1 = curr_year+"-"+curr_month+"-"+curr_date;
                    datavaluess.push({
                        dataElement: key,
                        value: data1
                    })
                }else{
                    datavaluess.push({
                        dataElement: key,
                        value: data
                    })
                }
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
                $scope.cancelEdit();
            },function(response){
                 alert("failed");
            });
        }

        //adding a new Vehicle Insurance Information
        $scope.AddBussinessLicence =function(value,vehicle_id){
            var program = $scope.data.programs['Bussiness License History'].id;
            var programStage = $scope.data.programs['Bussiness License History'].programStages[0].id;
            value[$scope.getPrimaryId($scope.data.programs['Bussiness License History'],'Program_Vehicle')] = vehicle_id;
            var d = new Date();
            var curr_date	= d.getDate();
            var curr_month	= d.getMonth()+1;
            var curr_year 	= d.getFullYear();
            if(curr_month<10){
                curr_month="0"+curr_month;
            }
            if(curr_date<10){
                curr_date="0"+curr_date;
            }
            $scope.savingDate = curr_year+"-"+curr_month+"-"+curr_date;
            var datavaluess = [];
            angular.forEach(value,function(data,key){
                if(data instanceof Date){
                    var curr_date	= data.getDate();
                    var curr_month	= data.getMonth()+1;
                    var curr_year 	= data.getFullYear();
                    if(curr_month<10){
                        curr_month="0"+curr_month;
                    }
                    if(curr_date<10){
                        curr_date="0"+curr_date;
                    }
                    var data1 = curr_year+"-"+curr_month+"-"+curr_date;
                    datavaluess.push({
                        dataElement: key,
                        value: data1
                    })
                }else{
                    datavaluess.push({
                        dataElement: key,
                        value: data
                    })
                }
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
                $scope.cancelEdit();
            },function(response){
                 alert("failed");
            });
        }

        //adding a new Vehicle Licence
        $scope.AddLicence =function(value,vehicle_id){
            var program = $scope.data.programs['Vehicle License History'].id;
            var programStage = $scope.data.programs['Vehicle License History'].programStages[0].id;
            value[$scope.getPrimaryId($scope.data.programs['Vehicle License History'],'Program_Vehicle')] = vehicle_id;
            var d = new Date();
            var curr_date	= d.getDate();
            var curr_month	= d.getMonth()+1;
            var curr_year 	= d.getFullYear();
            if(curr_month<10){
                curr_month="0"+curr_month;
            }
            if(curr_date<10){
                curr_date="0"+curr_date;
            }
            $scope.savingDate = curr_year+"-"+curr_month+"-"+curr_date;
            var datavaluess = [];
            angular.forEach(value,function(data,key){
                if(data instanceof Date){
                    var curr_date	= data.getDate();
                    var curr_month	= data.getMonth()+1;
                    var curr_year 	= data.getFullYear();
                    if(curr_month<10){
                        curr_month="0"+curr_month;
                    }
                    if(curr_date<10){
                        curr_date="0"+curr_date;
                    }
                    var data1 = curr_year+"-"+curr_month+"-"+curr_date;
                    datavaluess.push({
                        dataElement: key,
                        value: data1
                    })
                }else{
                    datavaluess.push({
                        dataElement: key,
                        value: data
                    })
                }
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
                $scope.cancelEdit();
            },function(response){
                 alert("failed");
            });
        }
      //adding a new Vehicle Licence
        $scope.AddnewInspection =function(value,vehicle_id){
            var program = $scope.data.programs['Vehicle Inspection'].id;
            var programStage = $scope.data.programs['Vehicle Inspection'].programStages[0].id;
            value[$scope.getPrimaryId($scope.data.programs['Vehicle Inspection'],'Program_Vehicle')] = vehicle_id;
            var d = new Date();
            var curr_date	= d.getDate();
            var curr_month	= d.getMonth()+1;
            var curr_year 	= d.getFullYear();
            if(curr_month<10){
                curr_month="0"+curr_month;
            }
            if(curr_date<10){
                curr_date="0"+curr_date;
            }
            $scope.savingDate = curr_year+"-"+curr_month+"-"+curr_date;
            var datavaluess = [];
            angular.forEach(value,function(data,key){
                if(data instanceof Date){
                    var curr_date	= data.getDate();
                    var curr_month	= data.getMonth()+1;
                    var curr_year 	= data.getFullYear();
                    if(curr_month<10){
                        curr_month="0"+curr_month;
                    }
                    if(curr_date<10){
                        curr_date="0"+curr_date;
                    }
                    var data1 = curr_year+"-"+curr_month+"-"+curr_date;
                    datavaluess.push({
                        dataElement: key,
                        value: data1
                    })
                }else{
                    datavaluess.push({
                        dataElement: key,
                        value: data
                    })
                }
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
                $scope.cancelEdit();
            },function(response){
                 alert("failed");
            });
        }

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

        $scope.showDelete = function(dhis2Event,events){
            var modalInstance = $modal.open({
                templateUrl: 'views/delete.html',
                controller: 'DeleteController',
                resolve: {
                    dhis2Event: function () {
                        return dhis2Event;
                    },
                    events: function () {
                        return events;
                    }
                }
            });

            modalInstance.result.then(function (){
            });
        };

        //display a model to view car Details
        $scope.ViewInfo = function(dhis2Event){
            var modalInstance = $modal.open({
                templateUrl: 'views/info.html',
                controller: 'VehicleController',
                resolve: {
                    dhis2Event: function () {
                        return dhis2Event;
                    }
                }
            });

            modalInstance.result.then(function (){
            });
        };

        //display a model to view licence history
        $scope.ViewLicences = function(dhis2Event,items){
            var itemOfInterest = items
            var modalInstance = $modal.open({
                templateUrl: 'views/licences.html',
                controller: 'DriverLicenceController',
                resolve: {
                    dhis2Event: function () {
                        return dhis2Event;
                    },
                    events: function () {
                        return itemOfInterest;
                    }
                }
            });

            modalInstance.result.then(function (){
            });
        };



        //getting all object related to driver
        $scope.getRelatedObjects = function(vehicle_id,object){
            var items = [];
            angular.forEach($scope.data.programs[object].dataValues.events, function (dataVal) {
                console.log(dataVal.dataValues['Program_Driver'].value +" === "+ driver_id);
                if(dataVal.dataValues['Program_Driver'].value == driver_id){
                    items.push(dataVal);
                }
            });
            return items;

        }

        $scope.getPrimaryId = function(program,name){
            var id = "";
            angular.forEach(program.programStages[0].programStageDataElements, function (dataVal) {
                if(dataVal.dataElement.name == name){
                    id = dataVal.dataElement.id;
                }
            });
            return id;
        }


    });