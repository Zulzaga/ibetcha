/****
* Controller for the Monitor Requests page.
*/
ibetcha.controller('MonitorRequestPageController',
    function($scope, $http, $location, $cookieStore, $routeParams) {
        
        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');

        // Helper function that helps load the page.
        var onPageLoad = function() {
        	$http({
                method: "GET",
                url: "monitorRequests/",
                }).success(function(data, status, headers, config) {
                    $scope.requests = data.content;
                }).error(function(data, status, headers, config) {
                	alert(data.err);
            	});
        }

        // If no session, (no user), redirect back to the login page.
        if (!$cookieStore.get('session')) {
            $location.path('/');
        } else {
        	onPageLoad();
        }

	    // When the Accept button is clicked, sends a request to the server to accept the
	    // corresponding monitor request and reloads the page to reflect the update.
        // Upon success, redirects back to the Home Page.
        // Upon error, alerts the error with an appropriate message.
        $scope.accept = function(id){
        	console.log(id);
        	$http({
                method: "POST",
                url: "monitorRequests/" + id + "/accept",
                }).success(function(data, status, headers, config) {
                	alert("Successfully accepted the request!");
                    $location.path('/home');
                }).
            error(function(data, status, headers, config) {
                alert(data.err);
            });
        }

        // When the Reject button is clicked, sends a request to the server to reject the
	    // corresponding monitor request and reloads the page to reflect the update.
        // Upon success reloads the page.
        // Upon error, alerts the error with an appropriate message.	    
        $scope.reject = function(id){
        	console.log(id);
        	$http({
                method: "POST",
                url: "monitorRequests/" + id + "/reject",
                }).success(function(data, status, headers, config) {
                	alert("Successfully rejected the request!");
                    onPageLoad();
                }).
            error(function(data, status, headers, config) {
                alert(data.err);
            });
        }
    }
);