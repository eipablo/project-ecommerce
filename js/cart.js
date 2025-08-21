(function() { // Início do IIFE para encapsular o código
    // --- 1. Configurações e Seletores DOM ---
    const DOM = {
        cartItemsContainer: document.getElementById('cart-items-container'),
        emptyCartSection: document.getElementById('empty-cart-section'),
        cartContentSection: document.getElementById('cart-content-section'),
        cartSubtotalSpan: document.getElementById('cart-subtotal'),
        cartShippingSpan: document.getElementById('cart-shipping'),
        cartTotalSpan: document.getElementById('cart-total'),
        cartCountHeader: document.querySelector('.cart-icon .cart-count'), // Contador do carrinho na header (desktop)
        cartCountMobile: document.querySelector('.mobile-menu .cart-count-mobile'), // Contador do carrinho na header (mobile)
        checkoutWhatsappBtn: document.getElementById('checkout-whatsapp-btn')
    };

    const CONFIG = {
        whatsappPhoneNumber: '5511999998888', // <-- SEU NÚMERO DE WHATSAPP (com DDI e DDD)
        shippingThreshold: 300, // Frete grátis acima deste valor
        defaultShippingCost: 20 // Custo de frete padrão
    };

    // --- 2. Funções Utilitárias e de Gerenciamento de Dados ---

    /**
     * Recupera os itens do carrinho do localStorage.
     * @returns {Array} Array de objetos de itens do carrinho.
     */
    function getCartItems() {
        try {
            const cart = localStorage.getItem('cart');
            return cart ? JSON.parse(cart) : [];
        } catch (e) {
            console.error('Erro ao ler o carrinho do localStorage:', e);
            return []; // Retorna um carrinho vazio em caso de erro
        }
    }

    /**
     * Salva os itens do carrinho no localStorage.
     * @param {Array} cart - O array de itens do carrinho a ser salvo.
     */
    function saveCartItems(cart) {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCountDisplays(); // Atualiza contadores na header após salvar
        } catch (e) {
            console.error('Erro ao salvar o carrinho no localStorage:', e);
            // Mensagem de erro para o usuário pode ser adicionada aqui
        }
    }

    /**
     * Calcula o subtotal, custo de envio e total do carrinho.
     * @param {Array} cart - O array de itens do carrinho.
     * @returns {{subtotal: number, shipping: number, total: number}} Os totais calculados.
     */
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

    /**
     * Atualiza os contadores de itens no ícone do carrinho na header.
     */
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

    /**
     * Renderiza o conteúdo do carrinho na página, exibindo/escondendo seções conforme necessário.
     */
    function renderCart() {
        const cart = getCartItems();
        DOM.cartItemsContainer.innerHTML = ''; // Limpa o container antes de renderizar

        if (cart.length === 0) {
            // Se o carrinho estiver vazio
            if (DOM.emptyCartSection) DOM.emptyCartSection.style.display = 'block';
            if (DOM.cartContentSection) DOM.cartContentSection.style.display = 'none';
        } else {
            // Se houver itens no carrinho
            if (DOM.emptyCartSection) DOM.emptyCartSection.style.display = 'none';
            if (DOM.cartContentSection) DOM.cartContentSection.style.display = 'block';

            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.dataset.itemId = item.id; // Para fácil acesso via JS

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

            // Atualiza os totais exibidos
            const { subtotal, shipping, total } = calculateCartTotals(cart);
            if (DOM.cartSubtotalSpan) DOM.cartSubtotalSpan.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
            if (DOM.cartShippingSpan) DOM.cartShippingSpan.textContent = `R$ ${shipping.toFixed(2).replace('.', ',')}`;
            if (DOM.cartTotalSpan) DOM.cartTotalSpan.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        }
        updateCartCountDisplays(); // Garante que contadores estejam sempre atualizados
    }

    // --- 4. Funções de Ação do Carrinho ---

    /**
     * Atualiza a quantidade de um item no carrinho.
     * @param {string} itemId - O ID do item a ser atualizado.
     * @param {number} change - O valor da mudança (+1 para aumentar, -1 para diminuir).
     */
    function updateQuantity(itemId, change) {
        let cart = getCartItems();
        const itemIndex = cart.findIndex(item => item.id === itemId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;

            if (cart[itemIndex].quantity <= 0) {
                // Se a quantidade for 0 ou menos, remove o item
                removeFromCart(itemId);
                return; // Sai da função para evitar re-renderização dupla
            }
            saveCartItems(cart);
            renderCart(); // Re-renderiza o carrinho para refletir a mudança
        }
    }

    /**
     * Remove um item completamente do carrinho.
     * @param {string} itemId - O ID do item a ser removido.
     */
    function removeFromCart(itemId) {
        let cart = getCartItems();
        cart = cart.filter(item => item.id !== itemId); // Filtra o item a ser removido
        saveCartItems(cart);
        renderCart(); // Re-renderiza o carrinho
    }

    // --- 5. Manipuladores de Eventos ---

    /**
     * Manipula cliques nos botões de controle de quantidade e remover item.
     * Usa delegação de eventos para eficiência.
     * @param {Event} event - O objeto do evento de clique.
     */
    function handleCartControlsClick(event) {
        const target = event.target;
        // Tenta pegar o itemId do próprio elemento clicado ou do botão pai se o clique for no ícone
        const button = target.closest('button[data-item-id]');
        if (!button) return; // Não é um botão de controle de item

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

    /**
     * Manipula o clique no botão de finalizar pedido via WhatsApp.
     */
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

        // Abre o WhatsApp em uma nova aba
        window.open(whatsappLink, '_blank');

        // Limpa o carrinho e redireciona o usuário para a página de agradecimento
        localStorage.removeItem('cart');
        updateCartCountDisplays(); // Atualiza o contador na header para 0

        // Adiciona um pequeno delay para dar tempo do WhatsApp abrir antes de redirecionar
        setTimeout(() => {
            window.location.href = 'obrigado.html';
        }, 500);
    }

    // --- 6. Inicialização ---

    /**
     * Função de inicialização do módulo do carrinho.
     */
    function initializeCart() {
        // Renderiza o carrinho ao carregar a página
        renderCart();

        // Adiciona event listeners
        if (DOM.cartItemsContainer) {
            DOM.cartItemsContainer.addEventListener('click', handleCartControlsClick);
        }
        if (DOM.checkoutWhatsappBtn) {
            DOM.checkoutWhatsappBtn.addEventListener('click', handleCheckoutWhatsapp);
        }
    }

    // Inicia a lógica do carrinho quando o DOM estiver completamente carregado
    document.addEventListener('DOMContentLoaded', initializeCart);

})(); // Fim do IIFE

