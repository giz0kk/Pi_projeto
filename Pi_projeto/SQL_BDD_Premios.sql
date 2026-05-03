

-- Criar banco de dados
CREATE DATABASE EcoColeta_Premios;
USE EcoColeta_Premios;

-- Criar tabela bairro
CREATE TABLE bairro (
    id_bairro INT PRIMARY KEY AUTO_INCREMENT,
    nome_bairro VARCHAR(100) NOT NULL
);

-- Criar tabela parceiro
CREATE TABLE parceiro (
    id_parceiro INT PRIMARY KEY AUTO_INCREMENT,
    nome_parceiro VARCHAR(100) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    tipo_estabelecimento VARCHAR(50) NOT NULL,
    id_bairro INT,
    FOREIGN KEY (id_bairro) REFERENCES bairro(id_bairro)
);

-- Criar tabela premios
CREATE TABLE premios (
    id_premio INT PRIMARY KEY AUTO_INCREMENT,
    nome_premio VARCHAR(100) NOT NULL,
    descricao TEXT,
    pontos_necessarios INT NOT NULL,
    cupom_codigo VARCHAR(50) UNIQUE,
    desconto_percentual DECIMAL(5,2),
    data_inicio DATE,
    data_expiracao DATE,
    id_parceiro INT,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_parceiro) REFERENCES parceiro(id_parceiro)
);

-- Criar tabela resgate
CREATE TABLE resgate (
    id_resgate INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,  -- Referência ao usuário do banco principal EcoColeta
    id_premio INT NOT NULL,
    data_resgate DATETIME DEFAULT CURRENT_TIMESTAMP,
    pontos_usados INT NOT NULL,
    status ENUM('pendente', 'aprovado', 'rejeitado') DEFAULT 'pendente',
    FOREIGN KEY (id_premio) REFERENCES premios(id_premio)
);

-- Criar tabela historico_resgate (opcional, para auditoria)
CREATE TABLE historico_resgate (
    id_historico INT PRIMARY KEY AUTO_INCREMENT,
    id_resgate INT NOT NULL,
    acao VARCHAR(50) NOT NULL,
    data_acao DATETIME DEFAULT CURRENT_TIMESTAMP,
    detalhes TEXT,
    FOREIGN KEY (id_resgate) REFERENCES resgate(id_resgate)
);

-- Criar tabela historico_pontos
CREATE TABLE historico_pontos (
    id_historico_pontos INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,  
    pontos INT NOT NULL,  
    descricao VARCHAR(255) NOT NULL, 
    data_transacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_resgate INT NULL,  
    FOREIGN KEY (id_resgate) REFERENCES resgate(id_resgate)
);

-- Inserir bairros
INSERT INTO bairro (nome_bairro) VALUES
('Centro'),
('Vila Nova'),
('Jardim Botânico'),
('Ibirapuera');

-- Inserir parceiros (academias e estabelecimentos)
INSERT INTO parceiro (nome_parceiro, endereco, tipo_estabelecimento, id_bairro) VALUES
('PowerFit Club', 'Av. Paulista, 1000', 'Academia', 1),
('IronFlex', 'Rua Augusta, 500', 'Academia', 1),
('Pizza Prime', 'Rua Oscar Freire, 200', 'Restaurante', 2),
('Eco Shop', 'Av. Brasil, 1500', 'Loja de Produtos Eco', 3),
('Green Market', 'Rua Vergueiro, 800', 'Supermercado', 4);

-- Inserir prêmios/cupons
INSERT INTO premios (nome_premio, descricao, pontos_necessarios, cupom_codigo, desconto_percentual, data_inicio, data_expiracao, id_parceiro, ativo) VALUES
('PowerFit Club', '15% de descontos', 347, 'ECO100OFF', 15.00, '2026-04-01', '2026-04-16', 1, TRUE),
('IronFlex', '30% de descontos', 289, 'IRON30', 30.00, '2026-04-01', '2026-04-30', 2, TRUE),
('Pizza Prime', '1 Pizza Grande Grátis', 450, 'PIZZA50', 50.00, '2026-03-15', '2026-05-15', 3, TRUE),
('Eco Shop - Sacola Reutilizável', 'Sacola de lona premium', 150, 'ECOSAVE20', 100.00, '2026-01-01', '2026-12-31', 4, TRUE),
('Green Market - Vale R$30', 'Vale compras no mercado', 300, 'ECOGREENVALE30', 30.00, '2026-04-01', '2026-06-30', 5, TRUE);


