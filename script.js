// Backend API Base URL
const API_BASE_URL = "http://localhost:5000/api";

// Application State
let productsList = [];
let cartItems = [];
let wishlist = JSON.parse(localStorage.getItem("techverse_wishlist")) || [];
let activeCategory = "All";
let activeSort = "default";
let appliedCoupon = null;
let currentShippingFee = 60; // Default Inside Dhaka

document.addEventListener("DOMContentLoaded", function () {
    initApp();
    startFlashTimer();
});

function initApp() {
    getLocalProducts(); // Initialize localStorage if needed
    getLocalOrders();   // Initialize localStorage orders
    getLocalMessages(); // Initialize localStorage messages
    fetchProducts();
    setupEventListeners();
    updateCartUI();
    updateWishlistUI();
    loadAdminStats(); // Pre-load stats
}

// Fallback products for offline mode (when Node backend is not running)
const FALLBACK_PRODUCTS = [
  { id: 1, name: "Gaming Laptop", category: "Laptop", image: "images/laptop.jpg", oldPrice: 150000, price: 120000, discountBadge: "-20%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 2 Years Warranty", inStock: true },
  { id: 2, name: "Gaming Keyboard", category: "Keyboard", image: "images/keyboard.jpg", oldPrice: 3900, price: 3500, discountBadge: "-10%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 1 Year Warranty", inStock: true },
  { id: 3, name: "Gaming Mouse", category: "Mouse", image: "images/mouse.jpg", oldPrice: 5400, price: 3800, discountBadge: "-30%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 1 Year Warranty", inStock: true },
  { id: 4, name: "Gaming Headphone", category: "Headphone", image: "images/headphone.jpg", oldPrice: 4300, price: 3500, discountBadge: "-20%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 1 Year Warranty", inStock: true },
  { id: 5, name: "Gaming Monitor", category: "Monitor", image: "images/monitor.jpg", oldPrice: 40000, price: 32000, discountBadge: "-20%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 2 Years Warranty", inStock: true },
  { id: 6, name: "Bluetooth Speaker", category: "Speaker", image: "images/speaker.jpg", oldPrice: 4800, price: 3800, discountBadge: "-10%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 1 Year Warranty", inStock: true },
  { id: 7, name: "HD Webcam", category: "Webcam", image: "images/webcam.jpg", oldPrice: 5000, price: 4500, discountBadge: "-10%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 1 Year Warranty", inStock: true },
  { id: 8, name: "1TB SSD", category: "SSD", image: "images/ssd.jpg", oldPrice: 10000, price: 9000, discountBadge: "-10%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 3 Years Warranty", inStock: true },
  { id: 9, name: "WiFi Router", category: "Router", image: "images/router.jpg", oldPrice: 3600, price: 3200, discountBadge: "-10%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 1 Year Warranty", inStock: true },
  { id: 10, name: "16GB DDR4 RAM", category: "RAM", image: "images/ram.jpg", oldPrice: 6000, price: 5500, discountBadge: "-10%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ Lifetime Warranty", inStock: true },
  { id: 11, name: "Intel Core i7", category: "Processor", image: "images/processor.jpg", oldPrice: 30000, price: 28000, discountBadge: "-10%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 3 Year Warranty", inStock: true },
  { id: 12, name: "RTX Graphics Card", category: "Graphics Card", image: "images/gpu.jpg", oldPrice: 80000, price: 65000, discountBadge: "-20%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 3 Year Warranty", inStock: true },
  { id: 13, name: "Color Printer", category: "Printer", image: "images/printer.jpg", oldPrice: 18000, price: 15000, discountBadge: "-20%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 2 Year Warranty", inStock: true },
  { id: 14, name: "Digital Camera", category: "Camera", image: "images/camera.jpg", oldPrice: 58000, price: 52000, discountBadge: "-10%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 2 Year Warranty", inStock: true },
  { id: 15, name: "Smart Watch", category: "Smart Watch", image: "images/smartwatch.jpg", oldPrice: 9000, price: 7500, discountBadge: "-20%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 1 Year Warranty", inStock: true },
  { id: 16, name: "Android Tablet", category: "Tablet", image: "images/tablet.jpg", oldPrice: 24000, price: 20000, discountBadge: "-30%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 1 Year Warranty", inStock: true },
  { id: 17, name: "20000mAh Power Bank", category: "Power Bank", image: "images/powerbank.jpg", oldPrice: 2800, price: 2500, discountBadge: "-15%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 6 Months Warranty", inStock: true },
  { id: 18, name: "5G Smartphone", category: "Smartphone", image: "images/phone.jpg", oldPrice: 40000, price: 35000, discountBadge: "-10%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 1 Year Warranty", inStock: true },
  { id: 19, name: "65W Fast Charger", category: "Charger", image: "images/charger.jpg", oldPrice: 2000, price: 1800, discountBadge: "-10%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 6 Months Warranty", inStock: true },
  { id: 20, name: "64GB Pen Drive", category: "Pen Drive", image: "images/pendrive.jpg", oldPrice: 1000, price: 900, discountBadge: "-10%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 5 year Warranty", inStock: true },
  { id: 21, name: "Gaming Microphone", category: "Microphone", image: "images/microphone.jpg", oldPrice: 6000, price: 4200, discountBadge: "-30%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 1 Year Warranty", inStock: true },
  { id: 22, name: "Game Controller", category: "Controller", image: "images/controller.jpg", oldPrice: 4200, price: 3800, discountBadge: "-10%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 1 Year Warranty", inStock: true },
  { id: 23, name: "Laptop Cooling Pad", category: "Cooler", image: "images/cooler.jpg", oldPrice: 2600, price: 2200, discountBadge: "-15%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 6 Months Warranty", inStock: true },
  { id: 24, name: "Mini Projector", category: "Projector", image: "images/projector.jpg", oldPrice: 58500, price: 48500, discountBadge: "-20%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 2 Year Warranty", inStock: true },
  { id: 25, name: "Asus ROG Strix Laptop", category: "Laptop", image: "images/laptop.jpg", oldPrice: 185000, price: 165000, discountBadge: "-15%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 2 Years Warranty", inStock: true },
  { id: 26, name: "Mechanical RGB Keyboard", category: "Keyboard", image: "images/keyboard.jpg", oldPrice: 7500, price: 6200, discountBadge: "-18%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 1 Year Warranty", inStock: true },
  { id: 27, name: "Logitech Wireless Mouse", category: "Mouse", image: "images/mouse.jpg", oldPrice: 6500, price: 5500, discountBadge: "-15%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 1 Year Warranty", inStock: true },
  { id: 28, name: "HyperX Cloud II Headphone", category: "Headphone", image: "images/headphone.jpg", oldPrice: 9500, price: 8200, discountBadge: "-14%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 2 Years Warranty", inStock: true },
  { id: 29, name: "Samsung 4K Curved Monitor", category: "Monitor", image: "images/monitor.jpg", oldPrice: 55000, price: 48000, discountBadge: "-12%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 3 Years Warranty", inStock: true },
  { id: 30, name: "JBL Studio Speaker", category: "Speaker", image: "images/speaker.jpg", oldPrice: 8800, price: 7400, discountBadge: "-16%", rating: "★★★★★", delivery: "🚚 Free Delivery", warranty: "🛡️ 1 Year Warranty", inStock: true }
];

