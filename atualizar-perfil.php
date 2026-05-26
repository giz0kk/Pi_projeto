<?php
/**
 * Atualização de perfil (POST multipart ou form-urlencoded).
 * Resposta JSON: {"sucesso":true} ou {"sucesso":false,"erro":"..."}
 *
 * Integração: edicaoperfil.js (fetch), form action em edicaoperfil_body.inc.php
 */
ini_set("display_errors", "0");
error_reporting(0);

session_start();
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/conexao.php";

if (empty($_SESSION["usuario_id"]) || (int) $_SESSION["usuario_id"] <= 0) {
    echo json_encode(["sucesso" => false, "erro" => "Sessao expirada. Faca login novamente."], JSON_UNESCAPED_UNICODE);
    exit;
}

$uid = (int) $_SESSION["usuario_id"];

function usuarioTemColuna(mysqli $conn, $nome) {
    static $cache = null;
    if ($cache === null) {
        $cache = [];
        $q = $conn->query("SHOW COLUMNS FROM usuario");
        if ($q) {
            while ($row = $q->fetch_assoc()) {
                $cache[$row["Field"]] = true;
            }
        }
    }
    return !empty($cache[$nome]);
}

function numeroValido($numero) {
    $n = trim((string) $numero);
    if ($n === "") {
        return true;
    }
    if (strtoupper($n) === "S/N") {
        return true;
    }
    return (bool) preg_match("/^[0-9]+[A-Za-z]?$/", $n)
        || (bool) preg_match("/^[0-9]+-[A-Za-z0-9]+$/", $n);
}

/**
 * Pasta uploads na raiz do projeto (cria se não existir).
 * @return string|false caminho absoluto ou false se não puder usar
 */
function obterDiretorioUploadsPerfil() {
    $dir = __DIR__ . DIRECTORY_SEPARATOR . "uploads";
    if (!is_dir($dir)) {
        if (!@mkdir($dir, 0755, true) && !is_dir($dir)) {
            return false;
        }
    }
    return is_writable($dir) ? $dir : false;
}

/** Caminho relativo na URL (coluna foto_perfil) */
function uploadsUrlRelativaPerfil() {
    return "uploads/";
}

function stmtSelectOneInt(mysqli $conn, $sql, $types, array $params) {
    if ($types !== "" && strlen($types) !== count($params)) {
        return null;
    }
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        return null;
    }
    if ($types !== "") {
        $bind = [$types];
        foreach (array_keys($params) as $k) {
            $bind[] = &$params[$k];
        }
        call_user_func_array([$stmt, "bind_param"], $bind);
    }
    if (!$stmt->execute()) {
        $stmt->close();
        return null;
    }
    $out = null;
    $stmt->bind_result($out);
    $found = $stmt->fetch();
    $stmt->close();
    return $found && $out !== null ? (int) $out : null;
}

function obterOuCriarIdBairro(mysqli $conn, $nomeBairro) {
    $nomeBairro = trim((string) $nomeBairro);
    if ($nomeBairro === "") {
        return null;
    }
    $id = stmtSelectOneInt(
        $conn,
        "SELECT id_bairro FROM bairro WHERE nome_bairro = ? LIMIT 1",
        "s",
        [$nomeBairro]
    );
    if ($id !== null && $id > 0) {
        return $id;
    }

    $ins = $conn->prepare("INSERT INTO bairro (nome_bairro) VALUES (?)");
    if (!$ins) {
        return null;
    }
    $ins->bind_param("s", $nomeBairro);
    if (!$ins->execute()) {
        $ins->close();
        return null;
    }
    $id = (int) $conn->insert_id;
    $ins->close();
    return $id > 0 ? $id : null;
}

