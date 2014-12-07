/****
* Controller for the Making a new bet page.
*/
ibetcha.controller('NewBetPageController',
    function($scope, $http, $location, $cookieStore) {
        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');
        $scope.searchUsername = "";

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
            if (!$scope.editForm) {
                $scope.err = "Please fill in all the required fields!";
            } else {
                
                if(!$scope.editForm.monitors || $scope.editForm.monitors.length < 3) {
                    $scope.err = "You need at least three monitors. Please add more friends as your monitors."
                } else if(isValidInput) {
                    var monitorsArray = [];
                    var monitors = $scope.editForm.monitors;
                    for (i =0; i< monitors.length; i++) {
                        monitorsArray.push(monitors[i]._id);
                    }
                    $scope.editForm.monitors = monitorsArray;
                    
                    $scope.editForm.description = sanitizeTextInput($scope.editForm.description);
                    $scope.editForm.startDate = sanitizeDateInput($scope.editForm.startDate);
                    $scope.editForm.endDate = sanitizeDateInput($scope.editForm.endDate);
                    $scope.editForm.frequency = sanitizeNumericInput($scope.editForm.frequency);
                    $scope.editForm.amount = sanitizeNumericInput($scope.editForm.amount);

                    var isValidInput = $scope.editForm.description && $scope.editForm.startDate && $scope.editForm.endDate 
                                       && $scope.editForm.frequency && $scope.editForm.amount;

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
                        console.log(data.err);
                        if (!data.err) {
                            $scope.err = "Please read the instructions again and enter valid details!"
                        } else {
                            $scope.err = data.err;
                        }
                    });
                } else {
                    $scope.err = "Please submit valid inputs";

                    // reset the fields
                    $scope.editForm.description = "";
                    $scope.editForm.startDate = "";
                    $scope.editForm.endDate = "";
                    $scope.editForm.frequency = 1; // min frequency
                    $scope.editForm.amount = 5; // min amount to bet
                }
                
            }
        }
    }


);