<?php
session_start();
?>

<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>ธนากร เข็มเวียง (ฟลุ๊ค)</title>
</head>

<body>

<h1>e.php</h1>
<?php
echo @$_SESSION['aname'] . "<br>";
echo @$_SESSION['nickname'] . "<br>";
echo @$_SESSION['p1'] . "<br>";
echo @$_SESSION['p2'] . "<br>";
?>
</h1>

</body>
</html>


