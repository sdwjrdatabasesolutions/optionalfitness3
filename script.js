(function(){
  // TICKER
  const items=[
    "Mayor Mandani expands press access at City Hall",
    "TBA News Network launches independent journalism platform",
    "NYC housing debate intensifies after policy announcement",
    "Liberian nurses prepare for strike at Phebe Hospital",
    "LAPD faces lawsuit over protest injury",
    "Israeli strikes impact Lebanon communities",
    "U.S.–Israeli strikes kill Khamenei — Iran in political crisis",
    "FBI investigates Austin bar shooting as terrorism",
    "Columbia student released from ICE after Mamdani-Trump meeting"
  ];
  const t=document.getElementById('tickerContent');
  if(t) t.innerText=items.join(' ✦ ');

  // RIBBON CLOSE
  const ribbon=document.getElementById('ribbon');
  const ribbonClose=document.getElementById('ribbonClose');
  const navbar=document.querySelector('.navbar');
  const tickerBar=document.querySelector('.ticker-bar');
  const pagePush=document.querySelector('.page-push');
  if(ribbonClose){
    ribbonClose.addEventListener('click',()=>{
      ribbon.classList.add('hidden');
      navbar.style.top='0';
      if(tickerBar) tickerBar.style.top='62px';
      if(pagePush) pagePush.style.height='102px';
    });
  }

  // HAMBURGER
  const hamburger=document.getElementById('hamburger');
  const navMobile=document.getElementById('navMobile');
  if(hamburger&&navMobile){
    hamburger.addEventListener('click',()=>{
      navMobile.classList.toggle('open');
      hamburger.innerHTML=navMobile.classList.contains('open')
        ?'<i class="fas fa-times"></i>'
        :'<i class="fas fa-bars"></i>';
    });
    navMobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      navMobile.classList.remove('open');
      hamburger.innerHTML='<i class="fas fa-bars"></i>';
    }));
  }

  // SMOOTH SCROLL + NAV ACTIVE
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',function(e){
      const target=document.querySelector(this.getAttribute('href'));
      if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});}
    });
  });

  // NAVBAR SCROLL SHADOW + ACTIVE NAV
  const navLinks=document.querySelectorAll('.nav-links a, .nav-mobile a');
  window.addEventListener('scroll',()=>{
    const nb=document.querySelector('.navbar');
    if(nb) nb.style.boxShadow=window.scrollY>10?'0 4px 24px rgba(0,0,0,.5)':'';
    const sp=window.scrollY+120;
    document.querySelectorAll('section[id]').forEach(sec=>{
      if(sp>=sec.offsetTop&&sp<sec.offsetTop+sec.offsetHeight){
        navLinks.forEach(l=>{
          l.classList.remove('active');
          if(l.getAttribute('href')==='#'+sec.id) l.classList.add('active');
        });
      }
    });
  });

  // FADE-IN OBSERVER
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting) e.target.classList.add('visible');});
  },{threshold:0.08});
  document.querySelectorAll('.fadein').forEach(el=>io.observe(el));

  // POPUPS
  function showPopup(id,delay,storageKey){
    const pop=document.getElementById(id);
    if(!pop||localStorage.getItem(storageKey)) return;
    setTimeout(()=>pop.classList.add('active'),delay);
  }
  showPopup('substackPopup',6000,'subClosed');
  showPopup('donatePopup',14000,'donClosed');
  document.getElementById('popupClose')?.addEventListener('click',()=>{
    document.getElementById('substackPopup').classList.remove('active');
    localStorage.setItem('subClosed','1');
  });
  document.getElementById('donateClose')?.addEventListener('click',()=>{
    document.getElementById('donatePopup').classList.remove('active');
    localStorage.setItem('donClosed','1');
  });
  window.addEventListener('click',e=>{
    if(e.target.id==='substackPopup') e.target.classList.remove('active');
    if(e.target.id==='donatePopup') e.target.classList.remove('active');
  });

  // ETSY GRID
const products=[
  {
    name:'100+ Enterprise AI Consulting Prompts',
    desc:'Enterprise-Level AI Strategy Toolkit for Business Leaders',
    price:'View on Etsy',
    img:'images/consultation.PNG',
    url:'https://www.etsy.com/listing/4417375114/100-enterprise-ai-consulting-prompts'
  },
  {
    name:'Enterprise Restaurant Database',
    desc:'SQL System with Mobile App Backend, and Security & Analytics',
    price:'$250.00',
    img:'images/codebook.PNG',
    url:'https://www.etsy.com/listing/4416564491/enterprise-restaurant-database-sql'
  },
  {
    name:'Restaurant Management Database SYSTEM',
    desc:'Complete SQL Database with Mobile App & Analytics',
    price:'$199.00',
    img:'images/codebook2.jpg',
    url:'https://www.etsy.com/listing/4416600276/restaurant-management-database-system'
  },
 {
  name:'SQL Database Template for Restaurants',
  desc:'Inventory Tracking, Customer Management & Staff Scheduling',
  price:'$99.00',
  img:'images/codebook3.PNG',
  url:'https://www.etsy.com/listing/4416400325/sql-database-template-for-restaurants'
},
];

  // IMAGE ERROR FALLBACK
  document.querySelectorAll('img').forEach(img=>{
    img.addEventListener('error',()=>{
      if(!img.dataset.fallback){img.dataset.fallback='1';img.src='https://via.placeholder.com/600x400?text=TBA+News';}
    });
  });

  // SHARE TRACKING
  document.addEventListener('click',e=>{
    const btn=e.target.closest('.sh-btn,.soc-btn');
    if(!btn) return;
    const platform=['fb','facebook'].some(c=>btn.classList.contains(c))?'Facebook':
                   ['tw','twitter'].some(c=>btn.classList.contains(c))?'Twitter':
                   ['li','linkedin'].some(c=>btn.classList.contains(c))?'LinkedIn':
                   btn.classList.contains('ig')?'Instagram':
                   btn.classList.contains('tt')?'TikTok':
                   btn.classList.contains('yt')?'YouTube':
                   btn.classList.contains('wa')?'WhatsApp':
                   btn.classList.contains('tg')?'Telegram':'Other';
    console.log('Shared on',platform);
  });

  // ANIMATE HERO STATS COUNTER
  function animateCounter(el,target){
    const suffix=el.textContent.replace(/[0-9]/g,'');
    let cur=0;const inc=target/50;
    const t=setInterval(()=>{
      cur=Math.min(cur+inc,target);
      el.textContent=Math.round(cur)+suffix;
      if(cur>=target) clearInterval(t);
    },30);
  }
  const statsObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.querySelectorAll('.num').forEach(n=>{
          const raw=n.textContent;
          const num=parseInt(raw);
          if(!isNaN(num)) animateCounter(n,num);
        });
        statsObs.unobserve(e.target);
      }
    });
  },{threshold:.5});
  const heroStats=document.querySelector('.hero-stats');
  if(heroStats) statsObs.observe(heroStats);

})();
