/**
 * 
 * @author Vincent P. Minde
 * 
 */
angular.module('rsmsaApp')
.controller('offenceReportController',
	function($scope,$http) {
	$scope.chartConfig = {

			  //This is not a highcharts object. It just looks a little like one!
			  options: {
			      //This is the Main Highcharts chart config. Any Highchart options are valid here.
			      //will be ovverriden by values specified below.
			      chart: {
			          type: 'column'
			      },
			      tooltip: {
			          style: {
			              padding: 10,
			              fontWeight: 'bold'
			          }
			      }
			  },
			  //The below properties are watched separately for changes.


			  //Series object (optional) - a list of series using normal highcharts series options.
			  series: [],
			  //Title configuration (optional)
			  title: {
			     text: 'Offence Chart'
			  },
			  //Boolean to control showng loading status on chart (optional)
			  //Could be a string if you want to show specific loading text.
			  loading: false,
			  //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
			  //properties currentMin and currentMax provied 2-way binding to the chart's maximimum and minimum
			  xAxis: {
				  title: {text: 'Time'},
				  categories:[],
				  allowDecimals:false
			  },
			  yAxis: {
		            title: {
		                text: 'Number of Offences'
		            }
		       },
			  //Whether to use HighStocks instead of HighCharts (optional). Defaults to false.
			  useHighStocks: false,
			  //size (optional) if left out the chart will default to size of the div or something sensible.
			  style: {
			   width: "100%",
			   height: 300
			  },
			  //function (optional)
			  func: function (chart) {
			   //setup some logic for the chart
			  }
			};
		$scope.setChartType = function(chartType){
			$scope.chartConfig.options.chart.type = chartType;
		}
		//Initialize regions
		$scope.regions = [];
		//Fetch regions from server
		$http.get("/regions").success(function(data){
			$scope.regions = data;
		}).error(function(error) {
			alert(error);
		});
		//Initialize districts
		$scope.districts = [];
		//Fetch districts from server
		$http.get("/districts").success(function(data){
			$scope.districts = data;
		}).error(function(error) {
			alert(error);
		});
		//Initialize offences
		$scope.offences = [];
		//Fetch offences from server
		$http.get("/api/offence/registry").success(function(data){
			$scope.offences = data;
		}).error(function(error) {
			alert(error);
		});
		//Initialize date options for ui-date
		$scope.dateOptions = {
	        changeYear: true,
	        changeMonth: true,
	        yearRange: '1900:-0'
	    };
		//Initialize list to show
		$scope.show = [
		                  {id:"general",name:"General"},
		                  {id:"regions",name:"Regions"},
		                  {id:"districts",name:"Districts"},
		                  {id:"vehicle",name:"Vehicle Type"},
		                  {id:"nature",name:"Offence Nature"},
		                  {id:"section",name:"Offence Section"},
		                  {id:"relating",name:"Offence Relating"},
		                  {id:"amount",name:"Amount Paid"},
		                  {id:"license",name:"License Status"},
		                  {id:"gender",name:"Gender"}
		             ];
		//Initialize gender list
		$scope.genders = [
		                  {id:"all",name:"All"},
		                  {id:"M",name:"Male"},
		                  {id:"F",name:"Female"}
		             ];
		//Initializing list of horizontal dimention
		$scope.horizontal = [
		                     {id:"dates",name:"Date Range"},
		                     {id:"year",name:"Year"},
		                     {id:"years",name:"Year Range"},
		                     {id:"age",name:"Age Range"}
		             ];
		//Initialize list of years
		$scope.years = [];
		//Add years to the years scope from 1970 to 2015
		for(i = 1970;i < 2016;i++){
			$scope.years.push({id:i,name:i});
		}
		//Initialize list of age ranges
		$scope.ageRange = [];
		//Add age range from 2 to 11
		for(i = 2;i < 11;i++){
			$scope.ageRange.push({id:i,name:i});
		}
		//Initialize report criteria
		$scope.criteria = {
				show :"",
				horizontal :"",
				gender :"",
				year:"",
				startYear:"",
				endYear:"",
				ageRange:"",
				startDate:Date(),
				endDate:Date(),
				regions:[],
				districts:[],
				offences:[]
		};
		$scope.$watchCollection('criteria', function(newNames, oldNames) {
			$scope.tableReport();
		});
		//Initialize results which will be shown on the charts 
		$scope.results = null;
		/**
		 * 
		 * Fetches report from server
		 * 
		 */
		$scope.tableReport = function(){
			$http.post("/api/offence/report",$scope.criteria).success(function(data){
				$scope.results = data;
				$scope.chartConfig.xAxis.categories = [];
				$scope.chartConfig.series = [];
				var seriesData = {name:"Offence",data:[]};
				for(i = 0;i < data.length;i++){
					if(!$scope.contains($scope.chartConfig.xAxis.categories,data[i].time))
					{
						$scope.chartConfig.xAxis.categories.push(data[i].time);
					}
					seriesData.data.push(data[i].offences)
				}
				var series = [];
				cont:
				for(i = 0;i < data.length;i++){
					if(!$scope.contains($scope.chartConfig.xAxis.categories,data[i].time))
					{
						$scope.chartConfig.xAxis.categories.push(data[i].time);
					}
					for(j = 0;j < $scope.chartConfig.series.length;j++){
						if($scope.chartConfig.series[j].name == data.name){
							$scope.chartConfig.series[j].data.push(data[i].offences);
							continue cont;
						}
					}
					var seriesObj = {name:"offence",data:[]};
					seriesObj.name = data.name;
					seriesObj.data.push(data[i].offences);
					$scope.chartConfig.series.push(seriesObj);
				}
				
			}).error(function(error) {
				alert(error);
			});
		}
		/**
		 * Watch and wait for a model change and fetch from a url and execute
		 * on success
		 * 
		 * @param string model
		 * 
		 * @param string url(Url to fetch the data)
		 * 
		 * @param function success (To execute after success fetch)
		 */
		$scope.watchAndFetch = function(model,url,success){
			$scope.$watch(model, function (value, oldValue) {
				
				if(value != '')//If the changed value is not empty
				{
					//Fetch station information given the station_id
					$http.get(url + value).success(
							function(data) {
								success(data);
							})
					.error(function(error) {
						alert(error);
						$scope.data.error = error;
					});
				}
			});
		}
		$scope.$watch("criteria.regions", function (value, oldValue) {
			
			if(value != '')//If the changed value is not empty
			{
				var districts = [];
				for(i = 0;i < value.length;i++){
					for(j = 0;j < $scope.districts.length;j++){
						if($scope.districts[j].region_id == value[i])
						{
							districts.push($scope.districts[j]);
						}
					}
				}
				$scope.regdistricts = districts;
			}
		});
		/**
		 * 
		 * Determines whether an element can be displayed or not
		 * 
		 * @param boolean val
		 * 
		 * @return string
		 */
		$scope.display = function(val){
			if(val){
				return "block";
			}else
			{
				return "none";
			}
		};
		/**
		 * Checks if an array contains a value
		 * 
		 * @param array arr
		 * 
		 * @param Object obj
		 */
		$scope.contains = function contains(arr, obj) {
		    var i = arr.length;
		    while (i--) {
		       if (arr[i] === obj) {
		           return true;
		       }
		    }
		    return false;
		}
});