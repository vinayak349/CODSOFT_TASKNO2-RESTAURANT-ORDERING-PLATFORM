import { PrismaClient, Role, OrderStatus, PaymentStatus, PaymentProvider, FulfillmentType, ReservationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('🌱 Starting DineDesk database seed...');

  // 1. Password Hashes
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const kitchenPassword = await bcrypt.hash('Kitchen@12345', 10);
  const customerPassword = await bcrypt.hash('Customer@12345', 10);

  // 2. Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dinedesk.com' },
    update: {},
    create: {
      name: 'Executive Chef & General Manager',
      email: 'admin@dinedesk.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      phone: '+91 98765 00001',
    },
  });

  const kitchenUser = await prisma.user.upsert({
    where: { email: 'chef@dinedesk.com' },
    update: {},
    create: {
      name: 'Chef Rajesh Sharma (Head Kitchen)',
      email: 'chef@dinedesk.com',
      passwordHash: kitchenPassword,
      role: Role.KITCHEN,
      phone: '+91 98765 00002',
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@dinedesk.com' },
    update: {},
    create: {
      name: 'Aarav Patel',
      email: 'customer@dinedesk.com',
      passwordHash: customerPassword,
      role: Role.CUSTOMER,
      phone: '+91 98765 11223',
    },
  });

  console.log('✅ Seeded Users: Admin, Kitchen, Customer');

  // 3. Restaurant Settings
  await prisma.restaurantSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      restaurantName: 'DineDesk Bistro & Bar',
      tagline: 'Artisanal Flavors, Seamless Dining',
      address: '42 Gourmet Avenue, Indiranagar, Bengaluru, KA 560038',
      phone: '+91 98765 43210',
      email: 'concierge@dinedesk.com',
      currency: 'INR',
      currencySymbol: '₹',
      timezone: 'Asia/Kolkata',
      openingTime: '11:00',
      closingTime: '23:00',
      reservationDurationMins: 90,
      taxRatePercent: 5.0,
      deliveryFeeAmount: 40.0,
    },
  });

  console.log('✅ Seeded Restaurant Settings');

  // 4. Categories
  const categoriesData = [
    {
      name: 'Starters & Small Plates',
      slug: 'starters',
      description: 'Crispy appetizers, skewers, and delicate small bites to awaken your palate.',
      sortOrder: 1,
    },
    {
      name: 'Signature Mains & Curries',
      slug: 'mains',
      description: 'Slow-cooked rich gravies, slow dum preparations, and royal heritage specialties.',
      sortOrder: 2,
    },
    {
      name: 'Tandoor & Clay Oven Grills',
      slug: 'grills',
      description: 'Smoked, charcoal-roasted skewers marinated in freshly ground spices.',
      sortOrder: 3,
    },
    {
      name: 'Artisanal Breads & Biryanis',
      slug: 'breads-biryanis',
      description: 'Flaky leavened naan, tandoori rotis, and aromatic fragrant long-grain basmati biryanis.',
      sortOrder: 4,
    },
    {
      name: 'Decadent Desserts',
      slug: 'desserts',
      description: 'Traditional confections re-imagined with modern patisserie techniques.',
      sortOrder: 5,
    },
    {
      name: 'Craft Beverages & Coolers',
      slug: 'beverages',
      description: 'Refreshing botanical coolers, artisanal teas, and rich yogurt blends.',
      sortOrder: 6,
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);
  }

  console.log('✅ Seeded Categories');

  // 5. Menu Items
  const menuItems = [
    {
      name: 'Paneer Tikka Angaare',
      slug: 'paneer-tikka-angaare',
      description: 'Cottage cheese cubes marinated in Kashmiri red chili, hung curd, and stone-ground mustard, charred in the tandoor with bell peppers.',
      price: 345.0,
      imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 15,
      dietaryLabels: JSON.stringify(['Veg', 'Gluten-Free']),
      categoryId: categoryMap.get('starters')!,
    },
    {
      name: 'Truffle Sweet Corn Fritters',
      slug: 'truffle-sweet-corn-fritters',
      description: 'Golden sweet corn pearls tossed with cracked black pepper, fresh scallions, and infused with white truffle essence served with sriracha aioli.',
      price: 295.0,
      imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 12,
      dietaryLabels: JSON.stringify(['Veg', 'Chef Special']),
      categoryId: categoryMap.get('starters')!,
    },
    {
      name: 'Melt-in-Mouth Galouti Kebab',
      slug: 'galouti-kebab',
      description: 'Finely minced lamb smoked with cloves and infused with 24 secret Awadhi spices, pan-seared to melt on your tongue, served on mini saffron parathas.',
      price: 445.0,
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 20,
      dietaryLabels: JSON.stringify(['Non-Veg', 'Chef Special']),
      categoryId: categoryMap.get('starters')!,
    },
    {
      name: 'Dal Makhani Royale 24-Hour',
      slug: 'dal-makhani-royale',
      description: 'Black lentils slow-cooked overnight over charcoal embers, finished with white butter, vine-ripened tomato coulis, and artisanal fresh cream.',
      price: 395.0,
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 15,
      dietaryLabels: JSON.stringify(['Veg', 'Gluten-Free', 'Chef Special']),
      categoryId: categoryMap.get('mains')!,
    },
    {
      name: 'Old Delhi Butter Chicken',
      slug: 'old-delhi-butter-chicken',
      description: 'Boneless tandoori chicken simmered in an indulgent satin sauce of butter, fresh tomatoes, fenugreek leaves (kasoori methi), and honey.',
      price: 485.0,
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 20,
      dietaryLabels: JSON.stringify(['Non-Veg', 'Chef Special']),
      categoryId: categoryMap.get('mains')!,
    },
    {
      name: 'Smoked Paneer Lababdar',
      slug: 'smoked-paneer-lababdar',
      description: 'Fresh malai paneer steeped in a chunky onion, tomato, and cashew nut gravy enriched with grated cottage cheese and freshly ground mace.',
      price: 425.0,
      imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 15,
      dietaryLabels: JSON.stringify(['Veg', 'Gluten-Free']),
      categoryId: categoryMap.get('mains')!,
    },
    {
      name: 'Kashmiri Rogan Josh',
      slug: 'kashmiri-rogan-josh',
      description: 'Tender baby lamb cuts braised in aromatic shallots, Ratan Jot (alkanet root) for deep crimson hue, Kashmiri dry ginger, and sweet fennel.',
      price: 545.0,
      imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 25,
      dietaryLabels: JSON.stringify(['Non-Veg', 'Gluten-Free']),
      categoryId: categoryMap.get('mains')!,
    },
    {
      name: 'Zafrani Murgh Malai Tikka',
      slug: 'zafrani-murgh-malai-tikka',
      description: 'Juicy chicken supreme steeped in processed cheese, cardamom dust, and cream, smoked to golden perfection in the tandoor.',
      price: 460.0,
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 18,
      dietaryLabels: JSON.stringify(['Non-Veg', 'Gluten-Free']),
      categoryId: categoryMap.get('grills')!,
    },
    {
      name: 'Tandoori Malai Broccoli',
      slug: 'tandoori-malai-broccoli',
      description: 'Crisp broccoli florets steeped in Philadelphia cream cheese, crushed green cardamom, and toasted slivered almonds, roasted in clay oven.',
      price: 385.0,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 15,
      dietaryLabels: JSON.stringify(['Veg', 'Chef Special']),
      categoryId: categoryMap.get('grills')!,
    },
    {
      name: 'Awadhi Dum Gosht Biryani',
      slug: 'awadhi-dum-gosht-biryani',
      description: 'Aged basmati rice sealed with tender spiced mutton in a dough-capped earthen handi, flavored with kewra water and pure saffron.',
      price: 575.0,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 25,
      dietaryLabels: JSON.stringify(['Non-Veg', 'Chef Special']),
      categoryId: categoryMap.get('breads-biryanis')!,
    },
    {
      name: 'Subz Nizami Biryani Handi',
      slug: 'subz-nizami-biryani-handi',
      description: 'Farm fresh florets, carrots, french beans, and paneer layered with fragrant spiced saffron rice and slow-cooked in dum style.',
      price: 425.0,
      imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 20,
      dietaryLabels: JSON.stringify(['Veg']),
      categoryId: categoryMap.get('breads-biryanis')!,
    },
    {
      name: 'Garlic & Rosemary Butter Naan',
      slug: 'garlic-rosemary-butter-naan',
      description: 'Fluffy teardrop leavened bread brushed with compound rosemary garlic butter and toasted nigella seeds.',
      price: 110.0,
      imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 8,
      dietaryLabels: JSON.stringify(['Veg']),
      categoryId: categoryMap.get('breads-biryanis')!,
    },
    {
      name: 'Warm Gulab Jamun Cheesecake',
      slug: 'warm-gulab-jamun-cheesecake',
      description: 'Classic New York style baked cheesecake layered with saffron soaked mini gulab jamuns on a cardamom biscuit crust.',
      price: 295.0,
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 10,
      dietaryLabels: JSON.stringify(['Veg', 'Chef Special']),
      categoryId: categoryMap.get('desserts')!,
    },
    {
      name: 'Pistachio Rabri Kulfi Falooda',
      slug: 'pistachio-rabri-kulfi-falooda',
      description: 'Traditional dense pot-frozen pistachio kulfi served over hand-pressed cornstarch noodles, basil seeds, and organic Damascus rose syrup.',
      price: 245.0,
      imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 8,
      dietaryLabels: JSON.stringify(['Veg', 'Gluten-Free']),
      categoryId: categoryMap.get('desserts')!,
    },
    {
      name: 'Alphonso Mango Saffron Lassi',
      slug: 'alphonso-mango-saffron-lassi',
      description: 'Whipped organic thick yogurt blended with Ratnagiri Alphonso mango pulp, saffron strands, and crushed pistachios.',
      price: 195.0,
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 6,
      dietaryLabels: JSON.stringify(['Veg', 'Gluten-Free']),
      categoryId: categoryMap.get('beverages')!,
    },
    {
      name: 'Smoked Cinnamon Cold Brew Tonic',
      slug: 'smoked-cinnamon-cold-brew',
      description: 'Single-origin Coorg arabica cold brew coffee smoked with Ceylon cinnamon bark, served with botanical Indian tonic and orange peel.',
      price: 220.0,
      imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTime: 5,
      dietaryLabels: JSON.stringify(['Veg', 'Vegan', 'Gluten-Free']),
      categoryId: categoryMap.get('beverages')!,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }

  console.log(`✅ Seeded ${menuItems.length} Menu Items`);

  // 6. Restaurant Tables
  const tablesData = [
    { tableNumber: 'T-01', capacity: 2, section: 'Main Dining', isActive: true },
    { tableNumber: 'T-02', capacity: 2, section: 'Main Dining', isActive: true },
    { tableNumber: 'T-03', capacity: 4, section: 'Main Dining', isActive: true },
    { tableNumber: 'T-04', capacity: 4, section: 'Main Dining', isActive: true },
    { tableNumber: 'T-05', capacity: 6, section: 'Garden Patio', isActive: true },
    { tableNumber: 'T-06', capacity: 6, section: 'Garden Patio', isActive: true },
    { tableNumber: 'VIP-01', capacity: 8, section: 'VIP Private Salon', isActive: true },
    { tableNumber: 'BAL-01', capacity: 4, section: 'Balcony Deck', isActive: true },
  ];

  for (const tbl of tablesData) {
    await prisma.restaurantTable.upsert({
      where: { tableNumber: tbl.tableNumber },
      update: {},
      create: tbl,
    });
  }

  console.log('✅ Seeded Restaurant Tables');

  console.log('🎉 DineDesk database seed finished successfully!');
}

// Allow direct execution
if (require.main === module) {
  seedDatabase()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error('Error during seed:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
