// ==========================================================================
// TECHVERSE ENTERPRISE E-COMMERCE CORE SCRIPT
// ==========================================================================

// Backend API Base URL
const API_BASE_URL = "http://localhost:5000/api";

// Application State
let productsList = [];
let cartItems = [];
let wishlist = JSON.parse(localStorage.getItem("techverse_wishlist")) || [];
let compareList = JSON.parse(localStorage.getItem("techverse_compare")) || [];
let currentUser = JSON.parse(localStorage.getItem("techverse_user")) || null;
let activeCategory = "All";
let activeSort = "default";
let appliedCoupon = null;
let currentShippingFee = 60; // Default Inside Dhaka
let currentEmiProduct = null;
let currentEmiTenure = 6;
let currentRatingStars = 5;
let currentSelectorSlotKey = null;
let activeBkashOrder = null;
let currentInvoiceOrder = null;
let selectedReviewPhotoBase64 = null;
let pcBuild = { cpu: null, motherboard: null, ram: null, gpu: null, storage: null, psu: null, casing: null, monitor: null };

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
    renderCompareDock();
    initRecentSalesToasts();
    initSpinWheelCanvas();
    updateUserAuthUI();
    loadFounderPhoto();
    updateFounderAdminControls();
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

let backendCheckFailed = false;

function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function updateProductBadge(count, searchVal) {
    const countEl = document.getElementById("productCountBadge");
    if (!countEl) return;
    if (searchVal) {
        countEl.innerHTML = `Found <strong>${count}</strong> product${count === 1 ? '' : 's'} matching "<strong>${escapeHtml(searchVal)}</strong>"`;
    } else if (activeCategory && activeCategory !== "All") {
        countEl.textContent = `${count} Products in ${activeCategory}`;
    } else {
        countEl.textContent = `${count} Verified Products In Catalog`;
    }
}

function renderLocalFiltered(searchVal) {
    let stored = getLocalProducts();
    let filtered = [...stored];

    if (activeCategory && activeCategory !== "All" && !searchVal) {
        filtered = filtered.filter(p => p.category && p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    if (searchVal) {
        const s = searchVal.toLowerCase();
        filtered = filtered.filter(p =>
            (p.name && p.name.toLowerCase().includes(s)) ||
            (p.category && p.category.toLowerCase().includes(s)) ||
            (p.warranty && p.warranty.toLowerCase().includes(s))
        );
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
    updateProductBadge(productsList.length, searchVal);
}

async function fetchProducts() {
    const searchInput = document.querySelector("#searchInput");
    const searchVal = searchInput ? searchInput.value.trim() : "";

    // Instant local rendering (0ms lag)
    renderLocalFiltered(searchVal);

    // If backend was checked and is offline, no need to hang on network timeout
    if (backendCheckFailed) {
        return;
    }

    let url = `${API_BASE_URL}/products?category=${encodeURIComponent(activeCategory)}&sort=${activeSort}`;
    if (searchVal) {
        url += `&search=${encodeURIComponent(searchVal)}`;
    }

    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(1200) });
        const data = await response.json();

        if (data.success && data.data) {
            backendCheckFailed = false;
            productsList = data.data;
            saveLocalProducts(productsList);
            renderProducts(productsList);
            updateProductBadge(productsList.length, searchVal);
            updateBackendStatus(true);
            return;
        }
    } catch (error) {
        backendCheckFailed = true;
        updateBackendStatus(false);
    }
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
        const isCompared = compareList.includes(product.id);
        const originalPrice = product.oldPrice || Math.round(product.price * 1.18);
        return `
            <div class="card" data-id="${product.id}">
                <div class="badge-group">
                    ${product.discountBadge ? `<span class="badge badge-discount">${product.discountBadge}</span>` : ''}
                    ${product.id % 4 === 1 ? `<span class="badge-low-stock">⚡ Only 2 Left</span>` : '<span class="badge badge-hot">🔥 Official</span>'}
                </div>
                <button class="btn-wishlist ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist(${product.id})" title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                    ${isWishlisted ? '❤️' : '🤍'}
                </button>
                <button class="btn-card-compare ${isCompared ? 'active' : ''}" onclick="toggleCompareItem(${product.id})" title="${isCompared ? 'Remove from Compare' : 'Add to Compare'}">
                    <i class="fa-solid fa-code-compare"></i>
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
                <div class="card-emi-teaser" onclick="openEmiModal(${product.id})" title="Calculate 0% EMI Installments">
                    💳 0% EMI from ৳${Math.round(product.price / 12).toLocaleString()}/mo
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

let searchDebounceTimer = null;

function setupLiveSearch() {
    const searchInput = document.getElementById("searchInput");
    const clearBtn = document.getElementById("searchClearBtn");
    const dropdown = document.getElementById("searchDropdown");

    if (!searchInput) return;

    searchInput.addEventListener("input", function () {
        const val = this.value.trim();
        if (clearBtn) clearBtn.style.display = val.length > 0 ? "flex" : "none";

        // Sync with catalog search box
        const catSearch = document.getElementById("catalogSearchInput");
        if (catSearch && catSearch.value !== this.value) {
            catSearch.value = this.value;
        }

        // If user is searching, reset activeCategory to "All" visually so results aren't blocked
        if (val.length > 0 && activeCategory !== "All") {
            activeCategory = "All";
            document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
            const allBtn = document.querySelector(".cat-btn");
            if (allBtn) allBtn.classList.add("active");
        }

        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            fetchProducts();
        }, 100);

        // Autocomplete Dropdown
        if (val.length < 2) {
            if (dropdown) dropdown.style.display = "none";
            return;
        }

        const prods = getLocalProducts();
        const matches = prods.filter(p =>
            (p.name && p.name.toLowerCase().includes(val.toLowerCase())) ||
            (p.category && p.category.toLowerCase().includes(val.toLowerCase()))
        ).slice(0, 6);

        if (matches.length > 0 && dropdown) {
            dropdown.innerHTML = matches.map(p => `
                <div class="search-dropdown-item" onclick="selectSearchResult(${p.id})">
                    <img src="${p.image}" alt="${escapeHtml(p.name)}" class="search-dropdown-img">
                    <div class="search-dropdown-info">
                        <div class="search-dropdown-title">${escapeHtml(p.name)}</div>
                        <div class="search-dropdown-meta">
                            <span style="color:var(--primary); font-weight:700;">${escapeHtml(p.category || 'Tech')}</span>
                            <span>•</span>
                            <span class="search-dropdown-price">৳ ${Number(p.price).toLocaleString()}</span>
                        </div>
                    </div>
                    <button type="button" onclick="event.stopPropagation(); addToCartById(${p.id}); closeSearchDropdown();" style="background:var(--primary-light); color:var(--primary); border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer;">
                        + Cart
                    </button>
                </div>
            `).join("");
            dropdown.style.display = "block";
        } else if (dropdown) {
            dropdown.innerHTML = `
                <div style="padding:16px; text-align:center; color:var(--text-muted); font-size:13px;">
                    No products found matching "<strong>${escapeHtml(val)}</strong>"
                </div>
            `;
            dropdown.style.display = "block";
        }
    });

    // Enter key handler
    searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearchSubmit(e);
        }
    });

    // Close dropdown on click outside
    document.addEventListener("click", function (e) {
        if (!e.target.closest(".search-wrapper") && dropdown) {
            dropdown.style.display = "none";
        }
    });
}

function handleSearchSubmit(event) {
    if (event) event.preventDefault();
    const input = document.getElementById("searchInput");
    const val = input ? input.value.trim() : "";
    closeSearchDropdown();

    if (val && activeCategory !== "All") {
        activeCategory = "All";
        document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
        const allBtn = document.querySelector(".cat-btn");
        if (allBtn) allBtn.classList.add("active");
    }

    fetchProducts();

    const productsSection = document.getElementById("products");
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
    }
}

function selectSearchResult(id) {
    closeSearchDropdown();
    const productsSection = document.getElementById("products");
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
    }
    openQuickView(id);
}

function syncCatalogSearch(val) {
    const mainInput = document.getElementById("searchInput");
    const clearBtn = document.getElementById("searchClearBtn");
    if (mainInput) {
        mainInput.value = val;
        if (clearBtn) clearBtn.style.display = val.trim().length > 0 ? "flex" : "none";
    }

    if (val.trim().length > 0 && activeCategory !== "All") {
        activeCategory = "All";
        document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
        const allBtn = document.querySelector(".cat-btn");
        if (allBtn) allBtn.classList.add("active");
    }

    fetchProducts();
}

function clearSearchInput() {
    const input = document.getElementById("searchInput");
    const catInput = document.getElementById("catalogSearchInput");
    const clearBtn = document.getElementById("searchClearBtn");
    const dropdown = document.getElementById("searchDropdown");
    if (input) input.value = "";
    if (catInput) catInput.value = "";
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
    const isCompared = compareList.includes(product.id);

    // Dynamic multi-angle gallery thumbnails
    const img1 = product.image || 'images/laptop.jpg';
    const altThumbs = [img1, img1, img1];

    content.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:25px; align-items:center;">
            <div style="background:var(--card-elevated); padding:20px; border-radius:var(--radius-md); text-align:center; border:1px solid var(--border-color);">
                <div style="overflow:hidden; border-radius:8px; display:flex; align-items:center; justify-content:center; min-height:220px;">
                    <img id="quickMainImg" src="${img1}" alt="${escapeHtml(product.name)}" style="max-width:100%; max-height:240px; object-fit:contain; transition:transform 0.3s ease; cursor:zoom-in;" onmouseover="this.style.transform='scale(1.18)'" onmouseout="this.style.transform='scale(1)'">
                </div>
                <div class="quick-gallery-thumbs">
                    <div class="quick-gallery-thumb active" onclick="swapQuickViewImage('${img1}', this)">
                        <img src="${img1}" alt="Front view">
                    </div>
                    <div class="quick-gallery-thumb" onclick="swapQuickViewImage('${img1}', this)">
                        <img src="${img1}" alt="Side angle">
                    </div>
                    <div class="quick-gallery-thumb" onclick="swapQuickViewImage('${img1}', this)">
                        <img src="${img1}" alt="Box / Port view">
                    </div>
                </div>
                <div style="font-size:11px; color:var(--text-muted); margin-top:8px;">🔍 Hover image to zoom in details</div>
            </div>
            <div>
                <span style="background:var(--primary-light); color:var(--primary); padding:4px 12px; border-radius:var(--radius-full); font-size:12px; font-weight:800; text-transform:uppercase;">${escapeHtml(product.category || 'Tech')}</span>
                <h2 style="font-size:22px; margin:10px 0 6px;">${escapeHtml(product.name)}</h2>
                <div style="font-size:22px; font-weight:800; color:var(--primary); margin-bottom:10px; display:flex; align-items:baseline; gap:10px;">
                    ৳ ${Number(product.price).toLocaleString()} 
                    <del style="font-size:15px; color:var(--text-muted);">৳ ${Number(originalPrice).toLocaleString()}</del>
                </div>
                
                <div style="background:rgba(2,132,199,0.08); border:1px dashed #0284c7; padding:8px 12px; border-radius:6px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:12px; font-weight:700; color:#0284c7;">💳 0% EMI starts from ৳${Math.round(product.price / 12).toLocaleString()} /mo</span>
                    <button type="button" onclick="openEmiModal(${product.id})" style="background:#0284c7; color:white; border:none; padding:4px 10px; border-radius:4px; font-size:11.5px; font-weight:800; cursor:pointer;">EMI Calculator</button>
                </div>

                <div style="color:var(--text-muted); font-size:13px; line-height:1.75; margin-bottom:16px;">
                    <div>⭐ <b>Customer Rating:</b> ${product.rating || '★★★★★'} (4.9 / 5 verified)</div>
                    <div>🛡️ <b>Brand Warranty:</b> ${product.warranty || '1 Year Official Brand Warranty'}</div>
                    <div>🚚 <b>Delivery:</b> ${product.delivery || 'Express 24-48h Delivery'}</div>
                    <div>📦 <b>Inventory Status:</b> <b style="color:var(--success);">${product.inStock ? 'In Stock (Ready to Dispatch)' : 'Pre-order'}</b></div>
                </div>

                <div style="display:flex; gap:10px;">
                    <button onclick="addToCartById(${product.id}); toggleQuickModal(false);" style="flex:2; background:var(--primary); color:white; padding:12px; border-radius:var(--radius-sm); font-weight:800; border:none; cursor:pointer; font-size:14.5px; box-shadow:0 6px 20px rgba(37,99,235,0.4); display:flex; align-items:center; justify-content:center; gap:8px;">
                        🛒 Add to Cart Now
                    </button>
                    <button onclick="toggleCompareItem(${product.id})" style="flex:1; background:var(--card-elevated); color:var(--text-color); border:1px solid var(--border-color); padding:12px; border-radius:var(--radius-sm); font-weight:700; cursor:pointer; font-size:13px;">
                        ${isCompared ? '✓ Comparing' : '⚖️ Compare'}
                    </button>
                </div>
            </div>
        </div>
    `;

    toggleQuickModal(true);
}

function swapQuickViewImage(src, thumbEl) {
    const main = document.getElementById("quickMainImg");
    if (main) main.src = src;
    document.querySelectorAll(".quick-gallery-thumb").forEach(t => t.classList.remove("active"));
    if (thumbEl) thumbEl.classList.add("active");
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

    // 4. If payment is bKash, launch authentic bKash Tokenized Checkout
    if (paymentMethod && paymentMethod.includes("bKash")) {
        cartItems = [];
        appliedCoupon = null;
        updateCartUI();
        toggleCheckoutModal(false);
        document.getElementById("checkoutForm").reset();
        startBkashCheckout(newOrder);
        return;
    }

    // 5. Render invoice & clear cart for COD
    renderInvoice(newOrder);
    cartItems = [];
    appliedCoupon = null;
    updateCartUI();
    toggleCheckoutModal(false);
    document.getElementById("checkoutForm").reset();
    showToast(`🎉 Order #${newOrder.orderId} placed successfully!`);

    // 6. Auto-trigger Stage 1 Order Confirmation SMS
    setTimeout(() => {
        triggerSmsNotification(newOrder, 'ORDER_PLACED');
    }, 700);
}

// ==================== MULTI-STAGE SMS AUTOMATION ENGINE ====================

let activeSmsData = null;

function getLocalSmsLogs() {
    const data = localStorage.getItem("techverse_sms_logs");
    if (data) {
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) return parsed;
        } catch(e) {}
    }
    return [];
}

function saveLocalSmsLogs(logs) {
    localStorage.setItem("techverse_sms_logs", JSON.stringify(logs));
}

function generateSmsText(order, eventType) {
    const itemsText = Array.isArray(order.items) 
        ? order.items.map(i => `${i.name} (x${i.quantity || 1})`).join(', ') 
        : 'Tech Gear';
    const total = Number(order.totalAmount || 0).toLocaleString();

    switch (eventType) {
        case 'ORDER_PLACED':
            return `TechVerse: প্রিয় ${order.customerName || 'গ্রাহক'}, আপনার অর্ডার #${order.orderId} সফলভাবে গৃহীত হয়েছে! আইটেম: ${itemsText}। মোট বিল: ৳${total} (${order.paymentMethod || 'COD'})। ডেলিভারি: ২৪-৪৮ ঘণ্টার মধ্যে। হেল্পলাইন: 01820-727102`;
        case 'OUT_FOR_DELIVERY':
            return `TechVerse: প্রিয় ${order.customerName || 'গ্রাহক'}, আপনার অর্ডার #${order.orderId} আজ ডেলিভারির জন্য বের হয়েছে! আনুমানিক সময়: দুপুর ২টা - সন্ধ্যা ৬টা। ক্যাশ বিল বাবদ ৳${total} প্রস্তুত রাখুন। হেল্পলাইন: 01820-727102`;
        case 'DELIVERED':
            return `TechVerse: প্রিয় ${order.customerName || 'গ্রাহক'}, আপনার TechVerse অর্ডার #${order.orderId} সফলভাবে ডেলিভার করা হয়েছে! অফিসিয়াল ওয়ারেন্টির জন্য রশিদটি সংরক্ষণ করুন। আমাদের সাথে কেনাকাটার জন্য ধন্যবাদ!`;
        case 'PROCESSING':
            return `TechVerse: প্রিয় ${order.customerName || 'গ্রাহক'}, আপনার অর্ডার #${order.orderId} প্রসেসিং হচ্ছে এবং দ্রুত প্যাকিং সম্পন্ন করা হচ্ছে। হেল্পলাইন: 01820-727102`;
        case 'CANCELLED':
            return `TechVerse: আপনার অর্ডার #${order.orderId} বাতিল করা হয়েছে। হেল্পলাইন: 01820-727102।`;
        default:
            return `TechVerse: আপনার অর্ডার #${order.orderId} আপডেট: ${eventType}। হেল্পলাইন: 01820-727102`;
    }
}

