/****
* Controller for the Bet page.
*/
ibetcha.controller('BetDetailPageController',
    function($scope, $http, $location, $cookieStore, $routeParams) {

        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');

        // Helper function for loading the page.
        var onPageLoad = function() {

            // get the bet details from the server to display
            $http({
                method: "GET",
                url: "bets/" +  $routeParams.id,
                }).success(function(data, status, headers, config) {
                    $scope.bet = data.content;
                    $scope.bet.startDate = data.content.startDate.substring(0, 10);
                    $scope.bet.endDate = data.content.endDate.substring(0, 10);
                    $scope.bet.dropDate = data.content.dropDate.substring(0, 10);

                    if($routeParams.type === 'monitor') {
                        $scope.isMonitor = true;
                    } else {
                        $scope.isMonitor = false;
                    }
                }).
                error(function(data, status, headers, config) {
                    alert(data.err);
                });
        }

        // If no session, (no user), redirect back to the login page.
        if (!$cookieStore.get('session')) {
            $location.path('/');
        } else {
            onPageLoad();
        }

        // When checkoff button is clicked, redirects the checkoff page for the given bet.
        $scope.checkoff = function() {
            $location.path('/checkoff/' + $routeParams.id);
        };
    }
);
