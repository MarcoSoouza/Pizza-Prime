// Mobile Navbar Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Fechar menu ao clicar em link ou logo
document.querySelectorAll('.nav-link, .logo-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(0, 0, 0, 0.98)';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
    }
});

// Active nav link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === current || link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observar seções
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Smooth scroll para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form validation e submit
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simples validação
        const name = document.getElementById('name').value.trim();
        const message = document.getElementById('message').value.trim();
        
        if (name && message) {
            // Simular envio
            alert('Mensagem enviada com sucesso! Em breve entraremos em contato.');
            this.reset();
        } else {
            alert('Por favor, preencha nome e mensagem.');
        }
    });
}

// Menu cards hover animation
document.querySelectorAll('.menu-item, .menu-card, .info-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Parallax effect no hero (se precisar de mais performance, remover)
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// ==================== ENHANCED FEATURES ====================

// 1. Menu Tabs Filtering
function initMenuTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const menuCards = document.querySelectorAll('.menu-card');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            
            // Update active tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter cards
            menuCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ==================== CART FUNCTIONALITY ====================

const CART_KEY = 'pizzaPrimeCart';

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
}

function addToCart(name, price) {
    const cart = getCart();
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    saveCart(cart);
}

function removeFromCart(name) {
    let cart = getCart().filter(item => item.name !== name);
    saveCart(cart);
}

function updateQty(name, delta) {
    const cart = getCart();
    const item = cart.find(i => i.name === name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(name);
        return;
    }
    saveCart(cart);
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem('pizzaCart'); // legacy cleanup
    updateCartUI();
}

function getCartTotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function formatPrice(price) {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function initCart() {
    // Clear legacy cart and start fresh
    localStorage.removeItem('pizzaCart');

    // Bind add buttons
    document.querySelectorAll('.add-cart-btn, .details-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            let name = btn.dataset.name;
            let priceStr = btn.dataset.price || btn.closest('.pizza-card')?.querySelector('.price')?.textContent || 'R$ 50';
            let price = parseFloat(priceStr.replace(/[^\d,]/g, '').replace(',', '.'));
            if (!price) price = 50;
            if (!name) name = btn.closest('.pizza-card, .menu-card')?.querySelector('h3')?.textContent.trim() || 'Produto';

            addToCart(name, price);

            // Visual feedback on button
            const originalText = btn.textContent;
            btn.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
            btn.style.background = '#28a745';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 1500);

            openCartSidebar();
        });
    });

    // Cart floating button
    const cartFab = document.getElementById('cart-fab');
    if (cartFab) {
        cartFab.addEventListener('click', openCartSidebar);
    }

    // Close sidebar
    const closeBtn = document.getElementById('cart-close');
    const overlay = document.getElementById('cart-overlay');
    if (closeBtn) closeBtn.addEventListener('click', closeCartSidebar);
    if (overlay) overlay.addEventListener('click', closeCartSidebar);

    // Clear cart
    const clearBtn = document.getElementById('cart-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Deseja limpar todos os itens do carrinho?')) {
                clearCart();
            }
        });
    }

    // Checkout via WhatsApp
    const checkoutBtn = document.getElementById('cart-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = getCart();
            if (cart.length === 0) {
                alert('Seu carrinho está vazio!');
                return;
            }
            let msg = '*🍕 Pedido Pizza Prime*%0A%0A';
            cart.forEach(item => {
                msg += `• ${item.name} x${item.qty} = ${formatPrice(item.price * item.qty)}%0A`;
            });
            msg += `%0A*Total: ${formatPrice(getCartTotal())}*%0A%0AAguardo confirmação!`;
            window.open(`https://wa.me/5511999999999?text=${msg}`, '_blank');
        });
    }

    updateCartUI();
}

function updateCartUI() {
    const cart = getCart();
    const list = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const countEl = document.getElementById('cart-count');
    const emptyEl = document.getElementById('cart-empty');

    if (countEl) countEl.textContent = getCartCount();

    if (!list) return;

    list.innerHTML = '';

    if (cart.length === 0) {
        if (emptyEl) emptyEl.style.display = 'flex';
    } else {
        if (emptyEl) emptyEl.style.display = 'none';
        cart.forEach(item => {
            const li = document.createElement('div');
            li.className = 'cart-item';
            li.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">${formatPrice(item.price)}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn minus" data-name="${item.name}">−</button>
                    <span class="qty-value">${item.qty}</span>
                    <button class="qty-btn plus" data-name="${item.name}">+</button>
                    <button class="cart-item-remove" data-name="${item.name}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            list.appendChild(li);
        });

        // Bind qty and remove buttons
        list.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', () => updateQty(btn.dataset.name, -1));
        });
        list.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', () => updateQty(btn.dataset.name, 1));
        });
        list.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(btn.dataset.name));
        });
    }

    if (totalEl) totalEl.textContent = formatPrice(getCartTotal());
}

