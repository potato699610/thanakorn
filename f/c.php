<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>ธนากร เข็มเวียง (ฟลุ๊ค)</title>
</head>

<body>
<h1>ธนากร เข็มเวียง (ฟลุ๊ค)</h1>

<form method="post" action="">
    กรอกคะแนน
    <input type="number" name="score" min="0" max="100" required>
    <button type="submit" name="submit">OK</button>
</form>
<hr>

<?php
if (isset($_POST['submit'])) {

    $score = $_POST['score'];

    if ($score >= 80) {
        $grade = "A";
    } else if ($score >= 70) {
        $grade = "B";
    } else if ($score >= 60) {
        $grade = "C";
    } else if ($score >= 50) {
        $grade = "D";
    } else {
        $grade = "F";
    }

    echo "คะแนน $score ได้เกรด $grade";
}
?>

</body>
</html>
