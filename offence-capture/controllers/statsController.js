angular.module('rsmsaApp')
.controller('statsController',function($scope,$http,$routeParams) {	           
	           $http.post("/api/offence/stats").success(function(data){
					//data.offence_date = convertDateToClient(data.offence_date);
					$scope.results = data;
					var barData = {
		        		    labels: [],
		        		    datasets: []
		        		};
					var frequencies =[];
					for(i = 0; i < data.length;i++)
					{
						barData.labels.push(data[i].time);
						frequencies.push(parseInt(data[i].offences));
					}
					barData.datasets.push({
						label: "My First dataset",
						fillColor: "rgba(151,187,205,0.5)",
			            strokeColor: "rgba(151,187,205,0.8)",
			            highlightFill: "rgba(151,187,205,0.75)",
			            highlightStroke: "rgba(151,187,205,1)",
    		            data: frequencies});
					var ctx= document.getElementById("ctx").getContext("2d");
			         new Chart(ctx).Bar(barData);
				}).error(function(error) {
					alert(error);
				});
	           $http.post("/api/offence/stats",{"type": "gender"}).success(function(data){
					//data.offence_date = convertDateToClient(data.offence_date);
					$scope.results = data;
					if(data.length != 0){
						var pieData = [{
					        value: data[0].offences,
					        color:"#F7464A",
					        highlight: "#FF5A5E",
					        label: "Male"
					    }];
					if(data.length > 1)
					{
						pieData.push({
					    	value: data[1].offences,
					        color: "#46BFBD",
					        highlight: "#5AD3D1",
					        label: "Female"
					    });
					}
					var options ={
						    //Boolean - Whether we should show a stroke on each segment
						    segmentShowStroke : true,

						    //String - The colour of each segment stroke
						    segmentStrokeColor : "#fff",

						    //Number - The width of each segment stroke
						    segmentStrokeWidth : 2,

						    //Number - The percentage of the chart that we cut out of the middle
						    percentageInnerCutout : 70, // This is 0 for Pie charts

						    //Number - Amount of animation steps
						    animationSteps : 100,

						    //String - Animation easing effect
						    animationEasing : "easeOutBounce",

						    //Boolean - Whether we animate the rotation of the Doughnut
						    animateRotate : true,

						    //Boolean - Whether we animate scaling the Doughnut from the centre
						    animateScale : false,

						    //String - A legend template
						    legendTemplate : "<div>fine</div>"//"<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"

						};
					var ctx1= document.getElementById("ctx1").getContext("2d");
					var myDoughnutChart = new Chart(ctx1).Doughnut(pieData,options);
					}
					
				}).error(function(error) {
					alert(error);
				});
});
