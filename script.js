// ==========================================================================
// TECHVERSE ENTERPRISE E-COMMERCE CORE SCRIPT
// ==========================================================================

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

// Initializer
document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initApp();
    startFlashTimer();
});

function initTheme() {
    const savedTheme = localStorage.getItem("techverse_theme");
    const toggleBtn = document.getElementById("themeToggleBtn");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        if (toggleBtn) toggleBtn.textContent = "☀️";
    } else {
        document.body.classList.remove("dark");
        if (toggleBtn) toggleBtn.textContent = "🌙";
    }
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("techverse_theme", isDark ? "dark" : "light");
    const toggleBtn = document.getElementById("themeToggleBtn");
    if (toggleBtn) toggleBtn.textContent = isDark ? "☀️" : "🌙";
    showToast(isDark ? "🌙 Dark Mode enabled" : "☀️ Light Mode enabled");
}

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
  }
];

// Initial seed messages
const SEED_MESSAGES = [
  {
    id: 1789907350960,
    name: "Md Yeasin Bhuiyan",
    email: "yeasin@techverse.com",
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
        badge.innerHTML = "⚡ Local Database Mode (Active)";
        badge.style.background = "rgba(59,130,246,0.15)";
        badge.style.color = "#3b82f6";
        badge.style.borderColor = "rgba(59,130,246,0.3)";
    }
}

// ==================== PRODUCTS API & RENDERING ====================

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
            if (countEl) countEl.textContent = `${productsList.length} Verified Products In Catalog`;
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
    if (countEl) countEl.textContent = `${productsList.length} Verified Products In Catalog`;
}

function renderProducts(products) {
    const container = document.querySelector(".products");
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:50px 20px; background:var(--card-bg); border-radius:var(--radius-md); border:1px solid var(--border-color);">
                <div style="font-size:42px; margin-bottom:12px;">🔍</div>
                <h3 style="font-size:20px; margin-bottom:8px;">No products found matching your filter</h3>
                <p style="color:var(--text-muted); margin-bottom:16px;">Try searching with a different term or clear the category filters.</p>
                <button onclick="filterCategory('All'); clearSearchInput();" style="background:var(--primary); color:white; border:none; padding:10px 24px; border-radius:var(--radius-full); font-weight:700; cursor:pointer;">
                    Show All Catalog
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => {
        const isWishlisted = wishlist.includes(product.id);
        const originalPrice = product.oldPrice || Math.round(product.price * 1.18);
        return `
            <div class="card" data-id="${product.id}">
                <div class="badge-group">
                    ${product.discountBadge ? `<span class="badge badge-discount">${product.discountBadge}</span>` : ''}
                    <span class="badge badge-hot">🔥 Official</span>
                </div>
                <button class="btn-wishlist ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist(${product.id})" title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                    ${isWishlisted ? '❤️' : '🤍'}
                </button>
                <div class="card-img-wrapper" onclick="openQuickView(${product.id})">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="category-tag">${product.category || 'General'}</div>
                <h3 onclick="openQuickView(${product.id})" title="${product.name}">${product.name}</h3>
                <div class="price-box">
                    <span class="price">৳ ${Number(product.price).toLocaleString()}</span>
                    <del>৳ ${Number(originalPrice).toLocaleString()}</del>
                </div>
                <div class="meta-info">
                    <span><span class="stars">${product.rating || '★★★★★'}</span> (4.9 verified)</span>
                    <span>${product.warranty || '🛡️ 1 Year Official Warranty'}</span>
                    <span class="stock-badge">${product.inStock ? '✔ In Stock (Ready to Ship)' : '❌ Out of Stock'}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-quick" onclick="openQuickView(${product.id})"><i class="fa-solid fa-eye"></i> Quick</button>
                    <button class="btn-buy" onclick="addToCartById(${product.id})"><i class="fa-solid fa-cart-shopping"></i> Add to Cart</button>
                </div>
            </div>
        `;
    }).join("");
}

function filterCategory(cat, btnElement) {
    activeCategory = cat;
    document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".sub-nav-link").forEach(btn => btn.classList.remove("active"));
    
    if (btnElement) {
        btnElement.classList.add("active");
    } else {
        // Find matching cat-btn
        document.querySelectorAll(".cat-btn").forEach(btn => {
            if (btn.textContent.toLowerCase().includes(cat.toLowerCase())) {
                btn.classList.add("active");
            }
        });
    }
    fetchProducts();
}

