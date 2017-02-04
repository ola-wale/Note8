<?php
session_start();
require 'autoload/autoload.php';
$doing = $_POST['doing'];

if($doing === 'login'){
	login('','',true);
} else {
	signup();
}

function signup(){
	error_reporting(-1);
ini_set('display_errors', 'On');
	global $db;
	$required = array(
		'First Name' => 'firstname',
		'Last Name' => 'lastname',
		'Password' => 'password',
		'Confirm Password' => 'confirmPassword',
		'Email Address' => 'email'
	);
	foreach ($required as $x => $req) {
		$val = $_POST[ $req ];
		if(!$val){
			die( "$x is required" );
		}
		if($req === 'email'){
			if(Note8::get_user_by_mail($_POST['email'])){
				echo Note8::js_script("notify('error','Email already in use')");
				die();
			}
		}
		//security checks and validations
		if($req == 'password'){
			if(strlen($_POST[$req]) < 6){
				echo Note8::js_script("notify('error','Passwords must be six characters or more')");
				die();
			}
			if($_POST[$req] !== $_POST['confirmPassword']){
				echo Note8::js_script("notify('error','Passwords do not match')");
				die();
			}
		}
	}
	$firstname = strip_tags( $_POST['firstname'] ); //strip html from the first name
	$lastname = strip_tags( $_POST['lastname'] ); //strip html from the last name
	$initial_password = $_POST['password'];
	$password = password_hash( $_POST['password'], PASSWORD_BCRYPT, array('cost'=>10) ); //encrypt the password, we'll manage a cost value of 10, sane enough anything higher would increase comparison duration :)
	$email = strip_tags( $_POST['email'] ); //get the email from the form
	$db->query("INSERT INTO users (firstname,lastname,email,password,level,session) VALUES ('$firstname','$lastname','$email','$password','user','0')"); //finally, insert into db.
	Note8::register_attempt('signup');
	//log them in :)
	login($email,$initial_password,false);
}

function login($email = '',$password = '',$ajax = true){
	global $db;
	$date = date("Y-m-d");
	$user_browser = $_SERVER['HTTP_USER_AGENT'];
	if($ajax){
		$password = strip_tags( $_POST['password'] );
  	$email = strip_tags( $_POST['email'] );
	}
	$correct_password_hash = $db->get_var("SELECT password FROM users WHERE email = '$email';");
	if (password_verify($password, $correct_password_hash)) {
		echo Note8::js_script("notify('success','Logged In')");
		$_SESSION['email'] = $email;
		$_SESSION['token'] = hash('sha512', $email . $user_browser . $correct_password_hash);
		$token = strip_tags($_SESSION['token']);
		$db->query("UPDATE users
		SET session='$token'
		WHERE email='$email' AND password = '$correct_password_hash';");
		echo Note8::js_script("document.location = 'notes'");
	} else {
		echo Note8::js_script("notify('error','Invalid Password')");
		die();
	}
}
