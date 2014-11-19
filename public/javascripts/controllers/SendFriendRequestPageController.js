/****
* Controller for the Sending a friend request page.
*/
ibetcha.controller('SendFriendRequestPageController',
    function($scope, $http, $location, $cookieStore) {
        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');

        // If no session, (no user), redirect back to the login page.
        if (!$cookieStore.get('session')) {
            $location.path('/');
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
                    alert("Successfully sent a friend request to " + $scope.requestForm.friendUsername + "!");
                    $location.path('/home');
                }).
            error(function(data, status, headers, config) {
                alert(data.err);
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
                    alert("Successfully sent the request!");
                    $location.path('/home');
                }).
            error(function(data, status, headers, config) {
                alert(data.err);
            });
        }
    }
);