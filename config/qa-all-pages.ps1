# EcoColeta — QA caixa preta + branca (todas as paginas HTML do projeto)
$ErrorActionPreference = "Continue"
$root = "d:\XAMPP\htdocs\projeto_pi"
$baseUrl = "http://localhost/projeto_pi"
$reportPath = Join-Path $root "docs\QA-RELATORIO-CAIXAS-PRETA-BRANCA.md"

$pages = @(
  @{ Path = "index.html"; Url = "/"; Cat = "Raiz" },
  @{ Path = "pages\tela-inicia.html"; Url = "/pages/tela-inicia.html"; Cat = "Publico" },
  @{ Path = "pages\ecopontos.html"; Url = "/pages/ecopontos.html"; Cat = "Publico" },
  @{ Path = "pages\perfil.html"; Url = "/pages/perfil.html"; Cat = "Publico" },
  @{ Path = "pages\agendar-coleta.html"; Url = "/pages/agendar-coleta.html"; Cat = "Publico" },
  @{ Path = "pages\Ranking.html"; Url = "/pages/Ranking.html"; Cat = "Publico" },
  @{ Path = "pages\quem-somos.html"; Url = "/pages/quem-somos.html"; Cat = "Publico" },
  @{ Path = "pages\como-funciona.html"; Url = "/pages/como-funciona.html"; Cat = "Publico" },
  @{ Path = "pages\premios-disponiveis.html"; Url = "/pages/premios-disponiveis.html"; Cat = "Publico" },
  @{ Path = "pages\edicaoperfil.html"; Url = "/pages/edicaoperfil.html"; Cat = "Publico" },
  @{ Path = "pages\educacao-ambiental.html"; Url = "/pages/educacao-ambiental.html"; Cat = "Publico" },
  @{ Path = "pages\pagina-relatorio.html"; Url = "/pages/pagina-relatorio.html"; Cat = "Publico" },
  @{ Path = "pages\relatorio-mensal.html"; Url = "/pages/relatorio-mensal.html"; Cat = "Publico" },
  @{ Path = "pages\formulario-coleta.html"; Url = "/pages/formulario-coleta.html"; Cat = "Publico" },
  @{ Path = "pages\mapa.html"; Url = "/pages/mapa.html"; Cat = "Publico" },
  @{ Path = "pages\notif-popup.html"; Url = "/pages/notif-popup.html"; Cat = "Publico" },
  @{ Path = "auth\login.html"; Url = "/auth/login.html"; Cat = "Auth" },
  @{ Path = "auth\login-temp.html"; Url = "/auth/login-temp.html"; Cat = "Auth" },
  @{ Path = "auth\cadastro.html"; Url = "/auth/cadastro.html"; Cat = "Auth" },
  @{ Path = "auth\recuperar.html"; Url = "/auth/recuperar.html"; Cat = "Auth" },
  @{ Path = "auth\nova-senha.html"; Url = "/auth/nova-senha.html"; Cat = "Auth" },
  @{ Path = "auth\verificacao.html"; Url = "/auth/verificacao.html"; Cat = "Auth" },
  @{ Path = "auth\verificar-cadastro.html"; Url = "/auth/verificar-cadastro.html"; Cat = "Auth" },
  @{ Path = "auth\resetar.html"; Url = "/auth/resetar.html"; Cat = "Auth" },
  @{ Path = "auth\senha-criada.html"; Url = "/auth/senha-criada.html"; Cat = "Auth" },
  @{ Path = "admin\Login-ADM.html"; Url = "/admin/Login-ADM.html"; Cat = "Admin" },
  @{ Path = "admin\Login-ADM-Ecoponto.html"; Url = "/admin/Login-ADM-Ecoponto.html"; Cat = "Admin" },
  @{ Path = "admin\Home-ADM.html"; Url = "/admin/Home-ADM.html"; Cat = "Admin" },
  @{ Path = "admin\Home-ADM-Ecoponto.html"; Url = "/admin/Home-ADM-Ecoponto.html"; Cat = "Admin" },
  @{ Path = "admin\Coletas-ADM-Ecoponto.html"; Url = "/admin/Coletas-ADM-Ecoponto.html"; Cat = "Admin" },
  @{ Path = "admin\configuracoes-ADM-Ecoponto.html"; Url = "/admin/configuracoes-ADM-Ecoponto.html"; Cat = "Admin" },
  @{ Path = "admin\relatorio-ADM-Ecoponto.html"; Url = "/admin/relatorio-ADM-Ecoponto.html"; Cat = "Admin" },
  @{ Path = "admin\materias-ADM-Ecoponto.html"; Url = "/admin/materias-ADM-Ecoponto.html"; Cat = "Admin" },
  @{ Path = "admin\edicao-perfil-admin.html"; Url = "/admin/edicao-perfil-admin.html"; Cat = "Admin" },
  @{ Path = "mapa\mapa.html"; Url = "/mapa/mapa.html"; Cat = "Mapa" }
)