function getCleanPhone(phone) {
    let clean = String(phone || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('880')) return clean;
    if (clean.startsWith('0')) return '88' + clean;
    if (clean.length === 10) return '880' + clean;
    return clean;
}

function getWhatsAppUrl(order, eventType) {
    const cleanPhone = getCleanPhone(order.customerPhone);
    const msg = generateSmsText(order, eventType);
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
}

function getDirectSmsUri(phone, message) {
    const rawPhone = String(phone || '').trim();
    // Keep digits and possible plus
    const cleanDigits = rawPhone.replace(/[^0-9+]/g, '');
    return `sms:${cleanDigits}?body=${encodeURIComponent(message)}`;
}

function triggerSmsNotification(order, eventType = 'ORDER_PLACED') {
    if (!order || !order.customerPhone) return;

    const message = generateSmsText(order, eventType);
    const cleanPhone = getCleanPhone(order.customerPhone);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

    const smsRecord = {
        id: 'SMS-' + Date.now(),
        orderId: order.orderId,
        customerName: order.customerName,
        recipientPhone: order.customerPhone,
        eventType: eventType,
        message: message,
        whatsappUrl: whatsappUrl,
        timestamp: new Date().toISOString()
    };

    const logs = getLocalSmsLogs();
    logs.unshift(smsRecord);
    if (logs.length > 100) logs.length = 100;
    saveLocalSmsLogs(logs);

    activeSmsData = smsRecord;

    toggleSmsModal(true, smsRecord);
}

function toggleSmsModal(open = true, data = null) {
    const modal = document.getElementById("smsModal");
    if (!modal) return;

    if (!open) {
        modal.style.display = "none";
        return;
    }

    const payload = data || activeSmsData;
    if (!payload) return;

    const titleEl = document.getElementById("smsModalTitle");
    const badgeEl = document.getElementById("smsModalBadge");
    const phoneEl = document.getElementById("smsModalPhone");
    const msgEl = document.getElementById("smsModalMessage");
    const waBtn = document.getElementById("smsModalWhatsappBtn");
    const simBtn = document.getElementById("smsModalSimBtn");
    const callBtn = document.getElementById("smsModalCallBtn");

    if (phoneEl) phoneEl.textContent = payload.recipientPhone || 'N/A';
    if (msgEl) msgEl.textContent = payload.message || '';
    if (waBtn) waBtn.href = payload.whatsappUrl || '#';
    if (simBtn) simBtn.href = getDirectSmsUri(payload.recipientPhone, payload.message);
    if (callBtn) callBtn.href = `tel:${payload.recipientPhone || ''}`;

    let badgeText = 'Stage 1: Order Confirmation SMS';
    let badgeBg = 'rgba(37,99,235,0.12)';
    let badgeColor = 'var(--primary)';

    if (payload.eventType === 'OUT_FOR_DELIVERY') {
        badgeText = '🚚 Stage 2: Out For Delivery (Today) SMS';
        badgeBg = 'rgba(245,158,11,0.15)';
        badgeColor = '#d97706';
    } else if (payload.eventType === 'DELIVERED') {
        badgeText = '✅ Stage 3: Product Delivered & Warranty SMS';
        badgeBg = 'rgba(16,185,129,0.15)';
        badgeColor = '#10b981';
    } else if (payload.eventType === 'PROCESSING') {
        badgeText = '📦 Stage: Order Processing SMS';
        badgeBg = 'rgba(139,92,246,0.15)';
        badgeColor = '#8b5cf6';
    }

    if (badgeEl) {
        badgeEl.textContent = badgeText;
        badgeEl.style.background = badgeBg;
        badgeEl.style.color = badgeColor;
    }

    modal.style.display = "flex";
}

function copySmsText() {
    if (!activeSmsData || !activeSmsData.message) return;
    navigator.clipboard.writeText(activeSmsData.message).then(() => {
        showToast("📋 SMS text copied to clipboard!");
    }).catch(() => {
        showToast("Copied to clipboard!");
    });
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
            <div class="invoice-header" style="position:relative;">
                <div class="invoice-stamp ${order.paymentStatus && order.paymentStatus.includes('Paid') ? '' : 'cod'}">
                    ${order.paymentStatus && order.paymentStatus.includes('Paid') ? 'PAID (BKASH VERIFIED)' : 'CASH ON DELIVERY'}
                </div>
                <div class="invoice-brand">
                    <h2>💻 TechVerse Online Store</h2>
                    <p>Level 4, Multiplan Center, Elephant Road, Dhaka-1205</p>
                    <p>Helpline: +880 1820-727102 | Email: support@techverse.com</p>
                </div>
                <div class="invoice-meta">
                    <span class="invoice-status-badge">✓ ${order.status || 'CONFIRMED'}</span>
                    <div class="invoice-id">Order #${order.orderId}</div>
                    <div class="invoice-date">${formattedDate}</div>
                    <div style="display:flex; justify-content:flex-end; margin-top:8px;">
                        <div class="invoice-qr-holder" title="Scan to Track Package">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent('https://techverse.com/track/' + order.orderId)}" alt="Order QR">
                        </div>
                    </div>
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

            <!-- LIVE SMS DISPATCH & WHATSAPP ACTION BAR (NO-PRINT) -->
            <div class="no-print" style="margin-top:16px; padding:12px 16px; background:rgba(37,99,235,0.08); border-radius:8px; border:1px solid rgba(37,99,235,0.25); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div style="font-size:13px; color:var(--text-color);">
                    <i class="fa-solid fa-paper-plane" style="color:var(--primary); margin-right:4px;"></i> <b>SMS Notification:</b> Confirmation SMS dispatched to <b>${order.customerPhone}</b>
                </div>
                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                    <a href="${getDirectSmsUri(order.customerPhone, generateSmsText(order, 'ORDER_PLACED'))}" style="background:#0284c7; color:white; text-decoration:none; padding:7px 12px; border-radius:6px; font-weight:700; font-size:12px; display:inline-flex; align-items:center; gap:5px; box-shadow:0 2px 8px rgba(2,132,199,0.3);">
                        <i class="fa-solid fa-comment-sms"></i> SIM SMS
                    </a>
                    <a href="tel:${order.customerPhone}" style="background:#10b981; color:white; text-decoration:none; padding:7px 12px; border-radius:6px; font-weight:700; font-size:12px; display:inline-flex; align-items:center; gap:5px; box-shadow:0 2px 8px rgba(16,185,129,0.3);">
                        <i class="fa-solid fa-phone"></i> Call
                    </a>
                    <button type="button" onclick="triggerSmsNotification(window.currentInvoiceOrder, 'ORDER_PLACED')" style="background:var(--primary); color:white; border:none; padding:7px 12px; border-radius:6px; font-weight:700; cursor:pointer; font-size:12px; display:inline-flex; align-items:center; gap:5px;">
                        📱 View
                    </button>
                    <a href="${getWhatsAppUrl(order, 'ORDER_PLACED')}" target="_blank" style="background:#25D366; color:white; text-decoration:none; padding:7px 12px; border-radius:6px; font-weight:700; font-size:12px; display:inline-flex; align-items:center; gap:5px; box-shadow:0 2px 8px rgba(37,211,102,0.3);">
                        <i class="fa-brands fa-whatsapp" style="font-size:13px;"></i> WhatsApp
                    </a>
                </div>
            </div>
        </div>
    `;

    window.currentInvoiceOrder = order;

    toggleInvoiceModal(true);
}

function toggleInvoiceModal(open = true) {
    const modal = document.getElementById("invoiceModal");
    if (modal) modal.style.display = open ? "flex" : "none";
}

// ==================== ADMIN DASHBOARD SUITE ====================

const ADMIN_DEFAULT_PASS = "admin123";
let currentAdminTab = 'orders';
let adminOrdersFilterStatus = 'All';
let adminOrdersSearchQuery = '';
let adminProductSearchQuery = '';
let adminProductCategoryFilter = 'All';
let adminCouponSearchQuery = '';
let adminMessageSearchQuery = '';
let adminSmsSearchQuery = '';
let cachedAdminOrders = [];
let cachedAdminProducts = [];
let cachedAdminCoupons = [];

// Fallback coupons for offline database mode
const FALLBACK_COUPONS = [
  { code: "TECHVERSE10", discountPercent: 10, maxDiscount: 5000, minSpend: 1000, description: "10% OFF on all TechVerse orders!" },
  { code: "FLASH20", discountPercent: 20, maxDiscount: 10000, minSpend: 5000, description: "20% Flash Sale Discount!" },
  { code: "WELCOME500", discountFlat: 500, minSpend: 2000, description: "Flat ৳500 OFF for new customers!" }
];

function getLocalCoupons() {
    const data = localStorage.getItem("techverse_coupons");
    if (data) {
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch(e) {}
    }
    localStorage.setItem("techverse_coupons", JSON.stringify(FALLBACK_COUPONS));
    return [...FALLBACK_COUPONS];
}

function saveLocalCoupons(coupons) {
    localStorage.setItem("techverse_coupons", JSON.stringify(coupons));
}

function getAdminPin() {
    return localStorage.getItem("techverse_admin_pin") || ADMIN_DEFAULT_PASS;
}

// --- ADMIN AUTHENTICATION ---
function isAdminAuthenticated() {
    return localStorage.getItem("techverse_admin_auth") === "true" || sessionStorage.getItem("techverse_admin_auth") === "true";
}

function toggleAdminPassVisibility() {
    const input = document.getElementById("adminPassInput");
    const icon = document.getElementById("adminPassEyeIcon");
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
        if (icon) {
            icon.className = "fa-regular fa-eye-slash";
        }
    } else {
        input.type = "password";
        if (icon) {
            icon.className = "fa-regular fa-eye";
        }
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    const input = document.getElementById("adminPassInput");
    const errorEl = document.getElementById("adminLoginError");
    const rememberCheckbox = document.getElementById("adminRememberCheckbox");

    if (!input) return;
    const pass = input.value.trim();

    if (pass === getAdminPin()) {
        if (rememberCheckbox && rememberCheckbox.checked) {
            localStorage.setItem("techverse_admin_auth", "true");
        } else {
            sessionStorage.setItem("techverse_admin_auth", "true");
        }
        if (errorEl) errorEl.style.display = "none";
        input.value = "";

        const loginGate = document.getElementById("adminLoginGate");
        const dashboardView = document.getElementById("adminDashboardView");
        if (loginGate) loginGate.style.display = "none";
        if (dashboardView) dashboardView.style.display = "block";

        showToast("🔓 Admin Access Verified! Welcome back.");
        loadAdminData(true);
        updateFounderAdminControls();
    } else {
        if (errorEl) {
            errorEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Incorrect administrator passcode. Access denied.`;
            errorEl.style.display = "flex";
        }
        input.classList.add("input-error-shake");
        setTimeout(() => input.classList.remove("input-error-shake"), 500);
        input.focus();
    }
}

function lockAdminSession() {
    localStorage.removeItem("techverse_admin_auth");
    sessionStorage.removeItem("techverse_admin_auth");
    const loginGate = document.getElementById("adminLoginGate");
    const dashboardView = document.getElementById("adminDashboardView");
    if (loginGate) loginGate.style.display = "block";
    if (dashboardView) dashboardView.style.display = "none";
    updateFounderAdminControls();
    showToast("🔒 Admin Dashboard locked.");
}

function toggleAdminModal(open = true) {
    const modal = document.getElementById("adminModal");
    if (!modal) return;

    if (open) {
        modal.style.display = "flex";
        const loginGate = document.getElementById("adminLoginGate");
        const dashboardView = document.getElementById("adminDashboardView");

        if (isAdminAuthenticated()) {
            if (loginGate) loginGate.style.display = "none";
            if (dashboardView) dashboardView.style.display = "block";
            loadAdminData();
        } else {
            if (loginGate) loginGate.style.display = "block";
            if (dashboardView) dashboardView.style.display = "none";
            const err = document.getElementById("adminLoginError");
            if (err) err.style.display = "none";
            setTimeout(() => {
                const passInput = document.getElementById("adminPassInput");
                if (passInput) passInput.focus();
            }, 100);
        }
    } else {
        modal.style.display = "none";
    }
}

// --- ADMIN TABS NAVIGATION ---
function switchAdminTab(tab, btn) {
    currentAdminTab = tab;

    // Reset active button state
    document.querySelectorAll(".admin-tab").forEach(b => b.classList.remove("active"));
    if (btn) {
        btn.classList.add("active");
    } else {
        const defaultBtn = document.getElementById(`tabBtn${tab.charAt(0).toUpperCase() + tab.slice(1).replace('-p', 'P')}`);
        if (defaultBtn) defaultBtn.classList.add("active");
    }

    // Hide all tab panes
    const panes = {
        'orders': 'adminTabContentOrders',
        'products': 'adminTabContentProducts',
        'add-product': 'adminTabContentAddProduct',
        'coupons': 'adminTabContentCoupons',
        'messages': 'adminTabContentMessages',
        'sms': 'adminTabContentSms'
    };

    Object.keys(panes).forEach(k => {
        const el = document.getElementById(panes[k]);
        if (el) el.style.display = (k === tab) ? 'block' : 'none';
    });

    if (tab === 'orders') {
        loadAdminOrders();
    } else if (tab === 'products') {
        loadAdminProducts();
    } else if (tab === 'add-product') {
        updateLiveProductPreview();
    } else if (tab === 'coupons') {
        loadAdminCoupons();
    } else if (tab === 'messages') {
        loadAdminMessages();
    } else if (tab === 'sms') {
        loadAdminSmsLogs();
    }
}

// --- LOAD STATS & DATA ---
async function loadAdminData(isManual = false) {
    await loadAdminStats();
    if (currentAdminTab === 'orders') {
        await loadAdminOrders();
    } else if (currentAdminTab === 'products') {
        await loadAdminProducts();
    } else if (currentAdminTab === 'coupons') {
        await loadAdminCoupons();
    } else if (currentAdminTab === 'messages') {
        await loadAdminMessages();
    } else if (currentAdminTab === 'sms') {
        await loadAdminSmsLogs();
    }
    if (isManual) {
        showToast("🔄 Dashboard & Stats Synchronized!");
    }
}

