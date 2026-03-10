// ===== ADMIN MODULE =====

// โหลด jQuery + DataTables + Chart.js แบบ dynamic
(function loadAdminDeps() {
  function loadScript(src, cb) { const s = document.createElement('script'); s.src = src; s.onload = cb || function(){}; document.head.appendChild(s); }
  function loadCSS(href) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); }
  loadCSS('https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css');
  if (!window.jQuery) {
    loadScript('https://code.jquery.com/jquery-3.7.1.min.js', function() {
      loadScript('https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js');
    });
  } else if (!$.fn.DataTable) {
    loadScript('https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js');
  }
  if (!window.Chart) loadScript('https://cdn.jsdelivr.net/npm/chart.js');
})();

// adminFetch: แนบ _userId/_userRole ทุก request แก้ปัญหา session หาย
function adminFetch(payload) {
  const u = (typeof currentUser !== 'undefined' && currentUser)
    || JSON.parse(localStorage.getItem('currentUser') || 'null');
  const body = { ...payload };
  if (u) { body._userId = u.id; body._userRole = u.role; }
  return fetch('api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

// DataTables init
function initDataTable(tableId, options = {}) {
  if (!window.jQuery || !$.fn || !$.fn.DataTable) return;
  if ($.fn.DataTable.isDataTable('#' + tableId)) $('#' + tableId).DataTable().destroy();
  $('#' + tableId).DataTable({
    language: {
      search: 'ค้นหา:', lengthMenu: 'แสดง _MENU_ รายการ',
      info: 'แสดง _START_–_END_ จาก _TOTAL_ รายการ',
      infoEmpty: 'ไม่มีข้อมูล', infoFiltered: '(กรองจาก _MAX_)',
      zeroRecords: 'ไม่พบข้อมูล',
      paginate: { first: '«', last: '»', next: '›', previous: '‹' }
    },
    pageLength: 10, responsive: true, dom: 'lrtip', ...options
  });
}

// filterAdminTable: ใช้ DataTables ถ้ามี
function filterAdminTable(val, tableId) {
  if (window.jQuery && $.fn.DataTable && $.fn.DataTable.isDataTable('#' + tableId)) {
    $('#' + tableId).DataTable().search(val).draw(); return;
  }
  document.querySelectorAll('#' + tableId + ' tbody tr').forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(val.toLowerCase()) ? '' : 'none';
  });
}

function adminTab(tab, el) {
  document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
  renderAdminTab(tab);
}

function renderAdminTab(tab) {
  const main = document.getElementById('adminMain');
  const map = { dashboard: dashboardHtml, products: productsAdminHtml, categories: categoriesAdminHtml, orders: ordersAdminHtml, customers: customersAdminHtml };
  if (map[tab]) main.innerHTML = map[tab]();
}

// --- Dashboard ---
function dashboardHtml() {
  setTimeout(loadDashboard, 100);
  return `
  <div class="admin-title">📊 ภาพรวม</div>
  <div class="stats-row" id="dashStats">
    <div class="stat-card"><div class="stat-val">${products.length}</div><div class="stat-label">สินค้าทั้งหมด</div></div>
    <div class="stat-card"><div class="stat-val">⏳</div><div class="stat-label">ออเดอร์ทั้งหมด</div></div>
    <div class="stat-card"><div class="stat-val accent">⏳</div><div class="stat-label">รอดำเนินการ</div></div>
    <div class="stat-card"><div class="stat-val">⏳</div><div class="stat-label">ลูกค้าทั้งหมด</div></div>
    <div class="stat-card"><div class="stat-val">⏳</div><div class="stat-label">รายได้รวม</div></div>
  </div>
  <div class="table-wrap" style="margin-bottom:1.25rem">
    <div class="table-title" style="padding:1rem 1.2rem;border-bottom:1px solid var(--border)">📈 ยอดขายรายสัปดาห์</div>
    <div style="padding:1.2rem"><canvas id="salesChart" height="80"></canvas></div>
  </div>
  <div class="table-wrap">
    <div class="table-title">ออเดอร์ล่าสุด</div>
    <table><thead><tr><th>หมายเลข</th><th>วันที่</th><th>ลูกค้า</th><th>ยอด</th><th>สถานะ</th></tr></thead>
    <tbody id="dashOrderBody"><tr><td colspan="5" style="text-align:center;padding:1.5rem">⏳ กำลังโหลด...</td></tr></tbody></table>
  </div>`;
}

