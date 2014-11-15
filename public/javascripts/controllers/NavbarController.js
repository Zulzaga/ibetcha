/****
* Controller for the Navbar.
* Controls all the buttons on the bar.
*/
ibetcha.controller('NavbarController',
    function($scope, $http, $location, $cookieStore) {
        $http.defaults.headers.post["Content-Type"] = "application/json";

        $scope.loggedIn = $cookieStore.get('session');

        // Determines if somebody is logged in.
        $scope.checkSession = function() {
            return $cookieStore.get('session');
        };

        // Logs out current user
        $scope.logout = function() {
            console.log("inside logout function");
            if($cookieStore.get('session')) {
                $http({
                    method: "GET",
                    url: "users/logout",
                    }).success(function(data, status, headers, config) {
                        $cookieStore.remove('user');
                        $cookieStore.remove('session');
                        alert("successfully logged out");
                        $location.path('/');
                        
                        console.log("inside logout: cookiestore session is: " + $cookieStore.get('session'));
                    }).
                    error(function(data, status, headers, config) {
                        alert(data.err);
                    });
            } else {
                $location.path("/");
            }            
        }

        // When the favorite button is clicked, broadcasts the homeClicked event to all the controllers.
        $scope.home = function() {

            if($cookieStore.get('session')) {
                $location.path("/home");
            }  else {
                $location.path("/");
            }
        }

        $scope.invite = function() {
            if($cookieStore.get('session')) {
                $location.path("/invite");
            }            
        }

        $scope.edit = function() {
            console.log("inside edit bet client side function");
            if($cookieStore.get('session')) {
                $location.path("/edit");
            }            
        }

        // Redirects to login page.
        $scope.login = function() {
            $location.path('/');
        }
    }
);
