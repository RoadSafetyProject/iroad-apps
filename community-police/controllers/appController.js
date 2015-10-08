'use strict';

/* Controllers */
var eventCaptureControllers = angular.module('eventCaptureControllers', ['uiGmapgoogle-maps',"ui.date","multi-select",'ya.treeview', 'ya.treeview.tpls', 'ya.treeview.breadcrumbs', 'ya.treeview.breadcrumbs.tpls'])

//Controller for settings page
    .controller('MainController',
    function($scope,$http,$interval) {
    	$scope.facilityType = [{"name" :"Police"},{"name" :"Hospital"},{"name" :"Fire"}];
    	$scope.selectedFacility = {};
    	$scope.isSelectedFacility = false;
    	$scope.filterFacilityFn = function(organisationUnit)
    	{
    	    return (organisationUnit.organisationUnitGroups.length > 0);
    	};
    	String.prototype.contains = function(it) { return this.indexOf(it) != -1; };
    	$scope.options = {
			      onSelect: function($event, node, context) {
			          context.selectedNodes = [node];
			          //alert(node);
			          
			          //$scope.makeRequest(node.$model.name);
			          if(node.$model.coordinates){
			        	  console.log(JSON.stringify(node.$model.coordinates));
			        	  var coords = JSON.parse(node.$model.coordinates);
			        	  $scope.selectedFacility = {
			        			id:"newFacility",
			        			coordinates:{latitude:coords[0],longitude:coords[1]},
			        			name:"",
			        	  };
			        	  $scope.isSelectedFacility = true;
			        	  console.log(JSON.stringify($scope.selectedFacility));
			          }else{
			        	  $scope.isSelectedFacility = false;
			          }
			          console.log(node);
			      }
			  };
    	$("#facilityModal").draggable();
    	$("#reportModal").draggable();
    	$scope.tree = {};
		$scope.tree.modal = [];
		$scope.tree.context = {
				selectedNodes: []
			  };
		$scope.getOrganisationUnitGroup = function(name,organizationUnit){
			for(var i = 0; i < organizationUnit.organisationUnitGroups.length;i++){
				var organisationUnitGroup = organizationUnit.organisationUnitGroups[i];
				if(organisationUnitGroup.organisationUnitGroupSet.name == name){
					return organisationUnitGroup.name;
				}
			}
			console.log(JSON.stringify(organizationUnit.organisationUnitGroups))
		}
		$scope.organisationUnitsLoading = true;
		$http.get("../../../api/organisationUnits.json?filter=level:eq:1&paging=false&fields=id,name,level,children[id,name,level,children[id,name,level,organisationUnitGroups,children[:all,organisationUnitGroups[:all]]]]")
			.success(function(result) {
				$scope.tree.modal = result.organisationUnits;
				$scope.organisationUnitsLoading = false;
		}).error(function(error) {
			console.log(error);
			
		});
		$scope.orgUnitSearch = "";
		$scope.searchOrgUnits = function(){
			console.log($scope.tree.modal);
			angular.forEach($scope.tree.modal,function(modal){
				console.log(modal);
			});
			$scope.searchedOrgUnits = $scope.getOrganisationContaining($scope.orgUnitSearch,$scope.tree.modal);
		};
		$scope.getOrganisationContaining = function(searchString,orgUnit){
			console.log("Orgunit:" + JSON.stringify(orgUnit));
			var names = []
			if(orgUnit.name.indexOf(searchString) != -1){
				names.push(orgUnit.name);
			}
			angular.forEach(orgUnit.children,function(child){
				names.push($scope.getOrganisationContaining(searchString,child));
			});
			return names;
		}
		$http.get("../../../api/organisationUnitGroupSets.json?fields=:all")
		.success(function(result) {
			$scope.organisationUnitGroupSets = result.organisationUnitGroupSets;
		}).error(function(error) {
			console.log(error);
		});
		$scope.newFacility = {
				id:"marker",
				coordinates:{latitude: -6.771430, longitude: 39.239946},
				name:"",
				options:{draggable:true}
		};
		$scope.isAddingFacility = false;
		console.log(JSON.stringify($scope.newFacility));
		$scope.communityProgram = {};
		$scope.reportMarker = {};
		$scope.isReportMarker = false;
		$scope.addMarker = function(event){
			
			//event.coordinate = {latitude: -6.771430, longitude: 39.239946};
			//console.log(JSON.stringify(event));
			//$scope.reportMarker = event;
			console.log(JSON.stringify(event));
			
			event.coordinate = {latitude: -6.771430, longitude: 39.239946};
			$scope.reportMarker = event;
			$scope.isReportMarker = true;
			/*$scope.reportMarker = {
				id:"reportMarker",
				coordinate:event.coordinate,
				event:event,
				options:{draggable:true}
			};*/
		}
		$scope.hasCoordinate = function(event){
			if(event.coordinate.latitude != 0 && event.coordinate.longitude != 0){
				return true;
			}
			return false;
		}
		$scope.getDataValue = function(event,dataElementName){
			var dataElementId = "";
			angular.forEach($scope.communityProgram.programStages[0].programStageDataElements,
					function(programStageDataElement){
				if(programStageDataElement.dataElement.name == dataElementName){
					dataElementId = programStageDataElement.dataElement.id; 
				}
			});
			for(var i = 0; i < event.dataValues.length;i++){
				if(event.dataValues[i].dataElement == dataElementId){
					return event.dataValues[i].value;
				}
			}
		}
		$http.get('../../../api/programs?filters=type:eq:3&paging=false&fields=id,name,version,programStages[id,version,programStageSections[id],programStageDataElements[sortOrder,dataElement[id,name,code,type,optionSet[id,name,options[id,name],version]]]]').
		  success(function(data) {
			  angular.forEach(data.programs,function(program){
				  if(program.name == "Community Police"){
					  $scope.communityProgram = program;
				  }
			  });
			  $http.get('../../../api/events.json?program='+$scope.communityProgram.id).
			  success(function(data, status, headers, config) {
			    
			    $scope.events = data.events;
			  }).
			  error(function(data, status, headers, config) {
				  console.log("Error Saving Org:" + JSON.stringify(data));
			  });
		  }).
		  error(function(data, status, headers, config) {
			  console.log("Error Saving Org:" + JSON.stringify(data));
		  });
		$scope.organisationUnitGroups = [];
		$scope.showAddFacilityMarker = function(){
			$scope.isAddingFacility = true;
		}
		$scope.hideAddFacilityMarker = function(){
			$scope.isAddingFacility = false;
		}
		$scope.addFacility = function(){
			if($scope.isAddingFacility){
				if($scope.tree.context.selectedNodes.length > 0){
					var saveData = {
							"name":$scope.newFacility.name,
							"openingDate": $scope.newFacility.openingDate,
							"featureType": "Point",
							"coordinates":"[" +$scope.newFacility.coordinates.latitude+","+$scope.newFacility.coordinates.longitude+"]",
							"shortName":$scope.newFacility.name,
							"level":$scope.tree.context.selectedNodes[0].$model.level + 1,
							"parent":{"id":$scope.tree.context.selectedNodes[0].$model.id}
						};
					console.log("Save Data:" + JSON.stringify(saveData));
					
					$http.post('../../../api/organisationUnits.json',saveData ).
					  success(function(data, status, headers, config) {
					    console.log("Saving Org:" + JSON.stringify(data));
						  if(data.status == "SUCCESS" && data.importCount.imported == 1){
							  alert("Facility saved successfully.");
							  $scope.isAddingFacility = false;
							  angular.forEach($scope.organisationUnitGroups,function(organisationUnitGroup){
								  $http.post('../../../api/organisationUnitGroups/'+organisationUnitGroup+'/organisationUnits/'+data.lastImported+'.json',saveData ).
								  	success(function(data, status, headers, config) {
									    
									  }).
									  error(function(data, status, headers, config) {
										  console.log("Error Saving Org:" + JSON.stringify(data));
										  if(data.status == "SUCCESS"){
											  
										  }else{
											  
										  }
									  });
							  });
						  }
					  }).
					  error(function(data, status, headers, config) {
						  console.log("Error Saving Org:" + JSON.stringify(data));
						  if(data.status == "SUCCESS"){
							  
						  }else{
							  
						  }
					  });
				}else{
					alert("Please select organisation unit.")
				}
				/**/
				$scope.isAddingFacility = true;
			}else{
				$scope.isAddingFacility = true;
			}
			
		} 
    	$scope.markers = [];
    	$scope.mapObject = {};
    	$scope.velocity = {
    			criteria:[
    			          {name:"Any",value:"any"},
    			          {name:"Greater Than",value:"gt"},
    			          {name:"Less Than",value:"lt"},
    			          {name:"Between",value:"bt"}
    			         ],
    			range:"any"
    	}
    	$scope.date = {
    			start:getStartTime(),
    			end:getEndTime()
    	}
    	$scope.showMarkers = function(marker){
    		if(!(parseFloat(marker.tracktime) * 1000 >= $scope.date.start.getTime() && parseFloat(marker.tracktime) *1000 <= $scope.date.end.getTime())){
    			return false;
    		}
    		if($scope.velocity.range == "any"){
    			
    			return true;
    		}
    		if($scope.velocity.range == "gt" && $scope.velocity.value <= marker.velocity){
    			return true;
    		}
    		if($scope.velocity.range == "lt" && $scope.velocity.value >= marker.velocity){
    			return true;
    		}
    		if($scope.velocity.range == "bt" && $scope.velocity.start < marker.velocity && marker.velocity < $scope.velocity.end){
    			return true;
    		}
    	    return false; 
    	}
    	$scope.windowOptions = {
                visible: false
            };

            $scope.onClick = function() {
                $scope.windowOptions.visible = !$scope.windowOptions.visible;
            };

            $scope.closeClick = function() {
                $scope.windowOptions.visible = false;
        };
    	$scope.markerExists = function(smarker){
    		for(var i = 0;i < $scope.markers.length;i++){
    			if($scope.markers[i].id == smarker.id){
    				return true;
    			}
    		}
    		return false;
    	}
    	$scope.plate_number = "T234 BLM";
    	$scope.$watch('plate_number', function() {
    		$scope.markers = [];
    		//$scope.getPathList();
    	});
    	$scope.autoCenter = function(){
            //  Create a new viewpoint bound
                var bounds = new google.maps.LatLngBounds();
                //  Go through each...
                for (var i = 0; i < $scope.markers.length; i++) {
                    bounds.extend(new google.maps.LatLng($scope.markers[i].latitude,$scope.markers[i].longitude));
                }
                //  Fit these bounds to the map
                console.log(JSON.stringify(bounds));
                //var map = $scope.mapObject.getGMap();//bounds = bounds;
                if($scope.markers.length > 0){
                	$scope.map.center = {latitude:$scope.markers[$scope.markers.length - 1].latitude,longitude:$scope.markers[$scope.markers.length - 1].longitude};
                	$scope.map.zoom = 14;
                }
                //map.fitBounds(bounds);
        }

		//function to close adding facility dialogue
		$scope.cancelMenu = function(){

			$scope.isAddingFacility = false;
		}

    	var baseOptions = {
                'maxZoom': 15,
                'minZoom': 4,
                'backgroundColor': '#b0d1d4',
                'panControl': false,
                'zoomControl': true,
                'draggable': true,
                'zoomControlOptions': {
                'position': 'RIGHT_TOP',
                'style': 'SMALL'
                }
            };
            $scope.map = {center: {latitude: -6.771430, longitude: 39.239946}, options:baseOptions, zoom:8, showTraffic: true,  show: true,mapObject:{}};
            
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
function getStartTime() {
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    //date.setDate(date.getDate()+1);
    return date;
}
function getEndTime() {
    var date = new Date();
    date.setDate(date.getDate()+1);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
}
