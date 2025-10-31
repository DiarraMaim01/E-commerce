const productListContainer = document.querySelector('#product-list');
const filterInput = document.querySelector('#search');
let products = [];

function displayProducts(list) {
  if (!productListContainer) return;
  productListContainer.innerHTML = list.map(p => `
    <div class="produit" >
     <img src="/E-commerce/${escapeHtml(p.image)}"
     alt="${escapeHtml(p.titre)}"
     style="max-width:200px; max-height:200px;">
      <h3>${escapeHtml(p.titre)}</h3>
      <p>${escapeHtml(p.description)}</p>
      <p>Prix : ${Number(p.prix).toFixed(2)} €</p>
   
      <button data-id="${escapeHtml(p.id)}" class="add-to-cart-btn">Ajouter au panier</button>
    </div>
  `).join('');
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

async function loadProducts() {
  if (!productListContainer) return;
  try {
    const res  = await fetch('/E-commerce/api/public/products.php');
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || `Erreur ${res.status}`);
    products = Array.isArray(data.products) ? data.products : [];
    displayProducts(products);
  } catch (err) {
    console.error(err);
    productListContainer.innerHTML = `<p class="error">❌ ${escapeHtml(err.message)}</p>`;
  }
}


let timer;
if (filterInput) {
  filterInput.addEventListener('input', (e) => {
    const val = (e.target.value || '').toLowerCase();

   
    const filtered = products.filter(p =>
      (p.titre || '').toLowerCase().includes(val) ||
      (p.description || '').toLowerCase().includes(val)
    );
    displayProducts(filtered);

  
    clearTimeout(timer);
    timer = setTimeout(() => rechercheServeur(val), 600);
  });
}

async function rechercheServeur(query) {
  try {
    const url = `/E-commerce/api/public/products.php?search=${encodeURIComponent(query)}`;
    const res  = await fetch(url);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || `Erreur ${res.status}`);
    products = Array.isArray(data.products) ? data.products : [];
    displayProducts(products);
  } catch (err) {
    console.error(err);
  }
}

loadProducts();

// Gestion du panier
const CART_KEY ='cart';
productListContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-to-cart-btn');
  if (!btn) return;
  const id = btn.dataset.id;
  const product= products.find(p=> String(p.id) === String(id));
  if (!product) return;

  addToCart(product);
  updateCartBadge();

  btn.textContent = 'Ajouté !';
  setTimeout(() => {
    btn.textContent = 'Ajouter au panier';
  }, 1000);
});

updateCartBadge();

function addToCart(product) {
  const cart = getCart();
  const existingItemIndex = cart.findIndex(item => String(item.id) === String(product.id));
  if (existingItemIndex >= 0){
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      id: product.id,
      titre: product.titre,
      prix: product.prix,
      image: product.image,
      quantity: 1
    });
  }
  saveCart(cart);
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  }catch {
    return[];
  }
}


function saveCart(c){
    localStorage.setItem(CART_KEY, JSON.stringify(c));
}

 function getCartCount() {
  return getCart().reduce((s,p) => s + p.quantity, 0);
}

function updateCartBadge() {
  const badge = document.querySelector('#cart-count');
  if (badge) badge.textContent = getCartCount();
}



