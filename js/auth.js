// ===== AUTH MODULE =====

function openAuth(tab = 'login') {
  document.getElementById('authModal').classList.add('open');
  switchAuthTab(tab);
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('open');
}

function switchAuthTab(t) {
  document.getElementById('loginTab').classList.toggle('active', t === 'login');
  document.getElementById('registerTab').classList.toggle('active', t === 'register');
  document.getElementById('loginForm').style.display = t === 'login' ? 'flex' : 'none';
  document.getElementById('registerForm').style.display = t === 'register' ? 'flex' : 'none';
}

async function doLogin() {
  const e = document.getElementById('loginEmail').value.trim();
  const p = document.getElementById('loginPass').value;
  if (!e || !p) { toast('กรุณากรอกอีเมลและรหัสผ่าน', 'error'); return; }
  try {
    const res = await fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email: e, pass: p })
    });
    const result = await res.json();
    if (!result.ok) { toast(result.msg || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'error'); return; }
    setCurrentUser(result.user);
    closeAuthModal();
    toast('ยินดีต้อนรับ ' + result.user.name, 'success');
  } catch (err) {
    toast('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
  }
}

async function doRegister() {
  const n = document.getElementById('regName').value.trim();
  const e = document.getElementById('regEmail').value.trim();
  const p = document.getElementById('regPass').value;
  const ph = document.getElementById('regPhone').value.trim();
  if (!n || !e || !p) { toast('กรุณากรอกข้อมูลให้ครบ', 'error'); return; }
  try {
    const res = await fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', name: n, email: e, pass: p, phone: ph })
    });
    const result = await res.json();
    if (!result.ok) { toast(result.msg || 'เกิดข้อผิดพลาด', 'error'); return; }
    const nu = { id: result.id, name: n, email: e, phone: ph, role: 'user', joined: new Date().toISOString().slice(0, 10), address: '' };
    users.push(nu);
    setCurrentUser(nu);
    closeAuthModal();
    toast('สมัครสมาชิกสำเร็จ ยินดีต้อนรับ!', 'success');
  } catch (err) {
    toast('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
  }
}

async function logout() {
  try {
    await fetch('api.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
  } catch(e) {}
  currentUser = null;
  localStorage.removeItem('currentUser');
  document.getElementById('authBtns').style.display = '';
  document.getElementById('userBtns').style.display = 'none';
  document.getElementById('adminToggle').style.display = 'none';
  showPage('home');
  toast('ออกจากระบบแล้ว');
}

function setCurrentUser(u) {
  currentUser = u;
  localStorage.setItem('currentUser', JSON.stringify(u));
  document.getElementById('authBtns').style.display = 'none';
  document.getElementById('userBtns').style.display = '';
  document.getElementById('userNameNav').textContent = u.name.split(' ')[0];
  if (u.role === 'admin') document.getElementById('adminToggle').style.display = '';
}

function restoreSession() {
  const saved = localStorage.getItem('currentUser');
  if (saved) {
    try {
      setCurrentUser(JSON.parse(saved));
    } catch(e) {
      localStorage.removeItem('currentUser');
    }
  }
}

// ===== FORGOT PASSWORD =====

function openForgotPassword() {
  closeAuthModal();
  setTimeout(() => {
    document.getElementById('forgotModal').classList.add('open');
    document.getElementById('forgotEmail').value = '';
    document.getElementById('forgotMsg').textContent = '';
    document.getElementById('forgotMsg').className = 'form-msg';
  }, 50);
}

function closeForgotModal() {
  document.getElementById('forgotModal').classList.remove('open');
}

async function doForgotPassword() {
  const email = document.getElementById('forgotEmail').value.trim();
  const msgEl = document.getElementById('forgotMsg');
  if (!email) {
    msgEl.textContent = 'กรุณากรอกอีเมล';
    msgEl.className = 'form-msg error';
    return;
  }
  const btn = document.getElementById('forgotBtn');
  btn.disabled = true;
  btn.textContent = 'กำลังส่ง...';
  msgEl.textContent = '';
  try {
    const res = await fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'forgot_password', email })
    });
    const result = await res.json();
    msgEl.textContent = result.msg;
    msgEl.className = 'form-msg ' + (result.ok ? 'success' : 'error');
  } catch (err) {
    msgEl.textContent = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
    msgEl.className = 'form-msg error';
  } finally {
    btn.disabled = false;
    btn.textContent = 'ส่งลิงค์รีเซ็ต';
  }
}

// ===== RESET PASSWORD =====

function openResetModal(token) {
  document.getElementById('resetModal').classList.add('open');
  document.getElementById('resetToken').value = token;
  document.getElementById('resetNewPass').value = '';
  document.getElementById('resetConfirmPass').value = '';
  document.getElementById('resetMsg').textContent = '';
  document.getElementById('resetMsg').className = 'form-msg';
}

function closeResetModal() {
  document.getElementById('resetModal').classList.remove('open');
  history.replaceState({}, document.title, window.location.pathname);
}

async function doResetPassword() {
  const token   = document.getElementById('resetToken').value;
  const newPass = document.getElementById('resetNewPass').value;
  const confirm = document.getElementById('resetConfirmPass').value;
  const msgEl   = document.getElementById('resetMsg');

  if (!newPass || !confirm) { msgEl.textContent = 'กรุณากรอกรหัสผ่านให้ครบ'; msgEl.className = 'form-msg error'; return; }
  if (newPass.length < 6)   { msgEl.textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'; msgEl.className = 'form-msg error'; return; }
  if (newPass !== confirm)   { msgEl.textContent = 'รหัสผ่านไม่ตรงกัน'; msgEl.className = 'form-msg error'; return; }

  const btn = document.getElementById('resetBtn');
  btn.disabled = true;
  btn.textContent = 'กำลังบันทึก...';
  try {
    const res = await fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_password', token, newPass })
    });
    const result = await res.json();
    msgEl.textContent = result.msg;
    msgEl.className = 'form-msg ' + (result.ok ? 'success' : 'error');
    if (result.ok) {
      setTimeout(() => { closeResetModal(); openAuth('login'); }, 2000);
    }
  } catch (err) {
    msgEl.textContent = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
    msgEl.className = 'form-msg error';
  } finally {
    btn.disabled = false;
    btn.textContent = 'บันทึกรหัสผ่านใหม่';
  }
}

function checkResetToken() {
  const params = new URLSearchParams(window.location.search);
  const token  = params.get('reset_token');
  if (token) openResetModal(token);
}