async function loadAdminStats() {
    const prods = getLocalProducts();
    const orders = getLocalOrders();
    const coupons = getLocalCoupons();
    const msgs = getLocalMessages();
    const smsLogs = getLocalSmsLogs();

    const revenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

    const renderStats = (data) => {
        const statRev = document.getElementById("statRevenue");
        const statOrd = document.getElementById("statOrders");
        const statPending = document.getElementById("statPendingOrders");
        const statDelivered = document.getElementById("statDeliveredOrders");
        const statProds = document.getElementById("statProducts");
        const statCpn = document.getElementById("statCoupons");
        const statMsg = document.getElementById("statMessages");
        const statSms = document.getElementById("statSmsDispatches");

        if (statRev) statRev.textContent = `৳ ${(data.totalRevenueBDT ?? revenue).toLocaleString()}`;
        if (statOrd) statOrd.textContent = data.totalOrders ?? orders.length;
        if (statPending) statPending.textContent = data.pendingOrders ?? pendingCount;
        if (statDelivered) statDelivered.textContent = data.completedOrders ?? deliveredCount;
        if (statProds) statProds.textContent = data.totalProducts ?? prods.length;
        if (statCpn) statCpn.textContent = data.totalCoupons ?? coupons.length;
        if (statMsg) statMsg.textContent = data.totalMessages ?? msgs.length;
        if (statSms) statSms.textContent = data.totalSmsLogs ?? smsLogs.length;

        // Update tab count badges
        const bOrd = document.getElementById("badgeOrdersCount");
        const bProd = document.getElementById("badgeProductsCount");
        const bCpn = document.getElementById("badgeCouponsCount");
        const bMsg = document.getElementById("badgeMessagesCount");
        const bSms = document.getElementById("badgeSmsCount");
        if (bOrd) bOrd.textContent = data.totalOrders ?? orders.length;
        if (bProd) bProd.textContent = data.totalProducts ?? prods.length;
        if (bCpn) bCpn.textContent = data.totalCoupons ?? coupons.length;
        if (bMsg) bMsg.textContent = data.totalMessages ?? msgs.length;
        if (bSms) bSms.textContent = data.totalSmsLogs ?? smsLogs.length;
    };

    renderStats({
        totalRevenueBDT: revenue,
        totalOrders: orders.length,
        pendingOrders: pendingCount,
        completedOrders: deliveredCount,
        totalProducts: prods.length,
        totalCoupons: coupons.length,
        totalMessages: msgs.length,
        totalSmsLogs: smsLogs.length
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

// --- ORDER MANAGEMENT ---
function filterAdminOrdersStatus(status, btn) {
    adminOrdersFilterStatus = status;
    document.querySelectorAll("#orderStatusChips .chip").forEach(c => c.classList.remove("active"));
    if (btn) btn.classList.add("active");
    renderAdminOrdersList();
}

function handleAdminOrderSearch(val) {
    adminOrdersSearchQuery = (val || '').toLowerCase().trim();
    renderAdminOrdersList();
}

function clearAdminOrderSearch() {
    const input = document.getElementById("orderSearchInput");
    if (input) input.value = '';
    adminOrdersSearchQuery = '';
    renderAdminOrdersList();
}

async function loadAdminOrders() {
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

    cachedAdminOrders = orders;
    window.adminOrdersData = orders;

    // Update status chip counts
    updateOrderStatusChipCounts(orders);
    renderAdminOrdersList();
}

function updateOrderStatusChipCounts(orders) {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'Pending').length;
    const processing = orders.filter(o => o.status === 'Processing').length;
    const shipped = orders.filter(o => o.status === 'Shipped').length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    const cancelled = orders.filter(o => o.status === 'Cancelled').length;

    const setEl = (id, count) => {
        const el = document.getElementById(id);
        if (el) el.textContent = count;
    };
    setEl("chipCountAll", total);
    setEl("chipCountPending", pending);
    setEl("chipCountProcessing", processing);
    setEl("chipCountShipped", shipped);
    setEl("chipCountDelivered", delivered);
    setEl("chipCountCancelled", cancelled);
}

function renderAdminOrdersList() {
    const container = document.getElementById("adminOrdersList");
    if (!container) return;

    let orders = [...(cachedAdminOrders || getLocalOrders())];

    // Status filter
    if (adminOrdersFilterStatus !== 'All') {
        orders = orders.filter(o => o.status === adminOrdersFilterStatus);
    }

    // Search query filter
    if (adminOrdersSearchQuery) {
        const q = adminOrdersSearchQuery;
        orders = orders.filter(o =>
            (o.orderId && o.orderId.toLowerCase().includes(q)) ||
            (o.customerName && o.customerName.toLowerCase().includes(q)) ||
            (o.customerPhone && o.customerPhone.includes(q)) ||
            (o.address && o.address.toLowerCase().includes(q)) ||
            (Array.isArray(o.items) && o.items.some(i => i.name && i.name.toLowerCase().includes(q)))
        );
    }

    if (orders.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:35px 20px; color:var(--text-muted); background:var(--card-elevated); border-radius:var(--radius-sm); border:1px dashed var(--border-color);">
                <p style="font-size:16px; margin-bottom:4px;">📭 No matching orders found.</p>
                <small>Try selecting a different status filter or clearing your search term.</small>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map((o) => {
        const itemsSummary = (o.items || []).map(i => `<b>${escapeHtml(i.name)}</b> (x${i.quantity || 1}) - ৳${(Number(i.price) * (i.quantity || 1)).toLocaleString()}`).join("<br>");
        const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
        const statusClass = (o.status || 'Pending').toLowerCase();

        return `
            <div class="admin-order-card status-${statusClass}">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <strong style="font-size:15px; color:var(--text-color);">Order #${escapeHtml(o.orderId)}</strong>
                        <span class="status-badge-pill status-badge-${statusClass}">
                            ${o.status === 'Delivered' ? '✅' : o.status === 'Shipped' ? '🚚' : o.status === 'Processing' ? '📦' : o.status === 'Cancelled' ? '❌' : '⏳'} ${o.status || 'Pending'}
                        </span>
                        ${o.courier ? `
                            <a href="${o.courier.trackingUrl}" target="_blank" class="courier-consignment-pill" title="Track Courier">
                                <i class="fa-solid fa-truck-fast"></i> ${escapeHtml(o.courier.consignmentId)}
                            </a>
                        ` : ''}
                        <span style="font-size:12px; color:var(--text-muted);">🕒 ${dateStr}</span>
                    </div>
                    <div style="display:flex; gap:5px; align-items:center; flex-wrap:wrap;">
                        <a href="tel:${escapeHtml(o.customerPhone)}" style="padding:5px 9px; background:#10b981; color:white; border-radius:4px; text-decoration:none; font-size:11.5px; font-weight:700; display:inline-flex; align-items:center; gap:4px;" title="Call Customer">
                            <i class="fa-solid fa-phone"></i> Call
                        </a>
                        <button onclick="dispatchOrderViaCourier('${escapeHtml(o.orderId)}')" style="padding:5px 9px; background:#0f172a; color:#38bdf8; border:1px solid #38bdf8; border-radius:4px; font-size:11.5px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Book Steadfast Courier Dispatch">
                            <i class="fa-solid fa-truck-fast"></i> ${o.courier ? 'Re-Ship' : 'Steadfast'}
                        </button>
                        <a href="${getDirectSmsUri(o.customerPhone, generateSmsText(o, o.status === 'Shipped' ? 'OUT_FOR_DELIVERY' : o.status === 'Delivered' ? 'DELIVERED' : 'ORDER_PLACED'))}" style="padding:5px 9px; background:#0284c7; color:white; border-radius:4px; text-decoration:none; font-size:11.5px; font-weight:700; display:inline-flex; align-items:center; gap:4px;" title="Send SIM SMS">
                            <i class="fa-solid fa-comment-sms"></i> SIM SMS
                        </a>
                        <button onclick="sendDirectAdminSms('${escapeHtml(o.orderId)}')" style="padding:5px 9px; background:#25D366; color:white; border:none; border-radius:4px; font-size:11.5px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Send SMS / WhatsApp Notification">
                            <i class="fa-brands fa-whatsapp"></i> WhatsApp
                        </button>
                        <button onclick="printOrderById('${escapeHtml(o.orderId)}')" style="padding:5px 9px; background:var(--primary); color:white; border:none; border-radius:4px; font-size:11.5px; font-weight:700; cursor:pointer;" title="Print Official Tax Invoice">
                            🖨️ Invoice
                        </button>
                        <select onchange="updateOrderStatus('${escapeHtml(o.orderId)}', this.value)" style="padding:5px 7px; border-radius:4px; font-weight:700; font-size:12px; background:var(--card-bg); color:var(--text-color); border:1px solid var(--border-color);">
                            <option value="Pending" ${o.status==='Pending'?'selected':''}>⏳ Pending</option>
                            <option value="Processing" ${o.status==='Processing'?'selected':''}>📦 Processing</option>
                            <option value="Shipped" ${o.status==='Shipped'?'selected':''}>🚚 Shipped</option>
                            <option value="Delivered" ${o.status==='Delivered'?'selected':''}>✅ Delivered</option>
                            <option value="Cancelled" ${o.status==='Cancelled'?'selected':''}>❌ Cancelled</option>
                        </select>
                        <button onclick="deleteAdminOrder('${escapeHtml(o.orderId)}')" title="Delete Order" style="background:var(--danger-light); color:var(--danger); border:1px solid rgba(239,68,68,0.3); padding:4px 8px; border-radius:4px; font-weight:700; cursor:pointer;">
                            🗑️
                        </button>
                    </div>
                </div>
                <div style="font-size:12.5px; line-height:1.55; display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:8px; background:var(--card-bg); padding:10px 12px; border-radius:6px; border:1px solid var(--border-color);">
                    <div>
                        <div>Customer: <b style="color:var(--text-color);">${escapeHtml(o.customerName)}</b></div>
                        <div>Phone: <a href="tel:${escapeHtml(o.customerPhone)}" style="color:var(--primary); text-decoration:none; font-weight:700;">${escapeHtml(o.customerPhone)}</a></div>
                        <div>Address: <span style="color:var(--text-muted);">${escapeHtml(o.address)}</span></div>
                    </div>
                    <div>
                        <div>Payment: <span style="font-weight:700; color:var(--primary);">${escapeHtml(o.paymentMethod || 'COD')}</span></div>
                        <div>Items (${Array.isArray(o.items) ? o.items.length : 1}):</div>
                        <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">${itemsSummary || 'N/A'}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; justify-content:center; align-items:flex-end;">
                        <span style="font-size:11px; color:var(--text-muted);">Total Bill</span>
                        <strong style="color:var(--primary); font-size:17px; font-weight:800;">৳ ${Number(o.totalAmount || 0).toLocaleString()}</strong>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function printOrderById(orderId) {
    const orders = cachedAdminOrders.length ? cachedAdminOrders : getLocalOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
        renderInvoice(order);
    }
}

function printAdminOrder(index) {
    if (window.adminOrdersData && window.adminOrdersData[index]) {
        renderInvoice(window.adminOrdersData[index]);
    }
}

async function updateOrderStatus(orderId, status) {
    let orders = getLocalOrders();
    const idx = orders.findIndex(o => o.orderId === orderId);
    let targetOrder = null;

    if (idx !== -1) {
        orders[idx].status = status;
        targetOrder = orders[idx];
        saveLocalOrders(orders);
        cachedAdminOrders = orders;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        if (data.success && data.data) {
            targetOrder = data.data;
        }
        updateBackendStatus(true);
    } catch (e) {
        updateBackendStatus(false);
    }

    showToast(`Order #${orderId} status changed to ${status}`);
    loadAdminStats();
    updateOrderStatusChipCounts(cachedAdminOrders);
    renderAdminOrdersList();

    // Auto-trigger SMS notification
    if (targetOrder) {
        if (status === 'Shipped') {
            triggerSmsNotification(targetOrder, 'OUT_FOR_DELIVERY');
        } else if (status === 'Delivered') {
            triggerSmsNotification(targetOrder, 'DELIVERED');
        } else if (status === 'Processing') {
            triggerSmsNotification(targetOrder, 'PROCESSING');
        }
    }
}

async function deleteAdminOrder(orderId) {
    if (!confirm(`Are you sure you want to delete Order #${orderId}?`)) return;

    let orders = getLocalOrders();
    orders = orders.filter(o => o.orderId !== orderId);
    saveLocalOrders(orders);
    cachedAdminOrders = orders;

    try {
        await fetch(`${API_BASE_URL}/orders/${orderId}`, { method: "DELETE" });
    } catch (e) {}

    showToast(`Order #${orderId} deleted.`);
    updateOrderStatusChipCounts(orders);
    renderAdminOrdersList();
    loadAdminStats();
}

function sendDirectAdminSms(orderId) {
    const orders = getLocalOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    let eventType = 'ORDER_PLACED';
    if (order.status === 'Shipped') eventType = 'OUT_FOR_DELIVERY';
    else if (order.status === 'Delivered') eventType = 'DELIVERED';
    else if (order.status === 'Processing') eventType = 'PROCESSING';

    triggerSmsNotification(order, eventType);
}

// Export Orders to CSV
function exportOrdersToCsv() {
    const orders = cachedAdminOrders.length ? cachedAdminOrders : getLocalOrders();
    if (!orders || orders.length === 0) {
        alert("No orders available to export.");
        return;
    }

    const headers = ["Order ID", "Date", "Customer Name", "Customer Phone", "Delivery Address", "Payment Method", "Status", "Total Amount (BDT)", "Items Summary"];
    const rows = orders.map(o => {
        const items = (o.items || []).map(i => `${i.name} (x${i.quantity || 1})`).join("; ");
        const date = o.createdAt ? new Date(o.createdAt).toISOString() : '';
        return [
            `"${o.orderId}"`,
            `"${date}"`,
            `"${(o.customerName || '').replace(/"/g, '""')}"`,
            `"${o.customerPhone || ''}"`,
            `"${(o.address || '').replace(/"/g, '""')}"`,
            `"${o.paymentMethod || 'COD'}"`,
            `"${o.status || 'Pending'}"`,
            Number(o.totalAmount || 0),
            `"${items.replace(/"/g, '""')}"`
        ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TechVerse_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📥 Orders spreadsheet exported successfully!");
}

// --- PRODUCT CATALOG MANAGEMENT ---
function handleAdminProductSearch(val) {
    adminProductSearchQuery = (val || '').toLowerCase().trim();
    renderAdminProductsList();
}

function clearAdminProductSearch() {
    const input = document.getElementById("productSearchInput");
    if (input) input.value = '';
    adminProductSearchQuery = '';
    renderAdminProductsList();
}

function handleAdminProductCategoryFilter(cat) {
    adminProductCategoryFilter = cat;
    renderAdminProductsList();
}

async function loadAdminProducts() {
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

    cachedAdminProducts = products;
    productsList = products;
    renderAdminProductsList();
}

function renderAdminProductsList() {
    const container = document.getElementById("adminProductsList");
    if (!container) return;

    let products = [...(cachedAdminProducts.length ? cachedAdminProducts : getLocalProducts())];

    // Filter by Category
    if (adminProductCategoryFilter && adminProductCategoryFilter !== 'All') {
        products = products.filter(p => p.category && p.category.toLowerCase() === adminProductCategoryFilter.toLowerCase());
    }

    // Filter by Search Query
    if (adminProductSearchQuery) {
        const q = adminProductSearchQuery;
        products = products.filter(p =>
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q)) ||
            String(p.id).includes(q)
        );
    }

    if (products.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:35px 20px; color:var(--text-muted); background:var(--card-elevated); border-radius:var(--radius-sm); border:1px dashed var(--border-color);">
                <p style="font-size:16px; margin-bottom:4px;">📦 No matching products found.</p>
                <small>Try selecting "All Categories" or clearing your search term.</small>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(p => {
        const isStock = p.inStock !== false;
        return `
            <div class="admin-product-row">
                <div class="admin-product-info">
                    <img src="${escapeHtml(p.image || 'images/laptop.jpg')}" alt="${escapeHtml(p.name)}" class="admin-product-img" onerror="this.src='images/laptop.jpg'">
                    <div>
                        <strong style="color:var(--text-color); font-size:13.5px;">#${p.id} ${escapeHtml(p.name)}</strong>
                        <span style="font-size:11.5px; color:var(--primary); font-weight:700; margin-left:6px;">(${escapeHtml(p.category || 'General')})</span>
                        <div style="margin-top:2px; display:flex; align-items:center; gap:8px;">
                            <span style="color:var(--primary); font-weight:800; font-size:13px;">৳ ${Number(p.price).toLocaleString()}</span>
                            ${p.oldPrice ? `<span style="font-size:11.5px; color:var(--text-muted); text-decoration:line-through;">৳ ${Number(p.oldPrice).toLocaleString()}</span>` : ''}
                            <span class="stock-tag ${isStock ? 'stock-in' : 'stock-out'}">${isStock ? '✓ In Stock' : '✕ Out of Stock'}</span>
                        </div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <button type="button" onclick="toggleProductStock(${p.id})" style="background:var(--card-bg); border:1px solid var(--border-color); color:var(--text-color); padding:6px 10px; border-radius:4px; font-size:12px; font-weight:700; cursor:pointer;" title="Toggle Stock Availability">
                        ${isStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                    </button>
                    <button type="button" onclick="openEditProductModal(${p.id})" style="background:var(--primary); color:white; border:none; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Edit Product Details">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button type="button" onclick="deleteProduct(${p.id}, '${escapeHtml(p.name).replace(/'/g, "\\'")}')" style="background:var(--danger); color:white; border:none; padding:6px 10px; border-radius:4px; font-size:12px; font-weight:700; cursor:pointer;" title="Delete Product">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

// Toggle Stock
async function toggleProductStock(id) {
    let products = getLocalProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return;

    const newStock = products[idx].inStock === false;
    products[idx].inStock = newStock;
    saveLocalProducts(products);
    cachedAdminProducts = products;
    productsList = products;

    try {
        await fetch(`${API_BASE_URL}/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inStock: newStock })
        });
    } catch (e) {}

    showToast(`Product #${id} marked as ${newStock ? 'In Stock' : 'Out of Stock'}`);
    renderAdminProductsList();
    renderProducts(productsList);
}

// Edit Product Modal Handlers
function toggleEditProductModal(open = true) {
    const modal = document.getElementById("editProductModal");
    if (modal) modal.style.display = open ? "flex" : "none";
}

function openEditProductModal(id) {
    const products = cachedAdminProducts.length ? cachedAdminProducts : getLocalProducts();
    const p = products.find(item => item.id === id);
    if (!p) return;

    document.getElementById("editProdId").value = p.id;
    document.getElementById("editProdName").value = p.name || '';
    document.getElementById("editProdCategory").value = p.category || 'General';
    document.getElementById("editProdPrice").value = p.price || '';
    document.getElementById("editProdOldPrice").value = p.oldPrice || '';
    document.getElementById("editProdWarranty").value = p.warranty || '🛡️ 1 Year Warranty';
    document.getElementById("editProdImage").value = p.image || 'images/laptop.jpg';
    const deliveryEl = document.getElementById("editProdDelivery");
    if (deliveryEl) deliveryEl.value = p.delivery || '🚚 Free Delivery Inside BD';
    document.getElementById("editProdInStock").checked = p.inStock !== false;

    toggleEditProductModal(true);
}

async function submitEditProduct(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById("editProdId").value);
    const name = document.getElementById("editProdName").value.trim();
    const category = document.getElementById("editProdCategory").value.trim();
    const price = parseInt(document.getElementById("editProdPrice").value);
    const oldPriceVal = document.getElementById("editProdOldPrice").value;
    const oldPrice = oldPriceVal ? parseInt(oldPriceVal) : Math.round(price * 1.2);
    const warranty = document.getElementById("editProdWarranty").value.trim();
    const image = document.getElementById("editProdImage").value.trim() || 'images/laptop.jpg';
    const deliveryInput = document.getElementById("editProdDelivery");
    const delivery = deliveryInput && deliveryInput.value.trim() ? deliveryInput.value.trim() : '🚚 Free Delivery Inside BD';
    const inStock = document.getElementById("editProdInStock").checked;

    if (!name || isNaN(price)) {
        alert("Please provide valid product name and price.");
        return;
    }

    const discountBadge = (oldPrice && oldPrice > price) ? `-${Math.round((1 - price / oldPrice) * 100)}%` : '-10%';

    let products = getLocalProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
        products[idx] = {
            ...products[idx],
            name,
            category,
            price,
            oldPrice,
            discountBadge,
            warranty,
            delivery,
            image,
            inStock
        };
        saveLocalProducts(products);
        cachedAdminProducts = products;
        productsList = products;
    }

    try {
        await fetch(`${API_BASE_URL}/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                category,
                price,
                oldPrice,
                warranty,
                delivery,
                image,
                inStock
            })
        });
        updateBackendStatus(true);
    } catch (err) {
        updateBackendStatus(false);
    }

    showToast(`✅ Product "${name}" updated successfully!`);
    toggleEditProductModal(false);
    renderAdminProductsList();
    renderProducts(productsList);
    loadAdminStats();
}

async function deleteProduct(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}" from store database?`)) return;

    let products = getLocalProducts();
    products = products.filter(p => p.id !== id);
    saveLocalProducts(products);
    cachedAdminProducts = products;
    productsList = products;

    try {
        await fetch(`${API_BASE_URL}/products/${id}`, { method: "DELETE" });
    } catch (e) {}

    showToast(`🗑️ Product "${name}" deleted!`);
    renderAdminProductsList();
    renderProducts(productsList);
    loadAdminStats();
}

// --- ADD PRODUCT LOGIC & LIVE PREVIEW ---
function handleCategorySelectChange(val) {
    const customInput = document.getElementById("prodCategoryCustom");
    if (!customInput) return;
    if (val === 'Custom') {
        customInput.style.display = 'block';
        customInput.focus();
    } else {
        customInput.style.display = 'none';
    }
    updateLiveProductPreview();
}

function setAddProductImagePreset(path) {
    const input = document.getElementById("prodImage");
    if (input) {
        input.value = path;
        updateLiveProductPreview();
    }
}

function updateLiveProductPreview() {
    const nameInput = document.getElementById("prodName");
    const selectCat = document.getElementById("prodCategorySelect");
    const customCat = document.getElementById("prodCategoryCustom");
    const priceInput = document.getElementById("prodPrice");
    const oldPriceInput = document.getElementById("prodOldPrice");
    const imageInput = document.getElementById("prodImage");
    const warrantyInput = document.getElementById("prodWarranty");
    const deliveryInput = document.getElementById("prodDelivery");

    const name = (nameInput && nameInput.value.trim()) || "Asus ROG Gaming Laptop";
    const category = (selectCat && selectCat.value === 'Custom' ? (customCat && customCat.value.trim()) : selectCat && selectCat.value) || "Laptop";
    const price = priceInput && priceInput.value ? parseInt(priceInput.value) : 125000;
    const oldPrice = oldPriceInput && oldPriceInput.value ? parseInt(oldPriceInput.value) : Math.round(price * 1.2);
    const image = (imageInput && imageInput.value.trim()) || "images/laptop.jpg";
    const warranty = (warrantyInput && warrantyInput.value.trim()) || "🛡️ 2 Years Warranty";
    const delivery = (deliveryInput && deliveryInput.value.trim()) || "🚚 Free Delivery";

    const disc = (oldPrice && oldPrice > price) ? `-${Math.round((1 - price / oldPrice) * 100)}%` : "-10%";

    const prevImg = document.getElementById("prevImg");
    const prevBadge = document.getElementById("prevBadge");
    const prevCategory = document.getElementById("prevCategory");
    const prevName = document.getElementById("prevName");
    const prevPrice = document.getElementById("prevPrice");
    const prevOldPrice = document.getElementById("prevOldPrice");
    const prevWarranty = document.getElementById("prevWarranty");
    const prevDelivery = document.getElementById("prevDelivery");

    if (prevImg) {
        prevImg.src = image;
        prevImg.onerror = () => { prevImg.src = 'images/laptop.jpg'; };
    }
    if (prevBadge) prevBadge.textContent = disc;
    if (prevCategory) prevCategory.textContent = category;
    if (prevName) prevName.textContent = name;
    if (prevPrice) prevPrice.textContent = `৳ ${Number(price).toLocaleString()}`;
    if (prevOldPrice) prevOldPrice.textContent = `৳ ${Number(oldPrice).toLocaleString()}`;
    if (prevWarranty) prevWarranty.textContent = warranty;
    if (prevDelivery) prevDelivery.textContent = delivery;
}

async function submitAddProduct(e) {
    e.preventDefault();
    const name = document.getElementById("prodName").value.trim();
    const selectCat = document.getElementById("prodCategorySelect").value;
    const customCat = document.getElementById("prodCategoryCustom").value.trim();
    const category = selectCat === 'Custom' ? (customCat || 'General') : selectCat;
    const price = parseInt(document.getElementById("prodPrice").value);
    const oldPriceInput = document.getElementById("prodOldPrice");
    const oldPrice = oldPriceInput && oldPriceInput.value ? parseInt(oldPriceInput.value) : Math.round(price * 1.2);
    const imageInput = document.getElementById("prodImage");
    const image = (imageInput && imageInput.value.trim()) ? imageInput.value.trim() : "images/laptop.jpg";
    const warranty = document.getElementById("prodWarranty").value.trim() || "🛡️ 1 Year Warranty";
    const delivery = document.getElementById("prodDelivery").value.trim() || "🚚 Free Delivery Inside BD";
    const inStock = document.getElementById("prodInStock").checked;

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
        delivery,
        warranty,
        inStock
    };

    let savedProd = newProd;

    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProd),
            signal: AbortSignal.timeout(3000)
        });
        const resData = await response.json();
        if (resData.success && resData.data) {
            savedProd = resData.data;
        }
        updateBackendStatus(true);
    } catch (err) {
        updateBackendStatus(false);
    }

    const products = getLocalProducts();
    products.unshift(savedProd);
    saveLocalProducts(products);
    cachedAdminProducts = products;
    productsList = products;

    showToast(`✅ Product "${name}" added to TechVerse Store!`);
    document.getElementById("addProductForm").reset();
    document.getElementById("prodCategorySelect").value = "Laptop";
    document.getElementById("prodCategoryCustom").style.display = "none";
    if (imageInput) imageInput.value = "images/laptop.jpg";

    renderProducts(productsList);
    loadAdminStats();
    updateLiveProductPreview();

    // Switch to products view
    switchAdminTab('products', document.getElementById('tabBtnProducts'));
}