// Initial seed orders for immediate data display
const SEED_ORDERS = [
  {
    orderId: "TV-108809",
    customerName: "Ziniya Islam Richi",
    customerPhone: "01884443329",
    address: "Raipur, Daudkhandi, Cumilla",
    items: [
      { id: 1, name: "Gaming Laptop", price: 120000, quantity: 1, image: "images/laptop.jpg" },
      { id: 2, name: "Gaming Keyboard", price: 3500, quantity: 1, image: "images/keyboard.jpg" },
      { id: 3, name: "Gaming Mouse", price: 3800, quantity: 1, image: "images/mouse.jpg" },
      { id: 4, name: "Gaming Headphone", price: 3500, quantity: 1, image: "images/headphone.jpg" }
    ],
    subtotal: 130800,
    shippingFee: 120,
    discountAmount: 0,
    totalAmount: 130920,
    paymentMethod: "bKash / Nagad / Rocket",
    status: "Delivered",
    createdAt: "2026-09-20T19:16:17.796Z"
  },
  {
    orderId: "TV-216489",
    customerName: "Ziniya Islam Richi",
    customerPhone: "01884443329",
    address: "Raipur, Daudkhandi, Cumilla",
    items: [
      { id: 1, name: "Gaming Laptop", price: 120000, quantity: 1, image: "images/laptop.jpg" },
      { id: 2, name: "Gaming Keyboard", price: 3500, quantity: 1, image: "images/keyboard.jpg" },
      { id: 3, name: "Gaming Mouse", price: 3800, quantity: 1, image: "images/mouse.jpg" },
      { id: 4, name: "Gaming Headphone", price: 3500, quantity: 1, image: "images/headphone.jpg" }
    ],
    subtotal: 130800,
    shippingFee: 120,
    discountAmount: 0,
    totalAmount: 130920,
    paymentMethod: "bKash / Nagad / Rocket",
    status: "Shipped",
    createdAt: "2026-09-20T19:12:33.653Z"
  },
  {
    orderId: "TV-825640",
    customerName: "Ziniya islam Richi",
    customerPhone: "01884443329",
    address: "Raipur, Daudkhandi, Cumilla",
    items: [
      { id: 2, name: "Gaming Keyboard", price: 3500, quantity: 3, image: "images/keyboard.jpg" }
    ],
    subtotal: 10500,
    shippingFee: 120,
    discountAmount: 0,
    totalAmount: 10620,
    paymentMethod: "bKash / Nagad / Rocket",
    status: "Pending",
    createdAt: "2026-09-20T19:04:42.022Z"
  },
  {
    orderId: "TV-340412",
    customerName: "Ziniya islam Richi",
    customerPhone: "0188444329",
    address: "Raipur, Daudkhandi, Cumilla",
    items: [
      { id: 3, name: "Gaming Mouse", price: 3800, quantity: 2, image: "images/mouse.jpg" }
    ],
    subtotal: 7600,
    shippingFee: 120,
    discountAmount: 0,
    totalAmount: 7720,
    paymentMethod: "bKash / Nagad / Rocket",
    status: "Pending",
    createdAt: "2026-09-20T18:58:34.622Z"
  },
  {
    orderId: "TV-327569",
    customerName: "Yeasin",
    customerPhone: "01800000000",
    address: "Dhaka",
    items: [
      { id: 1, name: "Gaming Laptop", price: 120000, quantity: 1, image: "images/laptop.jpg" }
    ],
    subtotal: 120000,
    shippingFee: 0,
    discountAmount: 0,
    totalAmount: 120000,
    paymentMethod: "Cash on Delivery",
    status: "Pending",
    createdAt: "2026-09-20T12:41:34.037Z"
  }
];

// Initial seed messages
const SEED_MESSAGES = [
  {
    id: 1789907350960,
    name: "Yeasin Bhuiyan",
    email: "yeasin@example.com",
    message: "Welcome to TechVerse Store! Looking for top quality gaming gear and fast delivery.",
    createdAt: "2026-09-20T12:29:10.960Z"
  }
];

