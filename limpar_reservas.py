import sqlite3

conn = sqlite3.connect('novo banco pizza.db')
cursor = conn.cursor()

# Deleta todas as reservas
cursor.execute('DELETE FROM reservas')
reservas_deletadas = cursor.rowcount

# Deleta todos os clientes
cursor.execute('DELETE FROM clientes')
clientes_deletados = cursor.rowcount

# Reinserir dados iniciais do schema
cursor.execute("""INSERT INTO clientes (nome, telefone, endereco, email) VALUES
('João Silva', '11987654321', 'Rua das Flores, 123', 'joao@email.com'),
('Maria Santos', '11876543210', 'Av. Brasil, 456', 'maria@email.com')""")

# Reinserir reservas iniciais do schema
cursor.execute("""INSERT INTO reservas (cliente_id, mesa_id, data_reserva, quantidade_pessoas, observacao) VALUES
(1, 2, '2026-04-25 20:00:00', 4, 'Aniversário'),
(2, 1, '2026-04-26 19:30:00', 2, 'Janela')""")

conn.commit()
conn.close()

print(f'✅ Dados limpos com sucesso!')
print(f'   Reservas deletadas: {reservas_deletadas}')
print(f'   Clientes deletados: {clientes_deletados}')
print(f'   Dados iniciais restaurados: 2 clientes e 2 reservas')

