// ===== DATA STORE =====
const CATEGORIES = ['เสื้อผ้า', 'อิเล็กทรอนิกส์', 'อาหาร & เครื่องดื่ม', 'ความงาม', 'บ้าน & ครัวเรือน', 'กีฬา', 'หนังสือ', 'ของเล่น & เด็ก', 'สัตว์เลี้ยง', 'ยานยนต์'];
const EMOJIS = {
  'เสื้อผ้า': '👗','อิเล็กทรอนิกส์': '💻','อาหาร & เครื่องดื่ม': '🍜',
  'ความงาม': '💄','บ้าน & ครัวเรือน': '🏠','กีฬา': '⚽',
  'หนังสือ': '📚','ของเล่น & เด็ก': '🧸','สัตว์เลี้ยง': '🐾','ยานยนต์': '🚗'
};
const CAT_IMGS = {
  'เสื้อผ้า': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80',
  'อิเล็กทรอนิกส์': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80',
  'อาหาร & เครื่องดื่ม': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80',
  'ความงาม': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
  'บ้าน & ครัวเรือน': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
  'กีฬา': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80',
  'หนังสือ': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
  'ของเล่น & เด็ก': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  'สัตว์เลี้ยง': 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=400&q=80',
  'ยานยนต์': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80'
};

let products = []; // โหลดจาก DB ผ่าน loadProducts()

async function loadProducts() {
  try {
    const res = await fetch('api.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_products' })
    });
    const result = await res.json();
    if (result.ok) {
      products = result.products.map(p => ({
        ...p,
        stock: p.stock != null ? parseInt(p.stock) : 99,
        oldPrice: p.old_price ?? p.oldPrice ?? null,
        desc: p.description ?? p.desc ?? '',
        sale: !!p.sale,
        imgs: p.imgs || (p.img ? [p.img] : [])
      }));
    }
  } catch(e) {
    console.error('loadProducts error:', e);
  }
}

// users และ orders ดึงจาก DB ผ่าน api.php แล้ว
// ไม่ใช้ mock data อีกต่อไป
let users = [];
let orders = [];

let cart = [];
let currentUser = null;
let shopFilter = { cat: '', search: '' };