function obterOuCriarIdRua(mysqli $conn, $nomeRua, $idBairro) {
    $nomeRua = trim((string) $nomeRua);
    $idBairro = (int) $idBairro;
    if ($nomeRua === "" || $idBairro <= 0) {
        return null;
    }

    $id = stmtSelectOneInt(
        $conn,
        "SELECT id_rua FROM rua WHERE nome_rua = ? AND id_bairro = ? LIMIT 1",
        "si",
        [$nomeRua, $idBairro]
    );
    if ($id !== null && $id > 0) {
        return $id;
    }

    $ins = $conn->prepare("INSERT INTO rua (nome_rua, id_bairro) VALUES (?, ?)");
    if (!$ins) {
        return null;
    }
    $ins->bind_param("si", $nomeRua, $idBairro);
    if (!$ins->execute()) {
        $ins->close();
        return null;
    }
    $id = (int) $conn->insert_id;
    $ins->close();
    return $id > 0 ? $id : null;
}

$email = trim((string) ($_POST["email"] ?? ""));
$confirmEmail = trim((string) ($_POST["confirmaremail"] ?? ""));
$senha = (string) ($_POST["senha"] ?? "");
$confirmSenha = (string) ($_POST["confirmarsenha"] ?? "");

$endereco = trim((string) ($_POST["endereco"] ?? ""));
$bairroNome = trim((string) ($_POST["bairro"] ?? ""));
$numero = trim((string) ($_POST["numero"] ?? ""));
$cidade = trim((string) ($_POST["cidade"] ?? ""));
$complemento = trim((string) ($_POST["complemento"] ?? ""));