$apiEndpoints = @(
  "api/ecocheck-api.php?action=status",
  "api/test-php-json.php",
  "api/logout.php",
  "api/meu_perfil.php",
  "api/notificacoes.php"
)

function Resolve-AssetPath {
  param([string]$PageDir, [string]$Ref)
  if ($Ref -match '^(https?:)?//|^data:|^mailto:|^tel:|^#') { return $null }
  $ref = $Ref -replace '\?.*$', ''
  if ($ref -match '^\.\./') {
    $combined = Join-Path (Split-Path (Split-Path $PageDir -Parent) -Parent) ($ref -replace '^\.\./', '')
  } elseif ($ref -match '^\./') {
    $combined = Join-Path $PageDir ($ref -replace '^\./', '')
  } else {
    $combined = Join-Path $PageDir $ref
  }
  try { return (Resolve-Path $combined -ErrorAction Stop).Path } catch { return $combined }
}

function Test-WhiteBoxPhp {
  param([string]$FilePath)
  $issues = @()
  if (-not (Test-Path $FilePath)) { return $issues }
  $content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
  if (-not $content) { return $issues }
  $dir = Split-Path $FilePath -Parent
  $matches = [regex]::Matches($content, 'require(?:_once)?\s+__DIR__\s*\.\s*["''](/[^"'']+)["'']')
  foreach ($m in $matches) {
    $rel = $m.Groups[1].Value -replace '/', '\'
    $target = Join-Path $dir $rel.TrimStart('\')
    if (-not (Test-Path $target)) {
      $issues += "require ausente: $rel"
    }
  }
  if ($content -match '__DIR__\s*\.\s*["'']/vendor/autoload') {
    $vendor = Join-Path $dir "vendor\autoload.php"
    if (-not (Test-Path $vendor)) {
      $issues += "vendor/autoload.php ausente"
    }
  }
  return $issues
}

$results = @()
$serverOk = $false
try {
  $ping = Invoke-WebRequest -Uri "$baseUrl/index.html" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
  $serverOk = $ping.StatusCode -eq 200
} catch {
  $serverOk = $false
}

foreach ($p in $pages) {
  $full = Join-Path $root $p.Path
  $pageDir = Split-Path $full -Parent
  $row = [ordered]@{
    Page = $p.Path
    Category = $p.Cat
    FileExists = Test-Path $full
    HttpStatus = $null
    HttpLegacy = $null
    BrokenAssets = @()
    MissingScripts = @()
    WhiteBox = @()
    Notes = @()
  }

  if (-not $row.FileExists) {
    $results += [pscustomobject]$row
    continue
  }

  $html = Get-Content $full -Raw -Encoding UTF8
  if ($html -notmatch '<html') { $row.Notes += "sem tag html" }
  if ($html -notmatch '<base') { $row.Notes += "sem base href (pode quebrar assets em subpastas)" }

  $refs = [regex]::Matches($html, '(?:href|src)=["'']([^"'']+)["'']') | ForEach-Object { $_.Groups[1].Value }
  foreach ($ref in $refs) {
    $resolved = Resolve-AssetPath -PageDir $pageDir -Ref $ref
    if ($resolved -and -not (Test-Path $resolved)) {
      $row.BrokenAssets += $ref
    }
  }

  $scripts = [regex]::Matches($html, '<script[^>]+src=["'']([^"'']+)["'']') | ForEach-Object { $_.Groups[1].Value }
  foreach ($s in $scripts) {
    if ($s -match '^https?://') { continue }
    $resolved = Resolve-AssetPath -PageDir $pageDir -Ref $s
    if ($resolved -and -not (Test-Path $resolved)) {
      $row.MissingScripts += $s
    }
  }

  # White box: PHP sibling with same name
  $phpSibling = [System.IO.Path]::ChangeExtension($full, ".php")
  if (Test-Path $phpSibling) {
    $row.WhiteBox += Test-WhiteBoxPhp -FilePath $phpSibling
  }

  # Forms -> action targets
  $actions = [regex]::Matches($html, '<form[^>]+action=["'']([^"'']+)["'']') | ForEach-Object { $_.Groups[1].Value }
  foreach ($act in $actions) {
    if ($act -match '^https?://|^\#') { continue }
    $resolved = Resolve-AssetPath -PageDir $pageDir -Ref $act
    if ($resolved -and -not (Test-Path $resolved)) {
      $row.WhiteBox += "form action inexistente: $act"
    }
  }

  if ($serverOk) {
    try {
      $r = Invoke-WebRequest -Uri ($baseUrl + $p.Url) -UseBasicParsing -TimeoutSec 12 -MaximumRedirection 5
      $row.HttpStatus = $r.StatusCode
    } catch {
      $row.HttpStatus = "ERR: $($_.Exception.Message)"
    }
    $legacyName = Split-Path $p.Path -Leaf
    if ($legacyName -ne "index.html") {
      try {
        $r2 = Invoke-WebRequest -Uri ($baseUrl + "/" + $legacyName) -UseBasicParsing -TimeoutSec 12 -MaximumRedirection 5
        $row.HttpLegacy = $r2.StatusCode
      } catch {
        $row.HttpLegacy = "ERR"
      }
    }
  }

  $results += [pscustomobject]$row
}

# PHP APIs white box
$phpIssues = @()
Get-ChildItem -Path (Join-Path $root "api"), (Join-Path $root "auth"), (Join-Path $root "admin") -Filter "*.php" -Recurse -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch '\\vendor\\' } |
  ForEach-Object {
    $iss = Test-WhiteBoxPhp -FilePath $_.FullName
    if ($iss.Count -gt 0) {
      $phpIssues += [pscustomobject]@{ File = $_.FullName.Replace($root + '\', ''); Issues = ($iss -join '; ') }
    }
  }

$apiResults = @()
if ($serverOk) {
  foreach ($ep in $apiEndpoints) {
    try {
      $r = Invoke-WebRequest -Uri "$baseUrl/$ep" -UseBasicParsing -TimeoutSec 8 -SessionVariable sess
      $apiResults += [pscustomobject]@{ Endpoint = $ep; Status = $r.StatusCode; ContentType = $r.Headers['Content-Type'] }
    } catch {
      $apiResults += [pscustomobject]@{ Endpoint = $ep; Status = "ERR"; ContentType = $_.Exception.Message }
    }
  }
}

# Markdown report
$lines = @()
$lines += "# Relatorio QA — Caixa Preta e Caixa Branca"
$lines += ""
$lines += "Gerado em: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$lines += "Servidor local testado: **$(if ($serverOk) { 'SIM — ' + $baseUrl } else { 'NAO (apenas analise estatica de arquivos)' })**"
$lines += ""
$lines += "## Resumo"
$total = $results.Count
$okFile = ($results | Where-Object { $_.FileExists }).Count
$broken = ($results | Where-Object { $_.BrokenAssets.Count -gt 0 -or $_.MissingScripts.Count -gt 0 }).Count
$httpFail = ($results | Where-Object { $_.HttpStatus -and $_.HttpStatus -ne 200 }).Count
$lines += "- Paginas HTML no escopo: **$total**"
$lines += "- Arquivos encontrados: **$okFile/$total**"
$lines += "- Paginas com assets quebrados (estatico): **$broken**"
if ($serverOk) { $lines += "- Paginas HTTP != 200: **$httpFail**" }
$lines += ""
$lines += "## Metodologia"
$lines += ""
$lines += "### Caixa preta (comportamento externo)"
$lines += "- Existencia do arquivo HTML"
$lines += "- GET HTTP (status, redirecionamento) quando Apache disponivel"
$lines += "- URL legada na raiz via `.htaccess` (ex.: `/login.html`)"
$lines += "- Links `href`/`src` e scripts locais resolviveis no disco"
$lines += "- Presenca de estrutura basica (`html`, `base` onde aplicavel)"
$lines += ""
$lines += "### Caixa branca (estrutura interna)"
$lines += "- `require`/`require_once` em PHP apontam para arquivos existentes"
$lines += "- `action` de formularios apontam para endpoints existentes"
$lines += "- Endpoints API amostra (JSON/sessao)"
$lines += ""
$lines += "## Resultado por pagina"
$lines += ""
$lines += "| Pagina | Categoria | Arquivo | HTTP direto | HTTP legado | Assets | Scripts | WB |"
$lines += "|--------|-----------|---------|-------------|---------------|--------|---------|-----|"

foreach ($r in $results) {
  $a = if ($r.BrokenAssets.Count) { $r.BrokenAssets.Count } else { "OK" }
  $s = if ($r.MissingScripts.Count) { $r.MissingScripts.Count } else { "OK" }
  $wb = if ($r.WhiteBox.Count) { ($r.WhiteBox | Select-Object -First 2) -join '; ' } else { "OK" }
  $lines += "| $($r.Page) | $($r.Category) | $(if($r.FileExists){'OK'}else{'FALTA'}) | $($r.HttpStatus) | $($r.HttpLegacy) | $a | $s | $wb |"
}

$lines += ""
$lines += "## Detalhes — falhas de assets/scripts"
foreach ($r in $results | Where-Object { $_.BrokenAssets.Count -gt 0 -or $_.MissingScripts.Count -gt 0 }) {
  $lines += "### $($r.Page)"
  foreach ($b in $r.BrokenAssets) { $lines += "- Asset: ``$b``" }
  foreach ($m in $r.MissingScripts) { $lines += "- Script: ``$m``" }
  $lines += ""
}

if ($phpIssues.Count -gt 0) {
  $lines += "## Caixa branca — PHP com includes ausentes"
  foreach ($pi in $phpIssues) {
    $lines += "- **$($pi.File)**: $($pi.Issues)"
  }
  $lines += ""
}

if ($apiResults.Count -gt 0) {
  $lines += "## APIs (amostra HTTP)"
  $lines += "| Endpoint | Status |"
  $lines += "|----------|--------|"
  foreach ($ar in $apiResults) {
    $lines += "| $($ar.Endpoint) | $($ar.Status) |"
  }
}

$lines += ""
$lines += "## Testes manuais recomendados (nao automatizados)"
$lines += "- Login/cadastro com EcoCheck + MySQL"
$lines += "- Admin com sessao PHP"
$lines += "- Mapa: popup GPS + rota OSRM"
$lines += "- Upload de avatar em perfil"
$lines += "- Envio de e-mail (SMTP)"

$null = New-Item -ItemType Directory -Path (Split-Path $reportPath) -Force -ErrorAction SilentlyContinue
$lines | Set-Content -Path $reportPath -Encoding UTF8

$results | Export-Csv -Path (Join-Path $root "docs\QA-resultados.csv") -NoTypeInformation -Encoding UTF8

Write-Output "Report: $reportPath"
Write-Output "Server: $serverOk"
Write-Output "Pages: $total | Broken assets: $broken"
