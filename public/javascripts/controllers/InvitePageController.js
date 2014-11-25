/****
* Controller for the Invite page.
*/
ibetcha.controller('InvitePageController',
    function($scope, $http, $location, $cookieStore) {

        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');
        $scope.inviteForm = {};
        $scope.inviteForm.friendName = $cookieStore.get('user');
        $scope.inviteErr = "";
        $scope.inviteMsg = "";
        $scope.requestErr = "";
        $scope.requestMsg = "";

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
                	$scope.inviteMsg = "Invite was successful!";
                    $scope.inviteErr = "";
                }).
                error(function(data, status, headers, config) {
                    console.log(data.err);
                    $scope.inviteErr ="Invite was not successful";
                    $scope.inviteMsg = "";
                });
        }

        // Sends a friend request to the user with the given username.
        // Upon success, redirects to the Home page.
        // Upon error, alerts the error with an appropriate message.
        $scope.sendByUsername = function(){
            console.log($scope.requestForm);
            $http({
                method: "POST",
                url: "friendRequests/byUsername",
                data: { to: $scope.requestForm.friendUsername },
                }).success(function(data, status, headers, config) {
                    console.log(data.content);
                    $scope.requestMsg = "Successfully sent a friend request to " + $scope.requestForm.friendUsername + "!";
                    $scope.requestErr = "";
                }).
            error(function(data, status, headers, config) {
                $scope.requestMsg = "";
                $scope.requestErr = data.err;
            });
        }

        // Sends a friend request to the user with the given email.
        // Upon success, redirects to the Home page.
        // Upon error, alerts the error with an appropriate message.        
        $scope.sendByEmail = function(){
            $http({
                method: "POST",
                url: "friendRequests/byEmail",
                data: { to: $scope.requestForm.friendEmail },
                }).success(function(data, status, headers, config) {
                    console.log(data.content);
                    $scope.requestMsg = "Successfully sent the request!";
                    $scope.requestErr = "";
                }).
            error(function(data, status, headers, config) {
                $scope.requestErr = data.err;
                $scope.requestMsg = "";
            });
        }
    }
);
