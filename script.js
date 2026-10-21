const navToggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
if(navToggle&&nav){navToggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');navToggle.setAttribute('aria-expanded',String(open));navToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation')});nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');navToggle.setAttribute('aria-expanded','false')}))}

document.querySelectorAll('.filter-chip').forEach(chip=>chip.addEventListener('click',()=>{document.querySelectorAll('.filter-chip').forEach(item=>item.classList.remove('selected'));chip.classList.add('selected');const filter=chip.dataset.filter;document.querySelectorAll('.dish-card').forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter})}));

const lightbox=document.querySelector('.lightbox');
if(lightbox){const largeImage=lightbox.querySelector('img');document.querySelectorAll('.gallery-tile').forEach(tile=>tile.addEventListener('click',()=>{const image=tile.querySelector('img');largeImage.src=image.src;largeImage.alt=image.alt;lightbox.showModal()}));lightbox.querySelector('.lightbox-close').addEventListener('click',()=>lightbox.close());lightbox.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close()});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&lightbox.open)lightbox.close()})}

const reservationForm=document.querySelector('.reservation-form');
if(reservationForm){const dateField=reservationForm.querySelector('[name="date"]');const today=new Date();const localToday=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);dateField.min=localToday;reservationForm.addEventListener('submit',event=>{event.preventDefault();if(!reservationForm.reportValidity())return;const data=new FormData(reservationForm);const firstName=String(data.get('name')).trim().split(/\s+/)[0];reservationForm.querySelector('.form-status').textContent=`Thanks, ${firstName}! Your table request is ready. We’ll be in touch to confirm.`;reservationForm.reset();dateField.min=localToday})}
