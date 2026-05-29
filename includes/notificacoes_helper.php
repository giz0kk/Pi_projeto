<?php

if (!function_exists("ecocoleta_ensure_notificacao_table")) {
    function ecocoleta_ensure_notificacao_table(mysqli $conn): bool
    {
        static $ok = null;
        if ($ok === true) {
            return true;
        }

        $sql = "CREATE TABLE IF NOT EXISTS notificacao (
            id_notificacao INT AUTO_INCREMENT PRIMARY KEY,
            id_usuario INT NOT NULL,
            tipo VARCHAR(32) NOT NULL DEFAULT 'sistema',
            prioridade ENUM('normal', 'importante') NOT NULL DEFAULT 'normal',
            titulo VARCHAR(160) NOT NULL,
            mensagem TEXT NOT NULL,
            icone VARCHAR(16) NULL,
            badge_texto VARCHAR(32) NULL,
            ref_tipo VARCHAR(32) NULL,
            ref_id INT NULL,
            lida TINYINT(1) NOT NULL DEFAULT 0,
            criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            lida_em DATETIME NULL,
            KEY idx_usuario_lista (id_usuario, lida, criado_em),
            UNIQUE KEY uq_usuario_ref (id_usuario, ref_tipo, ref_id),
            CONSTRAINT fk_notificacao_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        if (!@$conn->query($sql)) {
            return false;
        }

        $ok = true;
        return true;
    }
}

