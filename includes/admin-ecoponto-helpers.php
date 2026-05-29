<?php
/**
 * Funções compartilhadas — administrador EcoPonto (perfil e preferências).
 */
require_once __DIR__ . "/stmt_helpers.php";

function ecoadm_json_erro(string $msg, int $code = 200): void
{
    http_response_code($code);
    echo json_encode(["sucesso" => false, "erro" => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

function ecoadm_json_ok(array $payload = []): void
{
    echo json_encode(array_merge(["sucesso" => true], $payload), JSON_UNESCAPED_UNICODE);
    exit;
}

function ecoadm_exigir_sessao(): int
{
    if (empty($_SESSION["ecoponto_admin_id"]) || (int) $_SESSION["ecoponto_admin_id"] <= 0) {
        ecoadm_json_erro("Sessao administrativa expirada. Faca login novamente.");
    }
    return (int) $_SESSION["ecoponto_admin_id"];
}

function ecoadm_admin_tem_coluna(mysqli $conn, string $nome): bool
{
    static $cache = null;
    if ($cache === null) {
        $cache = [];
        $q = @$conn->query("SHOW COLUMNS FROM administrador_ecoponto");
        if ($q) {
            while ($row = $q->fetch_assoc()) {
                $cache[$row["Field"]] = true;
            }
            $q->free();
        }
    }
    return !empty($cache[$nome]);
}

function ecoadm_garantir_colunas_admin(mysqli $conn): void
{
    if (!ecoadm_admin_tem_coluna($conn, "foto_perfil")) {
        @$conn->query(
            "ALTER TABLE administrador_ecoponto
             ADD COLUMN foto_perfil VARCHAR(255) NULL DEFAULT NULL AFTER nome_ecoponto"
        );
    }
    if (!ecoadm_admin_tem_coluna($conn, "preferencias_json")) {
        @$conn->query(
            "ALTER TABLE administrador_ecoponto
             ADD COLUMN preferencias_json MEDIUMTEXT NULL DEFAULT NULL AFTER foto_perfil"
        );
    }
}

function ecoadm_preferencias_padrao(): array
{
    return [
        "idioma" => "pt-BR",
        "notificacoes" => true,
        "tema" => "light",
        "horarios" => "08:00-17:00",
        "tipo_coleta" => "truck",
        "dois_fatores" => true,
        "areas_atendidas" => ["Centro", "Zona Norte", "Zona Sul"],
    ];
}

function ecoadm_normalizar_preferencias($raw): array
{
    $padrao = ecoadm_preferencias_padrao();
    if (!is_array($raw)) {
        return $padrao;
    }

    $out = $padrao;
    if (isset($raw["idioma"]) && is_string($raw["idioma"]) && $raw["idioma"] !== "") {
        $out["idioma"] = $raw["idioma"];
    }
    if (array_key_exists("notificacoes", $raw)) {
        $out["notificacoes"] = (bool) $raw["notificacoes"];
    }
    if (isset($raw["tema"]) && in_array($raw["tema"], ["light", "dark"], true)) {
        $out["tema"] = $raw["tema"];
    }
    if (isset($raw["horarios"]) && is_string($raw["horarios"]) && $raw["horarios"] !== "") {
        $out["horarios"] = $raw["horarios"];
    }
    if (isset($raw["tipo_coleta"])) {
        $tipo = (string) $raw["tipo_coleta"];
        if ($tipo === "manual") {
            $tipo = "prefeitura";
        }
        if (in_array($tipo, ["truck", "prefeitura"], true)) {
            $out["tipo_coleta"] = $tipo;
        }
    }
    if (array_key_exists("dois_fatores", $raw)) {
        $out["dois_fatores"] = (bool) $raw["dois_fatores"];
    }
    if (isset($raw["areas_atendidas"]) && is_array($raw["areas_atendidas"])) {
        $areas = [];
        foreach ($raw["areas_atendidas"] as $a) {
            $t = trim((string) $a);
            if ($t !== "") {
                $areas[] = $t;
            }
        }
        if (!empty($areas)) {
            $out["areas_atendidas"] = array_values($areas);
        }
    }

    return $out;
}

function ecoadm_sync_sessao_admin(array $row): void
{
    $_SESSION["ecoponto_admin_nome"] = (string) ($row["nome"] ?? "Administrador");
    $_SESSION["ecoponto_admin_email"] = (string) ($row["email"] ?? "");
    $_SESSION["ecoponto_admin_nome_ecoponto"] = (string) ($row["nome_ecoponto"] ?? "EcoPonto parceiro");
    if (array_key_exists("foto_perfil", $row) && $row["foto_perfil"] !== null && $row["foto_perfil"] !== "") {
        $_SESSION["ecoponto_admin_foto"] = (string) $row["foto_perfil"];
    }
}

function ecoadm_diretorio_uploads(): string|false
{
    $dir = __DIR__ . DIRECTORY_SEPARATOR . "uploads";
    if (!is_dir($dir)) {
        if (!@mkdir($dir, 0755, true) && !is_dir($dir)) {
            return false;
        }
    }
    return is_writable($dir) ? $dir : false;
}

function ecoadm_processar_foto_upload(int $idAdmin): string|null
{
    $fotoFile = (isset($_FILES["foto"]) && is_array($_FILES["foto"])) ? $_FILES["foto"] : null;
    $querBase64 = !empty($_POST["foto_base64"]) && is_string($_POST["foto_base64"]);
    $querFile = $fotoFile && !empty($fotoFile["tmp_name"]) && is_uploaded_file((string) $fotoFile["tmp_name"]);

    if (!$querFile && !$querBase64) {
        return null;
    }

    $dir = ecoadm_diretorio_uploads();
    if ($dir === false) {
        ecoadm_json_erro("Pasta uploads indisponivel. Crie projeto_pi/uploads com permissao de escrita.");
    }

    $rel = "uploads/";

    if ($querFile) {
        $tmp = (string) $fotoFile["tmp_name"];
        $mime = function_exists("mime_content_type") ? mime_content_type($tmp) : (string) ($fotoFile["type"] ?? "");
        if (strpos((string) $mime, "image/") !== 0) {
            ecoadm_json_erro("Arquivo de foto invalido. Use PNG, JPG ou WebP.");
        }
        $orig = isset($fotoFile["name"]) ? basename((string) $fotoFile["name"]) : "foto";
        $orig = preg_replace("/[^a-zA-Z0-9._-]/", "_", $orig);
        if ($orig === "" || $orig === "_") {
            $orig = "foto.jpg";
        }
        $nomeArq = "adm_" . time() . "_" . $idAdmin . "_" . $orig;
        $destinoFs = $dir . DIRECTORY_SEPARATOR . $nomeArq;
        if (@move_uploaded_file($tmp, $destinoFs)) {
            return $rel . $nomeArq;
        }
    } elseif ($querBase64) {
        $raw = (string) $_POST["foto_base64"];
        if (preg_match("#^data:image/(png|jpeg|jpg|webp);base64,#i", $raw, $m)) {
            $ext = strtolower($m[1]);
            if ($ext === "jpeg") {
                $ext = "jpg";
            }
            $data = preg_replace("#^data:image/[^;]+;base64,#", "", $raw);
            $bin = base64_decode($data, true);
            if ($bin !== false && strlen($bin) > 0 && strlen($bin) < 6 * 1024 * 1024) {
                $nomeArq = "adm_" . time() . "_" . $idAdmin . "_preview." . $ext;
                $destinoFs = $dir . DIRECTORY_SEPARATOR . $nomeArq;
                if (@file_put_contents($destinoFs, $bin) !== false) {
                    return $rel . $nomeArq;
                }
            }
        }
    }

    ecoadm_json_erro("Nao foi possivel salvar a foto. Use PNG, JPG ou WebP.");
}

function ecoadm_validar_email_senha(): array
{
    $email = trim((string) ($_POST["email"] ?? ""));
    $confirmEmail = trim((string) ($_POST["confirmaremail"] ?? ""));
    $senha = (string) ($_POST["senha"] ?? "");
    $confirmSenha = (string) ($_POST["confirmarsenha"] ?? "");

    if ($email === "" || $confirmEmail === "") {
        ecoadm_json_erro("Preencha o e-mail e a confirmacao.");
    }
    if ($email !== $confirmEmail) {
        ecoadm_json_erro("Os e-mails nao coincidem.");
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        ecoadm_json_erro("E-mail invalido.");
    }
    if ($senha !== $confirmSenha) {
        ecoadm_json_erro("As senhas nao coincidem.");
    }
    if ($senha !== "" && strlen($senha) < 8) {
        ecoadm_json_erro("Senha deve ter pelo menos 8 caracteres.");
    }
    if ($senha !== "" && !preg_match("/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/", $senha)) {
        ecoadm_json_erro("Senha deve conter maiuscula, minuscula e numero.");
    }

    return [$email, $senha];
}
