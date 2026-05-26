<?php
/**
 * Proxy simples para Nominatim (OpenStreetMap) — necessário para User-Agent válido e uso estável no XAMPP.
 * Documentação de uso: https://operations.osmfoundation.org/policies/nominatim/
 */
header('Content-Type: application/json; charset=utf-8');

$q = isset($_GET['q']) ? trim((string) $_GET['q']) : '';
if (strlen($q) < 4 || strlen($q) > 240) {
  echo json_encode([]);
  exit;
}

$url = 'https://nominatim.openstreetmap.org/search?format=json&limit=3&countrycodes=br&q=' . rawurlencode($q);

$ctx = stream_context_create([
  'http' => [
    'header' => "User-Agent: EcoColeta-ProjetoPI/1.0 (uso educacional)\r\nAccept-Language: pt-BR,pt;q=0.9\r\n",
    'timeout' => 15,
    'ignore_errors' => true,
  ],
]);

$body = @file_get_contents($url, false, $ctx);
if ($body === false || $body === '') {
  http_response_code(502);
  echo json_encode(['_proxy_error' => 'upstream']);
  exit;
}

$data = json_decode($body, true);
if (!is_array($data)) {
  http_response_code(502);
  echo json_encode(['_proxy_error' => 'parse']);
  exit;
}

echo json_encode($data);
