ibetcha.controller('EditBetPageController',
    function($scope, $http, $location, $cookieStore) {
        $http.defaults.headers.post["Content-Type"] = "application/json";

        if (!$cookieStore.get('session')) {
            $location.path('/');
        } else {
            $scope.editForm = {};
            $scope.editForm.friends = [];
            $http({
                method:"GET",
                url: "users/friends/" + $cookieStore.get('user')
            }).success(function(data, status, headers, config) {
                $scope.friends = data.content;
                console.log("retrieved friends", $scope.editForm.friends);
            }).error(function(jqXHR, textStatus, err){
                alert(err);
            })

            $scope.submit = function(){
                console.log($scope.editForm.monitors);
                // $http({
                //     method: "POST",
                //     url: "bets",
                //     data: { to: $scope.requestForm.friendEmail },
                //     }).success(function(data, status, headers, config) {
                //         console.log(data.content);
                //         alert("Successfully sent the request!");
                //         $location.path('/home');
                //     }).
                // error(function(data, status, headers, config) {
                //     alert(data.err);
                // });
            }
        }

    }


);