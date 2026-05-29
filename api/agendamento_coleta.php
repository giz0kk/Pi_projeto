<?php
ini_set("display_errors", "0");
error_reporting(0);

session_start();
header("Content-Type: application/json; charset=utf-8");

require_once dirname(__DIR__) . "/includes/conexao.php";
require_once dirname(__DIR__) . "/includes/notificacoes_helper.php";

if (empty($_SESSION["usuario_id"]) || (int) $_SESSION["usuario_id"] <= 0) {
    echo json_encode([
        "sucesso" => false,
        "erro" => "Sessao expirada. Faca login novamente.",
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$usuarioId = (int) $_SESSION["usuario_id"];
$acao = trim((string) ($_POST["acao"] ?? $_GET["acao"] ?? ""));

if ($acao === "") {
    echo json_encode(["sucesso" => false, "erro" => "Informe acao."], JSON_UNESCAPED_UNICODE);
    exit;
}

function ecocoleta_ensure_agendamento_coleta_table(mysqli $conn): bool
{
    $sql = "CREATE TABLE IF NOT EXISTS agendamento_coleta_morador (
        id_agendamento INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT NOT NULL,
        data_coleta DATE NOT NULL,
        slot_ordem TINYINT UNSIGNED NOT NULL,
        criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_agendamento_usuario_data_slot (id_usuario, data_coleta, slot_ordem),
        KEY idx_agendamento_usuario_data (id_usuario, data_coleta),
        CONSTRAINT fk_agendamento_coleta_usuario
            FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
            ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    return (bool) @$conn->query($sql);
}

if (!ecocoleta_tabela_existe($conn, "agendamento_coleta_morador") && !ecocoleta_ensure_agendamento_coleta_table($conn)) {
    echo json_encode([
        "sucesso" => false,
        "erro" => "Modulo de agendamento indisponivel. Atualize o banco de dados.",
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($acao === "listar") {
    $desde = trim((string) ($_GET["desde"] ?? $_POST["desde"] ?? date("Y-m-d")));
    $ate = trim((string) ($_GET["ate"] ?? $_POST["ate"] ?? ""));

    if (!preg_match("/^\d{4}-\d{2}-\d{2}$/", $desde)) {
        $desde = date("Y-m-d");
    }

    $sql = "SELECT id_agendamento, data_coleta, slot_ordem
            FROM agendamento_coleta_morador
            WHERE id_usuario = ? AND data_coleta >= ?";
    if ($ate !== "" && preg_match("/^\d{4}-\d{2}-\d{2}$/", $ate)) {
        $sql .= " AND data_coleta <= ?";
    }
    $sql .= " ORDER BY data_coleta ASC, slot_ordem ASC";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(["sucesso" => false, "erro" => "Erro ao listar agendamentos."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($ate !== "" && preg_match("/^\d{4}-\d{2}-\d{2}$/", $ate)) {
        $stmt->bind_param("iss", $usuarioId, $desde, $ate);
    } else {
        $stmt->bind_param("is", $usuarioId, $desde);
    }

    if (!$stmt->execute()) {
        $stmt->close();
        echo json_encode(["sucesso" => false, "erro" => "Erro ao consultar agendamentos."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $lista = [];
    foreach (ecocoleta_stmt_fetch_all_assoc($stmt) as $row) {
        $slot = (int) $row["slot_ordem"];
        $lista[] = [
            "id_agendamento" => (int) $row["id_agendamento"],
            "data_coleta" => (string) $row["data_coleta"],
            "slot_ordem" => $slot,
            "faixa_horario" => ecocoleta_faixa_horario_coleta($slot),
        ];
    }
    $stmt->close();

    echo json_encode([
        "sucesso" => true,
        "agendamentos" => $lista,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["sucesso" => false, "erro" => "Use POST para esta acao."], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($acao === "agendar") {
    $dataColeta = trim((string) ($_POST["data_coleta"] ?? ""));
    $slotOrdem = (int) ($_POST["slot_ordem"] ?? -1);

    if (!preg_match("/^\d{4}-\d{2}-\d{2}$/", $dataColeta)) {
        echo json_encode(["sucesso" => false, "erro" => "Data invalida."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($slotOrdem < 0 || $slotOrdem > 4) {
        echo json_encode(["sucesso" => false, "erro" => "Horario invalido."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $hoje = date("Y-m-d");
    if ($dataColeta < $hoje) {
        echo json_encode([
            "sucesso" => false,
            "erro" => "Nao e possivel agendar coleta em data passada.",
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $conn->prepare(
        "INSERT INTO agendamento_coleta_morador (id_usuario, data_coleta, slot_ordem)
         VALUES (?, ?, ?)"
    );
    if (!$stmt) {
        echo json_encode(["sucesso" => false, "erro" => "Erro ao agendar coleta."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt->bind_param("isi", $usuarioId, $dataColeta, $slotOrdem);
    if (!$stmt->execute()) {
        if ((int) $conn->errno === 1062) {
            $stmt->close();
            echo json_encode([
                "sucesso" => false,
                "erro" => "Este horario ja esta agendado.",
                "erro_codigo" => "ja_agendado",
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $stmt->close();
        echo json_encode(["sucesso" => false, "erro" => "Erro ao salvar agendamento."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $idAgendamento = (int) $conn->insert_id;
    $stmt->close();

    if ($idAgendamento > 0) {
        ecocoleta_notif_agendamento($conn, $usuarioId, $idAgendamento, $dataColeta, $slotOrdem);
    }

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Coleta agendada com sucesso.",
        "id_agendamento" => $idAgendamento,
        "data_coleta" => $dataColeta,
        "slot_ordem" => $slotOrdem,
        "faixa_horario" => ecocoleta_faixa_horario_coleta($slotOrdem),
        "notificacao_criada" => $idAgendamento > 0,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($acao === "cancelar") {
    $idAgendamento = (int) ($_POST["id_agendamento"] ?? 0);
    $dataColeta = trim((string) ($_POST["data_coleta"] ?? ""));
    $slotOrdem = (int) ($_POST["slot_ordem"] ?? -1);

    if ($idAgendamento > 0) {
        $stmt = $conn->prepare(
            "DELETE FROM agendamento_coleta_morador
             WHERE id_agendamento = ? AND id_usuario = ?"
        );
        if (!$stmt) {
            echo json_encode(["sucesso" => false, "erro" => "Erro ao cancelar."], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $stmt->bind_param("ii", $idAgendamento, $usuarioId);
    } elseif (preg_match("/^\d{4}-\d{2}-\d{2}$/", $dataColeta) && $slotOrdem >= 0 && $slotOrdem <= 4) {
        $stmt = $conn->prepare(
            "DELETE FROM agendamento_coleta_morador
             WHERE id_usuario = ? AND data_coleta = ? AND slot_ordem = ?"
        );
        if (!$stmt) {
            echo json_encode(["sucesso" => false, "erro" => "Erro ao cancelar."], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $stmt->bind_param("isi", $usuarioId, $dataColeta, $slotOrdem);
    } else {
        echo json_encode([
            "sucesso" => false,
            "erro" => "Informe id_agendamento ou data_coleta com slot_ordem.",
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!$stmt->execute() || $stmt->affected_rows === 0) {
        $stmt->close();
        echo json_encode([
            "sucesso" => false,
            "erro" => "Agendamento nao encontrado.",
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $stmt->close();

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Agendamento cancelado.",
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(["sucesso" => false, "erro" => "Acao invalida."], JSON_UNESCAPED_UNICODE);