// Offline LocalStorage Data Engine
function getLocalProducts() {
    const data = localStorage.getItem("techverse_products");
    if (data) {
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch(e) {}
    }
    localStorage.setItem("techverse_products", JSON.stringify(FALLBACK_PRODUCTS));
    return [...FALLBACK_PRODUCTS];
}

function saveLocalProducts(products) {
    localStorage.setItem("techverse_products", JSON.stringify(products));
}

function getLocalOrders() {
    const data = localStorage.getItem("techverse_orders");
    if (data) {
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) return parsed;
        } catch(e) {}
    }
    localStorage.setItem("techverse_orders", JSON.stringify(SEED_ORDERS));
    return [...SEED_ORDERS];
}

function saveLocalOrders(orders) {
    localStorage.setItem("techverse_orders", JSON.stringify(orders));
}

function getLocalMessages() {
    const data = localStorage.getItem("techverse_messages");
    if (data) {
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) return parsed;
        } catch(e) {}
    }
    localStorage.setItem("techverse_messages", JSON.stringify(SEED_MESSAGES));
    return [...SEED_MESSAGES];
}

function saveLocalMessages(messages) {
    localStorage.setItem("techverse_messages", JSON.stringify(messages));
}

function updateBackendStatus(isOnline) {
    const badge = document.getElementById("backendStatusBadge");
    if (!badge) return;
    if (isOnline) {
        badge.innerHTML = "🟢 Live Backend Connected";
        badge.style.background = "rgba(16,185,129,0.15)";
        badge.style.color = "#10b981";
        badge.style.borderColor = "rgba(16,185,129,0.3)";
    } else {
        badge.innerHTML = "⚡ Local Storage Mode (Offline Ready)";
        badge.style.background = "rgba(59,130,246,0.15)";
        badge.style.color = "#3b82f6";
        badge.style.borderColor = "rgba(59,130,246,0.3)";
    }
}

async function fetchProducts() {
    const searchVal = document.querySelector("#searchInput") ? document.querySelector("#searchInput").value.trim() : "";
    let url = `${API_BASE_URL}/products?category=${encodeURIComponent(activeCategory)}&sort=${activeSort}`;
    if (searchVal) {
        url += `&search=${encodeURIComponent(searchVal)}`;
    }

    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(2500) });
        const data = await response.json();

        if (data.success && data.data) {
            productsList = data.data;
            saveLocalProducts(productsList);
            renderProducts(productsList);
            const countEl = document.getElementById("productCountBadge");
            if (countEl) countEl.textContent = `${productsList.length} Products Available`;
            updateBackendStatus(true);
            return;
        }
    } catch (error) {
        console.warn("Backend API offline or unreachable. Using local storage products.");
        updateBackendStatus(false);
    }

    // Fallback logic from local storage
    let stored = getLocalProducts();
    let filtered = [...stored];
    if (activeCategory && activeCategory !== "All") {
        filtered = filtered.filter(p => p.category && p.category.toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchVal) {
        const s = searchVal.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || (p.category && p.category.toLowerCase().includes(s)));
    }
    if (activeSort === "price-asc") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (activeSort === "price-desc") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (activeSort === "rating") {
        filtered.sort((a, b) => (b.rating ? b.rating.length : 5) - (a.rating ? a.rating.length : 5));
    }
    productsList = filtered;
    renderProducts(productsList);
    const countEl = document.getElementById("productCountBadge");
    if (countEl) countEl.textContent = `${productsList.length} Products Available`;
}

