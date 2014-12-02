/****
* Controller for the Navbar.
* Controls all the buttons on the bar.
*/
ibetcha.controller('NavbarController',
    function($scope, $http, $location, $cookieStore, $routeParams) {
        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');
        $scope.user = $cookieStore.get('user');

        // Helper function that helps load the page.
        var onPageLoad = function() {
            $http({
                method: "GET",
                url: "users/logout",
                }).success(function(data, status, headers, config) {
                    $location.path('/');
                    
                    console.log("inside logout: cookiestore session is: " + $cookieStore.get('session'));
                }).
                error(function(data, status, headers, config) {
                    $scope.err = data.err;
                });
        }

        // Logs out current user
        $scope.logout = function() {
            console.log("inside logout function");
            if(!$cookieStore.get('session')) {
                $location.path("/");
            } else {
                $cookieStore.remove('user');
                $cookieStore.remove('session');
                onPageLoad();
            }            
        }

        // When the home button is clicked, if there's a session (user logged in), 
        // redirect to the Home page, otherwise redirects to the Login Page.
        $scope.home = function() {
            if($cookieStore.get('session')) {
                console.log("@@");
                $location.path("/home");
            }  else {
                console.log("$$");
                $location.path("/");
            }
        }

        // When the home button is clicked, if there's a session (user logged in), 
        // redirect to the Friend Invite page.
        $scope.invite = function() {
            if($cookieStore.get('session')) {
                $location.path("/invite");
            }            
        }

        // When the home button is clicked, if there's a session (user logged in), 
        // redirect to the Making a New Bet page.
        $scope.newbet = function() {
            console.log("inside edit bet client side function");
            if($cookieStore.get('session')) {
                $location.path("/newbet");
            }            
        }

        // When the Payment Requests is clicked, redirects to the Payment Requests page.
        $scope.search = function() {
            // get current user infos from the server.
            if ($scope.text == $scope.user) {
                $location.path("/home");
            } else {
                $http({
                    method: "GET",
                    url: "users/" + $scope.text,
                    }).success(function(data, status, headers, config) {
                        var user = data.content.user;
                        $location.path("/profile/" + user.username);
                    }).
                error(function(data, status, headers, config) {
                    $scope.searchErr = data.err;
                });
            }
        }  

        // When the request button is clicked, if there's a session (user logged in), 
        // redirect to the Friend Requests page.
        $scope.request = function() {
            console.log("inside send friend request client side function");
            if($cookieStore.get('session')) {
                $location.path("/request");
            }            
        }

        // Redirects to login page.
        $scope.login = function() {
            $location.path('/');
        }
    }
);
