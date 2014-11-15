ibetcha.controller('EditBetPageController',
    function($scope, $http, $location, $cookieStore) {

        
        $scope.$on("homeClicked", function(event, args) {
            $http({
                method: "GET",
                url: "roadmaps",
            }).success(function(data, status, headers, config) {
                $scope.roadmaps = data.content;
            }).
            error(function(data, status, headers, config) {
                alert(data.err);
            });
        });

    }


);