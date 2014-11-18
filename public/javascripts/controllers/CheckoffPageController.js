/****
* Controller for the Checkoff page.
*/
ibetcha.controller('CheckoffPageController',
    function($scope, $http, $location, $cookieStore, $routeParams) {
        $http.defaults.headers.post["Content-Type"] = "application/json";

        var count = 0;
        var init = function() {
            $http({
                method: "GET",
                url: "bets/" +  $routeParams.id +"/milestones/pending",
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
                alert(data.err);
            });
        }

        if (!$cookieStore.get('session')) {
            $location.path('/');
        } 
        else {
            // get the check off details
            init();
        };

        $scope.check = function (milestoneId) {
            var yes = confirm("Did this person really do what he/she was supposed to do?");
            if (yes) {
                sendCheckoff(milestoneId, "Success");
            }
        };

        $scope.fail = function (milestoneId) {
            var no = confirm("Did this person really fail to do what he/she was supposed to do?");
            if (no) {
                sendCheckoff(milestoneId, "Failed");
            }
        }

        var sendCheckoff = function(milestoneId, milestoneStatus) {
            $http({
                    method:"PUT",
                    url:"milestones/" + milestoneId,
                    data: {
                        status: milestoneStatus
                    }
                })
                .success(function(data, status, headers, config) {
                    console.log("inside check", data.content, $routeParams.id);
                    alert("Checkoff successful");
                    init();   

                })
                .error(function(data, status, headers, config) {
                    alert(data.err+ " Checkoff failed");
                });
        }

        

    }
);