function handleSortChange(sortValue) {
    activeSort = sortValue;
    fetchProducts();
}

// ==================== LIVE SEARCH AUTOCOMPLETE ====================

function setupLiveSearch() {
    const searchInput = document.getElementById("searchInput");
    const clearBtn = document.getElementById("searchClearBtn");
    const dropdown = document.getElementById("searchDropdown");

    if (!searchInput) return;

    searchInput.addEventListener("input", function () {
        const val = this.value.trim();
        if (clearBtn) clearBtn.style.display = val.length > 0 ? "block" : "none";
        
        fetchProducts();

        if (val.length < 2) {
            if (dropdown) dropdown.style.display = "none";
            return;
        }

        const prods = getLocalProducts();
        const matches = prods.filter(p => 
            p.name.toLowerCase().includes(val.toLowerCase()) || 
            (p.category && p.category.toLowerCase().includes(val.toLowerCase()))
        ).slice(0, 5);

        if (matches.length > 0 && dropdown) {
            dropdown.innerHTML = matches.map(p => `
                <div class="search-dropdown-item" onclick="openQuickView(${p.id}); closeSearchDropdown();">
                    <img src="${p.image}" alt="${p.name}" class="search-dropdown-img">
                    <div class="search-dropdown-info">
                        <div class="search-dropdown-title">${p.name}</div>
                        <div class="search-dropdown-meta">
                            <span style="color:var(--primary); font-weight:700;">${p.category}</span>
                            <span>•</span>
                            <span class="search-dropdown-price">৳ ${Number(p.price).toLocaleString()}</span>
                        </div>
                    </div>
                    <button onclick="event.stopPropagation(); addToCartById(${p.id}); closeSearchDropdown();" style="background:var(--primary-light); color:var(--primary); border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer;">
                        + Cart
                    </button>
                </div>
            `).join("");
            dropdown.style.display = "block";
        } else if (dropdown) {
            dropdown.style.display = "none";
        }
    });

    // Close dropdown on click outside
    document.addEventListener("click", function(e) {
        if (!e.target.closest(".search-wrapper") && dropdown) {
            dropdown.style.display = "none";
        }
    });
}

function clearSearchInput() {
    const input = document.getElementById("searchInput");
    const clearBtn = document.getElementById("searchClearBtn");
    const dropdown = document.getElementById("searchDropdown");
    if (input) input.value = "";
    if (clearBtn) clearBtn.style.display = "none";
    if (dropdown) dropdown.style.display = "none";
    fetchProducts();
}

function closeSearchDropdown() {
    const dropdown = document.getElementById("searchDropdown");
    if (dropdown) dropdown.style.display = "none";
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
    renderWishlistDrawer();
}

function toggleWishlistDrawer(open = true) {
    const drawer = document.getElementById("wishlistDrawer");
    const overlay = document.getElementById("drawerOverlay");
    if (drawer) drawer.classList.toggle("open", open);
    if (overlay) overlay.style.display = open ? "block" : "none";
    if (open) renderWishlistDrawer();
}

