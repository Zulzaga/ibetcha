

ibetcha.controller('HomePageController',
    function($scope, $http, $location, $cookieStore) {
        

        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');

        $scope.favorite = function(id) {
        	$http({
	            method: "POST",
	            url: "roadmaps/" + id + "/favorite",
	            }).success(function(data, status, headers, config) {
	                var roadmap = findRoadmap(id);
	                roadmap.isFavorite = true;
	            }).
	            error(function(data, status, headers, config) {
	                // alert(data.err);
	            });
        }

    }


);