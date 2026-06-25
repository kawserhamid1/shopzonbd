require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'db.json');

const DEFAULT_DATA = {
  admins: [{
    id: 1,
    name: 'Kawsar',
    email: 'kawser@shopzone.com',
    password: bcrypt.hashSync('Admin@ShopZone2025', 10)
  }],
  products: [
    { id:1,  name:'Sony WH-1000XM5 Headphones', sku:'SON-001', brand:'Sony',       category:'Electronics',    price:349.99, original_price:399.99, cost:180, stock:15, sold:234, rating:4.8, reviews:2847, badge:'Best Seller', image:'🎧', description:'Industry-leading noise canceling.', tags:['wireless','bluetooth'], status:'active' },
    { id:2,  name:'iPhone 15 Pro Max 256GB',     sku:'APL-002', brand:'Apple',      category:'Electronics',    price:1199.00,original_price:1199.00,cost:750, stock:8,  sold:189, rating:4.9, reviews:5612, badge:'New',         image:'📱', description:'A17 Pro chip, 48MP camera.',       tags:['smartphone','5G'],     status:'active' },
    { id:3,  name:'Nike Air Max 270',            sku:'NIK-003', brand:'Nike',       category:'Fashion',        price:89.99,  original_price:130.00, cost:42,  stock:22, sold:312, rating:4.6, reviews:3421, badge:'Sale',        image:'👟', description:'Max Air cushioning.',             tags:['running','sport'],     status:'active' },
    { id:4,  name:'Samsung 65 QLED 4K TV',       sku:'SAM-004', brand:'Samsung',    category:'Electronics',    price:899.00, original_price:1299.00,cost:520, stock:5,  sold:67,  rating:4.7, reviews:1893, badge:'30% Off',     image:'📺', description:'Quantum Dot, 120Hz.',             tags:['4K','smart'],          status:'active' },
    { id:5,  name:'Instant Pot Duo 7-in-1',      sku:'INS-005', brand:'Instant Pot',category:'Home & Kitchen', price:79.95,  original_price:99.95,  cost:35,  stock:30, sold:445, rating:4.8, reviews:8934, badge:'Best Seller', image:'🍲', description:'Pressure and slow cooker.',       tags:['cooking','kitchen'],   status:'active' },
    { id:6,  name:'Levis 501 Original Jeans',    sku:'LEV-006', brand:'Levis',      category:'Fashion',        price:59.50,  original_price:69.50,  cost:22,  stock:40, sold:198, rating:4.5, reviews:2211, badge:null,          image:'👖', description:'Original straight fit.',          tags:['denim','classic'],     status:'active' },
    { id:7,  name:'Kindle Paperwhite 16GB',      sku:'AMZ-007', brand:'Amazon',     category:'Electronics',    price:139.99, original_price:159.99, cost:70,  stock:18, sold:276, rating:4.7, reviews:4521, badge:'Sale',        image:'📖', description:'Waterproof, glare-free.',         tags:['ereader','reading'],   status:'active' },
    { id:8,  name:'Dyson V15 Detect Vacuum',     sku:'DYS-008', brand:'Dyson',      category:'Home & Kitchen', price:649.99, original_price:749.99, cost:380, stock:10, sold:89,  rating:4.8, reviews:1234, badge:null,          image:'🧹', description:'Laser detects dust.',             tags:['vacuum','cordless'],   status:'active' },
    { id:9,  name:'LEGO Technic Bugatti',        sku:'LEG-009', brand:'LEGO',       category:'Toys & Games',   price:349.99, original_price:349.99, cost:160, stock:12, sold:54,  rating:4.9, reviews:876,  badge:'New',         image:'🏎️', description:'3599 pieces supercar.',          tags:['lego','building'],     status:'active' },
    { id:10, name:'Adidas Ultraboost 22',        sku:'ADI-010', brand:'Adidas',     category:'Fashion',        price:149.99, original_price:190.00, cost:65,  stock:25, sold:267, rating:4.7, reviews:2987, badge:'Sale',        image:'👟', description:'Responsive Boost midsole.',       tags:['running','boost'],     status:'active' },
    { id:11, name:'KitchenAid Stand Mixer',      sku:'KIT-011', brand:'KitchenAid', category:'Home & Kitchen', price:379.99, original_price:449.99, cost:200, stock:7,  sold:134, rating:4.9, reviews:6543, badge:'Best Seller', image:'🍰', description:'5-quart bowl, 10 speeds.',        tags:['baking','kitchen'],    status:'active' },
    { id:12, name:'MacBook Pro M3 14 inch',      sku:'APL-012', brand:'Apple',      category:'Electronics',    price:1599.00,original_price:1999.00,cost:980, stock:6,  sold:98,  rating:4.9, reviews:3210, badge:'20% Off',     image:'💻', description:'M3 chip, 18hr battery.',         tags:['laptop','apple'],      status:'active' },
    { id:13, name:'Ray-Ban Wayfarer',            sku:'RAY-013', brand:'Ray-Ban',    category:'Fashion',        price:154.00, original_price:154.00, cost:60,  stock:35, sold:176, rating:4.7, reviews:1876, badge:null,          image:'🕶️', description:'Classic polarized lenses.',      tags:['sunglasses','uv'],     status:'active' },
    { id:14, name:'Monopoly Board Game',         sku:'HAS-014', brand:'Hasbro',     category:'Toys & Games',   price:24.99,  original_price:29.99,  cost:8,   stock:50, sold:389, rating:4.5, reviews:9876, badge:'Sale',        image:'🎲', description:'Classic property trading.',       tags:['boardgame','family'],  status:'active' },
    { id:15, name:'Vitamix E310 Blender',        sku:'VIT-015', brand:'Vitamix',    category:'Home & Kitchen', price:349.95, original_price:449.95, cost:180, stock:14, sold:112, rating:4.8, reviews:2341, badge:null,          image:'🥤', description:'Aircraft-grade blades.',          tags:['blender','smoothie'],  status:'active' },
    { id:16, name:'PlayStation 5 Console',       sku:'SON-016', brand:'Sony',       category:'Electronics',    price:499.99, original_price:499.99, cost:380, stock:3,  sold:321, rating:4.9, reviews:7823, badge:'Hot',         image:'🎮', description:'4K gaming, DualSense.',           tags:['gaming','4K'],         status:'active' }
  ],
  customers: [
    { id:1, name:'John Smith',    email:'john@example.com',  avatar_color:'#4f46e5', status:'active' },
    { id:2, name:'Sarah Johnson', email:'sarah@example.com', avatar_color:'#0891b2', status:'vip'    },
    { id:3, name:'Mike Brown',    email:'mike@example.com',  avatar_color:'#059669', status:'active' },
    { id:4, name:'Emily Davis',   email:'emily@example.com', avatar_color:'#dc2626', status:'active' },
    { id:5, name:'David Wilson',  email:'david@example.com', avatar_color:'#7c3aed', status:'vip'    },
    { id:6, name:'Lisa Wang',     email:'lisa@example.com',  avatar_color:'#db2777', status:'new'    }
  ],
  registered_users: [],
  orders: [
    { id:'ORD-001', customer_id:1, customer_name:'John Smith',    customer_email:'john@example.com',  subtotal:969.97,  tax:77.60,  shipping_cost:0.40, total:1047.97, status:'delivered',  payment_method:'Credit Card', created_at:'2025-06-14', items:[] },
    { id:'ORD-002', customer_id:2, customer_name:'Sarah Johnson', customer_email:'sarah@example.com', subtotal:1109.26, tax:88.74,  shipping_cost:0,    total:1199.00, status:'processing', payment_method:'PayPal',       created_at:'2025-06-14', items:[] },
    { id:'ORD-003', customer_id:3, customer_name:'Mike Brown',    customer_email:'mike@example.com',  subtotal:406.94,  tax:32.55,  shipping_cost:0,    total:439.49,  status:'shipped',    payment_method:'Credit Card', created_at:'2025-06-13', items:[] },
    { id:'ORD-004', customer_id:4, customer_name:'Emily Davis',   customer_email:'emily@example.com', subtotal:166.64,  tax:13.33,  shipping_cost:0,    total:179.97,  status:'delivered',  payment_method:'Apple Pay',   created_at:'2025-06-13', items:[] },
    { id:'ORD-005', customer_id:5, customer_name:'David Wilson',  customer_email:'david@example.com', subtotal:2083.30, tax:166.67, shipping_cost:0,    total:2249.97, status:'delivered',  payment_method:'Credit Card', created_at:'2025-06-12', items:[] },
    { id:'ORD-006', customer_id:6, customer_name:'Lisa Wang',     customer_email:'lisa@example.com',  subtotal:397.98,  tax:31.84,  shipping_cost:0.16, total:429.98,  status:'pending',    payment_method:'PayPal',       created_at:'2025-06-10', items:[] }
  ],
  next_customer_id: 7
};

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
    console.log('✅ db.json created');
  }
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  // Ensure registered_users exists (for existing db.json files)
  if (!data.registered_users) {
    data.registered_users = [];
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }
  return data;
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const DB = {
  getProducts(f = {}) {
    let p = readDB().products.filter(x => x.status === 'active');
    if (f.search)   p = p.filter(x => x.name.toLowerCase().includes(f.search.toLowerCase()) || x.brand.toLowerCase().includes(f.search.toLowerCase()));
    if (f.category && f.category !== 'All') p = p.filter(x => x.category === f.category);
    if (f.brand)    p = p.filter(x => x.brand === f.brand);
    if (f.min_price) p = p.filter(x => x.price >= +f.min_price);
    if (f.max_price) p = p.filter(x => x.price <= +f.max_price);
    const s = { popular:(a,b)=>b.sold-a.sold, price_low:(a,b)=>a.price-b.price, price_high:(a,b)=>b.price-a.price, rating:(a,b)=>b.rating-a.rating, newest:(a,b)=>b.id-a.id };
    p.sort(s[f.sort] || s.popular);
    return p.slice(0, +(f.limit||20));
  },
  getProduct(id) {
    return readDB().products.find(p => p.id == id || p.sku === id) || null;
  },
  updateProduct(id, data) {
    const db = readDB();
    const i = db.products.findIndex(p => p.id == id);
    if (i < 0) return null;
    db.products[i] = { ...db.products[i], ...data };
    writeDB(db); return db.products[i];
  },
  restockProduct(id, qty = 50) {
    const db = readDB();
    const i = db.products.findIndex(p => p.id == id);
    if (i < 0) return null;
    db.products[i].stock += +qty;
    writeDB(db); return db.products[i];
  },
  getOrders(f = {}) {
    let o = [...readDB().orders].sort((a,b) => new Date(b.created_at)-new Date(a.created_at));
    if (f.status && f.status !== 'all') o = o.filter(x => x.status === f.status);
    return o.slice(0, +(f.limit||50));
  },
  getOrder(id) { return readDB().orders.find(o => o.id === id) || null; },
  createOrder(data) {
    const db = readDB();
    const id = 'ORD-' + Date.now().toString(36).toUpperCase();
    if (data.items) data.items.forEach(item => {
      const i = db.products.findIndex(p => p.id == item.product_id);
      if (i >= 0) { db.products[i].stock = Math.max(0, db.products[i].stock - item.qty); db.products[i].sold += item.qty; }
    });
    let cust = db.customers.find(c => c.email === data.customer_email);
    if (!cust) {
      cust = { id: db.next_customer_id++, name: data.customer_name, email: data.customer_email, avatar_color:'#6366f1', status:'new' };
      db.customers.push(cust);
    }
    const order = { id, customer_id: cust.id, ...data, status:'processing', created_at: new Date().toISOString().split('T')[0] };
    if (data.payment_intent_id) order.payment_intent_id = data.payment_intent_id;
    if (data.payment_status) order.payment_status = data.payment_status;
    db.orders.push(order); writeDB(db); return order;
  },
  updateOrderStatus(id, status) {
    const db = readDB();
    const i = db.orders.findIndex(o => o.id === id);
    if (i < 0) return null;
    db.orders[i].status = status; writeDB(db); return db.orders[i];
  },
  getCustomers() {
    const db = readDB();
    return db.customers.map(c => {
      const orders = db.orders.filter(o => o.customer_id === c.id);
      return { ...c, order_count: orders.length, total_spent: +orders.reduce((s,o)=>s+o.total,0).toFixed(2), last_order: orders.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0]?.created_at || '-' };
    }).sort((a,b) => b.total_spent - a.total_spent);
  },
  getCustomer(id) {
    const db = readDB();
    const c = db.customers.find(c => c.id == id);
    if (!c) return null;
    return { ...c, orders: db.orders.filter(o => o.customer_id == id) };
  },
  getAdmin(email) { return readDB().admins.find(a => a.email === email) || null; },
  getAnalytics() {
    const db = readDB();
    const revenue = db.orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+o.total,0);
    const catProfit = {};
    db.products.forEach(p => { catProfit[p.category] = (catProfit[p.category]||0) + (p.price-p.cost)*p.sold; });
    const statusCounts = {};
    db.orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status]||0)+1; });
    return {
      revenue: +revenue.toFixed(2),
      orders: db.orders.length,
      customers: db.customers.length,
      products: db.products.length,
      top_products: [...db.products].sort((a,b)=>b.sold-a.sold).slice(0,5),
      category_profit: Object.entries(catProfit).map(([category,profit])=>({category,profit:Math.round(profit)})).sort((a,b)=>b.profit-a.profit),
      order_status: Object.entries(statusCounts).map(([status,count])=>({status,count}))
    };
  },
  getInventory() {
    const db = readDB();
    const p = [...db.products].sort((a,b)=>a.stock-b.stock);
    return {
      products: p,
      stats: {
        total_items: p.reduce((s,x)=>s+x.stock,0),
        cost_value: +p.reduce((s,x)=>s+x.cost*x.stock,0).toFixed(2),
        retail_value: +p.reduce((s,x)=>s+x.price*x.stock,0).toFixed(2),
        low_stock: p.filter(x=>x.stock<=8),
        critical: p.filter(x=>x.stock<=3)
      }
    };
  },

  // ── Registered User methods ──────────────────────────────────

  registerUser(data) {
    const db = readDB();
    const exists = db.registered_users.find(u => u.email === data.email);
    if (exists) return { error: 'Email already registered.' };
    const newUser = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || '',
      avatar_color: ['#4f46e5','#0891b2','#059669','#dc2626','#7c3aed','#db2777','#ea580c'][Math.floor(Math.random()*7)],
      created_at: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    db.registered_users.push(newUser);
    const custExists = db.customers.find(c => c.email === data.email);
    if (!custExists) {
      db.customers.push({
        id: db.next_customer_id++,
        name: data.name,
        email: data.email,
        avatar_color: newUser.avatar_color,
        status: 'new'
      });
    }
    writeDB(db);
    const { password, ...safeUser } = newUser;
    return safeUser;
  },

  loginUser(email, password) {
    const bcrypt = require('bcryptjs');
    const db = readDB();
    const user = db.registered_users.find(u => u.email === email);
    if (!user) return { error: 'No account found with this email.' };
    if (!bcrypt.compareSync(password, user.password)) return { error: 'Incorrect password.' };
    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  getUser(id) {
    const db = readDB();
    const user = db.registered_users.find(u => u.id == id);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  },

  updateUser(id, updates) {
    const db = readDB();
    const idx = db.registered_users.findIndex(u => u.id == id);
    if (idx < 0) return null;
    if (updates.password) {
      const bcrypt = require('bcryptjs');
      updates.password = bcrypt.hashSync(updates.password, 10);
    }
    db.registered_users[idx] = { ...db.registered_users[idx], ...updates };
    writeDB(db);
    const { password, ...safeUser } = db.registered_users[idx];
    return safeUser;
  },

  getUserOrders(email) {
    const db = readDB();
    return db.orders
      .filter(o => o.customer_email === email)
      .sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  }
};

readDB();
console.log('✅ Database ready');
module.exports = DB;