<?php
/**
 * Perfil do administrador EcoPonto (GET JSON).
 * Baseado em meu_perfil.php — sem endereco; inclui preferencias do painel.
 */
ini_set("display_errors", "0");
error_reporting(0);

session_start();
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate");

require_once dirname(__DIR__) . "/includes/conexao.php";
require_once dirname(__DIR__) . "/includes/admin-ecoponto-helpers.php";

$idAdmin = ecoadm_exigir_sessao();
ecoadm_garantir_colunas_admin($conn);

$cols = "id_admin, nome, email, nome_ecoponto, status";
if (ecoadm_admin_tem_coluna($conn, "foto_perfil")) {
    $cols .= ", foto_perfil";
}
if (ecoadm_admin_tem_coluna($conn, "preferencias_json")) {
    $cols .= ", preferencias_json";
}

$sql = "SELECT {$cols} FROM administrador_ecoponto WHERE id_admin = ? LIMIT 1";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    ecoadm_json_erro("Erro ao preparar consulta do perfil administrativo.");
}

$stmt->bind_param("i", $idAdmin);
if (!$stmt->execute()) {
    $stmt->close();
    ecoadm_json_erro("Erro ao carregar perfil administrativo.");
}

$row = ecocoleta_stmt_fetch_one_assoc($stmt);
$stmt->close();

if (!$row) {
    ecoadm_json_erro("Administrador nao encontrado.");
}

ecoadm_sync_sessao_admin($row);

$preferencias = ecoadm_preferencias_padrao();
if (
    ecoadm_admin_tem_coluna($conn, "preferencias_json")
    && !empty($row["preferencias_json"])
) {
    $decoded = json_decode((string) $row["preferencias_json"], true);
    $preferencias = ecoadm_normalizar_preferencias($decoded);
}

$admin = [
    "id" => (int) $row["id_admin"],
    "nome" => (string) $row["nome"],
    "email" => (string) $row["email"],
    "ecoponto" => (string) $row["nome_ecoponto"],
    "status" => (string) $row["status"],
    "preferencias" => $preferencias,
];

if (
    ecoadm_admin_tem_coluna($conn, "foto_perfil")
    && !empty($row["foto_perfil"])
) {
    $admin["foto_perfil"] = (string) $row["foto_perfil"];
}

ecoadm_json_ok([
    "admin" => $admin,
    "mensagem" => "Perfil administrativo carregado.",
]);
