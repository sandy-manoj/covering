const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./src/models/Admin');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const Banner = require('./src/models/Banner');
const Settings = require('./src/models/Settings');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gold_covering_shop';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing
    await Admin.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Banner.deleteMany({});
    await Settings.deleteMany({});

    // 1. Create Default Admin
    const admin = new Admin({
      name: 'Super Admin',
      email: 'admin@goldcoveringshop.com',
      password: 'admin123@Password',
      role: 'superadmin'
    });
    await admin.save();
    console.log('Admin user created (admin@goldcoveringshop.com / admin123@Password)');

    // 2. Create Categories
    const categories = await Category.insertMany([
      { name: 'Traditional Chains', slug: 'traditional-chains', description: 'Classic South Indian traditional micro-gold plated chains', displayOrder: 1 },
      { name: 'Mugappu Chains', slug: 'mugappu-chains', description: 'Chains with ornate peacock, mango and floral side motifs', displayOrder: 2 },
      { name: 'Rope & Box Chains', slug: 'rope-box-chains', description: 'Daily wear sturdy high-polish gold plated chains', displayOrder: 3 },
      { name: 'Bridal Rental Chains', slug: 'bridal-rental-chains', description: 'Heavy wedding bridal haram and chain sets available for rent', displayOrder: 4 },
      { name: 'Customized Name Chains', slug: 'customized-chains', description: 'Personalized letter and pendant name chains', displayOrder: 5 }
    ]);
    console.log('Categories created:', categories.length);

    // 3. Create Settings
    await Settings.create({
      shopName: 'Chidambaram Sri Thanga Covering',
      tagline: '1 Gram Pure Micro Gold Plated Chains & Bridal Rental Jewellery',
      whatsappNumber: '919876543210',
      contactPhone: '+91 98765 43210',
      contactEmail: 'order@chidambaramcovering.com',
      address: {
        street: '144/2, Car Street, Near Natarajar Temple',
        city: 'Chidambaram',
        state: 'Tamil Nadu',
        pincode: '608001'
      },
      shippingNotice: '✨ Special Festival Offer: Flat 20% OFF on Traditional Chains | Free Shipping above ₹999'
    });

    // 4. Create Banners
    await Banner.insertMany([
      {
        title: 'Chidambaram 1-Gram Gold Covering Chains',
        subtitle: 'Unmatched 24K Micro Gold Plating that looks and feels just like pure gold',
        badge: 'NEW FESTIVE COLLECTION',
        image: '/images/products/chain_1.jpg',
        linkUrl: '/shop',
        buttonText: 'Shop All Chains',
        displayOrder: 1
      },
      {
        title: 'Grand Bridal Rental Jewellery Sets',
        subtitle: 'Look majestic on your wedding day at just a fraction of the cost. Daily and weekly rentals.',
        badge: 'RENT FOR WEDDINGS',
        image: '/images/products/chain_5.jpg',
        linkUrl: '/rent',
        buttonText: 'Browse Rental Chains',
        displayOrder: 2
      }
    ]);

    // 5. Create 15 Authentic Chain Products from WhatsApp Assets
    const chainItems = [
      {
        name: 'Chidambaram Micro Plated Thick Rope Chain',
        productCode: 'GC-ROPE-01',
        category: categories[2]._id,
        categoryName: 'Rope & Box Chains',
        description: 'Authentic Chidambaram hand-crafted micro gold plated thick rope chain. Features high-shine diamond cut links with 1-year guarantee on gold polish.',
        type: 'Both',
        images: ['/images/products/chain_1.jpg', '/images/products/chain_2.jpg'],
        specs: { length: '24 inches', weight: '32 grams', thickness: '4 mm', style: 'Rope', plating: '1 Gram 24K Micro Gold Plated' },
        price: 1850,
        hasOffer: true,
        offerPrice: 1399,
        rental: { pricePerDay: 150, pricePerWeek: 600, deposit: 800, isAvailable: true },
        customizable: { isCustomizable: true, extraPrice: 250 },
        isFeatured: true,
        isBestSeller: true,
        stock: 15
      },
      {
        name: 'Royal Mayil Peacock Double Mugappu Chain',
        productCode: 'GC-MUG-02',
        category: categories[1]._id,
        categoryName: 'Mugappu Chains',
        description: 'Graceful side peacock (Mayil) mugappu chain studded with micro Kemp ruby stones and emerald accents. Perfect match for silk sarees.',
        type: 'Both',
        images: ['/images/products/chain_2.jpg', '/images/products/chain_3.jpg'],
        specs: { length: '22 inches', weight: '28 grams', thickness: '3.5 mm', style: 'Mugappu', plating: 'Micro Gold with Kemp Stones' },
        price: 2200,
        hasOffer: true,
        offerPrice: 1699,
        rental: { pricePerDay: 180, pricePerWeek: 750, deposit: 1000, isAvailable: true },
        customizable: { isCustomizable: true, extraPrice: 200 },
        isFeatured: true,
        isNewArrival: true,
        stock: 12
      },
      {
        name: 'Traditional Kerala Palakka Motif Long Chain',
        productCode: 'GC-TRAD-03',
        category: categories[0]._id,
        categoryName: 'Traditional Chains',
        description: 'Antique style gold covering long chain with temple craftsmanship. Ideal for auspicious poojas and wedding celebrations.',
        type: 'Both',
        images: ['/images/products/chain_3.jpg', '/images/products/chain_4.jpg'],
        specs: { length: '26 inches', weight: '45 grams', thickness: '5 mm', style: 'Traditional', plating: '24K Matte & Antique Gold Plating' },
        price: 2750,
        hasOffer: false,
        offerPrice: 0,
        rental: { pricePerDay: 250, pricePerWeek: 990, deposit: 1200, isAvailable: true },
        customizable: { isCustomizable: false },
        isFeatured: true,
        stock: 8
      },
      {
        name: 'Classic Men & Women Figaro Heavy Chain',
        productCode: 'GC-FIG-04',
        category: categories[2]._id,
        categoryName: 'Rope & Box Chains',
        description: 'High-density figaro link pattern with reinforced S-hook clasp. Durable micro plating resistant to daily sweat and water exposure.',
        type: 'Buy',
        images: ['/images/products/chain_4.jpg', '/images/products/chain_5.jpg'],
        specs: { length: '20 inches', weight: '22 grams', thickness: '3 mm', style: 'Figaro', plating: 'Electroplated 1 Gram Polish' },
        price: 1450,
        hasOffer: true,
        offerPrice: 1099,
        rental: { pricePerDay: 0, pricePerWeek: 0, deposit: 0, isAvailable: false },
        customizable: { isCustomizable: true, extraPrice: 200 },
        isBestSeller: true,
        stock: 20
      },
      {
        name: 'Bridal Grand Temple Haram Chain Set',
        productCode: 'GC-RENT-05',
        category: categories[3]._id,
        categoryName: 'Bridal Rental Chains',
        description: 'Magnificent heavy bridal Lakshmi coin and mango haram chain. Specially curated for grand wedding receptions and temple functions.',
        type: 'Rent',
        images: ['/images/products/chain_5.jpg', '/images/products/chain_6.jpg'],
        specs: { length: '28 inches', weight: '95 grams', thickness: '12 mm', style: 'Traditional', plating: 'Royal Wedding Micro Gold Plating' },
        price: 4500,
        hasOffer: false,
        offerPrice: 0,
        rental: { pricePerDay: 450, pricePerWeek: 1800, deposit: 2500, isAvailable: true },
        customizable: { isCustomizable: false },
        isFeatured: true,
        isNewArrival: true,
        stock: 5
      },
      {
        name: 'Spiga Wheat Link Flexible Gold Plated Chain',
        productCode: 'GC-SPIG-06',
        category: categories[2]._id,
        categoryName: 'Rope & Box Chains',
        description: 'Intricately braided wheat link chain that drapes seamlessly around the collarbone. Highly flexible and comfortable.',
        type: 'Both',
        images: ['/images/products/chain_6.jpg', '/images/products/chain_7.jpg'],
        specs: { length: '22 inches', weight: '26 grams', thickness: '3.2 mm', style: 'Spiga Wheat', plating: 'Micro 24K Yellow Gold Finish' },
        price: 1650,
        hasOffer: true,
        offerPrice: 1250,
        rental: { pricePerDay: 130, pricePerWeek: 500, deposit: 700, isAvailable: true },
        customizable: { isCustomizable: true, extraPrice: 250 },
        stock: 14
      },
      {
        name: 'Floral Mogappu Daily Wear Sleek Chain',
        productCode: 'GC-MUG-07',
        category: categories[1]._id,
        categoryName: 'Mugappu Chains',
        description: 'Delicate floral design mugappu side pendant with cubic zirconia stones embedded in micro-gold finish.',
        type: 'Buy',
        images: ['/images/products/chain_7.jpg', '/images/products/chain_8.jpg'],
        specs: { length: '18 inches', weight: '18 grams', thickness: '2.5 mm', style: 'Mugappu', plating: 'Micro Gold Plated' },
        price: 1299,
        hasOffer: true,
        offerPrice: 949,
        rental: { pricePerDay: 0, pricePerWeek: 0, deposit: 0, isAvailable: false },
        customizable: { isCustomizable: true, extraPrice: 200 },
        stock: 18
      },
      {
        name: 'Antique Guttapusalu Pearl Bead Chain',
        productCode: 'GC-TRAD-08',
        category: categories[0]._id,
        categoryName: 'Traditional Chains',
        description: 'South Indian heritage Guttapusalu chain with delicate pearl clusters and 1-gram micro gold plating.',
        type: 'Both',
        images: ['/images/products/chain_8.jpg', '/images/products/chain_9.jpg'],
        specs: { length: '20 inches', weight: '36 grams', thickness: '6 mm', style: 'Traditional', plating: 'Antique Gold with Culture Pearls' },
        price: 2400,
        hasOffer: false,
        offerPrice: 0,
        rental: { pricePerDay: 220, pricePerWeek: 850, deposit: 1100, isAvailable: true },
        customizable: { isCustomizable: false },
        isBestSeller: true,
        stock: 9
      },
      {
        name: 'Sleek Italian Box Chain with Gloss Finish',
        productCode: 'GC-BOX-09',
        category: categories[2]._id,
        categoryName: 'Rope & Box Chains',
        description: 'Geometric square box link chain with high mirror polish. Smooth edges prevent hair catching.',
        type: 'Buy',
        images: ['/images/products/chain_9.jpg', '/images/products/chain_10.jpg'],
        specs: { length: '22 inches', weight: '20 grams', thickness: '2.8 mm', style: 'Box', plating: '1 Gram Micro Polish' },
        price: 1350,
        hasOffer: true,
        offerPrice: 999,
        rental: { pricePerDay: 0, pricePerWeek: 0, deposit: 0, isAvailable: false },
        customizable: { isCustomizable: true, extraPrice: 150 },
        stock: 25
      },
      {
        name: 'Rudraksha Mala Gold Covering Chain',
        productCode: 'GC-RUD-10',
        category: categories[0]._id,
        categoryName: 'Traditional Chains',
        description: 'Authentic 5-Mukhi Rudraksha beads capped in 1-gram gold covering wire work. Devotional and spiritual styling.',
        type: 'Both',
        images: ['/images/products/chain_10.jpg', '/images/products/chain_11.jpg'],
        specs: { length: '26 inches', weight: '38 grams', thickness: '7 mm', style: 'Traditional', plating: 'Pure Gold Cap Wire Covering' },
        price: 1950,
        hasOffer: true,
        offerPrice: 1550,
        rental: { pricePerDay: 160, pricePerWeek: 650, deposit: 900, isAvailable: true },
        customizable: { isCustomizable: false },
        stock: 11
      },
      {
        name: 'Custom Name Initial Pendant Gold Chain',
        productCode: 'GC-CUST-11',
        category: categories[4]._id,
        categoryName: 'Customized Name Chains',
        description: 'Personalized handcrafted name or alphabet chain. Choose your favorite font and letters for a bespoke gold covering jewel.',
        type: 'Buy',
        images: ['/images/products/chain_11.jpg', '/images/products/chain_12.jpg'],
        specs: { length: '18 inches', weight: '16 grams', thickness: '2 mm', style: 'Custom Initial', plating: '1 Gram High Gloss Gold' },
        price: 1500,
        hasOffer: true,
        offerPrice: 1199,
        rental: { pricePerDay: 0, pricePerWeek: 0, deposit: 0, isAvailable: false },
        customizable: { isCustomizable: true, extraPrice: 0 },
        isFeatured: true,
        stock: 30
      },
      {
        name: 'Heavy Curb Cuban Link Chain for Men',
        productCode: 'GC-CURB-12',
        category: categories[2]._id,
        categoryName: 'Rope & Box Chains',
        description: 'Bold flat cuban curb links with solid weight and feel. Electroplated with double lacquer coat.',
        type: 'Both',
        images: ['/images/products/chain_12.jpg', '/images/products/chain_13.jpg'],
        specs: { length: '24 inches', weight: '52 grams', thickness: '6 mm', style: 'Curb', plating: 'Heavy Micro Gold Polish' },
        price: 2350,
        hasOffer: false,
        offerPrice: 0,
        rental: { pricePerDay: 200, pricePerWeek: 800, deposit: 1000, isAvailable: true },
        customizable: { isCustomizable: false },
        stock: 10
      },
      {
        name: 'Bridal Kasu Mala Coin Chain Rental',
        productCode: 'GC-RENT-13',
        category: categories[3]._id,
        categoryName: 'Bridal Rental Chains',
        description: 'Traditional Kasu malai featuring Lakshmi coins aligned edge to edge. Royal wedding jewelry for brides.',
        type: 'Rent',
        images: ['/images/products/chain_13.jpg', '/images/products/chain_14.jpg'],
        specs: { length: '26 inches', weight: '80 grams', thickness: '10 mm', style: 'Traditional', plating: 'Antique Temple Gold' },
        price: 4200,
        hasOffer: false,
        offerPrice: 0,
        rental: { pricePerDay: 400, pricePerWeek: 1600, deposit: 2200, isAvailable: true },
        customizable: { isCustomizable: false },
        isFeatured: true,
        stock: 4
      },
      {
        name: 'Twisted Singapore Spiral Chain',
        productCode: 'GC-SING-14',
        category: categories[2]._id,
        categoryName: 'Rope & Box Chains',
        description: 'Sparkling wave singapore chain that twists naturally as light reflects off the diamond-etched facets.',
        type: 'Buy',
        images: ['/images/products/chain_14.jpg', '/images/products/chain_15.jpg'],
        specs: { length: '20 inches', weight: '19 grams', thickness: '2.6 mm', style: 'Singapore', plating: 'Micro 24K Plated' },
        price: 1399,
        hasOffer: true,
        offerPrice: 999,
        rental: { pricePerDay: 0, pricePerWeek: 0, deposit: 0, isAvailable: false },
        customizable: { isCustomizable: true, extraPrice: 150 },
        stock: 20
      },
      {
        name: 'Ganga Yamuna Two-Tone Filigree Chain',
        productCode: 'GC-TWO-15',
        category: categories[0]._id,
        categoryName: 'Traditional Chains',
        description: 'Exquisite two-tone gold and rhodium silver finish filigree chain, crafted using ancient goldsmithing techniques.',
        type: 'Both',
        images: ['/images/products/chain_15.jpg', '/images/products/chain_1.jpg'],
        specs: { length: '22 inches', weight: '30 grams', thickness: '4 mm', style: 'Traditional', plating: 'Two-Tone 1-Gram Plated' },
        price: 2100,
        hasOffer: true,
        offerPrice: 1650,
        rental: { pricePerDay: 170, pricePerWeek: 700, deposit: 950, isAvailable: true },
        customizable: { isCustomizable: false },
        isNewArrival: true,
        stock: 12
      }
    ];

    await Product.insertMany(chainItems);
    console.log(`Successfully seeded ${chainItems.length} products with WhatsApp real photos!`);

    await mongoose.disconnect();
    console.log('Seeding finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();

