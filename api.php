<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

$host = 'localhost';
$db   = 'baanhao';
$user = 'root';
$pass = '';

try {
  $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  date_default_timezone_set('Asia/Bangkok');
  $pdo->exec("SET time_zone = '+07:00'");
} catch (Exception $e) {
  echo json_encode(['ok' => false, 'msg' => 'DB connection failed: ' . $e->getMessage()]);
  exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

// --- helper: ตรวจสอบว่า login อยู่ ---
function requireLogin() {
  global $data;
  if (!empty($_SESSION['user_id'])) return;
  if (!empty($data['_userId'])) {
    $_SESSION['user_id']   = $data['_userId'];
    $_SESSION['user_role'] = $data['_userRole'] ?? 'user';
    return;
  }
  if (!empty($_POST['_userId'])) {
    $_SESSION['user_id']   = $_POST['_userId'];
    $_SESSION['user_role'] = $_POST['_userRole'] ?? 'user';
    return;
  }
  echo json_encode(['ok' => false, 'msg' => 'กรุณาเข้าสู่ระบบก่อน']);
  exit;
}

// --- helper: ตรวจสอบว่าเป็น admin ---
function requireAdmin() {
  global $data;
  if (!empty($_SESSION['user_id']) && ($_SESSION['user_role'] ?? '') === 'admin') return;
  if (!empty($data['_userId']) && ($data['_userRole'] ?? '') === 'admin') {
    $_SESSION['user_id']   = $data['_userId'];
    $_SESSION['user_role'] = 'admin';
    return;
  }
  if (!empty($_POST['_userId']) && ($_POST['_userRole'] ?? '') === 'admin') {
    $_SESSION['user_id']   = $_POST['_userId'];
    $_SESSION['user_role'] = 'admin';
    return;
  }
  echo json_encode(['ok' => false, 'msg' => 'ไม่มีสิทธิ์เข้าถึง']);
  exit;
}

// --- auto-create admin ถ้ายังไม่มีใน DB ---
$chk = $pdo->prepare("SELECT id FROM users WHERE email='admin@shop.com'");
$chk->execute();
if (!$chk->fetch()) {
  $pdo->prepare("INSERT INTO users (name,email,pass,phone,role,joined) VALUES (?,?,?,?,'admin',CURDATE())")
    ->execute(['Admin', 'admin@shop.com', password_hash('admin123', PASSWORD_DEFAULT), '']);
}

// --- อัปโหลดรูปภาพสินค้า (admin) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file']) && (($_POST['action'] ?? '') === 'upload_image')) {
  // ตรวจสิทธิ์
  if (empty($_SESSION['user_id']) || ($_SESSION['user_role'] ?? '') !== 'admin') {
    echo json_encode(['ok' => false, 'msg' => 'ไม่มีสิทธิ์']); exit;
  }
  $file = $_FILES['file'];
  $allowed = ['image/jpeg','image/png','image/gif','image/webp'];
  if (!in_array($file['type'], $allowed)) {
    echo json_encode(['ok' => false, 'msg' => 'ไฟล์ต้องเป็นรูปภาพเท่านั้น']); exit;
  }
  if ($file['size'] > 5 * 1024 * 1024) {
    echo json_encode(['ok' => false, 'msg' => 'ไฟล์ใหญ่เกิน 5MB']); exit;
  }
  $uploadDir = __DIR__ . '/uploads/';
  if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
  $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
  $filename = uniqid('img_') . '.' . strtolower($ext);
  $dest = $uploadDir . $filename;
  if (move_uploaded_file($file['tmp_name'], $dest)) {
    $url = 'uploads/' . $filename;
    echo json_encode(['ok' => true, 'url' => $url]);
  } else {
    echo json_encode(['ok' => false, 'msg' => 'บันทึกไฟล์ไม่สำเร็จ']);
  }
  exit;
}

// --- ดึงสินค้าทั้งหมด ---
if ($action === 'get_products') {
  $stmt = $pdo->query("SELECT * FROM products ORDER BY id ASC");
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  foreach ($rows as &$row) {
    $row['price']     = (float)$row['price'];
    $row['old_price'] = $row['old_price'] ? (float)$row['old_price'] : null;
    $row['stock']     = (int)$row['stock'];
    $row['sale']      = (bool)$row['sale'];
    $row['imgs']      = $row['img'] ? [$row['img']] : [];
    $row['oldPrice']  = $row['old_price']; // compat กับ frontend
    $row['desc']      = $row['description'];
  }
  echo json_encode(['ok' => true, 'products' => $rows]);
}

