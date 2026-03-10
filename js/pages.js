// ===== PAGES MODULE =====

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (!page) return;
  page.classList.add('active');
  const renders = {
    home: renderHome, shop: renderShop,
    profile: () => { if (!currentUser) { openAuth('login'); return; } renderProfile(); },
    checkout: renderCheckout,
    admin: () => {
      if (!currentUser || currentUser.role !== 'admin') { toast('ต้องเข้าสู่ระบบในฐานะ Admin', 'error'); return; }
      renderAdminTab('dashboard');
    }
  };
  if (renders[id]) renders[id]();
}

// ===== HOME =====
function renderHome() {
  // Category cards with images
  document.getElementById('homeCats').innerHTML =
    CATEGORIES.map(c => `
      <div class="cat-card" onclick="filterCat('${c}')">
        <div class="cat-card-img" style="background-image:url('${CAT_IMGS[c]}')"></div>
        <div class="cat-card-label">${EMOJIS[c]} ${c}</div>
      </div>`).join('');
  // Featured products (first 8)
  document.getElementById('featuredGrid').innerHTML = products.slice(0, 8).map(productCardHtml).join('');
}

function filterCat(c) {
  shopFilter.cat = c;
  showPage('shop');
}

// ===== SHOP =====
function renderShop() {
  const catDiv = document.getElementById('shopCats');
  catDiv.innerHTML =
    `<div class="chip ${shopFilter.cat === '' ? 'active' : ''}" onclick="setCat('')">ทั้งหมด</div>` +
    CATEGORIES.map(c => `<div class="chip ${shopFilter.cat === c ? 'active' : ''}" onclick="setCat('${c}')">${EMOJIS[c]} ${c}</div>`).join('');
  document.getElementById('shopSearch').value = shopFilter.search;
  filterProducts();
}

function setCat(c) {
  shopFilter.cat = c;
  renderShop();
}

const PAGE_SIZE = 12;
let currentPage = 1;

function filterProducts() {
  const s = (document.getElementById('shopSearch') || { value: '' }).value.toLowerCase();
  shopFilter.search = s;
  currentPage = 1;
  renderProductPage();
}

