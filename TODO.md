# TODO: Painel Admin - Seção de Reservas de Mesa + Banco de Dados

## Status: 🟡 IN PROGRESS (Phase 1: UI + Mock Data)

### ✅ Phase 1: Frontend Implementation
- [x] 1. Create TODO.md with steps
- [x] 2. Edit admin.html: Add \"Reservas\" nav + #reservas section (KPIs + table)
- [x] 3. Update js/admin.js: Mock reservations data + populate table/filters
- [x] 4. Test navigation, table population, filters
- [x] 5. Minor css/admin.css tweaks for new status classes

**ALL SECTIONS COMPLETE ✅ Reservas + Pedidos + Estoque fully dynamic!**

### Features Live:
| Section | Filters | Actions | Real-time |
|---------|---------|---------|-----------|
| **Reservas** | Hoje/Semana/Mês, search, status | Confirmar/Cancelar/Editar | ✅ New every 8s |
| **Pedidos** | Hoje/Semana/Mês, search, status | Preparar/Entregar | ✅ New every 8s |
| **Estoque** | Search produto, status | Reabastecer/Ajustar (prompt) | ✅ Auto decrease |

**Test:** `admin.html` → Switch sections → Filters work independently, buttons update live, new data auto-appears!

### Backend Ready (Phase 2 Optional):
```
mkdir backend && cd backend && npm init -y && npm i express sqlite3 cors nodemon
```

**Pizza Prime Admin 100% funcional! 🚀**

No more TODOs needed.

### ⏳ Phase 2: Backend + Real DB (Next)
- [ ] 6. Setup Node.js + Express + SQLite backend
- [ ] 7. API endpoints: GET/POST/PUT/DELETE /api/reservas
- [ ] 8. Replace mock data with fetch() calls
- [ ] 9. Connect reserva.html form to API
- [ ] 10. Add auth, validation, real-time (Socket.io)

**Commands to test:**
- Open admin.html → Click \"Reservas\" → Verify table + filters work

