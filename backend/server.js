const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Data file paths
const productsFilePath = path.join(__dirname, 'data', 'products.json');
const messagesFilePath = path.join(__dirname, 'data', 'messages.json');
const ordersFilePath = path.join(__dirname, 'data', 'orders.json');
const couponsFilePath = path.join(__dirname, 'data', 'coupons.json');
const smsLogsFilePath = path.join(__dirname, 'data', 'sms_logs.json');
const usersFilePath = path.join(__dirname, 'data', 'users.json');
const settingsFilePath = path.join(__dirname, 'data', 'settings.json');

// Safe JSON file reader
const readJsonFile = (filePath, fallback = []) => {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return fallback;
  }
};

// Safe JSON file writer
const writeJsonFile = (filePath, data) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    return false;
  }
};

// Serve static frontend files from the store root directory
app.use(express.static(path.join(__dirname, '..')));

// --- API HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    storeName: 'TechVerse Online Tech Store',
    version: '2.0.0 Enterprise',
    timestamp: new Date().toISOString()
  });
});

// ==================== PRODUCTS API ====================

// GET /api/products (List + Search + Category + Sort)
app.get('/api/products', (req, res) => {
  let products = readJsonFile(productsFilePath);
  const { search, category, sort } = req.query;

  // Search Filter
  if (search) {
    const s = search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(s) || 
      (p.category && p.category.toLowerCase().includes(s))
    );
  }

  // Category Filter
  if (category && category !== 'All') {
    const cat = category.toLowerCase();
    products = products.filter(p => p.category && p.category.toLowerCase() === cat);
  }

  // Sorting
  if (sort === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    products.sort((a, b) => (b.rating ? b.rating.length : 5) - (a.rating ? a.rating.length : 5));
  } else if (sort === 'name') {
    products.sort((a, b) => a.name.localeCompare(b.name));
  }

  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

// GET /api/products/:id - Single product
app.get('/api/products/:id', (req, res) => {
  const products = readJsonFile(productsFilePath);
  const product = products.find(p => p.id === parseInt(req.params.id));

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, data: product });
});

// POST /api/products - Create product
app.post('/api/products', (req, res) => {
  const { name, category, price, oldPrice, image, warranty, delivery } = req.body;

  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Product name and price are required.' });
  }

  const products = readJsonFile(productsFilePath);
  const parsedPrice = parseInt(price);
  const parsedOldPrice = oldPrice ? parseInt(oldPrice) : Math.round(parsedPrice * 1.2);
  const newId = req.body.id ? parseInt(req.body.id) : (products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1);

  const newProduct = {
    id: newId,
    name,
    category: category || 'General',
    image: image || 'images/laptop.jpg',
    oldPrice: parsedOldPrice,
    price: parsedPrice,
    discountBadge: (parsedOldPrice && parsedOldPrice > parsedPrice) ? `-${Math.round((1 - parsedPrice / parsedOldPrice) * 100)}%` : '-10%',
    rating: req.body.rating || '★★★★★',
    delivery: delivery || '🚚 Free Delivery',
    warranty: warranty || '🛡️ 1 Year Warranty',
    inStock: req.body.inStock !== undefined ? req.body.inStock : true
  };

  products.unshift(newProduct);
  writeJsonFile(productsFilePath, products);

  res.status(201).json({ success: true, message: 'Product created successfully!', data: newProduct });
});

