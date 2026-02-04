<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "4048db";

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    die("เชื่อมต่อฐานข้อมูลไม่สำเร็จ");
}

mysqli_set_charset($conn, "utf8");
?>
