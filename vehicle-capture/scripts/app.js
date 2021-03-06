'use strict';

/* App Module */

var eventCapture = angular.module('eventCapture',
		 ['ui.bootstrap', 
		  'ngRoute', 
		  'ngCookies', 
		  'eventCaptureDirectives', 
		  'eventCaptureControllers', 
		  'eventCaptureServices',
          'eventCaptureFilters',
		  'd2Filters',
          'd2Directives',
          'd2Services',
          'd2Controllers',
		  'angularLocalStorage', 
		  'pascalprecht.translate',
          'd2HeaderBar',"datatables",'datatables.bootstrap','ui.date'])
              
.value('DHIS2URL', '../../..')

.config(function($routeProvider, $translateProvider) {    
    
    $routeProvider.when('/', {
        templateUrl: 'views/home.html',
        controller: 'MainController'
    }).otherwise({
        redirectTo : '/'
    });
    
    $translateProvider.preferredLanguage('en');
    $translateProvider.useLoader('i18nLoader');
    
});