function renderWishlistDrawer() {
    const container = document.getElementById("drawerWishlistItems");
    if (!container) return;

    if (wishlist.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:50px 20px; color:var(--text-muted);">
                <div style="font-size:36px; margin-bottom:8px;">🤍</div>
                <h4 style="font-size:16px; margin-bottom:4px;">Your Wishlist is Empty</h4>
                <p style="font-size:13px;">Click the heart icon on any product to save items for later!</p>
            </div>
        `;
        return;
    }

    const prods = getLocalProducts();
    const wishlistedProducts = prods.filter(p => wishlist.includes(p.id));

    container.innerHTML = wishlistedProducts.map(item => `
        <div class="cart-item">
            <img src="${item.image || 'images/laptop.jpg'}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">৳ ${Number(item.price).toLocaleString()}</div>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
                <button onclick="moveToCartFromWishlist(${item.id})" style="background:var(--primary); color:white; border:none; padding:7px 12px; border-radius:6px; font-size:12.5px; font-weight:700; cursor:pointer;" title="Move to Cart">🛒 Add</button>
                <button onclick="toggleWishlist(${item.id})" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:16px;" title="Remove">✕</button>
            </div>
        </div>
    `).join("");
}

function moveToCartFromWishlist(id) {
    addToCartById(id);
    toggleWishlist(id);
    toggleWishlistDrawer(false);
    toggleCartDrawer(true);
}

// ==================== CART DRAWER LOGIC ====================

const addToCart = addToCartById;

function addToCartById(id) {
    const prods = getLocalProducts();
    const product = prods.find(p => p.id === id) || productsList.find(p => p.id === id);
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

    // Trigger cart button bump animation
    const cartBtn = document.getElementById("cartBtn");
    if (cartBtn) {
        cartBtn.classList.add("bump");
        setTimeout(() => cartBtn.classList.remove("bump"), 450);
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
    const shippingEl = document.getElementById("drawerShippingAmount");

    if (!cartListEl) return;

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    updateFreeShippingMeter(subtotal);

    if (cartItems.length === 0) {
        cartListEl.innerHTML = `
            <div style="text-align:center; padding:50px 20px; color:var(--text-muted);">
                <div style="font-size:38px; margin-bottom:8px;">🛒</div>
                <h4 style="font-size:16px; margin-bottom:4px;">Your Shopping Cart is Empty</h4>
                <p style="font-size:13px;">Explore our catalog and add gaming gear to your cart!</p>
            </div>
        `;
        if (subtotalEl) subtotalEl.textContent = "৳ 0";
        if (grandTotalEl) grandTotalEl.textContent = "৳ 0";
        if (shippingEl) shippingEl.textContent = "৳ 0";
        if (discountRow) discountRow.style.display = "none";
        return;
    }

    let discount = 0;
    if (appliedCoupon) {
        discount = appliedCoupon.discountAmount;
        if (discountRow) discountRow.style.display = "flex";
        if (discountEl) discountEl.textContent = `- ৳ ${discount.toLocaleString()}`;
    } else {
        if (discountRow) discountRow.style.display = "none";
    }

    // Free delivery bonus if subtotal >= 2000
    const finalShippingFee = subtotal >= 2000 ? 0 : currentShippingFee;
    if (shippingEl) {
        shippingEl.innerHTML = subtotal >= 2000 
            ? `<span style="color:var(--success); font-weight:800;">FREE (৳0)</span>` 
            : `৳ ${currentShippingFee}`;
    }

    const grandTotal = Math.max(0, subtotal + finalShippingFee - discount);

    cartListEl.innerHTML = cartItems.map(item => `
        <div class="cart-item">
            <img src="${item.image || 'images/laptop.jpg'}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">৳ ${Number(item.price).toLocaleString()}</div>
            </div>
            <div class="cart-qty-ctrl">
                <button onclick="changeQuantity(${item.id}, -1)">-</button>
                <span><b>${item.quantity}</b></span>
                <button onclick="changeQuantity(${item.id}, 1)">+</button>
                <button onclick="removeFromCart(${item.id})" style="color:var(--danger); margin-left:4px;" title="Remove">🗑️</button>
            </div>
        </div>
    `).join("");

    if (subtotalEl) subtotalEl.textContent = `৳ ${subtotal.toLocaleString()}`;
    if (grandTotalEl) grandTotalEl.textContent = `৳ ${grandTotal.toLocaleString()}`;
}

function updateFreeShippingMeter(subtotal) {
    const textEl = document.getElementById("freeShippingText");
    const percentEl = document.getElementById("freeShippingPercent");
    const fillEl = document.getElementById("freeShippingFill");
    if (!textEl || !percentEl || !fillEl) return;

    const threshold = 2000;
    if (subtotal >= threshold) {
        textEl.innerHTML = "🎉 <b>You've unlocked FREE Delivery!</b>";
        percentEl.textContent = "100%";
        fillEl.style.width = "100%";
        fillEl.style.background = "linear-gradient(90deg, #10b981, #059669)";
    } else {
        const remaining = threshold - subtotal;
        const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
        textEl.innerHTML = `Add <b>৳${remaining.toLocaleString()}</b> for FREE delivery`;
        percentEl.textContent = `${pct}%`;
        fillEl.style.width = `${pct}%`;
        fillEl.style.background = "linear-gradient(90deg, #3b82f6, #06b6d4)";
    }
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

function quickApplyCoupon(code) {
    const input = document.getElementById("couponInput");
    if (input) input.value = code;
    applyCouponCode();
}

function claimWelcomeCoupon() {
    quickApplyCoupon("WELCOME500");
    toggleCartDrawer(true);
    showToast("🎁 Promo code WELCOME500 applied! ৳500 OFF over ৳2,000");
}

async function applyCouponCode() {
    const input = document.getElementById("couponInput");
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
        alert("Please enter a coupon code (e.g. WELCOME500, TECHVERSE10)");
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
            return;
        } else {
            alert(`⚠️ ${data.message}`);
        }
    } catch (e) {
        // Fallback offline validation
        if (code === "WELCOME500") {
            if (subtotal < 2000) {
                alert("⚠️ Coupon WELCOME500 requires minimum order of ৳2,000.");
                return;
            }
            appliedCoupon = { code: "WELCOME500", discountAmount: 500, description: "৳500 Welcome Discount" };
            showToast("✅ Coupon WELCOME500 Applied! ৳500 OFF");
            renderCartDrawer();
        } else if (code === "TECHVERSE10") {
            if (subtotal < 1000) {
                alert("⚠️ Coupon TECHVERSE10 requires minimum spend of ৳1,000.");
                return;
            }
            const disc = Math.min(5000, Math.round(subtotal * 0.1));
            appliedCoupon = { code: "TECHVERSE10", discountAmount: disc, description: "10% OFF" };
            showToast(`✅ Coupon TECHVERSE10 Applied! ৳${disc.toLocaleString()} saved.`);
            renderCartDrawer();
        } else {
            alert("Invalid promo code. Try 'WELCOME500' or 'TECHVERSE10'");
        }
    }
}

// ==================== QUICK VIEW MODAL ====================

function openQuickView(id) {
    const prods = getLocalProducts();
    const product = prods.find(p => p.id === id) || productsList.find(p => p.id === id);
    if (!product) return;

    const content = document.getElementById("quickViewContent");
    if (!content) return;

    const originalPrice = product.oldPrice || Math.round(product.price * 1.18);

    content.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:25px; align-items:center;">
            <div style="background:var(--card-elevated); padding:24px; border-radius:var(--radius-md); text-align:center; border:1px solid var(--border-color);">
                <img src="${product.image}" alt="${product.name}" style="max-width:100%; max-height:240px; object-fit:contain; filter:drop-shadow(0 10px 20px rgba(0,0,0,0.15));">
            </div>
            <div>
                <span style="background:var(--primary-light); color:var(--primary); padding:4px 12px; border-radius:var(--radius-full); font-size:12px; font-weight:800; text-transform:uppercase;">${product.category || 'Tech'}</span>
                <h2 style="font-size:24px; margin:10px 0 6px;">${product.name}</h2>
                <div style="font-size:24px; font-weight:800; color:var(--primary); margin-bottom:14px; display:flex; align-items:baseline; gap:10px;">
                    ৳ ${Number(product.price).toLocaleString()} 
                    <del style="font-size:16px; color:var(--text-muted);">৳ ${Number(originalPrice).toLocaleString()}</del>
                </div>
                <div style="color:var(--text-muted); font-size:13.5px; line-height:1.8; margin-bottom:18px;">
                    <div>⭐ <b>Customer Rating:</b> ${product.rating || '★★★★★'} (4.9 / 5 verified)</div>
                    <div>🛡️ <b>Brand Warranty:</b> ${product.warranty || '1 Year Official Brand Warranty'}</div>
                    <div>🚚 <b>Delivery:</b> ${product.delivery || 'Express 24-48h Delivery'}</div>
                    <div>📦 <b>Inventory Status:</b> <b style="color:var(--success);">${product.inStock ? 'In Stock (Ready to Dispatch)' : 'Pre-order'}</b></div>
                </div>
                <button onclick="addToCartById(${product.id}); toggleQuickModal(false);" style="width:100%; background:var(--primary); color:white; padding:14px; border-radius:var(--radius-sm); font-weight:800; border:none; cursor:pointer; font-size:15px; box-shadow:0 6px 20px rgba(37,99,235,0.4);">
                    🛒 Add to Cart Now
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

// ==================== CHECKOUT & ORDER SUBMISSION ====================

function openCheckoutModal() {
    if (cartItems.length === 0) {
        alert("⚠️ Your cart is empty! Please add products first.");
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

function handlePaymentMethodChange(val) {
    const inst = document.getElementById("mobilePayInstructions");
    if (inst) {
        inst.style.display = (val && val.includes("bKash")) ? "block" : "none";
    }
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
    const finalShippingFee = subtotal >= 2000 ? 0 : currentShippingFee;
    const grandTotal = Math.max(0, subtotal + finalShippingFee - discount);

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
        shippingFee: finalShippingFee,
        discountAmount: discount,
        totalAmount: grandTotal,
        paymentMethod: paymentMethod,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };

    // 1. Save to local storage first
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

// ==================== ORDER TRACKING SYSTEM ====================

function toggleTrackModal(open = true) {
    const modal = document.getElementById("trackModal");
    if (modal) {
        modal.style.display = open ? "flex" : "none";
        if (open) {
            const input = document.getElementById("trackInput");
            if (input) input.focus();
        }
    }
}

async function trackOrderSubmit(e) {
    e.preventDefault();
    const input = document.getElementById("trackInput");
    const container = document.getElementById("trackResult");
    if (!input || !container) return;

    const searchId = input.value.trim().toUpperCase();
    if (!searchId) return;

    let order = null;

    // Check backend API first
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${searchId}`, { signal: AbortSignal.timeout(2000) });
        const data = await response.json();
        if (data.success && data.data) {
            order = data.data;
        }
    } catch (err) {}

    // Fallback to local storage
    if (!order) {
        const orders = getLocalOrders();
        order = orders.find(o => o.orderId.toUpperCase() === searchId);
    }

    if (!order) {
        container.innerHTML = `
            <div style="background:var(--card-elevated); padding:20px; border-radius:var(--radius-md); text-align:center; border:1px solid var(--border-color);">
                <div style="font-size:32px; margin-bottom:8px;">⚠️</div>
                <h4 style="font-size:16px; margin-bottom:4px; color:var(--danger);">Order Not Found</h4>
                <p style="font-size:13px; color:var(--text-muted);">We could not find an order matching "<b>${searchId}</b>".<br>Try checking sample order: <b>TV-108809</b></p>
            </div>
        `;
        return;
    }

    renderTrackResult(order);
}