async function loadDashboard() {
  try {
    const [ordRes, usrRes] = await Promise.all([
      adminFetch({ action: 'get_all_orders' }),
      adminFetch({ action: 'get_all_users' })
    ]);
    const ordData = await ordRes.json();
    const usrData = await usrRes.json();
    const dbOrders = ordData.ok ? ordData.orders : [];
    const dbUsers  = usrData.ok ? usrData.users  : [];

    const totalRev = dbOrders.reduce((s, o) => s + Number(o.total), 0);
    const pending  = dbOrders.filter(o => o.status === 'pending').length;

    // stats
    const stats = document.getElementById('dashStats');
    if (stats) {
      stats.innerHTML = `
        <div class="stat-card"><div class="stat-val">${products.length}</div><div class="stat-label">สินค้าทั้งหมด</div></div>
        <div class="stat-card"><div class="stat-val">${dbOrders.length}</div><div class="stat-label">ออเดอร์ทั้งหมด</div></div>
        <div class="stat-card"><div class="stat-val" style="color:#ff6b6b">${pending}</div><div class="stat-label">รอดำเนินการ</div></div>
        <div class="stat-card"><div class="stat-val">${dbUsers.length}</div><div class="stat-label">ลูกค้าทั้งหมด</div></div>
        <div class="stat-card"><div class="stat-val">฿${totalRev.toLocaleString()}</div><div class="stat-label">รายได้รวม</div></div>`;
    }

    // กราฟยอดขาย 7 วันย้อนหลัง
    const canvas = document.getElementById('salesChart');
    if (canvas && window.Chart) {
      // รวมยอดขายแยกตามวันที่ 7 วันล่าสุด
      const dayMap = {};
      const today = new Date();
      const dayLabels = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dayMap[key] = 0;
        dayLabels.push(key.slice(5)); // MM-DD
      }
      dbOrders.forEach(o => { if (dayMap[o.date] !== undefined) dayMap[o.date] += Number(o.total); });
      const chartData = Object.values(dayMap);

      if (canvas._chartInstance) canvas._chartInstance.destroy();
      canvas._chartInstance = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: dayLabels,
          datasets: [{
            label: 'ยอดขาย (฿)',
            data: chartData,
            backgroundColor: 'rgba(245,166,35,0.8)',
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => '฿' + ctx.raw.toLocaleString() } }
          },
          scales: {
            x: { grid: { color: '#2a2a2a' }, ticks: { color: '#888' } },
            y: { grid: { color: '#2a2a2a' }, ticks: { color: '#888', callback: v => '฿' + v.toLocaleString() }, beginAtZero: true }
          }
        }
      });
    }

    // ออเดอร์ล่าสุด
    const tbody = document.getElementById('dashOrderBody');
    if (tbody) {
      if (dbOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:1.5rem">ยังไม่มีออเดอร์</td></tr>';
      } else {
        tbody.innerHTML = dbOrders.slice(0, 5).map(o =>
          `<tr><td>${o.id}</td><td>${o.date}</td><td>${o.user_name || '-'}</td>` +
          `<td>฿${Number(o.total).toLocaleString()}</td>` +
          `<td><span class="status-badge status-${o.status}">${statusTh(o.status)}</span></td></tr>`
        ).join('');
      }
    }
  } catch(e) {
    console.error('Dashboard load error:', e);
  }
}

