import bcrypt from 'bcryptjs';

// Types matching Prisma models
export type Role = 'CUSTOMER' | 'KITCHEN' | 'ADMIN';
export type FulfillmentType = 'DINE_IN' | 'PICKUP' | 'DELIVERY';
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED'
  | 'REJECTED'
  | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentProvider = 'TEST_ONLINE' | 'CASH' | 'RAZORPAY' | 'STRIPE';
export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItemRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  preparationTime?: number | null;
  dietaryLabels?: string | null;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantTableRecord {
  id: string;
  tableNumber: string;
  capacity: number;
  isActive: boolean;
  section?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReservationRecord {
  id: string;
  customerId?: string | null;
  guestName: string;
  guestPhone: string;
  guestEmail?: string | null;
  reservationDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  partySize: number;
  tableId?: string | null;
  status: ReservationStatus;
  specialRequests?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  menuItemId?: string | null;
  itemNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
  createdAt: Date;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  providerReference?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string | null;
  tableNumber?: string | null;
  notes?: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  idempotencyKey?: string | null;
  items: OrderItemRecord[];
  payments: PaymentRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantSettingsRecord {
  id: string;
  restaurantName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  openingTime: string;
  closingTime: string;
  reservationDurationMins: number;
  taxRatePercent: number;
  deliveryFeeAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// In-Memory Global Store with Preloaded Seed Data
class DineDeskStore {
  users: UserRecord[] = [];
  categories: CategoryRecord[] = [];
  menuItems: MenuItemRecord[] = [];
  tables: RestaurantTableRecord[] = [];
  reservations: ReservationRecord[] = [];
  orders: OrderRecord[] = [];
  settings: RestaurantSettingsRecord = {
    id: 'singleton',
    restaurantName: 'DineDesk Bistro & Bar',
    tagline: 'Artisanal Flavors, Effortless Hospitality',
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  private initialized = false;

  constructor() {
    this.seed();
  }

  private seed() {
    if (this.initialized) return;
    this.initialized = true;

    const now = new Date();
    // Default synchronous salt hash for instant in-memory boot
    const adminPassHash = bcrypt.hashSync('Admin@12345', 8);
    const kitchenPassHash = bcrypt.hashSync('Kitchen@12345', 8);
    const customerPassHash = bcrypt.hashSync('Customer@12345', 8);

    this.users = [
      {
        id: 'user-admin-1',
        name: 'General Manager (Admin)',
        email: 'admin@dinedesk.com',
        passwordHash: adminPassHash,
        role: 'ADMIN',
        phone: '+91 98765 00001',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'user-kitchen-1',
        name: 'Chef Rajesh Sharma (Head Kitchen)',
        email: 'chef@dinedesk.com',
        passwordHash: kitchenPassHash,
        role: 'KITCHEN',
        phone: '+91 98765 00002',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'user-customer-1',
        name: 'Aarav Patel',
        email: 'customer@dinedesk.com',
        passwordHash: customerPassHash,
        role: 'CUSTOMER',
        phone: '+91 98765 11223',
        createdAt: now,
        updatedAt: now,
      },
    ];

    this.categories = [
      {
        id: 'cat-1',
        name: 'Starters & Small Plates',
        slug: 'starters',
        description: 'Crispy appetizers, tandoori skewers, and delicate small plates.',
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cat-2',
        name: 'Signature Mains & Curries',
        slug: 'mains',
        description: 'Slow-cooked rich gravies, slow dum curries, and royal heritage specialties.',
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cat-3',
        name: 'Tandoor & Clay Oven Grills',
        slug: 'grills',
        description: 'Smoked, charcoal-roasted skewers marinated in freshly ground spices.',
        sortOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cat-4',
        name: 'Artisanal Breads & Biryanis',
        slug: 'breads-biryanis',
        description: 'Flaky leavened naan, tandoori rotis, and aromatic fragrant long-grain basmati biryanis.',
        sortOrder: 4,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cat-5',
        name: 'Decadent Desserts',
        slug: 'desserts',
        description: 'Traditional confections re-imagined with modern patisserie techniques.',
        sortOrder: 5,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cat-6',
        name: 'Craft Beverages & Coolers',
        slug: 'beverages',
        description: 'Refreshing botanical coolers, artisanal teas, and rich yogurt blends.',
        sortOrder: 6,
        createdAt: now,
        updatedAt: now,
      },
    ];

    this.menuItems = [
      {
        id: 'item-1',
        name: 'Paneer Tikka Angaare',
        slug: 'paneer-tikka-angaare',
        description: 'Cottage cheese cubes marinated in Kashmiri red chili, hung curd, and stone-ground mustard, charred in the tandoor with bell peppers.',
        price: 345,
        imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 15,
        dietaryLabels: JSON.stringify(['Veg', 'Gluten-Free']),
        categoryId: 'cat-1',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-2',
        name: 'Truffle Sweet Corn Fritters',
        slug: 'truffle-sweet-corn-fritters',
        description: 'Golden sweet corn pearls tossed with cracked black pepper, fresh scallions, and infused with white truffle essence served with sriracha aioli.',
        price: 295,
        imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 12,
        dietaryLabels: JSON.stringify(['Veg', 'Chef Special']),
        categoryId: 'cat-1',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-3',
        name: 'Melt-in-Mouth Galouti Kebab',
        slug: 'galouti-kebab',
        description: 'Finely minced lamb smoked with cloves and infused with 24 secret Awadhi spices, pan-seared to melt on your tongue, served on mini saffron parathas.',
        price: 445,
        imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 20,
        dietaryLabels: JSON.stringify(['Non-Veg', 'Chef Special']),
        categoryId: 'cat-1',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-4',
        name: 'Dal Makhani Royale 24-Hour',
        slug: 'dal-makhani-royale',
        description: 'Black lentils slow-cooked overnight over charcoal embers, finished with white butter, vine-ripened tomato coulis, and artisanal fresh cream.',
        price: 395,
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 15,
        dietaryLabels: JSON.stringify(['Veg', 'Gluten-Free', 'Chef Special']),
        categoryId: 'cat-2',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-5',
        name: 'Old Delhi Butter Chicken',
        slug: 'old-delhi-butter-chicken',
        description: 'Boneless tandoori chicken simmered in an indulgent satin sauce of butter, fresh tomatoes, fenugreek leaves (kasoori methi), and honey.',
        price: 485,
        imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 20,
        dietaryLabels: JSON.stringify(['Non-Veg', 'Chef Special']),
        categoryId: 'cat-2',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-6',
        name: 'Smoked Paneer Lababdar',
        slug: 'smoked-paneer-lababdar',
        description: 'Fresh malai paneer steeped in a chunky onion, tomato, and cashew nut gravy enriched with grated cottage cheese and freshly ground mace.',
        price: 425,
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 15,
        dietaryLabels: JSON.stringify(['Veg', 'Gluten-Free']),
        categoryId: 'cat-2',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-7',
        name: 'Kashmiri Rogan Josh',
        slug: 'kashmiri-rogan-josh',
        description: 'Tender baby lamb cuts braised in aromatic shallots, Ratan Jot (alkanet root) for deep crimson hue, Kashmiri dry ginger, and sweet fennel.',
        price: 545,
        imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 25,
        dietaryLabels: JSON.stringify(['Non-Veg', 'Gluten-Free']),
        categoryId: 'cat-2',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-8',
        name: 'Zafrani Murgh Malai Tikka',
        slug: 'zafrani-murgh-malai-tikka',
        description: 'Juicy chicken supreme steeped in processed cheese, cardamom dust, and cream, smoked to golden perfection in the tandoor.',
        price: 460,
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 18,
        dietaryLabels: JSON.stringify(['Non-Veg', 'Gluten-Free']),
        categoryId: 'cat-3',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-9',
        name: 'Tandoori Malai Broccoli',
        slug: 'tandoori-malai-broccoli',
        description: 'Crisp broccoli florets steeped in Philadelphia cream cheese, crushed green cardamom, and toasted slivered almonds, roasted in clay oven.',
        price: 385,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 15,
        dietaryLabels: JSON.stringify(['Veg', 'Chef Special']),
        categoryId: 'cat-3',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-10',
        name: 'Awadhi Dum Gosht Biryani',
        slug: 'awadhi-dum-gosht-biryani',
        description: 'Aged basmati rice sealed with tender spiced mutton in a dough-capped earthen handi, flavored with kewra water and pure saffron.',
        price: 575,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 25,
        dietaryLabels: JSON.stringify(['Non-Veg', 'Chef Special']),
        categoryId: 'cat-4',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-11',
        name: 'Subz Nizami Biryani Handi',
        slug: 'subz-nizami-biryani-handi',
        description: 'Farm fresh florets, carrots, french beans, and paneer layered with fragrant spiced saffron rice and slow-cooked in dum style.',
        price: 425,
        imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 20,
        dietaryLabels: JSON.stringify(['Veg']),
        categoryId: 'cat-4',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-12',
        name: 'Garlic & Rosemary Butter Naan',
        slug: 'garlic-rosemary-butter-naan',
        description: 'Fluffy teardrop leavened bread brushed with compound rosemary garlic butter and toasted nigella seeds.',
        price: 110,
        imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 8,
        dietaryLabels: JSON.stringify(['Veg']),
        categoryId: 'cat-4',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-13',
        name: 'Warm Gulab Jamun Cheesecake',
        slug: 'warm-gulab-jamun-cheesecake',
        description: 'Classic New York style baked cheesecake layered with saffron soaked mini gulab jamuns on a cardamom biscuit crust.',
        price: 295,
        imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 10,
        dietaryLabels: JSON.stringify(['Veg', 'Chef Special']),
        categoryId: 'cat-5',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-14',
        name: 'Pistachio Rabri Kulfi Falooda',
        slug: 'pistachio-rabri-kulfi-falooda',
        description: 'Traditional dense pot-frozen pistachio kulfi served over hand-pressed cornstarch noodles, basil seeds, and organic Damascus rose syrup.',
        price: 245,
        imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 8,
        dietaryLabels: JSON.stringify(['Veg', 'Gluten-Free']),
        categoryId: 'cat-5',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-15',
        name: 'Alphonso Mango Saffron Lassi',
        slug: 'alphonso-mango-saffron-lassi',
        description: 'Whipped organic thick yogurt blended with Ratnagiri Alphonso mango pulp, saffron strands, and crushed pistachios.',
        price: 195,
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 6,
        dietaryLabels: JSON.stringify(['Veg', 'Gluten-Free']),
        categoryId: 'cat-6',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-16',
        name: 'Smoked Cinnamon Cold Brew Tonic',
        slug: 'smoked-cinnamon-cold-brew',
        description: 'Single-origin Coorg arabica cold brew coffee smoked with Ceylon cinnamon bark, served with botanical Indian tonic and orange peel.',
        price: 220,
        imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        preparationTime: 5,
        dietaryLabels: JSON.stringify(['Veg', 'Vegan', 'Gluten-Free']),
        categoryId: 'cat-6',
        createdAt: now,
        updatedAt: now,
      },
    ];

    this.tables = [
      { id: 'tbl-1', tableNumber: 'T-01', capacity: 2, section: 'Main Dining', isActive: true, createdAt: now, updatedAt: now },
      { id: 'tbl-2', tableNumber: 'T-02', capacity: 2, section: 'Main Dining', isActive: true, createdAt: now, updatedAt: now },
      { id: 'tbl-3', tableNumber: 'T-03', capacity: 4, section: 'Main Dining', isActive: true, createdAt: now, updatedAt: now },
      { id: 'tbl-4', tableNumber: 'T-04', capacity: 4, section: 'Main Dining', isActive: true, createdAt: now, updatedAt: now },
      { id: 'tbl-5', tableNumber: 'T-05', capacity: 6, section: 'Garden Patio', isActive: true, createdAt: now, updatedAt: now },
      { id: 'tbl-6', tableNumber: 'T-06', capacity: 6, section: 'Garden Patio', isActive: true, createdAt: now, updatedAt: now },
      { id: 'tbl-7', tableNumber: 'VIP-01', capacity: 8, section: 'VIP Private Salon', isActive: true, createdAt: now, updatedAt: now },
      { id: 'tbl-8', tableNumber: 'BAL-01', capacity: 4, section: 'Balcony Deck', isActive: true, createdAt: now, updatedAt: now },
    ];

    // Seed 1 active order for Kitchen Demo
    const sampleOrderId = 'ord-demo-1';
    const sampleOrderNumber = 'DD-20261014-1001';
    this.orders.push({
      id: sampleOrderId,
      orderNumber: sampleOrderNumber,
      customerId: 'user-customer-1',
      customerName: 'Aarav Patel',
      customerPhone: '+91 98765 11223',
      customerEmail: 'customer@dinedesk.com',
      fulfillmentType: 'DINE_IN',
      tableNumber: 'T-03',
      notes: 'Please make the Paneer Tikka extra spicy, thank you!',
      status: 'PREPARING',
      paymentStatus: 'PAID',
      subtotal: 740,
      taxAmount: 37,
      deliveryFee: 0,
      discountAmount: 0,
      totalAmount: 777,
      idempotencyKey: 'idemp-demo-1',
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
      updatedAt: new Date(Date.now() - 5 * 60 * 1000),
      items: [
        {
          id: 'item-snap-1',
          orderId: sampleOrderId,
          menuItemId: 'item-1',
          itemNameSnapshot: 'Paneer Tikka Angaare',
          unitPriceSnapshot: 345,
          quantity: 1,
          lineTotal: 345,
          createdAt: now,
        },
        {
          id: 'item-snap-2',
          orderId: sampleOrderId,
          menuItemId: 'item-4',
          itemNameSnapshot: 'Dal Makhani Royale 24-Hour',
          unitPriceSnapshot: 395,
          quantity: 1,
          lineTotal: 395,
          createdAt: now,
        },
      ],
      payments: [
        {
          id: 'pay-demo-1',
          orderId: sampleOrderId,
          provider: 'TEST_ONLINE',
          providerReference: 'PAY-TEST-99824',
          amount: 777,
          currency: 'INR',
          status: 'PAID',
          notes: 'Test online payment authorization',
          createdAt: now,
          updatedAt: now,
        },
      ],
    });

    // Seed 1 sample reservation
    this.reservations.push({
      id: 'res-demo-1',
      customerId: 'user-customer-1',
      guestName: 'Aarav Patel',
      guestPhone: '+91 98765 11223',
      guestEmail: 'customer@dinedesk.com',
      reservationDate: new Date().toISOString().split('T')[0],
      startTime: '19:30',
      endTime: '21:00',
      partySize: 4,
      tableId: 'tbl-3',
      status: 'CONFIRMED',
      specialRequests: 'Window seat preferred for anniversary dinner',
      createdAt: now,
      updatedAt: now,
    });
  }
}

// Global singleton instance
const globalStore = globalThis as unknown as {
  dineDeskStore: DineDeskStore | undefined;
};

export const store = globalStore.dineDeskStore ?? new DineDeskStore();
if (process.env.NODE_ENV !== 'production') globalStore.dineDeskStore = store;
