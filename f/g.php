<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>ธนากร เข็มเวียง (ฟลุ๊ค)</title>
</head>

<body>
<h1>ธนากร เข็มเวียง (ฟลุ๊ค)</h1>

<form method="post" action="">
    กรอกตัวเลข
    <input type="number" name="score" min="2" max="12" required>
    <button type="submit" name="submit">OK</button>
</form>

<hr>

<?php
if (isset($_POST['submit'])) {

    $m = $_POST['score'];

    
    if ($m < 2 || $m > 12) {
        echo "กรุณากรอกตัวเลขระหว่าง 2 ถึง 12";
    } else {
        for ($i = 1; $i <= 12; $i++) {
            echo "{$m} x {$i} = " . ($m * $i) . "<br>";
        }
    }
}
?>

</body>
</html>
