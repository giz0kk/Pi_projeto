# EcoColeta (projeto_pi)

Plataforma web de coleta seletiva — stack PHP/MySQL (XAMPP) + front-end estático + EcoCheck (anti-bot React).

## Estrutura

| Pasta | Conteúdo |
|-------|----------|
| `api/` | Endpoints PHP JSON (notificações, agendamento, ecocheck-api, etc.) |
| `auth/` | Login, cadastro, recuperação de senha |
| `admin/` | Painéis administrativos (plataforma e ecoponto) |
| `pages/` | Páginas públicas do site |
| `assets/css`, `assets/js`, `assets/images` | Estáticos compartilhados |
| `includes/` | `conexao.php`, helpers, validações |
| `database/` | Scripts SQL de instalação/migração |
| `config/` | SMTP, scripts de deploy, Apache |
| `ecocheck/` | Fonte React do anti-bot |
| `ecocheck-dist/` | Build do EcoCheck (gerado por `npm run build`) |
| `mapa/` | Módulo de mapa e navegação |
| `uploads/` | Arquivos enviados pelos usuários |
| `vendor/` | Dependências Composer (PHPMailer) |

## URLs legadas

O `.htaccess` na raiz redireciona bookmarks antigos (`/login.html`, `/tela-inicia.html`, `/style.css`, etc.) para as pastas atuais.

## Desenvolvimento local

1. XAMPP: Apache + MySQL ativos  
2. Abrir `http://localhost/projeto_pi/`  
3. EcoCheck: `cd ecocheck && npm install && npm run build`
