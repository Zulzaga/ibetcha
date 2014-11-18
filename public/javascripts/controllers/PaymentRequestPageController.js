ibetcha.controller('PaymentRequestPageController',
    function($scope, $http, $location, $cookieStore) {
        $http.defaults.headers.post["Content-Type"] = "application/json";

        var init = function() {
            $http({
                method: "GET",
                url: "users/payments",
                }).success(function(data, status, headers, config) {
                    console.log("payment data received", data.content);
                    $scope.payments = data.content;        
                }).error(function(data, status, headers, config) {
                    console.log("epic failed");
                    alert(data.err);
                });
            
        }

        if (!$cookieStore.get('session')) {
            $location.path('/');
        } else {
            init();
        }
    }
);