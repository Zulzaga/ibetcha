/****
* Controller for the Navbar.
* Controls all the buttons on the bar.
*/
ibetcha.controller('BetPageController',
    function($scope, $http, $location, $cookieStore, $routeParams) {
        $http.defaults.headers.post["Content-Type"] = "application/json";

        if (!$cookieStore.get('session')) {
            $location.path('/');
        } else {
            $http({
                method: "GET",
                url: "bets/" +  $routeParams.id,
                }).success(function(data, status, headers, config) {
                    console.log(data);
                    $scope.bet = data.content;
                }).
            error(function(data, status, headers, config) {
                alert(data.err);
            });
        }
    }
);