function renderTrackResult(order) {
    const container = document.getElementById("trackResult");
    if (!container) return;

    const status = order.status || 'Pending';
    let step = 1;
    if (status === 'Pending') step = 1;
    else if (status === 'Processing') step = 2;
    else if (status === 'Shipped') step = 3;
    else if (status === 'Delivered') step = 4;

    const formattedDate = order.createdAt 
        ? new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Recent';

    const itemsSummary = (order.items || []).map(i => `${i.name} (x${i.quantity || 1})`).join(", ");

    container.innerHTML = `
        <div style="background:var(--card-elevated); padding:20px; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-top:15px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:15px;">
                <div>
                    <h3 style="font-size:17px; margin:0; color:var(--primary);">Order #${order.orderId}</h3>
                    <span style="font-size:12px; color:var(--text-muted);">Placed on: ${formattedDate}</span>
                </div>
                <span class="invoice-status-badge" style="margin:0;">Status: ${status}</span>
            </div>

            <!-- 4-Step Interactive Stepper -->
            <div class="track-stepper">
                <div class="track-step ${step >= 1 ? (step === 1 ? 'active' : 'done') : ''}">
                    <div class="track-step-circle"><i class="fa-solid fa-receipt"></i></div>
                    <div class="track-step-label">Placed</div>
                </div>
                <div class="track-step ${step >= 2 ? (step === 2 ? 'active' : 'done') : ''}">
                    <div class="track-step-circle"><i class="fa-solid fa-box-open"></i></div>
                    <div class="track-step-label">Processing</div>
                </div>
                <div class="track-step ${step >= 3 ? (step === 3 ? 'active' : 'done') : ''}">
                    <div class="track-step-circle"><i class="fa-solid fa-truck-fast"></i></div>
                    <div class="track-step-label">In Transit</div>
                </div>
                <div class="track-step ${step >= 4 ? 'done' : ''}">
                    <div class="track-step-circle"><i class="fa-solid fa-house-circle-check"></i></div>
                    <div class="track-step-label">Delivered</div>
                </div>
            </div>

            <div style="font-size:13px; line-height:1.7; color:var(--text-color); margin-top:15px;">
                <div><b>Customer:</b> ${order.customerName} (${order.customerPhone})</div>
                <div><b>Delivery Address:</b> ${order.address}</div>
                <div><b>Items:</b> <span style="color:var(--text-muted);">${itemsSummary || 'N/A'}</span></div>
                <div><b>Total Paid:</b> <span style="font-size:15px; font-weight:800; color:var(--primary);">৳ ${Number(order.totalAmount).toLocaleString()}</span> (${order.paymentMethod || 'COD'})</div>
            </div>

            <div style="margin-top:16px; display:flex; justify-content:flex-end;">
                <button onclick="renderInvoiceFromTrack('${order.orderId}')" style="background:var(--primary); color:white; border:none; padding:9px 18px; border-radius:6px; font-weight:700; cursor:pointer; font-size:13px; display:inline-flex; align-items:center; gap:6px;">
                    🖨️ View Official Tax Invoice
                </button>
            </div>
        </div>
    `;
}