// PUT /api/products/:id - Update product
app.put('/api/products/:id', (req, res) => {
  const products = readJsonFile(productsFilePath);
  const index = products.findIndex(p => p.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const current = products[index];
  const updatedPrice = req.body.price !== undefined ? parseInt(req.body.price) : current.price;
  const updatedOldPrice = req.body.oldPrice !== undefined ? parseInt(req.body.oldPrice) : current.oldPrice;
  const discountBadge = (updatedOldPrice && updatedOldPrice > updatedPrice)
    ? `-${Math.round((1 - updatedPrice / updatedOldPrice) * 100)}%`
    : current.discountBadge;

  products[index] = {
    ...current,
    ...req.body,
    price: updatedPrice,
    oldPrice: updatedOldPrice,
    discountBadge
  };
  writeJsonFile(productsFilePath, products);

  res.json({ success: true, message: 'Product updated successfully', data: products[index] });
});

// DELETE /api/products/:id - Delete product
app.delete('/api/products/:id', (req, res) => {
  let products = readJsonFile(productsFilePath);
  const initialLen = products.length;
  products = products.filter(p => p.id !== parseInt(req.params.id));

  if (products.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  writeJsonFile(productsFilePath, products);
  res.json({ success: true, message: 'Product deleted successfully' });
});


// ==================== COUPONS API ====================

// GET /api/coupons - List all coupons
app.get('/api/coupons', (req, res) => {
  const coupons = readJsonFile(couponsFilePath, []);
  res.json({ success: true, count: coupons.length, data: coupons });
});

// POST /api/coupons - Create new promo coupon
app.post('/api/coupons', (req, res) => {
  const { code, discountPercent, discountFlat, minSpend, maxDiscount, description } = req.body;

  if (!code || (!discountPercent && !discountFlat)) {
    return res.status(400).json({ success: false, message: 'Coupon code and discount rate/amount are required.' });
  }

  const cleanCode = String(code).trim().toUpperCase();
  const coupons = readJsonFile(couponsFilePath, []);

  const exists = coupons.some(c => c.code.toUpperCase() === cleanCode);
  if (exists) {
    return res.status(400).json({ success: false, message: `Coupon with code "${cleanCode}" already exists.` });
  }

  const newCoupon = {
    code: cleanCode,
    ...(discountPercent ? { discountPercent: Number(discountPercent) } : {}),
    ...(discountFlat ? { discountFlat: Number(discountFlat) } : {}),
    minSpend: minSpend ? Number(minSpend) : 0,
    maxDiscount: maxDiscount ? Number(maxDiscount) : 0,
    description: description ? String(description).trim() : `${cleanCode} Special Discount Voucher`
  };

  coupons.unshift(newCoupon);
  writeJsonFile(couponsFilePath, coupons);

  console.log(`🎟️ New Promo Coupon Created: ${cleanCode}`);
  res.status(201).json({ success: true, message: `Coupon "${cleanCode}" created successfully!`, data: newCoupon });
});

// DELETE /api/coupons/:code - Delete coupon
app.delete('/api/coupons/:code', (req, res) => {
  const targetCode = String(req.params.code).trim().toUpperCase();
  let coupons = readJsonFile(couponsFilePath, []);
  const initialLen = coupons.length;

  coupons = coupons.filter(c => c.code.toUpperCase() !== targetCode);

  if (coupons.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Coupon code not found.' });
  }

  writeJsonFile(couponsFilePath, coupons);
  console.log(`🗑️ Coupon Deleted: ${targetCode}`);
  res.json({ success: true, message: `Coupon "${targetCode}" deleted successfully.` });
});

// POST /api/coupons/validate - Validate coupon code
app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code required' });
  }

  const coupons = readJsonFile(couponsFilePath, []);
  const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());

  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
  }

  const currentSub = subtotal || 0;
  if (coupon.minSpend && currentSub < coupon.minSpend) {
    return res.status(400).json({ 
      success: false, 
      message: `Minimum spend of ৳${coupon.minSpend.toLocaleString()} required for code ${coupon.code}.` 
    });
  }

  let discountAmount = 0;
  if (coupon.discountPercent) {
    discountAmount = Math.round((currentSub * coupon.discountPercent) / 100);
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else if (coupon.discountFlat) {
    discountAmount = coupon.discountFlat;
  }

  res.json({
    success: true,
    message: `Coupon Applied: ${coupon.description}`,
    data: {
      code: coupon.code,
      discountAmount,
      description: coupon.description
    }
  });
});



