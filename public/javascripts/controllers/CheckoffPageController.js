/****
* Controller for the Checkoff page.
*/
ibetcha.controller('CheckoffPageController',
    function($scope, $http, $location, $cookieStore, $routeParams) {

        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');

        // Helper function for loading the page.
        var count = 0;
        var onPageLoad = function() {

            // get the pending milestones from the server
            $http({
                method: "GET",
                url: "bets/" + $routeParams.id + "/milestones/pending",
                }).success(function(data, status, headers, config) {
                    console.log("pending data received: " + count, data.content);
                    count++;
                    if (data.content.length === 0) {
                        console.log("scope is empty");
                        $scope.empty = true;
                        $scope.pending = [];
                    } else {
                        $scope.today = data.content[0];
                        $scope.pending = data.content.slice(1, data.content.length);
                        console.log("today and pending", $scope.today, $scope.pending);
                        if ($scope.pending && $scope.pending.length >= 1) {
                            $scope.numpending = $scope.pending.length;
                        } else {
                            $scope.numpending = 0;
                        }                        
                    }                    
                }).
                error(function(data, status, headers, config) {
                    $scope.err = data.err;
                });
        }

        // Helper function for sending checkoff.
        // Upon success, reloads the page and upon error,
        // alerts the error with an appropriate message.
        var sendCheckoff = function(milestoneId, milestoneStatus) {
            $http({
                    method: "PUT",
                    url: "milestones/" + milestoneId,
                    data: {
                        status: milestoneStatus
                    }
                })
                .success(function(data, status, headers, config) {
                    console.log("inside check", data.content, $routeParams.id);
                    $scope.msg = "Checkoff successful";
                    onPageLoad();   

                }).
                error(function(data, status, headers, config) {
                    $scope.err = data.err+ " Checkoff failed";
                });
        }

        // If no session, (no user), redirect back to the login page.
        if (!$cookieStore.get('session')) {
            $location.path('/');
        } 
        else {
            // load the page
            onPageLoad();
        };

        // When the Check button is clicked, sends a request to the server to checkoff the 
        // corresponding milestone.
        $scope.check = function (milestoneId) {
            var yes = confirm("Did this person really do what he/she was supposed to do?");
            if (yes) {
                sendCheckoff(milestoneId, "Success");
            }
        };

        // When the Fail button is clicked, sends a request to the server to fail the 
        // corresponding milestone.
        $scope.fail = function (milestoneId) {
            var no = confirm("Did this person really fail to do what he/she was supposed to do?");
            if (no) {
                sendCheckoff(milestoneId, "Failed");
            }
        }
    }
);
