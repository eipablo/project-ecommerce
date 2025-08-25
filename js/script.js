document.addEventListener('DOMContentLoaded', () => {

    // --- Dados de produtos ---
    const products = [
        {
            id: '1',
            name: 'Camiseta Isolated',
            price: 89.90,
            oldPrice: 109.90,
            description: 'Camiseta de alta qualidade com estampa gráfica inspirada na arte de rua. Perfeita para um look despojado e autêntico.',
            images: [
                'img/placeholder2.jpg',
                'img/placeholder2.jpg',
                'img/placeholder2.jpg'
            ],
            sizes: ['P', 'M', 'G', 'GG'],
            badge: 'Promoção'
        },
        {
            id: '2',
            name: 'Camiseta Beuty',
            price: 99.90,
            description: 'Design futurista e tecido confortável para quem vive a pulsação da cidade. Edição limitada!',
            images: [
                'img/placeholder3.jpg',
                'img/placeholder3.jpg',
                'img/placeholder3.jpg'
            ],
            sizes: ['P', 'M', 'G', 'GG']
        },
        {
            id: '3',
            name: 'Camiseta Discover',
            price: 79.90,
            description: 'Estampa vibrante inspirada nos murais urbanos, trazendo a arte da rua para o seu guarda-roupa.',
            images: [
                'img/placeholder4.jpg',
                'img/placeholder4.jpg',
                'img/placeholder4.jpg'
            ],
            sizes: ['P', 'M', 'G', 'GG'],
            badge: 'Novo'
        },
        {
            id: '4',
            name: 'Camiseta Society',
            price: 69.90,
            description: 'Minimalista e elegante, perfeita para combinar com qualquer peça do seu guarda-roupa streetwear.',
            images: [
                'img/placeholder5.jpg',
                'img/placeholder5.jpg',
                'img/placeholder5.jpg'
            ],
            sizes: ['P', 'M', 'G', 'GG']
        },
        {
            id: '5',
            name: 'Camiseta OutDated',
            price: 85.00,
            oldPrice: 95.00,
            description: 'Um clássico repaginado com a atitude do streetwear. Conforto e estilo em uma só peça.',
            images: [
                'img/placeholder6.jpg',
                'img/placeholder6.jpg',
                'img/placeholder6.jpg'
            ],
            sizes: ['P', 'M', 'G', 'GG'],
            badge: 'Destaque'
        },
        {
            id: '6',
            name: 'Camiseta Just Vibin',
            price: 110.00,
            description: 'Para os aventureiros urbanos, com estampa que remete à exploração da cidade e suas nuances.',
            images: [
                'img/placeholder7.jpg',
                'img/placeholder7.jpg',
                'img/placeholder7.jpg'
            ],
            sizes: ['P', 'M', 'G', 'GG']
        },
    ];

    // --- Funções de Ajuda ---
    function formatPrice(price) {
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // --- Carrinho de Compras ---
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => el.textContent = totalItems);
        document.querySelectorAll('.cart-count-mobile').forEach(el => el.textContent = totalItems);
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    function addToCart(productId, selectedSize, quantity) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const existingItemIndex = cart.findIndex(item => item.id === productId && item.size === selectedSize);
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0],
                size: selectedSize,
                quantity: quantity
            });
        }
        saveCart();
    }

    function removeFromCart(productId, size) {
        cart = cart.filter(item => !(item.id === productId && item.size === size));
        saveCart();
        renderCartPage();
    }

    function updateCartItemQuantity(productId, size, newQuantity) {
        const item = cart.find(item => item.id === productId && item.size === size);
        if (item) {
            item.quantity = newQuantity;
            if (item.quantity <= 0) {
                removeFromCart(productId, size);
            }
            saveCart();
            renderCartPage();
        }
    }

    // --- Renderização de Produtos ---
    function renderProductCard(product) {
        const priceHtml = product.oldPrice ?
            `<span class="old-price">${formatPrice(product.oldPrice)}</span><span class="new-price">${formatPrice(product.price)}</span>` :
            `<span class="new-price">${formatPrice(product.price)}</span>`;
        return `
            <div class="product-card">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                <a href="produto.html?id=${product.id}">
                    <img src="${product.images[0]}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-price">${priceHtml}</p>
                        <button class="btn add-to-cart-quick" data-product-id="${product.id}">Ver Detalhes</button>
                    </div>
                </a>
            </div>
        `;
    }

    function renderFeaturedProducts() {
        const featuredProductsGrid = document.getElementById('featured-products-grid');
        if (featuredProductsGrid) {
            const featured = products.slice(0, 3);
            featuredProductsGrid.innerHTML = featured.map(renderProductCard).join('');
        }
    }

    function renderAllProducts() {
        const allProductsGrid = document.getElementById('all-products-grid');
        if (allProductsGrid) {
            allProductsGrid.innerHTML = products.map(renderProductCard).join('');
        }
    }

    // --- Páginas Específicas ---
    function renderProductPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const product = products.find(p => p.id === productId);

        if (!product) {
            window.location.href = 'catalogo.html';
            return;
        }

        document.getElementById('product-page-title').textContent = `${product.name} - StreetStyle`;
        document.getElementById('main-product-image').src = product.images[0];
        document.getElementById('main-product-image').alt = product.name;
        document.getElementById('product-title').textContent = product.name;
        document.getElementById('product-price').textContent = formatPrice(product.price);
        document.getElementById('product-description').textContent = product.description;

        const thumbnailContainer = document.getElementById('thumbnail-container');
        if (thumbnailContainer) {
            thumbnailContainer.innerHTML = product.images.map(imgSrc => `
                <img src="${imgSrc}" alt="Miniatura do Produto" class="thumbnail" data-full-image="${imgSrc}">
            `).join('');
            thumbnailContainer.querySelectorAll('.thumbnail').forEach(thumbnail => {
                thumbnail.addEventListener('click', () => {
                    document.getElementById('main-product-image').src = thumbnail.dataset.fullImage;
                });
            });
        }

        const sizeOptionsContainer = document.getElementById('size-options-container');
        if (sizeOptionsContainer) {
            sizeOptionsContainer.innerHTML = product.sizes.map(size => `
                <span class="size-option" data-size="${size}">${size}</span>
            `).join('');
            let selectedSize = null;
            sizeOptionsContainer.querySelectorAll('.size-option').forEach(option => {
                option.addEventListener('click', () => {
                    sizeOptionsContainer.querySelectorAll('.size-option').forEach(s => s.classList.remove('selected'));
                    option.classList.add('selected');
                    selectedSize = option.dataset.size;
                });
            });

            const quantityInput = document.getElementById('product-quantity');
            document.getElementById('decrease-quantity')?.addEventListener('click', () => {
                let currentQuantity = parseInt(quantityInput.value);
                if (currentQuantity > 1) {
                    quantityInput.value = currentQuantity - 1;
                }
            });
            document.getElementById('increase-quantity')?.addEventListener('click', () => {
                let currentQuantity = parseInt(quantityInput.value);
                quantityInput.value = currentQuantity + 1;
            });

            document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
                if (!selectedSize) {
                    alert('Por favor, selecione um tamanho!');
                    return;
                }
                const quantity = parseInt(quantityInput.value);
                addToCart(productId, selectedSize, quantity);
                const messageEl = document.getElementById('add-to-cart-message');
                if (messageEl) {
                    messageEl.textContent = `${quantity}x "${product.name}" (Tamanho: ${selectedSize}) adicionado ao carrinho!`;
                    messageEl.style.display = 'block';
                    setTimeout(() => {
                        messageEl.style.display = 'none';
                        messageEl.textContent = '';
                    }, 3000);
                }
            });
        }

        const mainImage = document.getElementById('main-product-image');
        const zoomOverlay = document.getElementById('zoom-overlay');
        const zoomedImage = document.getElementById('zoomed-image');
        const closeZoom = document.getElementById('close-zoom');

        if (mainImage && zoomOverlay && zoomedImage && closeZoom) {
            mainImage.addEventListener('click', () => {
                zoomedImage.src = mainImage.src;
                zoomOverlay.classList.add('active');
            });
            closeZoom.addEventListener('click', () => {
                zoomOverlay.classList.remove('active');
            });
            zoomOverlay.addEventListener('click', (e) => {
                if (e.target === zoomOverlay) {
                    zoomOverlay.classList.remove('active');
                }
            });
        }
    }

    function renderCartPage() {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartSubtotalEl = document.getElementById('cart-subtotal');
        const cartShippingEl = document.getElementById('cart-shipping');
        const cartTotalEl = document.getElementById('cart-total');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const checkoutBtn = document.getElementById('checkout-whatsapp-btn');

        if (!cartItemsContainer || !cartSubtotalEl || !cartShippingEl || !cartTotalEl || !emptyCartMessage || !checkoutBtn) {
            return;
        }

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '';
            emptyCartMessage.style.display = 'block';
            cartSubtotalEl.textContent = formatPrice(0);
            cartShippingEl.textContent = formatPrice(0);
            cartTotalEl.textContent = formatPrice(0);
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.5';
            checkoutBtn.style.cursor = 'not-allowed';
            return;
        }

        emptyCartMessage.style.display = 'none';
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.cursor = 'pointer';

        let subtotal = 0;
        cartItemsContainer.innerHTML = cart.map(item => {
            subtotal += item.price * item.quantity;
            return `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>Tamanho: ${item.size}</p>
                        <p class="cart-item-price">${formatPrice(item.price)}</p>
                        <div class="quantity-selector" data-product-id="${item.id}" data-product-size="${item.size}">
                            <span class="quantity-btn decrease-cart-quantity">-</span>
                            <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                            <span class="quantity-btn increase-cart-quantity">+</span>
                        </div>
                    </div>
                    <span class="cart-item-remove" data-product-id="${item.id}" data-product-size="${item.size}">
                        <i class="fas fa-times"></i>
                    </span>
                </div>
            `;
        }).join('');

        cartItemsContainer.querySelectorAll('.decrease-cart-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.quantity-selector').dataset.productId;
                const productSize = e.target.closest('.quantity-selector').dataset.productSize;
                const quantityInput = e.target.nextElementSibling;
                let newQuantity = parseInt(quantityInput.value) - 1;
                updateCartItemQuantity(productId, productSize, newQuantity);
            });
        });

        cartItemsContainer.querySelectorAll('.increase-cart-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.quantity-selector').dataset.productId;
                const productSize = e.target.closest('.quantity-selector').dataset.productSize;
                const quantityInput = e.target.previousElementSibling;
                let newQuantity = parseInt(quantityInput.value) + 1;
                updateCartItemQuantity(productId, productSize, newQuantity);
            });
        });

        cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                const productSize = e.currentTarget.dataset.productSize;
                removeFromCart(productId, productSize);
            });
        });

        const shipping = subtotal > 0 ? 20.00 : 0;
        const total = subtotal + shipping;

        cartSubtotalEl.textContent = formatPrice(subtotal);
        cartShippingEl.textContent = formatPrice(shipping);
        cartTotalEl.textContent = formatPrice(total);

        checkoutBtn.addEventListener('click', () => {
            let message = "Olá! Gostaria de fazer um pedido na StreetStyle:\n\n";
            cart.forEach((item, index) => {
                message += `${index + 1}. ${item.name} (Tamanho: ${item.size}) - Quantidade: ${item.quantity} - ${formatPrice(item.price * item.quantity)}\n`;
            });
            message += `\nSubtotal: ${formatPrice(subtotal)}`;
            message += `\nFrete: ${formatPrice(shipping)}`;
            message += `\nTotal: ${formatPrice(total)}`;
            message += `\n\nAguardamos seu contato para finalizar a compra!`;

            const whatsappNumber = '5519994711585';
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`, '_blank');

            cart = [];
            saveCart();
            setTimeout(() => {
                window.location.href = 'obrigado.html';
            }, 500);
        });
    }

    // --- Inicialização do Menu Mobile (Hambúrguer) ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    document.addEventListener('click', (event) => {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!mobileMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                mobileMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
    });

    if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // --- Lógica de Animações ao Rolar a Página (Scroll Reveal) ---
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-from-bottom, .slide-in-from-left, .slide-in-from-right, .scale-in-center');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // --- Renderiza o conteúdo com base na página atual ---
    updateCartCount();
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'index.html' || currentPage === '') {
        renderFeaturedProducts();
    } else if (currentPage === 'catalogo.html') {
        renderAllProducts();
    } else if (currentPage === 'produto.html') {
        renderProductPage();
    } else if (currentPage === 'carrinho.html') {
        renderCartPage();
    }
});

// --- Lógica do Formulário de Contato ---
const contactForm = document.querySelector('.form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = contactForm.querySelector('[name="name"]').value.trim();
        const email = contactForm.querySelector('[name="email"]').value.trim();
        const message = contactForm.querySelector('[name="message"]').value.trim();
        let feedback = document.getElementById('contact-form-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'contact-form-feedback';
            feedback.style.display = 'none';
            contactForm.appendChild(feedback);
        }
        feedback.style.display = 'block';
        if (!name || !email || !message) {
            if (feedback) {
                feedback.textContent = 'Por favor, preencha todos os campos.';
                feedback.style.color = 'red';
                feedback.style.display = 'block';
            }
            return;
        }
        setTimeout(() => {
            if (feedback) {
                feedback.textContent = 'Mensagem enviada com sucesso! Obrigado pelo contato.';
                feedback.style.color = 'green';
                feedback.style.display = 'block';
            }
            contactForm.reset();
        }, 800);
    });
}
