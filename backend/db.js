require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { Product, Customer, Order, RegisteredUser, Admin } = require('./models');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Atlas connected');
    await seedData();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

async function seedData() {
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    await Admin.create({
      name:     'Kawsar',
      email:    process.env.ADMIN_EMAIL || 'kawser@shopzone.com',
      password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@ShopZone2025', 10)
    });
    console.log('✅ Admin seeded');
  }

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany([
      { name:'Sony WH-1000XM5 Headphones', sku:'SON-001', brand:'Sony',       category:'Electronics',    price:349.99, original_price:399.99, cost:180, stock:15, sold:234, rating:4.8, reviews:2847, badge:'Best Seller', image:'🎧', description:'Industry-leading noise canceling, 30hr battery.', tags:['wireless','bluetooth'] },
      { name:'iPhone 15 Pro Max 256GB',     sku:'APL-002', brand:'Apple',      category:'Electronics',    price:1199.00,original_price:1199.00,cost:750, stock:8,  sold:189, rating:4.9, reviews:5612, badge:'New',         image:'📱', description:'A17 Pro chip, 48MP camera.',               tags:['smartphone','5G'] },
      { name:'Nike Air Max 270',            sku:'NIK-003', brand:'Nike',       category:'Fashion',        price:89.99,  original_price:130.00, cost:42,  stock:22, sold:312, rating:4.6, reviews:3421, badge:'Sale',        image:'👟', description:'Max Air cushioning.',                     tags:['running','sport'] },
      { name:'Samsung 65 QLED 4K TV',       sku:'SAM-004', brand:'Samsung',    category:'Electronics',    price:899.00, original_price:1299.00,cost:520, stock:5,  sold:67,  rating:4.7, reviews:1893, badge:'30% Off',     image:'📺', description:'Quantum Dot, 120Hz.',                     tags:['4K','smart'] },
      { name:'Instant Pot Duo 7-in-1',      sku:'INS-005', brand:'Instant Pot',category:'Home & Kitchen', price:79.95,  original_price:99.95,  cost:35,  stock:30, sold:445, rating:4.8, reviews:8934, badge:'Best Seller', image:'🍲', description:'Pressure and slow cooker.',               tags:['cooking','kitchen'] },
      { name:'Levis 501 Original Jeans',    sku:'LEV-006', brand:'Levis',      category:'Fashion',        price:59.50,  original_price:69.50,  cost:22,  stock:40, sold:198, rating:4.5, reviews:2211, badge:null,          image:'👖', description:'Original straight fit.',                  tags:['denim','classic'] },
      { name:'Kindle Paperwhite 16GB',      sku:'AMZ-007', brand:'Amazon',     category:'Electronics',    price:139.99, original_price:159.99, cost:70,  stock:18, sold:276, rating:4.7, reviews:4521, badge:'Sale',        image:'📚', description:'Waterproof, glare-free.',                 tags:['ereader','reading'] },
      { name:'Dyson V15 Detect Vacuum',     sku:'DYS-008', brand:'Dyson',      category:'Home & Kitchen', price:649.99, original_price:749.99, cost:380, stock:10, sold:89,  rating:4.8, reviews:1234, badge:null,          image:'🔌', description:'Laser detects dust.',                     tags:['vacuum','cordless'] },
      { name:'LEGO Technic Bugatti',        sku:'LEG-009', brand:'LEGO',       category:'Toys & Games',   price:349.99, original_price:349.99, cost:160, stock:12, sold:54,  rating:4.9, reviews:876,  badge:'New',         image:'🏎️',description:'3599 pieces supercar.',               tags:['lego','building'] },
      { name:'Adidas Ultraboost 22',        sku:'ADI-010', brand:'Adidas',     category:'Fashion',        price:149.99, original_price:190.00, cost:65,  stock:25, sold:267, rating:4.7, reviews:2987, badge:'Sale',        image:'👟', description:'Responsive Boost midsole.',               tags:['running','boost'] },
      { name:'KitchenAid Stand Mixer',      sku:'KIT-011', brand:'KitchenAid', category:'Home & Kitchen', price:379.99, original_price:449.99, cost:200, stock:7,  sold:134, rating:4.9, reviews:6543, badge:'Best Seller', image:'🥣', description:'5-quart bowl, 10 speeds.',                tags:['baking','kitchen'] },
      { name:'MacBook Pro M3 14 inch',      sku:'APL-012', brand:'Apple',      category:'Electronics',    price:1599.00,original_price:1999.00,cost:980, stock:6,  sold:98,  rating:4.9, reviews:3210, badge:'20% Off',     image:'💻', description:'M3 chip, 18hr battery.',                 tags:['laptop','apple'] },
      { name:'Ray-Ban Wayfarer',            sku:'RAY-013', brand:'Ray-Ban',    category:'Fashion',        price:154.00, original_price:154.00, cost:60,  stock:35, sold:176, rating:4.7, reviews:1876, badge:null,          image:'🕶️',description:'Classic polarized lenses.',            tags:['sunglasses','uv'] },
      { name:'Monopoly Board Game',         sku:'HAS-014', brand:'Hasbro',     category:'Toys & Games',   price:24.99,  original_price:29.99,  cost:8,   stock:50, sold:389, rating:4.5, reviews:9876, badge:'Sale',        image:'🎲', description:'Classic property trading.',               tags:['boardgame','family'] },
      { name:'Vitamix E310 Blender',        sku:'VIT-015', brand:'Vitamix',    category:'Home & Kitchen', price:349.95, original_price:449.95, cost:180, stock:14, sold:112, rating:4.8, reviews:2341, badge:null,          image:'🥤', description:'Aircraft-grade blades.',                 tags:['blender','smoothie'] },
      { name:'PlayStation 5 Console',       sku:'SON-016', brand:'Sony',       category:'Electronics',    price:499.99, original_price:499.99, cost:380, stock:3,  sold:321, rating:4.9, reviews:7823, badge:'Hot',         image:'🎮', description:'4K gaming, DualSense.',                  tags:['gaming','4K'] },
    ]);
    console.log('✅ Products seeded (16)');
  }

  const customerCount = await Customer.countDocuments();
  if (customerCount === 0) {
    await Customer.insertMany([
      { name:'John Smith',    email:'john@example.com',  avatar_color:'#4f46e5', status:'active' },
      { name:'Sarah Johnson', email:'sarah@example.com', avatar_color:'#0891b2', status:'vip'    },
      { name:'Mike Brown',    email:'mike@example.com',  avatar_color:'#059669', status:'active' },
      { name:'Emily Davis',   email:'emily@example.com', avatar_color:'#dc2626', status:'active' },
      { name:'David Wilson',  email:'david@example.com', avatar_color:'#7c3aed', status:'vip'    },
      { name:'Lisa Wang',     email:'lisa@example.com',  avatar_color:'#db2777', status:'new'    },
    ]);
    console.log('✅ Customers seeded (6)');
  }

  const orderCount = await Order.countDocuments();
  if (orderCount === 0) {
    await Order.insertMany([
      { id:'ORD-001', customer_name:'John Smith',    customer_email:'john@example.com',  subtotal:969.97,  tax:77.60,  shipping_cost:0.40, total:1047.97, status:'delivered',  payment_method:'Credit Card', shipping_address:'123 Main St, NY' },
      { id:'ORD-002', customer_name:'Sarah Johnson', customer_email:'sarah@example.com', subtotal:1109.26, tax:88.74,  shipping_cost:0,    total:1199.00, status:'pending',    payment_method:'PayPal',       shipping_address:'456 Oak Ave, LA' },
      { id:'ORD-003', customer_name:'Mike Brown',    customer_email:'mike@example.com',  subtotal:406.94,  tax:32.55,  shipping_cost:0,    total:439.49,  status:'shipped',    payment_method:'Credit Card', shipping_address:'789 Pine Rd, TX' },
      { id:'ORD-004', customer_name:'Emily Davis',   customer_email:'emily@example.com', subtotal:166.64,  tax:13.33,  shipping_cost:0,    total:179.97,  status:'delivered',  payment_method:'Apple Pay',   shipping_address:'321 Elm St, FL' },
      { id:'ORD-005', customer_name:'David Wilson',  customer_email:'david@example.com', subtotal:2083.30, tax:166.67, shipping_cost:0,    total:2249.97, status:'delivered',  payment_method:'Credit Card', shipping_address:'555 Maple Dr, WA' },
      { id:'ORD-006', customer_name:'Lisa Wang',     customer_email:'lisa@example.com',  subtotal:397.98,  tax:31.84,  shipping_cost:0.16, total:429.98,  status:'pending',    payment_method:'PayPal',       shipping_address:'888 Cedar Ln, IL' },
    ]);
    console.log('✅ Orders seeded (6)');
  }

  // Fix orders without createdAt (legacy data)
  const ordersWithoutDate = await Order.countDocuments({ createdAt: { $exists: false } });
  if (ordersWithoutDate > 0) {
    console.log(`📅 Fixing ${ordersWithoutDate} orders without createdAt...`);
    const staleOrders = await Order.find({ createdAt: { $exists: false } });
    for (const o of staleOrders) {
      o.createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      await o.save();
    }
    console.log(`✅ ${ordersWithoutDate} orders updated with createdAt`);
  }

  console.log('\n🚀 Database ready on MongoDB Atlas!\n');
}

module.exports = { connectDB };
