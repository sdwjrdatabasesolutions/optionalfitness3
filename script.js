
/* MOBILE MENU */
const btn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.nav-links');

btn?.addEventListener('click', ()=>{
  nav.classList.toggle('active');
});

/* CLOSE MENU ON LINK CLICK */
document.querySelectorAll('.nav-links a').forEach(link=>{
  link.addEventListener('click', ()=>{
    nav.classList.remove('active');
  });
});

/* SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
  anchor.addEventListener('click', function(e){
    e.preventDefault();
    document.querySelector(this.getAttribute('href'))
      .scrollIntoView({ behavior:'smooth' });
  });
});

/* NAVBAR SHADOW */
window.addEventListener('scroll',()=>{
  const navbar = document.querySelector('.navbar');
  navbar.style.boxShadow = window.scrollY > 20
    ? "0 4px 12px rgba(0,0,0,0.6)"
    : "none";
});

/* FADE IN SECTIONS */
const sections = document.querySelectorAll('.section');

const reveal = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.style.opacity = 1;
      entry.target.style.transform = "translateY(0)";
    }
  });
},{threshold:0.15});

sections.forEach(sec=>{
  sec.style.opacity = 0;
  sec.style.transform = "translateY(40px)";
  sec.style.transition = "0.8s ease";
  reveal.observe(sec);
});

/* ACTIVE NAV LINK */
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll',()=>{
  let current="";
  sections.forEach(section=>{
    const top = window.scrollY;
    if(top >= section.offsetTop-200){
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(a=>{
    a.classList.remove('active');
    if(a.getAttribute('href') === "#"+current){
      a.classList.add('active');
    }
  });
});
