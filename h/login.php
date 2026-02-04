<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>ธนากร เข็มเวียง(ฟลุ๊ค)</title>
</head>

<body>
<h1>หน้าจอระบบหลังบ้าน - ฟลุ๊ค</h1>

<form method="post">
    Username 
    <input type="text" name="auser" required>
    <br>

    Password 
    <input type="password" name="apwd" required>
    <br>

    <button type="submit" name="Submit">LOGIN</button>
</form>

<?php
if (isset($_POST['Submit'])) {

    include_once("connectdb.php");

    $user = $_POST['auser'];
    $pass = $_POST['apwd'];

    $sql = "SELECT * FROM admin 
            WHERE a_user = '$user'
            AND a_password = '$pass'
            LIMIT 1";

    $rs = mysqli_query($conn, $sql);

    if (mysqli_num_rows($rs) == 1) {
        echo "<script>alert('เข้าสู่ระบบสำเร็จ');</script>";
        // header("location: home.php");
    } else {
        echo "<script>alert('Username หรือ Password ไม่ถูกต้อง');</script>";
    }
}
?>
</body>
</html>
