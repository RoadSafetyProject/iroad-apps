'use strict';

/* Controllers */
var eventCaptureControllers = angular.module('eventCaptureControllers', ['uiGmapgoogle-maps',"ui.date","multi-select",'ya.treeview', 'ya.treeview.tpls', 'ya.treeview.breadcrumbs', 'ya.treeview.breadcrumbs.tpls'])

//Controller for settings page
    .controller('MainController',
    function($scope,$http,$interval) {
    	$scope.options = {
			      onSelect: function($event, node, context) {
			          context.selectedNodes = [node];
			          //alert(node);
			          console.log(node.$model.name);
			          //$scope.makeRequest(node.$model.name);
			      }
			  };
    	$scope.tree = {};
		$scope.tree.modal = [];
		$scope.tree.context = {
				selectedNodes: []
			  };
		$http.get("/demo/api/organisationUnits.json?filter=level:eq:1&paging=false&fields=id,name,children[id,name,children[id,name,children[id,name]]]")
			.success(function(result) {
				$scope.tree.modal = result.organisationUnits;
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
		$scope.communityProgram = {};
		$scope.addMarker = function(event){
			$scope.markers.push({
				id:event.event,
				coords:event.coordinate
			});
		}
		$scope.getDataValue = function(event,dataElementName){
			var dataElementId = "ZrbvmFDOuYl";
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
					  console.log("Saving Org:" + JSON.stringify($scope.communityProgram));
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
		$scope.addFacility = function(){
			if($scope.isAddingFacility){
				if($scope.tree.context.selectedNodes.length > 0){
					console.log($scope.tree.context.selectedNodes[0]);
					$http.post('../../api/organisationUnits.json', {
						"name":$scope.newFacility.name,
						"latitude":$scope.newFacility.coordinates.latitude,
						"longitude":$scope.newFacility.coordinates.longitude,
						"shortname":$scope.newFacility.name,
						"parent":$scope.tree.context.selectedNodes[0].$model.id
					}).
				  success(function(data, status, headers, config) {
				    //console.log("Saving Org:" + JSON.stringify(data));
				  }).
				  error(function(data, status, headers, config) {
					  console.log("Error Saving Org:" + JSON.stringify(data));
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
    	$scope.getPathList = function(){
    		$http.get('getpath.php?plate_number=' + $scope.plate_number).
    		  success(function(result){
    				angular.forEach(result,function(smarker){
    					if(!$scope.markerExists(smarker)){
    						smarker.coords = {latitude:smarker.latitude,longitude:smarker.longitude};
    						if(!smarker.overspeeding){
    							smarker.options ={
    							    icon:'//maps.google.com/mapfiles/ms/icons/green-dot.png'
    							};
    						}
    						console.log("Marker:" + JSON.stringify(smarker));
    						$scope.markers.push(smarker);
    						$scope.autoCenter();
    					}
    				});
    				
    		  }).
    		  error(function(err){
    				console.log("Error:" + err);
    		  });
    		
    		
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