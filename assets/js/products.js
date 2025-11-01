document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM chargé - initialisation produits');
  initProductAdd();
  loadProducts();
  initSearch();
});

// AJOUT  PRODUIT
async function initProductAdd() {
  const form = document.querySelector('#ProductCreate-form');
  const errorsBox = document.querySelector('#errors');
  
  if (!form) {
    console.log('Formulaire création non trouvé - probablement pas sur la bonne page');
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
        if (responseText.includes('<br />') || responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
          throw new Error('Erreur serveur - Le serveur a renvoyé une page HTML au lieu de JSON.');
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

// GESTION DES PRODUITS
const productListContainer = document.querySelector('#product-list');
const filterInput = document.querySelector('#search');
let products = [];


async function loadProducts(search = '') {
  if (!productListContainer) {
    console.log('Container product-list non trouvé - probablement pas sur le dashboard');
    return;
  }
  
  try {
    let url = '/E-commerce/api/admin/products.php';
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }

    console.log('Chargement produits depuis:', url);
    const res = await fetch(url);
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      throw new Error(data.message || `Erreur ${res.status}`);
    }
    
    products = Array.isArray(data.products) ? data.products : [];
    console.log(`${products.length} produits chargés`);
    displayProducts(products);
    
  } catch (err) {
    console.error('Erreur chargement produits:', err);
    productListContainer.innerHTML = `<p style="color: red;">❌ ${escapeHtml(err.message)}</p>`;
  }
}


function displayProducts(list) {
  if (!productListContainer) return;
  
  if (!list.length) {
    productListContainer.innerHTML = '<div style="padding: 20px; text-align: center;">Aucun produit trouvé</div>';
    return;
  }

  productListContainer.innerHTML = list.map(p => `
    <div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; border-radius: 5px; background: white;">
      ${p.image ? `<img src="/E-commerce/${p.image}" 
           alt="${escapeHtml(p.titre)}"
           style="max-width: 200px; max-height: 200px; display: block; margin-bottom: 10px; border-radius: 4px;"
           onerror="this.style.display='none'">` : ''}
      <h3 style="margin: 0 0 10px 0;">${escapeHtml(p.titre)}</h3>
      <p style="margin: 0 0 10px 0;">${escapeHtml(p.description)}</p>
      <p style="margin: 0 0 5px 0;"><strong>Prix : ${Number(p.prix).toFixed(2)} €</strong></p>
      <p style="color: #666; font-size: 0.9rem; margin: 0 0 15px 0;">
        Créé le: ${new Date(p.created_at).toLocaleDateString('fr-FR')}
      </p>
      
      <div style="display: flex; gap: 10px;">
        <button onclick="editProduct(${p.id})" 
                style="background: #3498db; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;">
          ✏️ Modifier
        </button>
        <button onclick="deleteProduct(${p.id})" 
                style="background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;">
          🗑️ Supprimer
        </button>
      </div>
    </div>
  `).join('');
}

// ÉDITION  PRODUIT
function editProduct(productId) {
  console.log('Modification du produit:', productId);
  window.location.href = `/E-commerce/admin/product_edit.html?id=${productId}`;
}

// SUPPRESSION PRODUIT
async function deleteProduct(productId) {
  console.log('Suppression du produit:', productId);
  
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?\nCette action est irréversible.')) {
    return;
  }

  try {
    const res = await fetch('/E-commerce/api/admin/product_delete.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId })
    });
    
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erreur lors de la suppression');
    }
    
    alert('✅ Produit supprimé avec succès!');
    loadProducts(); 
    
  } catch (error) {
    console.error('Erreur suppression:', error);
    alert('❌ Erreur: ' + error.message);
  }
}

// RECHERCHE
function initSearch() {
  if (!filterInput) {
    console.log('Champ recherche non trouvé');
    return;
  }

  let timer;
  
  filterInput.addEventListener('input', (e) => {
    const val = (e.target.value || '').toLowerCase();
    console.log('Recherche:', val);

 
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
    const res = await fetch(url);
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      throw new Error(data.message || `Erreur ${res.status}`);
    }
    
    products = Array.isArray(data.products) ? data.products : [];
    displayProducts(products);
    
  } catch (err) {
    console.error('Erreur recherche:', err);
  }
}

// UTILITAIRE
function escapeHtml(s) {
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}