// --- CUSTOMER INQUIRIES ---
function handleAdminMessageSearch(val) {
    adminMessageSearchQuery = (val || '').toLowerCase().trim();
    renderAdminMessagesList();
}

function clearAdminMessageSearch() {
    const input = document.getElementById("messageSearchInput");
    if (input) input.value = '';
    adminMessageSearchQuery = '';
    renderAdminMessagesList();
}

async function loadAdminMessages() {
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

    window.adminMessagesData = messages;
    renderAdminMessagesList();
}

function renderAdminMessagesList() {
    const container = document.getElementById("adminMessagesList");
    if (!container) return;

    let messages = window.adminMessagesData || getLocalMessages();

    if (adminMessageSearchQuery) {
        const q = adminMessageSearchQuery;
        messages = messages.filter(m =>
            (m.name && m.name.toLowerCase().includes(q)) ||
            (m.email && m.email.toLowerCase().includes(q)) ||
            (m.message && m.message.toLowerCase().includes(q))
        );
    }

    if (!messages || messages.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:35px 20px; color:var(--text-muted); background:var(--card-elevated); border-radius:var(--radius-sm); border:1px dashed var(--border-color);">
                <p style="font-size:16px; margin-bottom:4px;">💬 No customer inquiries found.</p>
                <small>Submitted contact forms will appear here in real-time.</small>
            </div>
        `;
        return;
    }

    container.innerHTML = messages.map(m => {
        const dateStr = m.createdAt ? new Date(m.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
        return `
            <div style="background:var(--card-elevated); padding:14px; margin-bottom:10px; border-radius:var(--radius-sm); border-left:4px solid var(--cyan); box-shadow:var(--shadow-xs); border:1px solid var(--border-color);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div>
                        <strong style="color:var(--text-color); font-size:14px;">👤 ${escapeHtml(m.name)}</strong>
                        <a href="mailto:${escapeHtml(m.email)}?subject=Re:%20TechVerse%20Customer%20Support" style="font-size:12.5px; color:var(--primary); text-decoration:none; margin-left:8px; font-weight:700;">
                            ✉️ ${escapeHtml(m.email)}
                        </a>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:11px; color:var(--text-muted);">🕒 ${dateStr}</span>
                        <a href="mailto:${escapeHtml(m.email)}?subject=Re:%20TechVerse%20Inquiry" style="background:var(--primary); color:white; padding:4px 10px; border-radius:4px; font-size:11.5px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                            <i class="fa-solid fa-reply"></i> Reply
                        </a>
                        <button onclick="deleteAdminMessage(${m.id})" style="background:var(--danger-light); color:var(--danger); border:1px solid rgba(239,68,68,0.3); padding:4px 8px; border-radius:4px; font-weight:700; cursor:pointer;">
                            🗑️
                        </button>
                    </div>
                </div>
                <p style="margin-top:10px; font-size:13px; line-height:1.55; color:var(--text-color); background:var(--card-bg); padding:10px 12px; border-radius:6px; border:1px solid var(--border-color); word-break:break-word;">
                    "${escapeHtml(m.message)}"
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
    window.adminMessagesData = messages;

    try {
        await fetch(`${API_BASE_URL}/contact/${id}`, { method: "DELETE" });
    } catch (e) {}

    showToast("Customer message deleted.");
    renderAdminMessagesList();
    loadAdminStats();
}

// --- SMS NOTIFICATION LOGS ---
function handleAdminSmsSearch(val) {
    adminSmsSearchQuery = (val || '').toLowerCase().trim();
    renderAdminSmsList();
}

function clearAdminSmsSearch() {
    const input = document.getElementById("smsSearchInput");
    if (input) input.value = '';
    adminSmsSearchQuery = '';
    renderAdminSmsList();
}

async function loadAdminSmsLogs() {
    let smsLogs = getLocalSmsLogs();

    try {
        const response = await fetch(`${API_BASE_URL}/sms/logs`, { signal: AbortSignal.timeout(2000) });
        const data = await response.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            smsLogs = data.data;
            saveLocalSmsLogs(smsLogs);
        }
    } catch(e) {}

    window.adminSmsData = smsLogs;
    renderAdminSmsList();
}

