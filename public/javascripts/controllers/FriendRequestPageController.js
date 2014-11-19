
ibetcha.controller('FriendRequestPageController',
    function($scope, $http, $location, $cookieStore, $routeParams) {
        
        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');
        if (!$cookieStore.get('session')) {
            $location.path('/');
        } else {
            var init = function() { 
            	$http({
	                method: "GET",
	                url: "friendRequests/",
	                }).success(function(data, status, headers, config) {
	                	console.log(data.content);
	                	$scope.reqEmpty = (data.content.length == 0);
	                	console.log($scope.reqEmpty);
	                    $scope.requests = data.content;
	                    $http({
			                method: "GET",
			                url: "users/friends/" + $cookieStore.get('user')
			            }).success(function(data, status, headers, config) {
			                $scope.friends = data.content;
			            }).error(function(jqXHR, textStatus, err){
			                alert(err);
			            });
	                }).
	            error(function(data, status, headers, config) {
	                alert(data.err);
	            });
	        }

	        init();

            $scope.accept = function(id){
            	console.log(id);
	        	$http({
	                method: "POST",
	                url: "friendRequests/" + id + "/accept",
	                }).success(function(data, status, headers, config) {
	                	console.log(data.content);
	                	alert("Successfully accepted the friend request!");
	                    init();
	                }).
	            error(function(data, status, headers, config) {
	                alert(data.err);
	            });
	        }

	        $scope.reject = function(id){
	        	console.log(id);
	        	$http({
	                method: "POST",
	                url: "friendRequests/" + id + "/reject",
	                }).success(function(data, status, headers, config) {
	                	console.log(data.content);
	                	alert("Successfully rejected the friend request!");
	                    $location.path('/home');
	                }).
	            error(function(data, status, headers, config) {
	                alert(data.err);
	            });
	        }
        }

    }


);