-- EcoColeta: tabela usada na verificacao de e-mail no cadastro.
-- Guarda os dados do usuario antes da confirmacao por codigo.
-- Quando o codigo e validado em verificar_cadastro.php, a linha e
-- transferida para a tabela `usuario` e removida daqui.
--
-- Execucao: rode em phpMyAdmin no banco `ecocoleta`, ou deixe
-- conexao.php instalar automaticamente na primeira conexao.

USE ecocoleta;

CREATE TABLE IF NOT EXISTS cadastro_pendente (
  id_cadastro_pendente INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  codigo_hash VARCHAR(255) NOT NULL,
  codigo_expira DATETIME NOT NULL,
  tentativas TINYINT UNSIGNED NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cadastro_pendente_email (email),
  KEY idx_cadastro_pendente_expira (codigo_expira)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
