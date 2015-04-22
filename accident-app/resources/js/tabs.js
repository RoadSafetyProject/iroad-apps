angular.module('accApp', ['ngMaterial','sidenavDemo1','buttonsDemo1'])
    .controller('AppCtrl', function ($scope, $log) {

        var tabs = [
            { title: 'Vehicle Details'}];
        var tabs2 = [
            { title: 'Passenger Details'}];
        var tabs3 = [
            { title: 'Witness Details'}];

        $scope.tabs = tabs;
        $scope.tabs2 = tabs2;
        $scope.tabs3 = tabs3;

        $scope.selectedIndex = 2;

        $scope.addVehicle = function ( view) {
            var increment = tabs.length + 1;
            var title = "Vehicle" + " " + increment + " " +  "Details" ;
            view = view || title + " Content View";
            tabs.push({ title: title, content: view, disabled: false});
        };

        $scope.addPassenger = function ( view) {
            var increment = tabs2.length + 1;
            var title = "Passenger" + " " + increment + " " +  "Details" ;
            view = view || title + " Content View";
            tabs2.push({ title: title, content: view, disabled: false});
        };


        $scope.addWitness = function ( view) {
            var increment = tabs3.length + 1;
            var title = "Witness" + " " + increment + " " +  "Details" ;
            view = view || title + " Content View";
            tabs3.push({ title: title, content: view, disabled: false});
        };


        $scope.removeTab = function (tab) {
            for (var j = 0; j < tabs.length; j++) {
                if (tab.title == tabs[j].title) {
                    $scope.tabs.splice(j, 1);
                    break;
                }
            }
        };
    });