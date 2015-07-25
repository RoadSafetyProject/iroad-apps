/**
 * Created by PAUL on 1/18/2015.
 */
angular.module('sidenavDemo1', ['ngMaterial'])

    .controller('SideCtrl', function($scope, $timeout, $mdSidenav, $log) {

        $scope.toggleLeft = function() {
            $mdSidenav('left').toggle()
                .then(function(){
                    $log.debug("toggle left is done");
                });
        };
        $scope.toggleRight = function() {
            $mdSidenav('right').toggle()
                .then(function(){
                    $log.debug("toggle RIGHT is done");
                });
        };
    })
    .controller('LeftCtrl', function($scope, $timeout, $mdSidenav, $log) {
        $scope.close = function() {
            $mdSidenav('left').close()
                .then(function(){
                    $log.debug("close LEFT is done");
                });
        };
    })
    .controller('RightCtrl', function($scope, $timeout, $mdSidenav, $log) {
        $scope.close = function() {
            $mdSidenav('right').close()
                .then(function(){
                    $log.debug("close RIGHT is done");
                });
        };
    });