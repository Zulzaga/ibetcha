/****
* Controller for the Navbar.
* Controls all the buttons on the bar.
*/
ibetcha.controller('InvitePageController',
    function($scope, $http, $location, $cookieStore) {
        $http.defaults.headers.post["Content-Type"] = "application/json";

        $scope.loggedIn = $cookieStore.get('session');
        $scope.inviteForm = {};
        $scope.inviteForm.friendName = $cookieStore.get('user');
        console.log("inviteform looks liek this: " + $scope.inviteForm.friendName);
        

        // Determines if somebody is logged in.
        $scope.checkSession = function() {
            return $cookieStore.get('session');
        };

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
