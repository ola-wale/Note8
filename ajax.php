<?php
require_once 'autoload/autoload.php';
require_once 'Note8.php';
$function_to_call = $_POST['do'];
echo $function_to_call;
call_user_func( "Note8::$function_to_call" ); 