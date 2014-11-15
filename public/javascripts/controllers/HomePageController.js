

ibetcha.controller('HomePageController',
    function($scope, $http, $location, $cookieStore) {
        
        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');


        if (!$cookieStore.get('session')) {
            $location.path('/');
        } else {
        	$http({
	            method: "GET",
	            url: "users/current"
	            }).success(function(data, status, headers, config) {
	                $scope.userInfo = data.content;
	            }).
	        error(function(data, status, headers, config) {
	            alert(data.err);
	        });
        }

    }


);