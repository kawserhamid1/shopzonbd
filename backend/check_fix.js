require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function checkAndFix() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check admin
    const Admin = mongoose.model('Admin', new mongoose.Schema({
      name: String, email: String, password: String
    }));
    
    const admin = await Admin.findOne({ email: 'kawser@shopzone.com' });
    if (admin) {
      console.log('✅ Admin found:', admin.email);
      // Check password
      const valid = bcrypt.compareSync('Admin@ShopZone2025', admin.password);
      console.log('Password valid:', valid);
    } else {
      console.log('❌ Admin not found!');
      console.log('Seeding admin...');
      await Admin.create({
        name: 'Kawsar',
        email: 'kawser@shopzone.com',
        password: bcrypt.hashSync('Admin@ShopZone2025', 10)
      });
      console.log('✅ Admin seeded');
    }

    // Check orders
    const Order = mongoose.model('Order', new mongoose.Schema({
      id: String, status: String, createdAt: Date
    }, { timestamps: true }));

    const ordersWithoutDate = await Order.countDocuments({ createdAt: { $exists: false } });
    console.log('\nOrders without createdAt:', ordersWithoutDate);

    if (ordersWithoutDate > 0) {
      console.log('Fixing...');
      const stale = await Order.find({ createdAt: { $exists: false } });
      for (const o of stale) {
        o.createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        await o.save();
      }
      console.log('✅ Fixed', stale.length, 'orders');
    }

    // Check orders with processing status from seed
    const processingOrders = await Order.find({ status: 'processing' }).limit(3);
    console.log('\nSample processing orders:');
    processingOrders.forEach(o => console.log(' ', o.id, o.status, o.createdAt));

    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

checkAndFix();
