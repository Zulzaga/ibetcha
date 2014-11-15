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
             
            $http({
                method: "GET",
                url: "users/logout",
                }).success(function(data, status, headers, config) {
                    alert("successfully logged out");
                    $location.path('/');
                    $cookieStore.remove('user');
                    $cookieStore.remove('session');
                    console.log("inside logout: cookiestore session is: " + $cookieStore.get('session'));
                }).
                error(function(data, status, headers, config) {
                    alert(data.err);
                });
        }

        // When the favorite button is clicked, broadcasts the homeClicked event to all the controllers.
        $scope.home = function() {
            console.log("home");
            $location.path("/home");
            //$scope.$root.$broadcast("homeClicked");
        }

        $scope.invite = function() {
            $location.path("/invite");
        }

        $scope.edit = function() {
            console.log("inside edit bet client side function");
            $location.path("/edit");
        }

        // Redirects to login page.
        $scope.login = function() {
            $location.path('/');
        }
    }
);
