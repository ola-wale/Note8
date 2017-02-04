var app = angular.module('authenticate',["ngRoute"]);
app.config(function($routeProvider, $locationProvider) {
	$routeProvider
	.when("/", {
		Name:'login',
		templateUrl: "views/loginview.html",
	})
	.when("/login", {
		Name:'login',
		templateUrl: "views/loginview.html",
	})
	.when("/signup", {
		Name:'signup',
		templateUrl: "views/signupview.html",
	})
});

app.run(function($rootScope) {
    $rootScope.$on("$routeChangeSuccess", function(event, next) {
        var routeName = next.$$route.Name;
				angular.element('body').attr('current-route', routeName);
    });
});

app.controller('authController',function($scope){
		$('body').on('submit', 'form', function(event) {
	var formData = {};
	$('form input[name]').each(function(index){
		formData[$(this).attr('name')] = $(this).val();
	})
	$.ajax({
    type        : 'POST',
    url         : 'auth.php',
    data        : formData,
    success     : function(data) {
			$('body').append(data);
		}
	});
	event.preventDefault();
});
})