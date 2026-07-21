
        // ==========================================================================
        // DMotoTech Header Engine — Light Mode — Supabase Auth + Cart + Mobile Nav
        // ==========================================================================

        const SUPABASE_URL = "https://ycipxljvymewdltlblvn.supabase.co";
        const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljaXB4bGp2eW1ld2RsdGxibHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNzA5MzksImV4cCI6MjA5Nzk0NjkzOX0.dleDKMUuavLtA_pPKicnBexgGb4SqOGM7oU7QoEBmI";

        let supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
        let currentSession = null;
        let homeCartItems = [];

        // ——— Path Utility ———
        function getProjectPath(relativePath) {
            const path = window.location.pathname.replace(/\\/g, "/");
            const segments = path.split("/").filter(Boolean);
            if (segments.length <= 1) return `./${relativePath}`;
            return `${"../".repeat(segments.length - 1)}${relativePath}`;
        }

        function isHomePage() {
            const path = window.location.pathname.replace(/\/+$/, "");
            const fileName = path.split("/").pop().toLowerCase();
            return !fileName || fileName === "index.html";
        }

        // ——— Mobile Nav ———
        function toggleMobileNav() {
            const panel = document.getElementById("mobileNavPanel");
            const overlay = document.getElementById("mobileNavOverlay");
            if (!panel || !overlay) return;
            const opening = !panel.classList.contains("active");
            panel.classList.toggle("active", opening);
            overlay.classList.toggle("active", opening);
            document.body.style.overflow = opening ? "hidden" : "";
        }

        function closeMobileNav() {
            const panel = document.getElementById("mobileNavPanel");
            const overlay = document.getElementById("mobileNavOverlay");
            if (!panel || !overlay) return;
            panel.classList.remove("active");
            overlay.classList.remove("active");
            document.body.style.overflow = "";
        }

        window.toggleMobileNav = toggleMobileNav;
        window.closeMobileNav = closeMobileNav;

        // ——— Supabase Auth ———
        function ensureSupabaseClient(timeout = 2000) {
            return new Promise(resolve => {
                const start = Date.now();
                const check = () => {
                    if (window.supabase) {
                        if (!supabaseClient) {
                            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                            window.supabaseClient = supabaseClient;
                        }
                        resolve(true);
                        return;
                    }
                    if (Date.now() - start > timeout) return resolve(false);
                    setTimeout(check, 50);
                };
                check();
            });
        }

        async function initSupabaseAuth() {
            try {
                await ensureSupabaseClient();
                if (!supabaseClient) return;
                const { data } = await supabaseClient.auth.getSession();
                updateAuthUI(data.session);
                supabaseClient.auth.onAuthStateChange((event, session) => {
                    updateAuthUI(session);
                });
            } catch (err) {
                console.error("Supabase Init Error:", err);
            }
        }
        window.initSupabase = initSupabaseAuth;

        function updateAuthUI(session) {
            currentSession = session;
            const desktopGroup = document.getElementById("auth-buttons-group");
            const mobileContainer = document.getElementById("mobileAuthContainer");
            const headerCartIcon = document.getElementById("headerCartIcon");

            const isLoggedIn = Boolean(session && session.user);
            const showLogout = isLoggedIn && isHomePage();

            const loginHref = getProjectPath("../Auth/Login/Login.html");
            const signupHref = getProjectPath("../Auth/Signup/Signup.html");
            const accountHref = getProjectPath("My_Account_page/My_account.html");

            if (desktopGroup) {
                if (isLoggedIn) {
                    const initial = (session.user.email || "U").charAt(0).toUpperCase();
                    desktopGroup.innerHTML = `
                    <a href="${accountHref}" class="auth-btn" style="text-decoration:none;">
                        <i class="fa-solid fa-user"></i> My Account
                    </a>
                    ${showLogout ? `<button class="auth-btn auth-primary" id="logoutBtn" style="padding:9px 14px;">Logout</button>` : ""}
                `;
                    const logoutBtn = document.getElementById("logoutBtn");
                    if (logoutBtn) logoutBtn.addEventListener("click", logout);
                } else {
                    desktopGroup.innerHTML = `
                    <a href="${loginHref}" class="auth-btn" style="text-decoration:none;">
                        <i class="fa-solid fa-user"></i> Login
                    </a>
                    <a href="${signupHref}" class="auth-btn auth-primary" style="text-decoration:none;">
                        Signup
                    </a>
                `;
                }
            }

            if (mobileContainer) {
                if (isLoggedIn) {
                    const initial = (session.user.email || "U").charAt(0).toUpperCase();
                    mobileContainer.innerHTML = `
                    <div class="mobile-auth-user">
                        <div class="mobile-auth-user-avatar">${initial}</div>
                        <div class="mobile-auth-user-info">
                            <div class="mobile-auth-user-name">${session.user.email || "User"}</div>
                            <div class="mobile-auth-user-email">My Account</div>
                        </div>
                    </div>
                    <a href="${accountHref}" class="auth-btn" style="width:100%;justify-content:center;text-decoration:none;">
                        <i class="fa-solid fa-gear"></i> Account Panel
                    </a>
                    ${showLogout ? `<button class="mobile-auth-logout-btn" id="mobileLogoutBtn"><i class="fa-solid fa-right-from-bracket" style="margin-right:6px;"></i>Logout</button>` : ""}
                `;
                    const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
                    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener("click", logout);
                } else {
                    mobileContainer.innerHTML = `
                    <a href="${loginHref}" class="auth-btn" style="width:100%;justify-content:center;text-decoration:none;">
                        <i class="fa-solid fa-user"></i> Login
                    </a>
                    <a href="${signupHref}" class="auth-btn auth-primary" style="width:100%;justify-content:center;text-decoration:none;">
                        Sign Up
                    </a>
                `;
                }
            }

            if (headerCartIcon) headerCartIcon.style.display = "";
        }

        async function logout() {
            try {
                if (supabaseClient) {
                    const { error } = await supabaseClient.auth.signOut();
                    if (error) throw error;
                }
                window.location.href = getProjectPath("index.html");
            } catch (err) {
                console.error("Logout Failed:", err);
            }
        }

        // ——— Cart System ———
        function toggleCartDrawer() {
            const drawer = document.getElementById("cartDrawer");
            const overlay = document.getElementById("cartOverlay");
            if (!drawer || !overlay) return;
            forceSyncHomeCart();
            const opening = !drawer.classList.contains("active");
            drawer.classList.toggle("active", opening);
            overlay.classList.toggle("active", opening);
            document.body.style.overflow = opening ? "hidden" : "";
        }
        window.toggleCartDrawer = toggleCartDrawer;

        function forceSyncHomeCart() {
            homeCartItems = JSON.parse(localStorage.getItem("dochaki_cart")) || [];
            const container = document.getElementById("cartDrawerContainer");
            const subCount = document.getElementById("cartDrawerSubCount");
            const footerTotal = document.getElementById("cartDrawerTotal");
            const footer = document.getElementById("cartDrawerFooter");
            const badge = document.getElementById("headerCartCount");

            let totalCount = 0;
            let totalPriceSum = 0;

            if (homeCartItems.length === 0) {
                if (container) {
                    container.innerHTML = `
                    <div class="cart-empty-state">
                        <div class="cart-empty-icon"><i class="fa-solid fa-cart-shopping"></i></div>
                        <div class="cart-empty-title">Your cart is empty</div>
                        <div class="cart-empty-desc">Browse products and add something you love.</div>
                        <a href="${getProjectPath("Shop/Shop.html")}" class="cart-empty-shop-btn">
                            <i class="fa-solid fa-arrow-right"></i> Start Shopping
                        </a>
                    </div>`;
                }
                if (subCount) subCount.textContent = "0 Items";
                if (footerTotal) footerTotal.textContent = "₹0";
                if (badge) { badge.style.display = "none"; badge.textContent = "0"; }
                if (footer) footer.style.display = "none";
                return;
            }

            if (footer) footer.style.display = "block";

            homeCartItems.forEach((item, index) => {
                const itemPrice = Number(String(item.price).replace(/[^0-9.-]+/g, "")) || 0;
                const itemQty = parseInt(item.qty, 10) || 0;
                totalCount += itemQty;
                totalPriceSum += itemPrice * itemQty;

                if (container) {
                    container.innerHTML += `
                    <div class="cart-item-card" style="animation-delay:${index * 0.05}s">
                        <button class="cart-item-remove" onclick="removeHomeCartItem(${item.id})" title="Remove">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <img src="${item.img || "https://picsum.photos/seed/moto" + index + "/160/160.jpg"}"
                             class="cart-item-img" alt="${item.name}">
                        <div class="cart-item-details">
                            <div>
                                <div class="cart-item-name">${item.name}</div>
                                <div class="cart-item-variant">Qty: ${itemQty}</div>
                            </div>
                            <div class="cart-item-bottom">
                                <span class="cart-item-price">₹${(itemPrice * itemQty).toLocaleString("en-IN")}</span>
                                <div class="cart-item-qty-controls">
                                    <button class="cart-qty-btn" onclick="changeHomeCartQty(${item.id}, -1)">
                                        <i class="fa-solid fa-minus" style="font-size:10px;"></i>
                                    </button>
                                    <span class="cart-qty-value">${itemQty}</span>
                                    <button class="cart-qty-btn" onclick="changeHomeCartQty(${item.id}, 1)">
                                        <i class="fa-solid fa-plus" style="font-size:10px;"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>`;
                }
            });

            if (subCount) subCount.textContent = `${totalCount} Item${totalCount !== 1 ? "s" : ""}`;
            if (footerTotal) footerTotal.textContent = `₹${totalPriceSum.toLocaleString("en-IN")}`;
            if (badge) {
                badge.textContent = String(totalCount);
                badge.style.display = totalCount > 0 ? "inline-block" : "none";
            }
        }
        window.forceSyncHomeCart = forceSyncHomeCart;

        function changeHomeCartQty(productId, delta) {
            const item = homeCartItems.find(i => i.id === productId);
            if (!item) return;
            item.qty = (parseInt(item.qty, 10) || 0) + delta;
            if (item.qty <= 0) {
                homeCartItems = homeCartItems.filter(i => i.id !== productId);
            }
            localStorage.setItem("dochaki_cart", JSON.stringify(homeCartItems));
            const container = document.getElementById("cartDrawerContainer");
            if (container) container.innerHTML = "";
            forceSyncHomeCart();
            window.dispatchEvent(new Event("storage"));
        }
        window.changeHomeCartQty = changeHomeCartQty;

        function removeHomeCartItem(productId) {
            homeCartItems = homeCartItems.filter(item => item.id !== productId);
            localStorage.setItem("dochaki_cart", JSON.stringify(homeCartItems));
            const container = document.getElementById("cartDrawerContainer");
            if (container) container.innerHTML = "";
            forceSyncHomeCart();
            window.dispatchEvent(new Event("storage"));
        }
        window.removeHomeCartItem = removeHomeCartItem;

        function triggerRazorpayCheckout() {
            if (homeCartItems.length === 0) {
                showToast("Your cart is empty!");
                return;
            }
            window.location.href = getProjectPath("CheckOut_Page/checkout.html");
        }
        window.triggerRazorpayCheckout = triggerRazorpayCheckout;

        // ——— Toast ———
        function showToast(message) {
            const existing = document.querySelector(".moto-toast");
            if (existing) existing.remove();
            const toast = document.createElement("div");
            toast.className = "moto-toast";
            toast.style.cssText = `
            position:fixed; bottom:30px; left:50%;
            transform:translateX(-50%) translateY(20px);
            background:#fff; color:#1a1a1a;
            padding:14px 28px; border-radius:12px;
            font-family:'Inter',sans-serif; font-size:14px; font-weight:500;
            border:1px solid #FF4D00;
            box-shadow:0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,77,0,0.1);
            z-index:9999; opacity:0; transition:all 0.35s ease;
            display:flex; align-items:center; gap:10px;
        `;
            toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#16a34a;font-size:16px;"></i>${message}`;
            document.body.appendChild(toast);
            requestAnimationFrame(() => {
                toast.style.opacity = "1";
                toast.style.transform = "translateX(-50%) translateY(0)";
            });
            setTimeout(() => {
                toast.style.opacity = "0";
                toast.style.transform = "translateX(-50%) translateY(20px)";
                setTimeout(() => toast.remove(), 350);
            }, 2500);
        }
        window.showToast = showToast;

        // ——— Active Nav Highlight ———
        function setActiveNav() {
            const currentPath = window.location.pathname;
            document.querySelectorAll(".web-link, .hm-mobile-nav-links a").forEach(link => {
                const href = link.getAttribute("href");
                if (!href || href === "#") return;
                link.classList.remove("active");
                const cleaned = href.replace("../", "").replace("./", "");
                if (currentPath.endsWith(cleaned) || currentPath.includes(cleaned)) {
                    link.classList.add("active");
                }
            });
        }

        // ——— Keyboard ———
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeMobileNav();
                const drawer = document.getElementById("cartDrawer");
                if (drawer && drawer.classList.contains("active")) toggleCartDrawer();
            }
        });

        // ——— Init ———
        forceSyncHomeCart();
        document.addEventListener("DOMContentLoaded", () => {
            forceSyncHomeCart();
            initSupabaseAuth();
            setActiveNav();
        });
        window.addEventListener("storage", (e) => {
            if (!e.key || e.key === "dochaki_cart") {
                const container = document.getElementById("cartDrawerContainer");
                if (container) container.innerHTML = "";
                forceSyncHomeCart();
            }
        });
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) {
                const container = document.getElementById("cartDrawerContainer");
                if (container) container.innerHTML = "";
                forceSyncHomeCart();
            }
        });
