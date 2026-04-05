// Admin Dashboard JS | Pizza Prime - Professional Panel - FIXED
// Seção Reservas limpa para banco de dados | Erros TS corrigidos

document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.admin-section');
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-item');

    // Mock Data (limpo para banco)
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
        topProducts: { labels: ['Margherita', 'Calabresa', 'Frango BBQ', 'Quatro Queijos', 'Chocolate'], data: [45, 38, 25, 22, 18] },
        reservas: [] // ✅ Pronto para banco de dados
    };

    let ordersChart, salesChart, productsChart;

    function initDashboard() {
        document.querySelector('.admin-layout').style.display = 'flex';
        document.querySelector('.admin-main').style.display = 'block';
        updateKPIs();
        populateTables();
        initCharts();
        startRealTime();
        initNav();
        showFirstSection();
    }

    function initNav() {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                if (!targetSection) return console.error('Section not found:', targetId);

                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                sections.forEach(s => {
                    s.style.display = 'none';
                    s.classList.remove('active');
                });
                
                targetSection.style.display = 'block';
                targetSection.classList.add('active');
                
                // Close sidebar on mobile after nav click
                if (window.innerWidth <= 1200) {
                    document.querySelector('.admin-sidebar').classList.remove('open');
                }
            });
        });
        
        // Mobile sidebar toggle
        const toggleBtn = document.querySelector('.sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function() {
                const sidebar = document.querySelector('.admin-sidebar');
                sidebar.classList.toggle('open');
            });
        }
    }

    function showFirstSection() {
        if (sections.length > 0) {
            sections.forEach(s => {
                s.style.display = 'none';
                s.classList.remove('active');
            });
            sections[0].style.display = 'block';
            sections[0].classList.add('active');
            document.querySelector('.nav-item[data-section="dashboard"]').classList.add('active');
        }
    }

    function initCharts() {
        const ordersCtx = document.getElementById('ordersChart')?.getContext('2d');
        if (ordersCtx) {
            ordersChart = new Chart(ordersCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Entregue', 'Preparando', 'Pendente'],
                    datasets: [{ data: [120, 25, 11], backgroundColor: ['#28a745', '#ffc107', '#dc3545'] }]
                },
                options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
            });
        }

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

        const productsCtx = document.getElementById('productsChart')?.getContext('2d');
        if (productsCtx) {
            productsChart = new Chart(productsCtx, {
                type: 'bar',
                data: {
                    labels: mockData.topProducts.labels,
                    datasets: [{ label: '% Vendas', data: mockData.topProducts.data, backgroundColor: '#ff4757' }]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true, max: 50 } } }
            });
        }
    }

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
    }

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

        // Reservas (limpa)
        const reservasTbody = document.querySelector('#reserva .reserva-table tbody');
        if (reservasTbody) {
            reservasTbody.innerHTML = '<tr><td colspan="7" class="text-center">Aguardando dados do banco de dados...</td></tr>';
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

    function startRealTime() {
        setInterval(() => {
            updateKPIs();
            mockData.stock[0].current = Math.max(0, mockData.stock[0].current - 1);
            populateTables();
        }, 5000);
    }

    // Event Listeners
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('reorder')) {
            alert('🛒 Pedido de reabastecimento enviado!');
        } else if (e.target.classList.contains('btn-small') && !e.target.closest('.reserva-table')) {
            alert('✏️ Edição iniciada!');
        } else if (e.target.classList.contains('btn-confirm')) {
            const statusEl = e.target.closest('tr').querySelector('.status');
            statusEl.textContent = 'CONFIRMADA';
            statusEl.className = 'status confirmed';
            e.target.style.display = 'none';
            alert('✅ Confirmada!');
        } else if (e.target.classList.contains('btn-cancel')) {
            if (confirm('Cancelar?')) {
                const statusEl = e.target.closest('tr').querySelector('.status');
                statusEl.textContent = 'CANCELADA';
                statusEl.className = 'status canceled';
                alert('❌ Cancelada!');
            }
        } else if (e.target.id === 'update-mesa') {
            const mesa = document.getElementById('mesa-select').value;
            const status = document.getElementById('mesa-status').value;
            alert(`🪑 Mesa ${mesa}: ${status}`);
        }
    });

    initDashboard();
});
