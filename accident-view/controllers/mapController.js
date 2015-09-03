// Number of tracker line +255764010449

var trackerApp = angular.module('trackerApp', ['uiGmapgoogle-maps',"ui.date"]);

trackerApp.controller('mapCtrl', function ($scope,$http,$interval) {
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
	$scope.markerExists = function(accident){
		if(('coordinate' in accident)){
			alert("here");
			return true;
		}
		for(var i = 0;i < $scope.markers.length;i++){
			if($scope.markers[i].id == accident.event){
				return true;
			}
		}
		return false;
	}
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
	$scope.markerControl ={};
	$http.get('/demo/api/programs.json').
	  success(function(result){
			angular.forEach(result.programs,function(program){
				if(program.name == "Accident"){
					$scope.accidentProgram = program;
					$scope.getPathList();
				}
			});
			
	  }).
	  error(function(err){
			console.log("Error:" + err);
	  });
	
	$scope.getPathList = function(){
		var url = "/demo/api/events.json?progam=" + $scope.accidentProgram.id; //&startDate=2011-12-13&endDate=2011-12-13
		$http.get(url).
		  success(function(result){
			  
				angular.forEach(result.events,function(accident){
					if(!$scope.markerExists(accident)){
						try{
							//console.log("Marker:" + JSON.stringify(accident));
							var smarker = {
									id:accident.event,
									coordinates:{latitude:accident.coordinate.latitude,longitude:accident.coordinate.longitude},
									events:{
										
									}
								};
							$scope.markers.push(smarker);
						}catch(e){
							
						}
						//console.log($scope.map.markerControl.getGMarkers());
						//$scope.autoCenter();
					}
				});
				
		  }).
		  error(function(err){
				console.log("Error:" + err);
		  });
	}
	$scope.blinkTriggeredMarkers = [];
	$scope.markerExists = function(marker){
		var marked = false;
		angular.forEach($scope.blinkTriggeredMarkers,function(blinkingMarkerKey){
			if(blinkingMarkerKey == marker.key){
				marked = true;
			}
		});
		return marked
	}
	$scope.markerShow = function(element){
		try{
			
			//if($scope.isValid)
			{
				var markers = $scope.map.markerControl.getGMarkers();
				angular.forEach(markers,function(marker){
					if(!$scope.markerExists(marker)){
						console.log(marker);
						$scope.blinkTriggeredMarkers.push(marker.key);
						$interval(function(){
							marker.setVisible(!marker.getVisible());
								
						}, 5000);
					}
					
				});
			}
		}catch(e){
			
		}
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
        $scope.map = {center: {latitude: -6.771430, longitude: 39.239946}, options:baseOptions, zoom:8, showTraffic: true,  show: true,control:{},markerControl:{}};
        //$scope.getPathList();
        //$interval($scope.getPathList, 3000);
        
});
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