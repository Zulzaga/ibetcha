/****
* Controller for the Home page.
*/
ibetcha.controller('ProfilePageController',
    function($scope, $http, $location, $cookieStore, $rootScope, $routeParams) {
        
        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');
        $scope.currentUser = $cookieStore.get('user');

        

        // Helper function for loading the page.
        var onPageLoad = function() {
            if ($routeParams.username == $scope.currentUser) {
                $location.path('/home');
            } else {
                // get current user infos from the server.
                $http({
                    method: "GET",
                    url: "users/" + $routeParams.username,
                    }).success(function(data, status, headers, config) {
                        $scope.userInfo = data.content;
                    }).
                error(function(data, status, headers, config) {
                    $scope.err = data.err;
                });
            }

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
        $scope.notMyFriend = function(userInfo){
            var l = userInfo.friends.length;
            for (var i = 0; i< l; i++){
                if ($scope.currentUser===userInfo.friends[i].username){
                    return false;
                }
            }
            return true;
        }
        $scope.sendRequest = function(username){
            $http({
                method: "POST",
                url: "friendRequests/byUsername",
                data: { to: username },
                }).success(function(data, status, headers, config) {
                    console.log(data.content);
                    $scope.requestMsg = "Successfully sent a friend request to " + username + "!";
                    $scope.requestErr = "";
                }).
            error(function(data, status, headers, config) {
                $scope.requestMsg = "";
                $scope.requestErr = data.err;
            });
        } 

    }

);