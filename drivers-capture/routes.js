/**
 * Created by kelvin on 1/29/15.
 */
angular.module("rsmsaApp").config( function($routeProvider){
    $routeProvider.when("/home",{
        templateUrl: 'views/home.html',
        controller: 'vehicleAppCtrl'
    });
    $routeProvider.when("/list",{
        templateUrl: 'views/list.html',
        controller: 'vehicleAppCtrl'
    });
    $routeProvider.when("/import",{
        templateUrl: 'views/import.html',
        controller: 'vehicleImportCtrl'
    });$routeProvider.when("/add",{
        templateUrl: 'views/add.html',
        controller: 'vehicleAddCtrl'
    });$routeProvider.when("/insurance",{
        templateUrl: 'views/insurance.html',
        controller: 'insuranceAddCtrl'
    });$routeProvider.when("/inspection",{
        templateUrl: 'views/inspection.html',
        controller: 'inspectionCtrl'
    });$routeProvider.when("/licencing",{
        templateUrl: 'views/car_licence.html',
        controller: 'licenceCtrl'
    });
    $routeProvider.when("/vehicle/:plate_number/offences",{
        templateUrl: '/app/offence/views/offencelist.html',
        controller: 'offenceListController'
    });
    $routeProvider.when("/offence/:request/:id",{
        templateUrl: '/app/offence/views/offenceForm.html',
        controller: 'offenceFormController'
    });
    $routeProvider.when("/car/:id",{
        templateUrl: 'views/car.html',
        controller: 'singleCarController'
    });
    $routeProvider.when('/api/accident/view/:accident_id' ,{
        templateUrl: 'views/view_accident.html',
        controller:'ViewAccidentController'
    });
    $routeProvider.when('/api/inspection/view/:inspe_id' ,{
        templateUrl: 'views/view_inspection.html',
        controller:'ViewInspectionController'
    });
    $routeProvider.when('/buslicence/view/:bus_id' ,{
        templateUrl: 'views/view_busines.html',
        controller:'ViewBusinessController'
    });
    $routeProvider.otherwise({
        redirectTo: '/home'
    });
});
