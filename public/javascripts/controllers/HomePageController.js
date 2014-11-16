

ibetcha.controller('HomePageController',
    function($scope, $http, $location, $cookieStore, $rootScope) {
        
        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');


        // $location.path('/');
        
        if (!$cookieStore.get('session')) {
            $location.path('/');
        } else {
        	$http({
	            method: "GET",
	            url: "users/current"
	            }).success(function(data, status, headers, config) {
	                $scope.userInfo = data.content.user;
	            }).
	        error(function(data, status, headers, config) {
	            alert(data.err);
	        });

	        $scope.detail = function(id, type){
	        	console.log("showing detail!", type);	        	
	        	$location.path('/bets/' + id + '/' + type);
	        }

	        $scope.monitorRequests = function(){
	        	console.log("get Mon requests");
	        	$location.path('/monitorRequests');
	        }
        }

    }


);