function renderInvoiceFromTrack(orderId) {
    const orders = getLocalOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
        toggleTrackModal(false);
        renderInvoice(order);
    }
}

// ==================== PRINTABLE TAX INVOICE GENERATOR ====================

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
                    <p>Level 4, Multiplan Center, Elephant Road, Dhaka-1205</p>
                    <p>Helpline: +880 1820-727102 | Email: support@techverse.com</p>
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
                    <p>Status: <strong style="color:var(--accent);">${order.status || 'Pending Delivery'}</strong></p>
                    <p>Delivery: <strong>Express Nationwide Courier</strong></p>
                </div>
            </div>

            <!-- INVOICE ITEMS TABLE -->
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th style="width:40px; text-align:center;">#</th>
                        <th>Item Description</th>
                        <th>Unit Price</th>
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
                    <strong>📌 Terms & Official Warranty:</strong>
                    <ul style="margin: 4px 0 0 16px; padding: 0;">
                        <li>All products carry official manufacturer warranty.</li>
                        <li>Please keep this official receipt for warranty claims & returns.</li>
                        <li>Thank you for choosing TechVerse Bangladesh!</li>
                    </ul>
                </div>

                <div class="invoice-summary-box">
                    <div class="invoice-summary-row">
                        <span>Subtotal:</span>
                        <span>৳ ${subtotal.toLocaleString()}</span>
                    </div>
                    <div class="invoice-summary-row">
                        <span>Shipping Fee:</span>
                        <span>${shipping === 0 ? 'FREE' : `৳ ${shipping.toLocaleString()}`}</span>
                    </div>
                    ${discount > 0 ? `
                        <div class="invoice-summary-row" style="color:var(--danger); font-weight:700;">
                            <span>Discount Voucher:</span>
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
                <p>TechVerse Online Tech Megastore | Dhaka, Bangladesh | 24/7 Helpline: +880 1820-727102</p>
                <div class="invoice-watermark">✓ OFFICIAL E-COMMERCE TAX INVOICE</div>
            </div>
        </div>
    `;

    toggleInvoiceModal(true);
}

