<?php

//require the html purifier library
require_once 'autoload/autoload.php';
//get doing param from the post array
$doing = $_POST['doing'];
//defining an array of allowedActions
$allowedActions = ['saveNote','getNotes','uploadingImage','get','changeNoteColor','getImages','trashNote','restoreNote','duplicateNote','getUser','viewNote','updateNote','saveSettings','deleteImages'];
//if doing is not in the $allowedActions array, Bail!
if(!in_array($doing,$allowedActions)){
	die();
}
call_user_func($doing);
/**
	saveNote
	Save note to database.
**/
function saveNote(){
	global $db;
	$purifier = new HTMLPurifier();
	/**
		array $allowedNoteColorsArray - An Array of allowed note colors
	**/
	$allowedNoteColorsArray = array('#fff93f','#ff3f3f','#3fff71','#a3ff3f','#ffffff');
	$contents = $_POST['contents'];
	$title = $db->escape($purifier->purify($_POST['title']));
	$owner = Note8::user()->id;
  $clean_html = $purifier->purify($contents);
	$clean_html = $db->escape($clean_html);
	if(isset($_POST['tags']) && $_POST['tags']){
		$tags = $_POST['tags'];
		$tags = implode("/tagsept/",$tags);
	} else {
		$tags = '';
	}
	$date = date('U');
	$color = $_POST['color'];
	if(!in_array($color,$allowedNoteColorsArray)){
		$color = '#ffffff';
	}
	$db->query("INSERT INTO notes (owner,content,date,tags,color,title) VALUES ('$owner','$clean_html','$date','$tags','$color','$title');");
}

function getNotes(){
	global $db;
	$uid = Note8::user()->id;
	$limit = 9999999; //an unlikely number
	$page = 1;
	$start_from = ($page-1) * $limit;
	$extras = '';
	$extras = "AND folder = '' OR folder IS NULL ";
	if(isset($_POST['tag'])){
		$tags = strip_tags($db->escape($_POST['tag']));
		$extras = "AND tags LIKE '%$tags%' AND (folder = '' OR folder IS NULL) ";
	}
	if(isset($_POST['color'])){
		$color = strip_tags($db->escape($_POST['color']));
		$extras = "AND color LIKE '%$color%' AND folder = '' OR folder IS NULL ";
	}
	if(isset($_POST['query'])){
		$query = strip_tags($db->escape($_POST['query']));
		$extras = "AND content LIKE '%$query%' AND folder = '' OR folder IS NULL ";
	}
	if(isset($_POST['trash'])){
		$extras = "AND folder = 'trash' ";
	}
	$notes = $db->get_results("SELECT * FROM notes WHERE owner = $uid $extras ORDER BY date DESC LIMIT $start_from, $limit");
	echo json_encode($notes, JSON_PRETTY_PRINT);
}

/**
	uploadingImage
	Save note to uploads/images and register it to the db.
**/

function uploadingImage(){
	global $db;
	//if the $_FILES array doesn't have the 'upload-image' parameter
	if(isset($_FILES['upload-image'])){
		//get the file name
		$name = strip_tags($_FILES['upload-image']['name']);
		//get the file extension
		$ext = pathinfo($name, PATHINFO_EXTENSION);
		//an array of allowed file formats.
		$allowedFileFormats = $arrayName = array('jpg','png','gif','jpeg','svg');
		//if the $allowedFileFormats array does not contain the file extension.
		if(!in_array($ext,$allowedFileFormats)){
			//show a notification with the message 'Please upload a valid Image file' and bail.
			echo Note8::js_script("notify('error','Please upload a valid Image file.')");
			die();
		}
		//if the file size is more than 5mb
		if ($_FILES["upload-image"]["size"] > 5000000) {
			//show a notification with the message 'Image size too large'.
			echo Note8::js_script("notify('error','Image size too large')");
			die();
		}
		$destFile = "uploads/images/" . uniqid('img',true) . '.' . $ext;
		move_uploaded_file( $_FILES['upload-image']['tmp_name'], $destFile );
		$imagelink = SITE_LINK . $destFile;
		$img = "<img src=$imagelink />";
		$uid = Note8::user()->id;
		$date = date('U');
		$db->query("INSERT INTO uploads (file,type,owner,date)  VALUES ('$destFile','note-image','$uid','$date')");
		echo Note8::js_script("notify('success','Image Uploaded')");
	} else {
		///show a notification with the message 'Please upload a valid Image file' and bail.
		echo Note8::js_script("notify('error','Please upload a valid Image file.')");
		die();
	}
}

