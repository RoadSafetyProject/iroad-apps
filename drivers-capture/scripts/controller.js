/**
 * Created by kelvin on 4/24/15.
 */
'use strict';
/* Controllers */
var eventCaptureControllers = angular.module('eventCaptureControllers', ["ngFileUpload"])
.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
        	
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){            	
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]).service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(uploadObject){
        var fd = new FormData();
        angular.forEach(uploadObject.parameters,function(parameter){
        	fd.append(parameter.name, parameter.value);
        });
        
        $http.post(uploadObject.url, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(uploadObject.success)
        .error(uploadObject.error);
    }
}])
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
             ModalService,
             DialogService,fileUpload,Upload) {
        //selected org unit
        $scope.dateOptions1 = {
            changeYear: true,
            changeMonth: true,
            dateFormat: 'yy-mm-dd'
        };
        $scope.feedBack = false;
        $scope.progresMessage = false;
        $scope.showFeedback = function(data){
            $scope.messagess = data;
            $scope.feedBack = true;

            $timeout( function(){
                $scope.feedBack = false;
            }, 3000);
        }
        $scope.showProgresMessage = function(data){
            $scope.progresMessagess = data;
            $scope.progresMessage = true;
        }
        $scope.hideProgresMessage = function(){
            $scope.progresMessagess = "";
            $scope.progresMessage = false;
        }
        $scope.today = DateUtils.getToday();
        $scope.data = {};

        //getting user Information
        $http.get("../../../api/me.json?fields=organisationUnits[id,name],name").success(function(data){
            $scope.logedInUser = data;
        })
        //loadig all data elements
        $scope.allDataElements = [];
        $http.get('../../../api/dataElements?paging=false&fields=id,name,description,type,code,optionSet[id,name,code,options[id,name]]').
            success(function(data) {
                $scope.allDataElements = data.dataElements;
            }).
            error(function(data) {
                onError("Error loading data elemets.");
            });

        //function to handle tooltips
        $scope.setDescription = function(key){

            for(var j = 0 ;j < $scope.allDataElements.length;j++){
                if($scope.allDataElements[j].name == key){
                    if($scope.allDataElements[j].description){
                        return $scope.allDataElements[j].description;
                    }
                }
            }
        }

        $scope.defaultPhotoID = "";
        $http.get('../../../api/documents.json?filter=name:eq:Default Driver Photo').
		success(function(data) {
			if(data.documents.length != 0){
				$scope.defaultPhotoID = data.documents[0].id;
			}
		}).
		error(function(data) {
			onError("Error uploading file.");
		});
        $scope.getImage = function(data){
        	if(data.value){
        		if(data.value != ""){
        			$scope.photoData = "../../../api/documents/"+data.value+"/data";
        		}else{
        			$scope.photoData = "../../../api/documents/"+$scope.defaultPhotoID+"/data";
        		}
        	}else{
        		$scope.photoData = "../../../api/documents/"+$scope.defaultPhotoID+"/data";
        	}
        }


        $scope.programUrl = "../../../api/programs.json?filters=type:eq:3&paging=false&fields=id,name,description,version,programStages[id,version,programStageSections[id],programStageDataElements[compulsory,sortOrder,dataElement[id,name,type,description,code,optionSet[id,name,options[id,name],version]]]]";
        $scope.showProgresMessage('Loading progams Metadata.....')
        $http.get($scope.programUrl).success(function(data){
            $scope.data.programs = {};
            angular.forEach(data.programs, function(program1){
                $scope.data.programs[program1.name] = {};

                $scope.data.programs[program1.name].name= program1.name;
                $scope.data.programs[program1.name].id= program1.id;
                $scope.data.programs[program1.name].version= 1;
                $scope.data.programs[program1.name].programStages= program1.programStages;
                angular.forEach(program1.programStages[0].programStageDataElements,function(programStageDataElement){
                	if(programStageDataElement.dataElement.name == "Driver Photo"){
                		//alert("Got Driver Photo");
                		$scope.driverPhotoID = programStageDataElement.dataElement.id;
                	}
                })
            });
//            $scope.data.programs = data.programs;
            $scope.fetchDrivers(1);


        });
        $scope.pageSize = 10;
        $scope.pager = {};
        $scope.pageChanged = function(page) {
        	$scope.fetchDrivers(page);
        };
        $scope.fetchDrivers = function(page){
            angular.forEach($scope.data.programs,function(program){
                if($scope.data.programs['Driver'].id == program.id){
                    $scope.showProgresMessage('Loading Drivers.....')
                }else if($scope.data.programs['Offence Event'].id == program.id || 
                		$scope.data.programs['Accident Vehicle'].id == program.id || 
                		$scope.data.programs['Driver License History'].id == program.id){
                	
                }else{
                	return;
                }
                program.dataValues = {};
                program.dataValues.events = [];
                $http.get('../../../api/events.json?totalPages=true&program='+program.id+"&pageSize=" + $scope.pageSize +"&page=" + page).success(function(data){
                	$scope.pager = data.pager;
                        $scope.hideProgresMessage();
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
                                dataelement.description = dataVal.description;
                                if(dataVal.dataElement.optionSet){
                                    dataelement.optionSet = dataVal.dataElement.optionSet;
                                }

                                angular.forEach(datas.dataValues, function (newDatval) {
                                    if (newDatval.dataElement == dataVal.dataElement.id) {
                                        if(dataelement.name.indexOf("Program_")!= -1){
                                            var arr = (dataelement.name.split("_"));
                                            arr.splice(0,1);
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
                                                //if(resultProg != undefined)
                                                angular.forEach($scope.data.programs,function(value2){
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
        $scope.photoData = "";
        $scope.takeSnapShot = function(photo){
        	var photoEvent = {
        			setPhotoData:function(data_uri){
        				$scope.photoData = data_uri;
        				var blobBin = atob(data_uri.split(',')[1]);
        				var array = [];
        				for(var i = 0; i < blobBin.length; i++) {
        				    array.push(blobBin.charCodeAt(i));
        				}
        				
        				$scope.data[photo] = new File(new Uint8Array(array), $scope.generateUniqueFileName("jpeg"), {type: 'image/jpeg' });
        				console.log(JSON.stringify($scope.data[photo]));
        			}
        	}
        	$scope.generateUniqueFileName = function(ext){
        		var now = new Date();
	            var month = now.getMonth() + 1;
	            if(month < 10){
	            	month = "0" + month;
	            }
	            var date = now.getDate();
	            if(date < 10){
	            	date = "0" + date;
	            }
	            return now.getFullYear()+""+month+""+date+"_"+now.getHours()+""+now.getMinutes()+""+now.getSeconds()+"_"+Math.random()+"."+ext;
        	}
        	var modalInstance = $modal.open({
                templateUrl: 'views/snapshot.html',
                controller: 'SnapShotController',
                resolve: {
                	photoEvent: function () {
                        return photoEvent;
                    }
                }
            });

            modalInstance.result.then(function (){
            });
        }
        $scope.uploadFile = function(file,onSuccess,onError){
        	if(file == undefined){
        		onSuccess("");
        		return;
        	}
        	if(!file.type.startsWith("image")){
        		onError("Not Valid Image.");
        		return;
        	}
        	var ext = "." + file.type.replace("image/","");
        	console.log('file is ' );
            console.dir(file);
            var now = new Date();
            var month = now.getMonth() + 1;
            if(month < 10){
            	month = "0" + month;
            }
            var date = now.getDate();
            if(date < 10){
            	date = "0" + date;
            }
            var fileName = ""+now.getFullYear()+""+month+""+date+"_"+now.getHours()+""+now.getMinutes()+""+now.getSeconds()+"_"+Math.random()+ext;
            console.log("File Name:" + fileName);
        	var uploadObject = {
        			url:"../../../dhis-web-reporting/saveDocument.action",
        			parameters:[
        			            {name:"name",value:fileName},
        			            {name:"external",value:"false"},
        			            {name:"upload",value:file}
        			           ],
        			success:function(data, status, headers, config){
        					$http.get('../../../api/documents.json?filter=name:eq:'+fileName).
        					success(function(data) {
        						console.log("Document:" + JSON.stringify(data.documents))
        						if(data.documents.length > 0){
        							onSuccess(data.documents[0].id);
        						}else{
        							onError("File Not uploaded.");
        						}
        						
        					}).
        					error(function(data) {
        						onError("Error uploading file.");
        					});
        			},
        			error:function(data, status, headers, config){
        				console.log("Error Uploading")
        				onError("Error uploading file.");
        			}
        		}
            
        	fileUpload.uploadFileToUrl(uploadObject);
        }
        $scope.AddDriver = function(value){
        	console.log("First:" + JSON.stringify($scope.data.driverPhoto));
        	$scope.uploadFile($scope.data.driverPhoto,function(data){
        		//alert(data);
        		console.log("Last:" + JSON.stringify(data));
        		$scope.saveDriver(value,data);
        	},function(error){
        		alert(error);
        	});
        }
        $scope.saveDriver =function(value,driverPhotoID){
        	
            var program = $scope.data.programs['Driver'].id;
            var programStage = $scope.data.programs['Driver'].programStages[0].id;
            var date1 = new Date();
            $scope.savingDate = date1.toISOString();
            var datavaluess = [];
            angular.forEach(value,function(data,key){
            	if(key == $scope.driverPhotoID){
            		datavaluess.push({
                        dataElement: key,
                        value: driverPhotoID
                    });
                    return;
            	}
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
                }
                datavaluess.push({
                    dataElement: key,
                    value: data
                })
            });
            datavaluess.push({
                dataElement: $scope.driverPhotoID,
                value: driverPhotoID
            });
            var dhis2Event = {
                program: program,
                programStage: programStage,
                status: "ACTIVE",
                orgUnit: $scope.logedInUser.organisationUnits[0].id,
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
            $scope.showProgresMessage('Adding Driver.....');
            $.postJSON('../../../api/events',dhis2Event,function(response){

                for(var key in $scope.data.newDriverValue){
                    $scope.data.newDriverValue[key] = "";
                }
                $scope.hideProgresMessage();

                $scope.data.programs['Driver'].dataValues.events.push($scope.prepareOneEvent($scope.data.programs['Driver'].programStages[0].programStageDataElements,dhis2Event));
                  
                $scope.cancelAdd();
                $scope.hideProgresMessage();
                $scope.showSuccessfullAddingMessage('You have successful adding a new driver');



            },function(response){
                $scope.hideProgresMessage();
            });

            

        }
        $scope.updateDriverToServer = function(value,driverPhotoID){
        	var program = $scope.data.programs['Driver'].id;
            var programStage = $scope.data.programs['Driver'].programStages[0].id;
            var date1 = new Date();
            $scope.savingDate = date1.toISOString();
            var datavaluess = [];
            //console.log(JSON.stringify(value)); 
            angular.forEach(value.dataValues,function(data,key){
                datavaluess.push({
                    dataElement: data.id,
                    value: data.value
                })
            });
            datavaluess.push({
                dataElement: $scope.driverPhotoID,
                value: driverPhotoID
            });
            var dhis2Event = {
                program: program,
                programStage: programStage,
                status: "ACTIVE",
                orgUnit: value.orgUnit,
                eventDate: value.eventDate,
                dataValues: datavaluess
            };
            $scope.currentSaving = true;
            $scope.showProgresMessage('Adding Driver.....');
            $http.put('../../../api/events/' + value.event,dhis2Event).
            success(function(data) {
            	console.log(JSON.stringify(data));
            	$scope.hideProgresMessage();

                $scope.cancelAdd();
                $scope.hideProgresMessage();
                $scope.showSuccessfullAddingMessage('You have successful updated the driver.');
        		if(!$scope.vehicleRevoked && value.dataValues["Driver License Status"].value == "Revoked"){
        			$http.get('../../../api/organisationUnits/' + $scope.orgUnit.id + '.json?fields=id,users,parent[id,users,parent[id,users,parent[id,users]]]').
                    success(function(data) {
                    	var orgUnit = data;
                    	var orgUnits = [];
                    	do{
                    		orgUnits.push({"id":orgUnit.id});
                    		orgUnit = orgUnit.parent;
                    	}while(orgUnit);
                    	var message = {
                    			"subject" : "Driver License("+value.dataValues["Driver License Number"].value+") has been revoked",
                    			"text" : "Driver License "+value.dataValues["Driver License Number"].value+" owned by "+value.dataValues["Full Name"].value+" has been revoked.",
                    			"organisationUnits":orgUnits
                    	};
                    	$http.post('../../../api/messageConversations.json',message).
                        success(function(data) {
                        	
                        }).
                        error(function(data) {
                            alert("Error getting organisation units.")
                        });
                    }).
                    error(function(data) {
                        alert("Error getting organisation units.")
                    });
        			alert("here");
        		}
            }).
            error(function(data) {
            	
            });
        }
        $scope.updateDriver = function(value){
        	$scope.uploadFile($scope.data.editDriverPhoto,function(data){
        		//alert(data);
        		console.log("Last:" + JSON.stringify(value));
        		$scope.updateDriverToServer(value,data);
        	},function(error){
        		alert(error);
        	});
        	
        }
        $http.get('/demo/api/me.json').
        success(function(data) {
        	$scope.orgUnit = data.organisationUnits[0];
        }).
        error(function(data) {
        	
        });
        $scope.addLicenceInfo = function(value,driverId){
            var program = $scope.data.programs['Driver License History'].id;
            var programStage = $scope.data.programs['Driver License History'].programStages[0].id;
            value[$scope.getPrimaryId($scope.data.programs['Driver License History'],'Program_Driver')] = driverId;

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
            value = [];
            var dhis2Event = {
                program: program,
                programStage: programStage,
                status: "ACTIVE",
                orgUnit: $scope.orgUnit.id,
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
                console.log('respornse : ' + JSON.stringify(response));
            },function(response){
                alert("failed");
            });
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
        $scope.normalClass= "col-sm-12";
        $scope.normalStyle= { "z-index": '1000'};
        $scope.data.color = [];
        $scope.vehicleRevoked = false;
        $scope.enableEdit  = function(events){
        	console.log(JSON.stringify(events));

        	/*if(events.dataValues["Driver License Status"].value != undefined){
        		$scope.vehicleRevoked = events.dataValues["Driver License Status"].value == "Revoked";
        	}else{
        		$scope.vehicleRevoked = false;
        	}*/

            $scope.data.color = []
            $scope.data.color[events.event] = "rgba(69, 249, 50, 0.26)";
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "col-sm-9";
            $scope.editing = true;
            $scope.adding = false;
            $scope.addingLicence = false;
            angular.forEach($scope.data.programs, function (prog) {
                if (prog.id == events.program) {
                    $scope.editingProgram = prog;
                }
//                if(prog.id == )

            });
            
            $scope.editingEvent = events;
            
            $scope.getImage(events.dataValues["Driver Photo"]);
        }

        $scope.enableAdding  = function(){
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "col-sm-9";
            $scope.adding = true;
            $scope.editing = false;
            $scope.addingLicence = false;
        }
        $scope.enableAddingLicence  = function(driver){
            $scope.data.color = []
            $scope.data.color[driver.event] = "rgba(69, 249, 50, 0.26)";
            $scope.normalStyle= { "z-index": '10'};
            $scope.normalClass= "col-sm-9";
            $scope.addingLicence = true;
            $scope.adding = false;
            $scope.editing = false;
            $scope.driver = driver;
        }

        $scope.cancelAddingLicence = function(){
            $scope.data.color = [];
            $scope.normalClass= "col-sm-12";
            $scope.editing = false;
            $scope.adding = false;
            $scope.addingLicence = false;
        }
        $scope.cancelEdit = function(){
            $scope.data.color = [];
            $scope.normalClass= "col-sm-12";
            $scope.editing = false;
            $scope.adding = false;
            $scope.addingLicence = false;
        }

        $scope.cancelAdd = function(){
            $scope.data.color = [];
            $scope.normalClass= "col-sm-12";
            $scope.adding = false;
            $scope.editing = false;
            $scope.addingLicence = false;
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

        //display a model to view accidents
        $scope.ViewAccident = function(dhis2Event){
            var itemOfInterest = $scope.getRelatedObjects(dhis2Event.event,'Accident Vehicle');
            var modalInstance = $modal.open({
                templateUrl: 'views/accidents.html',
                controller: 'DriverAccidentController',
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



        //display successfull adding message
        $scope.showSuccessfullAddingMessage = function(message){

            var modalInstance = $modal.open({
                templateUrl: 'views/showSuccessfullAddingMessage.html',
                controller :  'ShowSuccessInfoController',
                
                resolve : {

                    message: function(){

                        return message;
                    }
                }               
            });

            modalInstance.result.then(function (){
            });
        }


        //display modal for view info 
        $scope.showDriverInfo = function(events){
           // alert(events.dataValues['Gender'].value);
            var modalInstance = $modal.open({
                templateUrl: 'views/showDriverInfo.html',
                controller: 'ShowDriverInfoController',

                resolve: {
                    
                    events: function () {
                        return events;
                    },
                    defaultPhotoID: function () {
                        return $scope.defaultPhotoID;
                    }
                }
                                
            });

            modalInstance.result.then(function (){
            });
        }

        //display a model to view offences
        $scope.ViewOffences = function(dhis2Event){
            var itemOfInterest = $scope.getRelatedObjects(dhis2Event.event,'Offence Event');
            var modalInstance = $modal.open({
                templateUrl: 'views/offences.html',
                controller: 'DriverOffenceController',
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

        $scope.clickMe = function(event){
            $(event.target).datepicker();
        }

        //getting all object related to driver
        $scope.getRelatedObjects = function(driver_id,object){
            var items = [];
            angular.forEach($scope.data.programs[object].dataValues.events, function (dataVal) {
                if(dataVal.dataValues['Program_Driver'].value == driver_id){
                    items.push(dataVal);
                }
            });
            return items;

        }

        //getting all object related to driver
        $scope.getRelatedObjectsNumber = function(driver_id,object){
            var items = 0;
            angular.forEach($scope.data.programs[object].dataValues.events, function (dataVal) {
                if(dataVal.dataValues['Program_Driver'].value == driver_id){
                    items++;
                }
            });
            return items;

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
                var e = {};

                e.event         = program.event;
                e.status        = 'ACTIVE';
                e.program       = program.program;
                e.programStage  = program.programStage;
                e.orgUnit       = program.orgUnit;
                e.eventDate     = program.eventDate;;

                var dvs = [];
                angular.forEach(program.dataValues, function(prStDe){
                    if(prStDe.value){
                        dvs.push({dataElement: prStDe.id, value: prStDe.value });
                    }
                });

                e.dataValues = dvs;

                var updatedFullValueEvent = e;
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
                $.postJSON('../../../api/events/' + updatedSingleValueEvent.event+'/'+dataElement ,updatedSingleValueEvent,function(response){
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
            if(type == 'NUMBER' && value != null){
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

        $scope.prepareOneEvent = function(dataelements,datas){
            var event = datas.event;
            var program1 = datas.program;
            var programstage = datas.programStage;
            var orgunit = datas.orgUnit;
            var orgunitName = datas.orgUnitName;
            var eventDate = datas.eventDate;
            var datavalues = {};
            angular.forEach(dataelements, function (dataVal) {
                var dataelement = {};
                datavalues[dataVal.dataElement.name] = {}
                dataelement.id = dataVal.dataElement.id;
                dataelement.name = dataVal.dataElement.name;
                dataelement.type = dataVal.dataElement.type;
                dataelement.description = dataVal.dataElement.description;
                dataelement.sortOrder = dataVal.sortOrder;
                if(dataVal.dataElement.optionSet){
                    dataelement.optionSet = dataVal.dataElement.optionSet;
                }

                angular.forEach(datas.dataValues, function (newDatval) {
                    if (newDatval.dataElement == dataVal.dataElement.id) {
                        dataelement.value = newDatval.value;
                    }
                })
                datavalues[dataVal.dataElement.name] =  dataelement;
            })
            return {event: event, program: program1, programStage: programstage, orgUnit: orgunit, orgUnitName: orgunitName, eventDate: eventDate, dataValues: datavalues};

        }


    });
