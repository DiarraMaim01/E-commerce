async function loadProductData() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showError('ID produit manquant');
        return;
    }

    try {
        const res = await fetch(`/E-commerce/api/public/products.php`);
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Erreur lors du chargement des produits');
        }

        const product = data.products.find(p => p.id == productId);
        
        if (!product) {
            showError('Produit non trouvé');
            return;
        }

        // Remplir le formulaire
        document.getElementById('product_id').value = product.id;
        document.getElementById('titre').value = product.titre || '';
        document.getElementById('description').value = product.description || '';
        document.getElementById('prix').value = product.prix || '';
        
       
        if (product.image) {
            document.getElementById('current-image').innerHTML = `
                <strong>Image actuelle :</strong><br>
                <img src="/E-commerce/${product.image}" 
                     alt="${product.titre}" 
                     style="max-width: 200px; margin-top: 10px;">
            `;
        }

    } catch (error) {
        showError('Erreur: ' + error.message);
    }
}


function initEditForm() {
    const form = document.getElementById('ProductEdit-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const productId = formData.get('product_id');
        
        try {
            const res = await fetch('/E-commerce/api/admin/product_edit.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await res.json();
            
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Erreur lors de la modification');
            }
            
            alert('✅ Produit modifié avec succès!');
            window.location.href = '/E-commerce/admin/dashboard.html';
            
        } catch (error) {
            showError('Erreur: ' + error.message);
        }
    });
}

function showError(message) {
    document.getElementById('errors').innerHTML = `
        <div style="color: red; margin: 10px 0;">❌ ${message}</div>
    `;
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadProductData();
    initEditForm();
});