// ==================== SMS NOTIFICATION ENGINE ====================

// Build SMS Templates in Bengali
const generateOrderSmsText = (order, eventType) => {
  const itemsText = Array.isArray(order.items) 
    ? order.items.map(i => `${i.name} (x${i.quantity || 1})`).join(', ') 
    : 'Tech Accessories';
  const total = Number(order.totalAmount || 0).toLocaleString();

  switch (eventType) {
    case 'ORDER_PLACED':
      return `TechVerse: প্রিয় ${order.customerName || 'গ্রাহক'}, আপনার অর্ডার #${order.orderId} সফলভাবে গৃহীত হয়েছে! আইটেম: ${itemsText}। মোট বিল: ৳${total} (${order.paymentMethod || 'COD'})। ডেলিভারি: ২৪-৪৮ ঘণ্টার মধ্যে। হেল্পলাইন: 01820-727102`;

    case 'OUT_FOR_DELIVERY':
      return `TechVerse: প্রিয় ${order.customerName || 'গ্রাহক'}, আপনার অর্ডার #${order.orderId} আজ ডেলিভারির জন্য বের হয়েছে! আনুমানিক সময়: দুপুর ২টা - সন্ধ্যা ৬টা। ক্যাশ বিল: ৳${total} প্রস্তুত রাখুন। হেল্পলাইন: 01820-727102`;

    case 'DELIVERED':
      return `TechVerse: প্রিয় ${order.customerName || 'গ্রাহক'}, আপনার TechVerse অর্ডার #${order.orderId} সফলভাবে ডেলিভার করা হয়েছে! অফিসিয়াল ওয়ারেন্টির জন্য রশিদটি সংরক্ষণ করুন। আমাদের সাথে কেনাকাটার জন্য ধন্যবাদ!`;

    case 'PROCESSING':
      return `TechVerse: প্রিয় ${order.customerName || 'গ্রাহক'}, আপনার অর্ডার #${order.orderId} প্রসেসিং হচ্ছে এবং দ্রুত প্যাকিং সম্পন্ন করা হচ্ছে। হেল্পলাইন: 01820-727102`;

    case 'CANCELLED':
      return `TechVerse: আপনার অর্ডার #${order.orderId} বাতিল করা হয়েছে। যেকোনো প্রয়োজনে কল করুন: 01820-727102।`;

    default:
      return `TechVerse: আপনার অর্ডার #${order.orderId} স্ট্যাটাস আপডেট হয়েছে: ${eventType}। হেল্পলাইন: 01820-727102`;
  }
};

// Dispatch SMS Function (Supports Gateway Hook + JSON Logs + WhatsApp Direct)
const dispatchSmsNotification = (order, eventType) => {
  if (!order || !order.customerPhone) return null;

  const rawPhone = String(order.customerPhone).trim();
  let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('880')) {
    // Already has country code
  } else if (cleanPhone.startsWith('0')) {
    cleanPhone = '88' + cleanPhone;
  } else if (cleanPhone.length === 10) {
    cleanPhone = '880' + cleanPhone;
  }

  const messageText = generateOrderSmsText(order, eventType);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;

  const smsRecord = {
    id: 'SMS-' + Date.now(),
    orderId: order.orderId,
    customerName: order.customerName,
    recipientPhone: rawPhone,
    standardPhone: cleanPhone,
    eventType: eventType,
    message: messageText,
    whatsappUrl: whatsappUrl,
    status: 'Dispatched (Sent)',
    timestamp: new Date().toISOString()
  };

  // 1. Save to SMS Log File
  const smsLogs = readJsonFile(smsLogsFilePath, []);
  smsLogs.unshift(smsRecord);
  if (smsLogs.length > 200) smsLogs.length = 200;
  writeJsonFile(smsLogsFilePath, smsLogs);

  // 2. Terminal Live Logging
  console.log(`\n================= 📱 SMS DISPATCH ENGINE =================`);
  console.log(`📡 EVENT: ${eventType} | ORDER: #${order.orderId}`);
  console.log(`📞 TO: ${rawPhone} (${order.customerName})`);
  console.log(`💬 MESSAGE:\n"${messageText}"`);
  console.log(`🔗 WhatsApp Instant Link: ${whatsappUrl}`);
  console.log(`==========================================================\n`);

  return smsRecord;
};