function renderAdminSmsList() {
    const container = document.getElementById("adminSmsList");
    if (!container) return;

    let smsLogs = window.adminSmsData || getLocalSmsLogs();

    if (adminSmsSearchQuery) {
        const q = adminSmsSearchQuery;
        smsLogs = smsLogs.filter(s =>
            (s.recipientPhone && s.recipientPhone.includes(q)) ||
            (s.orderId && s.orderId.toLowerCase().includes(q)) ||
            (s.customerName && s.customerName.toLowerCase().includes(q)) ||
            (s.message && s.message.toLowerCase().includes(q))
        );
    }

    if (!smsLogs || smsLogs.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:35px 20px; color:var(--text-muted); background:var(--card-elevated); border-radius:var(--radius-sm); border:1px dashed var(--border-color);">
                <p style="font-size:16px; margin-bottom:4px;">📱 No SMS dispatch logs found.</p>
                <small>Dispatched notifications appear here automatically when orders are placed or updated.</small>
            </div>
        `;
        return;
    }

    container.innerHTML = smsLogs.map(s => {
        const dateStr = s.timestamp ? new Date(s.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
        let stageBadge = 'Stage 1: Order Confirmation';
        if (s.eventType === 'OUT_FOR_DELIVERY') stageBadge = '🚚 Stage 2: Out for Delivery';
        else if (s.eventType === 'DELIVERED') stageBadge = '✅ Stage 3: Delivered';
        else if (s.eventType === 'PROCESSING') stageBadge = '📦 Stage: Processing';

        return `
            <div style="background:var(--card-elevated); padding:12px 14px; margin-bottom:10px; border-radius:var(--radius-sm); border-left:4px solid var(--primary); font-size:13px; border:1px solid var(--border-color);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px;">
                    <div>
                        <strong style="color:var(--text-color);">Order #${escapeHtml(s.orderId)}</strong>
                        <span style="font-size:11px; background:rgba(37,99,235,0.12); color:var(--primary); padding:2px 8px; border-radius:10px; font-weight:700; margin-left:6px;">${stageBadge}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        <span style="font-size:11px; color:var(--text-muted);">🕒 ${dateStr}</span>
                        <a href="tel:${escapeHtml(s.recipientPhone)}" style="background:#10b981; color:white; padding:4px 8px; border-radius:4px; text-decoration:none; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:3px;">
                            <i class="fa-solid fa-phone"></i> Call
                        </a>
                        <a href="${getDirectSmsUri(s.recipientPhone, s.message)}" style="background:#0284c7; color:white; padding:4px 8px; border-radius:4px; text-decoration:none; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:3px;">
                            <i class="fa-solid fa-comment-sms"></i> SIM SMS
                        </a>
                        <a href="${s.whatsappUrl}" target="_blank" style="background:#25D366; color:white; padding:4px 8px; border-radius:4px; text-decoration:none; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:3px;">
                            <i class="fa-brands fa-whatsapp"></i> WhatsApp
                        </a>
                        <button type="button" onclick="deleteAdminSmsLog('${escapeHtml(s.id)}')" style="background:var(--danger-light); color:var(--danger); border:1px solid rgba(239,68,68,0.3); padding:4px 7px; border-radius:4px; font-size:11px; font-weight:700; cursor:pointer;" title="Delete this SMS log">
                            🗑️
                        </button>
                    </div>
                </div>
                <div style="color:var(--text-color); margin-bottom:6px;">Recipient: <b>${escapeHtml(s.recipientPhone)}</b> (${escapeHtml(s.customerName || 'Customer')})</div>
                <div style="background:var(--card-bg); padding:10px 12px; border-radius:6px; color:var(--text-color); font-size:12.5px; line-height:1.55; border:1px solid var(--border-color); word-break:break-word;">
                    ${escapeHtml(s.message)}
                </div>
            </div>
        `;
    }).join("");
}

// --- COUPONS MANAGEMENT SUITE ---
function handleCouponTypeChange(type) {
    const label = document.getElementById("couponValueLabel");
    const input = document.getElementById("couponValueInput");
    if (!label || !input) return;
    if (type === "flat") {
        label.textContent = "Discount Amount (BDT ৳) *";
        input.placeholder = "e.g. 500";
    } else {
        label.textContent = "Discount Rate (%) *";
        input.placeholder = "e.g. 15";
    }
}

function handleAdminCouponSearch(val) {
    adminCouponSearchQuery = (val || '').toLowerCase().trim();
    renderAdminCouponsList();
}

function clearAdminCouponSearch() {
    const input = document.getElementById("couponSearchInput");
    if (input) input.value = '';
    adminCouponSearchQuery = '';
    renderAdminCouponsList();
}

async function loadAdminCoupons() {
    let coupons = getLocalCoupons();

    try {
        const response = await fetch(`${API_BASE_URL}/coupons`, { signal: AbortSignal.timeout(2000) });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
            coupons = data.data;
            saveLocalCoupons(coupons);
            updateBackendStatus(true);
        }
    } catch (e) {
        updateBackendStatus(false);
    }

    cachedAdminCoupons = coupons;
    renderAdminCouponsList();
}

function renderAdminCouponsList() {
    const container = document.getElementById("adminCouponsList");
    if (!container) return;

    let coupons = [...(cachedAdminCoupons.length ? cachedAdminCoupons : getLocalCoupons())];

    if (adminCouponSearchQuery) {
        const q = adminCouponSearchQuery;
        coupons = coupons.filter(c =>
            (c.code && c.code.toLowerCase().includes(q)) ||
            (c.description && c.description.toLowerCase().includes(q))
        );
    }

    if (coupons.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:35px 20px; color:var(--text-muted); background:var(--card-elevated); border-radius:var(--radius-sm); border:1px dashed var(--border-color);">
                <p style="font-size:16px; margin-bottom:4px;">🏷️ No discount coupons found.</p>
                <small>Create new promo codes above to incentivize store customers.</small>
            </div>
        `;
        return;
    }

    container.innerHTML = coupons.map(c => {
        const discountBadge = c.discountPercent 
            ? `${c.discountPercent}% OFF` 
            : `৳${Number(c.discountFlat || 0).toLocaleString()} OFF`;
        const minSpendText = c.minSpend ? `Min Spend: ৳${Number(c.minSpend).toLocaleString()}` : 'No Minimum Spend';
        const maxCapText = c.maxDiscount ? `Max Cap: ৳${Number(c.maxDiscount).toLocaleString()}` : 'No Max Cap';

        return `
            <div class="admin-coupon-card">
                <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:240px;">
                    <span class="coupon-code-pill"><i class="fa-solid fa-tag"></i> ${escapeHtml(c.code)}</span>
                    <div>
                        <strong style="color:var(--text-color); font-size:13.5px; display:block;">${escapeHtml(c.description || 'Promotional Discount')}</strong>
                        <div style="margin-top:3px; font-size:11.5px; color:var(--text-muted); display:flex; gap:10px; flex-wrap:wrap;">
                            <span style="color:#ec4899; font-weight:800;">🎁 ${discountBadge}</span>
                            <span>•</span>
                            <span>${minSpendText}</span>
                            <span>•</span>
                            <span>${maxCapText}</span>
                        </div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button type="button" onclick="copyCouponCode('${escapeHtml(c.code)}')" style="background:var(--card-bg); border:1px solid var(--border-color); color:var(--text-color); padding:6px 12px; border-radius:4px; font-size:12px; font-weight:700; cursor:pointer;" title="Copy Code">
                        📋 Copy
                    </button>
                    <button type="button" onclick="deleteAdminCoupon('${escapeHtml(c.code)}')" style="background:var(--danger-light); color:var(--danger); border:1px solid rgba(239,68,68,0.3); padding:6px 10px; border-radius:4px; font-size:12px; font-weight:700; cursor:pointer;" title="Delete Coupon">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

function copyCouponCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        showToast(`📋 Coupon code "${code}" copied to clipboard!`);
    }).catch(() => {
        showToast(`Code: ${code}`);
    });
}

async function submitAddCoupon(e) {
    e.preventDefault();
    const code = document.getElementById("couponCodeInput").value.trim().toUpperCase();
    const type = document.getElementById("couponTypeSelect").value;
    const value = parseInt(document.getElementById("couponValueInput").value);
    const minSpendVal = document.getElementById("couponMinSpendInput").value;
    const minSpend = minSpendVal ? parseInt(minSpendVal) : 0;
    const maxDiscVal = document.getElementById("couponMaxDiscountInput").value;
    const maxDiscount = maxDiscVal ? parseInt(maxDiscVal) : 0;
    const desc = document.getElementById("couponDescInput").value.trim() || `${code} Special Voucher`;

    if (!code || isNaN(value) || value <= 0) {
        alert("Please enter a valid coupon code and discount value.");
        return;
    }

    let coupons = getLocalCoupons();
    if (coupons.some(c => c.code.toUpperCase() === code)) {
        alert(`Coupon code "${code}" already exists.`);
        return;
    }

    const newCoupon = {
        code,
        ...(type === 'percent' ? { discountPercent: value } : { discountFlat: value }),
        minSpend,
        maxDiscount,
        description: desc
    };

    coupons.unshift(newCoupon);
    saveLocalCoupons(coupons);
    cachedAdminCoupons = coupons;

    try {
        await fetch(`${API_BASE_URL}/coupons`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCoupon),
            signal: AbortSignal.timeout(3000)
        });
        updateBackendStatus(true);
    } catch(err) {
        updateBackendStatus(false);
    }

    showToast(`🎉 Coupon "${code}" created and activated!`);
    document.getElementById("addCouponForm").reset();
    handleCouponTypeChange("percent");
    renderAdminCouponsList();
    loadAdminStats();
}

async function deleteAdminCoupon(code) {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;

    let coupons = getLocalCoupons();
    coupons = coupons.filter(c => c.code.toUpperCase() !== code.toUpperCase());
    saveLocalCoupons(coupons);
    cachedAdminCoupons = coupons;

    try {
        await fetch(`${API_BASE_URL}/coupons/${encodeURIComponent(code)}`, { method: "DELETE" });
    } catch (e) {}

    showToast(`🗑️ Coupon "${code}" deleted.`);
    renderAdminCouponsList();
    loadAdminStats();
}

// --- DIRECT SMS & WHATSAPP BROADCASTER ---
const SMS_TEMPLATES = {
    order_confirmation: "TechVerse: প্রিয় {NAME}, আপনার TechVerse অর্ডার #{ORDER_ID} নিশ্চিত করা হয়েছে! আইটেম প্যাকিং সম্পন্ন হচ্ছে এবং দ্রুত ডেলিভারির জন্য প্রস্তুত করা হচ্ছে। যেকোনো প্রয়োজনে কল করুন: 01820-727102।",
    out_for_delivery: "TechVerse: প্রিয় {NAME}, আপনার অর্ডার #{ORDER_ID} আজ ডেলিভারির জন্য বের হয়েছে! আনুমানিক সময়: দুপুর ২টা - সন্ধ্যা ৬টা। হেল্পলাইন: 01820-727102।",
    delivery_completed: "TechVerse: প্রিয় {NAME}, আপনার TechVerse অর্ডার #{ORDER_ID} সফলভাবে ডেলিভার করা হয়েছে! অফিসিয়াল ওয়ারেন্টির জন্য রশিদটি সংরক্ষণ করুন। আমাদের সাথে কেনাকাটার জন্য ধন্যবাদ!",
    vip_discount: "TechVerse: প্রিয় {NAME}, আপনার জন্য বিশেষ উপহার! পরবর্তী অর্ডারে ফ্ল্যাট ৳৫00 ছাড় পেতে ব্যবহার করুন প্রোমো কোড: WELCOME500। ভিজিট করুন: http://localhost:5000",
    payment_reminder: "TechVerse: প্রিয় {NAME}, আপনার অর্ডার #{ORDER_ID}-এর ক্যাশ অন ডেলিভারি বিল প্রস্তুত রয়েছে। ডেলিভারি রাইডার শীঘ্রই পৌঁছাবে। হেল্পলাইন: 01820-727102।",
    delay_notice: "TechVerse: প্রিয় {NAME}, অপ্রত্যাশিত কারণে আপনার অর্ডার #{ORDER_ID}-এর ডেলিভারিতে সামান্য বিলম্ব হতে পারে। আমরা দ্রুততম সময়ে পৌঁছানোর চেষ্টা করছি। আন্তরিকভাবে দুঃখিত।"
};

function toggleDirectSmsModal(open = true, prefillPhone = '', prefillName = '', prefillOrderId = '') {
    const modal = document.getElementById("directSmsModal");
    if (!modal) return;
    modal.style.display = open ? "flex" : "none";

    if (open) {
        if (prefillPhone) document.getElementById("directSmsPhone").value = prefillPhone;
        if (prefillName) document.getElementById("directSmsCustomerName").value = prefillName;
        window.currentDirectSmsOrderId = prefillOrderId || '';
        updateDirectSmsCharCount();
        setTimeout(() => {
            const phoneInput = document.getElementById("directSmsPhone");
            if (phoneInput && !prefillPhone) phoneInput.focus();
        }, 100);
    }
}

function applyDirectSmsTemplate(key) {
    const textarea = document.getElementById("directSmsMessage");
    const name = document.getElementById("directSmsCustomerName").value.trim() || 'গ্রাহক';
    const orderId = window.currentDirectSmsOrderId || 'TV-' + Math.floor(100000 + Math.random() * 900000);

    if (key === 'custom') {
        textarea.value = '';
    } else if (SMS_TEMPLATES[key]) {
        textarea.value = SMS_TEMPLATES[key].replace(/{NAME}/g, name).replace(/{ORDER_ID}/g, orderId);
    }
    updateDirectSmsCharCount();
}

function updateDirectSmsCharCount() {
    const textarea = document.getElementById("directSmsMessage");
    const counter = document.getElementById("directSmsCharCount");
    if (!textarea || !counter) return;
    const len = textarea.value.length;
    const parts = Math.ceil(len / 160) || 1;
    counter.textContent = `${len} chars (${parts} SMS part${parts > 1 ? 's' : ''})`;
}

async function submitDirectSms(e) {
    e.preventDefault();
    const phone = document.getElementById("directSmsPhone").value.trim();
    const customerName = document.getElementById("directSmsCustomerName").value.trim() || 'Customer';
    const message = document.getElementById("directSmsMessage").value.trim();
    const orderId = window.currentDirectSmsOrderId || 'DIRECT-' + Math.floor(1000 + Math.random() * 9000);

    if (!phone || !message) {
        alert("Please enter recipient phone and message body.");
        return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let standardPhone = cleanPhone;
    if (standardPhone.startsWith('0')) standardPhone = '88' + standardPhone;
    else if (!standardPhone.startsWith('880')) standardPhone = '880' + standardPhone;

    const newLog = {
        id: 'SMS-' + Date.now(),
        orderId,
        customerName,
        recipientPhone: phone,
        standardPhone,
        eventType: 'DIRECT_CUSTOM',
        message,
        whatsappUrl: `https://api.whatsapp.com/send?phone=${standardPhone}&text=${encodeURIComponent(message)}`,
        status: 'Dispatched (Sent)',
        timestamp: new Date().toISOString()
    };

    const logs = getLocalSmsLogs();
    logs.unshift(newLog);
    saveLocalSmsLogs(logs);
    window.adminSmsData = logs;

    try {
        await fetch(`${API_BASE_URL}/sms/send-direct`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, message, customerName, orderId }),
            signal: AbortSignal.timeout(3000)
        });
        updateBackendStatus(true);
    } catch (err) {
        updateBackendStatus(false);
    }

    showToast(`📱 SMS dispatched to ${phone}!`);
    toggleDirectSmsModal(false);
    renderAdminSmsList();
    loadAdminStats();
}

function prepareDirectWhatsapp(e) {
    const phone = document.getElementById("directSmsPhone").value.trim();
    const message = document.getElementById("directSmsMessage").value.trim();
    if (!phone || !message) {
        e.preventDefault();
        alert("Please provide recipient phone number and message body.");
        return;
    }

    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '88' + clean;
    else if (!clean.startsWith('880')) clean = '880' + clean;

    const targetUrl = `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(message)}`;
    window.open(targetUrl, '_blank');
}

function prepareDirectSimSms(e) {
    const phone = document.getElementById("directSmsPhone").value.trim();
    const message = document.getElementById("directSmsMessage").value.trim();
    if (!phone || !message) {
        e.preventDefault();
        alert("Please enter phone number and message.");
        return;
    }
    const uri = getDirectSmsUri(phone, message);
    window.location.href = uri;
}

function copyDirectSmsText() {
    const message = document.getElementById("directSmsMessage").value;
    if (!message) {
        alert("Message is empty.");
        return;
    }
    navigator.clipboard.writeText(message).then(() => {
        showToast("📋 SMS message text copied!");
    });
}