function renderProducts(products) {
    const container = document.querySelector(".products");
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:50px; background:var(--card-bg); border-radius:12px;">
            <h3>🔍 No products found matching your search.</h3>
            <p style="color:var(--text-muted); margin-top:8px;">Try searching for a different keyword or category.</p>
        </div>`;
        return;
    }

    container.innerHTML = products.map(product => {
        const isWishlisted = wishlist.includes(product.id);
        return `
            <div class="card" data-id="${product.id}">
                <div class="badge-group">
                    ${product.discountBadge ? `<span class="badge badge-discount">${product.discountBadge}</span>` : ''}
                    <span class="badge badge-hot">🔥 Hot</span>
                </div>
                <button class="btn-wishlist ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist(${product.id})">
                    ${isWishlisted ? '❤️' : '🤍'}
                </button>
                <div class="card-img-wrapper" onclick="openQuickView(${product.id})">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="category-tag">${product.category || 'General'}</div>
                <h3 onclick="openQuickView(${product.id})">${product.name}</h3>
                <div class="price-box">
                    ${product.oldPrice ? `<del>৳ ${Number(product.oldPrice).toLocaleString()}</del>` : ''}
                    <span class="price">৳ ${Number(product.price).toLocaleString()}</span>
                </div>
                <div class="meta-info">
                    <span><span class="stars">${product.rating || '★★★★★'}</span> (4.9/5)</span>
                    <span>${product.warranty || '🛡️ 1 Year Warranty'}</span>
                    <span class="stock-badge">${product.inStock ? '✔ In Stock' : '❌ Out of Stock'}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-quick" onclick="openQuickView(${product.id})">👁️ Quick</button>
                    <button class="btn-buy" onclick="addToCartById(${product.id})">🛒 Add to Cart</button>
                </div>
            </div>
        `;
    }).join("");
}

function filterCategory(cat, btnElement) {
    activeCategory = cat;
    document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
    if (btnElement) btnElement.classList.add("active");
    fetchProducts();
}

function handleSortChange(sortValue) {
    activeSort = sortValue;
    fetchProducts();
}


// ==================== WISHLIST SYSTEM ====================

function toggleWishlist(id) {
    const idx = wishlist.indexOf(id);
    if (idx > -1) {
        wishlist.splice(idx, 1);
        showToast("Removed from wishlist 🤍");
    } else {
        wishlist.push(id);
        showToast("Added to wishlist ❤️");
    }
    localStorage.setItem("techverse_wishlist", JSON.stringify(wishlist));
    updateWishlistUI();
    renderProducts(productsList);
}

function updateWishlistUI() {
    const el = document.getElementById("wishlistCount");
    if (el) el.textContent = wishlist.length;
}


// ==================== CART DRAWER LOGIC ====================

function addToCartById(id) {
    const product = productsList.find(p => p.id === id);
    if (!product) return;

    const existing = cartItems.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cartItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    updateCartUI();
    toggleCartDrawer(true);
    showToast(`🎉 "${product.name}" added to cart!`);
}

function updateCartUI() {
    const cartCountEl = document.getElementById("cartCount");
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    if (cartCountEl) cartCountEl.textContent = totalItems;
    renderCartDrawer();
}

function renderCartDrawer() {
    const cartListEl = document.getElementById("drawerCartItems");
    const subtotalEl = document.getElementById("drawerSubtotal");
    const grandTotalEl = document.getElementById("drawerGrandTotal");
    const discountRow = document.getElementById("drawerDiscountRow");
    const discountEl = document.getElementById("drawerDiscountAmount");

    if (!cartListEl) return;

    if (cartItems.length === 0) {
        cartListEl.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">
            🛒 Your cart is empty.<br><small>Browse products and add items to order!</small>
        </div>`;
        if (subtotalEl) subtotalEl.textContent = "৳ 0";
        if (grandTotalEl) grandTotalEl.textContent = "৳ 0";
        return;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;

    if (appliedCoupon) {
        discount = appliedCoupon.discountAmount;
        if (discountRow) discountRow.style.display = "flex";
        if (discountEl) discountEl.textContent = `- ৳ ${discount.toLocaleString()}`;
    } else {
        if (discountRow) discountRow.style.display = "none";
    }

    const grandTotal = Math.max(0, subtotal + currentShippingFee - discount);

    cartListEl.innerHTML = cartItems.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">৳ ${item.price.toLocaleString()}</div>
            </div>
            <div class="cart-qty-ctrl">
                <button onclick="changeQuantity(${item.id}, -1)">-</button>
                <span><b>${item.quantity}</b></span>
                <button onclick="changeQuantity(${item.id}, 1)">+</button>
                <button onclick="removeFromCart(${item.id})" style="color:red; background:none; border:none; margin-left:6px; cursor:pointer;">🗑️</button>
            </div>
        </div>
    `).join("");

    if (subtotalEl) subtotalEl.textContent = `৳ ${subtotal.toLocaleString()}`;
    if (grandTotalEl) grandTotalEl.textContent = `৳ ${grandTotal.toLocaleString()}`;
}

function changeQuantity(id, delta) {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(id);
    } else {
        updateCartUI();
    }
}

function removeFromCart(id) {
    cartItems = cartItems.filter(i => i.id !== id);
    updateCartUI();
}

function toggleCartDrawer(open = true) {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("drawerOverlay");
    if (drawer && overlay) {
        if (open) {
            drawer.classList.add("open");
            overlay.style.display = "block";
        } else {
            drawer.classList.remove("open");
            overlay.style.display = "none";
        }
    }
}

function updateShippingFee(fee) {
    currentShippingFee = parseInt(fee);
    renderCartDrawer();
}


// ==================== COUPON SYSTEM ====================

async function applyCouponCode() {
    const input = document.getElementById("couponInput");
    if (!input) return;

    const code = input.value.trim();
    if (!code) {
        alert("Please enter a coupon code (e.g. TECHVERSE10)");
        return;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, subtotal })
        });

        const data = await response.json();

        if (data.success) {
            appliedCoupon = data.data;
            showToast(`✅ ${data.message}`);
            renderCartDrawer();
        } else {
            alert(`⚠️ ${data.message}`);
        }
    } catch (e) {
        // Fallback for demo codes if offline
        if (code.toUpperCase() === "TECHVERSE10") {
            const disc = Math.round(subtotal * 0.1);
            appliedCoupon = { code: "TECHVERSE10", discountAmount: disc, description: "10% OFF" };
            showToast("✅ Coupon TECHVERSE10 Applied!");
            renderCartDrawer();
        } else {
            alert("Invalid promo code. Try 'TECHVERSE10'");
        }
    }
}


// ==================== QUICK VIEW MODAL ====================

function openQuickView(id) {
    const product = productsList.find(p => p.id === id);
    if (!product) return;

    const content = document.getElementById("quickViewContent");
    if (!content) return;

    content.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; align-items:center;">
            <div style="background:var(--bg-main); padding:20px; border-radius:12px; text-align:center;">
                <img src="${product.image}" alt="${product.name}" style="max-width:100%; max-height:220px; object-fit:contain;">
            </div>
            <div>
                <span style="background:var(--primary); color:white; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700;">${product.category || 'Tech'}</span>
                <h2 style="font-size:24px; margin:10px 0;">${product.name}</h2>
                <div style="font-size:22px; font-weight:800; color:var(--primary); margin-bottom:15px;">
                    ৳ ${Number(product.price).toLocaleString()} 
                    ${product.oldPrice ? `<del style="font-size:15px; color:var(--danger); margin-left:8px;">৳ ${Number(product.oldPrice).toLocaleString()}</del>` : ''}
                </div>
                <p style="color:var(--text-muted); font-size:14px; margin-bottom:15px;">
                    ⭐ Rating: ${product.rating || '★★★★★'} (4.9/5 verified reviews)<br>
                    🛡️ Warranty: ${product.warranty || '1 Year Official Warranty'}<br>
                    🚚 Delivery: ${product.delivery || 'Free Delivery'}<br>
                    📦 Stock: <b style="color:var(--success);">${product.inStock ? 'In Stock Ready to Ship' : 'Out of Stock'}</b>
                </p>
                <button onclick="addToCartById(${product.id}); toggleQuickModal(false);" style="width:100%; background:var(--primary); color:white; padding:12px; border-radius:8px; font-weight:700; border:none; cursor:pointer;">
                    🛒 Add to Cart & Order
                </button>
            </div>
        </div>
    `;

    toggleQuickModal(true);
}

