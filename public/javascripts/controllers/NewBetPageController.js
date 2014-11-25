/****
* Controller for the Making a new bet page.
*/
ibetcha.controller('NewBetPageController',
    function($scope, $http, $location, $cookieStore) {
        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');

        // Helper function that helps load the page.
        var onPageLoad = function() {
            $http({
                method:"GET",
                url: "users/friends/" + $cookieStore.get('user')
            }).success(function(data, status, headers, config) {
                $scope.friends = data.content;
            }).error(function(jqXHR, textStatus, err){
                $scope.err = err;
            })
        }

        // If no session, (no user), redirect back to the login page.
        if (!$cookieStore.get('session')) {
            $location.path('/');
        } else {
            onPageLoad();
        }

        // When Submit button is clicked, sends a request to the server
        // with the correspnding info to create a new bet.
        // Upon success, redirects back to the Home page and upon error,
        // alerts the error with an appropriate message.
        $scope.submit = function(){
            console.log($scope.editForm);
            var monitorsArray = [];
            var monitors = $scope.editForm.monitors;
            for (i =0; i< monitors.length; i++) {
                monitorsArray.push(monitors[i]._id);
            }
            $scope.editForm.monitors = monitorsArray;
            console.log($scope.editForm.startDate );
            $http({
                method: "POST",
                url: "bets",
                data: $scope.editForm,
                }).success(function(data, status, headers, config) {
                    console.log(data.content);
                    $scope.msg = "Successfully created the bet! Good luck on your resolution! You can do this ;)!";
                    $location.path('/home');
                }).
            error(function(data, status, headers, config) {
                $scope.err = "Could not create a new bet! Make sure to follow the guidelines!";
            });
        }
    }


);