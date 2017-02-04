<?php

class Note8{

	/*
 * get_user_by_mail
 *
 * get a user by email from the DB
 *
 * @param string  $email The email address to use.
 * return array the result from the DB
 */
	public static function get_user_by_mail($email){
		global $db;
		if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) { //validate email to be safe.
			die();
		}
		$result = $db->get_results("SELECT * FROM users WHERE email = '$email'");
		return $result;
	}

	/*
 * register_attempt
 *
 * register attempts at actions, for example registering sign up attempts,
 *
 * @param string  $type The type of attempt to register
 */
	public static function register_attempt($type){
		global $db;
		$ip = strip_tags( $_SERVER['REMOTE_ADDR'] );
		$date = date("Y-m-d");
		//we check if an attempt has been registered for this type and date.
		$result = $db->get_row("SELECT * FROM attempts WHERE date = '$date' AND type = '$type' AND ip = '$ip'");
		//if it has, increment it and update it to the db
		if($result){
			$count = $result->count;
			$count++;
			$db->query("
				UPDATE attempts
				SET count='$count'
				WHERE ip='$ip' AND date = '$date';"
			);
		} else {
			$db->get_results("INSERT attempts (count,ip,type,date) VALUES ('1','$ip','$type','$date');");
		}
	}

	/*
 * js_script
 *
 * adds js to a script
 *
 * @param string  $script String to add tags to..
 * return string <script>$script</script>
 */

	public static function js_script($script){
		return '<script>' . $script . '</script>';
	}

	/*
 * is_logged_in
 *
 * checks if a user is logged in
 *
 * return bool
 */

	public static function is_logged_in(){
		global $db;
		if (session_status() == PHP_SESSION_NONE) {
			session_start();
		}
		if(isset($_SESSION['email']) && isset($_SESSION['token'])){
			$email = strip_tags($_SESSION['email']);
			$token = strip_tags($_SESSION['token']);
			$date = date("Y-m-d");
			//get user browser
			$user_browser = $_SERVER['HTTP_USER_AGENT'];
			$correct_password_hash = $db->get_var("SELECT password FROM users WHERE email = '$email';");
			$new_token = hash('sha512', $email . $user_browser . $correct_password_hash);
			//if the session === the new session then the user is logged in.
			if (hash_equals($new_token, $token) ){
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	public static function user($redir = false){
		global $db;
		if (session_status() == PHP_SESSION_NONE) {
			session_start();
		}
		//if hashes from the db are the same - we're confirming this using hash_equals ins Note8::is_logged_in
		//get the user using the email from the session
		if(isset($_SESSION['token']) && Note8::is_logged_in()){
			$token = strip_tags($_SESSION['token']);
			$email = $db->escape( $_SESSION['email'] );
			return $db->get_row("SELECT * FROM users WHERE email = '$email';");
		} else {
			if($redir){
				header('Location: authenticate');
				die();
			}
			return false;
		}
	}

}