function toggleQuickModal(open = true) {
    const modal = document.getElementById("quickModal");
    if (modal) modal.style.display = open ? "flex" : "none";
}


// ==================== CHECKOUT & INVOICE GENERATOR ====================

function openCheckoutModal() {
    if (cartItems.length === 0) {
        alert("⚠️ Your cart is empty!");
        return;
    }
    toggleCartDrawer(false);
    const modal = document.getElementById("checkoutModal");
    if (modal) modal.style.display = "flex";
}

function toggleCheckoutModal(open = true) {
    const modal = document.getElementById("checkoutModal");
    if (modal) modal.style.display = open ? "flex" : "none";
}

async function submitOrder(e) {
    e.preventDefault();

    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const address = document.getElementById("custAddress").value.trim();
    const paymentMethod = document.getElementById("paymentMethod").value;

    if (!name || !phone || !address) {
        alert("Please complete all shipping details.");
        return;
    }

    if (cartItems.length === 0) {
        alert("⚠️ Your cart is empty!");
        return;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const grandTotal = Math.max(0, subtotal + currentShippingFee - discount);

    const newOrder = {
        orderId: 'TV-' + Math.floor(100000 + Math.random() * 900000),
        customerName: name,
        customerPhone: phone,
        address: address,
        items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity
        })),
        subtotal: subtotal,
        shippingFee: currentShippingFee,
        discountAmount: discount,
        totalAmount: grandTotal,
        paymentMethod: paymentMethod,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };

    // 1. Save to local storage first (reliable offline persistence)
    const existingOrders = getLocalOrders();
    existingOrders.unshift(newOrder);
    saveLocalOrders(existingOrders);

    // 2. Attempt to save to backend API
    try {
        await fetch(`${API_BASE_URL}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newOrder),
            signal: AbortSignal.timeout(3000)
        });
        updateBackendStatus(true);
    } catch (err) {
        console.warn("Backend offline; order stored securely in local database.", err);
        updateBackendStatus(false);
    }

    // 3. Update admin stats immediately
    loadAdminStats();

    // 4. Render invoice & clear cart
    renderInvoice(newOrder);
    cartItems = [];
    appliedCoupon = null;
    updateCartUI();
    toggleCheckoutModal(false);
    document.getElementById("checkoutForm").reset();
    showToast(`🎉 Order #${newOrder.orderId} placed successfully!`);
}

function renderInvoice(order) {
    const container = document.getElementById("invoiceContent");
    if (!container) return;

    const formattedDate = order.createdAt 
        ? new Date(order.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleDateString();

    const itemsHtml = (order.items || []).map((item, index) => {
        const qty = item.quantity || 1;
        const price = Number(item.price || 0);
        const itemTotal = price * qty;
        return `
            <tr>
                <td style="width:40px; text-align:center;">${index + 1}</td>
                <td><strong>${item.name}</strong></td>
                <td>৳ ${price.toLocaleString()}</td>
                <td style="text-align:center;">${qty}</td>
                <td style="text-align:right;">৳ ${itemTotal.toLocaleString()}</td>
            </tr>
        `;
    }).join("");

    const subtotal = Number(order.subtotal || order.totalAmount || 0);
    const shipping = Number(order.shippingFee !== undefined ? order.shippingFee : 60);
    const discount = Number(order.discountAmount || 0);
    const grandTotal = Number(order.totalAmount || (subtotal + shipping - discount));

    container.innerHTML = `
        <div class="invoice-box">
            <!-- INVOICE HEADER -->
            <div class="invoice-header">
                <div class="invoice-brand">
                    <h2>💻 TechVerse Online Store</h2>
                    <p>Level 4, Tech Plaza, Multiplan Center, Dhaka-1205</p>
                    <p>Phone: +880 1820-727102 | Email: support@techverse.com</p>
                </div>
                <div class="invoice-meta">
                    <span class="invoice-status-badge">✓ ${order.status || 'CONFIRMED'}</span>
                    <div class="invoice-id">Order #${order.orderId}</div>
                    <div class="invoice-date">${formattedDate}</div>
                </div>
            </div>

            <!-- INVOICE DETAILS GRID -->
            <div class="invoice-details-grid">
                <div class="invoice-details-card">
                    <h4>📍 Billed To</h4>
                    <p><strong>${order.customerName || 'Valued Customer'}</strong></p>
                    <p>Phone: ${order.customerPhone || 'N/A'}</p>
                    <p>Address: ${order.address || 'N/A'}</p>
                </div>
                <div class="invoice-details-card">
                    <h4>📋 Order Details</h4>
                    <p>Payment: <strong>${order.paymentMethod || 'Cash on Delivery'}</strong></p>
                    <p>Status: <strong style="color:var(--warning,#f59e0b);">${order.status || 'Pending Delivery'}</strong></p>
                    <p>Delivery: <strong>Standard Express Courier</strong></p>
                </div>
            </div>

            <!-- INVOICE ITEMS TABLE -->
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th style="width:40px; text-align:center;">#</th>
                        <th>Item</th>
                        <th>Price</th>
                        <th style="text-align:center;">Qty</th>
                        <th style="text-align:right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <!-- INVOICE SUMMARY & NOTES -->
            <div class="invoice-summary-wrapper">
                <div class="invoice-notes">
                    <strong>📌 Important Information:</strong>
                    <ul style="margin: 4px 0 0 16px; padding: 0;">
                        <li>All products carry standard manufacturer warranty.</li>
                        <li>Please retain this invoice receipt for any service or return claims.</li>
                        <li>Thank you for shopping with TechVerse!</li>
                    </ul>
                </div>

                <div class="invoice-summary-box">
                    <div class="invoice-summary-row">
                        <span>Subtotal:</span>
                        <span>৳ ${subtotal.toLocaleString()}</span>
                    </div>
                    <div class="invoice-summary-row">
                        <span>Shipping Fee:</span>
                        <span>৳ ${shipping.toLocaleString()}</span>
                    </div>
                    ${discount > 0 ? `
                        <div class="invoice-summary-row" style="color:var(--danger,#ef4444);">
                            <span>Discount Coupon:</span>
                            <span>- ৳ ${discount.toLocaleString()}</span>
                        </div>
                    ` : ''}
                    <div class="invoice-grand-total">
                        <span>Grand Total:</span>
                        <span>৳ ${grandTotal.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <!-- INVOICE FOOTER -->
            <div class="invoice-footer-banner">
                <p>TechVerse Online Store | www.techverse.com | Support Helpline: +880 1820-727102</p>
                <div class="invoice-watermark">✓ OFFICIAL E-RECEIPT - VERIFIED ORDER</div>
            </div>
        </div>
    `;

    toggleInvoiceModal(true);
}

function toggleInvoiceModal(open = true) {
    const modal = document.getElementById("invoiceModal");
    if (modal) modal.style.display = open ? "flex" : "none";
}


// ==================== ADMIN DASHBOARD ====================

function toggleAdminModal(open = true) {
    const modal = document.getElementById("adminModal");
    if (modal) {
        modal.style.display = open ? "flex" : "none";
        if (open) loadAdminData();
    }
}

async function loadAdminData() {
    loadAdminStats();
    const activeTab = document.querySelector(".admin-tab.active");
    if (activeTab) {
        if (activeTab.textContent.includes("Manage Products")) {
            loadAdminProducts();
        } else if (activeTab.textContent.includes("Customer Messages")) {
            loadAdminMessages();
        } else {
            loadAdminOrders();
        }
    } else {
        loadAdminOrders();
    }
}

async function loadAdminStats() {
    // 1. Compute stats immediately from local data (instant, zero delay, never stuck at 0)
    const prods = getLocalProducts();
    const orders = getLocalOrders();
    const msgs = getLocalMessages();

    const revenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const soldItems = orders.reduce((sum, o) => {
        if (Array.isArray(o.items)) {
            return sum + o.items.reduce((iSum, itm) => iSum + (Number(itm.quantity) || 1), 0);
        }
        return sum;
    }, 0);

    const renderStats = (data) => {
        const statProds = document.getElementById("statProducts");
        const statSold = document.getElementById("statSoldItems");
        const statOrd = document.getElementById("statOrders");
        const statRev = document.getElementById("statRevenue");
        const statMsg = document.getElementById("statMessages");

        if (statProds) statProds.textContent = data.totalProducts ?? prods.length;
        if (statSold) statSold.textContent = data.totalSoldItems ?? soldItems;
        if (statOrd) statOrd.textContent = data.totalOrders ?? orders.length;
        if (statRev) statRev.textContent = `৳ ${(data.totalRevenueBDT ?? revenue).toLocaleString()}`;
        if (statMsg) statMsg.textContent = data.totalMessages ?? msgs.length;
    };

    renderStats({
        totalProducts: prods.length,
        totalSoldItems: soldItems,
        totalOrders: orders.length,
        totalRevenueBDT: revenue,
        totalMessages: msgs.length
    });

    // 2. Fetch from backend API if online
    try {
        const response = await fetch(`${API_BASE_URL}/stats`, { signal: AbortSignal.timeout(2500) });
        const data = await response.json();
        if (data.success && data.stats) {
            updateBackendStatus(true);
            renderStats(data.stats);
        }
    } catch (e) {
        updateBackendStatus(false);
    }
}

async function switchAdminTab(tab, btn) {
    document.querySelectorAll(".admin-tab").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");

    if (tab === 'orders') {
        loadAdminOrders();
    } else if (tab === 'products') {
        loadAdminProducts();
    } else if (tab === 'messages') {
        loadAdminMessages();
    }
}

async function loadAdminOrders() {
    const container = document.getElementById("adminOrdersList");
    if (!container) return;

    let orders = getLocalOrders();

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, { signal: AbortSignal.timeout(2500) });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
            orders = data.data;
            saveLocalOrders(orders);
            updateBackendStatus(true);
        }
    } catch (e) {
        updateBackendStatus(false);
    }

    window.adminOrdersData = orders;

    if (!orders || orders.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">
            <p style="font-size:16px;">📭 No customer orders placed yet.</p>
            <small>Orders will appear here as soon as customers buy products.</small>
        </div>`;
        return;
    }

    container.innerHTML = orders.map((o, idx) => {
        const itemsSummary = (o.items || []).map(i => `${i.name} (x${i.quantity || 1})`).join(", ");
        const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';

        return `
            <div style="background:var(--bg-main); padding:14px; margin-bottom:12px; border-radius:8px; border-left:4px solid var(--primary); box-shadow:0 1px 4px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div>
                        <strong style="font-size:15px; color:var(--text-color);">Order #${o.orderId}</strong>
                        <span style="font-size:12px; color:var(--text-muted); margin-left:8px;">🕒 ${dateStr}</span>
                    </div>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <button onclick="printAdminOrder(${idx})" style="padding:5px 12px; background:var(--primary); color:white; border:none; border-radius:4px; font-size:12px; font-weight:700; cursor:pointer;">🖨️ Invoice</button>
                        <select onchange="updateOrderStatus('${o.orderId}', this.value)" style="padding:4px 8px; border-radius:4px; font-weight:700; background:var(--card-bg); color:var(--text-color); border:1px solid var(--border-color);">
                            <option value="Pending" ${o.status==='Pending'?'selected':''}>⏳ Pending</option>
                            <option value="Shipped" ${o.status==='Shipped'?'selected':''}>🚚 Shipped</option>
                            <option value="Delivered" ${o.status==='Delivered'?'selected':''}>✅ Delivered</option>
                            <option value="Cancelled" ${o.status==='Cancelled'?'selected':''}>❌ Cancelled</option>
                        </select>
                        <button onclick="deleteAdminOrder('${o.orderId}')" title="Delete Order" style="background:#ef444420; color:#ef4444; border:1px solid #ef444440; padding:4px 8px; border-radius:4px; font-weight:700; cursor:pointer;">🗑️</button>
                    </div>
                </div>
                <div style="margin-top:8px; font-size:13px; line-height:1.5;">
                    <div>Customer: <b>${o.customerName}</b> (${o.customerPhone})</div>
                    <div>Address: <span>${o.address}</span></div>
                    <div>Items: <span style="color:var(--text-muted);">${itemsSummary || 'N/A'}</span></div>
                    <div style="margin-top:4px;">Total Amount: <b style="color:var(--primary); font-size:14px;">৳ ${Number(o.totalAmount).toLocaleString()}</b> <span style="font-size:11px; color:var(--text-muted);">(${o.paymentMethod||'COD'})</span></div>
                </div>
            </div>
        `;
    }).join("");
}

function printAdminOrder(index) {
    if (window.adminOrdersData && window.adminOrdersData[index]) {
        renderInvoice(window.adminOrdersData[index]);
    }
}

async function updateOrderStatus(orderId, status) {
    let orders = getLocalOrders();
    const idx = orders.findIndex(o => o.orderId === orderId);
    if (idx !== -1) {
        orders[idx].status = status;
        saveLocalOrders(orders);
    }

    try {
        await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        updateBackendStatus(true);
    } catch (e) {
        updateBackendStatus(false);
    }

    showToast(`Order #${orderId} status changed to ${status}`);
    loadAdminStats();
}

