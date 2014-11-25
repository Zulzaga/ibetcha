/****
* Controller for the Friends/Friend requests page.
*/
ibetcha.controller('FriendRequestPageController',
    function($scope, $http, $location, $cookieStore, $routeParams) {
        
        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');

        // Helper function for loading the page.
        var onPageLoad = function() { 
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
		                $scope.err = err;
		            });
                }).
	            error(function(data, status, headers, config) {
	                $scope.err = data.err;
	            });
        }

        // If no session, (no user), redirect back to the login page.
        if (!$cookieStore.get('session')) {
            $location.path('/');
        } else {
	        onPageLoad();
	    }

	    // When the Accept button is clicked, sends a request to the server to accept the
	    // corresponding friend request and reloads the page to reflect the update.
	    // Upon success, reloads the page and upon error, alerts the error with an appropriate message.
        $scope.accept = function(id){
        	$http({
                method: "POST",
                url: "friendRequests/" + id + "/accept",
                }).success(function(data, status, headers, config) {
                	console.log(data.content);
                	// var msg = "Successfully accepted the friend request!";
                    onPageLoad();
                }).
            error(function(data, status, headers, config) {
                $scope.err = data.err;
            });
        }

        // When the Reject button is clicked, sends a request to the server to reject the
	    // corresponding friend request and reloads the page to reflect the update.
	   	// Upon success, reloads the page and upon error, alerts the error with an appropriate message.
        $scope.reject = function(id){
        	$http({
                method: "POST",
                url: "friendRequests/" + id + "/reject",
                }).success(function(data, status, headers, config) {
                	console.log(data.content);
                	// var msg = "Successfully rejected the friend request!";
                    onPageLoad();
                }).
            error(function(data, status, headers, config) {
                $scope.err = data.err;
            });
        }
    }
);