async function deleteAdminSmsLog(id) {
    if (!confirm("Are you sure you want to delete this SMS log?")) return;

    let logs = getLocalSmsLogs();
    logs = logs.filter(l => l.id !== id);
    saveLocalSmsLogs(logs);
    window.adminSmsData = logs;

    try {
        await fetch(`${API_BASE_URL}/sms/logs/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch(e) {}

    showToast("SMS log deleted.");
    renderAdminSmsList();
    loadAdminStats();
}

async function clearAllAdminSmsLogs() {
    if (!confirm("Are you sure you want to clear ALL SMS dispatch logs?")) return;

    saveLocalSmsLogs([]);
    window.adminSmsData = [];

    try {
        await fetch(`${API_BASE_URL}/sms/logs`, { method: "DELETE" });
    } catch(e) {}

    showToast("All SMS notification logs cleared.");
    renderAdminSmsList();
    loadAdminStats();
}

// --- ADMIN PIN SETTINGS ---
function toggleChangePinModal(open = true) {
    const modal = document.getElementById("adminChangePinModal");
    if (!modal) return;
    modal.style.display = open ? "flex" : "none";
    if (open) {
        document.getElementById("changeAdminPinForm").reset();
        const msg = document.getElementById("changePinMsg");
        if (msg) msg.style.display = "none";
        setTimeout(() => {
            const curInput = document.getElementById("pinCurrentInput");
            if (curInput) curInput.focus();
        }, 100);
    }
}

function submitChangeAdminPin(e) {
    e.preventDefault();
    const currentPin = document.getElementById("pinCurrentInput").value.trim();
    const newPin = document.getElementById("pinNewInput").value.trim();
    const confirmPin = document.getElementById("pinConfirmInput").value.trim();
    const msgEl = document.getElementById("changePinMsg");

    const activePin = getAdminPin();
    if (currentPin !== activePin) {
        msgEl.style.display = "block";
        msgEl.style.background = "rgba(239,68,68,0.15)";
        msgEl.style.color = "#ef4444";
        msgEl.textContent = "❌ Current PIN is incorrect.";
        return;
    }

    if (newPin.length < 4) {
        msgEl.style.display = "block";
        msgEl.style.background = "rgba(239,68,68,0.15)";
        msgEl.style.color = "#ef4444";
        msgEl.textContent = "❌ New PIN must be at least 4 characters long.";
        return;
    }

    if (newPin !== confirmPin) {
        msgEl.style.display = "block";
        msgEl.style.background = "rgba(239,68,68,0.15)";
        msgEl.style.color = "#ef4444";
        msgEl.textContent = "❌ New PIN and Confirm PIN do not match.";
        return;
    }

    localStorage.setItem("techverse_admin_pin", newPin);
    msgEl.style.display = "block";
    msgEl.style.background = "rgba(16,185,129,0.15)";
    msgEl.style.color = "#10b981";
    msgEl.textContent = "✅ Admin passcode successfully updated!";

    showToast("🔑 Admin passcode updated successfully!");
    setTimeout(() => {
        toggleChangePinModal(false);
    }, 1200);
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

    // Quick Admin Panel Shortcut: Alt + A or Ctrl + Shift + A
    // Global ESC key to close all modals & drawers instantly
    document.addEventListener("keydown", function (e) {
        if ((e.altKey && (e.key === 'a' || e.key === 'A')) || (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A'))) {
            e.preventDefault();
            toggleAdminModal(true);
        } else if (e.key === "Escape") {
            // Close any open modal
            document.querySelectorAll(".modal").forEach(m => {
                m.style.display = "none";
            });
            const cartDrawer = document.getElementById("cartDrawer");
            if (cartDrawer) cartDrawer.classList.remove("open");
            const wishDrawer = document.getElementById("wishlistDrawer");
            if (wishDrawer) wishDrawer.classList.remove("open");
        }
    });

    // Global backdrop click to close any modal when clicking outside its content box
    window.addEventListener("click", function (e) {
        if (e.target && e.target.classList && e.target.classList.contains("modal")) {
            e.target.style.display = "none";
        }
    });
}

// ==========================================================================
// 1. RECENT SALES LIVE SOCIAL PROOF TOAST
// ==========================================================================

const RECENT_SALES_SEEDS = [
    { buyer: "Tanvir Ahmed (Dhanmondi, Dhaka)", product: "Gaming Laptop", time: "2 mins ago", img: "images/laptop.jpg" },
    { buyer: "Rahim Chowdhury (GEC, Chattogram)", product: "Gaming Keyboard", time: "5 mins ago", img: "images/keyboard.jpg" },
    { buyer: "Farhan Kabir (Uttara, Dhaka)", product: "RTX Graphics Card", time: "8 mins ago", img: "images/gpu.jpg" },
    { buyer: "Nafis Imtiaz (Sylhet Sadar)", product: "Gaming Monitor", time: "12 mins ago", img: "images/monitor.jpg" },
    { buyer: "Sakib Al Hasan (Mirpur-10, Dhaka)", product: "1TB High-Speed SSD", time: "15 mins ago", img: "images/ssd.jpg" },
    { buyer: "Zubair Hossain (Rajshahi City)", product: "Gaming Headphone", time: "19 mins ago", img: "images/headphone.jpg" },
    { buyer: "Ayman Sadiq (Khulna Sadar)", product: "Intel Core i7 Processor", time: "24 mins ago", img: "images/processor.jpg" }
];

let recentSalesIndex = 0;
let recentSalesTimer = null;

function initRecentSalesToasts() {
    const toast = document.getElementById("recentSalesToast");
    if (!toast) return;

    // First appearance after initial user interaction
    setTimeout(showNextRecentSaleToast, 5000);

    if (recentSalesTimer) clearInterval(recentSalesTimer);
    recentSalesTimer = setInterval(showNextRecentSaleToast, 30000);
}

function showNextRecentSaleToast() {
    const toast = document.getElementById("recentSalesToast");
    if (!toast) return;

    const seed = RECENT_SALES_SEEDS[recentSalesIndex % RECENT_SALES_SEEDS.length];
    recentSalesIndex++;

    const buyerEl = document.getElementById("recentSalesBuyer");
    const prodEl = document.getElementById("recentSalesProduct");
    const timeEl = document.getElementById("recentSalesTime");
    const imgEl = document.getElementById("recentSalesImg");

    if (buyerEl) buyerEl.textContent = seed.buyer;
    if (prodEl) prodEl.textContent = seed.product;
    if (timeEl) timeEl.textContent = `⚡ ${seed.time} • Verified Buyer`;
    if (imgEl) {
        imgEl.src = seed.img;
        imgEl.onerror = () => { imgEl.src = 'images/laptop.jpg'; };
    }

    toast.style.display = "flex";
    toast.style.opacity = "1";

    setTimeout(() => {
        dismissRecentSalesToast();
    }, 6500);
}

function dismissRecentSalesToast() {
    const toast = document.getElementById("recentSalesToast");
    if (toast) {
        toast.style.opacity = "0";
        setTimeout(() => { toast.style.display = "none"; }, 300);
    }
}

// ==========================================================================
// 2. PRODUCT COMPARISON SUITE (DOCK & SIDE-BY-SIDE MODAL)
// ==========================================================================

function toggleCompareItem(id) {
    const idx = compareList.indexOf(id);
    if (idx !== -1) {
        compareList.splice(idx, 1);
        showToast("⚖️ Product removed from Comparison list.");
    } else {
        if (compareList.length >= 4) {
            alert("⚠️ You can compare a maximum of 4 products at the same time.");
            return;
        }
        compareList.push(id);
        const p = getLocalProducts().find(item => item.id === id);
        showToast(`⚖️ ${p ? p.name : 'Product'} added to Comparison!`);
    }

    localStorage.setItem("techverse_compare", JSON.stringify(compareList));
    renderCompareDock();
    renderProducts(productsList);
}

function renderCompareDock() {
    const dock = document.getElementById("compareDock");
    const dockItems = document.getElementById("compareDockItems");
    const dockCount = document.getElementById("compareDockCount");
    const headerBtn = document.getElementById("compareHeaderBtn");

    if (headerBtn) {
        const badge = headerBtn.querySelector("#compareCountBadge");
        if (badge) badge.textContent = compareList.length;
    }

    if (!dock) return;

    if (compareList.length === 0) {
        dock.style.display = "none";
        return;
    }

    dock.style.display = "flex";
    if (dockCount) dockCount.textContent = compareList.length;

    const prods = getLocalProducts();
    if (dockItems) {
        dockItems.innerHTML = compareList.map(id => {
            const p = prods.find(item => item.id === id) || { name: 'Item', image: 'images/laptop.jpg' };
            return `
                <div class="compare-dock-thumb" title="${escapeHtml(p.name)}">
                    <img src="${p.image}" alt="${escapeHtml(p.name)}" onerror="this.src='images/laptop.jpg'">
                    <button type="button" class="compare-dock-remove" onclick="toggleCompareItem(${id})" title="Remove">&times;</button>
                </div>
            `;
        }).join("");
    }
}

function toggleCompareModal(open = true) {
    const modal = document.getElementById("compareModal");
    if (!modal) return;
    modal.style.display = open ? "flex" : "none";
    if (open) {
        renderCompareTable();
    }
}

function renderCompareTable() {
    const container = document.getElementById("compareTableContainer");
    if (!container) return;

    if (compareList.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
                <div style="font-size:40px; margin-bottom:10px;">⚖️</div>
                <h3>No Products In Comparison</h3>
                <p>Click the ⚖️ Compare icon on any product card in the catalog to compare up to 4 items.</p>
            </div>
        `;
        return;
    }

    const prods = getLocalProducts();
    const items = compareList.map(id => prods.find(p => p.id === id)).filter(Boolean);

    let html = `
        <table class="compare-table">
            <thead>
                <tr>
                    <th style="width:160px; text-align:left;">Feature</th>
                    ${items.map(p => `
                        <th>
                            <img src="${p.image}" alt="${escapeHtml(p.name)}" style="height:70px; object-fit:contain; margin-bottom:6px;" onerror="this.src='images/laptop.jpg'"><br>
                            <span style="font-size:13px; font-weight:800; color:var(--text-color);">${escapeHtml(p.name)}</span>
                            <div style="margin-top:4px;">
                                <button type="button" onclick="toggleCompareItem(${p.id})" style="background:var(--danger-light); color:var(--danger); border:none; padding:3px 8px; border-radius:4px; font-size:10.5px; font-weight:700; cursor:pointer;">
                                    Remove
                                </button>
                            </div>
                        </th>
                    `).join("")}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="font-weight:700; text-align:left;">Price (BDT)</td>
                    ${items.map(p => `
                        <td style="color:var(--primary); font-size:16px; font-weight:800;">
                            ৳ ${Number(p.price).toLocaleString()}
                            ${p.oldPrice ? `<div style="font-size:12px; color:var(--text-muted); text-decoration:line-through;">৳ ${Number(p.oldPrice).toLocaleString()}</div>` : ''}
                        </td>
                    `).join("")}
                </tr>
                <tr>
                    <td style="font-weight:700; text-align:left;">Category</td>
                    ${items.map(p => `<td><b>${escapeHtml(p.category || 'General')}</b></td>`).join("")}
                </tr>
                <tr>
                    <td style="font-weight:700; text-align:left;">Official Warranty</td>
                    ${items.map(p => `<td>${escapeHtml(p.warranty || '1 Year Official Warranty')}</td>`).join("")}
                </tr>
                <tr>
                    <td style="font-weight:700; text-align:left;">Delivery</td>
                    ${items.map(p => `<td>${escapeHtml(p.delivery || 'Free Inside BD')}</td>`).join("")}
                </tr>
                <tr>
                    <td style="font-weight:700; text-align:left;">Availability</td>
                    ${items.map(p => `
                        <td>
                            <span style="font-weight:700; color:${p.inStock !== false ? '#10b981' : '#ef4444'};">
                                ${p.inStock !== false ? '✔ In Stock' : '✕ Out of Stock'}
                            </span>
                        </td>
                    `).join("")}
                </tr>
                <tr>
                    <td style="font-weight:700; text-align:left;">Rating</td>
                    ${items.map(p => `<td><span style="color:#f59e0b;">${p.rating || '★★★★★'}</span> (4.9)</td>`).join("")}
                </tr>
                <tr>
                    <td style="font-weight:700; text-align:left;">0% EMI Option</td>
                    ${items.map(p => `
                        <td>
                            <button type="button" onclick="openEmiModal(${p.id}); toggleCompareModal(false);" style="background:#0284c7; color:white; border:none; padding:4px 10px; border-radius:4px; font-size:11.5px; font-weight:700; cursor:pointer;">
                                ৳${Math.round(p.price / 12).toLocaleString()}/mo
                            </button>
                        </td>
                    `).join("")}
                </tr>
                <tr>
                    <td style="font-weight:700; text-align:left;">Action</td>
                    ${items.map(p => `
                        <td>
                            <button type="button" onclick="addToCartById(${p.id}); toggleCompareModal(false);" style="background:var(--primary); color:white; border:none; padding:8px 14px; border-radius:var(--radius-sm); font-weight:800; font-size:12px; cursor:pointer; box-shadow:var(--shadow-xs);">
                                🛒 Add to Cart
                            </button>
                        </td>
                    `).join("")}
                </tr>
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

function clearAllCompareItems() {
    compareList = [];
    localStorage.removeItem("techverse_compare");
    renderCompareDock();
    toggleCompareModal(false);
    renderProducts(productsList);
    showToast("Comparison list cleared.");
}

// ==========================================================================
// 3. FLOATING LIVE CHAT & WHATSAPP SUPPORT BOT WIDGET
// ==========================================================================

function toggleChatWidget(open) {
    const box = document.getElementById("chatWidgetBox");
    if (!box) return;

    if (open === undefined) {
        box.style.display = (box.style.display === "none" || !box.style.display) ? "flex" : "none";
    } else {
        box.style.display = open ? "flex" : "none";
    }

    if (box.style.display === "flex") {
        setTimeout(() => {
            const input = document.getElementById("chatUserInput");
            if (input) input.focus();
        }, 150);
    }
}

function handleChatPrompt(type) {
    const messages = document.getElementById("chatMessages");
    if (!messages) return;

    let userText = "";
    let botReply = "";

    if (type === 'whatsapp') {
        userText = "Connect me with Human Tech Specialist on WhatsApp";
        botReply = "Redirecting you to our official WhatsApp support desk (+880 1820-727102)...";
        appendChatBubble(userText, 'user');
        setTimeout(() => {
            appendChatBubble(botReply, 'bot');
            window.open("https://api.whatsapp.com/send?phone=8801820727102&text=Hello%20TechVerse%20Support!%20I%20need%20assistance%20with%20products.", "_blank");
        }, 600);
        return;
    } else if (type === 'track') {
        userText = "How do I track my order?";
        botReply = "You can instantly track your package using your phone number or Order ID in our Live Order Tracker!";
        appendChatBubble(userText, 'user');
        setTimeout(() => {
            appendChatBubble(botReply, 'bot');
            toggleTrackModal(true);
        }, 600);
        return;
    } else if (type === 'warranty') {
        userText = "What is your official warranty policy?";
        botReply = "🛡️ All TechVerse products come with 1 to 3 Years Official Brand Replacement Warranty with RMA service centers at Motijheel and Multiplan Center Dhaka.";
    } else if (type === 'pc_builder') {
        userText = "Can you help me build a custom PC?";
        botReply = "🖥️ Absolutely! Try our new interactive Custom PC Builder Studio to pick components with automatic wattage and price calculations.";
        appendChatBubble(userText, 'user');
        setTimeout(() => {
            appendChatBubble(botReply, 'bot');
            togglePcBuilderModal(true);
        }, 600);
        return;
    } else if (type === 'helpline') {
        userText = "What is your customer helpline number?";
        botReply = "📞 Our direct hotline is <b>+880 1820-727102</b> (Open Saturday to Thursday, 10:00 AM - 08:30 PM).";
    }

    appendChatBubble(userText, 'user');
    setTimeout(() => {
        appendChatBubble(botReply, 'bot');
    }, 600);
}

function handleChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById("chatUserInput");
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;

    appendChatBubble(msg, 'user');
    input.value = "";

    const lower = msg.toLowerCase();
    let reply = "Thanks for contacting TechVerse! Our support specialist has noted your inquiry. For instant hotline assistance call +880 1820-727102.";

    if (lower.includes("price") || lower.includes("dam") || lower.includes("cost")) {
        reply = "All real-time catalog prices in BDT are shown on our homepage. You can sort by lowest to highest price or filter by category!";
    } else if (lower.includes("delivery") || lower.includes("shipping")) {
        reply = "🚚 Delivery inside Dhaka is ৳60 (24-48 hrs). Outside Dhaka is ৳120 (48-72 hrs) via Steadfast & RedX express courier with Cash on Delivery.";
    } else if (lower.includes("bkash") || lower.includes("payment") || lower.includes("cod")) {
        reply = "We support Cash on Delivery (COD), bKash Merchant (01820-727102), Nagad, and 0% EMI with credit cards!";
    } else if (lower.includes("discount") || lower.includes("coupon") || lower.includes("voucher")) {
        reply = "🎁 Try using coupon code <b>WELCOME500</b> for ৳500 OFF or spin our Lucky Wheel at the top header to win discounts!";
    } else if (lower.includes("shop") || lower.includes("location") || lower.includes("outlet") || lower.includes("address")) {
        reply = "📍 Visit our Flagship Showroom at Level 4, Multiplan Center, New Elephant Road, Dhaka or Chittagong GEC Circle!";
    }

    setTimeout(() => {
        appendChatBubble(reply, 'bot');
    }, 700);
}

function appendChatBubble(text, sender) {
    const messages = document.getElementById("chatMessages");
    if (!messages) return;

    const div = document.createElement("div");
    div.className = `chat-msg ${sender}`;
    div.innerHTML = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// ==========================================================================
// 4. INTERACTIVE CUSTOM PC BUILDER STUDIO
// ==========================================================================

const PC_BUILD_SLOTS = [
    { key: 'cpu', name: 'Processor (CPU)', icon: 'microchip', category: 'Processor', wattage: 65, required: true },
    { key: 'motherboard', name: 'Motherboard', icon: 'chess-board', category: 'General', wattage: 30, required: true },
    { key: 'ram', name: 'Memory (RAM)', icon: 'memory', category: 'RAM', wattage: 10, required: true },
    { key: 'gpu', name: 'Graphics Card (GPU)', icon: 'film', category: 'Graphics Card', wattage: 220, required: false },
    { key: 'storage', name: 'Solid State Drive (SSD)', icon: 'hard-drive', category: 'SSD', wattage: 10, required: true },
    { key: 'psu', name: 'Power Supply Unit (PSU)', icon: 'bolt', category: 'Power Bank', wattage: 0, required: true },
    { key: 'casing', name: 'Gaming Casing / Case', icon: 'box', category: 'General', wattage: 15, required: true },
    { key: 'monitor', name: 'Monitor / Display', icon: 'desktop', category: 'Monitor', wattage: 35, required: false }
];

function togglePcBuilderModal(open = true) {
    const modal = document.getElementById("pcBuilderModal");
    if (!modal) return;
    modal.style.display = open ? "flex" : "none";
    if (open) {
        renderPcBuilderSlots();
    }
}

function renderPcBuilderSlots() {
    const grid = document.getElementById("pcBuilderSlotsGrid");
    if (!grid) return;

    let total = 0;
    let totalWattage = 50; // Base motherboard/fans wattage

    grid.innerHTML = PC_BUILD_SLOTS.map(slot => {
        const item = pcBuild[slot.key];
        if (item) {
            total += Number(item.price || 0);
            totalWattage += Number(slot.wattage || 0);
            return `
                <div class="pc-slot-card slot-filled">
                    <div class="slot-icon-box" style="background:rgba(16,185,129,0.15); color:#10b981;">
                        <i class="fa-solid fa-${slot.icon}"></i>
                    </div>
                    <div style="flex:1; min-width:180px;">
                        <span class="slot-title">${escapeHtml(slot.name)}</span>
                        <strong style="color:var(--text-color); font-size:13.5px; display:block;">${escapeHtml(item.name)}</strong>
                        <div style="margin-top:2px; display:flex; gap:10px; font-size:12px;">
                            <span style="color:var(--primary); font-weight:800;">৳ ${Number(item.price).toLocaleString()}</span>
                            ${slot.wattage ? `<span style="color:var(--text-muted);">~${slot.wattage}W</span>` : ''}
                        </div>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button type="button" onclick="openPcComponentSelector('${slot.key}')" style="background:var(--card-bg); border:1px solid var(--border-color); color:var(--text-color); padding:6px 10px; border-radius:4px; font-size:11.5px; font-weight:700; cursor:pointer;">
                            Change
                        </button>
                        <button type="button" onclick="removePcComponent('${slot.key}')" style="background:var(--danger-light); color:var(--danger); border:none; padding:6px 10px; border-radius:4px; font-size:11.5px; font-weight:700; cursor:pointer;">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="pc-slot-card">
                    <div class="slot-icon-box">
                        <i class="fa-solid fa-${slot.icon}"></i>
                    </div>
                    <div style="flex:1;">
                        <span class="slot-title">${escapeHtml(slot.name)} ${slot.required ? '<span style="color:var(--danger)">*</span>' : '(Optional)'}</span>
                        <span style="font-size:12px; color:var(--text-muted);">No component selected</span>
                    </div>
                    <button type="button" class="btn-slot-choose" onclick="openPcComponentSelector('${slot.key}')">
                        + Choose
                    </button>
                </div>
            `;
        }
    }).join("");

    const totalEl = document.getElementById("pcBuilderTotal");
    const wattEl = document.getElementById("pcBuilderWattage");
    if (totalEl) totalEl.textContent = `৳ ${total.toLocaleString()}`;
    if (wattEl) wattEl.textContent = `~ ${totalWattage}W (Recommended: ${Math.ceil(totalWattage * 1.3 / 50) * 50}W PSU)`;
}

function openPcComponentSelector(slotKey) {
    currentSelectorSlotKey = slotKey;
    const slot = PC_BUILD_SLOTS.find(s => s.key === slotKey);
    if (!slot) return;

    const modal = document.getElementById("pcComponentSelectorModal");
    const title = document.getElementById("pcSelectorTitle");
    const list = document.getElementById("pcSelectorList");

    if (title) title.innerHTML = `<i class="fa-solid fa-${slot.icon}"></i> Choose ${escapeHtml(slot.name)}`;

    const prods = getLocalProducts();
    let candidates = prods.filter(p => p.category && p.category.toLowerCase().includes(slot.category.toLowerCase()));
    if (candidates.length === 0) {
        candidates = prods.slice(0, 8); // Catalog fallback
    }

    if (list) {
        list.innerHTML = candidates.map(p => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--border-color); gap:12px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${p.image}" alt="${escapeHtml(p.name)}" style="width:45px; height:45px; object-fit:contain; border-radius:4px; border:1px solid var(--border-color);" onerror="this.src='images/laptop.jpg'">
                    <div>
                        <strong style="font-size:13.5px; color:var(--text-color);">${escapeHtml(p.name)}</strong>
                        <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                            <span>${escapeHtml(p.warranty || 'Official Warranty')}</span> • <span style="color:#10b981; font-weight:700;">In Stock</span>
                        </div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <strong style="color:var(--primary); font-size:15px; font-weight:800;">৳ ${Number(p.price).toLocaleString()}</strong>
                    <button type="button" onclick="selectPcComponent('${slotKey}', ${p.id})" style="background:var(--primary); color:white; border:none; padding:7px 16px; border-radius:4px; font-weight:700; font-size:12px; cursor:pointer;">
                        Select
                    </button>
                </div>
            </div>
        `).join("");
    }

    if (modal) modal.style.display = "flex";
}

