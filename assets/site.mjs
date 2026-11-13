import { calculateSupply } from './calculations.mjs?v=3a6f42c91605663f';
const d=JSON.parse(document.getElementById('page-data').textContent);
const fmt=(value,max=1)=>new Intl.NumberFormat(d.locale,{maximumFractionDigits:max}).format(value);
const mobile=document.querySelector('.mobile-toggle');
mobile?.addEventListener('click',()=>{const opened=mobile.getAttribute('aria-expanded')!=='true';mobile.setAttribute('aria-expanded',String(opened));document.querySelector('#main-navigation').classList.toggle('is-open',opened);});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'){document.querySelector('.language-menu')?.removeAttribute('open');mobile?.setAttribute('aria-expanded','false');document.querySelector('#main-navigation')?.classList.remove('is-open');}});
document.addEventListener('click',ev=>{const menu=document.querySelector('.language-menu');if(menu&&!menu.contains(ev.target))menu.removeAttribute('open');});
for(const box of document.querySelectorAll('[data-planner]')){
 const update=()=>{
  try{
   const fields=[...box.querySelectorAll('input')];
   if(fields.some(i=>!i.validity.valid||i.value.trim()===''))throw new Error('Invalid input');
   const inputs=Object.fromEntries(fields.map(i=>[i.name,Number(i.value)]));
   const result=calculateSupply(inputs);
   box.querySelector('[data-out="coverage"]').textContent=fmt(result.coverage);
   box.querySelector('[data-out="orderIn"]').textContent=result.orderIn>0?`${fmt(result.orderIn)} ${d.ui.days}`:d.planner.now;
   box.querySelector('[data-out="quantity"]').textContent=`${fmt(result.quantity,0)} ${d.ui.kg}`;
   box.querySelector('[data-out="warning"]').textContent=result.shortage?d.planner.shortage:'';
   box.querySelector('.stock-bar span').style.width=`${Math.min(100,result.coverage/Math.max(1,inputs.target)*100)}%`;
   const link=box.querySelector('a');
   link.href=`${d.routes.quote}#type=plan${result.quantity>0?'&quantity='+result.quantity:''}`;
   link.removeAttribute('aria-disabled');
  }catch{
   for(const el of box.querySelectorAll('[data-out]'))el.textContent='';
   box.querySelector('.stock-bar span').style.width='0%';
   box.querySelector('[data-out="warning"]').textContent=d.planner.invalid;
   box.querySelector('a').setAttribute('aria-disabled','true');box.querySelector('a').removeAttribute('href');
  }
 };
 box.addEventListener('input',update);update();
}
document.querySelector('[data-finder]')?.addEventListener('change',ev=>{const i=Number(ev.target.value);document.querySelector('[data-finder-result]').textContent=d.finder.results[i];document.querySelector('.finder a').href=`${d.routes.quote}#product=${encodeURIComponent(d.finder.options[i])}`;});
const form=document.getElementById('enquiry-form');
if(form){const q=new URLSearchParams(location.hash.slice(1));for(const key of ['product','quantity']){const val=q.get(key);if(val&&val.length<180&&(key!=='quantity'||(Number(val)>0&&Number(val)<=1e9)))form.elements[key].value=val;}if(q.get('type')==='sample')form.elements.type.value='1';if(q.get('type')==='plan')form.elements.type.value='2';if(location.hash)history.replaceState(null,'',location.pathname+location.search);
 form.addEventListener('submit',ev=>{ev.preventDefault();if(!form.reportValidity())return;const f=new FormData(form);const lines=[`brasno.si | ${d.quote.types[Number(f.get('type'))]}`,''];for(const key of ['company','person','email','country','city','product','quantity','frequency','date','message']){const value=String(f.get(key)||'').trim();if(value)lines.push(`${key==='quantity'?d.ui.quantity:d.quote[key]}: ${value}`);}const text=lines.join('\n');document.getElementById('enquiry-text').value=text;document.getElementById('prepared-enquiry').hidden=false;refreshMail();document.getElementById('prepared-enquiry').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});});
 const refreshMail=()=>{const text=document.getElementById('enquiry-text').value;document.getElementById('send-email').href=`mailto:moje@brasno.si?subject=${encodeURIComponent(d.quote.subject)}&body=${encodeURIComponent(text)}`;};
 document.getElementById('enquiry-text').addEventListener('input',refreshMail);
 document.getElementById('copy-enquiry').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(document.getElementById('enquiry-text').value);document.getElementById('copy-status').textContent=d.ui.copied;}catch{document.getElementById('enquiry-text').select();document.getElementById('copy-status').textContent=d.ui.copyFailed;}});
}
const dialog=document.getElementById('search-dialog');let entries;
function normal(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase(d.locale);}
async function renderSearch(){try{if(!entries){const res=await fetch(`/${d.locale}/search.json`);if(!res.ok)throw Error('Search unavailable');entries=await res.json();}const term=normal(document.getElementById('search-query').value.trim());const terms=term.split(/\s+/).filter(Boolean);const found=entries.filter(x=>terms.every(t=>normal(x.title+' '+x.description).includes(t))).slice(0,15);const output=document.getElementById('search-results');output.replaceChildren();document.querySelector('.search-status').textContent=found.length?`${d.ui.searchCount}: ${found.length}`:d.ui.searchEmpty;for(const item of found){const a=document.createElement('a');a.href=item.url;a.className='search-result';const h=document.createElement('h3');h.textContent=item.title;const p=document.createElement('p');p.textContent=item.description;a.append(h,p);output.append(a);}}catch{document.querySelector('.search-status').textContent=d.ui.searchEmpty;}}
document.querySelectorAll('.search-trigger').forEach(b=>b.addEventListener('click',()=>{dialog.showModal();document.getElementById('search-query').focus();renderSearch();}));
document.querySelector('[data-close-search]')?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',ev=>{if(ev.target===dialog&&ev.clientX!==0){const b=dialog.getBoundingClientRect();if(ev.clientX<b.left||ev.clientX>b.right||ev.clientY<b.top||ev.clientY>b.bottom)dialog.close();}});
document.getElementById('search-query')?.addEventListener('input',renderSearch);
