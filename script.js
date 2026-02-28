// script.js
document.addEventListener('DOMContentLoaded', function() {
    // ===== MOBILE MENU TOGGLE =====
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => navLinks.classList.toggle('active'));

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => navLinks.classList.remove('active'));
        });
    }

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ===== NAVBAR SHADOW ON SCROLL =====
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (!navbar) return;
        navbar.style.boxShadow = window.scrollY > 20
            ? '0 4px 20px rgba(0, 0, 0, 0.1)'
            : '0 2px 20px rgba(0, 0, 0, 0.05)';
    });

    // ===== BREAKING NEWS TICKER =====
    const tickerData = [
        "Mayor Mandani expands press access at City Hall",
        "TBA News Network launches independent journalism platform",
        "NYC housing debate intensifies after policy announcement",
        "Liberian nurses prepare for strike at Phebe Hospital",
        "LAPD faces lawsuit over protest injury",
        "Israeli strikes impact Lebanon communities"
    ];
    const ticker = document.getElementById("tickerContent");
    if (ticker) ticker.innerText = tickerData.join(" ✦ ");

    // ===== POPUPS =====
    const substackPopup = document.getElementById("substackPopup");
    const donatePopup = document.getElementById("donatePopup");
    const popupClose = document.getElementById("popupClose");
    const donateClose = document.getElementById("donateClose");
    const ribbon = document.getElementById("donationRibbon");
    const ribbonClose = document.getElementById("ribbonClose");

    function showPopup(popup, delay = 5000, duration = 3000, storageKey) {
        if (!popup || (storageKey && localStorage.getItem(storageKey))) return;
        setTimeout(() => {
            popup.classList.add('active');
            setTimeout(() => popup.classList.remove('active'), duration);
        }, delay);
    }

    showPopup(substackPopup, 5000, 3000, 'popupClosed');
    showPopup(donatePopup, 12000, 3000, 'donateClosed');

    if (popupClose) popupClose.addEventListener('click', () => {
        substackPopup.classList.remove('active');
        localStorage.setItem('popupClosed', 'true');
    });

    if (donateClose) donateClose.addEventListener('click', () => {
        donatePopup.classList.remove('active');
        localStorage.setItem('donateClosed', 'true');
    });

    // Close popups when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === substackPopup) substackPopup.classList.remove('active');
        if (e.target === donatePopup) donatePopup.classList.remove('active');
    });

    // ===== DONATION RIBBON =====
    if (ribbon && ribbonClose) {
        ribbonClose.addEventListener('click', () => {
            ribbon.style.display = 'none';
            ribbon.classList.add('hidden');
        });
    }

    function trackDonationClicks() {
        document.querySelectorAll('a[href*="cash.app"]').forEach(link => {
            link.addEventListener('click', () => {
                console.log('Donation link clicked');
                // Analytics code can be added here
            });
        });
    }
    trackDonationClicks();

    // ===== SUBSTACK CLICK TRACKING =====
    function trackSubstackClick(btnId) {
        const btn = document.getElementById(btnId);
        if (btn) btn.addEventListener('click', () => console.log(`${btnId} clicked`));
    }
    trackSubstackClick('substackBtn');
    trackSubstackClick('popupSubstackBtn');

    // ===== ETSY GRID =====
    const etsyGrid = document.getElementById('etsyGrid');
    if (etsyGrid) {
        const products = [
            { name: 'TBA News T-Shirt', price: '$24.99', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500' },
            { name: 'Press Freedom Hoodie', price: '$49.99', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=500' },
            { name: 'Journalist Mug', price: '$14.99', img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=500' },
            { name: 'Truth Seeker Cap', price: '$19.99', img: 'https://images.unsplash.com/photo-1588850561391-1e2e7a2a9a3b?q=80&w=500' }
        ];

        products.forEach(product => {
            const item = document.createElement('a');
            item.href = 'https://www.etsy.com/shop/YOURSTORENAME';
            item.target = '_blank';
            item.className = 'etsy-item';
            item.innerHTML = `
                <img src="${product.img}" alt="${product.name}" loading="lazy">
                <p>${product.name}</p>
                <small>${product.price}</small>
            `;
            etsyGrid.appendChild(item);
        });
    }

    // ===== FADE-IN SECTIONS ON SCROLL =====
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.add('fade-in'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });

    sections.forEach(section => observer.observe(section));

    // ===== IMAGE ERROR HANDLING =====
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => {
            img.src = 'https://via.placeholder.com/500x300?text=Image+Not+Found';
        });
    });

    // ===== ACTIVE NAV LINK ON SCROLL =====
    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 100;
        document.querySelectorAll('section[id]').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    window.addEventListener('scroll', updateActiveNavLink);

    // ===== SHARE BUTTON TRACKING =====
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const platform = this.classList.contains('facebook') ? 'Facebook' :
                            this.classList.contains('twitter') ? 'Twitter' :
                            this.classList.contains('linkedin') ? 'LinkedIn' :
                            this.classList.contains('instagram') ? 'Instagram' :
                            this.classList.contains('tiktok') ? 'TikTok' :
                            this.classList.contains('youtube') ? 'YouTube' : 
                            this.classList.contains('whatsapp') ? 'WhatsApp' :
                            this.classList.contains('telegram') ? 'Telegram' : 'Other';
            
            console.log(`Shared on ${platform}`);
            // You can add Google Analytics here
            // gtag('event', 'share', { 'platform': platform });
        });
    });
});