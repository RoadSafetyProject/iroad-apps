/**
 * Created by kelvin on 1/29/15.
 */
angular.module('rsmsaApp')
    .controller('vehicleAppCtrl',function($scope,$http,$mdDialog){
        $scope.data = {};
        $scope.report = {};
        $scope.report.years = [];
        $scope.report.colors = [{color:'White'},{color:'Blue'},{color:'Yellow'},{color:'Red'},{color:'Green'},{color:'Black'},{color:'Brown'},{color:'Grey'},{color:'Pink'},{color:'Multicolor'}]
        $scope.report.fuel = [{fuel:'Petrol'},{fuel:'Diesel'},{fuel:'Electricity'},{fuel:'Other'}]
        $scope.report.make = [];
        $scope.report.model =[];
        $scope.report.ownership = [];
        $scope.report.country = [];
        $scope.report.category = [{category:'Motocyle'},{category:'Motor Tricycle'},{category:'Light Passenger Vehicle'},{category:'Heavy Passenger Vehicle'},{category:'Light Load Vehicle'},{category:'Heavy Load Vehicle'},{category:'Trailer'},{category:'Agriculture Tractor'},{category:'Agriculture Trailer'},{category:'Mining or Road Construction Equipment'},{category:'Other'}];
        $scope.data.usedCat = [{name:'Motocyle'},{name:'Motor Tricycle'},{name:'Light Passenger Vehicle'},{name:'Heavy Passenger Vehicle'},{name:'Light Load Vehicle'},{name:'Heavy Load Vehicle'},{name:'Trailer'},{name:'Agriculture Tractor'},{name:'Agriculture Trailer'},{name:'Mining or Road Construction Equipment'},{name:'Other'}];
        $scope.column = 'class';
        $scope.table = {};
        $scope.data.category = 'category';

        $scope.displayTable = true;
        $http.get('../../vehicle').success(function(data){
            $scope.data.vehicles = data;
        });

        $scope.deleteVehicle = function (vehicle) {
            $scope.data.vehicles.splice($scope.data.vehicles.indexOf(vehicle), 1);
            $http.post("../../vehicle/delete/"+vehicle.id).success(function () {

            });
        }

        $scope.showConfirm = function(ev,vehicle) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete this Entry')
                .content('This action is irreversible')
                .ariaLabel('Lucky day')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                $scope.deleteVehicle(vehicle);
            }, function() {

            });
        };

        $scope.showAdvanced = function(ev,vehicle) {
            $scope.selectedVehicle = vehicle;
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'views/dialog.html',
                targetEvent: ev
            })
                .then(function(answer) {

                }, function() {
                });
        };

        //get the dropdown ready use and change the series of chart
        $scope.prepareDropdown = function(value){
            $scope.data.usedCat = [];
            if(value == 'years'){
                var i = 0;
                $scope.column = 'yom';
                $scope.chartConfig.title.text = 'Motor Vehicle Year of Manufacture';
                angular.forEach($scope.report.years,function(cats){
                    //control to show fewer values
                    i++;
                    if(i<7){
                        $scope.data.usedCat.push({name: cats.year,ticked: true})
                    }else{
                        $scope.data.usedCat.push({name: cats.year,ticked: false})
                    }
                })
            }if(value == 'Ownership'){
                var i = 0;
                $scope.column = 'ownership_category';
                $scope.chartConfig.title.text = 'Distribution of Ownership of Motor vehicle';
                angular.forEach($scope.report.ownership,function(cats){
                    i++;
                    if(i<8){
                        $scope.data.usedCat.push({name: cats.name,ticked: true})
                    }else{
                        $scope.data.usedCat.push({name: cats.name,ticked: false})
                    }
                })
            }if(value == 'category'){
                $scope.column = 'class';
                $scope.chartConfig.title.text = 'Motor Vehicle Categories';
                angular.forEach($scope.report.category,function(cats){
                    $scope.data.usedCat.push({name: cats.category,ticked: true})
                })
            }if(value == 'model'){
                var i = 0;
                $scope.column = 'type';
                $scope.chartConfig.title.text = 'Motor Vehicle Model(Type)';
                angular.forEach($scope.report.model,function(cats){
                    i++;
                    if(i<7){
                        $scope.data.usedCat.push({name: cats.model,ticked: true})
                    }else{
                        $scope.data.usedCat.push({name: cats.model,ticked: false})
                    }
                })
            }if(value == 'make'){
                var i =0;
                $scope.column = 'make';
                $scope.chartConfig.title.text = 'Motor Vehicle Make';
                angular.forEach($scope.report.make,function(cats){
                    i++;
                    if(i<7){
                        $scope.data.usedCat.push({name: cats.make,ticked: true})
                    }else{
                        $scope.data.usedCat.push({name: cats.make,ticked: false})
                    }
                })
            }if(value == 'fuel'){
                $scope.column = 'fuel';
                $scope.chartConfig.title.text = 'Motor Vehicle Fuel Types';
                angular.forEach($scope.report.fuel,function(cats){
                    $scope.data.usedCat.push({name: cats.fuel,ticked: true})
                })
            }if(value == 'color'){
                $scope.column = 'color';
                $scope.chartConfig.title.text = 'Motor Vehicle Colors Reports';
                angular.forEach($scope.report.colors,function(cats){
                    $scope.data.usedCat.push({name: cats.color,ticked: true})
                })
            }if(value == 'importation'){
                var i = 0;
                $scope.column = 'imported_from';
                $scope.chartConfig.title.text = 'Motor Vehicle Importation Countries';
                angular.forEach($scope.report.country,function(cats){
                    i++;
                    if(i<7){
                        $scope.data.usedCat.push({name: cats.name,ticked: true})
                    }else{
                        $scope.data.usedCat.push({name: cats.name,ticked: false})
                    }
                })
            }
            $scope.changeCats();
        }


        $scope.changeCats = function(){
            $scope.chartConfig.xAxis.categories = [];
            angular.forEach( $scope.data.usedCat, function( value, key ) {
                if ( value.ticked === true ) {
                    $scope.chartConfig.xAxis.categories.push(value.name);
                }
            });
            $scope.getData();
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

        $scope.getValue1 = function(column,value){

        }

        //getting a list of countries
        $http.get('../../countries').success(function(data){
            $scope.report.country = data;
        });

        //getting a list of vehicle ownership category
        $http.get('../../ownership_category').success(function(data){
            $scope.report.ownership = data;
        });

        //getting a list of car makes
        $http.get('../../car_make').success(function(data){
            $scope.report.make = data;
        });

        //getting a list of car makes
        $http.get('../../car_year').success(function(data){
            $scope.report.years = data;
        });

        //getting a list of car models
            $http.get('../../car_model').success(function(data){
                $scope.report.model = data;
            });

        //changing chart types
        $scope.data.chartType = 'column'
        $scope.changeChart = function(type){
            $scope.displayTable = false;
            if(type == "spider"){
                $scope.chartConfig.options.chart.type = 'line';
                $scope.chartConfig.options.chart.polar = true;
            }else if(type == 'combined'){
                $scope.chartConfig.options.chart.polar =false;
            }else if(type == 'table'){
                $scope.chartConfig.options.chart.polar = false;
                $scope.displayTable = true;
            }else{
                $scope.chartConfig.options.chart.type = type;
                $scope.chartConfig.options.chart.polar = false;
            }

        };

        //drawing some charts
        $scope.chartConfig = {
            options: {
                chart: {
                    type: 'column'
                }
            },
            title: {
                text: 'Motor Vehicle Report'
            },
            xAxis: {
                categories: ['Africa', 'America', 'Asia', 'Europe', 'Oceania'],
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Vehicles',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                valueSuffix: ' millions'
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                },column: {
                    stacking: 'normal'
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -40,
                y: 100,
                floating: true,
                borderWidth: 1,
                backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                shadow: true
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'Year 1800',
                data: [107, 31, 635, 203, 2]
            }, {
                name: 'Year 1900',
                data: [133, 156, 947, 408, 6]
            }, {
                name: 'Year 2008',
                data: [973, 914, 4054, 732, 34]
            }]
        };
        $scope.prepareDropdown('category');


    //business dropdown
        //get the dropdown ready use and change the series of chart
        $scope.prepareBusinessDropdown = function(value){
            $scope.data.businesCat = [];
            if(value == 'Nature of application'){
                var i = 0;
                $scope.businescolumn = 'application_nature';
                $scope.chartConfig.title.text = 'Nature of Motor Vehicle Registration Period';
                $scope.data.businesCat = [{name:'New',ticked: true},{name:'Renewal',ticked: true},{name:'Renewal',ticked: true},{name:'Replacement',ticked: true}]

            }if(value == 'Period applied for'){
                var i = 0;
                $scope.businescolumn = 'period';
                $scope.chartConfig.title.text = 'Period of Motor Vehicle Registration';
                $scope.data.businesCat = [{name:'One year',ticked: true},{name:'Short-term',ticked: true}]
            }if(value == 'Body type'){
                var i = 0;
                $scope.businescolumn = 'body_type';
                $scope.chartConfig.title.text = 'Body Type For Motor Vehicle Registration';
                $scope.data.businesCat = [{name:'Micro bus',ticked: true},{name:'Mini bus',ticked: true},{name:'Large bus',ticked: true},{name:'Other',ticked: true}]
            }if(value == 'Classes of services'){
                var i = 0;
                $scope.businescolumn = 'class_of_service';
                $scope.chartConfig.title.text = 'Classes of Services Motor Vehicle Year of Manufacture';
                $scope.data.businesCat = [{name:'Ordinary',ticked: true},{name:'Semi luxury',ticked: true},{name:'Luxury',ticked: true},{name:'Others',ticked: true}]
            }if(value == 'Nature/Type of service'){
                var i = 0;
                $scope.businescolumn = 'nature_of_service';
                $scope.chartConfig.title.text = 'Nature Of Services for Motor Vehicle Registration';
                $scope.data.businesCat = [{name:'Local Operator',ticked: true},{name:'Tour operator',ticked: true},{name:'Others',ticked: true}]
            }
            $scope.changeBusinessCats();
        }

        $scope.changeBusinessCats = function(){
            $scope.chartConfig.xAxis.categories = [];
            angular.forEach( $scope.data.businesCat, function( value, key ) {
                if ( value.ticked === true ) {
                    $scope.chartConfig.xAxis.categories.push(value.name);
                }
            });
            $scope.getbusinessData();
        }

        $scope.getbusinessData = function(){
            $scope.chartConfig.series = [{
                name: 'Motor Vehicle',
                data: []
            }];
            $scope.table.headers = [];
            $scope.table.colums = [];
            angular.forEach($scope.chartConfig.xAxis.categories,function(value){
                $scope.table.headers.push({name:value});
//                $scope.chartConfig.series[0].data.push(Math.floor(Math.random() * 30))
                $http.get('../../businessvehicle/'+$scope.businescolumn+'/'+value).success(function(data){
                    $scope.table.colums.push({val:data});
                    $scope.chartConfig.series[0].data.push(parseInt(data));
                });
            })
        }
    });

function DialogController($scope, $mdDialog) {
    $scope.vehicle = angular.element("#listTable").scope().selectedVehicle;
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}