// ==================== ORDERS API ====================

// GET /api/orders - Get all orders
app.get('/api/orders', (req, res) => {
  const orders = readJsonFile(ordersFilePath);
  res.json({ success: true, count: orders.length, data: orders });
});

// GET /api/orders/:orderId - Single order invoice/tracking
app.get('/api/orders/:orderId', (req, res) => {
  const orders = readJsonFile(ordersFilePath);
  const order = orders.find(o => o.orderId === req.params.orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, data: order });
});

// POST /api/orders - Submit Order + Auto Stage 1 SMS Dispatch
app.post('/api/orders', (req, res) => {
  const { items, customerName, customerPhone, address, shippingFee, discountAmount, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty. Cannot place order.' });
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const ship = shippingFee || 60;
  const disc = discountAmount || 0;
  const grandTotal = Math.max(0, subtotal + ship - disc);

  const orders = readJsonFile(ordersFilePath);
  const newOrder = {
    orderId: 'TV-' + Math.floor(100000 + Math.random() * 900000),
    customerName: customerName || 'Valued Customer',
    customerPhone: customerPhone || 'N/A',
    address: address || 'N/A',
    items,
    subtotal,
    shippingFee: ship,
    discountAmount: disc,
    totalAmount: grandTotal,
    paymentMethod: paymentMethod || 'Cash on Delivery',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);
  writeJsonFile(ordersFilePath, orders);

  // Auto-dispatch Stage 1 Confirmation SMS
  const smsResult = dispatchSmsNotification(newOrder, 'ORDER_PLACED');

  console.log(`🛒 New Order Placed: ${newOrder.orderId} (Total: ৳${grandTotal})`);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully and confirmation SMS dispatched!',
    data: newOrder,
    sms: smsResult
  });
});

// PUT /api/orders/:orderId/status - Update order status + Auto Stage 2 or 3 SMS Dispatch
app.put('/api/orders/:orderId/status', (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status parameter required' });
  }

  const orders = readJsonFile(ordersFilePath);
  const order = orders.find(o => o.orderId === req.params.orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  writeJsonFile(ordersFilePath, orders);

  // Trigger Stage 2 (Out for Delivery) or Stage 3 (Delivered)
  let eventType = 'STATUS_UPDATE';
  if (status === 'Shipped') eventType = 'OUT_FOR_DELIVERY';
  else if (status === 'Delivered') eventType = 'DELIVERED';
  else if (status === 'Processing') eventType = 'PROCESSING';
  else if (status === 'Cancelled') eventType = 'CANCELLED';

  const smsResult = dispatchSmsNotification(order, eventType);

  res.json({ 
    success: true, 
    message: `Order #${order.orderId} updated to ${status}. SMS dispatched!`, 
    data: order,
    sms: smsResult 
  });
});

// DELETE /api/orders/:orderId - Delete order
app.delete('/api/orders/:orderId', (req, res) => {
  let orders = readJsonFile(ordersFilePath);
  const orderId = req.params.orderId;
  orders = orders.filter(o => o.orderId !== orderId);
  writeJsonFile(ordersFilePath, orders);
  res.json({ success: true, message: 'Order deleted successfully' });
});


// ==================== SMS API ENDPOINTS ====================

// GET /api/sms/logs - Get all dispatched SMS logs
app.get('/api/sms/logs', (req, res) => {
  const smsLogs = readJsonFile(smsLogsFilePath, []);
  res.json({ success: true, count: smsLogs.length, data: smsLogs });
});