// --- เพิ่มสินค้า (admin) ---
elseif ($action === 'add_product') {
  requireAdmin();
  $stmt = $pdo->prepare("INSERT INTO products (name,cat,price,old_price,stock,description,emoji,sale,img) VALUES (?,?,?,?,?,?,?,?,?)");
  $stmt->execute([
    $data['name'], $data['cat'], $data['price'],
    $data['oldPrice'] ?: null, $data['stock'] ?? 99,
    $data['desc'], $data['emoji'] ?? '📦',
    $data['sale'] ? 1 : 0, $data['img'] ?? ''
  ]);
  echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
}

// --- แก้ไขสินค้า (admin) ---
elseif ($action === 'edit_product') {
  requireAdmin();
  $stmt = $pdo->prepare("UPDATE products SET name=?,cat=?,price=?,old_price=?,stock=?,description=?,emoji=?,sale=?,img=? WHERE id=?");
  $stmt->execute([
    $data['name'], $data['cat'], $data['price'],
    $data['oldPrice'] ?: null, $data['stock'] ?? 99,
    $data['desc'], $data['emoji'] ?? '📦',
    $data['sale'] ? 1 : 0, $data['img'] ?? '',
    $data['id']
  ]);
  echo json_encode(['ok' => true]);
}

// --- ลบสินค้า (admin) ---
elseif ($action === 'delete_product') {
  requireAdmin();
  $pdo->prepare("DELETE FROM products WHERE id=?")->execute([$data['id']]);
  echo json_encode(['ok' => true]);
}

// --- ลดสต็อกเมื่อสั่งซื้อ ---
elseif ($action === 'reduce_stock') {
  requireLogin();
  foreach ($data['items'] as $item) {
    $pdo->prepare("UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id=?")
      ->execute([$item['qty'], $item['id']]);
  }
  echo json_encode(['ok' => true]);
}

// --- สมัครสมาชิก ---
elseif ($action === 'register') {
  if (empty($data['name']) || empty($data['email']) || empty($data['pass'])) {
    echo json_encode(['ok' => false, 'msg' => 'กรุณากรอกข้อมูลให้ครบ']); exit;
  }
  $check = $pdo->prepare("SELECT id FROM users WHERE email=?");
  $check->execute([$data['email']]);
  if ($check->fetch()) {
    echo json_encode(['ok' => false, 'msg' => 'อีเมลนี้มีอยู่แล้ว']); exit;
  }
  $stmt = $pdo->prepare("INSERT INTO users (name,email,pass,phone,role,joined) VALUES (?,?,?,?,'user',CURDATE())");
  $stmt->execute([$data['name'], $data['email'], password_hash($data['pass'], PASSWORD_DEFAULT), $data['phone'] ?? '']);
  echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
}

