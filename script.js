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
    fetchProducts();
    setupEventListeners();
    updateCartUI();
    updateWishlistUI();
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

async function fetchProducts() {
    const searchVal = document.querySelector("#searchInput") ? document.querySelector("#searchInput").value.trim() : "";
    let url = `${API_BASE_URL}/products?category=${encodeURIComponent(activeCategory)}&sort=${activeSort}`;
    if (searchVal) {
        url += `&search=${encodeURIComponent(searchVal)}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data) {
            productsList = data.data;
            renderProducts(productsList);
            const countEl = document.getElementById("productCountBadge");
            if (countEl) countEl.textContent = `${productsList.length} Products Available`;
            return;
        }
    } catch (error) {
        console.warn("Backend API offline. Using local fallback products.", error);
    }

    // Fallback logic when Backend REST API is not reachable
    let filtered = [...FALLBACK_PRODUCTS];
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

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const grandTotal = Math.max(0, subtotal + currentShippingFee - discount);

    const orderPayload = {
        customerName: name,
        customerPhone: phone,
        address: address,
        items: cartItems,
        shippingFee: currentShippingFee,
        discountAmount: discount,
        paymentMethod: paymentMethod
    };

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload)
        });

        const data = await response.json();

        if (data.success) {
            renderInvoice(data.data);
            cartItems = [];
            appliedCoupon = null;
            updateCartUI();
            toggleCheckoutModal(false);
            document.getElementById("checkoutForm").reset();
        } else {
            alert(`Order submission error: ${data.message}`);
        }
    } catch (e) {
        // Fallback offline invoice
        const offlineOrder = {
            orderId: 'TV-' + Math.floor(100000 + Math.random() * 900000),
            customerName: name,
            customerPhone: phone,
            address: address,
            items: cartItems,
            subtotal: subtotal,
            shippingFee: currentShippingFee,
            discountAmount: discount,
            totalAmount: grandTotal,
            paymentMethod: paymentMethod,
            createdAt: new Date().toISOString()
        };
        renderInvoice(offlineOrder);
        cartItems = [];
        appliedCoupon = null;
        updateCartUI();
        toggleCheckoutModal(false);
    }
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
    loadAdminOrders();
}

async function loadAdminStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        const data = await response.json();
        if (data.success) {
            const s = data.stats;
            document.getElementById("statProducts").textContent = s.totalProducts || 0;
            document.getElementById("statOrders").textContent = s.totalOrders || 0;
            document.getElementById("statRevenue").textContent = `৳ ${(s.totalRevenueBDT || 0).toLocaleString()}`;
            document.getElementById("statMessages").textContent = s.totalMessages || 0;
        }
    } catch (e) {
        console.warn("Backend stats unavailable.", e);
    }
}

async function switchAdminTab(tab, btn) {
    document.querySelectorAll(".admin-tab").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");

    if (tab === 'orders') {
        loadAdminOrders();
    } else if (tab === 'products') {
        loadAdminProducts();
    }
}

async function loadAdminOrders() {
    const container = document.getElementById("adminOrdersList");
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/orders`);
        const data = await response.json();

        if (data.success && data.data) {
            if (data.data.length === 0) {
                container.innerHTML = `<p style="padding:15px; color:var(--text-muted);">No orders placed yet.</p>`;
                return;
            }

            window.adminOrdersData = data.data;
            container.innerHTML = data.data.map((o, idx) => `
                <div style="background:var(--bg-main); padding:14px; margin-bottom:12px; border-radius:8px; border-left:4px solid var(--primary);">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                        <strong>Order #${o.orderId}</strong>
                        <div style="display:flex; gap:8px; align-items:center;">
                            <button onclick="printAdminOrder(${idx})" style="padding:4px 10px; background:var(--primary); color:white; border:none; border-radius:4px; font-size:12px; font-weight:700; cursor:pointer;">🖨️ View & Print Invoice</button>
                            <select onchange="updateOrderStatus('${o.orderId}', this.value)" style="padding:4px 8px; border-radius:4px; font-weight:700;">
                                <option value="Pending" ${o.status==='Pending'?'selected':''}>Pending</option>
                                <option value="Shipped" ${o.status==='Shipped'?'selected':''}>Shipped</option>
                                <option value="Delivered" ${o.status==='Delivered'?'selected':''}>Delivered</option>
                                <option value="Cancelled" ${o.status==='Cancelled'?'selected':''}>Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <small>Customer: <b>${o.customerName}</b> (${o.customerPhone})</small><br>
                    <small>Address: ${o.address}</small><br>
                    <small>Total: <b style="color:var(--primary);">৳ ${Number(o.totalAmount).toLocaleString()}</b> (${o.paymentMethod||'COD'})</small>
                </div>
            `).join("");
        }
    } catch (e) {
        container.innerHTML = `<p style="padding:15px; color:var(--text-muted);">Unable to connect to orders API.</p>`;
    }
}

function printAdminOrder(index) {
    if (window.adminOrdersData && window.adminOrdersData[index]) {
        renderInvoice(window.adminOrdersData[index]);
    }
}

async function loadAdminProducts() {
    const container = document.getElementById("adminOrdersList");
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();

        if (data.success && data.data) {
            if (data.data.length === 0) {
                container.innerHTML = `<p style="padding:15px; color:var(--text-muted);">No products in store database.</p>`;
                return;
            }

            container.innerHTML = data.data.map(p => `
                <div style="background:var(--bg-main); padding:10px 14px; margin-bottom:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid var(--warning);">
                    <div>
                        <strong>#${p.id} ${p.name}</strong> <span style="font-size:12px; color:var(--text-muted);">(${p.category||'General'})</span><br>
                        <small style="color:var(--primary); font-weight:700;">৳ ${Number(p.price).toLocaleString()}</small>
                    </div>
                    <button onclick="deleteProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}')" style="background:var(--danger); color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer;">
                        🗑️ Delete
                    </button>
                </div>
            `).join("");
        }
    } catch (e) {
        container.innerHTML = `<p style="padding:15px; color:var(--text-muted);">Unable to load products list.</p>`;
    }
}

async function deleteProduct(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}" from store database?`)) return;

    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: "DELETE"
        });
        const data = await response.json();

        if (data.success) {
            showToast(`🗑️ Product "${name}" deleted!`);
            loadAdminProducts();
            fetchProducts();
            loadAdminStats();
        } else {
            alert(`Delete failed: ${data.message}`);
        }
    } catch (e) {
        alert("Server error. Could not delete product.");
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        if (data.success) {
            showToast(`Order #${orderId} status changed to ${status}`);
            loadAdminStats();
        }
    } catch (e) {
        alert("Failed to update order status.");
    }
}

async function submitAddProduct(e) {
    e.preventDefault();
    const name = document.getElementById("prodName").value.trim();
    const category = document.getElementById("prodCategory").value.trim();
    const price = document.getElementById("prodPrice").value;

    if (!name || !price) {
        alert("Name and Price required.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, category, price: parseInt(price) })
        });
        const data = await response.json();
        if (data.success) {
            alert(`✅ Product "${name}" added to TechVerse store!`);
            document.getElementById("addProductForm").reset();
            fetchProducts();
            loadAdminStats();
        }
    } catch (e) {
        alert("Server error. Could not add product.");
    }
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

            try {
                const response = await fetch(`${API_BASE_URL}/contact`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, message })
                });
                const data = await response.json();
                if (data.success) {
                    alert(`✅ Thank you, ${name}! Your message has been received.`);
                    contactForm.reset();
                }
            } catch (err) {
                alert("Message sent (Offline mode).");
                contactForm.reset();
            }
        });
    }
}
