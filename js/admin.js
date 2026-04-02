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
            lowstock: 3,
            // Reservas KPIs
            reservasHoje: 24,
            pendentes: 8,
            confirmadas: 14,
            mesasLivres: '12/30'
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
            { id: '#PP001', cliente: 'João Silva', telefone: '(11)99999-0001', items: 2, total: 128.90, status: 'pendente', data: '2024-10-16 18:30' },
            { id: '#PP002', cliente: 'Maria Oliveira', telefone: '(11)98888-0002', items: 3, total: 189.70, status: 'preparando', data: '2024-10-16 19:15' },
            { id: '#PP003', cliente: 'Pedro Santos', telefone: '(11)97777-0003', items: 1, total: 59.90, status: 'entregue', data: '2024-10-16 17:45' },
            { id: '#PP004', cliente: 'Ana Costa', telefone: '(11)96666-0004', items: 4, total: 245.50, status: 'pendente', data: '2024-10-16 20:00' },
            { id: '#PP005', cliente: 'Lucas Pereira', telefone: '(11)95555-0005', items: 2, total: 98.90, status: 'preparando', data: '2024-10-16 18:00' },
            { id: '#PP006', cliente: 'Fernanda Lima', telefone: '(11)94444-0006', items: 1, total: 79.90, status: 'entregue', data: '2024-10-15 21:30' }
        ],
        // NOVO: Mock Reservas (matching reserva.html fields)
        reservas: [
            { id: 'R001', cliente: 'Ana Silva', data: '2024-10-16', hora: '19:00', pessoas: '4', mesa: 'Mesa Família', telefone: '(11)99988-7766', status: 'confirmada', obs: 'Aniversário' },
            { id: 'R002', cliente: 'Carlos Santos', data: '2024-10-16', hora: '20:30', pessoas: '2', mesa: 'Casal Romântico', telefone: '(11)98877-6655', status: 'pendente', obs: '' },
            { id: 'R003', cliente: 'Maria Oliveira', data: '2024-10-16', hora: '21:00', pessoas: '6', mesa: 'VIP Exclusiva', telefone: '(11)97766-5544', status: 'confirmada', obs: 'Reserva VIP' },
            { id: 'R004', cliente: 'Pedro Lima', data: '2024-10-15', hora: '18:30', pessoas: '4', mesa: 'Varanda Pet', telefone: '(11)96655-4433', status: 'cancelada', obs: 'Pet doente' },
            { id: 'R005', cliente: 'Julia Costa', data: '2024-10-17', hora: '19:30', pessoas: '2', mesa: 'Casal', telefone: '(11)95544-3322', status: 'pendente', obs: '' },
            { id: 'R006', cliente: 'Roberto Almeida', data: '2024-10-16', hora: '22:00', pessoas: '8', mesa: 'Varanda', telefone: '(11)94433-2211', status: 'confirmada', obs: 'Grupo amigos' }
            // More added dynamically
        ],
        salesTrend: [3200, 4500, 3800, 5200, 6100, 5800, 7200],
        topProducts: {
            labels: ['Margherita', 'Calabresa', 'Frango BBQ', 'Quatro Queijos', 'Chocolate'],
            data: [45, 38, 25, 22, 18]
        }
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

    // Update KPIs (Randomize for demo) - Extended for Reservas
    function updateKPIs() {
        const kpis = document.querySelectorAll('[data-metric]');
        kpis.forEach(kpi => {
            const metric = kpi.dataset.metric;
            let value = mockData.kpis[metric];
            
            // Reservas specific logic
            if (metric === 'mesasLivres') {
                const [livres, total] = value.split('/');
                const numLivres = parseInt(livres) + Math.floor(Math.random() * 2) - 1;
                kpi.textContent = `${Math.max(0, numLivres)}/${total}`;
                return;
            }
            
            if (metric === 'revenue' || metric === 'profit') {
                value += (Math.random() - 0.5) * 1000;
                kpi.innerHTML = 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '<small>,00</small>';
            } else {
                value += Math.floor(Math.random() * 3) - 1;
                kpi.textContent = Math.max(0, value);
            }
        });
    }

    // Populate Tables - Extended for Reservas
    function populateTables() {
        // Stock Table - Dynamic with filters
        const stockTbody = document.querySelector('#estoque tbody');
        if (stockTbody) {
            let filteredStock = [...mockData.stock];
            
            // Filters
            const searchTerm = document.querySelector('#estoque .search-input')?.value.toLowerCase() || '';
            const statusFilter = document.querySelector('#estoque .status-filter')?.value || 'todos';
            
            // Search
            if (searchTerm) {
                filteredStock = filteredStock.filter(item => 
                    item.name.toLowerCase().includes(searchTerm)
                );
            }
            
            // Status
            if (statusFilter !== 'todos') {
                filteredStock = filteredStock.filter(item => item.status === statusFilter);
            }
            
            stockTbody.innerHTML = filteredStock.map(item => `
                <tr class="${item.status}">
                    <td>${item.name}</td>
                    <td>${item.current}</td>
                    <td>${item.min}</td>
                    <td><span class="status ${item.status}">${item.status === 'low' ? '🔴 Baixo' : '🟢 OK'}</span></td>
                    <td>
                        <button class="btn-small reabastecer" data-name="${item.name}">Reabastecer</button>
                        <button class="btn-small ajustar" data-name="${item.name}">Ajustar</button>
                    </td>
                </tr>
            `).join('');
        }

        // Orders Table - Dynamic with filters
        const ordersTbody = document.querySelector('#pedidos tbody');
        if (ordersTbody) {
            let filteredOrders = [...mockData.recentOrders];
            
            // Filters
            const currentPeriod = document.querySelector('#pedidos .filter-btn.active')?.dataset.filter || 'hoje';
            const searchTerm = document.querySelector('#pedidos .search-input')?.value.toLowerCase() || '';
            const statusFilter = document.querySelector('#pedidos .status-filter')?.value || 'todos';
            
            // Period filter
            filteredOrders = filteredOrders.filter(o => {
                const today = '2024-10-16';
                if (currentPeriod === 'hoje' && !o.data.includes(today)) return false;
                return true;
            });
            
            // Search
            if (searchTerm) {
                filteredOrders = filteredOrders.filter(o => 
                    o.cliente.toLowerCase().includes(searchTerm) ||
                    o.telefone.toLowerCase().includes(searchTerm)
                );
            }
            
            // Status
            if (statusFilter !== 'todos') {
                filteredOrders = filteredOrders.filter(o => o.status === statusFilter);
            }
            
            ordersTbody.innerHTML = filteredOrders.map(order => `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.cliente}</td>
                    <td>${order.items} itens</td>
                    <td>R$ ${order.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    <td><span class="status ${order.status}">${order.status.toUpperCase()}</span></td>
                    <td>${order.data}</td>
                    <td>
                        <button class="btn-small preparar" data-id="${order.id}">Preparar</button>
                        <button class="btn-small entregar" data-id="${order.id}">Entregar</button>
                    </td>
                </tr>
            `).join('');
        }

        // NOVO: Reservas Table
        const reservasTbody = document.querySelector('#reservas tbody');
        if (reservasTbody) {
            let filteredReservas = [...mockData.reservas];
            
            // Apply current filters
            const currentPeriod = document.querySelector('.filter-btn.active')?.dataset.filter || 'hoje';
            const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
            const statusFilter = document.querySelector('.status-filter')?.value || 'todos';
            
            // Filter by period (simple mock)
            filteredReservas = filteredReservas.filter(r => {
                const today = new Date('2024-10-16').toISOString().split('T')[0];
                if (currentPeriod === 'hoje' && r.data !== today) return false;
                return true;
            });
            
            // Filter by search
            if (searchTerm) {
                filteredReservas = filteredReservas.filter(r => 
                    r.cliente.toLowerCase().includes(searchTerm) ||
                    r.telefone.toLowerCase().includes(searchTerm)
                );
            }
            
            // Filter by status
            if (statusFilter !== 'todos') {
                filteredReservas = filteredReservas.filter(r => r.status === statusFilter);
            }
            
            reservasTbody.innerHTML = filteredReservas.map(reserva => `
                <tr>
                    <td>${reserva.id}</td>
                    <td>${reserva.cliente}</td>
                    <td>${reserva.data} ${reserva.hora}</td>
                    <td>${reserva.mesa} (${reserva.pessoas}p)</td>
                    <td>${reserva.telefone}</td>
                    <td><span class="status ${reserva.status}">${reserva.status.toUpperCase()}</span></td>
                    <td>
                        <button class="btn-small confirmar" data-id="${reserva.id}">Confirmar</button>
                        <button class="btn-small cancelar" data-id="${reserva.id}">Cancelar</button>
                        <button class="btn-small editar" data-id="${reserva.id}">Editar</button>
                    </td>
                </tr>
            `).join('');
        }
    }


    // Real-time Refresh - FULL (all sections)
    let refreshInterval;
    function startRealTime() {
        refreshInterval = setInterval(() => {
            updateKPIs();
            
            // Simulate stock changes
            mockData.stock.forEach(item => {
                if (Math.random() > 0.8) item.current -= 1;
            });
            
            // Simulate new pedidos
            if (Math.random() > 0.6) {
                mockData.recentOrders.unshift({
                    id: '#PP' + (100 + mockData.recentOrders.length).toString().padStart(3, '0'),
                    cliente: 'Cliente #' + Math.floor(Math.random()*100),
                    telefone: '(11)9' + Math.floor(10000000 + Math.random()*90000000),
                    items: Math.floor(1 + Math.random()*4),
                    total: (50 + Math.random()*200).toFixed(2),
                    status: 'pendente',
                    data: new Date(Date.now() + Math.random()*86400000).toISOString().slice(0,16).replace('T', ' ')
                });
            }
            
            // Simulate new reservas
            if (Math.random() > 0.7) {
                mockData.reservas.unshift({
                    id: 'R' + (100 + mockData.reservas.length).toString().padStart(3, '0'),
                    cliente: 'Novo Cliente ' + Math.floor(Math.random()*100),
                    data: new Date(Date.now() + Math.random()*86400000).toISOString().split('T')[0],
                    hora: ['18:00', '19:00', '20:00', '21:00'][Math.floor(Math.random()*4)],
                    pessoas: [2,4,6,8][Math.floor(Math.random()*4)],
                    mesa: ['Casal', 'Família', 'VIP', 'Varanda'][Math.floor(Math.random()*4)],
                    telefone: '(11)9' + Math.floor(10000000 + Math.random()*90000000),
                    status: 'pendente',
                    obs: ''
                });
            }
            
            populateTables();
        }, 8000);
    }


    // Actions - Extended for ALL sections
    document.addEventListener('click', function(e) {
        // Estoque actions
        if (e.target.classList.contains('reabastecer')) {
            const name = e.target.dataset.name;
            alert(`🛒 Reabastecimento automático para ${name} iniciado!`);
            // Simulate stock increase
            const item = mockData.stock.find(i => i.name === name);
            if (item) item.current += 20;
            populateTables();
        }
        if (e.target.classList.contains('ajustar')) {
            const name = e.target.dataset.name;
            const novoEstoque = prompt(`Estoque atual para ${name}: Ajustar para quanto?`);
            if (novoEstoque && !isNaN(novoEstoque)) {
                const item = mockData.stock.find(i => i.name === name);
                if (item) item.current = parseInt(novoEstoque);
                populateTables();
            }
        }
        
        // Pedidos actions
        if (e.target.classList.contains('preparar')) {
            const id = e.target.dataset.id;
            const pedido = mockData.recentOrders.find(p => p.id === id);
            if (pedido) {
                pedido.status = 'preparando';
                alert(`🔥 Pedido ${id} em preparação!`);
                populateTables();
            }
        }
        if (e.target.classList.contains('entregar')) {
            const id = e.target.dataset.id;
            const pedido = mockData.recentOrders.find(p => p.id === id);
            if (pedido) {
                pedido.status = 'entregue';
                alert(`✅ Pedido ${id} entregue!`);
                populateTables();
            }
        }
        
        // Reservas actions (existing)
        if (e.target.classList.contains('confirmar')) {
            const id = e.target.dataset.id;
            const reserva = mockData.reservas.find(r => r.id === id);
            if (reserva) {
                reserva.status = 'confirmada';
                alert(`✅ Reserva ${id} confirmada! WhatsApp enviado para ${reserva.telefone}`);
                populateTables();
            }
        }
        if (e.target.classList.contains('cancelar')) {
            const id = e.target.dataset.id;
            const reserva = mockData.reservas.find(r => r.id === id);
            if (reserva) {
                reserva.status = 'cancelada';
                alert(`❌ Reserva ${id} cancelada.`);
                populateTables();
            }
        }
        if (e.target.classList.contains('editar')) {
            const id = e.target.dataset.id;
            alert(`✏️ Editar ${id} - Modal em desenvolvimento`);
        }
    });
    
    // Global Filters - Works for all sections
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-btn')) {
            e.target.closest('.filters-bar').querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            populateTables();
        }
    });
    
    // Global Search & Status Filter
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('search-input') || e.target.classList.contains('status-filter')) {
            setTimeout(populateTables, 300);
        }
    });
    
    // Search & Status Filter
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('search-input') || e.target.classList.contains('status-filter')) {
            setTimeout(populateTables, 300);
        }
    });


    // Navbar integration - sidebar
    document.querySelector('.nav-item[data-section="dashboard"]').classList.add('active');
});

