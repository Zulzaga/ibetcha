ibetcha.controller('EditBetPageController',
    function($scope, $http, $location, $cookieStore) {
        $http.defaults.headers.post["Content-Type"] = "application/json";

        if (!$cookieStore.get('session')) {
            $location.path('/');
        } else {
            $http({
                method:"GET",
                url: "users/friends/" + $cookieStore.get('user')
            }).success(function(data, status, headers, config) {
                $scope.friends = data.content;
            }).error(function(jqXHR, textStatus, err){
                alert(err);
            })

            $scope.submit = function(){
                console.log($scope.editForm);
                var monitorsArray = [];
                var monitors = $scope.editForm.monitors;
                for (i =0; i< monitors.length; i++) {
                    monitorsArray.push(monitors[i]._id);
                }
                $scope.editForm.monitors = monitorsArray;
                console.log($scope.editForm.startDate );
                $http({
                    method: "POST",
                    url: "bets",
                    data: $scope.editForm,
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