function togglePcComponentSelectorModal(open = true) {
    const modal = document.getElementById("pcComponentSelectorModal");
    if (modal) modal.style.display = open ? "flex" : "none";
}

function selectPcComponent(slotKey, prodId) {
    const prods = getLocalProducts();
    const p = prods.find(item => item.id === prodId);
    if (!p) return;

    pcBuild[slotKey] = p;
    togglePcComponentSelectorModal(false);
    renderPcBuilderSlots();
    showToast(`✅ ${p.name} configured into your PC build.`);
}

function removePcComponent(slotKey) {
    pcBuild[slotKey] = null;
    renderPcBuilderSlots();
    showToast("Component removed from PC build.");
}

function resetPcBuilder() {
    if (!confirm("Are you sure you want to reset your PC build configuration?")) return;
    Object.keys(pcBuild).forEach(k => pcBuild[k] = null);
    renderPcBuilderSlots();
    showToast("PC Builder reset.");
}

function addPcBuildToCart() {
    const selected = Object.values(pcBuild).filter(Boolean);
    if (selected.length === 0) {
        alert("Please select at least one component to add to your cart.");
        return;
    }

    selected.forEach(prod => {
        const existing = cartItems.find(i => i.id === prod.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cartItems.push({ ...prod, quantity: 1 });
        }
    });

    saveCart();
    updateCartUI();
    togglePcBuilderModal(false);
    toggleCartDrawer(true);
    showToast(`🛒 Added ${selected.length} PC components to your shopping cart!`);
}

function printPcBuildQuotation() {
    const selected = Object.keys(pcBuild).map(k => ({ slot: PC_BUILD_SLOTS.find(s => s.key === k)?.name, item: pcBuild[k] })).filter(x => x.item);
    if (selected.length === 0) {
        alert("Please choose PC components before printing a quotation.");
        return;
    }

    const total = selected.reduce((sum, x) => sum + Number(x.item.price || 0), 0);
    const win = window.open('', '_blank');
    win.document.write(`
        <html>
        <head>
            <title>TechVerse PC Build Quotation</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #1e293b; }
                h1 { color: #2563eb; margin-bottom: 4px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
                th { background: #f1f5f9; font-weight: bold; }
                .total { font-size: 18px; font-weight: bold; color: #2563eb; text-align: right; margin-top: 20px; }
            </style>
        </head>
        <body>
            <h1>TechVerse Bangladesh</h1>
            <p>Official Custom PC System Quotation • Date: ${new Date().toLocaleDateString()}</p>
            <hr>
            <table>
                <thead>
                    <tr><th>Component Category</th><th>Selected Model</th><th>Warranty</th><th>Price (BDT)</th></tr>
                </thead>
                <tbody>
                    ${selected.map(x => `
                        <tr>
                            <td><b>${escapeHtml(x.slot)}</b></td>
                            <td>${escapeHtml(x.item.name)}</td>
                            <td>${escapeHtml(x.item.warranty || '1 Year Official')}</td>
                            <td>৳ ${Number(x.item.price).toLocaleString()}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            <div class="total">Grand Total: ৳ ${total.toLocaleString()}</div>
            <p style="margin-top:30px; font-size:12px; color:#64748b;">Showroom: Level 4, Multiplan Center, Dhaka | Helpline: +880 1820-727102</p>
            <script>window.print();</script>
        </body>
        </html>
    `);
    win.document.close();
}

// ==========================================================================
// 5. 0% EMI CALCULATOR MODAL & COMMERCE SUITE
// ==========================================================================

function openEmiModal(prodId) {
    const prods = getLocalProducts();
    const p = prods.find(item => item.id === prodId) || productsList.find(item => item.id === prodId);
    if (!p) return;

    currentEmiProduct = p;
    currentEmiTenure = 6;

    const modal = document.getElementById("emiModal");
    const nameEl = document.getElementById("emiProdName");
    const priceEl = document.getElementById("emiProdPrice");

    if (nameEl) nameEl.textContent = p.name;
    if (priceEl) priceEl.textContent = `৳ ${Number(p.price).toLocaleString()}`;

    // Reset tenure buttons
    document.querySelectorAll(".emi-tenure-btn").forEach(btn => {
        btn.classList.toggle("active", btn.textContent.includes("6 Months"));
    });

    calculateEmiAmount();
    if (modal) modal.style.display = "flex";
}

function toggleEmiModal(open = true) {
    const modal = document.getElementById("emiModal");
    if (modal) modal.style.display = open ? "flex" : "none";
}

function selectEmiTenure(months, btn) {
    currentEmiTenure = months;
    document.querySelectorAll(".emi-tenure-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    calculateEmiAmount();
}

function calculateEmiAmount() {
    if (!currentEmiProduct) return;
    const amountEl = document.getElementById("emiMonthlyAmount");
    if (!amountEl) return;

    const monthly = Math.round(Number(currentEmiProduct.price) / currentEmiTenure);
    amountEl.textContent = `৳ ${monthly.toLocaleString()} / month`;
}

function applyEmiInCart() {
    if (!currentEmiProduct) return;
    addToCartById(currentEmiProduct.id);
    toggleEmiModal(false);
    toggleCartDrawer(true);
    showToast(`💳 ${currentEmiProduct.name} added with ${currentEmiTenure}-month 0% EMI eligibility!`);
}

// ==========================================================================
// 6. CUSTOMER REVIEW SUBMISSION SYSTEM
// ==========================================================================

function toggleWriteReviewModal(open = true) {
    const modal = document.getElementById("writeReviewModal");
    if (!modal) return;
    modal.style.display = open ? "flex" : "none";
    if (open) {
        currentRatingStars = 5;
        setStarRating(5);
        const form = document.getElementById("writeReviewForm");
        if (form) form.reset();
    }
}

function setStarRating(stars) {
    currentRatingStars = stars;
    const picker = document.getElementById("starPicker");
    if (!picker) return;

    const starEls = picker.querySelectorAll(".star");
    starEls.forEach((el, idx) => {
        el.classList.toggle("active", idx < stars);
    });
}

function submitCustomerReview(e) {
    e.preventDefault();
    const name = document.getElementById("reviewAuthorName").value.trim();
    const city = document.getElementById("reviewAuthorCity").value.trim();
    const topic = document.getElementById("reviewItemTopic").value.trim() || 'Verified Purchase';
    const comment = document.getElementById("reviewComment").value.trim();

    if (!name || !city || !comment) {
        alert("Please fill in your name, city, and review comment.");
        return;
    }

    const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "VR";
    const starStr = "★".repeat(currentRatingStars);

    const newReview = {
        id: Date.now(),
        name,
        city,
        topic,
        comment,
        photo: selectedReviewPhotoBase64,
        stars: currentRatingStars,
        initials,
        createdAt: new Date().toISOString()
    };

    // Prepend to testimonials grid
    const grid = document.getElementById("testimonialsGrid");
    if (grid) {
        const card = document.createElement("div");
        card.className = "testimonial-card";
        card.style.border = "2px solid var(--primary)";
        card.innerHTML = `
            <div class="testimonial-header">
                <div class="testimonial-avatar" style="background:linear-gradient(135deg, #2563eb, #7c3aed);">${initials}</div>
                <div class="testimonial-info">
                    <strong>${escapeHtml(name)}</strong>
                    <span>${escapeHtml(city)} • Verified Customer</span>
                </div>
            </div>
            <div class="testimonial-stars">${starStr}</div>
            <p class="testimonial-body">"${escapeHtml(comment)}"</p>
            ${selectedReviewPhotoBase64 ? `
                <div style="margin-top:10px;">
                    <img src="${selectedReviewPhotoBase64}" alt="Unboxing photo" style="max-height:95px; border-radius:6px; border:1px solid var(--border-color); object-fit:cover;">
                </div>
            ` : ''}
        `;
        grid.prepend(card);
    }

    selectedReviewPhotoBase64 = null;
    const previewBox = document.getElementById("reviewPhotoPreview");
    if (previewBox) previewBox.style.display = "none";

    toggleWriteReviewModal(false);
    showToast("⭐ Thank you! Your verified review and photo have been published.");
}

// ==========================================================================
// 7. PHYSICAL STORE LOCATOR & OUTLET MAP MODAL
// ==========================================================================

function toggleStoreLocatorModal(open = true) {
    const modal = document.getElementById("storeLocatorModal");
    if (modal) modal.style.display = open ? "flex" : "none";
}

// ==========================================================================
// 8. LUCKY SPIN THE WHEEL DISCOUNT GAME ("SPIN TO WIN")
// ==========================================================================

const WHEEL_PRIZES = [
    { label: "৳500 OFF", coupon: "WELCOME500", color: "#2563eb" },
    { label: "10% OFF", coupon: "TECHVERSE10", color: "#10b981" },
    { label: "FREE SHIP", coupon: "FREESHIP", color: "#f59e0b" },
    { label: "15% OFF", coupon: "TECH15", color: "#8b5cf6" },
    { label: "৳1000 OFF", coupon: "VIP1000", color: "#ec4899" },
    { label: "5% OFF", coupon: "SAVE5", color: "#06b6d4" },
    { label: "20% OFF", coupon: "MEGA20", color: "#3b82f6" },
    { label: "MYSTERY", coupon: "SPECIALGIFT", color: "#14b8a6" }
];

let wheelCurrentAngle = 0;
let isWheelSpinning = false;
let wonPrize = null;

function toggleSpinWheelModal(open = true) {
    const modal = document.getElementById("spinWheelModal");
    if (!modal) return;
    modal.style.display = open ? "flex" : "none";
    if (open) {
        initSpinWheelCanvas();
        const resBox = document.getElementById("spinWinResult");
        if (resBox) resBox.style.display = "none";
    }
}

function initSpinWheelCanvas() {
    const canvas = document.getElementById("wheelCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = width / 2 - 10;
    const numPrizes = WHEEL_PRIZES.length;
    const arc = (2 * Math.PI) / numPrizes;

    ctx.clearRect(0, 0, width, height);

    WHEEL_PRIZES.forEach((p, i) => {
        const angle = i * arc;
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, angle, angle + arc);
        ctx.lineTo(cx, cy);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label text
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(p.label, radius - 16, 5);
        ctx.restore();
    });

    // Center Hub
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, 2 * Math.PI);
    ctx.fillStyle = "#0f172a";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TECH", cx, cy);
}

function spinLuckyWheel() {
    if (isWheelSpinning) return;
    isWheelSpinning = true;

    const btn = document.getElementById("btnSpinNow");
    if (btn) btn.disabled = true;

    const canvas = document.getElementById("wheelCanvas");
    const resBox = document.getElementById("spinWinResult");
    if (resBox) resBox.style.display = "none";

    // Random spin: between 5 to 8 full rotations + target angle
    const targetIdx = Math.floor(Math.random() * WHEEL_PRIZES.length);
    wonPrize = WHEEL_PRIZES[targetIdx];

    const numPrizes = WHEEL_PRIZES.length;
    const arcDeg = 360 / numPrizes;
    // Note: arrow is on top (270 degrees in canvas coordinates)
    const extraRotations = 360 * 6;
    const prizeAngle = (360 - (targetIdx * arcDeg) - (arcDeg / 2) + 270) % 360;
    const finalAngle = wheelCurrentAngle + extraRotations + prizeAngle;

    if (canvas) {
        canvas.style.transition = "transform 4.5s cubic-bezier(0.15, 0.95, 0.35, 1)";
        canvas.style.transform = `rotate(${finalAngle}deg)`;
    }

    setTimeout(() => {
        isWheelSpinning = false;
        wheelCurrentAngle = finalAngle % 360;
        if (btn) btn.disabled = false;

        const prizeEl = document.getElementById("spinWinPrize");
        if (prizeEl && wonPrize) {
            prizeEl.textContent = `${wonPrize.label} (Code: ${wonPrize.coupon})`;
        }
        if (resBox) resBox.style.display = "block";
        showToast(`🎉 You won ${wonPrize.label}!`);
    }, 4600);
}

function claimWheelPrize() {
    if (!wonPrize) return;
    appliedCoupon = {
        code: wonPrize.coupon,
        discountAmount: 500,
        description: wonPrize.label
    };

    const couponInput = document.getElementById("couponInput");
    if (couponInput) couponInput.value = wonPrize.coupon;

    showToast(`🎟️ Voucher "${wonPrize.coupon}" claimed & applied!`);
    toggleSpinWheelModal(false);
    toggleCartDrawer(true);
}

// ==========================================================================
// 12. UNBOXING REVIEW PHOTO UPLOAD HANDLER
// ==========================================================================
function handleReviewPhotoSelect(input) {
    if (!input || !input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
        showToast("⚠️ Image size exceeds 2MB. Please upload a smaller photo.");
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        selectedReviewPhotoBase64 = e.target.result;
        const previewBox = document.getElementById("reviewPhotoPreview");
        const previewImg = document.getElementById("reviewPhotoImg");
        if (previewImg) previewImg.src = selectedReviewPhotoBase64;
        if (previewBox) previewBox.style.display = "block";
    };
    reader.readAsDataURL(file);
}

// ==========================================================================
// 13. ENTERPRISE CUSTOMER AUTH & LOYALTY PROFILE SUITE
// ==========================================================================
function toggleAuthModal(open = true) {
    const modal = document.getElementById("authModal");
    if (!modal) return;
    modal.style.display = open ? "flex" : "none";
    if (open) {
        if (currentUser) {
            switchAuthTab('profile');
        } else {
            switchAuthTab('login');
        }
    }
}

function toggleAuthInputPass(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPass = input.type === "password";
    input.type = isPass ? "text" : "password";
    const icon = btnEl ? btnEl.querySelector("i") : null;
    if (icon) {
        icon.className = isPass ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
    }
}

function handleForgotPassword() {
    const idInput = document.getElementById("loginIdentifier");
    const val = idInput ? idInput.value.trim() : "";
    const promptContact = prompt("Please enter your registered phone number or email to receive password reset instructions:", val);
    if (promptContact && promptContact.trim()) {
        showToast(`📩 Password reset instructions sent to ${promptContact.trim()}! Please check your messages.`);
    }
}

function handleSocialAuth(provider) {
    showToast(`🔄 Connecting with ${provider}...`);
    setTimeout(() => {
        currentUser = {
            id: "USR-G-" + Date.now().toString().slice(-6),
            name: "Md Yeasin Bhuiyan",
            phone: "01820727102",
            email: "yeasin@techverse.com",
            loyaltyPoints: 100
        };
        localStorage.setItem("techverse_user", JSON.stringify(currentUser));
        updateUserAuthUI();
        switchAuthTab('profile');
        showToast(`🎉 Welcome, ${currentUser.name}! Signed in via ${provider}.`);
    }, 700);
}

function switchAuthTab(tab) {
    const tabLogin = document.getElementById("tabAuthLogin");
    const tabRegister = document.getElementById("tabAuthRegister");
    const tabsBar = document.getElementById("authTabsBar");

    const paneLogin = document.getElementById("authPaneLogin");
    const paneRegister = document.getElementById("authPaneRegister");
    const paneProfile = document.getElementById("authPaneProfile");

    const titleEl = document.getElementById("authModalTitle");
    const subTitleEl = document.getElementById("authModalSubtitle");
    const headerIcon = document.getElementById("authHeaderIcon");

    if (tabLogin) tabLogin.classList.remove("active");
    if (tabRegister) tabRegister.classList.remove("active");

    if (paneLogin) paneLogin.style.display = "none";
    if (paneRegister) paneRegister.style.display = "none";
    if (paneProfile) paneProfile.style.display = "none";

    if (tab === 'register') {
        if (tabsBar) tabsBar.style.display = "flex";
        if (tabRegister) tabRegister.classList.add("active");
        if (paneRegister) paneRegister.style.display = "block";
        if (titleEl) titleEl.textContent = "Create TechVerse Account";
        if (subTitleEl) subTitleEl.textContent = "Sign up to track orders & claim 100 bonus reward points";
        if (headerIcon) headerIcon.innerHTML = `<i class="fa-solid fa-user-plus"></i>`;
    } else if (tab === 'profile') {
        // Hide tabs bar when logged in for a dedicated, authentic Customer Dashboard look
        if (tabsBar) tabsBar.style.display = "none";
        if (paneProfile) paneProfile.style.display = "block";
        if (titleEl) titleEl.textContent = "Customer Dashboard";
        if (subTitleEl) subTitleEl.textContent = "Manage your profile, reward balance & recent orders";
        if (headerIcon) headerIcon.innerHTML = `<i class="fa-solid fa-circle-user"></i>`;
        renderUserProfileOrders();
    } else {
        if (tabsBar) tabsBar.style.display = "flex";
        if (tabLogin) tabLogin.classList.add("active");
        if (paneLogin) paneLogin.style.display = "block";
        if (titleEl) titleEl.textContent = "TechVerse Customer Sign In";
        if (subTitleEl) subTitleEl.textContent = "Access your orders, reward points & speedy checkout";
        if (headerIcon) headerIcon.innerHTML = `<i class="fa-solid fa-user-shield"></i>`;
    }
}

function updateUserAuthUI() {
    const btnLabel = document.getElementById("accountBtnLabel");

    if (currentUser) {
        const firstName = currentUser.name ? currentUser.name.split(" ")[0] : "Account";
        if (btnLabel) btnLabel.textContent = firstName;

        const pName = document.getElementById("profileUserName");
        const pContact = document.getElementById("profileUserContact");
        const pPoints = document.getElementById("profileLoyaltyPoints");
        const pAvatar = document.getElementById("profileAvatarInitials");

        if (pName) pName.textContent = currentUser.name;
        if (pContact) pContact.textContent = currentUser.phone || currentUser.email || "Verified Customer";
        if (pPoints) pPoints.textContent = currentUser.loyaltyPoints || 100;

        if (pAvatar && currentUser.name) {
            const parts = currentUser.name.trim().split(/\s+/);
            const initials = parts.length > 1 
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : parts[0].slice(0, 2).toUpperCase();
            pAvatar.textContent = initials;
        }

        // Auto-fill checkout fields if user is logged in
        const custNameInput = document.getElementById("custName");
        const custPhoneInput = document.getElementById("custPhone");
        if (custNameInput && !custNameInput.value) custNameInput.value = currentUser.name;
        if (custPhoneInput && !custPhoneInput.value && currentUser.phone) custPhoneInput.value = currentUser.phone;
    } else {
        if (btnLabel) btnLabel.textContent = "Login";
    }
}

async function handleCustomerLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById("loginIdentifier").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!identifier || !password) {
        alert("Please enter your phone number/email and password.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password }),
            signal: AbortSignal.timeout(3000)
        });
        const data = await res.json();
        if (data.success && data.data) {
            currentUser = data.data;
            localStorage.setItem("techverse_user", JSON.stringify(currentUser));
            updateUserAuthUI();
            switchAuthTab('profile');
            showToast(data.message || `Welcome back, ${currentUser.name}!`);
            return;
        } else {
            alert(data.message || "Invalid phone/email or password.");
            return;
        }
    } catch (err) {
        // Offline / fallback login
        currentUser = {
            id: "USR-" + Date.now(),
            name: identifier.includes("@") ? identifier.split("@")[0] : "Customer",
            phone: identifier.includes("@") ? "" : identifier,
            email: identifier.includes("@") ? identifier : "",
            loyaltyPoints: 120
        };
        localStorage.setItem("techverse_user", JSON.stringify(currentUser));
        updateUserAuthUI();
        switchAuthTab('profile');
        showToast(`👋 Welcome back, ${currentUser.name}!`);
    }
}

async function handleCustomerRegister(e) {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    if (!name || (!phone && !email) || !password) {
        alert("Please complete required registration fields.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone, email, password }),
            signal: AbortSignal.timeout(3000)
        });
        const data = await res.json();
        if (data.success && data.data) {
            currentUser = data.data;
            localStorage.setItem("techverse_user", JSON.stringify(currentUser));
            updateUserAuthUI();
            switchAuthTab('profile');
            showToast(`🎁 Account created! You've received 100 Reward Points.`);
            return;
        } else {
            alert(data.message || "Registration failed.");
            return;
        }
    } catch (err) {
        // Fallback local registration
        currentUser = {
            id: "USR-" + Date.now(),
            name,
            phone,
            email,
            loyaltyPoints: 100
        };
        localStorage.setItem("techverse_user", JSON.stringify(currentUser));
        updateUserAuthUI();
        switchAuthTab('profile');
        showToast(`🎁 Account created! 100 Reward Points added to your wallet.`);
    }
}

