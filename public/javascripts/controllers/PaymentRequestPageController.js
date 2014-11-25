/****
* Controller for the Payment requests page.
*/
ibetcha.controller('PaymentRequestPageController',
    function($scope, $http, $location, $cookieStore) {
        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');

        // Helper function that helps load the page.
        var onPageLoad = function() {
            $http({
                method: "GET",
                url: "users/payments",
                }).success(function(data, status, headers, config) {
                    console.log("payment data received", data.content);
                    $scope.tos = data.content.tos;
                    $scope.froms = data.content.froms;   
                    $scope.noRequested = true;
                    for(var i = 0; i < $scope.tos.length; i++) {
                        if($scope.tos[i].requested) {
                            $scope.noRequested = false;
                        }
                    }
                    console.log($scope.tos, $scope.froms, $scope.noRequested);
                }).error(function(data, status, headers, config) {
                    console.log("epic failed");
                    $scope.err = data.err;
                });
        }

        // If no session, (no user), redirect back to the login page.
        if (!$cookieStore.get('session')) {
            $location.path('/');
        } else {
            onPageLoad();
        }

        $scope.paid = function(paymentId) {
            console.log(paymentId);
            $http({
                method: "GET",
                url: "paymentRequests/paid/" + paymentId + "/claim"
            }).success(function(data, status, headers, config) {
                alert("Once your friend confirms that you have paid, \n this payment will be erased from records");
                onPageLoad();
            }).error(function(data, status, headers, config) {
                $scope.err = data.err;
                onPageLoad();
            });
        }

        $scope.received = function(paymentId) {
            console.log(paymentId);
            $http({
                method: "GET",
                url: "paymentRequests/received/" + paymentId// + "/received"
            }).success(function(data, status, headers, config) {
                alert("You have received this payment.\n This payment will be erased from records");
                onPageLoad();
            }).error(function(data, status, headers, config) {
                $scope.err = data.err;
                onPageLoad();
            });
        }
    }
);