async function deleteAdminOrder(orderId) {
    if (!confirm(`Are you sure you want to delete Order #${orderId}?`)) return;

    let orders = getLocalOrders();
    orders = orders.filter(o => o.orderId !== orderId);
    saveLocalOrders(orders);

    try {
        await fetch(`${API_BASE_URL}/orders/${orderId}`, { method: "DELETE" });
    } catch (e) {}

    showToast(`Order #${orderId} deleted.`);
    loadAdminOrders();
    loadAdminStats();
}

async function loadAdminProducts() {
    const container = document.getElementById("adminOrdersList");
    if (!container) return;

    let products = getLocalProducts();

    try {
        const response = await fetch(`${API_BASE_URL}/products`, { signal: AbortSignal.timeout(2500) });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
            products = data.data;
            saveLocalProducts(products);
            updateBackendStatus(true);
        }
    } catch (e) {
        updateBackendStatus(false);
    }

    if (!products || products.length === 0) {
        container.innerHTML = `<p style="padding:20px; text-align:center; color:var(--text-muted);">No products in store database.</p>`;
        return;
    }

    container.innerHTML = products.map(p => `
        <div style="background:var(--bg-main); padding:10px 14px; margin-bottom:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid var(--warning); box-shadow:0 1px 4px rgba(0,0,0,0.05);">
            <div style="display:flex; align-items:center; gap:12px;">
                <img src="${p.image || 'images/laptop.jpg'}" alt="${p.name}" style="width:40px; height:40px; object-fit:contain; border-radius:4px; background:white; padding:2px; border:1px solid var(--border-color);">
                <div>
                    <strong style="color:var(--text-color);">#${p.id} ${p.name}</strong> <span style="font-size:12px; color:var(--text-muted);">(${p.category||'General'})</span><br>
                    <small style="color:var(--primary); font-weight:700;">৳ ${Number(p.price).toLocaleString()}</small>
                </div>
            </div>
            <button onclick="deleteProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}')" style="background:var(--danger); color:white; border:none; padding:6px 14px; border-radius:6px; font-weight:700; cursor:pointer;">
                🗑️ Delete
            </button>
        </div>
    `).join("");
}

