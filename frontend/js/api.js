const API = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://shopzone-6q91.onrender.com/api';
// ShopZone API config - production ready
const Auth = {
  getToken: () => localStorage.getItem('sz_token'),
  setToken: t  => localStorage.setItem('sz_token', t),
  clear:    ()  => localStorage.removeItem('sz_token'),
  headers:  ()  => ({ 'Content-Type':'application/json', 'Authorization':'Bearer '+Auth.getToken() })
};
const ProductsAPI = {
  getAll: p => fetch(API+'/products?'+new URLSearchParams(p||{})).then(r=>r.json()),
  getOne: id => fetch(API+'/products/'+id).then(r=>r.json()),
  update: (id,d) => fetch(API+'/products/'+id,{method:'PATCH',headers:Auth.headers(),body:JSON.stringify(d)}).then(r=>r.json()),
  restock:(id,q) => fetch(API+'/products/'+id+'/restock',{method:'PATCH',headers:Auth.headers(),body:JSON.stringify({quantity:q})}).then(r=>r.json())
};
const OrdersAPI = {
  getAll: p => fetch(API+'/orders?'+new URLSearchParams(p||{}),{headers:Auth.headers()}).then(r=>r.json()),
  getOne: id => fetch(API+'/orders/'+id).then(r=>r.json()),
  place:  d  => fetch(API+'/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()),
  updateStatus:(id,s)=>fetch(API+'/orders/'+id+'/status',{method:'PATCH',headers:Auth.headers(),body:JSON.stringify({status:s})}).then(r=>r.json())
};
const PaymentsAPI = {
  createIntent: (amount, currency, customer_email, customer_name, shipping_address, items) =>
    fetch(API+'/payments/create-intent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount,currency,customer_email,customer_name,shipping_address,items})}).then(r=>r.json()),
  confirm: (paymentIntentId, customer_name, customer_email, shipping_address, subtotal, tax, shipping_cost, total, items) =>
    fetch(API+'/payments/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({payment_intent_id:paymentIntentId,customer_name,customer_email,shipping_address,subtotal,tax,shipping_cost,total,items})}).then(r=>r.json()),
  status: (paymentIntentId) => fetch(API+'/payments/status/'+paymentIntentId).then(r=>r.json())
};
const CustomersAPI  = { getAll: ()  => fetch(API+'/customers',{headers:Auth.headers()}).then(r=>r.json()) };
const InventoryAPI  = { get:    ()  => fetch(API+'/inventory',{headers:Auth.headers()}).then(r=>r.json()) };
const AnalyticsAPI  = { summary:()  => fetch(API+'/analytics/summary',{headers:Auth.headers()}).then(r=>r.json()) };
const AdminAuthAPI  = { login:(e,p) => fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e,password:p})}).then(r=>r.json()) };
const RefundsAPI = {
  getAll: () => fetch(API+'/refunds',{headers:Auth.headers()}).then(r=>r.json())
};
const SettingsAPI = {
  get: () => fetch(API+'/settings').then(r=>r.json()),
  getTerms: () => fetch(API+'/settings/terms').then(r=>r.json()),
  updateTerms: (data) => fetch(API+'/settings/terms',{method:'PUT',headers:Auth.headers(),body:JSON.stringify(data)}).then(r=>r.json()),
  update: (data) => fetch(API+'/settings',{method:'PUT',headers:Auth.headers(),body:JSON.stringify(data)}).then(r=>r.json())
};