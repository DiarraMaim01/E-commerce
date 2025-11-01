const CART_KEY = 'cart';

function getCart(){
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

const form = document.getElementById('checkout-form');
form.addEventListener('submit', async(e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const msg = document.getElementById('checkout-msg');
    const cart = getCart();

    // Validation 
    if (!email || !cart.length) {
        msg.textContent = '❌ Email ou panier vide.';
        return;
    }

    
    const items = cart.map(p => ({
        product_id: p.id,
        qty: p.qty || p.quantity || 1 
    }));

    try {
        const res = await fetch('/E-commerce/api/public/orders.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, items})
        });

        const data = await res.json();

        if(!res.ok || !data.success) {
            throw new Error(data.message || `Erreur ${res.status}`);
        }

        msg.textContent = `✅ Commande #${data.order_id} validée (Total : ${data.total} €)`;
        localStorage.removeItem(CART_KEY);

        setTimeout(() => {
            location.href = '/E-commerce/public/index.html';
        }, 2000);
           
    } catch(e) {
        console.error('Erreur checkout:', e);
        msg.textContent = '❌ ' + (e.message || 'Erreur lors de la commande');
    }
});