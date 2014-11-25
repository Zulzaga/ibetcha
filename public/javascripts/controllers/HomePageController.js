/****
* Controller for the Home page.
*/
ibetcha.controller('HomePageController',
    function($scope, $http, $location, $cookieStore, $rootScope) {
        
        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');

        // Helper function for loading the page.
        var onPageLoad = function() {

        	// get current user infos from the server.
        	$http({
	            method: "GET",
	            url: "users/current"
	            }).success(function(data, status, headers, config) {
	                $scope.userInfo = data.content.user;
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

        // When the Detail is clicked, redirects to the bet detail page.
        $scope.detail = function(id, type){
        	console.log("showing detail!", type);	        	
        	$location.path('/bets/' + id + '/' + type);
        }

        // When the Monitor Requests is clicked, redirects to the Monitor Requests page.
        $scope.monitorRequests = function(){
        	console.log("get Mon requests");
        	$location.path('/monitorRequests');
        }

        // When the Friend Requests is clicked, redirects to the Friend Requests page.
        $scope.friendRequests = function(){
        	console.log("get Friend requests");
        	$location.path('/friendRequests');
        }

        // When the Payment Requests is clicked, redirects to the Payment Requests page.
        $scope.paymentRequests = function() {
        	console.log("get payment requests");
        	$location.path('/paymentRequests');
        }        
    }
);