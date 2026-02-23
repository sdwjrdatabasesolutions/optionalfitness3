// script.js
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');

    menuBtn?.addEventListener('click', () => navLinks.classList.toggle('active'));
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        navbar.style.boxShadow = window.scrollY > 20 ? '0 4px 20px rgba(0,0,0,0.1)' : '0 2px 20px rgba(0,0,0,0.05)';
    });

    const tickerData = [
        "Mayor Mandani expands press access at City Hall",
        "TBA News Network launches independent journalism platform",
        "NYC housing debate intensifies after policy announcement",
        "Liberian nurses prepare for strike at Phebe Hospital",
        "LAPD faces lawsuit over protest injury",
        "Israeli strikes impact Lebanon communities"
    ];
    document.getElementById("tickerContent").innerText = tickerData.join(" ✦ ");

    // Popups & donation ribbon
    const substackPopup = document.getElementById("substackPopup");
    const donatePopup = document.getElementById("donatePopup");
    const popupClose = document.getElementById("popupClose");
    const donateClose = document.getElementById("donateClose");
    const ribbonClose = document.getElementById("ribbonClose");

    if (substackPopup && !localStorage.getItem('popupClosed')) {
        setTimeout(() => {
            substackPopup.classList.add('active');
            setTimeout(() => substackPopup.classList.remove('active'), 3000);
        }, 5000);
    }

    if (donatePopup && !localStorage.getItem('donateClosed')) {
        setTimeout(() => {
            donatePopup.classList.add('active');
            setTimeout(() => donatePopup.classList.remove('active'), 3000);
        }, 12000);
    }

    popupClose?.addEventListener('click', () => { substackPopup.classList.remove('active'); localStorage.setItem('popupClosed', 'true'); });
    donateClose?.addEventListener('click', () => { donatePopup.classList.remove('active'); localStorage.setItem('donateClosed', 'true'); });
    ribbonClose?.addEventListener('click', () => document.getElementById("donationRibbon").remove());

    window.addEventListener('click', (e) => {
        if (e.target === substackPopup) substackPopup.classList.remove('active');
        if (e.target === donatePopup) donatePopup.classList.remove('active');
    });

    // Etsy Grid
    const etsyGrid = document.getElementById('etsyGrid');
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
        item.innerHTML = `<img src="${product.img}" alt="${product.name}" loading="lazy"><p>${product.name}</p><small>${product.price}</small>`;
        etsyGrid.appendChild(item);
    });

    // Fade-in sections
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px' });

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease';
        observer.observe(section);
    });

    // Handle broken images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => img.src = 'https://via.placeholder.com/500x300?text=Image+Not+Found');
    });

    // Active nav links
    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 100;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            if (sectionId && scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
                document.querySelector('.nav-links a[href="#'+sectionId+'"]')?.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', updateActiveNavLink);
});
