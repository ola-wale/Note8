<?php
	require 'autoload/autoload.php';
	if(Note8::is_logged_in()){
		header('Location: notes');
	}
?>
<!DOCTYPE html>
<html>
	<head>
		<link rel="stylesheet" href="css/grid12.css" />
		<script src="js/jQuery.min.js"></script>
		<script src="js/angular.js"></script>
		<script src="js/angular-route.min.js"></script>
		<script src="js/angular-animate.min.js"></script>
		<script src="js/auth.js"></script>
		<script src="js/notify.js"></script>
		<link rel="stylesheet" href="css/animate.min.css">
		<link rel="stylesheet" href="css/auth.css" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Sign In/Up | Note8</title>
	</head>
	<body data-ng-app="authenticate">
		<div data-ng-controller="authController" class="authenticationBox">
			<div class="box">
				<div class="top-stuff">
					<a href="#login">Log In</a>
					<a href="#signup">Sign Up</a>
				</div>
				<div data-ng-view></div>
			</div>
		</div>
	</body>
</html>