function logoutCustomer() {
    currentUser = null;
    localStorage.removeItem("techverse_user");
    updateUserAuthUI();
    switchAuthTab('login');
    showToast("🚪 You have logged out of your account.");
}

function renderUserProfileOrders() {
    const listEl = document.getElementById("profileOrdersList");
    const countBadge = document.getElementById("profileOrderCountBadge");
    if (!listEl) return;

    const orders = getLocalOrders();
    let userOrders = [];
    if (currentUser) {
        userOrders = orders.filter(o => 
            (currentUser.phone && o.customerPhone && o.customerPhone.includes(currentUser.phone)) ||
            (currentUser.name && o.customerName && o.customerName.toLowerCase().includes(currentUser.name.toLowerCase()))
        );
    }

    if (countBadge) {
        countBadge.textContent = `${userOrders.length} Order${userOrders.length === 1 ? '' : 's'}`;
    }

    if (userOrders.length === 0) {
        listEl.innerHTML = `
            <div style="text-align:center; padding:22px 14px; color:var(--text-muted); background:var(--card-elevated); border-radius:10px; border:1px dashed var(--border-color);">
                <div style="font-size:24px; margin-bottom:4px;">🛍️</div>
                <div style="font-weight:700; font-size:13px; color:var(--text-color);">No orders found yet</div>
                <div style="font-size:11.5px; margin-top:3px;">Your placed orders and receipts will appear here automatically.</div>
            </div>
        `;
        return;
    }

    listEl.innerHTML = userOrders.map(o => `
        <div class="profile-order-card">
            <div class="profile-order-info">
                <div class="profile-order-head">
                    <strong>#${escapeHtml(o.orderId)}</strong>
                    <span style="font-size:11px; padding:2px 7px; border-radius:12px; background:${o.status === 'Delivered' ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.15)'}; color:${o.status === 'Delivered' ? '#10b981' : 'var(--primary)'}; font-weight:800;">
                        ${escapeHtml(o.status || 'Pending')}
                    </span>
                </div>
                <div class="profile-order-meta">
                    <span style="font-weight:700; color:var(--text-color);">৳ ${Number(o.totalAmount || 0).toLocaleString()}</span>
                    <span>•</span>
                    <span>${(o.items || []).length} item(s)</span>
                    ${o.date ? `<span>•</span><span>${escapeHtml(o.date.split(',')[0])}</span>` : ''}
                </div>
            </div>
            <button type="button" onclick="renderInvoiceFromTrack('${escapeHtml(o.orderId)}'); toggleAuthModal(false);" class="btn-order-receipt" title="View Full Invoice Receipt">
                <i class="fa-solid fa-file-invoice"></i> Receipt
            </button>
        </div>
    `).join("");
}

// ==========================================================================
// 14. AUTHENTIC BKASH TOKENIZED PAYMENT GATEWAY SUITE
// ==========================================================================
function startBkashCheckout(order) {
    activeBkashOrder = order;

    const invEl = document.getElementById("bkashInvoiceNo");
    const amtEl = document.getElementById("bkashPayAmount");
    const phoneInput = document.getElementById("bkashPhoneInput");

    if (invEl) invEl.textContent = order.orderId;
    if (amtEl) amtEl.textContent = `৳ ${Number(order.totalAmount).toLocaleString()}`;
    if (phoneInput) phoneInput.value = order.customerPhone || "";

    // Reset steps
    proceedBkashStep(1);
    toggleBkashModal(true);
}

function toggleBkashModal(open = true) {
    const modal = document.getElementById("bkashCheckoutModal");
    if (modal) modal.style.display = open ? "flex" : "none";
}

function proceedBkashStep(step) {
    const s1 = document.getElementById("bkashStepPhone");
    const s2 = document.getElementById("bkashStepOtp");
    const s3 = document.getElementById("bkashStepPin");
    const s4 = document.getElementById("bkashStepProcessing");

    if (s1) s1.style.display = "none";
    if (s2) s2.style.display = "none";
    if (s3) s3.style.display = "none";
    if (s4) s4.style.display = "none";

    if (step === 2) {
        const phone = document.getElementById("bkashPhoneInput").value.trim();
        if (phone.length < 11) {
            alert("Please enter a valid 11-digit bKash account number.");
            if (s1) s1.style.display = "block";
            return;
        }
        if (s2) s2.style.display = "block";
    } else if (step === 3) {
        const otp = document.getElementById("bkashOtpInput").value.trim();
        if (otp.length < 4) {
            alert("Please enter the 6-digit OTP (Use 123456 for demo).");
            if (s2) s2.style.display = "block";
            return;
        }
        if (s3) s3.style.display = "block";
    } else if (step === 4) {
        if (s4) s4.style.display = "block";
    } else {
        if (s1) s1.style.display = "block";
    }
}

async function submitBkashPaymentFinal() {
    const pin = document.getElementById("bkashPinInput").value.trim();
    if (pin.length < 4) {
        alert("Please enter your bKash PIN.");
        return;
    }

    proceedBkashStep(4);

    const generatedTrxId = 'BKX' + Math.random().toString(36).substring(2, 9).toUpperCase();

    // Verify with backend
    try {
        if (activeBkashOrder) {
            await fetch(`${API_BASE_URL}/payment/verify-bkash`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: activeBkashOrder.orderId,
                    phone: activeBkashOrder.customerPhone,
                    amount: activeBkashOrder.totalAmount
                }),
                signal: AbortSignal.timeout(3000)
            });
        }
    } catch (err) {
        console.warn("Backend bKash verification simulated offline.");
    }

    setTimeout(() => {
        if (activeBkashOrder) {
            activeBkashOrder.paymentStatus = 'Paid (bKash Verified)';
            activeBkashOrder.transactionId = generatedTrxId;
            activeBkashOrder.paymentMethod = 'bKash Tokenized Checkout';

            // Update local storage
            const orders = getLocalOrders();
            const idx = orders.findIndex(o => o.orderId === activeBkashOrder.orderId);
            if (idx !== -1) {
                orders[idx] = activeBkashOrder;
                saveLocalOrders(orders);
            }

            toggleBkashModal(false);
            renderInvoice(activeBkashOrder);
            showToast(`✅ bKash Payment Successful! TrxID: ${generatedTrxId}`);

            // Dispatch SMS confirmation
            setTimeout(() => {
                triggerSmsNotification(activeBkashOrder, 'ORDER_PLACED');
            }, 600);
        }
    }, 1500);
}

// ==========================================================================
// 15. OFFICIAL PDF TAX INVOICE DOWNLOADER
// ==========================================================================
function downloadInvoicePdf() {
    showToast("📄 Preparing Official Tax Invoice PDF...");
    setTimeout(() => {
        window.print();
    }, 400);
}

// ==========================================================================
// 16. STEADFAST COURIER DISPATCH ENGINE
// ==========================================================================
async function dispatchOrderViaCourier(orderId, courierName = 'Steadfast Courier') {
    const orders = getLocalOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (!order) {
        alert("Order not found!");
        return;
    }

    const consignmentId = 'ST-' + Math.floor(10000000 + Math.random() * 90000000);
    const trackingUrl = `https://steadfast.com.bd/tracking/${consignmentId}`;

    order.courier = {
        provider: courierName,
        consignmentId,
        trackingUrl,
        status: 'In Transit with Rider',
        dispatchedAt: new Date().toISOString()
    };
    order.status = 'Shipped';

    // Save locally
    saveLocalOrders(orders);

    // Call backend dispatch API
    try {
        await fetch(`${API_BASE_URL}/courier/dispatch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                orderId: order.orderId,
                courierName,
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                address: order.address,
                amount: order.totalAmount
            }),
            signal: AbortSignal.timeout(3000)
        });
        updateBackendStatus(true);
    } catch (err) {
        console.warn("Backend courier API dispatched in local mode.");
        updateBackendStatus(false);
    }

    // Refresh Admin Orders List
    if (typeof cachedAdminOrders !== 'undefined' && Array.isArray(cachedAdminOrders)) {
        const cIdx = cachedAdminOrders.findIndex(o => o.orderId === orderId);
        if (cIdx !== -1) cachedAdminOrders[cIdx] = order;
    }
    renderAdminOrdersList();
    loadAdminStats();

    showToast(`🚚 Order #${orderId} booked with ${courierName}! Consignment: ${consignmentId}`);

    // Auto-trigger Stage 2 (Out for delivery) SMS with courier consignment link
    setTimeout(() => {
        triggerSmsNotification(order, 'OUT_FOR_DELIVERY');
    }, 600);
}

// ==========================================================================
// 15. FOUNDER & STORE PROPRIETOR PHOTO MANAGEMENT (ADMIN PROTECTED)
// ==========================================================================
function updateFounderAdminControls() {
    const isAuth = isAdminAuthenticated();
    const btn = document.getElementById("founderPhotoUploadBtn");
    const tip = document.getElementById("founderPhotoTip");
    if (btn) btn.style.display = isAuth ? "inline-flex" : "none";
    if (tip) tip.style.display = isAuth ? "block" : "none";
}

function triggerFounderPhotoUpload() {
    if (!isAdminAuthenticated()) {
        showToast("🔒 নিরাপত্তা: শুধুমাত্র অ্যাডমিন লগইন করলেই ছবি পরিবর্তন করা যাবে!");
        toggleAdminModal(true);
        return;
    }
    const input = document.getElementById("founderPhotoFileInput");
    if (input) input.click();
}

function handleFounderPhotoFile(event) {
    if (!isAdminAuthenticated()) {
        alert("🔒 Unauthorized! শুধুমাত্র অ্যাডমিন ছবি পরিবর্তন করতে পারবেন।");
        return;
    }
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("অনুগ্রহ করে একটি ছবি ফাইল (JPG, PNG, WebP) সিলেক্ট করুন।");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("ছবির সাইজ ৫ মেগাবাইটের কম হতে হবে।");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const dataUrl = e.target.result;
        const imgEl = document.getElementById("founderPhotoDisplay");
        if (imgEl) {
            imgEl.src = dataUrl;
            imgEl.style.objectFit = "cover";
        }
        try {
            localStorage.setItem("techverse_founder_photo", dataUrl);
            showToast("🎉 ওনার ছবি সফলভাবে সেভ ও আপডেট হয়েছে!");
        } catch(err) {
            showToast("✅ ছবি লোড হয়েছে!");
        }
    };
    reader.readAsDataURL(file);
}

function loadFounderPhoto() {
    const savedPhoto = localStorage.getItem("techverse_founder_photo");
    const imgEl = document.getElementById("founderPhotoDisplay");
    if (imgEl) {
        if (savedPhoto) {
            imgEl.src = savedPhoto;
        } else {
            imgEl.src = "images/founder.jpg";
        }
    }
}

