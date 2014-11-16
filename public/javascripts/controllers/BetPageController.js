/****
* Controller for the Bet page.
*/
ibetcha.controller('BetPageController',
    function($scope, $http, $location, $cookieStore, $routeParams) {
        $http.defaults.headers.post["Content-Type"] = "application/json";


        if (!$cookieStore.get('session')) {
            $location.path('/');
        } 
        else {
            $http({
                method: "GET",
                url: "bets/" +  $routeParams.id,
                }).success(function(data, status, headers, config) {
                    $scope.bet = data.content;
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

        $scope.checkoff = function() {
            console.log("checkoff and fuckoff!!!");
            $location.path('/checkoff/' + $routeParams.id);
        };

    }
);
