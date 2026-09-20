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

// --- API HEALTH CHECK ---
app.get('/', (req, res) => {
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
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

  const newProduct = {
    id: newId,
    name,
    category: category || 'General',
    image: image || 'images/laptop.jpg',
    oldPrice: oldPrice ? parseInt(oldPrice) : parseInt(price) * 1.2,
    price: parseInt(price),
    discountBadge: oldPrice ? `-${Math.round((1 - price / oldPrice) * 100)}%` : '-10%',
    rating: '★★★★★',
    delivery: delivery || '🚚 Free Delivery',
    warranty: warranty || '🛡️ 1 Year Warranty',
    inStock: true
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

  products[index] = { ...products[index], ...req.body };
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

// POST /api/coupons/validate - Validate coupon code
app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code required' });
  }

  const coupons = readJsonFile(couponsFilePath);
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

// POST /api/orders - Submit Order
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

  console.log(`🛒 New Order Placed: ${newOrder.orderId} (Total: ৳${grandTotal})`);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    data: newOrder
  });
});

// PUT /api/orders/:orderId/status - Update order status
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

  res.json({ success: true, message: `Order #${order.orderId} updated to ${status}`, data: order });
});

// DELETE /api/orders/:orderId - Delete order
app.delete('/api/orders/:orderId', (req, res) => {
  let orders = readJsonFile(ordersFilePath);
  const orderId = req.params.orderId;
  orders = orders.filter(o => o.orderId !== orderId);
  writeJsonFile(ordersFilePath, orders);
  res.json({ success: true, message: 'Order deleted successfully' });
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

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const completedOrders = orders.filter(o => o.status === 'Delivered').length;

  res.json({
    success: true,
    stats: {
      totalProducts: products.length,
      totalMessages: messages.length,
      totalOrders: orders.length,
      pendingOrders,
      completedOrders,
      totalRevenueBDT: totalRevenue
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
