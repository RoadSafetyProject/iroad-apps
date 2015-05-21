angular.module('aggregate', ['ui.date'],function($locationProvider) {
    $locationProvider.html5Mode(true);
	})
	.controller('AccidentReportController',function($scope,$http,$location){
		$scope.year = $location.search().pe;
		$scope.orgUnit = {};
		$scope.data = {};
		$scope.accident = {};
		$scope.getAccidentDimensionString = function(){
			var program = $scope.accident.metadata;
			var returnStr = "";
			angular.forEach(program.programStages[0].programStageDataElements,function(dataElement){
				returnStr += "&dimension="+dataElement.dataElement.id;
			});
			return returnStr;
		}
		$http.get("/demo/api/organisationUnits/"+$location.search().ou+".json")
			.success(function(result) {
				$scope.orgUnit = result;
				console.log(JSON.stringify($location.search()));
		}).error(function(error) {
			console.log(error);
		});
		
		$http.get("/demo/api/programs?filters=type:eq:3&paging=false&fields=id,name,version,programStages[id,version,programStageSections[id],programStageDataElements[sortOrder,dataElement[id,name,code,type,optionSet[id,name,options[id,name],version]]]]")
			.success(function(result) {
				
				angular.forEach(result.programs,function(program){
					if(program.name == "Accident"){
						
						$scope.accident.metadata = program;
						angular.forEach(program.programStages[0].programStageDataElements,function(dataElement){
							if(dataElement.dataElement.name == "Accident Class"){
								$scope.accident.classesOptionSet = dataElement.dataElement.optionSet.options;
							}else if(dataElement.dataElement.name == "Weather"){
								$scope.accident.weatherOptionSet = dataElement.dataElement.optionSet.options;
							}else if(dataElement.dataElement.name == "Cause of Accident"){
								$scope.accident.causeOptionSet = dataElement.dataElement.optionSet.options;
							}
						});
					}
				});
				$scope.$watch("startDate", function (newValue, oldValue) {
					
					$http.get("/demo/api/analytics/events/query/"+$scope.accident.metadata.id
							+"?startDate="+$location.search().pe+"-01-01&endDate="+$location.search().pe
							+"-12-31&dimension=ou:"+$location.search().ou+$scope.getAccidentDimensionString()).success(function(results) {
						$scope.data = results;
						$scope.data.dataRows = [];
						$scope.data.evaluations = {};
						$scope.addEvaluation = function(optionSet,dataRow){
							
							angular.forEach(optionSet,function(option){
								if($scope.data.evaluations[option.name] == undefined){
									
									$scope.data.evaluations[option.name] = {"killed":0,"injured":0};
								}
								if(option.name == dataRow["Weather"] || option.name == dataRow["Cause of Accident"] || option.name == dataRow["Accident Class"]){
									$scope.data.evaluations[option.name].killed += parseInt(dataRow["Number of Fatal Injuries"]);
									$scope.data.evaluations[option.name].injured += parseInt(dataRow["Number of Severe Injuries"]);
								}
								
							});
						}
						angular.forEach($scope.data.rows,function(row){
							var dataRow = {};
							for(var i = 0;i < $scope.data.headers.length;i++){
								var header = $scope.data.headers[i];
								dataRow[header.column] = row[i];
							}
							
							$scope.addEvaluation($scope.accident.weatherOptionSet,dataRow);
							$scope.addEvaluation($scope.accident.causeOptionSet,dataRow);
							$scope.addEvaluation($scope.accident.classesOptionSet,dataRow);
							$scope.data.dataRows.push(dataRow);
						});
						console.log("dataRows:" + JSON.stringify($scope.data.dataRows));
						console.log("BREAK");
						console.log("evalualtion:" + JSON.stringify($scope.data.evaluations));
					}).error(function(error) {
						console.log(error);
					});
				});
		}).error(function(error) {
			console.log(error);
		});
		
	});
	function getDateString(date){
		var month = date.getMonth()+1;
		var m = "";
		if(month < 10){
			m = "0" + month;
		}else{
			m = month;
		}
		var dat = date.getDate();
		var d = "";
		if(dat < 10){
			d = "0" + dat;
		}else{
			d = dat;
		}
		return 'Y-m-d'
		  .replace('Y', date.getFullYear())
		  .replace('m', m)
		  .replace('d', d);
	}