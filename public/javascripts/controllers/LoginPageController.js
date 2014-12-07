'use strict';

/* Controllers */

/****
* Controller for the Login page.
*/
ibetcha.controller('LoginPageController',
    function($scope, $http, $location, $cookieStore, $sce) {

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

            $scope.loginForm.username = sanitizeTextInput($scope.loginForm.username);
            $scope.loginForm.password = validator.toString($scope.loginForm.password); 

            var isValidInput = $scope.loginForm.username;

            if(isValidInput) {
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
                        $scope.loginErr = data.err; // Server side validation
                    });
            } else {
                $scope.loginErr = "Please submit valid username/password"; // client side validation
                $scope.loginForm.username = "";
                $scope.loginForm.password = ""; 
            }
            
        }

        // When the Signup button is clicked, sends a request to the server
        // to signup a new user.
        // Upon success sets the session and the user in the cookieStore and redirects to the home page.
        // Upon error, alerts the error with an appropriate message.
        $scope.signup = function() {

            $scope.signupForm.username = sanitizeTextInput($scope.signupForm.username);
            $scope.signupForm.password = validator.toString($scope.signupForm.password);
            $scope.signupForm.email = sanitizeEmailInput($scope.signupForm.email);

            var isValidInput = $scope.signupForm.username && $scope.signupForm.email;

            if(isValidInput) {
                $http({
                    method: "POST",
                    url: "users/new",
                    data: $scope.signupForm,
                    }).success(function(data, status, headers, config) {
                        $location.path('/home');
                        $cookieStore.put('user', $scope.signupForm.username);
                        $cookieStore.put('type', data.content._type);
                        $cookieStore.put('session', true);
                    }).
                    error(function(data, status, headers, config) {
                        $scope.signErr = data.err; // Server-side validation
                    });
            } else {
                $scope.signErr = "Please submit a valid input"; // Client-side validation
                $scope.signupForm.username = "";
                $scope.signupForm.password = "";
                $scope.signupForm.email = "";
            }
        }
    }
);


