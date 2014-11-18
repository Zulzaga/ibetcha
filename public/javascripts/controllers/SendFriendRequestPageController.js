ibetcha.controller('SendFriendRequestPageController',
    function($scope, $http, $location, $cookieStore) {
        $http.defaults.headers.post["Content-Type"] = "application/json";

        if (!$cookieStore.get('session')) {
            $location.path('/');
        } else {
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
    }
);