function openCartSidebar() {
    document.getElementById('cart-sidebar')?.classList.add('open');
    document.getElementById('cart-overlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartSidebar() {
    document.getElementById('cart-sidebar')?.classList.remove('open');
    document.getElementById('cart-overlay')?.classList.remove('active');
    document.body.style.overflow = '';
}

// 3. Multi-step Reserva Form
function initMultiStepForm() {
    const form = document.getElementById('ultimateForm');
    if (!form) return;
    
    const steps = form.querySelectorAll('.form-step');
    const prevBtn = form.querySelector('.step-prev');
    const nextBtn = form.querySelector('.step-next');
    const submitBtn = form.querySelector('.step-submit');
    let currentStep = 0;
    
function showStep(step) {
        steps.forEach((s, i) => s.classList.toggle('active', i === step));
        prevBtn.classList.toggle('disabled', step === 0);
        nextBtn.style.display = step === steps.length - 1 ? 'none' : 'block';
        submitBtn.classList.remove('hidden');
        submitBtn.style.display = step === steps.length - 1 ? 'block' : 'none';
        const stepsIndicators = form.querySelectorAll('.step-indicator .step');
        stepsIndicators.forEach((s, i) => s.classList.toggle('active', i === step));
    }
    
    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            currentStep++;
            showStep(currentStep);
        }
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });
    
    function validateStep(step) {
        const inputs = steps[step].querySelectorAll('[required]');
        let valid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) valid = false;
        });
        return valid;
    }
    
    // Persist data
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('change', () => localStorage.setItem(`form-${input.id}`, input.value));
        const saved = localStorage.getItem(`form-${input.id}`);
        if (saved) input.value = saved;
    });
}

// 4. Enhanced Contact Form + Phone Mask
function initEnhancedForms() {
    // Phone mask
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value.substring(0, 15);
        });
    });
    
    // WhatsApp prefill
    document.querySelectorAll('.whatsapp').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const phone = '5511999999999';
            const message = encodeURIComponent('Olá! Gostaria de fazer um pedido na Pizza Prime.');
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        });
    });
    

    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const btn = this.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerHTML += ' <i class="fas fa-spinner fa-spin"></i>';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = btn.innerHTML.replace(' <i class="fas fa-spinner fa-spin"></i>', '');
                
                if (this.id === 'ultimateForm') {
                    alert('✅ RESERVA CONFIRMADA!\n\nNossa equipe WhatsApp entrará em contato em 5 minutos para finalizar.');
                    // WhatsApp summary
                    const phone = this.querySelector('input[type="tel"]').value.replace(/\D/g, '');
                    if (phone) {
                        const message = 'Reserva confirmada via site Pizza Prime!';
                        window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, '_blank');
                    }
                } else {
                    alert('Enviado com sucesso!');
                }
                this.reset();
            }, 2000);
        });
    });
}

// Throttle utility for perf
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Load More Functionality
function initLoadMore() {
    const loadBtn = document.getElementById('load-more');
    const cards = document.querySelectorAll('.pizza-card');
    if (!loadBtn || cards.length === 0) return;
    
    let visibleCount = 12; // Show first 12
    cards.forEach((card, index) => {
        if (index >= visibleCount) card.style.display = 'none';
    });
    
    loadBtn.addEventListener('click', () => {
        const hiddenCards = Array.from(cards).slice(visibleCount, visibleCount + 6);
        hiddenCards.forEach(card => {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease forwards';
        });
        
        visibleCount += 6;
        
        if (visibleCount >= cards.length) {
            loadBtn.style.display = 'none';
        }
    });
}

// Voice Hover - Announce pizza flavor and ingredients on hover
function initVoiceHover() {
    if (!('speechSynthesis' in window)) return; // Skip if not supported

    const cards = document.querySelectorAll('.pizza-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const name = card.querySelector('h3')?.textContent.trim();
            const ingredients = card.querySelector('p')?.textContent.trim();
            if (!name) return;

            window.speechSynthesis.cancel(); // Stop any ongoing speech

            const text = `Pizza ${name}. Ingredientes: ${ingredients || 'Informação não disponível'}.`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        });

        card.addEventListener('mouseleave', () => {
            window.speechSynthesis.cancel();
        });
    });
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    initMenuTabs();
    initCart();
    initLoadMore(); // New
    initMultiStepForm();
    initEnhancedForms();
    initVoiceHover(); // New
    
    initAdminNav();
    // initAdminIcon() removido
    
    // Throttled scroll
    window.addEventListener('scroll', throttle(() => {
        // Existing scroll handlers here if needed
    }, 100));
});

// Admin Icon + Modal - Direct Login to Panel
/* initAdminIcon() REMOVIDO - usa onclick direto no icon HTML de index.html */

