// ===== CART MODULE =====

function addToCart(p, qty = 1) {
  if ((p.stock ?? 99) <= 0) { toast('สินค้าหมดแล้ว', 'error'); return; }
  const ex = cart.find(x => x.id === p.id);
  const inCart = ex ? ex.qty : 0;
  if (inCart + qty > (p.stock ?? 99)) {
    toast(`มีสินค้าในตะกร้าครบแล้ว (เหลือ ${p.stock} ชิ้น)`, 'error'); return;
  }
  if (ex) ex.qty += qty;
  else cart.push({ ...p, qty });
  renderCart();
  toast(`เพิ่ม "${p.name}" ลงตะกร้าแล้ว`, 'success');
}

function cartQty(id, d) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += d;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  renderCart();
}

function removeCart(id) {
  cart = cart.filter(x => x.id !== id);
  renderCart();
  toast('ลบสินค้าออกจากตะกร้าแล้ว');
}

function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
}

function goCheckout() {
  if (cart.length === 0) { toast('กรุณาเพิ่มสินค้าในตะกร้าก่อน', 'error'); return; }
  if (!currentUser) { openAuth('login'); return; }
  document.getElementById('cartSidebar').classList.remove('open');
  showPage('checkout');
}

function renderCart() {
  const count = cart.reduce((s, x) => s + x.qty, 0);
  document.getElementById('cartCount').textContent = count;
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
  document.getElementById('cartTotal').textContent = '฿' + total.toLocaleString();

  const el = document.getElementById('cartItems');
  if (cart.length === 0) {
    el.innerHTML = `<div class="empty-state"><div>🛒</div>ตะกร้าว่างเปล่า</div>`;
    return;
  }
  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">฿${item.price.toLocaleString()}</div>
        <div class="cart-item-qty">
          <button class="qty-btn sm" onclick="cartQty(${item.id},-1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn sm" onclick="cartQty(${item.id},1)">+</button>
          <button class="action-btn danger" onclick="removeCart(${item.id})">ลบ</button>
        </div>
      </div>
      <div class="cart-item-sub">฿${(item.price * item.qty).toLocaleString()}</div>
    </div>`).join('');
}

async function placeOrder() {
  const name = document.getElementById('ckName').value.trim();
  const addr = document.getElementById('ckAddr').value.trim();
  const phone = document.getElementById('ckPhone').value.trim();
  if (!name || !addr || !phone) { toast('กรุณากรอกข้อมูลให้ครบ', 'error'); return; }
  const payment = document.querySelector('input[name="payment"]:checked').value;
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const order = {
    id: 'ORD' + String(Date.now()).slice(-6),
    userId: currentUser.id,
    items: cart.map(i => ({ id: i.id, name: i.name, emoji: i.emoji, qty: i.qty, price: i.price })),
    total, status: 'pending',
    date: new Date().toISOString().slice(0, 10),
    address: addr, phone, payment
  };
  try {
    const res = await fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'order', ...order })
    });
    const result = await res.json();
    if (!result.ok) { toast('เกิดข้อผิดพลาดในการสั่งซื้อ', 'error'); return; }
    // ลดสต็อกสินค้า
    await fetch('api.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reduce_stock', items: order.items })
    });
    // อัพเดท stock ใน products array
    order.items.forEach(item => {
      const p = products.find(x => x.id === item.id);
      if (p) p.stock = Math.max(0, (p.stock || 0) - item.qty);
    });
    orders.push(order);
    cart = [];
    renderCart();
    toast('🎉 สั่งซื้อสำเร็จ! หมายเลข ' + order.id, 'success');
    showPage('profile');
  } catch (err) {
    toast('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
  }
}