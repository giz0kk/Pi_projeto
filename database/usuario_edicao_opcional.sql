-- Execute no banco ecocoleta se quiser usar foto e endereço extra em usuario (edicaoperfil.php / atualizarperfil.php).
-- Se a coluna já existir, o MySQL retornará erro; ignore nesse caso.

ALTER TABLE usuario ADD COLUMN foto_perfil VARCHAR(500) NULL DEFAULT NULL;
ALTER TABLE usuario ADD COLUMN numero VARCHAR(30) NULL DEFAULT NULL;
ALTER TABLE usuario ADD COLUMN cidade VARCHAR(120) NULL DEFAULT NULL;
ALTER TABLE usuario ADD COLUMN complemento VARCHAR(200) NULL DEFAULT NULL;