// --- Products Admin ---
function productsAdminHtml() {
  return `
  <div class="admin-title">📦 จัดการสินค้า</div>
  <div class="toolbar">
    <input class="search-input" placeholder="ค้นหาสินค้า..." oninput="filterAdminTable(this.value,'prodTable')">
    <button class="btn btn-primary" onclick="showAddProduct()">+ เพิ่มสินค้า</button>
  </div>
  <div id="addProdPanel" style="display:none" class="form-panel">
    <div class="form-panel-title">เพิ่มสินค้าใหม่</div>
    <div class="form-grid">
      <div class="form-group"><label>ชื่อสินค้า*</label><input id="npName" placeholder="ชื่อสินค้า"></div>
      <div class="form-group"><label>ประเภท*</label>
        <select id="npCat">${CATEGORIES.map(c => `<option>${c}</option>`).join('')}</select>
      </div>
      <div class="form-group"><label>ราคา (บาท)*</label><input id="npPrice" type="number" placeholder="0"></div>
      <div class="form-group"><label>ราคาเดิม (บาท)</label><input id="npOld" type="number" placeholder="ไม่บังคับ"></div>
      <div class="form-group"><label>Emoji ไอคอน</label><input id="npEmoji" placeholder="📦" maxlength="4"></div>
      <div class="form-group"><label>จำนวนสต็อก</label><input id="npStock" type="number" placeholder="99" value="99"></div>
      <div class="form-group"><label>แสดงป้าย SALE</label>
        <select id="npSale"><option value="0">ไม่มี</option><option value="1">มีป้าย SALE</option></select>
      </div>
      <div class="form-group form-wide"><label>คำอธิบายสินค้า</label><textarea id="npDesc" rows="2" placeholder="รายละเอียดสินค้า..."></textarea></div>
      <div class="form-group form-wide">
        <label>รูปภาพสินค้า <span style="font-size:.78rem;color:var(--text2)">(เลือกได้หลายรูป)</span></label>
        <div style="display:flex;gap:.75rem;align-items:flex-start;flex-wrap:wrap">
          <div>
            <input type="file" id="npImgFile" accept="image/*" multiple onchange="previewMultiImgs(this)" style="font-size:.82rem;color:var(--text2)">
            <div id="npImgPreview" style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.5rem"></div>
          </div>
          <div style="flex:1">
            <input id="npImgUrl" placeholder="หรือวาง URL รูปภาพหลัก" style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.55rem 1rem;color:var(--text);font-family:inherit;font-size:.85rem;outline:none">
          </div>
        </div>
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" onclick="saveNewProduct()">💾 บันทึก</button>
      <button class="btn btn-ghost" onclick="document.getElementById('addProdPanel').style.display='none'">ยกเลิก</button>
    </div>
  </div>
  <div class="table-wrap">
    <table id="prodTable"><thead><tr><th></th><th>ชื่อสินค้า</th><th>ประเภท</th><th>ราคา</th><th>สต็อก</th><th>SALE</th><th>การจัดการ</th></tr></thead>
    <tbody>${products.map(p => `
      <tr>
        <td style="font-size:1.5rem">${p.emoji}</td>
        <td>${p.name}</td>
        <td>${p.cat}</td>
        <td>฿${p.price.toLocaleString()}</td>
        <td>${(p.stock ?? 99) === 0 ? '<span class="status-badge status-cancel">หมด</span>' : ((p.stock ?? 99) <= 5 ? `<span class="status-badge status-pending">${p.stock ?? 99}</span>` : (p.stock ?? 99))}</td>
        <td>${p.sale ? '<span class="status-badge status-sale">SALE</span>' : '-'}</td>
        <td class="action-cell">
          <button class="action-btn" onclick="editProduct(${p.id})">✏️ แก้ไข</button>
          <button class="action-btn danger" onclick="deleteProduct(${p.id})">🗑️ ลบ</button>
        </td>
      </tr>`).join('')}
    </tbody></table>
  </div>`;
}

function showAddProduct() {
  document.getElementById('addProdPanel').style.display = 'block';
}

