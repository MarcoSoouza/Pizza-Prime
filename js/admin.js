// Admin Dashboard JS | Pizza Prime - Professional Panel
// Password: 'admin123' | Mock Data + Chart.js + Real-time

// console.log('admin.js starting...');
document.addEventListener('DOMContentLoaded', function() {
    // console.log('DOM fully loaded');
    // Check if already logged in (fix robusto)
    // Direct access - no login check needed

    // Elements
    const logoutBtn = document.getElementById('logoutBtn');
    const sections = document.querySelectorAll('.admin-section');
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-item');

    // Mock Data
    let mockData = {
        kpis: {
            revenue: 47892.43,
            orders: 156,
            profit: 18745.20,
            lowstock: 3
        },
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
            // More populated dynamically
        ],
        salesTrend: [3200, 4500, 3800, 5200, 6100, 5800, 7200], // Last 7 days
        topProducts: {
            labels: ['Margherita', 'Calabresa', 'Frango BBQ', 'Quatro Queijos', 'Chocolate'],
            data: [45, 38, 25, 22, 18]
        },
        reservas: [
            { id: '#R001', cliente: 'Ana Silva', mesa: 'Mesa 5', datahora: '2024-10-20 19:00', pessoas: 4, status: 'pendente' },
            { id: '#R002', cliente: 'Carlos Lima', mesa: 'VIP 12', datahora: '2024-10-20 21:00', pessoas: 8, status: 'confirmada' },
            { id: '#R003', cliente: 'Mariana Costa', mesa: 'Mesa 1', datahora: '2024-10-21 20:30', pessoas: 2, status: 'pendente' },
            { id: '#R004', cliente: 'Lucas Santos', mesa: 'Mesa 8', datahora: '2024-10-20 18:30', pessoas: 6, status: 'cancelada' },
            { id: '#R005', cliente: 'Juliana Oliveira', mesa: 'Varanda 15', datahora: 'Hoje 19:30', pessoas: 4, status: 'confirmada' }
        ]
    };

    // Charts
    let ordersChart, salesChart, productsChart;

    // NO LOGIN - direct access

    // Init Dashboard - Direct access (no login needed)
    function initDashboard() {
        console.log('Initializing dashboard...');
        document.querySelector('.admin-layout').style.display = 'flex';
        document.querySelector('.admin-main').style.display = 'block';
        updateKPIs();
        populateTables();
        startRealTime();
        setTimeout(() => initCharts(), 500);
    }

    // Logout (simplified)
    function hideDashboard() {
        localStorage.removeItem('pizzaAdminLoggedIn');
        document.querySelector('.admin-layout').style.display = 'none';
        if (ordersChart) ordersChart.destroy();
        if (salesChart) salesChart.destroy();
        if (productsChart) productsChart.destroy();
    }

    // logoutBtn.addEventListener('click', hideDashboard); // Removed - now direct link

    // Initialize on load
    initDashboard();

    // Nav Sections

            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (!targetSection) {
                console.error('Section not found:', targetId);
                return;
            }

            // Update active nav
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all sections first (clear inline styles)
            sections.forEach(s => {
                s.style.display = 'none';
                s.classList.remove('active');
            });
            
            // Show target section
            targetSection.style.display = 'block';
            targetSection.classList.add('active');
        });
    });

    // Auto-show dashboard if no active section (fallback)
    if (sections.length > 0) {
        sections.forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        const firstSection = sections[0];
        firstSection.style.display = 'block';
        firstSection.classList.add('active');
    }

    // Charts Init
    function initCharts() {
        // Orders Status Doughnut
        const ordersCtx = document.getElementById('ordersChart')?.getContext('2d');
        if (ordersCtx) {
            ordersChart = new Chart(ordersCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Entregue', 'Preparando', 'Pendente'],
                    datasets: [{
                        data: [120, 25, 11],
                        backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }

        // Sales Line
        const salesCtx = document.getElementById('salesChart')?.getContext('2d');
        if (salesCtx) {
            salesChart = new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                    datasets: [{
                        label: 'Vendas (R$)',
                        data: mockData.salesTrend,
                        borderColor: '#ff4757',
                        backgroundColor: 'rgba(255,71,87,0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true } } }
            });
        }

        // Top Products Bar
        const productsCtx = document.getElementById('productsChart')?.getContext('2d');
        if (productsCtx) {
            productsChart = new Chart(productsCtx, {
                type: 'bar',
                data: {
                    labels: mockData.topProducts.labels,
                    datasets: [{
                        label: '% Vendas',
                        data: mockData.topProducts.data,
                        backgroundColor: '#ff4757'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true, max: 50 }
                    }
                }
            });
        }
    }

    // Update KPIs (Randomize for demo)
    function updateKPIs() {
        const kpis = document.querySelectorAll('[data-metric]');
        kpis.forEach(kpi => {
            const metric = kpi.dataset.metric;
            let value;
            
            if (metric === 'revenue' || metric === 'profit') {
                value = mockData.kpis[metric] + (Math.random() - 0.5) * 1000;
                kpi.innerHTML = 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '<small>,00</small>';
            } else if (metric === 'occupancy') {
                kpi.textContent = Math.floor(Math.random() * 30 + 60) + '%';
            } else {
                value = mockData.kpis[metric] + Math.floor(Math.random() * 3) - 1;
                kpi.textContent = Math.max(0, value);
            }
        });
        kpis.forEach(kpi => {
            const metric = kpi.dataset.metric;
            let value;
            
            if (metric === 'revenue' || metric === 'profit') {
                value = mockData.kpis[metric] + (Math.random() - 0.5) * 1000;
                kpi.innerHTML = 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '<small>,00</small>';
            } else if (metric === 'occupancy') {
                kpi.textContent = Math.floor(Math.random() * 30 + 60) + '%';
            } else {
                value = mockData.kpis[metric] + Math.floor(Math.random() * 3) - 1;
                kpi.textContent = Math.max(0, value);
            }
        });
    }

    // Populate Tables
    function populateTables() {
        // Stock Table
        const stockTbody = document.querySelector('#estoque tbody');
        stockTbody.innerHTML = mockData.stock.map(item => `
            <tr class="${item.status}">
                <td>${item.name}</td>
                <td>${item.current}</td>
                <td>${item.min}</td>
                <td><span class="status ${item.status}">${item.status === 'low' ? '🔴 Baixo' : '🟢 OK'}</span></td>
                <td><button class="btn-small ${item.status === 'low' ? 'reorder' : ''}">${item.status === 'low' ? 'Reabastecer' : 'Editar'}</button></td>
            </tr>
        `).join('');

        // Reservas Table
        const reservasTbody = document.querySelector('#reserva .reserva-table tbody');
        if (reservasTbody) {
            reservasTbody.innerHTML = mockData.reservas.map(reserva => `
                <tr>
                    <td>${reserva.id}</td>
                    <td>${reserva.cliente}</td>
                    <td>${reserva.mesa}</td>
                    <td>${reserva.datahora}</td>
                    <td>${reserva.pessoas}</td>
                    <td><span class="status ${reserva.status}">${reserva.status.toUpperCase()}</span></td>
                    <td>
                        <button class="btn-small btn-confirm" ${reserva.status !== 'pendente' ? 'style="display: none;"' : ''}>Confirmar</button>
                        <button class="btn-small btn-cancel ml-2">Cancelar</button>
                    </td>
                </tr>
            `).join('');
        }

        // Orders Table
        const ordersTbody = document.querySelector('#pedidos tbody');
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

    // Real-time Refresh
    let refreshInterval;
    function startRealTime() {
        refreshInterval = setInterval(() => {
            updateKPIs();
            // Simulate stock change
            mockData.stock[0].current = Math.max(0, mockData.stock[0].current - 1);
            populateTables();
        }, 5000);
    }

    // Actions
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('reorder')) {
            alert('🛒 Pedido de reabastecimento enviado! (Simulado)');
        }
        if (e.target.classList.contains('btn-small') && !e.target.closest('.reserva-table')) {
            alert('✏️ Edição iniciada (demo)');
        }
        
        // Reservas actions
        if (e.target.classList.contains('btn-confirm')) {
            const statusEl = e.target.closest('tr').querySelector('.status');
            statusEl.textContent = 'CONFIRMADA';
            statusEl.className = 'status confirmed';
            e.target.style.display = 'none';
            alert('✅ Reserva confirmada!');
        }
        if (e.target.classList.contains('btn-cancel')) {
            if (confirm('Cancelar reserva?')) {
                const statusEl = e.target.closest('tr').querySelector('.status');
                statusEl.textContent = 'CANCELADA';
                statusEl.className = 'status canceled';
                alert('❌ Reserva cancelada.');
            }
        }
        
        // Update mesa
        if (e.target.id === 'update-mesa') {
            const mesa = document.getElementById('mesa-select').value;
            const status = document.getElementById('mesa-status').value;
            alert(`🪑 Mesa ${mesa} status: ${status}`);
        }
    });

    // Navbar integration - sidebar
    document.querySelector('.nav-item[data-section="dashboard"]').classList.add('active');
});

