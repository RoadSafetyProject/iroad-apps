angular.module('aggregate', ['ui.date','ya.treeview', 'ya.treeview.tpls', 'ya.treeview.breadcrumbs', 'ya.treeview.breadcrumbs.tpls'])
	.controller('AccidentReportController',function($scope,$http){
		

			  $scope.options = {
			      onSelect: function($event, node, context) {
			          if ($event.ctrlKey) {
			              var idx = context.selectedNodes.indexOf(node);
			              if (context.selectedNodes.indexOf(node) === -1) {
			                  context.selectedNodes.push(node);
			                  
			              } else {
			                  context.selectedNodes.splice(idx, 1);
			              }
			          } else {
			              context.selectedNodes = [node];
			          }
			          //alert(node);
			          console.log(node.$model.name);
			          $scope.makeRequest(node.$model.name);
			      }
			  };

			  $scope.model = [{
			      label: 'parent1',
			      children: [{
			          label: 'child'
			      }]
			  }, {
			      label: 'parent2',
			      children: [{
			          label: 'child',
			          children: [{
			              label: 'innerChild'
			          }]
			      }]
			  }, {
			      label: 'parent3'
			  }];
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
		$scope.accident = {};
		$scope.data ={
				year:(new Date()).getFullYear(),
				month:(new Date()).getMonth(),
				startDate:new Date(),
				endDate:new Date()
			}
		$scope.years = [];
		for(i = $scope.data.year; i > 1980;i--){
			$scope.years.push({name:i});
		}
		$scope.months = [
		                {name:"January",value:"1"},
		                {name:"February",value:"2"},
		                {name:"March",value:"3"},
		                {name:"April",value:"4"},
		                {name:"May",value:"5"},
		                {name:"June",value:"6"},
		                {name:"July",value:"7"},
		                {name:"August",value:"8"},
		                {name:"September",value:"9"},
		                {name:"October",value:"10"},
		                {name:"November",value:"11"},
		                {name:"December",value:"12"}
		             ];
		$scope.periodType = 1;
		$scope.periods = [
		    {
			   name: 'Yearly',
			   value: 1
			}, 
			{
			   name: 'Monthly',
			   value: 2
			}, 
			{
				name: 'Date Range',
				value: 3
			}
		];
		$scope.getAccidentDimensionString = function(){
			var program = $scope.accident.metadata;
			var returnStr = "";
			angular.forEach(program.programStages[0].programStageDataElements,function(dataElement){
				returnStr += "&dimension="+dataElement.dataElement.id;
			});
			return returnStr;
		}
		/*$http.get("/demo/api/organisationUnits/"+$location.search().ou+".json")
			.success(function(result) {
				$scope.orgUnit = result;
				console.log(JSON.stringify($location.search()));
		}).error(function(error) {
			console.log(error);
		});*/
		
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
				$scope.startWatching();
		}).error(function(error) {
			console.log(error);
		});
		$scope.watch= function(modal){
			$scope.$watch(modal, function (newValue, oldValue) {
				$scope.makeRequest(newValue);
			});
		}
		$scope.startWatching = function(){
			$scope.watch("tree.context");
			$scope.watch("data.year");
			$scope.watch("data.month");
			$scope.watch("data.startDate");
			$scope.watch("data.endDate");
		}
		$scope.getDates = function(){
			var dateString = "?startDate=";
			if($scope.periodType == 2){
				var mon = "";
				if($scope.data.month < 10){
					mon = "0" + $scope.data.month;
				}else{
					mon = "" + $scope.data.month;
				}
				
				var lastDay = new Date($scope.data.year, parseInt(mon) + 1, 0);
				var day = "";
				if(lastDay.getDate() < 10)
				{
					day += "0" + lastDay.getDate();
				}else{
					day += lastDay.getDate();
				}
				dateString += $scope.data.year +"-"+mon+"-01&endDate=" + $scope.data.year +"-"+mon+"-" + day;
			}else if($scope.periodType == 3){
				dateString += getDateString($scope.data.startDate) +"&endDate=" + getDateString($scope.data.endDate);
			}else{
				dateString += $scope.data.year +"-01-01&endDate=" + $scope.data.year +"-12-31";
			}
			return dateString
		}
		$scope.getOrganisationUnits = function(){
			var retString = "";
			angular.forEach($scope.tree.context.selectedNodes,function(node){
				if(retString == ""){
					retString = node.$model.id;
				}else{
					retString += ";" + node.$model.id;
				}
			});
			console.log(retString);
			return retString;
		}
		$scope.makeRequest = function(value){
			if(value == undefined)
				return;
			$http.get("/demo/api/analytics/events/query/"+$scope.accident.metadata.id
					+ $scope.getDates()
					+"&dimension=ou:"+$scope.getOrganisationUnits()+$scope.getAccidentDimensionString()).success(function(results) {
				$scope.data.results = results;
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
				angular.forEach($scope.data.results.rows,function(row){
					var dataRow = {};
					for(var i = 0;i < $scope.data.results.headers.length;i++){
						var header = $scope.data.results.headers[i];
						dataRow[header.column] = row[i];
					}
					
					$scope.addEvaluation($scope.accident.weatherOptionSet,dataRow);
					$scope.addEvaluation($scope.accident.causeOptionSet,dataRow);
					$scope.addEvaluation($scope.accident.classesOptionSet,dataRow);
					$scope.data.dataRows.push(dataRow);
				});
			}).error(function(error) {
				console.log(error);
			});
		}
		
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