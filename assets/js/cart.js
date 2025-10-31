const CART_KEY = 'cart';

function getCart(){
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    }catch {
        return [];
    }
}

function saveCart(c){
    localStorage.setItem(CART_KEY, JSON.stringify(c));
}

function formatPrice(price) {
  return Number(price).toFixed(2) + ' €';
}

//supprimer un produit de la carte

function removeItem(id) {
  const cart = getCart().filter(p => String(p.id) !== String(id));
  saveCart(cart);
  render();
}

//vider la carte

function clearCart() {
  localStorage.removeItem(CART_KEY);
  render();
}

function render() {
  const cartEl  = document.getElementById('cart');
  const totalEl = document.getElementById('cart-total');
  const cart = getCart();

  if (!cart.length) {
    cartEl.innerHTML = `<p class="empty">Votre panier est vide.</p>`;
    totalEl.textContent = '';
    return;
  }

  const rows = cart.map(p => `
    <div class="cart-item" data-id="${p.id}">
      <img src="/E-commerce/${(p.image||'').replace(/^\/+/,'')}" alt="${escapeHtml(p.titre)}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">
      <div>
        <div><strong>${escapeHtml(p.titre)}</strong></div>
        <div>${formatPrice(p.prix)}</div>
      </div>
      <div class="qty">
        <button class="minus">−</button>
        <span class="q">${p.quantity}</span>
        <button class="plus">+</button>
      </div>
      <div class="right">
        <div>Sous-total</div>
        <div><strong>${formatPrice(p.prix * p.quantity)}</strong></div>
        <button class="remove" style="margin-top:6px;">Supprimer</button>
      </div>
    </div>
  `).join('');

  cartEl.innerHTML = rows;

  const total = cart.reduce((s, p) => s + p.prix * p.quantity, 0);
  totalEl.textContent = `Total : ${formatPrice(total)}`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function setQty(id, quantity) {
  const cart = getCart();
  const i = cart.findIndex(p => String(p.id) === String(id));
  if (i === -1) return;
  cart[i].quantity = Math.max(1, quantity); // min 1
  saveCart(cart);
  render();
}

// délégation des clics
document.getElementById('cart').addEventListener('click', (e) => {
  const item = e.target.closest('.cart-item');
  if (!item) return;
  const id = item.dataset.id;

  if (e.target.classList.contains('plus')) {
    const q = Number(item.querySelector('.q').textContent) + 1;
    setQty(id, q);
  }
  if (e.target.classList.contains('minus')) {
    const q = Number(item.querySelector('.q').textContent) - 1;
    setQty(id, q);
  }
  if (e.target.classList.contains('remove')) {
    removeItem(id);
  }
});

document.getElementById('clear-cart').addEventListener('click', () => {
  if (confirm('Vider le panier ?')) clearCart();
});


render();