function toggleInvoiceModal(open = true) {
    const modal = document.getElementById("invoiceModal");
    if (modal) modal.style.display = open ? "flex" : "none";
}

// ==================== ADMIN DASHBOARD SUITE ====================

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
        } else if (activeTab.textContent.includes("Customer Inquiries")) {
            loadAdminMessages();
        } else {
            loadAdminOrders();
        }
    } else {
        loadAdminOrders();
    }
}

async function loadAdminStats() {
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

    try {
        const response = await fetch(`${API_BASE_URL}/stats`, { signal: AbortSignal.timeout(2000) });
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
        const response = await fetch(`${API_BASE_URL}/orders`, { signal: AbortSignal.timeout(2000) });
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
        container.innerHTML = `
            <div style="text-align:center; padding:30px; color:var(--text-muted);">
                <p style="font-size:16px;">📭 No customer orders placed yet.</p>
                <small>Orders will appear here as soon as customers buy products.</small>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map((o, idx) => {
        const itemsSummary = (o.items || []).map(i => `${i.name} (x${i.quantity || 1})`).join(", ");
        const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';

        return `
            <div style="background:var(--card-elevated); padding:14px; margin-bottom:12px; border-radius:var(--radius-sm); border-left:4px solid var(--primary); box-shadow:var(--shadow-xs);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div>
                        <strong style="font-size:15px; color:var(--text-color);">Order #${o.orderId}</strong>
                        <span style="font-size:12px; color:var(--text-muted); margin-left:8px;">🕒 ${dateStr}</span>
                    </div>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <button onclick="printAdminOrder(${idx})" style="padding:6px 12px; background:var(--primary); color:white; border:none; border-radius:4px; font-size:12px; font-weight:700; cursor:pointer;">🖨️ Invoice</button>
                        <select onchange="updateOrderStatus('${o.orderId}', this.value)" style="padding:5px 8px; border-radius:4px; font-weight:700; background:var(--card-bg); color:var(--text-color); border:1px solid var(--border-color);">
                            <option value="Pending" ${o.status==='Pending'?'selected':''}>⏳ Pending</option>
                            <option value="Processing" ${o.status==='Processing'?'selected':''}>📦 Processing</option>
                            <option value="Shipped" ${o.status==='Shipped'?'selected':''}>🚚 Shipped</option>
                            <option value="Delivered" ${o.status==='Delivered'?'selected':''}>✅ Delivered</option>
                            <option value="Cancelled" ${o.status==='Cancelled'?'selected':''}>❌ Cancelled</option>
                        </select>
                        <button onclick="deleteAdminOrder('${o.orderId}')" title="Delete Order" style="background:var(--danger-light); color:var(--danger); border:1px solid rgba(239,68,68,0.3); padding:5px 9px; border-radius:4px; font-weight:700; cursor:pointer;">🗑️</button>
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

    showToast(`Order #${orderId} status updated to ${status}`);
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
        const response = await fetch(`${API_BASE_URL}/products`, { signal: AbortSignal.timeout(2000) });
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
        <div style="background:var(--card-elevated); padding:10px 14px; margin-bottom:10px; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center; border-left:4px solid var(--accent); box-shadow:var(--shadow-xs);">
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

    const products = getLocalProducts();
    products.unshift(newProd);
    saveLocalProducts(products);
    productsList = products;

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
        const response = await fetch(`${API_BASE_URL}/contact`, { signal: AbortSignal.timeout(2000) });
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
        container.innerHTML = `
            <div style="text-align:center; padding:30px; color:var(--text-muted);">
                <p style="font-size:16px;">💬 No customer inquiries received yet.</p>
                <small>Inquiries submitted through the contact form will appear here.</small>
            </div>
        `;
        return;
    }

    container.innerHTML = messages.map(m => {
        const dateStr = m.createdAt ? new Date(m.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
        return `
            <div style="background:var(--card-elevated); padding:14px; margin-bottom:12px; border-radius:var(--radius-sm); border-left:4px solid var(--cyan); box-shadow:var(--shadow-xs);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div>
                        <strong style="color:var(--text-color); font-size:15px;">👤 ${m.name}</strong>
                        <span style="font-size:12px; color:var(--text-muted); margin-left:8px;">✉️ ${m.email}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:11px; color:var(--text-muted);">🕒 ${dateStr}</span>
                        <button onclick="deleteAdminMessage(${m.id})" style="background:var(--danger-light); color:var(--danger); border:1px solid rgba(239,68,68,0.3); padding:4px 10px; border-radius:4px; font-weight:700; cursor:pointer;">🗑️ Delete</button>
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
    if (!confirm("Are you sure you want to delete this customer inquiry?")) return;

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

// ==================== INTERACTIVE ACCORDION & NEWSLETTER ====================

function toggleFaq(item) {
    if (!item) return;
    const isActive = item.classList.contains("active");
    // Close other FAQ items
    document.querySelectorAll(".faq-item").forEach(el => el.classList.remove("active"));
    if (!isActive) {
        item.classList.add("active");
    }
}

function subscribeNewsletter() {
    const input = document.getElementById("newsletterEmail");
    if (!input) return;
    const val = input.value.trim();
    if (!val || !val.includes("@")) {
        alert("Please enter a valid email address.");
        return;
    }
    showToast(`🎉 Thank you! ${val} subscribed to TechVerse VIP Deals.`);
    input.value = "";
}

// ==================== TIMERS & HELPERS ====================

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
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #0f172a;
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 14px 24px;
        border-radius: 30px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
        z-index: 5000;
        font-weight: 700;
        font-size: 14px;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        gap: 8px;
        animation: fadeIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        setTimeout(() => toast.remove(), 350);
    }, 2800);
}

function setupEventListeners() {
    setupLiveSearch();

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

            const msgs = getLocalMessages();
            msgs.unshift(newMsg);
            saveLocalMessages(msgs);

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

            alert(`✅ Thank you, ${name}! Your inquiry has been dispatched to our tech specialist team.`);
            contactForm.reset();
            loadAdminStats();
        });
    }
}