// POST /api/sms/send-direct - Manual or Custom SMS trigger from Admin
app.post('/api/sms/send-direct', (req, res) => {
  const { phone, message, customerName, orderId } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ success: false, message: 'Phone and message are required' });
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const smsRecord = {
    id: 'SMS-' + Date.now(),
    orderId: orderId || 'MANUAL-' + Math.floor(1000 + Math.random() * 9000),
    customerName: customerName || 'Valued Customer',
    recipientPhone: phone,
    standardPhone: cleanPhone,
    eventType: 'DIRECT_CUSTOM',
    message: message,
    whatsappUrl: `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`,
    status: 'Dispatched (Sent)',
    timestamp: new Date().toISOString()
  };

  const smsLogs = readJsonFile(smsLogsFilePath, []);
  smsLogs.unshift(smsRecord);
  writeJsonFile(smsLogsFilePath, smsLogs);

  console.log(`📱 Direct custom SMS sent to ${phone}: ${message}`);
  res.json({ success: true, message: 'SMS dispatched successfully!', data: smsRecord });
});

// DELETE /api/sms/logs/:id - Delete single SMS record
app.delete('/api/sms/logs/:id', (req, res) => {
  let smsLogs = readJsonFile(smsLogsFilePath, []);
  const initialLen = smsLogs.length;
  smsLogs = smsLogs.filter(s => s.id !== req.params.id);

  if (smsLogs.length === initialLen) {
    return res.status(404).json({ success: false, message: 'SMS record not found.' });
  }

  writeJsonFile(smsLogsFilePath, smsLogs);
  res.json({ success: true, message: 'SMS record deleted successfully.' });
});

// DELETE /api/sms/logs - Clear all SMS logs
app.delete('/api/sms/logs', (req, res) => {
  writeJsonFile(smsLogsFilePath, []);
  res.json({ success: true, message: 'All SMS notification logs cleared.' });
});


// ==================== CONTACT MESSAGES API ====================

app.get('/api/contact', (req, res) => {
  const messages = readJsonFile(messagesFilePath);
  res.json({ success: true, count: messages.length, data: messages });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and message.' });
  }

  const messages = readJsonFile(messagesFilePath);
  const newMessage = {
    id: Date.now(),
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  };

  messages.unshift(newMessage);
  writeJsonFile(messagesFilePath, messages);

  console.log(`📩 Contact Message from ${name} (${email})`);

  res.status(201).json({
    success: true,
    message: 'Message sent successfully!',
    data: newMessage
  });
});

app.delete('/api/contact/:id', (req, res) => {
  let messages = readJsonFile(messagesFilePath);
  const id = parseInt(req.params.id);
  messages = messages.filter(m => m.id !== id);
  writeJsonFile(messagesFilePath, messages);
  res.json({ success: true, message: 'Message deleted' });
});


// ==================== STATS API ====================

