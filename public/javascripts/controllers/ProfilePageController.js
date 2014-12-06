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
                        $http({
                            method: "GET",
                            url: "friendRequests/receivers"
                        }). success(function(data,status, header, config){
                            $scope.receivers = data.content;
                            $scope.displayAddFriend = notSent()&&notMyFriend();
                        }).
                            error(function(data, status, headers, config){
                                $scope.err = data.err;
                            });

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
        	$location.path('/bets/' + id + '/' + type);
        } 
        var notMyFriend = function(){
            var userInfo = $scope.userInfo;
            var l = userInfo.friends.length;
            for (var i = 0; i< l; i++){
                if ($scope.currentUser===userInfo.friends[i].username){
                    return false;
                }
            }
            return true;
        }
        var notSent = function(){
        
            var userInfo = $scope.userInfo;
            var l = $scope.receivers.length;
            for (var i = 0; i< l; i++){

                if ($scope.receivers[i].to.username===userInfo.username){
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
                    $scope.requestMsg = "Successfully sent a friend request to " + username + "!";
                    $scope.requestErr = "";
                    onPageLoad();
                }).
            error(function(data, status, headers, config) {
                $scope.requestMsg = "";
                $scope.requestErr = data.err;
            });
        } 

    }

);