let allOrders = [];

async function loadOrders() {
    try {
        const res = await fetch('/E-commerce/api/admin/admin_orders.php');
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Erreur lors du chargement des commandes');
        }

        allOrders = data.orders || [];
        displayOrders(allOrders);
        
    } catch (error) {
        console.error('Erreur:', error);
        const container = document.getElementById('orders-list');
        if (container) {
            container.innerHTML = `
                <div style="color: red; padding: 20px;">
                    ❌ Erreur lors du chargement des commandes: ${error.message}
                </div>
            `;
        }
    }
}


function displayOrders(orders) {
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    if (!orders.length) {
        container.innerHTML = '<div style="padding: 20px; text-align: center;">Aucune commande pour le moment</div>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; border-radius: 5px; background: white; border-left: 4px solid #3498db;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                <div style="font-weight: bold; color: #2c3e50; font-size: 1.1rem;">
                    Commande #${order.id}
                </div>
                <div style="color: #7f8c8d; font-size: 0.9rem;">
                    ${formatDate(order.created_at)}
                </div>
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>Client:</strong> ${escapeHtml(order.customer_email)}
            </div>
            
            <div style="font-size: 1.2rem; font-weight: bold; color: #27ae60; margin: 8px 0;">
                ${formatPrice(order.total)} €
            </div>
            
            <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 15px;">
                ${order.items_count} article(s)
            </div>
            
            <div>
                <button onclick="viewOrderDetails(${order.id})" 
                        style="background: #3498db; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">
                    👁️ Voir les détails
                </button>
            </div>
        </div>
    `).join('');
}

// details d'une commande
async function viewOrderDetails(orderId) {
    try {
        const res = await fetch(`/E-commerce/api/admin/admin_order_details.php?order_id=${orderId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Erreur lors du chargement des détails');
        }

        showOrderModal(data.order, data.items);
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur: ' + error.message);
    }
}

//modal
function showOrderModal(order, items) {
    
    let modal = document.getElementById('order-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'order-modal';
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.zIndex = '1000';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.overflow = 'auto';
        document.body.appendChild(modal);
    }

    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.margin = '5% auto';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '600px';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';
    modalContent.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';

    modalContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <h2 style="margin: 0;">Détails de la commande #${order.id}</h2>
            <span onclick="closeOrderModal()" style="color: #aaa; font-size: 28px; font-weight: bold; cursor: pointer; line-height: 1;">&times;</span>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 15px 0;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                <strong>Client:</strong><br>
                ${escapeHtml(order.customer_email)}
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                <strong>Date:</strong><br>
                ${formatDate(order.created_at)}
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                <strong>Total:</strong><br>
                ${formatPrice(order.total)} €
            </div>
        </div>
        
        <h3>Articles commandés (${items.length})</h3>
        <div style="margin: 15px 0;">
            ${items.map(item => `
                <div style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #eee; gap: 15px;">
                    ${item.image ? `<img src="/E-commerce/${item.image}" 
                         alt="${item.titre}" 
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                         onerror="this.style.display='none'">` : ''}
                    <div style="flex: 1;">
                        <div style="font-weight: bold; margin-bottom: 4px;">${escapeHtml(item.titre)}</div>
                        <div style="color: #7f8c8d; font-size: 0.9rem;">
                            Quantité: ${item.qty} × ${formatPrice(item.unit_price)} €
                        </div>
                    </div>
                    <div style="font-weight: bold; color: #27ae60;">
                        ${formatPrice(item.qty * item.unit_price)} €
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <button onclick="closeOrderModal()" 
                    style="background: #95a5a6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                Fermer
            </button>
        </div>
    `;

    modal.innerHTML = '';
    modal.appendChild(modalContent);
    modal.style.display = 'block';
}

// FERMER LA MODAL
function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}


window.onclick = function(event) {
    const modal = document.getElementById('order-modal');
    if (event.target === modal) {
        closeOrderModal();
    }
}

//onglets
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            
            // Désactiver tous les onglets
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
          
            btn.classList.add('active');
            document.getElementById(`${target}-tab`).classList.add('active');
            
            
            if (target === 'orders') {
                loadOrders();
            }
        });
    });
}

// UTILITAIRES
function formatPrice(price) {
    return Number(price).toFixed(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// INITIALISATION
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    loadOrders();
});