function getImages(){
	global $db;
	$uid = Note8::user()->id;
	$images = $db->get_results("SELECT * FROM uploads WHERE owner = $uid AND type = 'note-image';");
	echo json_encode($images);
}

function get(){
	global $db;
	$uid = Note8::user()->id;
	$to_get = $db->escape(strip_tags($_POST['get']));
	switch($to_get){
		case 'tags':
			$tags = $db->get_col("SELECT tags FROM notes WHERE owner = $uid AND folder = '' OR folder IS NULL;");
			$tag_string = '';
			foreach ($tags as $tag) {
				if($tag != ''){
					$tag_string .= $tag;
				}
			}
			$tags = array_unique(explode("/tagsept/",$tag_string));
			print_r(json_encode($tags,JSON_PRETTY_PRINT));
			die();
	break;
	case 'colors':
		$colors = $db->get_col("SELECT DISTINCT color FROM notes WHERE owner = $uid AND color IS NOT NULL");
		print_r(json_encode(str_replace('#','',$colors),JSON_PRETTY_PRINT));
		die();
	break;
}
}

function changeNoteColor(){
	global $db;
	$allowedNoteColorsArray = array('#fff93f','#ff3f3f','#3fff71','#a3ff3f','#ffffff');
	$ids = $_POST['notes'];
	$color = $_POST['color'];
	//if $ids is not an array, bail!
	if(!is_array($ids)){
		die(0);
	}
	//if the color is not in the allowedNoteColorsArray, bail!
	if(!in_array($color,$allowedNoteColorsArray)){
		die(0);
	}
	$uid = Note8::user()->id;
	$color = $db->escape( strip_tags($color) );
	$result = 0;
	foreach($ids as $note) {
		$note = $db->escape(strip_tags($note));
		$result = $db->query("UPDATE notes SET color = '$color' WHERE owner = $uid AND id = $note;");
	}
	echo $result;
	die();
}

function trashNote(){
	global $db;
	$ids = $_POST['notes'];
	$deleteCompletely = $_POST['deleteCompletely'];
	$uid = Note8::user()->id;
	foreach($ids as $note) {
		$note = $db->escape(strip_tags($note));
		if($deleteCompletely == 'true'){
			$result = $db->query("DELETE from notes WHERE owner = $uid AND id = $note;");
		} else {
			$result = $db->query("UPDATE notes SET folder = 'trash' WHERE owner = $uid AND id = $note;");
		}
	}
	echo $result;
	die();
}

function restoreNote(){
	global $db;
	$ids = $_POST['notes'];
	$uid = Note8::user()->id;
	foreach($ids as $note) {
		$note = $db->escape(strip_tags($note));
		$result = $db->query("UPDATE notes SET folder = '' WHERE owner = $uid AND id = $note;");
	}
	echo $result;
	die();
}

function duplicateNote(){
	global $db;
	$ids = $_POST['notes'];
	$uid = $db->escape(strip_tags(Note8::user()->id));
	$date = date('U');
	$last_id = '';
	$counter = 1;
	foreach($ids as $k => $note) {
		$note = $db->escape(strip_tags($note));
		$result = $db->query("INSERT INTO notes (owner, content, group_id,folder,tags,color,date) SELECT owner, content, group_id,folder,tags,color,$date FROM notes WHERE id = '$note' AND owner = '$uid'");
		$last_id = json_encode($db->get_row("SELECT * FROM notes WHERE id = (SELECT MAX(id) FROM notes) AND owner = '$uid';"),JSON_FORCE_OBJECT);
		if($counter != count($ids)){
			$last_id .= ',';
		}
		$counter ++;
		echo $last_id;
	}

}

