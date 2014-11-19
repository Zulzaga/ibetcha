/****
* Controller for the Invite page.
*/
ibetcha.controller('InvitePageController',
    function($scope, $http, $location, $cookieStore) {

        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');
        $scope.inviteForm = {};
        $scope.inviteForm.friendName = $cookieStore.get('user');

        // If no session, (no user), redirect back to the login page.
        if (!$cookieStore.get('session')) {
            $location.path('/');
        } 

        // When the invite button is clicked, sends a request to the server to send an email invite
        // to the given email.
        // Upon success, redirects back to the Home page and 
        // upon error, alerts the error with an appropriate message.
        $scope.invite = function() {
        	console.log("inside invite");
        	console.log("inviteform looks likk this: " + $scope.inviteForm.friendName);
        	console.log("inviteform looks likk this: " + $scope.inviteForm.friendEmail);
        	console.log($scope.inviteForm);
        	// $scope.inviteForm = 
       		// $scope.inviteForm.friendName = $cookieStore.get('user');
        	$http({
                method: "POST",
                url: "users/emailinvite",
                data: $scope.inviteForm
                }).success(function(data, status, headers, config) {
                	$location.path('/home');
                	alert("invite was successful");
                }).
                error(function(data, status, headers, config) {
                    console.log(data.err);
                    alert("Invite was not successful");
                });
        }

    }
);
