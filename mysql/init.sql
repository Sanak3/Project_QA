-- ============================================================
-- AdotaPet - script de inicializacao do MySQL
--
-- O MySQL 8.4+ desabilita o plugin mysql_native_password por padrao.
-- Como root@% e criado com caching_sha2_password (default), clientes
-- como DBeaver/JDBC precisam de SSL ou da flag allowPublicKeyRetrieval
-- para conectar.
--
-- Esse script habilita o plugin (via 'command' do compose) e troca o
-- plugin de root@% para mysql_native_password, deixando a conexao
-- "out of the box" para qualquer cliente padrao.
--
-- Rodado automaticamente pelo entrypoint do MySQL toda vez que o volume
-- mysql_data eh criado do zero (primeiro start ou apos 'docker compose
-- down -v').
-- ============================================================

ALTER USER 'root'@'%'         IDENTIFIED WITH mysql_native_password BY 'root';
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
FLUSH PRIVILEGES;