// --- 7. Função Global `addToCart` (para uso em outras páginas, como catálogo.html) ---
// Esta função DEVE ser colocada em um script que seja linkado em TODAS as páginas
// onde você tem botões "Adicionar ao Carrinho" (ex: js/script.js ou um novo js/global.js)
// Ela não precisa estar dentro do IIFE acima, pois precisa ser acessível globalmente.

/**
 * Adiciona um item ao carrinho ou aumenta sua quantidade se já existir.
 * Esta função deve ser chamada por botões "Adicionar ao Carrinho" em outras páginas.
 * @param {object} itemToAdd - O objeto do item a ser adicionado (deve conter id, name, price, image).
 */
function addToCart(itemToAdd) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = cart.findIndex(item => item.id === itemToAdd.id);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({ ...itemToAdd, quantity: 1 }); // Adiciona o item com quantidade 1
    }
    localStorage.setItem('cart', JSON.stringify(cart));

    // Opcional: feedback visual para o usuário (ex: um toast, um alert sutil)
    // alert(`${itemToAdd.name} adicionado ao carrinho!`);

    // Atualiza os contadores de itens na header (se existirem na página atual)
    const cartCountHeader = document.querySelector('.cart-icon .cart-count');
    const cartCountMobile = document.querySelector('.mobile-menu .cart-count-mobile');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cartCountHeader) cartCountHeader.textContent = totalItems;
    if (cartCountMobile) cartCountMobile.textContent = totalItems;
}