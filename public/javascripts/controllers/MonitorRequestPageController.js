
ibetcha.controller('MonitorRequestPageController',
    function($scope, $http, $location, $cookieStore, $routeParams) {
        
        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');
        if (!$cookieStore.get('session')) {
            $location.path('/');
        } else {
            $http({
                method: "GET",
                url: "monitorRequests/",
                }).success(function(data, status, headers, config) {
                    $scope.requests = data.content;
                }).
            error(function(data, status, headers, config) {
                alert(data.err);
            });

            $scope.accept = function(id){
            	console.log(id);
	        	$http({
	                method: "POST",
	                url: "monitorRequests/" + id + "/accept",
	                }).success(function(data, status, headers, config) {
	                	console.log(data.content);
	                	alert("Successfully accepted the request!");
	                    $location.path('/home');
	                }).
	            error(function(data, status, headers, config) {
	                alert(data.err);
	            });
	        }

	        $scope.reject = function(id){
	        	console.log(id);
	        	$http({
	                method: "POST",
	                url: "monitorRequests/" + id + "/reject",
	                }).success(function(data, status, headers, config) {
	                	console.log(data.content);
	                	alert("Successfully rejected the request!");
	                    $location.path('/home');
	                }).
	            error(function(data, status, headers, config) {
	                alert(data.err);
	            });
	        }
        }

    }


);