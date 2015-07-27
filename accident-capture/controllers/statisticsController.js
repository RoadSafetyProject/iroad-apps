/**
 * 
 * @author Vincent P. Minde
 * 
 */
angular.module('rsmsaApp')
.controller('statisticsController',
	function($scope,$http) {
	//getting all regions
    $scope.data = {};
    $scope.data.usedRegions = [];
    $scope.data.usedDistricts = [];
    $scope.data.usedWards = [];
    $scope.data.usedVillages = [];
    $scope.data.report_type = "Coupon Summary";
    $scope.data.category = "Regions"
    $scope.table = {};

    //getting districts
    $http.get("index.php/districts").success(function(data){
        $scope.data.districts = data;
        $scope.data.usedDistricts = [];
        angular.forEach(data,function(datta){
            $scope.data.usedDistricts.push({name: datta.name, ticked: false });
        });
    });

    //getting Regions
    $http.get("index.php/regions").success(function(data){
        $scope.data.regions = data;
        $scope.data.usedRegions = [];
        angular.forEach(data,function(value){
            $scope.data.usedRegions.push({name: value.name,id:value.id, ticked: false})
        });
    });

    //preparing the wards
    $scope.getWards1 = function(id){

        $http.get("index.php/wards/district/"+id).success(function(distr){
            $scope.data.usedWards = [];
            angular.forEach(distr,function(value){
                $scope.data.usedWards.push({name: value.name, ticked: false})
            });
        });
    }
    //preparing the wards
    $scope.getWards = function(id){

        $http.get("index.php/wards/district/"+id).success(function(distr){
            $scope.data.disward = distr;
        });
    }

    //preparing the village
    $scope.getVillages1 = function(id){

        $http.get("index.php/village/ward/"+id).success(function(distr){
            $scope.data.usedVillages = [];
            angular.forEach(distr,function(value){
                $scope.data.usedVillages.push({name: value.name, ticked: false})
            });
        });
    }

    $scope.prepareType = function(type){
        if(type == "Administrative Units" || type == "Delivery Summary"){
            $scope.data.category = "Regions";
        }
    }
    $scope.data.years = [];
    for(i = 1980; i <= 2017;i++){
    	$scope.data.years.push({name: i, ticked: false});
    }
    $scope.prepareDropdown = function(){
        $scope.area = [];
        $scope.area1 = [];
        if($scope.data.category == "Regions"){
            angular.forEach($scope.data.selectedRegions,function(value){
                $scope.area.push(value.name);
                $scope.area1.push({name:value.name,id:value.id});
            });
        }if($scope.data.category == "Districts"){
            angular.forEach($scope.data.selectedDistricts,function(value){
            	$scope.area.push(value.name);
                $scope.area1.push({name:value.name,id:value.id});
            });
        }if($scope.data.category == "Wards"){

            angular.forEach($scope.data.selectedWards,function(value){
                $scope.area.push(value.name);
            });
        }if($scope.data.category == "Village"){
            angular.forEach($scope.data.selectedVillages,function(value){
                $scope.area.push(value.name);
            });
        }
        $scope.chartConfig.xAxis.categories =$scope.area;
        $scope.prepareSeries();
    }

    $scope.changeCats = function(){
        if($scope.data.report_type == "Gender"){
            $scope.subCategory = ["Male","Female"]
        }if($scope.data.report_type == "Age"){
            $scope.subCategory = ["14-22","22-30","30-40"]
        }if($scope.data.report_type == "Population"){
          $scope.subCategory = ["Male","Female"]
        }if($scope.data.report_type == "Coupon Quality"){
            $scope.subCategory = ["Imported","Verified"]
        }if($scope.data.report_type == "Administrative Units"){

        }if($scope.data.report_type == "Delivery Summary"){
            $scope.subCategory = ["Delivered Nets","Required Nets","Nyingine"]
        }

    }

    //changing chart types
    $scope.data.chartType = 'column'
    $scope.changeChart = function(type){
        $scope.displayTable = false;
       if(type == 'table'){
            $scope.displayTable = true;
           $scope.data.chartType = 'table';
        }else{
            $scope.data.chartType = type;
        }
        $scope.prepareSeries();
    };

    $scope.prepareSeries = function(){
        $scope.changeCats();
        $scope.normalseries = [];
           if($scope.data.chartType == "pie"){
               delete $scope.chartConfig.chart;
               var serie = [];
               /**
                * Dimension of report type eg gender,age,population 
                * Category dimension eg. Regions, years, districts, offence registries
                * 
                * @param reportTypeValue
                * 
                * @param val is from $scope.subCategories
                */
               angular.forEach($scope.subCategory,function(reportTypeValue){
                angular.forEach($scope.chartConfig.xAxis.categories,function(categoryValue){
                	$http.post("/api/offence/report",{"reportType":$scope.subCategory,"reportTypeValue":reportTypeValue,"category":$scope.data.category,"categoryValue":categoryValue}).success(function(data){
                		serie.push({name: reportTypeValue+" - "+ categoryValue , y: data })
                	});
                   //serie.push({name: value+" - "+ val , y: Math.random()*100 })
                });
            });
            $scope.normalseries.push({type: $scope.data.chartType, name: $scope.data.category, data: serie})
            $scope.chartConfig.series = $scope.normalseries;
           }else if($scope.data.chartType == "nyingine"){
               delete $scope.chartConfig.chart;
               var serie1 = [];
               angular.forEach($scope.subCategory,function(value){
                   var serie = [];

                   angular.forEach($scope.chartConfig.xAxis.categories,function(val){
                       serie.push(Math.random()*100)
                       serie1.push({name: value+" - "+ val , y: Math.random()*100 })
                   });
                   $scope.normalseries.push({type: 'column', name: value, data: serie});
                   $scope.normalseries.push({type: 'spline', name: value, data: serie});
               });
               $scope.normalseries.push({type: 'pie', name: $scope.data.category, data: serie1,center: [100, 80],size: 150,showInLegend: false,
                   dataLabels: {
                       enabled: false
                   }})
               $scope.chartConfig.series = $scope.normalseries;
           }else if($scope.data.chartType == 'table'){
               $scope.table.headers = [];
               $scope.table.colums =[];
               angular.forEach($scope.subCategory,function(value){
                   var serie = [];
                   $scope.table.headers.push(value);
               });
               angular.forEach($scope.chartConfig.xAxis.categories,function(val){
                   var seri = [];
                   angular.forEach($scope.subCategory,function(value){
                       seri.push({name:value,value:parseInt(Math.random()*100)});
                   });

                   $scope.table.colums.push({name:val,values:seri});
               });
           }else{
               delete $scope.chartConfig.chart;
               angular.forEach($scope.subCategory,function(reportTypeValue){
                   /*var serie = [];
                   angular.forEach($scope.area1,function(categoryValue){
                	   $scope.getReport(serie,reportTypeValue,categoryValue); 
                   });
                   $scope.normalseries.push({type: $scope.data.chartType, name: reportTypeValue, data: serie});*/
            	   var request = [];
            	   var series = [];
            	   angular.forEach($scope.area1,function(categoryValue){ 
            		   var json = {"reportType":$scope.data.report_type,"reportTypeValue":reportTypeValue,"category":$scope.data.category,"categoryValue":categoryValue.id};
                	   request.push(json);
                   });
            	   $http.post("/api/offence/report",request).success(function(data){
                  		series = data;
                  		$scope.normalseries.push({type: $scope.data.chartType, name: reportTypeValue, data: series});
                  	});
            	   
               });
               $scope.chartConfig.series = $scope.normalseries;
               console.log($scope.chartConfig.series);
           }

    }
    $scope.getReport = function(series,reportTypeValue,categoryValue){
    	$http.post("/api/offence/report",[{"reportType":$scope.subCategory,"reportTypeValue":reportTypeValue,"category":$scope.data.category,"categoryValue":categoryValue.id}]).success(function(data){
       		series.push(parseInt(data));
       	});
    }
    $scope.getData = function(){
        $scope.chartConfig.series = [{
            name: 'Motor Vehicle',
            data: []
        }];
        $scope.table.headers = [];
        $scope.table.colums = [];
        angular.forEach($scope.chartConfig.xAxis.categories,function(value){
            $scope.table.headers.push({name:value});
//                $scope.chartConfig.series[0].data.push(Math.floor(Math.random() * 30))
            $http.get('../../vehicle/'+$scope.column+'/'+value).success(function(data){
                $scope.table.colums.push({val:data});
                $scope.chartConfig.series[0].data.push(parseInt(data));
            });
        })
    }


    //drawing some charts
    $scope.chartConfig = {
        title: {
            text: 'Combination chart'
        },
        xAxis: {
            categories: ['Apples', 'Oranges', 'Pears', 'Bananas', 'Plums']
        },
        labels: {
            items: [{
                html: 'Total fruit consumption',
                style: {
                    left: '50px',
                    top: '18px',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                }
            }]
        },
        series: [{
            type: 'column',
            name: 'Jane',
            data: [3, 2, 1, 3, 4]
        }, {
            type: 'column',
            name: 'John',
            data: [2, 3, 5, 7, 6]
        }, {
            type: 'column',
            name: 'Joe',
            data: [4, 3, 3, 9, 0]
        }, {
            type: 'spline',
            name: 'Average',
            data: [3, 2.67, 3, 6.33, 3.33],
            marker: {
                lineWidth: 2,
                lineColor: Highcharts.getOptions().colors[3],
                fillColor: 'white'
            }
        }, {
            type: 'pie',
            name: 'Total consumption',
            data: [{
                name: 'Jane',
                y: 13,
                color: Highcharts.getOptions().colors[0] // Jane's color
            }, {
                name: 'John',
                y: 23,
                color: Highcharts.getOptions().colors[1] // John's color
            }, {
                name: 'Joe',
                y: 19,
                color: Highcharts.getOptions().colors[2] // Joe's color
            }],
            center: [100, 80],
            size: 100,
            showInLegend: false,
            dataLabels: {
                enabled: false
            }
        }]
    };

//    $scope.changeCats();
});