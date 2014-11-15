ibetcha.controller('ProfileController',
    function($scope, $http, $location, $cookieStore) {
        

        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');

         $http({
            method: "GET",
            url: "bets/"
            }).success(function(data, status, headers, config) {
                $scope.bets = data.content;
           
                //data.content = the entire user object
                //check if it has roadmap field, if it does, save the objectid as a cookie
            }).
            error(function(data, status, headers, config) {
                alert(data.err);
            });

    }


);