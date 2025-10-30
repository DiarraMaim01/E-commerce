document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM chargé - initialisation produits');
  initProductAdd();
  loadProducts();
});


//ajout de produit

async function initProductAdd() {
  const form = document.querySelector('#ProductCreate-form');
  const errorsBox = document.querySelector('#errors');
  
  if (!form) {
    console.log('Formulaire non trouvé');
    return;
  }

  console.log('Initialisation du formulaire de création de produit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Submit détecté');
    errorsBox.textContent = '';

    const titre = document.querySelector('#titre').value.trim();
    const description = document.querySelector('#description').value.trim();
    const prix = document.querySelector('#prix').value.trim();
    const imageInput = document.querySelector('#image');

    // Validations 
    const errs = [];
    if (!titre) errs.push('Le titre est obligatoire.');
    if (description.length < 10) errs.push('La description doit contenir au moins 10 caractères.');
    if (isNaN(Number(prix)) || Number(prix) <= 0) errs.push('Le prix doit être un nombre positif.');
    if (!imageInput.files || imageInput.files.length === 0) errs.push('L\'image est requise.');

    if (errs.length) {
      errorsBox.innerHTML = '❌ ' + errs.join('<br>');
      return;
    }

    const fd = new FormData(form);

    try {
      console.log('Envoi de la requête...');
      const res = await fetch('/E-commerce/api/admin/product_create.php', {
        method: 'POST',
        body: fd
      });

      
      const responseText = await res.text();
      console.log('Réponse brute:', responseText);
      

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erreur parsing JSON:', parseError);
        console.log('Contenu reçu (premiers 500 caractères):', responseText.substring(0, 500));
        
      
        if (responseText.includes('<br />') || responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
          throw new Error('Erreur serveur - Le serveur a renvoyé une page HTML au lieu de JSON. Vérifiez les erreurs PHP.');
        } else {
          throw new Error('Réponse invalide du serveur: ' + responseText.substring(0, 200));
        }
      }

      console.log('Données parsées:', data);

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la création');
      }

      alert('✅ Produit créé !');
      form.reset();
      window.location.href = 'dashboard.html';
      
    } catch (err) {
      console.error('Erreur complète:', err);
      errorsBox.textContent = '❌ ' + err.message;
    }
  });
}

// liste des produits avec filtrage
const productListContainer = document.querySelector('#product-list');
const filterInput = document.querySelector('#search');
let products = [];

function displayProducts(list) {
  if (!productListContainer) return;
  productListContainer.innerHTML = list.map(p => `
    <div class="produit">
      <h3>${escapeHtml(p.titre)}</h3>
      <p>${escapeHtml(p.description)}</p>
      <p>Prix : ${Number(p.prix).toFixed(2)} €</p>
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
    const res  = await fetch('/E-commerce/api/admin/products.php');
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
    const url = `/E-commerce/api/admin/products.php?search=${encodeURIComponent(query)}`;
    const res  = await fetch(url);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || `Erreur ${res.status}`);
    products = Array.isArray(data.products) ? data.products : [];
    displayProducts(products);
  } catch (err) {
    console.error(err);
  }
}