function renderProductPage() {
  const s = shopFilter.search.toLowerCase();
  const filtered = products.filter(p => {
    const matchCat = !shopFilter.cat || p.cat === shopFilter.cat;
    const matchSearch = !s || p.name.toLowerCase().includes(s) || p.cat.toLowerCase().includes(s) || p.desc.toLowerCase().includes(s);
    return matchCat && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const grid = document.getElementById('shopGrid');
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div>🔍</div>ไม่พบสินค้าที่ค้นหา</div>`;
    document.getElementById('shopPagination').innerHTML = '';
    return;
  }

  grid.innerHTML = pageItems.map(productCardHtml).join('');

  // render pagination
  const pg = document.getElementById('shopPagination');
  if (totalPages <= 1) { pg.innerHTML = ''; return; }

  let html = `<div class="pagination">`;
  html += `<button class="pg-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>← ก่อนหน้า</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage-1 && i <= currentPage+1)) {
      html += `<button class="pg-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
    } else if (i === currentPage-2 || i === currentPage+2) {
      html += `<span class="pg-dots">…</span>`;
    }
  }
  html += `<button class="pg-btn" onclick="goPage(${currentPage+1})" ${currentPage===totalPages?'disabled':''}>ถัดไป →</button>`;
  html += `<span class="pg-info">${filtered.length} รายการ</span></div>`;
  pg.innerHTML = html;
}

function goPage(n) {
  const s = shopFilter.search.toLowerCase();
  const filtered = products.filter(p => {
    const matchCat = !shopFilter.cat || p.cat === shopFilter.cat;
    const matchSearch = !s || p.name.toLowerCase().includes(s) || p.cat.toLowerCase().includes(s) || p.desc.toLowerCase().includes(s);
    return matchCat && matchSearch;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (n < 1 || n > totalPages) return;
  currentPage = n;
  renderProductPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== PRODUCT CARD =====
function productCardHtml(p) {
  const imgHtml = p.img
    ? `<img src="${p.img}" alt="${p.name}" class="product-img-real" onerror="this.parentElement.innerHTML='<div class=\\'product-img-emoji\\'>${p.emoji}</div>'">`
    : `<div class="product-img-emoji">${p.emoji}</div>`;
  return `
  <div class="product-card" onclick="openProduct(${p.id})">
    ${p.sale ? `<div class="badge-sale">SALE</div>` : ''}
    ${p.stock === 0 ? `<div class="badge-out">หมด</div>` : (p.stock <= 5 ? `<div class="badge-low">เหลือ ${p.stock}</div>` : '')}
    <div class="product-img">${imgHtml}</div>
    <div class="product-body">
      <div class="product-cat">${p.cat}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-price">
        ฿${p.price.toLocaleString()}
        ${p.oldPrice ? `<span class="price-old">฿${p.oldPrice.toLocaleString()}</span>` : ''}
      </div>
    </div>
    <div class="product-footer">
      <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openProduct(${p.id})">ดูรายละเอียด</button>
      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();quickAdd(${p.id})">+ ตะกร้า</button>
    </div>
  </div>`;
}

// ===== PRODUCT MODAL =====
let selectedProduct = null;
let modalQty = 1;
let activeThumb = 0;

function openProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  selectedProduct = p;
  modalQty = 1;
  activeThumb = 0;
  document.getElementById('qtyVal').textContent = 1;
  document.getElementById('modalTitle').textContent = p.name;
  document.getElementById('modalCat').textContent = p.cat;
  document.getElementById('modalName').textContent = p.name;
  document.getElementById('modalPrice').innerHTML = `฿${p.price.toLocaleString()}${p.oldPrice ? ` <span class="price-old">฿${p.oldPrice.toLocaleString()}</span>` : ''}`;
  document.getElementById('modalDesc').textContent = p.desc;

  // Main image
  setModalMainImg(p.img || null, p.emoji);

  // Thumbnails
  const thumbImgs = p.imgs && p.imgs.length ? p.imgs : [p.img || p.emoji];
  document.getElementById('modalThumbs').innerHTML = thumbImgs.map((img, i) => {
    const isUrl = img && img.startsWith('http');
    return `<div class="thumb ${i === 0 ? 'active' : ''}" onclick="switchModalImg('${img}','${p.emoji}',${i})">
      ${isUrl ? `<img src="${img}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:6px">` : `<span style="font-size:1.8rem">${img}</span>`}
    </div>`;
  }).join('');

  document.getElementById('productModal').classList.add('open');
}

function setModalMainImg(url, emoji) {
  const el = document.getElementById('modalImg');
  if (url && url.startsWith('http')) {
    el.innerHTML = `<img src="${url}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:10px" onerror="this.parentElement.innerHTML='<span style=font-size:5rem>${emoji}</span>'">`;
  } else {
    el.innerHTML = `<span style="font-size:5rem">${emoji}</span>`;
  }
}

function switchModalImg(img, emoji, idx) {
  document.querySelectorAll('.thumb').forEach((t,i) => t.classList.toggle('active', i===idx));
  setModalMainImg(img, emoji);
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
}

function changeQty(d) {
  modalQty = Math.max(1, modalQty + d);
  document.getElementById('qtyVal').textContent = modalQty;
}

function addToCartModal() {
  if (!selectedProduct) return;
  addToCart(selectedProduct, modalQty);
  closeProductModal();
}

function quickAdd(id) {
  const p = products.find(x => x.id === id);
  if (p) addToCart(p, 1);
}

// ===== PROFILE =====
async function renderProfile() {
  if (!currentUser) return;
  document.getElementById('profilePanel').innerHTML = `
    <div class="form-grid">
      <div class="form-group"><label>ชื่อ-นามสกุล</label><input id="editName" value="${currentUser.name}"></div>
      <div class="form-group"><label>อีเมล</label><input id="editEmail" type="email" value="${currentUser.email}"></div>
      <div class="form-group"><label>เบอร์โทรศัพท์</label><input id="editPhone" value="${currentUser.phone || ''}"></div>
      <div class="form-group"><label>ที่อยู่</label><input id="editAddr" value="${currentUser.address || ''}"></div>
    </div>
    <button class="btn btn-primary" style="margin-top:1rem" onclick="saveProfile()">💾 บันทึกข้อมูล</button>
    <hr style="border-color:var(--border);margin:1.5rem 0">
    <div style="font-weight:600;margin-bottom:1rem">🔑 เปลี่ยนรหัสผ่าน</div>
    <div class="form-grid">
      <div class="form-group"><label>รหัสผ่านเดิม</label><input id="oldPass" type="password" placeholder="รหัสผ่านเดิม"></div>
      <div class="form-group"><label>รหัสผ่านใหม่</label><input id="newPass" type="password" placeholder="อย่างน้อย 6 ตัวอักษร"></div>
      <div class="form-group"><label>ยืนยันรหัสผ่านใหม่</label><input id="confirmPass" type="password" placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"></div>
    </div>
    <button class="btn btn-ghost" style="margin-top:1rem" onclick="changePassword()">🔒 เปลี่ยนรหัสผ่าน</button>`;

  const el = document.getElementById('myOrders');
  el.innerHTML = `<div class="empty-state"><div>⏳</div>กำลังโหลด...</div>`;
  try {
    const res = await fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_my_orders', userId: currentUser.id })
    });
    const result = await res.json();
    const myO = result.ok ? result.orders : [];
    if (myO.length === 0) {
      el.innerHTML = `<div class="empty-state"><div>📦</div>ยังไม่มีคำสั่งซื้อ</div>`; return;
    }
    el.innerHTML = myO.map(o => `
      <div class="order-card">
        <div class="order-card-head">
          <div>
            <strong>${o.id}</strong>
            <span style="font-size:.8rem;color:var(--text2);margin-left:.5rem">${o.date}</span>
          </div>
          <span class="status-badge status-${o.status}">${statusTh(o.status)}</span>
        </div>
        <div style="font-size:.85rem;color:var(--text2);margin:.5rem 0">${o.items.map(i => `${i.emoji} ${i.name} x${i.qty}`).join(' · ')}</div>
        ${trackHtml(o.status)}
        <div style="text-align:right;font-weight:700;color:var(--accent)">รวม ฿${Number(o.total).toLocaleString()}</div>
      </div>`).join('');
  } catch (err) {
    el.innerHTML = `<div class="empty-state"><div>❌</div>โหลดข้อมูลไม่สำเร็จ</div>`;
  }
}

async function saveProfile() {
  currentUser.name = document.getElementById('editName').value;
  currentUser.email = document.getElementById('editEmail').value;
  currentUser.phone = document.getElementById('editPhone').value;
  currentUser.address = document.getElementById('editAddr').value;
  try {
    await fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_profile', ...currentUser })
    });
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  } catch (e) {}
  document.getElementById('userNameNav').textContent = currentUser.name.split(' ')[0];
  toast('บันทึกข้อมูลแล้ว', 'success');
}

async function changePassword() {
  const oldPass = document.getElementById('oldPass').value;
  const newPass = document.getElementById('newPass').value;
  const confirmPass = document.getElementById('confirmPass').value;
  if (!oldPass || !newPass || !confirmPass) {
    toast('กรุณากรอกข้อมูลให้ครบ', 'error'); return;
  }
  if (newPass.length < 6) {
    toast('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร', 'error'); return;
  }
  if (newPass !== confirmPass) {
    toast('รหัสผ่านใหม่ไม่ตรงกัน', 'error'); return;
  }
  try {
    const res = await fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'change_password', id: currentUser.id, oldPass, newPass })
    });
    const result = await res.json();
    if (!result.ok) { toast(result.msg || 'รหัสผ่านเดิมไม่ถูกต้อง', 'error'); return; }
    document.getElementById('oldPass').value = '';
    document.getElementById('newPass').value = '';
    document.getElementById('confirmPass').value = '';
    toast('เปลี่ยนรหัสผ่านสำเร็จ', 'success');
  } catch(e) {
    toast('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
  }
}

function trackHtml(status) {
  const steps = [
    { key: 'pending', label: 'รับออเดอร์' },
    { key: 'packing', label: 'แพ็คสินค้า' },
    { key: 'shipped', label: 'จัดส่งแล้ว' },
    { key: 'done', label: 'ถึงมือแล้ว' }
  ];
  const order = ['pending', 'packing', 'shipped', 'done'];
  const idx = order.indexOf(status);
  return `
  <div class="track-steps">
    ${steps.map((s, i) => `
      <div class="track-step">
        <div class="step-dot ${i < idx ? 'done' : i === idx ? 'active' : ''}">${i < idx ? '✓' : i + 1}</div>
        <div class="step-label">${s.label}</div>
      </div>`).join('')}
  </div>`;
}

// ===== CHECKOUT =====
function renderCheckout() {
  if (currentUser) {
    document.getElementById('ckName').value = currentUser.name || '';
    document.getElementById('ckPhone').value = currentUser.phone || '';
    document.getElementById('ckAddr').value = currentUser.address || '';
  }
  const el = document.getElementById('ckSummary');
  el.innerHTML = cart.map(i => `
    <div class="order-summary-item">
      <span>${i.emoji} ${i.name} <span style="color:var(--text2)">x${i.qty}</span></span>
      <span>฿${(i.price * i.qty).toLocaleString()}</span>
    </div>`).join('');
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
  document.getElementById('ckTotal').textContent = '฿' + total.toLocaleString();
}

// ===== UTILS =====
function closeModal(e) {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
}

function toast(msg, type = '') {
  const wrap = document.getElementById('toastWrap');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = (type === 'success' ? '✅ ' : type === 'error' ? '❌ ' : 'ℹ️ ') + msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ===== LIVE SEARCH =====

function liveSearch(val) {
  const drop = document.getElementById('liveSearchDrop');
  if (!drop) return;
  const q = val.trim().toLowerCase();
  if (!q) { drop.style.display = 'none'; return; }
  const results = products.filter(p =>
    p.name.toLowerCase().includes(q) || (p.cat || '').toLowerCase().includes(q)
  ).slice(0, 7);
  if (results.length === 0) { drop.style.display = 'none'; return; }
  drop.innerHTML = results.map(p => `
    <div onclick="selectLiveSearch('${p.name.replace(/'/g,"\'")}',${p.id})"
      style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border);font-size:13px;transition:background .15s"
      onmouseover="this.style.background='var(--surface)'" onmouseout="this.style.background=''">
      <span style="font-size:18px">${p.emoji || '📦'}</span>
      <span style="flex:1">${p.name}</span>
      <span style="font-size:11px;color:var(--text2)">${p.cat || ''}</span>
      <span style="color:var(--accent);font-weight:600;font-size:12px">฿${Number(p.price).toLocaleString()}</span>
    </div>`).join('');
  drop.style.display = 'block';
}

function hideLiveSearch() {
  const drop = document.getElementById('liveSearchDrop');
  if (drop) drop.style.display = 'none';
}

function selectLiveSearch(name, id) {
  document.getElementById('navSearch').value = name;
  hideLiveSearch();
  shopFilter.search = name;
  showPage('shop');
}

function doNavSearch(val) {
  if (!val.trim()) return;
  shopFilter.search = val.trim();
  showPage('shop');
}