async function saveNewProduct() {
  const name = document.getElementById('npName').value.trim();
  const price = parseFloat(document.getElementById('npPrice').value);
  if (!name || !price) { toast('กรุณากรอกชื่อและราคา', 'error'); return; }
  const oldP = parseFloat(document.getElementById('npOld').value) || null;

  // อัปโหลดหลายรูป
  const fileInput = document.getElementById('npImgFile');
  let imgs = [];
  if (fileInput.files.length > 0) {
    toast('กำลังอัปโหลดรูปภาพ...', '');
    for (const file of fileInput.files) {
      const uploaded = await uploadImage(file);
      if (uploaded) imgs.push(uploaded);
    }
  }
  // URL ที่พิมพ์เอง
  const urlInput = document.getElementById('npImgUrl').value.trim();
  if (urlInput && imgs.length === 0) imgs.push(urlInput);

  const imgMain = imgs[0] || '';
  const np = {
    name, cat: document.getElementById('npCat').value,
    price, oldPrice: oldP, desc: document.getElementById('npDesc').value,
    emoji: document.getElementById('npEmoji').value || '📦',
    sale: document.getElementById('npSale').value === '1',
    stock: parseInt(document.getElementById('npStock').value) || 99,
    img: imgMain, imgs
  };
  try {
    const res = await adminFetch({ action: 'add_product', ...np });
    const result = await res.json();
    if (!result.ok) { toast('เกิดข้อผิดพลาด', 'error'); return; }
    np.id = result.id;
    products.push(np);
    renderAdminTab('products');
    toast('เพิ่มสินค้าแล้ว', 'success');
  } catch(e) { toast('เชื่อมต่อไม่ได้', 'error'); }
}

// ฟังก์ชันอัปโหลดรูป
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('action', 'upload_image');
  const u = currentUser || JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (u) { formData.append('_userId', u.id); formData.append('_userRole', u.role); }
  try {
    const res = await fetch('api.php', { method: 'POST', body: formData });
    const result = await res.json();
    if (result.ok) return result.url;
    toast('อัปโหลดรูปไม่สำเร็จ: ' + result.msg, 'error');
    return null;
  } catch(e) {
    toast('อัปโหลดรูปไม่สำเร็จ', 'error');
    return null;
  }
}

// preview หลายรูปก่อน upload
function previewMultiImgs(input) {
  const preview = document.getElementById('npImgPreview');
  preview.innerHTML = '';
  document.getElementById('npImgUrl').value = '';
  Array.from(input.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.style.cssText = 'width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid var(--border)';
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

// preview รูปเดียว (ใช้ใน edit)
function previewImg(input, previewId, urlId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById(previewId).innerHTML =
      `<img src="${e.target.result}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid var(--border)">`;
    document.getElementById(urlId).value = '';
  };
  reader.readAsDataURL(file);
}

async function deleteProduct(id) {
  if (!confirm('ยืนยันการลบสินค้านี้?')) return;
  await adminFetch({ action: 'delete_product', id });
  products = products.filter(p => p.id !== id);
  renderAdminTab('products');
  toast('ลบสินค้าแล้ว');
}

async function editProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const newName = prompt('ชื่อสินค้า:', p.name);
  if (newName !== null) p.name = newName.trim() || p.name;
  const newPrice = prompt('ราคา (บาท):', p.price);
  if (newPrice !== null) p.price = parseFloat(newPrice) || p.price;
  const newStock = prompt('จำนวนสต็อก:', p.stock ?? 99);
  if (newStock !== null) p.stock = parseInt(newStock) || 0;
  const newDesc = prompt('คำอธิบาย:', p.desc || p.description);
  if (newDesc !== null) p.desc = newDesc;
  const newImg = prompt('URL รูปภาพ (เว้นว่างถ้าไม่เปลี่ยน):', p.img || '');
  if (newImg !== null && newImg.trim()) p.img = newImg.trim();
  await adminFetch({ action: 'edit_product', ...p, description: p.desc });
  renderAdminTab('products');
  toast('แก้ไขสินค้าแล้ว', 'success');
}

