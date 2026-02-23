// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');

    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });

    // Smooth Scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar shadow on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 20) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
        }
    });

    // Breaking News Ticker
    const tickerData = [
        "Mayor Mandani expands press access at City Hall",
        "TBA News Network launches independent journalism platform",
        "NYC housing debate intensifies after policy announcement",
        "Liberian nurses prepare for strike at Phebe Hospital",
        "LAPD faces lawsuit over protest injury",
        "Israeli strikes impact Lebanon communities"
    ];
    
    const ticker = document.getElementById("tickerContent");
    if (ticker) {
        ticker.innerText = tickerData.join(" ✦ ");
    }

    // Popup Management
    const substackPopup = document.getElementById("substackPopup");
    const donatePopup = document.getElementById("donatePopup");
    const popupClose = document.getElementById("popupClose");
    const donateClose = document.getElementById("donateClose");
    const ribbon = document.getElementById("donationRibbon");
    const ribbonClose = document.getElementById("ribbonClose");

    // Show Substack popup for 3 seconds after 5 seconds
    if (substackPopup && !localStorage.getItem('popupClosed')) {
        setTimeout(() => {
            substackPopup.classList.add('active');
            
            // Auto close after 3 seconds
            setTimeout(() => {
                substackPopup.classList.remove('active');
            }, 3000);
        }, 5000);
    }

    // Show donate popup for 3 seconds after 12 seconds
    if (donatePopup && !localStorage.getItem('donateClosed')) {
        setTimeout(() => {
            donatePopup.classList.add('active');
            
            // Auto close after 3 seconds
            setTimeout(() => {
                donatePopup.classList.remove('active');
            }, 3000);
        }, 12000);
    }

    // Close popup handlers
    if (popupClose) {
        popupClose.addEventListener('click', function() {
            substackPopup.classList.remove('active');
            localStorage.setItem('popupClosed', 'true');
        });
    }

    if (donateClose) {
        donateClose.addEventListener('click', function() {
            donatePopup.classList.remove('active');
            localStorage.setItem('donateClosed', 'true');
        });
    }

    // Close popups when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === substackPopup) {
            substackPopup.classList.remove('active');
        }
        if (e.target === donatePopup) {
            donatePopup.classList.remove('active');
        }
    });

    // Donation Ribbon
    // Add this to your script.js inside the DOMContentLoaded event

// Track donation link clicks
function trackDonationClicks() {
    const donationLinks = document.querySelectorAll('a[href*="YOURDONATIONLINK"]');
    donationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            console.log('Donation link clicked');
            // You can add analytics tracking here
            // Example: ga('send', 'event', 'Donation', 'click', 'Navigation');
        });
    });
}

trackDonationClicks();

// Update the popup text to be more urgent/news-like
const donatePopupText = document.querySelector('#donatePopup p');
if (donatePopupText) {
    donatePopupText.textContent = 'Your support keeps real reporting alive and thriving. Every donation helps us investigate the stories that matter.';
}

    // Etsy Grid with placeholder images
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

    // Track Substack clicks
    function trackSubstackClick(btnId) {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', function() {
                console.log(`${btnId} clicked`);
                // You can add analytics tracking here
            });
        }
    }

    trackSubstackClick('substackBtn');
    trackSubstackClick('popupSubstackBtn');

    // Fade in sections on scroll
    const sections = document.querySelectorAll('.section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px'
    });

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease';
        observer.observe(section);
    });

    // Handle image errors
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'https://via.placeholder.com/500x300?text=Image+Not+Found';
        });
    });

    // Active navigation link based on scroll position
    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (sectionId && scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
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
});
