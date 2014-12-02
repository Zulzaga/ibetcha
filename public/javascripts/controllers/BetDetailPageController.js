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
                    $scope.bet.startDate = new Date(data.content.startDate).toDateString();
                    $scope.bet.endDate = new Date(data.content.endDate).toDateString();
                    $scope.bet.dropDate = new Date(data.content.dropDate).toDateString();
                    $scope.milestones = data.content.milestones;
                    $scope.monitors = data.content.monitors;
                    var l = data.content.milestones.length;


                    $scope.getMilestoneColor = function(m){
                        if (m.status==="Inactive"){
                            return {'milestone_grey milestone':true};
                        }
                        else if (m.status === "Success"){
                            return {'milestone_green milestone':true};
                        }
                        else if (m.status === "Open"){
                            return {'milestone_blue milestone':true};
                        }
                        else if (m.status === "Pending Action"){
                            return {'milestone_orange milestone':true};
                        }
                        else if (m.status === "Failed"){
                            return {'milestone_red milestone':true};
                        }
                        else if (m.status === "Closed"){
                            return {'milestone_dark_grey milestone':true};
                        }
                        else{
                            return {'milestone_white milestone':true};
                        }
                    }
                    console.log("How many: "+l);

                    if($routeParams.type === 'monitor') {
                        $scope.isMonitor = true;
                    } else {
                        $scope.isMonitor = false;
                    }
                }).
                error(function(data, status, headers, config) {
                    $scope.err = data.err;
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