// --- Categories Admin ---
function categoriesAdminHtml() {
  setTimeout(() => initDataTable('catTable', { columnDefs: [{ orderable: false, targets: [3] }] }), 200);
  return `
  <div class="admin-title">🏷 จัดการประเภทสินค้า</div>
  <div class="toolbar">
    <input class="search-input" placeholder="ค้นหาประเภท..." oninput="filterAdminTable(this.value,'catTable')">
    <button class="btn btn-primary" onclick="showAddCategory()">+ เพิ่มประเภท</button>
  </div>
  <div id="addCatPanel" style="display:none" class="form-panel">
    <div class="form-panel-title">เพิ่มประเภทสินค้าใหม่</div>
    <div class="form-grid">
      <div class="form-group"><label>ชื่อประเภท*</label><input id="ncName" placeholder="เช่น อุปกรณ์สำนักงาน"></div>
      <div class="form-group"><label>Emoji ไอคอน*</label><input id="ncEmoji" placeholder="🖊️" maxlength="4"></div>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" onclick="saveNewCategory()">💾 บันทึก</button>
      <button class="btn btn-ghost" onclick="document.getElementById('addCatPanel').style.display='none'">ยกเลิก</button>
    </div>
  </div>
  <div class="table-wrap">
    <table id="catTable"><thead><tr><th>ไอคอน</th><th>ประเภทสินค้า</th><th>จำนวนสินค้า</th><th>การจัดการ</th></tr></thead>
    <tbody>${CATEGORIES.map(c => `
      <tr>
        <td style="font-size:1.5rem">${EMOJIS[c]}</td>
        <td>${c}</td>
        <td>${products.filter(p => p.cat === c).length} รายการ</td>
        <td class="action-cell">
          <button class="action-btn" onclick="editCategory('${c}')">✏️ แก้ไข</button>
          <button class="action-btn danger" onclick="deleteCategory('${c}')">🗑️ ลบ</button>
        </td>
      </tr>`).join('')}
    </tbody></table>
  </div>`;
}

function showAddCategory() {
  document.getElementById('addCatPanel').style.display = 'block';
}

function saveNewCategory() {
  const name  = document.getElementById('ncName').value.trim();
  const emoji = document.getElementById('ncEmoji').value.trim() || '🏷';
  if (!name) { toast('กรุณากรอกชื่อประเภท', 'error'); return; }
  if (CATEGORIES.includes(name)) { toast('ประเภทนี้มีอยู่แล้ว', 'error'); return; }
  CATEGORIES.push(name);
  EMOJIS[name] = emoji;
  CAT_IMGS[name] = CAT_IMGS[name] || '';
  renderAdminTab('categories');
  toast('เพิ่มประเภทสินค้าแล้ว', 'success');
}

function editCategory(c) {
  const n = prompt('ชื่อประเภท:', c);
  if (!n || n === c) return;
  const e = prompt('Emoji ไอคอน:', EMOJIS[c] || '🏷');
  const idx = CATEGORIES.indexOf(c);
  if (idx !== -1) {
    CATEGORIES[idx] = n;
    EMOJIS[n] = e || EMOJIS[c];
    delete EMOJIS[c];
    // อัพเดทสินค้าที่อยู่ในประเภทเดิม
    products.forEach(p => { if (p.cat === c) p.cat = n; });
  }
  renderAdminTab('categories');
  toast('แก้ไขประเภทแล้ว', 'success');
}

function deleteCategory(c) {
  const count = products.filter(p => p.cat === c).length;
  if (count > 0) {
    if (!confirm(`ประเภท "${c}" มีสินค้าอยู่ ${count} รายการ\nถ้าลบจะทำให้สินค้าเหล่านั้นไม่มีประเภท\nยืนยันการลบ?`)) return;
  } else {
    if (!confirm(`ยืนยันการลบประเภท "${c}"?`)) return;
  }
  const idx = CATEGORIES.indexOf(c);
  if (idx !== -1) CATEGORIES.splice(idx, 1);
  delete EMOJIS[c];
  renderAdminTab('categories');
  toast('ลบประเภทแล้ว');
}

// --- Orders Admin ---
function ordersAdminHtml() {
  setTimeout(loadAdminOrders, 100);
  return `
  <div class="admin-title">🛒 จัดการออเดอร์</div>
  <div class="toolbar">
    <input class="search-input" placeholder="ค้นหาหมายเลขออเดอร์ / ลูกค้า..." oninput="filterAdminTable(this.value,'orderTable')">
    <button class="btn" onclick="exportOrdersCSV()" style="background:#1a3a1a;color:#4caf50;border:1px solid #4caf50;font-weight:600">📥 Export CSV</button>
  </div>
  <div class="table-wrap">
    <table id="orderTable"><thead><tr><th>หมายเลข</th><th>วันที่</th><th>ลูกค้า</th><th>รายการ</th><th>ยอดรวม</th><th>ชำระ</th><th>สถานะ</th><th>การจัดการ</th></tr></thead>
    <tbody id="orderTableBody"><tr><td colspan="8" style="text-align:center;padding:2rem">⏳ กำลังโหลด...</td></tr></tbody></table>
  </div>`;
}

