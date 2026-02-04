<?php
session_start();

// ตั้งค่า session ก่อน
$_SESSION['name'] = "ธนากร";
$_SESSION['p1']   = "สินค้า";
?>
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>ธนากร เข็มเวียง(ฟลุ๊ค)</title>
</head>

<body>

<h1>a.php</h1>

<?php
echo $_SESSION['name'] . " ธนากร เข็มเวียง<br>";
echo $_SESSION['name'] . " ฟลุ๊ค<br>";
echo $_SESSION['p1']   . " โซฟา<br>";
echo $_SESSION['name'] . " ห่วงยาง<br>";
?>


</body>
</html>
