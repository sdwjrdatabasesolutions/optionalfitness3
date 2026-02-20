const btn=document.querySelector('.mobile-menu-btn');
const nav=document.querySelector('.nav-links');

btn.addEventListener('click',()=>{
nav.classList.toggle('active');
});
