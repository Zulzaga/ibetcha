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
                    console.log($scope.tos, $scope.froms);
                }).error(function(data, status, headers, config) {
                    console.log("epic failed");
                    alert(data.err);
                });
        }

        // If no session, (no user), redirect back to the login page.
        if (!$cookieStore.get('session')) {
            $location.path('/');
        } else {
            onPageLoad();
        }
    }
);