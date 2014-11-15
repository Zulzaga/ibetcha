

ibetcha.controller('HomePageController',
    function($scope, $http, $location, $cookieStore) {
        

        $http.defaults.headers.post["Content-Type"] = "application/json";
        $scope.loggedIn = $cookieStore.get('session');


        $scope.$on("homeClicked", function (event, args) {
        	console.log("HHHH has been clicked")
        	$location.path("/");
		    // $http({
	     //        method: "GET",
	     //        url: "roadmaps",
	     //        }).success(function(data, status, headers, config) {
	     //            $scope.roadmaps = data.content;
	     //        }).
	     //        error(function(data, status, headers, config) {
	     //            // alert(data.err);
	     //        });
		});

    }


);