function getUser(){
	global $db;
	$uid = $db->escape(strip_tags(Note8::user()->id));
	echo json_encode($db->get_row("
		SELECT users.id,firstname,lastname,email,level,image,count(notes.owner) AS notecount  FROM users
		INNER JOIN notes ON (notes.owner = $uid AND (notes.folder IS NULL OR notes.folder = '' OR notes.folder = 'trash'))
		WHERE users.id=$uid
		GROUP BY users.id
 "));
}

function viewNote(){
	global $db;
	$noteId = $db->escape(strip_tags($_POST['id']));
	$uid = $db->escape(strip_tags(Note8::user()->id));
	echo $note = json_encode($db->get_row("SELECT * FROM notes WHERE id = '$noteId' AND owner = '$uid';"));
}

function updateNote(){
	global $db;
	$purifier = new HTMLPurifier();
	/**
		array $allowedNoteColorsArray - An Array of allowed note colors
	**/
	$allowedNoteColorsArray = array('#fff93f','#ff3f3f','#3fff71','#a3ff3f','#ffffff');
	$contents = $_POST['contents'];
	$id = $db->escape(strip_tags($_POST['id']));
	$title = $db->escape($purifier->purify($_POST['title']));
	$owner = Note8::user()->id;
	$clean_html = $purifier->purify($contents);
	$clean_html = $db->escape($clean_html);
	if(isset($_POST['tags']) && $_POST['tags']){
		$tags = $_POST['tags'];
		$tags = implode("/tagsept/",$tags);
	} else {
		$tags = '';
	}
	$date = date('U');
	$color = $_POST['color'];
	if(!in_array($color,$allowedNoteColorsArray)){
		$color = '#ffffff';
	}
	echo $res = $db->query("UPDATE notes SET content='$clean_html',date='$date',tags='$tags',color='$color',title='$title' WHERE id=$id AND owner = $owner;");
	die();
}

function saveSettings(){
	global $db;
	$user = $_POST['user'];
	$owner = Note8::user()->id;
	$file = $db->get_var("SELECT image FROM users WHERE id = $owner");
	if(isset($user['image']) && strpos($user['image'], 'data:image') !== false){
		 $file = base64_to_jpeg($user['image'], "uploads/images/profile-image-$owner.jpg");
	}
	//if the oldpassword index exists, then they want their password changed.
	if(isset($user['newpassword']) && $user['newpassword'] != ''){

		$oldpassword = $db->escape(strip_tags($user['oldpassword']));
		$correct_password_hash =  $db->get_var("SELECT password FROM users WHERE id = $owner");
		//if the old password they entered is right then proceed
		if(password_verify($oldpassword, $correct_password_hash)){
			echo 'password valid';
			if(($user['newpassword'] != '' && $user['oldpassword'] != '') && strlen($user['newpassword']) >= 6 && $user['newpassword'] == $user['confirmnewpassword']){
				//proceed
				$firstname = $db->escape(strip_tags($user['firstname']));
				$lastname = $db->escape(strip_tags($user['lastname']));
				$newpassword = password_hash( $user['newpassword'], PASSWORD_BCRYPT, array('cost'=>10) );
				$result = $db->query("UPDATE users SET firstname = '$firstname',lastname = '$lastname',password = '$newpassword' WHERE id = $owner;");
				if($result){
					echo Note8::js_script("notify('success','Settings Saved')");
					die();
				} else {
					echo Note8::js_script("notify('error','Error occurred')");
					die();
				}
			} else {
				echo Note8::js_script("notify('error','Error occurred')");
				die();
			}
		} else {
			//else produce an error on the front end.
			echo Note8::js_script("notify('error','Invalid Password')");
			die();
		}
	} else {
		$firstname = $db->escape(strip_tags($user['firstname']));
		$lastname = $db->escape(strip_tags($user['lastname']));
		$result = $db->query("UPDATE users SET firstname = '$firstname',lastname = '$lastname',image = '$file' WHERE id = $owner;");
		if($result){
			echo Note8::js_script("notify('success','Settings Saved')");
			die();
		} else {
			echo Note8::js_script("notify('error','Error occurred')");
			die();
		}
	}
}

function base64_to_jpeg($base64_string, $output_file) {
    $ifp = fopen($output_file, "wb");
    $data = explode(',', $base64_string);
    fwrite($ifp, base64_decode($data[1]));
    fclose($ifp);
    return $output_file;
}

function deleteImages(){
	global $db;
	$images = $_POST['images'];
	$owner = Note8::user()->id;
	$new_images = array();
	foreach ($images as $imageid) {
		$new_images[] = intval($imageid);
	}
	$images = implode(',',$new_images);
	$result = $db->query("DELETE FROM uploads WHERE id in ($images) AND owner = $owner AND type = 'note-image';");
	if($result){
		echo Note8::js_script("notify('success','Image(s) Deleted')");
	} else {
		echo Note8::js_script("notify('error','An error occurred')");
	}
	die();
}