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

// 2. Enhanced Cart Functionality (supports .add-cart-btn and .details-btn)
function initCart() {
    let cart = JSON.parse(localStorage.getItem('pizzaCart')) || [];
    
    // Legacy .add-cart-btn
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', addToCartHandler(btn));
    });
    
    // New .details-btn
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', addToCartHandler(btn));
    });
    
    function addToCartHandler(btn) {
        return () => {
            let name = btn.dataset.name;
            let priceStr = btn.dataset.price || btn.closest('.pizza-card')?.querySelector('.price')?.textContent || 'R$ 50';
            
            // Parse price from text like "R$ 52,00"
            let price = parseFloat(priceStr.replace(/[^\d,]/g, '').replace(',', '.'));
            if (!price) price = 50;
            
            if (!name) name = btn.closest('.pizza-card')?.querySelector('h3')?.textContent.trim() || 'Pizza';
            
            cart.push({name, price, qty: 1});
            localStorage.setItem('pizzaCart', JSON.stringify(cart));
            
            // Visual feedback
            const originalText = btn.textContent;
            btn.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
            btn.style.background = '#28a745';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 1500);
            
            showCartToast(cart.length);
        };
    }
    
    function showCartToast(count) {
        // Simple toast
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; background: #28a745; color: white; 
            padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 8px 24px rgba(40,167,69,0.4);
            z-index: 9999; font-weight: 600;
        `;
        toast.textContent = `🛒 Carrinho: ${count} item${count > 1 ? 's' : ''}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
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

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    initMenuTabs();
    initCart();
    initLoadMore(); // New
    initMultiStepForm();
    initEnhancedForms();
    
    initAdminNav();
    // initAdminIcon() removido
    
    // Throttled scroll
    window.addEventListener('scroll', throttle(() => {
        // Existing scroll handlers here if needed
    }, 100));
});

// Admin Icon + Modal - Direct Login to Panel
/* initAdminIcon() REMOVIDO - usa onclick direto no icon HTML de index.html */