async function loadAdminOrders() {
  try {
    const res = await adminFetch({ action: 'get_all_orders' });
    const result = await res.json();
    const rows = result.ok ? result.orders : [];
    const tbody = document.getElementById('orderTableBody');
    if (!tbody) return;
    if (rows.length === 0) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem">ยังไม่มีออเดอร์</td></tr>'; return; }
    tbody.innerHTML = rows.map(o => '<tr>' +
      '<td><strong>' + o.id + '</strong></td><td>' + o.date + '</td><td>' + (o.user_name || '-') + '</td>' +
      '<td style="font-size:.8rem;color:var(--text2)">' + o.items.map(i => i.emoji + i.name + ' x' + i.qty).join(', ') + '</td>' +
      '<td>฿' + Number(o.total).toLocaleString() + '</td><td>' + paymentTh(o.payment) + '</td>' +
      '<td><span class="status-badge status-' + o.status + '">' + statusTh(o.status) + '</span></td>' +
      '<td class="action-cell"><select onchange="changeOrderStatus(\'' + o.id + '\',this.value)" style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:.25rem .5rem;color:var(--text);font-size:.78rem">' +
      ['pending','packing','shipped','done','cancel'].map(s => '<option value="' + s + '" ' + (o.status===s?'selected':'') + '>' + statusTh(s) + '</option>').join('') +
      '</select></td></tr>'
    ).join('');
  } catch(e) {
    const tbody = document.getElementById('orderTableBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:red">โหลดข้อมูลไม่สำเร็จ</td></tr>';
  }
}

async function changeOrderStatus(id, s) {
  await adminFetch({ action: 'update_order_status', orderId: id, status: s });
  toast('อัพเดทสถานะออเดอร์แล้ว', 'success');
}

async function exportOrdersCSV() {
  try {
    const res = await adminFetch({ action: 'get_all_orders' });
    const result = await res.json();
    if (!result.ok) { toast('โหลดข้อมูลไม่สำเร็จ', 'error'); return; }
    const rows = result.orders || [];
    const headers = ['หมายเลข', 'วันที่', 'ลูกค้า', 'รายการสินค้า', 'ยอดรวม', 'ชำระ', 'สถานะ'];
    const csvRows = rows.map(o => [
      o.id, o.date, o.user_name || '',
      o.items.map(i => i.name + ' x' + i.qty).join(' | '),
      o.total,
      { transfer: 'โอนเงิน', cod: 'เก็บปลายทาง', promptpay: 'PromptPay' }[o.payment] || o.payment || '',
      { pending:'รอดำเนินการ', packing:'กำลังแพ็ค', shipped:'จัดส่งแล้ว', done:'สำเร็จ', cancel:'ยกเลิก' }[o.status] || o.status
    ].map(v => '"' + String(v).replace(/"/g, '""') + '"'));
    const csv = [headers, ...csvRows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'orders_' + new Date().toISOString().slice(0,10) + '.csv'; a.click();
    URL.revokeObjectURL(url);
    toast('📥 Export สำเร็จ! เปิดใน Excel ได้เลย', 'success');
  } catch(e) {
    toast('Export ไม่สำเร็จ', 'error');
  }
}

// --- Customers Admin ---
function customersAdminHtml() {
  setTimeout(loadAdminCustomers, 100);
  return `
  <div class="admin-title">👥 จัดการลูกค้า</div>
  <div class="toolbar">
    <input class="search-input" placeholder="ค้นหาชื่อ / อีเมล..." oninput="filterAdminTable(this.value,'custTable')">
  </div>
  <div class="table-wrap">
    <table id="custTable"><thead><tr><th>ชื่อ</th><th>อีเมล</th><th>เบอร์โทร</th><th>วันที่สมัคร</th><th>การจัดการ</th></tr></thead>
    <tbody id="custTableBody"><tr><td colspan="5" style="text-align:center;padding:2rem">⏳ กำลังโหลด...</td></tr></tbody></table>
  </div>

  <!-- Edit Customer Modal -->
  <div class="modal-backdrop" id="editCustModal">
    <div class="modal" style="max-width:480px">
      <div class="modal-header">
        <strong>✏️ แก้ไขข้อมูลลูกค้า</strong>
        <button class="close-btn" onclick="closeEditCustModal()">✕</button>
      </div>
      <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1rem">
        <input type="hidden" id="editCustId">
        <div class="form-group"><label>ชื่อ-นามสกุล</label><input id="editCustName" placeholder="ชื่อ-นามสกุล"></div>
        <div class="form-group"><label>อีเมล</label><input id="editCustEmail" type="email" placeholder="อีเมล"></div>
        <div class="form-group"><label>เบอร์โทรศัพท์</label><input id="editCustPhone" placeholder="เบอร์โทร"></div>
        <div class="form-group"><label>ที่อยู่</label><input id="editCustAddr" placeholder="ที่อยู่"></div>
        <div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:.5rem">
          <button class="btn btn-ghost" onclick="closeEditCustModal()">ยกเลิก</button>
          <button class="btn btn-primary" onclick="saveEditCustomer()">💾 บันทึก</button>
        </div>
      </div>
    </div>
  </div>`;
}

async function loadAdminCustomers() {
  try {
    const res = await adminFetch({ action: 'get_all_users' });
    const result = await res.json();
    const rows = result.ok ? result.users : [];
    const tbody = document.getElementById('custTableBody');
    if (!tbody) return;
    if (rows.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem">ยังไม่มีลูกค้า</td></tr>'; return; }
    tbody.innerHTML = rows.map(u =>
      `<tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.phone || '-'}</td>
        <td>${u.joined}</td>
        <td class="action-cell">
          <button class="action-btn" onclick='openEditCustModal(${JSON.stringify(u)})'>✏️ แก้ไข</button>
          <button class="action-btn danger" onclick="deleteCustomer(${u.id})">🗑️ ลบ</button>
        </td>
      </tr>`
    ).join('');
    initDataTable('custTable', { columnDefs: [{ orderable: false, targets: [4] }] });
  } catch(e) {
    const tbody = document.getElementById('custTableBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red">โหลดข้อมูลไม่สำเร็จ</td></tr>';
  }
}

function openEditCustModal(u) {
  document.getElementById('editCustId').value    = u.id;
  document.getElementById('editCustName').value  = u.name  || '';
  document.getElementById('editCustEmail').value = u.email || '';
  document.getElementById('editCustPhone').value = u.phone || '';
  document.getElementById('editCustAddr').value  = u.address || '';
  document.getElementById('editCustModal').classList.add('open');
}

function closeEditCustModal() {
  document.getElementById('editCustModal').classList.remove('open');
}

async function saveEditCustomer() {
  const id    = document.getElementById('editCustId').value;
  const name  = document.getElementById('editCustName').value.trim();
  const email = document.getElementById('editCustEmail').value.trim();
  const phone = document.getElementById('editCustPhone').value.trim();
  const addr  = document.getElementById('editCustAddr').value.trim();
  if (!name || !email) { toast('กรุณากรอกชื่อและอีเมล', 'error'); return; }
  try {
    const res = await adminFetch({ action: 'admin_update_user', id, name, email, phone, address: addr });
    const result = await res.json();
    if (!result.ok) { toast(result.msg || 'เกิดข้อผิดพลาด', 'error'); return; }
    closeEditCustModal();
    loadAdminCustomers();
    toast('แก้ไขข้อมูลลูกค้าแล้ว', 'success');
  } catch(e) {
    toast('เชื่อมต่อไม่ได้', 'error');
  }
}

function deleteCustomer(id) {
  if (!confirm('ยืนยันการลบลูกค้า?')) return;
  adminFetch({ action: 'delete_user', id: id });
  loadAdminCustomers();
  toast('ลบลูกค้าแล้ว');
}


// --- Helpers ---
function statusTh(s) {
  return { pending: 'รอดำเนินการ', packing: 'กำลังแพ็ค', shipped: 'จัดส่งแล้ว', done: 'สำเร็จ', cancel: 'ยกเลิก' }[s] || s;
}

function paymentTh(s) {
  return { transfer: '💸 โอนเงิน', cod: '📦 เก็บปลายทาง', promptpay: '📱 PromptPay' }[s] || s || '-';
}

function filterAdminTable(val, tableId) {
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  rows.forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(val.toLowerCase()) ? '' : 'none';
  });
}