async function deleteProduct(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}" from store database?`)) return;

    let products = getLocalProducts();
    products = products.filter(p => p.id !== id);
    saveLocalProducts(products);
    productsList = products;

    try {
        await fetch(`${API_BASE_URL}/products/${id}`, { method: "DELETE" });
    } catch (e) {}

    showToast(`🗑️ Product "${name}" deleted!`);
    loadAdminProducts();
    renderProducts(productsList);
    loadAdminStats();
}

async function submitAddProduct(e) {
    e.preventDefault();
    const name = document.getElementById("prodName").value.trim();
    const category = document.getElementById("prodCategory").value.trim();
    const price = parseInt(document.getElementById("prodPrice").value);
    const oldPriceInput = document.getElementById("prodOldPrice");
    const oldPrice = oldPriceInput && oldPriceInput.value ? parseInt(oldPriceInput.value) : Math.round(price * 1.2);
    const imageInput = document.getElementById("prodImage");
    const image = (imageInput && imageInput.value.trim()) ? imageInput.value.trim() : "images/laptop.jpg";

    if (!name || isNaN(price)) {
        alert("Please enter a valid product name and price.");
        return;
    }

    const newProd = {
        id: Date.now(),
        name,
        category: category || "General",
        price,
        oldPrice,
        image,
        discountBadge: `-${Math.round((1 - price / oldPrice) * 100)}%`,
        rating: "★★★★★",
        delivery: "🚚 Free Delivery",
        warranty: "🛡️ 1 Year Warranty",
        inStock: true
    };

    // 1. Save to local storage
    const products = getLocalProducts();
    products.unshift(newProd);
    saveLocalProducts(products);
    productsList = products;

    // 2. Send to backend if online
    try {
        await fetch(`${API_BASE_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProd),
            signal: AbortSignal.timeout(3000)
        });
        updateBackendStatus(true);
    } catch (err) {
        updateBackendStatus(false);
    }

    alert(`✅ Product "${name}" added to TechVerse store successfully!`);
    document.getElementById("addProductForm").reset();
    if (imageInput) imageInput.value = "images/laptop.jpg";

    renderProducts(productsList);
    loadAdminStats();

    // If currently on products tab, refresh it
    const activeTab = document.querySelector(".admin-tab.active");
    if (activeTab && activeTab.textContent.includes("Manage Products")) {
        loadAdminProducts();
    }
}

async function loadAdminMessages() {
    const container = document.getElementById("adminOrdersList");
    if (!container) return;

    let messages = getLocalMessages();

    try {
        const response = await fetch(`${API_BASE_URL}/contact`, { signal: AbortSignal.timeout(2500) });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
            messages = data.data;
            saveLocalMessages(messages);
            updateBackendStatus(true);
        }
    } catch (e) {
        updateBackendStatus(false);
    }

    if (!messages || messages.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">
            <p style="font-size:16px;">💬 No customer messages received yet.</p>
            <small>Customer inquiries submitted through the contact form will appear here.</small>
        </div>`;
        return;
    }

    container.innerHTML = messages.map(m => {
        const dateStr = m.createdAt ? new Date(m.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
        return `
            <div style="background:var(--bg-main); padding:14px; margin-bottom:12px; border-radius:8px; border-left:4px solid var(--accent); box-shadow:0 1px 4px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div>
                        <strong style="color:var(--text-color); font-size:15px;">👤 ${m.name}</strong>
                        <span style="font-size:12px; color:var(--text-muted); margin-left:8px;">✉️ ${m.email}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:11px; color:var(--text-muted);">🕒 ${dateStr}</span>
                        <button onclick="deleteAdminMessage(${m.id})" style="background:#ef444420; color:#ef4444; border:1px solid #ef444440; padding:4px 10px; border-radius:4px; font-weight:700; cursor:pointer;">🗑️ Delete</button>
                    </div>
                </div>
                <p style="margin-top:10px; font-size:13px; line-height:1.5; color:var(--text-color); background:var(--card-bg); padding:10px 12px; border-radius:6px; border:1px solid var(--border-color);">
                    "${m.message}"
                </p>
            </div>
        `;
    }).join("");
}

async function deleteAdminMessage(id) {
    if (!confirm("Are you sure you want to delete this customer message?")) return;

    let messages = getLocalMessages();
    messages = messages.filter(m => m.id !== id);
    saveLocalMessages(messages);

    try {
        await fetch(`${API_BASE_URL}/contact/${id}`, { method: "DELETE" });
    } catch (e) {}

    showToast("Customer message deleted.");
    loadAdminMessages();
    loadAdminStats();
}


// ==================== HELPERS & TIMER ====================

function darkMode() {
    document.body.classList.toggle("dark");
}

function startFlashTimer() {
    const timerBox = document.getElementById("flashTimer");
    if (!timerBox) return;

    let totalSec = 5 * 3600 + 42 * 60 + 19;
    setInterval(() => {
        if (totalSec <= 0) return;
        totalSec--;
        const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');
        timerBox.textContent = `${h}h ${m}m ${s}s`;
    }, 1000);
}

function showToast(message) {
    let toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: var(--primary);
        color: white;
        padding: 14px 24px;
        border-radius: 30px;
        box-shadow: 0 8px 25px rgba(13,110,253,0.4);
        z-index: 4000;
        font-weight: 700;
        transition: opacity 0.4s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

function setupEventListeners() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            fetchProducts();
        });
    }

    const contactForm = document.querySelector("#contact form");
    if (contactForm) {
        contactForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const inputs = contactForm.querySelectorAll("input");
            const textarea = contactForm.querySelector("textarea");

            const name = inputs[0] ? inputs[0].value.trim() : "";
            const email = inputs[1] ? inputs[1].value.trim() : "";
            const message = textarea ? textarea.value.trim() : "";

            if (!name || !email || !message) {
                alert("Please fill in all contact fields.");
                return;
            }

            const newMsg = {
                id: Date.now(),
                name,
                email,
                message,
                createdAt: new Date().toISOString()
            };

            // Save to local storage
            const msgs = getLocalMessages();
            msgs.unshift(newMsg);
            saveLocalMessages(msgs);

            // Send to backend if available
            try {
                await fetch(`${API_BASE_URL}/contact`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newMsg),
                    signal: AbortSignal.timeout(3000)
                });
                updateBackendStatus(true);
            } catch (err) {
                updateBackendStatus(false);
            }

            alert(`✅ Thank you, ${name}! Your message has been received.`);
            contactForm.reset();
            loadAdminStats();
        });
    }
}
