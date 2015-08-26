'use strict';

/* App Module */

var viewVisualizer = angular.module('viewVisualizer',
		 ['ui.bootstrap', 
		  'ngRoute', 
		  'ngCookies', 
		  'viewVisualizerDirectives', 
		  'viewVisualizerControllers', 
		  'viewVisualizerServices',
          'viewVisualizerFilters',
          'd2Services',
          'd2Controllers',
		  'angularLocalStorage', 
		  'pascalprecht.translate',
          'd2HeaderBar'])
              
.value('DHIS2URL', '..')

.config(function($translateProvider) {   
    $translateProvider.preferredLanguage('en');
    $translateProvider.useLoader('i18nLoader');
});
