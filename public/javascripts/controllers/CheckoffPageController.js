/****
* Controller for the Checkoff page.
*/
ibetcha.controller('CheckoffPageController',
    function($scope, $http, $location, $cookieStore, $routeParams) {
        $http.defaults.headers.post["Content-Type"] = "application/json";


        if (!$cookieStore.get('session')) {
            $location.path('/');
        } 
        else {
            // get the check off details

            $http({
                method: "GET",
                url: "bets/pending/" +  $routeParams.id,
                }).success(function(data, status, headers, config) {
                    console.log("pending data received", data.content);
                    if (data.content.length === 0) {
                        $scope.empty = true;
                    } else {
                        $scope.today = data.content[0];
                        $scope.pending = data.content.slice(1, data.content.length);
                        console.log("today and pending", $scope.today, $scope.pending);
                        if ($scope.pending && $scope.pending.length > 1) {
                            $scope.numpending = $scope.pending.length;
                        } else {
                            $scope.numpending = 0;
                        }
                        
                    }                    
                }).
            error(function(data, status, headers, config) {
                alert(data.err);
            });
        };

        $scope.check = function (milestoneId) {
            var yes = confirm("Did this person really do what he was supposed to do?");
            var milestoneStatus = "Failed";
            if (yes) {
                milestoneStatus = "Success";
            }
            $http({
                method:"PUT",
                url:"milestones/" + milestoneId,
                data: {
                    status: milestoneStatus
                }
            })
            .success(function(data, status, headers, config) {
                console.log("inside check", data.content);
                alert("Checkoff successful");
                $location.path('/checkoff/' + milestoneId);   
            })
            .error(function(data, status, headers, config) {
                alert(data.err+ " Checkoff failed");
            });
            
        };

        

    }
);
