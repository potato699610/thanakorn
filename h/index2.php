<?php
session_start();

if (!isset($_SESSION['aname'])) {
    header("location: login.php");
    exit;
}
?>
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>หน้าหลักแอดมิน - ฟลุ๊ค</title>
</head>

<body>

<h1>หน้าหลักแอดมิน - ฟลุ๊ค</h1>

<?php
echo "แอดมิน : " . $_SESSION['aname'] . "<br>";
?>

<ul>
    <li><a href="products.php">จัดการสินค้า</a></li>
    <li><a href="orders.php">จัดการออเดอร์</a></li>
    <li><a href="customers.php">จัดการลูกค้า</a></li>
</ul>

<a href="logout.php">ออกจากระบบ</a>

</body>
</html>