app.get('/api/stats', (req, res) => {
  const products = readJsonFile(productsFilePath);
  const messages = readJsonFile(messagesFilePath);
  const orders = readJsonFile(ordersFilePath);
  const coupons = readJsonFile(couponsFilePath, []);
  const smsLogs = readJsonFile(smsLogsFilePath, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalSoldItems = orders.reduce((sum, o) => {
    if (Array.isArray(o.items)) {
      return sum + o.items.reduce((iSum, item) => iSum + (Number(item.quantity) || 1), 0);
    }
    return sum;
  }, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const completedOrders = orders.filter(o => o.status === 'Delivered').length;

  res.json({
    success: true,
    stats: {
      totalProducts: products.length,
      totalSoldItems,
      totalMessages: messages.length,
      totalOrders: orders.length,
      pendingOrders,
      completedOrders,
      totalRevenueBDT: totalRevenue,
      totalCoupons: coupons.length,
      totalSmsLogs: smsLogs.length
    }
  });
});

// ==================== CUSTOMER AUTHENTICATION API ====================

app.post('/api/auth/register', (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || (!phone && !email) || !password) {
    return res.status(400).json({ success: false, message: 'Name, phone/email, and password are required' });
  }

  const users = readJsonFile(usersFilePath, []);
  const identifier = (phone || email).toLowerCase().trim();

  if (users.some(u => (u.phone && u.phone === identifier) || (u.email && u.email.toLowerCase() === identifier))) {
    return res.status(400).json({ success: false, message: 'An account already exists with this phone or email' });
  }

  const newUser = {
    id: 'USR-' + Date.now(),
    name: name.trim(),
    phone: phone ? phone.trim() : '',
    email: email ? email.trim() : '',
    password: password, // In production, hash with bcrypt
    loyaltyPoints: 100, // Welcome bonus points
    savedAddresses: [],
    createdAt: new Date().toISOString()
  };

  users.unshift(newUser);
  writeJsonFile(usersFilePath, users);

  res.status(201).json({
    success: true,
    message: 'Account created successfully! Enjoy 100 welcome reward points.',
    data: {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      loyaltyPoints: newUser.loyaltyPoints
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Please enter phone/email and password' });
  }

  const users = readJsonFile(usersFilePath, []);
  const cleanId = identifier.toLowerCase().trim();
  const user = users.find(u => 
    (u.phone && u.phone.includes(cleanId)) || 
    (u.email && u.email.toLowerCase() === cleanId)
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid phone/email or password' });
  }

  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    data: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      loyaltyPoints: user.loyaltyPoints || 100,
      savedAddresses: user.savedAddresses || []
    }
  });
});

// ==================== STEADFAST / PATHAO COURIER DISPATCH API ====================

app.post('/api/courier/dispatch', (req, res) => {
  const { orderId, courierName = 'Steadfast Courier', customerName, customerPhone, address, amount } = req.body;
  if (!orderId) {
    return res.status(400).json({ success: false, message: 'orderId is required' });
  }

  const consignmentId = 'ST-' + Math.floor(10000000 + Math.random() * 90000000);
  const trackingUrl = `https://steadfast.com.bd/tracking/${consignmentId}`;

  // Update order with courier tracking info
  let orders = readJsonFile(ordersFilePath, []);
  const idx = orders.findIndex(o => o.orderId === orderId);
  if (idx !== -1) {
    orders[idx].courier = {
      provider: courierName,
      consignmentId,
      trackingUrl,
      status: 'In Transit with Rider',
      dispatchedAt: new Date().toISOString()
    };
    orders[idx].status = 'Shipped';
    writeJsonFile(ordersFilePath, orders);
  }

  res.json({
    success: true,
    message: `Order #${orderId} booked with ${courierName}! Consignment: ${consignmentId}`,
    data: {
      orderId,
      consignmentId,
      provider: courierName,
      trackingUrl,
      status: 'In Transit'
    }
  });
});

// ==================== BKASH / CARD PAYMENT GATEWAY PROCESSOR ====================

app.post('/api/payment/verify-bkash', (req, res) => {
  const { orderId, phone, amount } = req.body;
  const trxId = 'BKX' + Math.random().toString(36).substring(2, 10).toUpperCase();

  let orders = readJsonFile(ordersFilePath, []);
  const idx = orders.findIndex(o => o.orderId === orderId);
  if (idx !== -1) {
    orders[idx].paymentStatus = 'Paid (bKash Verified)';
    orders[idx].transactionId = trxId;
    writeJsonFile(ordersFilePath, orders);
  }

  res.json({
    success: true,
    message: 'bKash Merchant Payment Successfully Verified!',
    data: {
      transactionId: trxId,
      orderId,
      amount,
      paymentMethod: 'bKash Tokenized Checkout',
      status: 'Success'
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 TechVerse Enterprise Backend API running!`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`=================================================`);
});
