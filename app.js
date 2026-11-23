const $ = s => document.querySelector(s);
const KEY = "tsl_orders_v1";
let orders = JSON.parse(localStorage.getItem(KEY) || "[]");
let activeOrder = null;
let deferredPrompt = null;
const money = n => new Intl.NumberFormat("es-PY",{maximumFractionDigits:0}).format(Number(n)||0);
const price = n => "Gs. " + money(n);
const statuses = ["Recibido","Preparando","En camino","Entregado","Cancelado"];
const save = () => { localStorage.setItem(KEY, JSON.stringify(orders)); render(); };
const calc = n => Math.round((Number(n)||0)*0.95);
const showToast = msg => { const t=$("#toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2400); };
$("#year").textContent = new Date().getFullYear();

function updateQuote(input, output, saving) {
  const value = Math.max(0, Number(input.value)||0);
  output.textContent = price(calc(value));
  if(saving) saving.textContent = "Ahorro para el cliente: " + price(value-calc(value));
}
$("#boltPrice").addEventListener("input",()=>updateQuote($("#boltPrice"),$("#ourPrice")));
$("#quickBolt").addEventListener("input",()=>updateQuote($("#quickBolt"),$("#quickResult"),$("#quickSaving")));

$("#orderForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = new FormData(e.currentTarget);
  const bolt = Number(f.get("boltPrice"))||0;
  if(!bolt){showToast("Ingresá el precio de Bolt para calcular la tarifa.");$("#boltPrice").focus();return;}
  const order = {
    id: "TSL-"+Date.now().toString().slice(-7),
    createdAt: new Date().toISOString(),
    customer: String(f.get("customer")).trim(),
    phone: String(f.get("phone")).trim(),
    pickup: String(f.get("pickup")).trim(),
    delivery: String(f.get("delivery")).trim(),
    description: String(f.get("description")).trim(),
    boltPrice: bolt, ourPrice: calc(bolt),
    payment: f.get("payment"), notes: String(f.get("notes")).trim(),
    status: "Recibido"
  };
  orders.unshift(order); save(); e.currentTarget.reset(); $("#ourPrice").value="";
  showToast("Pedido "+order.id+" registrado correctamente.");
});

function render(){
  $("#totalCount").textContent=orders.length;
  $("#pendingCount").textContent=orders.filter(o=>["Recibido","Preparando"].includes(o.status)).length;
  $("#transitCount").textContent=orders.filter(o=>o.status==="En camino").length;
  $("#deliveredCount").textContent=orders.filter(o=>o.status==="Entregado").length;
  const term=$("#searchInput").value.toLowerCase();
  const filter=$("#statusFilter").value;
  const filtered=orders.filter(o=>(filter==="Todos"||o.status===filter) &&
    [o.id,o.customer,o.phone,o.pickup,o.delivery].join(" ").toLowerCase().includes(term));
  const list=$("#ordersList");
  if(!filtered.length){list.innerHTML=`<div class="empty"><span>▤</span><strong>${orders.length?"No hay coincidencias":"Todavía no hay pedidos"}</strong><p>${orders.length?"Probá cambiar la búsqueda o el filtro.":"Los pedidos que registres aparecerán aquí."}</p></div>`;return;}
  list.innerHTML=filtered.map(o=>`
    <article class="order-card">
      <div class="order-main">
        <div class="order-top"><strong>${esc(o.customer)}</strong><span class="status status-${o.status.replace(" ",".")}">${o.status}</span></div>
        <div class="order-meta">${esc(o.id)} · ${new Date(o.createdAt).toLocaleString("es-PY")}<br>Retiro: ${esc(o.pickup)}<br>Entrega: ${esc(o.delivery)}</div>
        <div class="order-price">${price(o.ourPrice)} <span style="font-weight:500;color:#82909d">· Bolt ${price(o.boltPrice)}</span></div>
      </div>
      <div class="order-actions">
        <select class="mini-btn status-change" data-id="${o.id}" aria-label="Cambiar estado de ${esc(o.id)}">${statuses.map(s=>`<option ${o.status===s?"selected":""}>${s}</option>`).join("")}</select>
        <button class="mini-btn detail-btn" data-id="${o.id}">Ver detalle</button>
        <button class="mini-btn delete-btn" data-id="${o.id}" aria-label="Eliminar pedido">Eliminar</button>
      </div>
    </article>`).join("");
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("#searchInput").addEventListener("input",render);
$("#statusFilter").addEventListener("change",render);
$("#ordersList").addEventListener("change",e=>{
  if(e.target.matches(".status-change")){const o=orders.find(x=>x.id===e.target.dataset.id);if(o){o.status=e.target.value;save();showToast("Estado actualizado.");}}
});
$("#ordersList").addEventListener("click",e=>{
  const id=e.target.dataset.id;
  if(e.target.matches(".detail-btn"))openDetail(id);
  if(e.target.matches(".delete-btn")&&confirm("¿Eliminar este pedido?")){orders=orders.filter(o=>o.id!==id);save();showToast("Pedido eliminado.");}
});
function openDetail(id){
  activeOrder=orders.find(o=>o.id===id);if(!activeOrder)return;
  const o=activeOrder;$("#detailTitle").textContent=o.id;
  const rows=[["Cliente",o.customer],["Teléfono",o.phone],["Retiro",o.pickup],["Entrega",o.delivery],["Descripción",o.description||"—"],["Precio Bolt",price(o.boltPrice)],["Tarifa Tu Socio",price(o.ourPrice)],["Forma de pago",o.payment],["Estado",o.status],["Observaciones",o.notes||"—"]];
  $("#detailBody").innerHTML='<div class="detail-grid">'+rows.map(([a,b])=>`<div class="detail-item"><small>${esc(a)}</small><strong>${esc(b)}</strong></div>`).join("")+'</div>';
  $("#detailDialog").showModal();
}
$("#closeDetail").addEventListener("click",()=>$("#detailDialog").close());
$("#whatsappBtn").addEventListener("click",()=>{
  if(!activeOrder)return;
  const digits=activeOrder.phone.replace(/\D/g,"");
  const phone=digits.startsWith("595")?digits:(digits.startsWith("0")?"595"+digits.slice(1):"595"+digits);
  const msg=`Hola ${activeOrder.customer}, te contactamos de Tu Socio Logístico SL por tu pedido ${activeOrder.id}. Retiro: ${activeOrder.pickup}. Entrega: ${activeOrder.delivery}. Tarifa: ${price(activeOrder.ourPrice)}.`;
  window.open("https://wa.me/"+phone+"?text="+encodeURIComponent(msg),"_blank","noopener");
});
$("#exportBtn").addEventListener("click",()=>{
  if(!orders.length){showToast("No hay pedidos para exportar.");return;}
  const cols=["id","createdAt","customer","phone","pickup","delivery","description","boltPrice","ourPrice","payment","status","notes"];
  const csv=[cols.join(";"),...orders.map(o=>cols.map(k=>'"'+String(o[k]??"").replace(/"/g,'""')+'"').join(";"))].join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="pedidos-tu-socio-logistico.csv";a.click();URL.revokeObjectURL(a.href);
});
$("#clearBtn").addEventListener("click",()=>{
  if(orders.length&&confirm("Esto eliminará permanentemente todos los pedidos guardados en este dispositivo. ¿Continuar?")){orders=[];save();showToast("Se eliminaron los pedidos.");}
});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#installBtn").classList.remove("hidden");});
$("#installBtn").addEventListener("click",async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("#installBtn").classList.add("hidden");});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
render();