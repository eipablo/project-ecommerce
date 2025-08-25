(function() {
    // --- 1. Configurações e Seletores DOM ---
    const DOM = {
        cartItemsContainer: document.getElementById('cart-items-container'),
        emptyCartSection: document.getElementById('empty-cart-section'),
        cartContentSection: document.getElementById('cart-content-section'),
        cartSubtotalSpan: document.getElementById('cart-subtotal'),
        cartShippingSpan: document.getElementById('cart-shipping'),
        cartTotalSpan: document.getElementById('cart-total'),
        cartCountHeader: document.querySelector('.cart-icon .cart-count'),
        cartCountMobile: document.querySelector('.mobile-menu .cart-count-mobile'),
        checkoutWhatsappBtn: document.getElementById('checkout-whatsapp-btn')
    };

    const CONFIG = {
        whatsappPhoneNumber: '5519994711585',
        shippingThreshold: 300,
        defaultShippingCost: 20
    };

    // --- 2. Funções Utilitárias e de Gerenciamento de Dados ---
    function getCartItems() {
        try {
            const cart = localStorage.getItem('cart');
            return cart ? JSON.parse(cart) : [];
        } catch (e) {
            console.error('Erro ao ler o carrinho do localStorage:', e);
            return [];
        }
    }

    function saveCartItems(cart) {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCountDisplays();
        } catch (e) {
            console.error('Erro ao salvar o carrinho no localStorage:', e);
        }
    }

    function calculateCartTotals(cart) {
        let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let shipping = 0;
        if (subtotal > 0 && subtotal < CONFIG.shippingThreshold) {
            shipping = CONFIG.defaultShippingCost;
        }
        const total = subtotal + shipping;
        return { subtotal, shipping, total };
    }

    // --- 3. Funções de Manipulação do DOM e Renderização ---
    function updateCartCountDisplays() {
        const cart = getCartItems();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (DOM.cartCountHeader) {
            DOM.cartCountHeader.textContent = totalItems;
        }
        if (DOM.cartCountMobile) {
            DOM.cartCountMobile.textContent = totalItems;
        }
    }

    function renderCart() {
        const cart = getCartItems();
        DOM.cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            if (DOM.emptyCartSection) DOM.emptyCartSection.style.display = 'block';
            if (DOM.cartContentSection) DOM.cartContentSection.style.display = 'none';
        } else {
            if (DOM.emptyCartSection) DOM.emptyCartSection.style.display = 'none';
            if (DOM.cartContentSection) DOM.cartContentSection.style.display = 'block';
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.dataset.itemId = item.id;
                cartItemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p class="item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                        <div class="quantity-controls">
                            <button class="decrease-quantity-btn" data-item-id="${item.id}">-</button>
                            <span class="item-quantity">${item.quantity}</span>
                            <button class="increase-quantity-btn" data-item-id="${item.id}">+</button>
                        </div>
                        <button class="remove-item-btn" data-item-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                DOM.cartItemsContainer.appendChild(cartItemDiv);
            });
            const { subtotal, shipping, total } = calculateCartTotals(cart);
            if (DOM.cartSubtotalSpan) DOM.cartSubtotalSpan.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
            if (DOM.cartShippingSpan) DOM.cartShippingSpan.textContent = `R$ ${shipping.toFixed(2).replace('.', ',')}`;
            if (DOM.cartTotalSpan) DOM.cartTotalSpan.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        }
        updateCartCountDisplays();
    }

    // --- 4. Funções de Ação do Carrinho ---
    function updateQuantity(itemId, change) {
        let cart = getCartItems();
        const itemIndex = cart.findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                removeFromCart(itemId);
                return;
            }
            saveCartItems(cart);
            renderCart();
        }
    }

    function removeFromCart(itemId) {
        let cart = getCartItems();
        cart = cart.filter(item => item.id !== itemId);
        saveCartItems(cart);
        renderCart();
    }

    // --- 5. Manipuladores de Eventos ---
    function handleCartControlsClick(event) {
        const target = event.target;
        const button = target.closest('button[data-item-id]');
        if (!button) return;
        const itemId = button.dataset.itemId;
        if (button.classList.contains('increase-quantity-btn')) {
            updateQuantity(itemId, 1);
        } else if (button.classList.contains('decrease-quantity-btn')) {
            updateQuantity(itemId, -1);
        } else if (button.classList.contains('remove-item-btn')) {
            if (confirm('Tem certeza que deseja remover este item do carrinho?')) {
                removeFromCart(itemId);
            }
        }
    }

    function handleCheckoutWhatsapp() {
        const cart = getCartItems();
        if (cart.length === 0) {
            alert('Seu carrinho está vazio. Adicione itens antes de finalizar a compra.');
            return;
        }
        const { subtotal, shipping, total } = calculateCartTotals(cart);
        let whatsappMessage = `Olá! Gostaria de fazer um pedido na XXXX.\n\n`;
        whatsappMessage += `--- Meus Itens ---\n`;
        cart.forEach((item, index) => {
            whatsappMessage += `${index + 1}. ${item.name} (x${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
        });
        whatsappMessage += `-------------------\n`;
        whatsappMessage += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
        whatsappMessage += `Frete: R$ ${shipping.toFixed(2).replace('.', ',')}\n`;
        whatsappMessage += `*Total do Pedido: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
        whatsappMessage += `Por favor, me ajude a finalizar a compra.`;
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappLink = `https://wa.me/${CONFIG.whatsappPhoneNumber}?text=${encodedMessage}`;
        window.open(whatsappLink, '_blank');
        localStorage.removeItem('cart');
        updateCartCountDisplays();
        setTimeout(() => {
            window.location.href = 'obrigado.html';
        }, 500);
    }

    // --- 6. Inicialização ---
    function initializeCart() {
        renderCart();
        if (DOM.cartItemsContainer) {
            DOM.cartItemsContainer.addEventListener('click', handleCartControlsClick);
        }
        if (DOM.checkoutWhatsappBtn) {
            DOM.checkoutWhatsappBtn.addEventListener('click', handleCheckoutWhatsapp);
        }
    }

    document.addEventListener('DOMContentLoaded', initializeCart);

})();

// --- 7. Função Global addToCart ---
function addToCart(itemToAdd) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = cart.findIndex(item => item.id === itemToAdd.id);
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({ ...itemToAdd, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    const cartCountHeader = document.querySelector('.cart-icon .cart-count');
    const cartCountMobile = document.querySelector('.mobile-menu .cart-count-mobile');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountHeader) cartCountHeader.textContent = totalItems;
    if (cartCountMobile) cartCountMobile.textContent = totalItems;
}
