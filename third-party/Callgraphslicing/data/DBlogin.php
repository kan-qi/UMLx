<?php

$host="mysql.freehostingnoads.net"; // Host name 
$username="u908448223_hw2"; // Mysql username 
$password="hw2hw2"; // Mysql password 
$db_name="u908448223_hw2"; // Database name 


// Connect to server and select databse.
mysql_connect("$host", "$username", "$password")or die("cannot connect"); 
mysql_select_db("$db_name")or die("cannot select DB");
?>