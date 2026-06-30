function showToast(msg, type='success') {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:20px;right:20px;padding:12px 20px;border-radius:10px;color:#fff;font-size:14px;font-weight:500;z-index:9999;max-width:300px;box-shadow:0 4px 12px rgba(0,0,0,0.2);background:${type==='error'?'#dc2626':type==='info'?'#1a56db':'#065f46'};transform:translateY(20px);opacity:0;transition:all 0.3s`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.transform='translateY(0)'; t.style.opacity='1'; }, 10);
  setTimeout(() => { t.style.opacity='0'; setTimeout(()=>t.remove(),300); }, 3000);
}
function fmt(n) { return '$' + parseFloat(n||0).toFixed(2); }
function stars(r) { let s=''; for(let i=1;i<=5;i++) s+=`<span style="color:${i<=Math.floor(r)?'#f59e0b':'#d1d5db'}">★</span>`; return s; }
const Cart = {
  get: () => JSON.parse(localStorage.getItem('sz_cart')||'[]'),
  save(items) { localStorage.setItem('sz_cart',JSON.stringify(items)); this.badge(); },
  add(p,qty=1) { const c=this.get(),ex=c.find(i=>i.id===p.id); ex?ex.qty+=qty:c.push({...p,qty}); this.save(c); showToast(p.name.slice(0,22)+'... added 🛒'); },
  remove(id)   { this.save(this.get().filter(i=>i.id!==id)); },
  update(id,q) { this.save(this.get().map(i=>i.id===id?{...i,qty:q}:i)); },
  clear()      { this.save([]); },
  count()      { return this.get().reduce((s,i)=>s+i.qty,0); },
  total()      { return this.get().reduce((s,i)=>s+i.price*i.qty,0); },
  badge()      { const b=document.getElementById('cart-badge'); if(b){const c=this.count();b.textContent=c;b.style.display=c>0?'flex':'none';} }
};
const Wishlist = {
  get: () => JSON.parse(localStorage.getItem('sz_wish')||'[]'),
  has(id) { return this.get().some(i=>i.id===id); },
  toggle(p) { const w=this.get(),i=w.findIndex(x=>x.id===p.id); i>=0?(w.splice(i,1),showToast('Removed from wishlist','info')):(w.push(p),showToast('Added to wishlist ❤️')); localStorage.setItem('sz_wish',JSON.stringify(w)); const b=document.getElementById('wish-badge'); if(b){b.textContent=w.length;b.style.display=w.length>0?'flex':'none';} }
};

// Fallback: if api.js not loaded (cached old version), define CategoriesAPI
if (typeof CategoriesAPI === 'undefined') {
  // Use relative URL for production, works with Render
  const _apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
  window.CategoriesAPI = {
    getAll: () => fetch(_apiBase+'/categories').then(r=>r.json()),
    create: (d) => fetch(_apiBase+'/categories',{headers:{'Authorization':'Bearer '+(localStorage.getItem('sz_token')||''),'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()),
    update: (id,d) => fetch(_apiBase+'/categories/'+id,{method:'PATCH',headers:{'Authorization':'Bearer '+(localStorage.getItem('sz_token')||''),'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()),
    delete: (id) => fetch(_apiBase+'/categories/'+id,{method:'DELETE',headers:{'Authorization':'Bearer '+(localStorage.getItem('sz_token')||'')}}).then(r=>r.json())
  };
}