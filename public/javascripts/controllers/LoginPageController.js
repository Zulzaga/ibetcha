'use strict';

/* Controllers */

/****
* Controller for the Login page.
*/
ibetcha.controller('LoginPageController',
    function($scope, $http, $location, $cookieStore) {

        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');
        
        // If there's a logged in user, redirect to the home page.
        if ($cookieStore.get('session')) {
            $location.path('/home');
        } else {
            $location.path('/');
        }

        // When the Login button is clicked, sends a request to the server to 
        // login the user.
        // Upon success sets the session and the user in the cookieStore and redirects to the home page.
        // Upon error, alerts the error with an appropriate message.
        $scope.login = function() {
            $http({
                method: "POST",
                url: "users/login",
                data: $scope.loginForm
                }).success(function(data, status, headers, config) {
                	$location.path('/home');
                	$cookieStore.put('user', $scope.loginForm.username);
                    $cookieStore.put('session', true);                                        
                }).
                error(function(data, status, headers, config) {
                    console.log(data.err);
                    alert("Login information is incorrect");
                });
        }

        // When the Signup button is clicked, sends a request to the server
        // to signup a new user.
        // Upon success sets the session and the user in the cookieStore and redirects to the home page.
        // Upon error, alerts the error with an appropriate message.
        $scope.signup = function() {
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


