'use strict';

/* Controllers */

//var mitmapControllers = angular.module('mitmapControllers', []);

ibetcha.controller('LoginPageController',
    function($scope, $http, $location, $cookieStore) {
        $http.defaults.headers.post["Content-Type"] = "application/json";
        
        console.log("cookiestore session: " + $cookieStore.get('session'));
        if ($cookieStore.get('session')) {
            $location.path('/home');
        }

        $scope.login = function() {
            $http({
                method: "POST",
                url: "users/login",
                data: $scope.loginForm
                }).success(function(data, status, headers, config) {
                	$location.path('/home');
                	$cookieStore.put('user', $scope.loginForm.username);
                    $cookieStore.put('session', true);
                                        
                    //data.content = the entire user object
                }).
                error(function(data, status, headers, config) {
                    console.log(data.err);
                    alert("Login information is incorrect");
                });
        }

        $scope.checkSession = function() {
	        console.log("session is " + $cookieStore.get('session'));
	        return $cookieStore.get('session');
	    };

        $scope.signup = function() {
            console.log($scope.signupForm);

            $http({
                method: "POST",
                url: "users/new",
                data: $scope.signupForm,
                }).success(function(data, status, headers, config) {
                    console.log("signup successful");
                    $location.path('/home');
                    $cookieStore.put('user', $scope.signupForm.username);
                    $cookieStore.put('type', data.content._type);
                    $cookieStore.put('session', true);
                }).
                error(function(data, status, headers, config) {
                    alert(data.err);
                });
        }
    }

);


