<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>ธนากร เข็มเวียง (ฟลุ๊ค)</title>
</head>

<body>
<h1>ธนากร เข็มเวียง(ฟลุ๊ค)</h1>

<form method="post"action="">
 กรอกตัวเลข <input type="number"name="a"autofocus required>
 <button type="sumbit" name="Sumbit">OK</button>
<hr>

<?php
if (isset($_POST["Sumbit"])) {
	$gender=$_POST['a'];
	if($gender==1){
	echo "เพศชาย";
	}else if ($gender==2){
		echo "เพศหญิง";
	}else if ($gender==3){
		echo"เพศทางเลือก";
	}
}
?>

</body>
</html>