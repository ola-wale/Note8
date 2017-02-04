<?php
require 'autoload/autoload.php';

if(Note8::is_logged_in()){
	header('Location: notes');
} else {
	header('Location:authenticate');
}