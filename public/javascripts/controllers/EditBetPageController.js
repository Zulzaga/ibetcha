ibetcha.controller('EditBetPageController',
    function($scope, $http, $location, $cookieStore) {
        $scope.editForm = {};
        $scope.editForm.friends = [];
        $http({
            method:"GET",
            url: "users/friends/" + $cookieStore.get('user')
        }).success(function(data, status, headers, config) {
            $scope.editForm.friends = data.content;
            console.log("retrieved friends", $scope.editForm.friends);
        }).error(function(jqXHR, textStatus, err){
            alert(err);
        })

        
        // $scope.$on("homeClicked", function(event, args) {
        //     $http({
        //         method: "GET",
        //         url: "roadmaps",
        //     }).success(function(data, status, headers, config) {
        //         $scope.roadmaps = data.content;
        //     }).
        //     error(function(data, status, headers, config) {
        //         alert(data.err);
        //     });
        // });

    }


);