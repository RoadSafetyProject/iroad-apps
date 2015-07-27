/**
 * Created by PAUL on 3/3/2015.
 */
angular.module('accidentApp').controller('AccidentStatisticsCtrl',function($scope,$http){
    //getting all regions
    $scope.data = {};
    $scope.data.usedRegions = [];
    $scope.data.usedDistricts = [];
    $scope.data.usedWards = [];
    $scope.data.usedVillages = [];
    $scope.data.report_type = "Gender";
    $scope.data.category = "Regions"
    $scope.table = {};

    //getting districts
    $http.get("/districts").success(function(data){
        $scope.data.districts = data;
        $scope.data.usedDistricts = [];
        angular.forEach(data,function(datta){
            $scope.data.usedDistricts.push({name: datta.name, ticked: false });
        });
    });

    //getting Regions

    $http.get("/regions").success(function(data){
        $scope.data.regions = data;
        $scope.data.usedRegions = [];
        angular.forEach(data,function(value){
            $scope.data.usedRegions.push({name: value.name, ticked: false})
        });
    });

    //preparing the wards
    $scope.getWards1 = function(id){

        $http.get("/wards/district/"+id).success(function(distr){
            $scope.data.usedWards = [];
            angular.forEach(distr,function(value){
                $scope.data.usedWards.push({name: value.name, ticked: false})
            });
        });
    }
    //preparing the wards
    $scope.getWards = function(id){

        $http.get("/wards/district/"+id).success(function(distr){
            $scope.data.disward = distr;
        });
    }

    //preparing the village
    $scope.getVillages1 = function(id){

        $http.get("/village/ward/"+id).success(function(distr){
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

    $scope.prepareDropdown = function(){
        $scope.area = [];

        if($scope.data.category == "Regions"){
            angular.forEach($scope.data.selectedRegions,function(value){
                $scope.area.push(value.name);
            });

        }if($scope.data.category == "Districts"){
            angular.forEach($scope.data.selectedDistricts,function(value){
                $scope.area.push(value.name);
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
            $scope.subCategory = ["Male Injured","Female Injured" ,"Male Killed","Female Killed"]

        }if($scope.data.report_type == "Classes of persons "){
            $scope.subCategory = ["Drivers","Passengers","Motor Cyclists"]

        }if($scope.data.report_type == "Weather"){
            $scope.subCategory = ["Wet Rain","Dry","Slippery","Fogg"]

        }if($scope.data.report_type == "Accident Cause"){
            $scope.subCategory = ["Dangerous Driving","Careless Driver","Mechanical Defects","Excessive Speed","Lights","Animal Stray","Overtaking","Obstruction",]

        }if($scope.data.report_type == "Private Cars"){
            $scope.subCategory = ["P.S.V(Buses)","P.S.V(Dala Dala)","P.S.V(Taxi Cabs)"]
        }if($scope.data.report_type == "Institutional Vehicles"){
            $scope.subCategory = ["Dangerous Driving","Careless Drive","Mechanical Defects"]
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
            angular.forEach($scope.subCategory,function(value){
                angular.forEach($scope.chartConfig.xAxis.categories,function(val){
                    $http.post("getStatistics/")
                    serie.push({name: value+" - "+ val , y: Math.random()*100 })
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
            angular.forEach($scope.subCategory,function(value){
                var serie = [];
                angular.forEach($scope.chartConfig.xAxis.categories,function(val){
                    serie.push(Math.random()*100)
                });
                $scope.normalseries.push({type: $scope.data.chartType, name: value, data: serie})
            });
            $scope.chartConfig.series = $scope.normalseries;
        }

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
            text: 'Accident Statistics Chart'
        },
        xAxis: {
            categories: []
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
            name: 'Male',
            data: [3, 2, 1, 3, 4]
        }, {
            type: 'column',
            name: 'Female',
            data: [2, 3, 5, 7, 6]
        }, {
            type: 'column',
            name: 'Others',
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
            name: 'Total Accidents',
            data: [{
                name: 'Male',
                y: 13,
                color: Highcharts.getOptions().colors[0] // Jane's color
            }, {
                name: 'Female',
                y: 23,
                color: Highcharts.getOptions().colors[1] // John's color
            }, {
                name: 'Others',
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

})