-- =====================
-- CLIENTES
-- =====================
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    endereco TEXT,
    email VARCHAR(100)
);

-- =====================
-- STATUS DO PEDIDO
-- =====================
CREATE TABLE status_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

INSERT INTO status_pedido (nome) VALUES
('Pendente'),
('Em Preparo'),
('Pronto'),
('Entregue');

-- =====================
-- SABORES
-- =====================
CREATE TABLE sabores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- =====================
-- TAMANHOS
-- =====================
CREATE TABLE tamanhos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(20) NOT NULL
);

INSERT INTO tamanhos (nome) VALUES
('Media'),
('Grande');

-- =====================
-- PREÇOS
-- =====================
CREATE TABLE precos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sabor_id INT NOT NULL,
    tamanho_id INT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (sabor_id) REFERENCES sabores(id),
    FOREIGN KEY (tamanho_id) REFERENCES tamanhos(id),

    UNIQUE (sabor_id, tamanho_id)
);

-- =====================
-- PEDIDOS
-- =====================
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    status_id INT NOT NULL,
    data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2),

    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (status_id) REFERENCES status_pedido(id)
);

-- =====================
-- BEBIDAS
-- =====================
CREATE TABLE bebidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL
);

-- =====================
-- ITENS DO PEDIDO
-- =====================
CREATE TABLE itens_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    preco_id INT NOT NULL,
    quantidade INT NOT NULL,

    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (preco_id) REFERENCES precos(id)
);

-- =====================
-- MESAS
-- =====================
CREATE TABLE mesas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero INT NOT NULL,
    capacidade INT NOT NULL
);

-- =====================
-- RESERVAS
-- =====================
CREATE TABLE reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    mesa_id INT NOT NULL,
    data_reserva DATETIME NOT NULL,
    quantidade_pessoas INT NOT NULL,
    observacao TEXT,

    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (mesa_id) REFERENCES mesas(id),

    UNIQUE (mesa_id, data_reserva)
);

-- =====================
-- INSERT SABORES
-- =====================
INSERT INTO sabores (nome, descricao) VALUES
('Margherita premium', 'Molho de tomate, queijo muçarela, manjericão'),
('Calabresa', 'Molho de tomate, queijo muçarela, calabresa, cebola'),
('Quatro Queijos', 'muçarela, gorgonzola, parmesão, catupiry'),
('Pepperoni', 'Molho de tomate, queijo muçarela, pepperoni'),
('Frango com Catupiry', 'Molho de tomate, queijo muçarela, frango, catupiry'),
('Portuguesa', 'Molho de tomate, queijo muçarela, presunto, ovos, cebola, pimentão'),
('Mussarela', 'Molho de tomate, queijo muçarela, orégano'),
('Atum', 'Molho de tomate, queijo muçarela, atum, cebola'),
('Pepperoni Extra', 'Molho de tomate, queijo muçarela, pepperoni extra'),
('Baiana', 'Molho de tomate, queijo muçarela, carne seca, cebola'),
('Caipira', 'Molho de tomate, queijo muçarela, frango, milho, catupiry'),
('Moda da Casa', 'combinação especial da casa'),
('Calabresa com catupiry', 'Molho de tomate, queijo muçarela, calabresa, catupiry'),
('Brocolis', 'Molho de tomate, queijo muçarela, brócolis, bacon'),
('Milho com Bacon', 'Molho de tomate, queijo muçarela, milho, bacon'),
('Carne Seca com Catupiry', 'Molho de tomate, queijo muçarela, carne seca, catupiry'),
('Frango com Milho', 'Molho de tomate, frango, milho'),
('Escarola com Alho', 'Molho de tomate, queijo muçarela, escarola, alho'),
('Toscana', 'Molho de tomate, linguiça toscana, cebola'),
('Lombo Canadense', 'Molho de tomate, queijo muçarela, lombo'),
('Presunto de Parma com rúcula', 'Molho de tomate, parmesão, rúcula'),
('Queijo Brie damasco', 'Molho de tomate, brie, damasco'),
('Tomate seco com Rúcula', 'Molho de tomate, tomate seco, rúcula');

-- =====================
-- INSERT PREÇOS
-- =====================
INSERT INTO precos (sabor_id, tamanho_id, preco) VALUES
(1,1,45),(1,2,55),(2,1,48),(2,2,60),(3,1,55),(3,2,65),
(4,1,30),(4,2,40),(5,1,42),(5,2,52),(6,1,40),(6,2,50),
(7,1,42),(7,2,52),(8,1,49),(8,2,59),(9,1,41),(9,2,51),
(10,1,44),(10,2,54),(11,1,43),(11,2,53),(12,1,50),(12,2,60),
(13,1,45),(13,2,55),(14,1,42),(14,2,52),(15,1,40),(15,2,50),
(16,1,49),(16,2,59),(17,1,38),(17,2,48),(18,1,44),(18,2,54),
(19,1,47),(19,2,57),(20,1,45),(20,2,55),(21,1,53),(21,2,63),
(22,1,54),(22,2,64),(23,1,48),(23,2,58);

-- =====================
-- CLIENTES
-- =====================
INSERT INTO clientes (nome, telefone, endereco, email) VALUES
('João Silva', '11987654321', 'Rua das Flores, 123', 'joao@email.com'),
('Maria Santos', '11876543210', 'Av. Brasil, 456', 'maria@email.com');

-- =====================
-- MESAS
-- =====================
INSERT INTO mesas (numero, capacidade) VALUES
(1,2),(2,4),(3,4),(4,6),(5,8);

-- =====================
-- RESERVAS
-- =====================
INSERT INTO reservas (cliente_id, mesa_id, data_reserva, quantidade_pessoas, observacao) VALUES
(1,2,'2026-04-25 20:00:00',4,'Aniversário'),
(2,1,'2026-04-26 19:30:00',2,'Janela');

-- =====================
-- SELECT PEDIDOS
-- =====================
SELECT 
    c.nome AS cliente,
    s.nome AS sabor,
    t.nome AS tamanho,
    p.preco,
    sp.nome AS status,
    ip.quantidade
FROM itens_pedido ip
JOIN pedidos pe ON ip.pedido_id = pe.id
JOIN clientes c ON pe.cliente_id = c.id
JOIN status_pedido sp ON pe.status_id = sp.id
JOIN precos p ON ip.preco_id = p.id
JOIN sabores s ON p.sabor_id = s.id
JOIN tamanhos t ON p.tamanho_id = t.id;

-- =====================
-- SELECT RESERVAS
-- =====================
SELECT 
    r.id,
    c.nome AS cliente,
    m.numero AS mesa,
    m.capacidade,
    r.quantidade_pessoas,
    r.data_reserva,
    r.observacao
FROM reservas r
JOIN clientes c ON r.cliente_id = c.id
JOIN mesas m ON r.mesa_id = m.id;