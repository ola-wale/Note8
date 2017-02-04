<?php
error_reporting(-1);
ini_set('display_errors', 'On');
include_once 'config/config.php';
include_once 'ez_sql_core.php';
include_once 'ez_sql_mysqli.php';
include_once 'Note8.php';
require_once 'purifier/HTMLPurifier.standalone.php';
$conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD);

//if there's an error connecting bail and display the error
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SHOW DATABASES LIKE " . "'" . DB_NAME . "';";
$result = $conn->query($sql);

//check if the db exists if it does proceed if it doesnt setup db
if($result->num_rows > 0){
	//the database exists
} else {
	setup_db();
}

function setup_db(){
	global $conn;
	$sql = "CREATE DATABASE " . DB_NAME;
	$result = $conn->query($sql);
	//after creating the db, setup a new connection with the DB in focus.
	$conn_ = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD,DB_NAME);
	$setup_query = array("
	CREATE TABLE users (
		id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
		firstname VARCHAR(30) NOT NULL,
		lastname VARCHAR(30) NOT NULL,
		email VARCHAR(50) NOT NULL,
		password CHAR(128) NOT NULL,
		session CHAR(128) NOT NULL,
		level TINYTEXT NOT NULL,
		image TEXT
	)",
	"CREATE TABLE attempts (
		count INT(6),
		ip VARCHAR(30),
		type VARCHAR(30) NOT NULL,
		date VARCHAR(30) NOT NULL
	)",
	"CREATE TABLE notes (
		id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
		owner INT(6),
		content LONGTEXT,
		date VARCHAR(30) NOT NULL,
		group_id int(6),
		tags TEXT,
		folder TEXT,
		color TEXT,
		title TEXT
	)",
	"CREATE TABLE uploads (
		id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
		file TEXT,
		type TEXT,
		owner INT,
		date VARCHAR(30) NOT NULL
	)"
);
	foreach ($setup_query as $q) {
		$result = $conn_->query($q);
	}
}
$db = new ezSQL_mysqli(DB_USERNAME,DB_PASSWORD,DB_NAME,DB_HOST);