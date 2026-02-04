<?php
session_start();


session_unset();
session_destroy();


echo "<script>
        alert('ออกจากระบบเรียบร้อย');
        window.location='login.php';
      </script>";
exit;
?>
