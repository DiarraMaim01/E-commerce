// assets/js/products.js
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

      // DÉBOGAGE : Lire la réponse comme texte d'abord
      const responseText = await res.text();
      console.log('Réponse brute:', responseText);
      
      // Essayer de parser en JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erreur parsing JSON:', parseError);
        console.log('Contenu reçu (premiers 500 caractères):', responseText.substring(0, 500));
        
        // Si c'est du HTML, c'est probablement une erreur PHP
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
      window.location.href = 'products.html';
      
    } catch (err) {
      console.error('Erreur complète:', err);
      errorsBox.textContent = '❌ ' + err.message;
    }
  });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM chargé - initialisation produits');
  initProductAdd();
});