if ($email === "" || $confirmEmail === "") {
    echo json_encode(["sucesso" => false, "erro" => "Preencha o e-mail e a confirmacao."], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($email !== $confirmEmail) {
    echo json_encode(["sucesso" => false, "erro" => "Os e-mails nao coincidem."], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["sucesso" => false, "erro" => "E-mail invalido."], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($senha !== $confirmSenha) {
    echo json_encode(["sucesso" => false, "erro" => "As senhas nao coincidem."], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($senha !== "" && strlen($senha) < 8) {
    echo json_encode(["sucesso" => false, "erro" => "Senha deve ter pelo menos 8 caracteres."], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($senha !== "" && !preg_match("/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/", $senha)) {
    echo json_encode(["sucesso" => false, "erro" => "Senha deve conter maiuscula, minuscula e numero."], JSON_UNESCAPED_UNICODE);
    exit;
}

if (usuarioTemColuna($conn, "numero") && $numero !== "" && !numeroValido($numero)) {
    echo json_encode([
        "sucesso" => false,
        "erro" => "Numero invalido! Use formatos como 32, 32A, 100-B ou S/N.",
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$fotoPath = null;
if (usuarioTemColuna($conn, "foto_perfil")) {
    $fotoFile = (isset($_FILES["foto"]) && is_array($_FILES["foto"])) ? $_FILES["foto"] : null;
    $querBase64 = !empty($_POST["foto_base64"]) && is_string($_POST["foto_base64"]);
    $querFile = $fotoFile && !empty($fotoFile["tmp_name"]) && is_uploaded_file((string) $fotoFile["tmp_name"]);

    if ($querFile || $querBase64) {
        $dir = obterDiretorioUploadsPerfil();
        if ($dir === false) {
            echo json_encode([
                "sucesso" => false,
                "erro" => "Pasta uploads indisponivel. Crie projeto_pi/uploads com permissao de escrita para o Apache.",
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $rel = uploadsUrlRelativaPerfil();

        if ($querFile) {
            $tmp = (string) $fotoFile["tmp_name"];
            $mime = function_exists("mime_content_type") ? mime_content_type($tmp) : (string) ($fotoFile["type"] ?? "");
            if (strpos((string) $mime, "image/") === 0) {
                $orig = isset($fotoFile["name"]) ? basename((string) $fotoFile["name"]) : "foto";
                $orig = preg_replace("/[^a-zA-Z0-9._-]/", "_", $orig);
                if ($orig === "" || $orig === "_") {
                    $orig = "foto.jpg";
                }
                $nomeArq = time() . "_" . $uid . "_" . $orig;
                $destinoFs = $dir . DIRECTORY_SEPARATOR . $nomeArq;
                if (@move_uploaded_file($tmp, $destinoFs)) {
                    $fotoPath = $rel . $nomeArq;
                }
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
                    $nomeArq = time() . "_" . $uid . "_preview." . $ext;
                    $destinoFs = $dir . DIRECTORY_SEPARATOR . $nomeArq;
                    if (@file_put_contents($destinoFs, $bin) !== false) {
                        $fotoPath = $rel . $nomeArq;
                    }
                }
            }
        }

        if ($fotoPath === null) {
            echo json_encode([
                "sucesso" => false,
                "erro" => "Nao foi possivel salvar a foto. Use PNG, JPG ou WebP.",
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}

$idRua = null;
$conn->begin_transaction();
try {
    if ($bairroNome !== "" && $endereco !== "") {
        $idB = obterOuCriarIdBairro($conn, $bairroNome);
        if ($idB === null) {
            throw new Exception("bairro");
        }
        $idRua = obterOuCriarIdRua($conn, $endereco, $idB);
        if ($idRua === null) {
            throw new Exception("rua");
        }
    }

    if ($senha !== "") {
        $hash = password_hash($senha, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE usuario SET email = ?, senha_hash = ? WHERE id_usuario = ? LIMIT 1");
        if (!$stmt) {
            throw new Exception("prepare");
        }
        $stmt->bind_param("ssi", $email, $hash, $uid);
        if (!$stmt->execute()) {
            if ((int) $conn->errno === 1062) {
                $conn->rollback();
                echo json_encode(["sucesso" => false, "erro" => "Este e-mail ja esta em uso."], JSON_UNESCAPED_UNICODE);
                exit;
            }
            throw new Exception("exec");
        }
        $stmt->close();
    } else {
        $stmt = $conn->prepare("UPDATE usuario SET email = ? WHERE id_usuario = ? LIMIT 1");
        if (!$stmt) {
            throw new Exception("prepare");
        }
        $stmt->bind_param("si", $email, $uid);
        if (!$stmt->execute()) {
            if ((int) $conn->errno === 1062) {
                $conn->rollback();
                echo json_encode(["sucesso" => false, "erro" => "Este e-mail ja esta em uso."], JSON_UNESCAPED_UNICODE);
                exit;
            }
            throw new Exception("exec");
        }
        $stmt->close();
    }

    $sets = [];
    $types = "";
    $vals = [];

    if (usuarioTemColuna($conn, "foto_perfil") && $fotoPath !== null) {
        $sets[] = "foto_perfil = ?";
        $types .= "s";
        $vals[] = $fotoPath;
    }
    if (usuarioTemColuna($conn, "numero") && $numero !== "") {
        $sets[] = "numero = ?";
        $types .= "s";
        $vals[] = $numero;
    }
    if (usuarioTemColuna($conn, "cidade") && $cidade !== "") {
        $sets[] = "cidade = ?";
        $types .= "s";
        $vals[] = $cidade;
    }
    if (usuarioTemColuna($conn, "complemento") && $complemento !== "") {
        $sets[] = "complemento = ?";
        $types .= "s";
        $vals[] = $complemento;
    }
    if ($idRua !== null) {
        $sets[] = "id_rua = ?";
        $types .= "i";
        $vals[] = $idRua;
    }

    if (!empty($sets)) {
        $sql = "UPDATE usuario SET " . implode(", ", $sets) . " WHERE id_usuario = ? LIMIT 1";
        $stmt2 = $conn->prepare($sql);
        if (!$stmt2) {
            throw new Exception("prepare2");
        }
        $types2 = $types . "i";
        $vals[] = $uid;
        $bindArgs = [$types2];
        foreach ($vals as $k => $_) {
            $bindArgs[] = &$vals[$k];
        }
        call_user_func_array([$stmt2, "bind_param"], $bindArgs);
        if (!$stmt2->execute()) {
            throw new Exception("exec2");
        }
        $stmt2->close();
    }

    $conn->commit();
    $_SESSION["usuario_email"] = $email;
    $payload = ["sucesso" => true, "mensagem" => "Perfil atualizado."];
    if ($fotoPath !== null) {
        $payload["foto_perfil"] = $fotoPath;
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    $conn->rollback();
    echo json_encode(["sucesso" => false, "erro" => "Nao foi possivel salvar. Tente novamente."], JSON_UNESCAPED_UNICODE);
}