// --- เข้าสู่ระบบ ---
elseif ($action === 'login') {
  $stmt = $pdo->prepare("SELECT * FROM users WHERE email=?");
  $stmt->execute([$data['email']]);
  $u = $stmt->fetch(PDO::FETCH_ASSOC);
  if ($u) {
    $ok = false;
    if (password_verify($data['pass'], $u['pass'])) {
      $ok = true;
    } elseif ($data['pass'] === $u['pass']) {
      $ok = true;
      $hash = password_hash($data['pass'], PASSWORD_DEFAULT);
      $pdo->prepare("UPDATE users SET pass=? WHERE id=?")->execute([$hash, $u['id']]);
    }
    if ($ok) {
      // บันทึก session
      $_SESSION['user_id']   = $u['id'];
      $_SESSION['user_role'] = $u['role'];
      unset($u['pass']);
      echo json_encode(['ok' => true, 'user' => $u]);
    } else {
      echo json_encode(['ok' => false, 'msg' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง']);
    }
  } else {
    echo json_encode(['ok' => false, 'msg' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง']);
  }
}

// --- ออกจากระบบ ---
elseif ($action === 'logout') {
  session_destroy();
  echo json_encode(['ok' => true]);
}

// --- บันทึกออเดอร์ (ต้อง login) ---
elseif ($action === 'order') {
  requireLogin();
  $stmt = $pdo->prepare("INSERT INTO orders (id,user_id,items,total,status,date,address,phone,payment) VALUES (?,?,?,?,'pending',?,?,?,?)");
  $stmt->execute([
    $data['id'], $_SESSION['user_id'],
    json_encode($data['items'], JSON_UNESCAPED_UNICODE),
    $data['total'], $data['date'],
    $data['address'], $data['phone'], $data['payment']
  ]);
  echo json_encode(['ok' => true]);
}

// --- ดึงออเดอร์ของ user (ต้อง login) ---
elseif ($action === 'get_my_orders') {
  requireLogin();
  $stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id=? ORDER BY date DESC");
  $stmt->execute([$_SESSION['user_id']]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  foreach ($rows as &$row) {
    $row['items'] = json_decode($row['items'], true);
  }
  echo json_encode(['ok' => true, 'orders' => $rows]);
}

// --- ดึงออเดอร์ทั้งหมด (admin เท่านั้น) ---
elseif ($action === 'get_all_orders') {
  requireAdmin();
  $stmt = $pdo->query("SELECT o.*, u.name as user_name FROM orders o LEFT JOIN users u ON o.user_id=u.id ORDER BY o.date DESC");
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  foreach ($rows as &$row) {
    $row['items'] = json_decode($row['items'], true);
  }
  echo json_encode(['ok' => true, 'orders' => $rows]);
}

// --- ดึง users ทั้งหมด (admin เท่านั้น) ---
elseif ($action === 'get_all_users') {
  requireAdmin();
  $stmt = $pdo->query("SELECT id,name,email,phone,address,role,joined FROM users WHERE role='user' ORDER BY joined DESC");
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode(['ok' => true, 'users' => $rows]);
}

// --- อัพเดทสถานะออเดอร์ (admin เท่านั้น) ---
elseif ($action === 'update_order_status') {
  requireAdmin();
  $stmt = $pdo->prepare("UPDATE orders SET status=? WHERE id=?");
  $stmt->execute([$data['status'], $data['orderId']]);
  echo json_encode(['ok' => true]);
}

// --- อัพเดทโปรไฟล์ user (ต้อง login และเป็น user ตัวเอง) ---
elseif ($action === 'update_profile') {
  requireLogin();
  if ($_SESSION['user_id'] != $data['id'] && ($_SESSION['user_role'] ?? '') !== 'admin') {
    echo json_encode(['ok' => false, 'msg' => 'ไม่มีสิทธิ์']); exit;
  }
  $stmt = $pdo->prepare("UPDATE users SET name=?,email=?,phone=?,address=? WHERE id=?");
  $stmt->execute([$data['name'], $data['email'], $data['phone'], $data['address'], $data['id']]);
  echo json_encode(['ok' => true]);
}

// --- เปลี่ยนรหัสผ่าน (ต้อง login และเป็น user ตัวเอง) ---
elseif ($action === 'change_password') {
  requireLogin();
  if ($_SESSION['user_id'] != $data['id']) {
    echo json_encode(['ok' => false, 'msg' => 'ไม่มีสิทธิ์']); exit;
  }
  $stmt = $pdo->prepare("SELECT pass FROM users WHERE id=?");
  $stmt->execute([$data['id']]);
  $u = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$u) { echo json_encode(['ok' => false, 'msg' => 'ไม่พบผู้ใช้']); exit; }

  $passOk = false;
  if (password_verify($data['oldPass'], $u['pass'])) $passOk = true;
  elseif ($data['oldPass'] === $u['pass']) $passOk = true;

  if (!$passOk) { echo json_encode(['ok' => false, 'msg' => 'รหัสผ่านเดิมไม่ถูกต้อง']); exit; }

  $newHash = password_hash($data['newPass'], PASSWORD_DEFAULT);
  $pdo->prepare("UPDATE users SET pass=? WHERE id=?")->execute([$newHash, $data['id']]);
  echo json_encode(['ok' => true]);
}

// --- ลบ user (admin เท่านั้น) ---
elseif ($action === 'delete_user') {
  requireAdmin();
  $pdo->prepare("DELETE FROM orders WHERE user_id=?")->execute([$data['id']]);
  $pdo->prepare("DELETE FROM users WHERE id=? AND role='user'")->execute([$data['id']]);
  echo json_encode(['ok' => true]);
}

// --- แก้ไขข้อมูล user โดย admin ---
elseif ($action === 'admin_update_user') {
  requireAdmin();
  if (empty($data['id']) || empty($data['name']) || empty($data['email'])) {
    echo json_encode(['ok' => false, 'msg' => 'ข้อมูลไม่ครบ']); exit;
  }
  $chkEmail = $pdo->prepare("SELECT id FROM users WHERE email=? AND id!=?");
  $chkEmail->execute([$data['email'], $data['id']]);
  if ($chkEmail->fetch()) {
    echo json_encode(['ok' => false, 'msg' => 'อีเมลนี้มีผู้ใช้แล้ว']); exit;
  }
  $stmt = $pdo->prepare("UPDATE users SET name=?, email=?, phone=?, address=? WHERE id=? AND role='user'");
  $stmt->execute([$data['name'], $data['email'], $data['phone'] ?? '', $data['address'] ?? '', $data['id']]);
  echo json_encode(['ok' => true]);
}

// --- ลืมรหัสผ่าน: ส่ง email รีเซ็ต ---
elseif ($action === 'forgot_password') {
  $email = trim($data['email'] ?? '');
  if (!$email) { echo json_encode(['ok' => false, 'msg' => 'กรุณากรอกอีเมล']); exit; }

  $stmt = $pdo->prepare("SELECT id, name FROM users WHERE email=? AND role='user'");
  $stmt->execute([$email]);
  $u = $stmt->fetch(PDO::FETCH_ASSOC);

  // ไม่บอกว่า email ไม่มีอยู่ เพื่อความปลอดภัย
  if (!$u) {
    echo json_encode(['ok' => true, 'msg' => 'หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงค์รีเซ็ตไปให้']);
    exit;
  }

  $token   = bin2hex(random_bytes(32));
  $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

  $pdo->prepare("DELETE FROM password_resets WHERE email=?")->execute([$email]);
  $pdo->prepare("INSERT INTO password_resets (email, token, expires_at) VALUES (?,?,?)")
      ->execute([$email, $token, $expires]);

  $protocol  = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
  $host      = $_SERVER['HTTP_HOST'];
  $basePath  = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
  $resetLink = "$protocol://$host$basePath/index.html?reset_token=$token";

  require_once __DIR__ . '/src/Exception.php';
  require_once __DIR__ . '/src/PHPMailer.php';
  require_once __DIR__ . '/src/SMTP.php';

  $mail = new PHPMailer\PHPMailer\PHPMailer(true);
  try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'potato699610@gmail.com';
    $mail->Password   = 'rtkn vpva uqsf ksna';
    $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom('potato699610@gmail.com', 'BAANHAO Shop');
    $mail->addAddress($email, $u['name']);
    $mail->isHTML(true);
    $mail->Subject = 'รีเซ็ตรหัสผ่าน - BAANHAO.COM';
    $mail->Body = "
      <div style='font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#1a1a1a;color:#fff;padding:32px;border-radius:14px;'>
        <h2 style='color:#f5a623;text-align:center;margin-top:0;'>🔐 รีเซ็ตรหัสผ่าน</h2>
        <p>สวัสดี <strong>{$u['name']}</strong></p>
        <p>เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณที่ BAANHAO.COM</p>
        <p>กรุณากดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่<br>
           <small style='color:#aaa;'>ลิงค์นี้จะหมดอายุใน <strong style='color:#f5a623;'>1 ชั่วโมง</strong></small>
        </p>
        <div style='text-align:center;margin:28px 0;'>
          <a href='$resetLink'
             style='background:#f5a623;color:#000;padding:14px 32px;border-radius:8px;
                    text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;'>
            ตั้งรหัสผ่านใหม่
          </a>
        </div>
        <p style='color:#888;font-size:13px;'>หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <hr style='border-color:#333;margin:20px 0;'>
        <p style='color:#555;font-size:12px;text-align:center;margin:0;'>BAANHAO.COM</p>
      </div>
    ";
    $mail->AltBody = "รีเซ็ตรหัสผ่านของคุณที่: $resetLink (หมดอายุใน 1 ชั่วโมง)";
    $mail->send();
    echo json_encode(['ok' => true, 'msg' => 'ส่งลิงค์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว กรุณาตรวจสอบกล่องจดหมาย']);
  } catch (Exception $e) {
    echo json_encode(['ok' => false, 'msg' => 'ไม่สามารถส่งอีเมลได้: ' . $mail->ErrorInfo]);
  }
}

// --- รีเซ็ตรหัสผ่านด้วย token ---
elseif ($action === 'reset_password') {
  $token   = trim($data['token'] ?? '');
  $newPass = $data['newPass'] ?? '';

  if (!$token || !$newPass) {
    echo json_encode(['ok' => false, 'msg' => 'ข้อมูลไม่ครบ']); exit;
  }
  if (strlen($newPass) < 6) {
    echo json_encode(['ok' => false, 'msg' => 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร']); exit;
  }

  $stmt = $pdo->prepare("SELECT * FROM password_resets WHERE token=?");
  $stmt->execute([$token]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$row) {
    echo json_encode(['ok' => false, 'msg' => 'ลิงค์ไม่ถูกต้อง กรุณาขอลิงค์ใหม่']); exit;
  }

  // เช็คหมดอายุด้วย PHP เพื่อหลีกเลี่ยงปัญหา timezone
  if (time() > strtotime($row['expires_at'])) {
    $pdo->prepare("DELETE FROM password_resets WHERE token=?")->execute([$token]);
    echo json_encode(['ok' => false, 'msg' => 'ลิงค์หมดอายุแล้ว กรุณาขอลิงค์ใหม่']); exit;
  }

  $hash = password_hash($newPass, PASSWORD_DEFAULT);
  $pdo->prepare("UPDATE users SET pass=? WHERE email=?")->execute([$hash, $row['email']]);
  $pdo->prepare("DELETE FROM password_resets WHERE email=?")->execute([$row['email']]);

  echo json_encode(['ok' => true, 'msg' => 'เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่']);
}

else {
  echo json_encode(['ok' => false, 'msg' => 'unknown action']);
}
?>