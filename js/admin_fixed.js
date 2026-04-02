// Pizza Prime Admin Panel - FIXED Navigation
// Direct access, no login, full functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== PIZZA PRIME ADMIN LOADED ===');

    // Elements
    const logoutBtn = document.getElementById('logoutBtn');
    const sections = document.querySelectorAll('.admin-section');
    const navLinks = document.querySelectorAll('.nav-item');
    console.log('Sections found:', sections.length);
    console.log('Nav links found:', navLinks.length);

    // Mock Data
    const mockData = {
        kpis: { revenue: 47892.43, orders: 156, profit: 18745.20, lowstock: 3 },
        stock: [
            { name: 'Margherita Premium', current: 12, min: 20, status: 'low' },
            { name: 'Calabresa Especial', current: 45, min: 20, status: 'ok' },
            { name: 'Frango BBQ', current: 28, min: 15, status: 'ok' },
            { name: 'Quatro Queijos', current: 33, min: 25, status: 'ok' },
            { name: 'Chocolate Morango', current: 18, min: 10, status: 'ok' },
            { name: 'Prime Especial', current: 22, min: 20, status: 'low' }
        ],
        recentOrders: [
            { id: '#PP001', client: 'João Silva', items: 2, total: 128.90, status: 'entregue', date: '2024-10-15 19:32' },
            { id: '#PP002', client: 'Maria Oliveira', items: 3, total: 189.70, status: 'preparando', date: '2024-10-15 20:15' },
            { id: '#PP003', client: 'Pedro Santos', items: 1, total: 59.90, status: 'entregue', date: '2024-10-15 18:45' }
        ],
        salesTrend: [3200, 4500, 3800, 5200, 6100, 5800, 7200],
        topProducts: { labels: ['Margherita', 'Calabresa', 'Frango BBQ', 'Quatro Queijos', 'Chocolate'], data: [45, 38, 25, 22, 18] }
    };

    let charts = {};

    // Force show panel
    document.querySelector('.admin-layout').style.display = 'flex';
    document.querySelector('.admin-main').style.display = 'block';

    // Navigation - FIXED
    navLinks.forEach((link, index) => {
        console.log('Adding click handler to nav link', index, link.href);
        link.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('NAV CLICKED:', this.href);
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            console.log('Target ID:', targetId, 'Section:', !!targetSection);
            
            if (targetSection) {
                // Hide all sections
                sections.forEach(s => {
                    s.style.display = 'none';
                    s.classList.remove('active');
                });
                
                // Show target
                targetSection.style.display = 'block';
                targetSection.classList.add('active');
                
                // Update nav active
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                console.log('Switched to:', targetId);
            }
        });
    });

    // Logout handler removed - now direct <a> link in HTML

    // Update KPIs
    function updateKPIs() {
        document.querySelectorAll('[data-metric]').forEach(kpi => {
            const metric = kpi.dataset.metric;
            let value = mockData.kpis[metric];
            if (metric === 'revenue' || metric === 'profit') {
                value += (Math.random() - 0.5) * 1000;
                kpi.innerHTML = 'R$ ' + value.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '<small>,00</small>';
            } else {
                value += Math.floor(Math.random() * 3) - 1;
                kpi.textContent = Math.max(0, value);
            }
        });
    }

    // Populate tables
    function populateTables() {
        // Stock
        const stockTbody = document.querySelector('#estoque tbody');
        if (stockTbody) {
            stockTbody.innerHTML = mockData.stock.map(item => `
                <tr class="${item.status}">
                    <td>${item.name}</td>
                    <td>${item.current}</td>
                    <td>${item.min}</td>
                    <td><span class="status ${item.status}">${item.status === 'low' ? '🔴 Baixo' : '🟢 OK'}</span></td>
                    <td><button class="btn-small ${item.status === 'low' ? 'reorder' : ''}">${item.status === 'low' ? 'Reabastecer' : 'Editar'}</button></td>
                </tr>
            `).join('');
        }

        // Orders
        const ordersTbody = document.querySelector('#pedidos tbody');
        if (ordersTbody) {
            ordersTbody.innerHTML = mockData.recentOrders.map(order => `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.client}</td>
                    <td>${order.items} pizzas</td>
                    <td>R$ ${order.total}</td>
                    <td><span class="status ${order.status}">${order.status.toUpperCase()}</span></td>
                    <td>${order.date}</td>
                </tr>
            `).join('');
        }
    }

    // Charts
    function initCharts() {
        if (typeof Chart === 'undefined') return console.warn('Chart.js not loaded');
        
        // Orders Chart
        const ordersCtx = document.getElementById('ordersChart')?.getContext('2d');
        if (ordersCtx) charts.orders = new Chart(ordersCtx, {
            type: 'doughnut',
            data: { labels: ['Entregue', 'Preparando', 'Pendente'], datasets: [{ data: [120, 25, 11], backgroundColor: ['#28a745', '#ffc107', '#dc3545'] }] },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });

        // Sales Chart
        const salesCtx = document.getElementById('salesChart')?.getContext('2d');
        if (salesCtx) charts.sales = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{ label: 'Vendas (R$)', data: mockData.salesTrend, borderColor: '#ff4757', backgroundColor: 'rgba(255,71,87,0.1)', tension: 0.4, fill: true }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });

        // Products Chart
        const productsCtx = document.getElementById('productsChart')?.getContext('2d');
        if (productsCtx) charts.products = new Chart(productsCtx, {
            type: 'bar',
            data: { labels: mockData.topProducts.labels, datasets: [{ label: '% Vendas', data: mockData.topProducts.data, backgroundColor: '#ff4757' }] },
            options: { responsive: true, scales: { y: { beginAtZero: true, max: 50 } } }
        });
    }

    // Init everything
    updateKPIs();
    populateTables();
    setTimeout(initCharts, 500);

    // Real-time
    setInterval(updateKPIs, 5000);

    // Button actions
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('reorder')) alert('🛒 Reabastecimento enviado!');
        if (e.target.classList.contains('btn-small') && !e.target.classList.contains('reorder')) alert('✏️ Edição iniciada!');
    });

    console.log('=== ADMIN READY ===');
});

