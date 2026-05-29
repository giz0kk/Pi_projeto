<?php
/**
 * Funções compartilhadas — administrador da plataforma EcoColeta.
 */
require_once __DIR__ . "/stmt_helpers.php";

function ecoplat_json_erro(string $msg, int $code = 200): void
{
    http_response_code($code);
    echo json_encode(["sucesso" => false, "erro" => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

function ecoplat_json_ok(array $payload = []): void
{
    echo json_encode(array_merge(["sucesso" => true], $payload), JSON_UNESCAPED_UNICODE);
    exit;
}

function ecoplat_exigir_sessao(): int
{
    if (empty($_SESSION["ecocoleta_plat_admin_id"]) || (int) $_SESSION["ecocoleta_plat_admin_id"] <= 0) {
        ecoplat_json_erro("Sessao da plataforma expirada. Faca login novamente.");
    }
    return (int) $_SESSION["ecocoleta_plat_admin_id"];
}

function ecoplat_encerrar_sessao(): void
{
    unset(
        $_SESSION["ecocoleta_plat_admin_id"],
        $_SESSION["ecocoleta_plat_admin_nome"],
        $_SESSION["ecocoleta_plat_admin_email"],
        $_SESSION["ecocoleta_plat_admin_cargo"]
    );
}

function ecoplat_payload_sessao(): array
{
    return [
        "id" => (int) ($_SESSION["ecocoleta_plat_admin_id"] ?? 0),
        "nome" => (string) ($_SESSION["ecocoleta_plat_admin_nome"] ?? "Administrador"),
        "email" => (string) ($_SESSION["ecocoleta_plat_admin_email"] ?? ""),
        "cargo" => (string) ($_SESSION["ecocoleta_plat_admin_cargo"] ?? "Administrador da plataforma"),
    ];
}
