// Pizza Prime Admin Panel - FIXED Navigation + ESTOQUE FUNCIONAL
// Conectado ao backend Flask na porta 5000

const API_BASE = "http://localhost:5000/api";

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== PIZZA PRIME ADMIN LOADED ===');

    // Elements
    const logoutBtn = document.getElementById('logoutBtn');
    const sections = document.querySelectorAll('.admin-section');
    const navLinks = document.querySelectorAll('.nav-item');
    console.log('Sections found:', sections.length);
    console.log('Nav links found:', navLinks.length);

    // Mock Data (mantido para gráficos e pedidos)
    const mockData = {
        kpis: { revenue: 47892.43, orders: 156, profit: 18745.20, lowstock: 3 },
        recentOrders: [
            { id: '#PP001', client: 'João Silva', items: 2, total: 128.90, status: 'entregue', date: '2024-10-15 19:32' },
            { id: '#PP002', client: 'Maria Oliveira', items: 3, total: 189.70, status: 'preparando', date: '2024-10-15 20:15' },
            { id: '#PP003', client: 'Pedro Santos', items: 1, total: 59.90, status: 'entregue', date: '2024-10-15 18:45' }
        ],
        salesTrend: [3200, 4500, 3800, 5200, 6100, 5800, 7200],
        topProducts: { labels: ['Margherita', 'Calabresa', 'Frango BBQ', 'Quatro Queijos', 'Chocolate'], data: [45, 38, 25, 22, 18] }
    };

    let charts = {};
    let estoqueData = [];

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
                sections.forEach(s => {
                    s.style.display = 'none';
                    s.classList.remove('active');
                });

                targetSection.style.display = 'block';
                targetSection.classList.add('active');

                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');

                // Salva aba ativa
                sessionStorage.setItem('admin_active_section', targetId);

                console.log('Switched to:', targetId);

                // Recarrega estoque ao entrar na aba
                if (targetId === 'estoque') {
                    carregarEstoque();
                }
                // Recarrega reservas ao entrar na aba
                if (targetId === 'reserva') {
                    carregarReservas();
                }
            }
        });
    });

    // Restaura aba ativa ao carregar
    const savedSection = sessionStorage.getItem('admin_active_section');
    if (savedSection) {
        const savedLink = document.querySelector(`.nav-item[href="#${savedSection}"]`);
        if (savedLink) {
            savedLink.click();
        }
    }

    // Update KPIs
    function updateKPIs() {
        document.querySelectorAll('[data-metric]').forEach(kpi => {
            const metric = kpi.dataset.metric;
            // Pula métricas de reservas — elas são atualizadas pela API
            if (['todays-reservations', 'occupancy', 'pending', 'canceled'].includes(metric)) {
                return;
            }
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

    // ============================================================
    // ESTOQUE FUNCIONAL — INTEGRADO AO BANCO
    // ============================================================

    async function carregarEstoque() {
        const stockTbody = document.querySelector('#estoque tbody');
        if (!stockTbody) return;

        stockTbody.innerHTML = '<tr><td colspan="5" class="text-center">Carregando...</td></tr>';

        try {
            const res = await fetch(`${API_BASE}/estoque`);
            if (!res.ok) throw new Error('Erro ao carregar estoque');
            estoqueData = await res.json();

            renderizarEstoque();
            atualizarBadgeEstoque();
        } catch (err) {
            console.error(err);
            stockTbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:#dc3545">⚠️ Erro: ${err.message}<br><small>Verifique se o servidor está rodando (py api.py)</small></td></tr>`;
        }
    }

    function renderizarEstoque() {
        const stockTbody = document.querySelector('#estoque tbody');
        if (!stockTbody) return;

        if (estoqueData.length === 0) {
            stockTbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum item no estoque.</td></tr>';
            return;
        }

        stockTbody.innerHTML = estoqueData.map(item => `
            <tr class="${item.status}">
                <td>${item.nome}</td>
                <td>${item.quantidade_atual}</td>
                <td>${item.quantidade_minima}</td>
                <td><span class="status ${item.status}">${item.status === 'low' ? '🔴 Baixo' : '🟢 OK'}</span></td>
                <td>
                    <button class="btn-small reorder" data-id="${item.id}">Reabastecer +10</button>
                    <button class="btn-small" data-id="${item.id}" data-action="edit">Editar</button>
                </td>
            </tr>
        `).join('');
    }

    function atualizarBadgeEstoque() {
        const lowCount = estoqueData.filter(i => i.status === 'low').length;
        const badge = document.querySelector('a[data-section="estoque"] .badge');
        if (badge) badge.textContent = lowCount;
    }

    async function reabastecerItem(id) {
        try {
            const res = await fetch(`${API_BASE}/estoque/${id}/reabastecer`, { method: 'POST' });
            const data = await res.json();
            if (data.sucesso) {
                // Atualiza localmente para evitar reload completo
                const idx = estoqueData.findIndex(i => i.id === id);
                if (idx !== -1) {
                    estoqueData[idx].quantidade_atual = data.item.quantidade_atual;
                    estoqueData[idx].status = data.item.status;
                }
                renderizarEstoque();
                atualizarBadgeEstoque();
                mostrarToast(`✅ ${data.item.nome} reabastecido! Agora: ${data.item.quantidade_atual} unidades`, 'success');
            } else {
                alert('Erro: ' + data.erro);
            }
        } catch (err) {
            alert('Erro de conexão: ' + err.message);
        }
    }

    async function editarItem(id) {
        const item = estoqueData.find(i => i.id === id);
        if (!item) return;

        const novoAtual = prompt(`Editar quantidade atual de "${item.nome}":`, item.quantidade_atual);
        if (novoAtual === null) return;

        const novaMinima = prompt(`Editar quantidade mínima de "${item.nome}":`, item.quantidade_minima);
        if (novaMinima === null) return;

        const payload = {};
        if (novoAtual !== '') payload.quantidade_atual = parseInt(novoAtual);
        if (novaMinima !== '') payload.quantidade_minima = parseInt(novaMinima);

        try {
            const res = await fetch(`${API_BASE}/estoque/${id}/editar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.sucesso) {
                const idx = estoqueData.findIndex(i => i.id === id);
                if (idx !== -1) {
                    estoqueData[idx].quantidade_atual = data.item.quantidade_atual;
                    estoqueData[idx].quantidade_minima = data.item.quantidade_minima;
                    estoqueData[idx].status = data.item.status;
                }
                renderizarEstoque();
                atualizarBadgeEstoque();
                mostrarToast(`✅ ${data.item.nome} atualizado!`, 'success');
            } else {
                alert('Erro: ' + data.erro);
            }
        } catch (err) {
            alert('Erro de conexão: ' + err.message);
        }
    }

    function mostrarToast(mensagem, tipo = 'success') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: ${tipo === 'success' ? '#28a745' : '#dc3545'};
            color: white; padding: 1rem 1.5rem; border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3); z-index: 9999;
            font-weight: 600; animation: fadeIn 0.3s ease;
        `;
        toast.textContent = mensagem;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    // Event delegation para botões de estoque
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('reorder')) {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(e.target.dataset.id);
            reabastecerItem(id);
        }
        if (e.target.dataset.action === 'edit') {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(e.target.dataset.id);
            editarItem(id);
        }
    });

    // ============================================================
    // RESERVAS FUNCIONAL — INTEGRADO AO BANCO
    // ============================================================

    async function carregarReservas() {
        const reservasTbody = document.querySelector('#reserva .reserva-table tbody');
        if (!reservasTbody) return;

        reservasTbody.innerHTML = '<tr><td colspan="10" class="text-center">Carregando...</td></tr>';

        try {
            // Carrega estatísticas
            const statsRes = await fetch(`${API_BASE}/reservas/estatisticas`);
            const stats = await statsRes.json();
            atualizarKPIsReservas(stats);

            // Carrega todas as reservas
            const res = await fetch(`${API_BASE}/reservas`);
            if (!res.ok) throw new Error('Erro ao carregar reservas');
            const reservas = await res.json();
            renderizarReservas(reservas);
        } catch (err) {
            console.error(err);
            reservasTbody.innerHTML = `<tr><td colspan="10" class="text-center" style="color:#dc3545">⚠️ Erro: ${err.message}<br><small>Verifique se o servidor está rodando (py api.py)</small></td></tr>`;
        }
    }

    function atualizarKPIsReservas(stats) {
        const kpiReservas = document.querySelector('[data-metric="todays-reservations"]');
        const kpiOcupacao = document.querySelector('[data-metric="occupancy"]');
        const kpiPendentes = document.querySelector('[data-metric="pending"]');
        const kpiCanceladas = document.querySelector('[data-metric="canceled"]');

        if (kpiReservas) kpiReservas.textContent = stats.reservas_hoje || 0;
        if (kpiPendentes) kpiPendentes.textContent = stats.pendentes || 0;
        if (kpiCanceladas) kpiCanceladas.textContent = stats.canceladas || 0;

        if (kpiOcupacao) {
            const pct = stats.capacidade_total > 0
                ? Math.round((stats.ocupacao_pessoas / stats.capacidade_total) * 100)
                : 0;
            kpiOcupacao.textContent = pct + '%';
            const trend = kpiOcupacao.parentElement.querySelector('.kpi-trend');
            if (trend) trend.innerHTML = `<i class="fas fa-arrow-up"></i> ${stats.ocupacao_pessoas}/${stats.capacidade_total}`;
        }

        // Atualiza badge do menu
        const badge = document.querySelector('a[data-section="reserva"] .badge');
        if (badge) badge.textContent = stats.reservas_hoje || 0;
    }

    function renderizarReservas(reservas) {
        const reservasTbody = document.querySelector('#reserva .reserva-table tbody');
        if (!reservasTbody) return;

        if (reservas.length === 0) {
            reservasTbody.innerHTML = '<tr><td colspan="10" class="text-center">Nenhuma reserva encontrada.</td></tr>';
            return;
        }

        const statusClasses = {
            'confirmada': 'confirmed',
            'pendente': 'pending',
            'cancelada': 'canceled'
        };
        const statusLabels = {
            'confirmada': 'CONFIRMADA',
            'pendente': 'PENDENTE',
            'cancelada': 'CANCELADA'
        };

        reservasTbody.innerHTML = reservas.map(r => {
            const st = (r.status || 'confirmada').toLowerCase();
            const stClass = statusClasses[st] || 'confirmed';
            const stLabel = statusLabels[st] || 'CONFIRMADA';
            const isCancelada = st === 'cancelada';
            const aniversarioIcon = r.aniversario ? '🎉 Sim' : '-';
            const promocaoLabel = r.promocao || '-';
            return `
            <tr class="${stClass}">
                <td>#${r.id}</td>
                <td>${r.cliente || '-'}</td>
                <td>Mesa ${r.mesa || '-'} (cap: ${r.capacidade || '-'})</td>
                <td>${r.data_reserva || '-'}</td>
                <td>${r.quantidade_pessoas || '-'}</td>
                <td>${r.observacao || '-'}</td>
                <td>${aniversarioIcon}</td>
                <td>${promocaoLabel}</td>
                <td><span class="status ${stClass}">${stLabel}</span></td>
                <td>
                    <button class="btn-small btn-confirm" data-id="${r.id}" ${st === 'confirmada' ? 'disabled' : ''}>Confirmar</button>
                    <button class="btn-small btn-cancel" data-id="${r.id}" ${isCancelada ? 'disabled' : ''}>Cancelar</button>
                </td>
            </tr>
        `;}).join('');

        // Bind botões de ação
        reservasTbody.querySelectorAll('.btn-confirm').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                mudarStatusReserva(parseInt(this.dataset.id), 'confirmada');
            });
        });
        reservasTbody.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                mudarStatusReserva(parseInt(this.dataset.id), 'cancelada');
            });
        });
    }

    async function mudarStatusReserva(id, status) {
        try {
            const res = await fetch(`${API_BASE}/reservas/${id}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.sucesso) {
                mostrarToast(`Reserva #${id} ${status === 'cancelada' ? 'cancelada' : 'confirmada'}!`, 'success');
                carregarReservas();
            } else {
                alert('Erro: ' + data.erro);
            }
        } catch (err) {
            alert('Erro de conexão: ' + err.message);
        }
    }

    // Populate tables (mantém pedidos mockados, estoque e reservas vêm da API)
    function populateTables() {
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
        
        const ordersCtx = document.getElementById('ordersChart')?.getContext('2d');
        if (ordersCtx) charts.orders = new Chart(ordersCtx, {
            type: 'doughnut',
            data: { labels: ['Entregue', 'Preparando', 'Pendente'], datasets: [{ data: [120, 25, 11], backgroundColor: ['#28a745', '#ffc107', '#dc3545'] }] },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });

        const salesCtx = document.getElementById('salesChart')?.getContext('2d');
        if (salesCtx) charts.sales = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{ label: 'Vendas (R$)', data: mockData.salesTrend, borderColor: '#ff4757', backgroundColor: 'rgba(255,71,87,0.1)', tension: 0.4, fill: true }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });

        const productsCtx = document.getElementById('productsChart')?.getContext('2d');
        if (productsCtx) charts.products = new Chart(productsCtx, {
            type: 'bar',
            data: { labels: mockData.topProducts.labels, datasets: [{ label: '% Vendas', data: mockData.topProducts.data, backgroundColor: '#ff4757' }] },
            options: { responsive: true, scales: { y: { beginAtZero: true, max: 50 } } }
        });
    }

    // Sidebar toggle (mobile)
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('active');
        });
    }

    if (overlay && sidebar) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    // Auto-close sidebar on mobile when clicking nav
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 1200) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
            }
        });
    });

    // Init everything
    updateKPIs();
    populateTables();
    carregarEstoque(); // Pré-carrega estoque
    carregarReservas(); // Pré-carrega reservas
    setTimeout(initCharts, 500);

    // Real-time
    setInterval(updateKPIs, 5000);

    console.log('=== ADMIN READY ===');
});
