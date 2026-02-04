<?php
session_start();
?>
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>d.php</title>
</head>
<body>

<h1>d.php</h1>

<?php
echo $_SESSION['name'] . "<br>";
echo $_SESSION['p1'] . "<br>";
?>

</body>
</html>
