/**
 * Created by Paul on 1/29/15.
 */
angular.module("configApp").config( function($routeProvider){
    $routeProvider.when("/home",{
        templateUrl: 'views/insurance_list.html',
        controller: 'InsuranceController'
    });
    $routeProvider.when("/add",{
        templateUrl: 'views/add.html',
        controller: 'ConfigAppCtrl'
    });
    $routeProvider.when("/offences",{
        templateUrl: 'views/offence_registry.html',
        controller: 'ConfigAppCtrl'
    });
    $routeProvider.when("/accidents",{
        templateUrl: 'views/accidents_config.html',
        controller: 'AccConfigCtrl'
    });

    $routeProvider.when("/administrative_Units",{
        templateUrl: 'views/stations.html',
        controller: 'OrgUnitAppCtrl'
    });

    $routeProvider.when("/insurance",{
        templateUrl: 'views/insurance_list.html',
        controller: 'InsuranceController'
    });

    $routeProvider.when("/registration",{
        templateUrl: 'views/vehicle_model.html',
        controller: 'InspectionController'
    });
    $routeProvider.otherwise({
        redirectTo: '/home'
    });
});
