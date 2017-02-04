<?php
require 'autoload/autoload.php';
session_start();
session_destroy();
$out = SITE_LINK . 'authenticate';
header("Location:$out");
?>