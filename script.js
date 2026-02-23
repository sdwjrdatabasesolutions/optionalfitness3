
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

/* BREAKING NEWS AUTO FEED */
const tickerData = [
"Mayor Mandani expands press access at City Hall",
"TBA News Network launches independent journalism platform",
"NYC housing debate intensifies after policy announcement"
];

const ticker = document.getElementById("tickerContent");
if(ticker){
ticker.innerText = tickerData.join("   ✦   ");
}

// SUBSTACK BUTTON TRACKING


  /* SUBSTACK BUTTON TRACKING */
const substackBtn = document.getElementById("substackBtn");

if(substackBtn){
  substackBtn.addEventListener("click", ()=>{

    console.log("Substack button clicked");

    let clicks = localStorage.getItem("substackClicks") || 0;
    clicks++;
    localStorage.setItem("substackClicks", clicks);

    console.log("Total Substack clicks:", clicks);

  });
}

/* SUBSTACK POPUP TIMER */
const popup = document.getElementById("substackPopup");
const closePopup = document.getElementById("popupClose");

if(popup){

  setTimeout(()=>{
    // only show if user hasn’t closed before
    if(!localStorage.getItem("popupClosed")){
      popup.classList.add("active");
    }
  },20000);

}

if(closePopup){
  closePopup.addEventListener("click",()=>{
    popup.classList.remove("active");
    localStorage.setItem("popupClosed",true);
  });
}

/* SUBSTACK CLICK TRACKING WITH PAGE INFO */
function trackSubstackClick(btnId){

  const btn = document.getElementById(btnId);

  if(btn){
    btn.addEventListener("click", ()=>{

      let clicks = JSON.parse(localStorage.getItem("substackClicks")) || {};

      const page = window.location.pathname;

      if(!clicks[page]){
        clicks[page] = 0;
      }

      clicks[page]++;

      localStorage.setItem("substackClicks", JSON.stringify(clicks));

      console.log("Substack clicks per page:", clicks);

    });
  }

}

trackSubstackClick("substackBtn");
trackSubstackClick("popupSubstackBtn");

/* DONATION POPUP AFTER 35s */
const donatePopup = document.getElementById("donatePopup");
const donateClose = document.getElementById("donateClose");

if(donatePopup){
  setTimeout(()=>{
    if(!localStorage.getItem("donateClosed")){
      donatePopup.classList.add("active");
    }
  },35000);
}

if(donateClose){
  donateClose.addEventListener("click",()=>{
    donatePopup.classList.remove("active");
    localStorage.setItem("donateClosed",true);
  });
}