if (!function_exists("ecocoleta_notif_inserir")) {
  function ecocoleta_notif_inserir(
        mysqli $conn,
        int $idUsuario,
        string $tipo,
        string $prioridade,
        string $titulo,
        string $mensagem,
        ?string $icone = null,
        ?string $badgeTexto = null,
        ?string $refTipo = null,
        ?int $refId = null
    ): bool {
        if (!ecocoleta_ensure_notificacao_table($conn)) {
            return false;
        }

        if ($refTipo !== null && $refId !== null && $refId > 0) {
            $chk = $conn->prepare(
                "SELECT id_notificacao FROM notificacao
                 WHERE id_usuario = ? AND ref_tipo = ? AND ref_id = ? LIMIT 1"
            );
            if ($chk) {
                $chk->bind_param("isi", $idUsuario, $refTipo, $refId);
                $chk->execute();
                if (ecocoleta_stmt_num_rows($chk) > 0) {
                    $chk->close();
                    return true;
                }
                $chk->close();
            }
        }

        if ($refTipo !== null && $refId !== null && $refId > 0) {
            $stmt = $conn->prepare(
                "INSERT INTO notificacao
                    (id_usuario, tipo, prioridade, titulo, mensagem, icone, badge_texto, ref_tipo, ref_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            if (!$stmt) {
                return false;
            }
            $stmt->bind_param(
                "isssssssi",
                $idUsuario,
                $tipo,
                $prioridade,
                $titulo,
                $mensagem,
                $icone,
                $badgeTexto,
                $refTipo,
                $refId
            );
        } else {
            $stmt = $conn->prepare(
                "INSERT INTO notificacao
                    (id_usuario, tipo, prioridade, titulo, mensagem, icone, badge_texto)
                 VALUES (?, ?, ?, ?, ?, ?, ?)"
            );
            if (!$stmt) {
                return false;
            }
            $stmt->bind_param(
                "issssss",
                $idUsuario,
                $tipo,
                $prioridade,
                $titulo,
                $mensagem,
                $icone,
                $badgeTexto
            );
        }

        $ok = $stmt->execute();
        $stmt->close();
        return (bool) $ok;
    }
}

if (!function_exists("ecocoleta_faixa_horario_coleta")) {
    function ecocoleta_faixa_horario_coleta(int $slotOrdem): string
    {
        $faixas = [
            0 => "07:00 às 10:00",
            1 => "10:00 às 13:00",
            2 => "13:00 às 16:00",
            3 => "16:00 às 19:00",
            4 => "19:00 às 22:00",
        ];

        return $faixas[$slotOrdem] ?? "horário agendado";
    }
}

if (!function_exists("ecocoleta_notif_entrega")) {
    function ecocoleta_notif_entrega(
        mysqli $conn,
        int $idUsuario,
        int $idEntrega,
        int $pontos,
        string $nomePonto
    ): void {
        $nomePonto = trim($nomePonto) !== "" ? trim($nomePonto) : "EcoPonto";
        ecocoleta_notif_inserir(
            $conn,
            $idUsuario,
            "pontos",
            "normal",
            "EcoPoints recebidos",
            "Você ganhou " . $pontos . " pontos pela reciclagem em " . $nomePonto . ".",
            "yellow",
            "+" . $pontos . " pts",
            "entrega",
            $idEntrega
        );
    }
}

if (!function_exists("ecocoleta_notif_agendamento")) {
    function ecocoleta_notif_agendamento(
        mysqli $conn,
        int $idUsuario,
        int $idAgendamento,
        string $dataColeta,
        int $slotOrdem
    ): void {
        $ts = strtotime($dataColeta);
        $dataBr = $ts !== false ? date("d/m/Y", $ts) : $dataColeta;
        $hora = ecocoleta_faixa_horario_coleta($slotOrdem);
        ecocoleta_notif_inserir(
            $conn,
            $idUsuario,
            "coleta",
            "importante",
            "Coleta agendada",
            "Sua coleta foi agendada para " . $dataBr . ", " . $hora . ".",
            "purple",
            null,
            "agendamento",
            $idAgendamento
        );
    }
}

if (!function_exists("ecocoleta_notif_resgate")) {
    function ecocoleta_notif_resgate(mysqli $conn, int $idUsuario, int $idResgate, string $nomePremio, int $pontos): void
    {
        ecocoleta_notif_inserir(
            $conn,
            $idUsuario,
            "resgate",
            "normal",
            "Prêmio resgatado",
            "Você resgatou \"" . $nomePremio . "\" usando " . $pontos . " EcoPoints.",
            "yellow",
            null,
            "resgate",
            $idResgate
        );
    }
}

if (!function_exists("ecocoleta_notif_sincronizar_atividade")) {
    function ecocoleta_notif_sincronizar_atividade(mysqli $conn, int $idUsuario): void
    {
        if (!ecocoleta_ensure_notificacao_table($conn)) {
            return;
        }

        $stmt = $conn->prepare(
            "SELECT e.id_entrega, e.pontos_gerados, e.data_entrega,
                    COALESCE(NULLIF(TRIM(p.nome_ponto), ''), 'EcoPonto') AS nome_ponto
             FROM entrega e
             LEFT JOIN ponto_entrega p ON p.id_pev = e.id_pev
             WHERE e.id_usuario = ? AND e.pontos_gerados > 0
             ORDER BY e.data_entrega DESC
             LIMIT 5"
        );
        if ($stmt) {
            $stmt->bind_param("i", $idUsuario);
            if ($stmt->execute()) {
                foreach (ecocoleta_stmt_fetch_all_assoc($stmt) as $row) {
                    $pts = (int) $row["pontos_gerados"];
                    ecocoleta_notif_inserir(
                        $conn,
                        $idUsuario,
                        "pontos",
                        "normal",
                        "EcoPoints recebidos",
                        "Você ganhou " . $pts . " pontos pela reciclagem em " . $row["nome_ponto"] . ".",
                        "yellow",
                        "+" . $pts . " pts",
                        "entrega",
                        (int) $row["id_entrega"]
                    );
                }
            }
            $stmt->close();
        }

        $stmt = $conn->prepare(
            "SELECT r.id_resgate, r.pontos_utilizados, r.data_resgate,
                    COALESCE(NULLIF(TRIM(b.nome_beneficio), ''), CONCAT('Prêmio #', r.id_beneficio)) AS nome_premio
             FROM resgate r
             LEFT JOIN beneficio b ON b.id_beneficio = r.id_beneficio
             WHERE r.id_usuario = ?
             ORDER BY r.data_resgate DESC
             LIMIT 5"
        );
        if ($stmt) {
            $stmt->bind_param("i", $idUsuario);
            if ($stmt->execute()) {
                foreach (ecocoleta_stmt_fetch_all_assoc($stmt) as $row) {
                    $pts = (int) $row["pontos_utilizados"];
                    ecocoleta_notif_inserir(
                        $conn,
                        $idUsuario,
                        "resgate",
                        "normal",
                        "Prêmio resgatado",
                        "Você resgatou \"" . $row["nome_premio"] . "\" (" . $pts . " EcoPoints).",
                        "yellow",
                        null,
                        "resgate",
                        (int) $row["id_resgate"]
                    );
                }
            }
            $stmt->close();
        }

        if (ecocoleta_tabela_existe($conn, "agendamento_coleta_morador")) {
            $stmt = $conn->prepare(
                "SELECT id_agendamento, data_coleta, slot_ordem
                 FROM agendamento_coleta_morador
                 WHERE id_usuario = ? AND data_coleta >= CURDATE()
                 ORDER BY data_coleta ASC, slot_ordem ASC
                 LIMIT 3"
            );
            if ($stmt) {
                $stmt->bind_param("i", $idUsuario);
                if ($stmt->execute()) {
                    foreach (ecocoleta_stmt_fetch_all_assoc($stmt) as $row) {
                        $slot = (int) $row["slot_ordem"];
                        $hora = ecocoleta_faixa_horario_coleta($slot);
                        $dataBr = date("d/m/Y", strtotime((string) $row["data_coleta"]));
                        ecocoleta_notif_inserir(
                            $conn,
                            $idUsuario,
                            "coleta",
                            "importante",
                            "Coleta agendada",
                            "Lembrete: coleta no dia " . $dataBr . ", " . $hora . ".",
                            "purple",
                            null,
                            "agendamento",
                            (int) $row["id_agendamento"]
                        );
                    }
                }
                $stmt->close();
            }
        }

        $stmt = $conn->prepare("SELECT COUNT(*) AS total FROM notificacao WHERE id_usuario = ?");
        if ($stmt) {
            $stmt->bind_param("i", $idUsuario);
            if ($stmt->execute()) {
                $row = ecocoleta_stmt_fetch_one_assoc($stmt);
                if ($row && (int) $row["total"] === 0) {
                    ecocoleta_notif_inserir(
                        $conn,
                        $idUsuario,
                        "sistema",
                        "importante",
                        "Bem-vindo à EcoColeta",
                        "Novo ponto de coleta disponível próximo a você! Confira o mapa de EcoPontos.",
                        "green",
                        null,
                        "sistema",
                        1
                    );
                }
            }
            $stmt->close();
        }
    }
}

if (!function_exists("ecocoleta_notif_formatar_item")) {
    function ecocoleta_notif_formatar_item(array $row): array
    {
        $ts = $row["criado_em"] ?? null;
        $iso = null;
        if ($ts !== null && $ts !== "") {
            $t = strtotime((string) $ts);
            if ($t !== false) {
                $iso = date("c", $t);
            }
        }

        return [
            "id" => (int) $row["id_notificacao"],
            "tipo" => (string) $row["tipo"],
            "prioridade" => (string) $row["prioridade"],
            "titulo" => (string) $row["titulo"],
            "mensagem" => (string) $row["mensagem"],
            "icone" => $row["icone"] !== null ? (string) $row["icone"] : "bell",
            "badge" => $row["badge_texto"] !== null ? (string) $row["badge_texto"] : null,
            "lida" => (int) $row["lida"] === 1,
            "criado_em" => $iso,
        ];
    }
}
