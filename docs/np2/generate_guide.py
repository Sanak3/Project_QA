"""
Gera o Guia NP2 S07 do AdotaPet em PDF.

Uso:
    python docs/np2/generate_guide.py

Saida:
    docs/np2/Guia_NP2_S07_AdotaPet.pdf
"""
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    Preformatted, KeepTogether,
)

OUTPUT = Path(__file__).parent / "Guia_NP2_S07_AdotaPet.pdf"

# ---------------------------------------------------------------------------
# Estilos
# ---------------------------------------------------------------------------
styles = getSampleStyleSheet()

PALETTE = {
    "primary":   colors.HexColor("#0F4C75"),   # azul profundo
    "secondary": colors.HexColor("#3282B8"),   # azul medio
    "accent":    colors.HexColor("#BBE1FA"),   # azul claro
    "ok":        colors.HexColor("#1B5E20"),   # verde
    "warn":      colors.HexColor("#B71C1C"),   # vermelho
    "muted":     colors.HexColor("#546E7A"),   # cinza
    "code_bg":   colors.HexColor("#F4F6F8"),
    "code_fg":   colors.HexColor("#212121"),
    "white":     colors.HexColor("#FFFFFF"),
    "black":     colors.HexColor("#212121"),
}

styles.add(ParagraphStyle(
    name="Cover",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=32,
    leading=38,
    textColor=PALETTE["primary"],
    alignment=TA_CENTER,
    spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="CoverSub",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=14,
    leading=18,
    textColor=PALETTE["muted"],
    alignment=TA_CENTER,
    spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="H1",
    parent=styles["Heading1"],
    fontName="Helvetica-Bold",
    fontSize=20,
    leading=24,
    textColor=PALETTE["primary"],
    spaceBefore=14,
    spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="H2",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=14,
    leading=18,
    textColor=PALETTE["secondary"],
    spaceBefore=10,
    spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="H3",
    parent=styles["Heading3"],
    fontName="Helvetica-Bold",
    fontSize=11,
    leading=14,
    textColor=PALETTE["black"],
    spaceBefore=6,
    spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="Body",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=10,
    leading=14,
    textColor=PALETTE["black"],
    alignment=TA_JUSTIFY,
    spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="BulletLine",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=10,
    leading=14,
    leftIndent=14,
    bulletIndent=4,
    textColor=PALETTE["black"],
    spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="CodeBox",
    parent=styles["Code"],
    fontName="Courier",
    fontSize=9,
    leading=12,
    textColor=PALETTE["code_fg"],
    backColor=PALETTE["code_bg"],
    leftIndent=8,
    rightIndent=8,
    spaceBefore=4,
    spaceAfter=6,
    borderColor=PALETTE["accent"],
    borderWidth=0.5,
    borderPadding=6,
))
styles.add(ParagraphStyle(
    name="Note",
    parent=styles["BodyText"],
    fontName="Helvetica-Oblique",
    fontSize=10,
    leading=14,
    textColor=PALETTE["muted"],
    leftIndent=10,
    rightIndent=10,
    spaceBefore=4,
    spaceAfter=6,
    backColor=PALETTE["accent"],
    borderColor=PALETTE["secondary"],
    borderWidth=0.5,
    borderPadding=6,
))
styles.add(ParagraphStyle(
    name="Warn",
    parent=styles["BodyText"],
    fontName="Helvetica-Bold",
    fontSize=10,
    leading=14,
    textColor=PALETTE["warn"],
    leftIndent=10,
    rightIndent=10,
    spaceBefore=4,
    spaceAfter=6,
    backColor=colors.HexColor("#FDECEA"),
    borderColor=PALETTE["warn"],
    borderWidth=0.5,
    borderPadding=6,
))


def code_block(text: str):
    """Retorna um Preformatted estilizado como bloco de codigo."""
    return Preformatted(text, styles["CodeBox"])


def bullets(items):
    return [Paragraph(f"&bull;&nbsp;&nbsp;{t}", styles["BulletLine"]) for t in items]


def status_table(rows):
    """rows: lista de (item, status, detalhe). status: 'ok'|'todo'|'partial'."""
    color_map = {
        "ok":      PALETTE["ok"],
        "todo":    PALETTE["warn"],
        "partial": colors.HexColor("#EF6C00"),
    }
    label_map = {
        "ok":      "PRONTO",
        "todo":    "TIME FAZ",
        "partial": "PARCIAL",
    }
    data = [["Item", "Status", "Detalhe"]]
    styles_rows = []
    for i, (item, status, detail) in enumerate(rows, start=1):
        data.append([
            Paragraph(item, styles["Body"]),
            Paragraph(f"<b>{label_map[status]}</b>", ParagraphStyle(
                name=f"st-{i}", parent=styles["Body"], alignment=TA_CENTER,
                textColor=color_map[status])),
            Paragraph(detail, styles["Body"]),
        ])
    t = Table(data, colWidths=[5.5*cm, 2.4*cm, 9.5*cm], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PALETTE["primary"]),
        ("TEXTCOLOR",  (0, 0), (-1, 0), PALETTE["white"]),
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",   (0, 0), (-1, 0), 10),
        ("ALIGN",      (1, 0), (1, -1), "CENTER"),
        ("VALIGN",     (0, 0), (-1, -1), "MIDDLE"),
        ("GRID",       (0, 0), (-1, -1), 0.4, PALETTE["muted"]),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
            [PALETTE["white"], colors.HexColor("#F7FAFC")]),
        ("LEFTPADDING",  (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING",   (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
    ]))
    return t


def ports_table():
    data = [
        ["Servico", "Porta no HOST", "Porta no container", "URL / Acesso"],
        ["MySQL", "3316", "3306", "DBeaver: localhost:3316 / root / root"],
        ["Backend (NestJS)", "3010", "3000", "http://localhost:3010/docs (Swagger)"],
        ["Frontend (Next.js)", "3011", "3000", "http://localhost:3011"],
        ["MailHog SMTP", "1025", "1025", "(usado pelo notify-email.js)"],
        ["MailHog Web UI", "8025", "8025", "http://localhost:8025"],
    ]
    t = Table(data, colWidths=[3.8*cm, 2.4*cm, 2.8*cm, 8.4*cm], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PALETTE["primary"]),
        ("TEXTCOLOR",  (0, 0), (-1, 0), PALETTE["white"]),
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",   (0, 0), (-1, 0), 9),
        ("FONTNAME",   (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",   (0, 1), (-1, -1), 9),
        ("ALIGN",      (1, 0), (2, -1), "CENTER"),
        ("VALIGN",     (0, 0), (-1, -1), "MIDDLE"),
        ("GRID",       (0, 0), (-1, -1), 0.4, PALETTE["muted"]),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
            [PALETTE["white"], colors.HexColor("#F7FAFC")]),
        ("LEFTPADDING",  (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def criteria_table():
    data = [
        ["#", "Criterio do PDF", "Onde esta atendido"],
        ["1",  "Aplicacao funcional, testes >= 90%",
                "Back: 97% stmts (67 tests); Front: 98% stmts (22 tests). Threshold no Jest."],
        ["2",  "Dockerfile (Jenkins em container, reproduzivel)",
                "jenkins/Dockerfile (Node 20 + Docker CLI + plugins) + backend/frontend Dockerfile."],
        ["3",  "Jenkinsfile - Testes / Build / Notificacao",
                "Jenkinsfile na raiz (skeleton; Notify e post.always prontos)."],
        ["4",  "Artefatos no Jenkins (pacote + relatorio)",
                "post { always { archiveArtifacts ... junit ... } } no Jenkinsfile."],
        ["5",  "E-mail nao hardcoded - via env var",
                "scripts/notify-email.js le NOTIFY_EMAIL; exit 1 se faltar."],
        ["6",  "Imagem publicada no Docker Hub",
                "TIME FAZ: stage Build comentado no Jenkinsfile; precisa de credencial."],
        ["7",  "Docker Compose 4+ containers (mix local + Hub)",
                "docker-compose.yml: mysql + backend + frontend + mailhog."],
        ["8",  "Comunicacao entre containers",
                "backend<->mysql (Prisma), backend/Jenkins<->mailhog (SMTP)."],
        ["9",  "Volumes para persistencia",
                "mysql_data, backend_uploads, jenkins_home."],
        ["10", "Commits relevantes de todos os membros",
                "TIME FAZ: cada integrante deve commitar pelo menos uma stage."],
        ["11", "README completo + secao 'Uso de IA'",
                "README.md tem secao 'Uso de IA' como template - TIME PREENCHE."],
        ["12", "Uso transparente de IA",
                "TIME FAZ: registrar modelos, prompts, dinamica no README."],
        ["13", "Defesa Q&A - todos sabem do projeto",
                "TIME FAZ: revisar este guia em grupo antes da defesa."],
        ["14", "DevOps geral (coerencia)",
                "Auditoria + reorganizacao pre-rodadas; este guia documenta as decisoes."],
    ]
    t = Table(data, colWidths=[0.8*cm, 5.7*cm, 11*cm], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PALETTE["primary"]),
        ("TEXTCOLOR",  (0, 0), (-1, 0), PALETTE["white"]),
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",   (0, 0), (-1, 0), 9),
        ("FONTNAME",   (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",   (0, 1), (-1, -1), 8.5),
        ("ALIGN",      (0, 0), (0, -1), "CENTER"),
        ("VALIGN",     (0, 0), (-1, -1), "TOP"),
        ("GRID",       (0, 0), (-1, -1), 0.4, PALETTE["muted"]),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
            [PALETTE["white"], colors.HexColor("#F7FAFC")]),
        ("LEFTPADDING",  (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING",   (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 4),
    ]))
    return t


# ---------------------------------------------------------------------------
# Header / Footer
# ---------------------------------------------------------------------------
def _draw_header_footer(canvas, doc):
    canvas.saveState()
    # Header
    canvas.setFillColor(PALETTE["primary"])
    canvas.rect(0, A4[1] - 1.0 * cm, A4[0], 1.0 * cm, fill=1, stroke=0)
    canvas.setFillColor(PALETTE["white"])
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(1.5 * cm, A4[1] - 0.65 * cm,
                      "Guia NP2 S07  -  AdotaPet  -  DevOps")
    canvas.setFont("Helvetica", 8.5)
    canvas.drawRightString(A4[0] - 1.5 * cm, A4[1] - 0.65 * cm,
                           "INATEL | Aplicando DevOps na pratica")

    # Footer
    canvas.setFillColor(PALETTE["muted"])
    canvas.setFont("Helvetica", 8)
    canvas.drawString(1.5 * cm, 1.0 * cm, "github.com/roger-inatel/Dev_ops")
    canvas.drawCentredString(A4[0] / 2, 1.0 * cm,
                             "Auto-explicativo - leiam antes da defesa")
    canvas.drawRightString(A4[0] - 1.5 * cm, 1.0 * cm,
                           f"Pagina {doc.page}")
    canvas.restoreState()


# ---------------------------------------------------------------------------
# Conteudo
# ---------------------------------------------------------------------------
def build_story():
    s = []

    # ----- CAPA -----
    s.append(Spacer(1, 4.0 * cm))
    s.append(Paragraph("AdotaPet  -  NP2 / S07", styles["Cover"]))
    s.append(Paragraph("Aplicando DevOps na pratica", styles["CoverSub"]))
    s.append(Spacer(1, 0.6 * cm))
    s.append(Paragraph(
        "Guia passo-a-passo para o time DevOps dar continuidade ao trabalho",
        styles["CoverSub"]))
    s.append(Spacer(1, 1.8 * cm))

    capa_box = Table([[
        Paragraph(
            "<b>O que voces estao recebendo:</b><br/><br/>"
            "&bull; Monorepo do AdotaPet (backend NestJS + frontend Next.js 16 + MySQL) "
            "rodando ponta a ponta via Docker Compose com <b>4 containers</b>.<br/><br/>"
            "&bull; <b>Jenkinsfile</b> declarativo (esqueleto) + <b>Jenkins em container</b> "
            "(jenkins/Dockerfile customizada com Node 20 e Docker CLI).<br/><br/>"
            "&bull; Script de <b>notificacao por e-mail</b> ja funcional, lendo NOTIFY_EMAIL "
            "do ambiente (sem hardcoded).<br/><br/>"
            "&bull; Suite de testes com <b>cobertura >= 90%</b> (97% backend / 98% frontend) "
            "e threshold no Jest para o pipeline reprovar regressao.<br/><br/>"
            "&bull; <b>MailHog</b> (4o container) capturando os e-mails para conferir na "
            "defesa pela Web UI.<br/><br/>"
            "&bull; Este PDF com tudo que ja esta pronto e o passo-a-passo do que falta voces fazerem.",
            styles["Body"])
    ]], colWidths=[16 * cm])
    capa_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALETTE["accent"]),
        ("BOX", (0, 0), (-1, -1), 1, PALETTE["primary"]),
        ("LEFTPADDING",  (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING",   (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 12),
    ]))
    s.append(capa_box)
    s.append(PageBreak())

    # ----- SUMARIO (manual, simples) -----
    s.append(Paragraph("Sumario", styles["H1"]))
    sumario = [
        "1. Visao geral do que foi entregue",
        "2. Como subir o projeto local (passo-a-passo)",
        "3. Validacao end-to-end (Swagger, UI, DBeaver, MailHog)",
        "4. O que ja esta pronto vs o que voces precisam fazer",
        "5. Estrutura do projeto",
        "6. Como rodar o Jenkins (em container)",
        "7. Como preencher o Jenkinsfile (stages Install / Test / Build)",
        "8. Como publicar a imagem no Docker Hub",
        "9. Como preencher a secao 'Uso de IA' do README",
        "10. Checklist de validacao final + mapeamento de criterios",
        "11. FAQ e troubleshooting",
    ]
    for line in sumario:
        s.append(Paragraph(line, styles["Body"]))
    s.append(PageBreak())

    # ====== 1) VISAO GERAL ======
    s.append(Paragraph("1. Visao geral do que foi entregue", styles["H1"]))
    s.append(Paragraph(
        "O monorepo do AdotaPet foi reorganizado em 3 etapas, cada uma em uma branch "
        "git, para deixar facil rastrear a evolucao:",
        styles["Body"]))
    s.extend(bullets([
        "<b>main</b> - estado original do repositorio.",
        "<b>audit/fixes</b> - correcoes minimas para o projeto rodar (docker-compose "
        "com paths errados, READMEs desatualizados, workflows com filtro de path quebrado etc.).",
        "<b>feature/devops-ready</b> (esta) - tudo o que e <b>especifico da NP2 S07</b>: "
        "4o container, Jenkins em container, Jenkinsfile skeleton, notify-email, "
        "cobertura escopada >=90%, README com secao Uso de IA.",
    ]))
    s.append(Paragraph(
        "Para o pessoal do Jenkins, a branch ativa eh <b>feature/devops-ready</b>. "
        "Voces podem partir dela, fazer merge na main quando estiver pronta, ou criar "
        "uma feature branch propria a partir dela.",
        styles["Body"]))

    s.append(Paragraph("Stack", styles["H2"]))
    s.extend(bullets([
        "<b>Backend</b>: NestJS 11 + TypeScript 5.7 + Prisma 6 + MySQL 8 + JWT + Bcrypt + Swagger.",
        "<b>Frontend</b>: Next.js 16 (App Router) + React 19 + Tailwind 4 + RHF + Zod + Cypress.",
        "<b>Banco</b>: MySQL 8 em container, healthcheck via mysqladmin ping.",
        "<b>CI/CD</b>: Jenkins LTS em container, Node 20 + Docker CLI pre-instalados.",
        "<b>E-mail</b>: MailHog (SMTP fake + Web UI) para capturar notificacoes do pipeline.",
    ]))

    s.append(PageBreak())

    # ====== 2) SUBIR O PROJETO ======
    s.append(Paragraph("2. Como subir o projeto local", styles["H1"]))

    s.append(Paragraph("Pre-requisitos", styles["H2"]))
    s.extend(bullets([
        "Node.js 20+ (so necessario se quiser rodar fora do Docker).",
        "Docker Desktop (ou Docker Engine + Compose v2).",
        "Git.",
        "<b>DBeaver</b> (opcional, ja configurado para localhost:3316 - ver imagem original).",
    ]))

    s.append(Paragraph("Passo 1 - clonar e configurar", styles["H2"]))
    s.append(code_block(
        "git clone https://github.com/roger-inatel/Dev_ops.git\n"
        "cd Dev_ops\n"
        "\n"
        "# Copie o template de env e ajuste JWT_SECRET\n"
        "cp .env.example .env       # Linux/macOS\n"
        "Copy-Item .env.example .env   # Windows PowerShell\n"
    ))
    s.append(Paragraph(
        "O arquivo <b>.env.example</b> ja vem com defaults sensatos. Voces SO precisam "
        "trocar o <b>JWT_SECRET</b> antes da entrega final (gera com "
        "<code>openssl rand -hex 32</code>).",
        styles["Note"]))

    s.append(Paragraph("Passo 2 - subir os 4 containers", styles["H2"]))
    s.append(code_block(
        "docker compose up --build -d\n"
        "\n"
        "# Conferir que subiu:\n"
        "docker compose ps\n"
        "\n"
        "# Voces devem ver 4 containers:\n"
        "#   adotapet_mysql      (healthy, porta 3316)\n"
        "#   adotapet_backend    (porta 3010)\n"
        "#   adotapet_frontend   (porta 3011)\n"
        "#   adotapet_mailhog    (portas 1025 + 8025)\n"
    ))

    s.append(Paragraph(
        "<b>IMPORTANTE - portas mudaram</b> em relacao aos defaults para evitar "
        "conflito com outros projetos:",
        styles["Body"]))
    s.append(ports_table())
    s.append(Spacer(1, 4))
    s.append(Paragraph(
        "Para mudar uma porta, edite <code>.env</code> e suba de novo: "
        "<code>docker compose up -d</code> (nao precisa rebuild).",
        styles["Note"]))

    s.append(PageBreak())

    # ====== 3) VALIDACAO E2E ======
    s.append(Paragraph("3. Validacao end-to-end", styles["H1"]))
    s.append(Paragraph(
        "Sequencia rapida para provar que tudo esta funcional. Cada comando "
        "deve responder com o resultado descrito - se algum nao bater, eh "
        "porque algo nao subiu (cheque <code>docker compose logs</code>).",
        styles["Body"]))

    s.append(Paragraph("a) Backend Swagger e health", styles["H2"]))
    s.append(code_block(
        "curl -s -o NUL -w \"HTTP %%{http_code}\\n\" http://localhost:3010/docs\n"
        "# esperado: HTTP 200\n"
        "\n"
        "curl http://localhost:3010/\n"
        "# esperado: Hello World!\n"
    ))

    s.append(Paragraph("b) Banco - via DBeaver ou CLI", styles["H2"]))
    s.append(Paragraph(
        "Use a conexao DBeaver que ja existe (host: localhost, porta: 3316, "
        "user: root, senha: root, db: adotapet). Voce deve ver as tabelas "
        "criadas pelas migrations do Prisma (User, Pet, Organization, "
        "AdoptionRequest, ResponsibilityTerm, etc).",
        styles["Body"]))
    s.append(code_block(
        "# Ou via CLI dentro do container:\n"
        "docker exec adotapet_mysql mysql -uroot -proot adotapet -e \"SHOW TABLES;\"\n"
    ))

    s.append(Paragraph("c) Cadastro + login (API)", styles["H2"]))
    s.append(code_block(
        "# 1) Criar um usuario ADOPTER\n"
        "curl -X POST http://localhost:3010/users \\\n"
        "  -H \"Content-Type: application/json\" \\\n"
        "  -d '{\"fullName\":\"Joao\",\"email\":\"joao@test.com\","
        "\"password\":\"Str0ng@Pass1\",\"role\":\"ADOPTER\"}'\n"
        "\n"
        "# 2) Login - deve devolver { access_token, user }\n"
        "curl -X POST http://localhost:3010/auth/login \\\n"
        "  -H \"Content-Type: application/json\" \\\n"
        "  -d '{\"email\":\"joao@test.com\",\"password\":\"Str0ng@Pass1\"}'\n"
    ))

    s.append(Paragraph("c.1) Atalho - usuarios seed prontos", styles["H2"]))
    s.append(Paragraph(
        "Em vez de criar tudo na mao, rode <code>sh scripts/seed.sh</code> "
        "(funciona com o stack rodando) - ele cria 4 usuarios + 3 pets de "
        "exemplo via API e imprime as credenciais. Use estas no Swagger ou "
        "no frontend <code>http://localhost:3011/login</code>:",
        styles["Body"]))
    seed_data = [
        ["Papel", "E-mail", "Senha", "O que pode fazer"],
        ["ADMIN",     "admin@adotapet.local", "Admin@123",
         "Acesso amplo (visualizar /users, gerenciar organizacoes)."],
        ["ONG_ADMIN", "ong@adotapet.local",   "Ong@12345",
         "Cadastra/edita Pets e Organizacoes; aprova adocoes recebidas."],
        ["ADOPTER",   "lucas@adotapet.local", "Lucas@123",
         "Solicita adocao de pets; assina o termo de responsabilidade."],
        ["ADOPTER",   "maria@adotapet.local", "Maria@123",
         "Outro adotante para simular concorrencia entre solicitacoes."],
    ]
    t = Table(seed_data, colWidths=[2.2*cm, 4.6*cm, 2.4*cm, 7.6*cm], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), PALETTE["primary"]),
        ("TEXTCOLOR",  (0,0), (-1,0), PALETTE["white"]),
        ("FONTNAME",   (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",   (0,0), (-1,0), 9),
        ("FONTNAME",   (0,1), (-1,-1), "Helvetica"),
        ("FONTSIZE",   (0,1), (-1,-1), 8.5),
        ("FONTNAME",   (1,1), (2,-1), "Courier"),
        ("VALIGN",     (0,0), (-1,-1), "MIDDLE"),
        ("GRID",       (0,0), (-1,-1), 0.4, PALETTE["muted"]),
        ("ROWBACKGROUNDS", (0,1), (-1,-1),
            [PALETTE["white"], colors.HexColor("#F7FAFC")]),
        ("LEFTPADDING",  (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING",   (0,0), (-1,-1), 5),
        ("BOTTOMPADDING",(0,0), (-1,-1), 5),
    ]))
    s.append(t)
    s.append(Spacer(1, 4))
    s.append(Paragraph(
        "Pets pre-criados pela ONG: Thor (DOG, Labrador, MG), Mel (CAT, MG), "
        "Bidu (DOG, filhote). O fluxo de adocao completo pode ser testado "
        "logando como Lucas ou Maria, escolhendo um pet em "
        "<code>/pet/[id]</code>, e aprovando como a ONG.",
        styles["Note"]))

    s.append(Paragraph("d) Frontend (UI)", styles["H2"]))
    s.extend(bullets([
        "<code>http://localhost:3011</code> - home, lista de pets.",
        "<code>http://localhost:3011/login</code> - login, usa o usuario criado acima.",
        "<code>http://localhost:3011/dashboard</code> - sem token, "
        "redireciona para /login (protecao via src/proxy.ts).",
    ]))
    s.append(Paragraph(
        "<b>Atencao Next.js 16</b>: o que antes era 'middleware.ts' agora se chama "
        "'proxy.ts'. Eh deliberado (breaking change da v16). Nao recriem um "
        "middleware.ts.",
        styles["Note"]))

    s.append(Paragraph("e) Notificacao por e-mail + MailHog", styles["H2"]))
    s.append(code_block(
        "cd scripts\n"
        "npm install   # instala nodemailer (so na primeira vez)\n"
        "\n"
        "# Windows PowerShell:\n"
        "$env:NOTIFY_EMAIL='time@adotapet.local'\n"
        "$env:SMTP_HOST='localhost'; $env:SMTP_PORT='1025'\n"
        "$env:BUILD_STATUS='SUCCESS'; $env:BUILD_NUMBER='1'\n"
        "$env:JOB_NAME='manual-test'\n"
        "node notify-email.js\n"
        "\n"
        "# Linux/macOS:\n"
        "NOTIFY_EMAIL=time@adotapet.local SMTP_HOST=localhost SMTP_PORT=1025 \\\n"
        "  BUILD_STATUS=SUCCESS BUILD_NUMBER=1 JOB_NAME=manual-test \\\n"
        "  node notify-email.js\n"
        "\n"
        "# Abrir o inbox e ver o e-mail capturado:\n"
        "#   http://localhost:8025\n"
    ))
    s.append(Paragraph(
        "Se o script falhar com 'NOTIFY_EMAIL ausente' e codigo de saida 1, "
        "esta correto - foi feito de proposito para o pipeline NAO silenciar.",
        styles["Note"]))

    s.append(PageBreak())

    # ====== 4) PRONTO vs FAZER ======
    s.append(Paragraph("4. O que ja esta pronto vs o que voces fazem", styles["H1"]))
    s.append(Paragraph(
        "Os criterios eliminatorios do PDF do professor sao claros: <b>(a)</b> nao usar "
        "GUI do Jenkins para configurar stages, <b>(b)</b> nao copiar IA sem entender, "
        "<b>(c)</b> todos os membros tem que ter commits relevantes. Por isso a maior "
        "parte do <b>codigo de stages do Jenkinsfile</b> ficou para voces escreverem.",
        styles["Body"]))
    s.append(status_table([
        ("Aplicacao rodando ponta a ponta",
         "ok", "4 containers sobem com 'docker compose up --build'. Validado neste guia."),
        ("Cobertura de testes >= 90%",
         "ok", "Threshold do Jest forca o pipeline a falhar se cair. 67+22 testes verdes."),
        ("4o container + comunicacao + volumes",
         "ok", "mysql + backend + frontend + mailhog; backend<->mysql, back<->mailhog."),
        ("Jenkins em container",
         "ok", "jenkins/Dockerfile + docker-compose.jenkins.yml. Node 20 + Docker CLI."),
        ("Script de e-mail com env var",
         "ok", "scripts/notify-email.js le NOTIFY_EMAIL; testado contra MailHog."),
        ("Jenkinsfile com estrutura das stages",
         "partial", "Skeleton com Checkout/Notify/post prontos. TODOs nas demais."),
        ("Imagem no Docker Hub",
         "todo", "TIME FAZ: criar conta, repo, credencial 'dockerhub' no Jenkins."),
        ("Conteudo dos sh dentro do Install/Test/Build",
         "todo", "TIME FAZ: cada integrante escreve uma stage (commits relevantes)."),
        ("Secao 'Uso de IA' do README",
         "todo", "TIME FAZ: modelos, prompts, dinamica, partes feitas a mao."),
        ("Defesa Q&A com dominio do projeto",
         "todo", "TIME FAZ: revisar este PDF + Jenkinsfile + docker-compose juntos."),
    ]))

    s.append(PageBreak())

    # ====== 5) ESTRUTURA ======
    s.append(Paragraph("5. Estrutura do projeto", styles["H1"]))
    s.append(code_block(
        "Dev_ops/\n"
        "  README.md                    -> ponto de entrada (NP2 + Uso de IA)\n"
        "  .env.example                 -> template das variaveis (portas, segredos)\n"
        "  .gitignore                   -> ignora node_modules, .env, coverage, dist\n"
        "  Jenkinsfile                  -> pipeline declarativo (TIME preenche TODOs)\n"
        "  docker-compose.yml           -> 4 containers (app stack)\n"
        "  docker-compose.jenkins.yml   -> Jenkins em container separado\n"
        "\n"
        "  backend/                     -> NestJS + Prisma\n"
        "    src/                       -> codigo (controllers, services, guards, ...)\n"
        "    prisma/                    -> schema + 3 migrations\n"
        "    Dockerfile                 -> imagem da API (Node 22 + nest build)\n"
        "    .env.example               -> env para rodar fora do Docker\n"
        "    package.json               -> scripts: build/lint/test/test:cov...\n"
        "                                  Jest com coverageThreshold 90%\n"
        "\n"
        "  frontend/                    -> Next.js 16\n"
        "    src/                       -> App Router + components + contexts\n"
        "    proxy.ts (em src/)         -> protecao de rotas (era 'middleware.ts')\n"
        "    Dockerfile                 -> imagem da UI (Node 22 + next build)\n"
        "    jest.config.ts             -> Jest com coverageThreshold 90%\n"
        "\n"
        "  scripts/                     -> ESPECIFICO da NP2\n"
        "    notify-email.js            -> script chamado pela stage Notify\n"
        "    package.json               -> dependencia: nodemailer\n"
        "    README.md                  -> uso do script\n"
        "\n"
        "  jenkins/                     -> ESPECIFICO da NP2\n"
        "    Dockerfile                 -> Jenkins LTS + Node 20 + Docker CLI + plugins\n"
        "\n"
        "  docs/                        -> documentacao\n"
        "    matriz-permissoes.md       -> acesso por rota (back)\n"
        "    fluxo-adocao.md            -> estados + diagrama\n"
        "    np2/                       -> este guia\n"
    ))

    s.append(PageBreak())

    # ====== 6) RODAR O JENKINS ======
    s.append(Paragraph("6. Como rodar o Jenkins (em container)", styles["H1"]))
    s.append(Paragraph(
        "O PDF do professor exige Jenkins em container - e nao 'instalado direto na "
        "maquina'. Por isso entregamos uma imagem customizada (jenkins/Dockerfile) "
        "que ja vem com tudo que o pipeline precisa: Node 20, Docker CLI, e os "
        "plugins (workflow, git, junit, htmlpublisher, docker-workflow, email-ext).",
        styles["Body"]))

    s.append(Paragraph("Passo 1 - subir o container", styles["H2"]))
    s.append(code_block(
        "# A partir da raiz do repo:\n"
        "docker compose -f docker-compose.jenkins.yml up -d --build\n"
        "\n"
        "# Pegar a senha inicial do admin:\n"
        "docker exec adotapet_jenkins cat /var/jenkins_home/secrets/initialAdminPassword\n"
        "\n"
        "# Abrir http://localhost:8080 e fazer o setup inicial:\n"
        "#   - pode pular plugins recomendados (a imagem ja tem os necessarios);\n"
        "#   - criar um usuario admin.\n"
    ))

    s.append(Paragraph("Passo 2 - criar o Job apontando para o Jenkinsfile", styles["H2"]))
    s.extend(bullets([
        "<b>New Item</b> -> nome <code>adotapet-pipeline</code> -> tipo <b>Pipeline</b>.",
        "Na configuracao do job: secao <b>Pipeline</b> -> <b>Definition</b>: "
        "<i>Pipeline script from SCM</i> (este passo eh permitido pelo PDF).",
        "<b>SCM</b>: Git. URL: o repositorio (https://github.com/roger-inatel/Dev_ops.git). "
        "Branch: <code>*/feature/devops-ready</code> (ou main apos o merge).",
        "<b>Script Path</b>: <code>Jenkinsfile</code>.",
        "Salvar e voltar para a tela do job.",
    ]))

    s.append(Paragraph("Passo 3 - configurar NOTIFY_EMAIL", styles["H2"]))
    s.append(Paragraph(
        "<b>Manage Jenkins</b> -> <b>Configure System</b> -> "
        "<b>Global properties</b> -> marcar <i>Environment variables</i> -> "
        "<b>Add</b>: name=<code>NOTIFY_EMAIL</code>, value=<code>(email do destinatario)</code>.",
        styles["Body"]))
    s.append(Paragraph(
        "<b>NAO</b> coloquem o e-mail no Jenkinsfile nem no docker-compose. "
        "Esse eh um criterio explicito do PDF.",
        styles["Warn"]))

    s.append(Paragraph("Passo 4 - como o Jenkins fala com o MailHog", styles["H2"]))
    s.append(Paragraph(
        "O container do Jenkins (compose proprio) NAO esta na mesma rede do "
        "compose principal. Por isso, o Jenkinsfile aponta para "
        "<code>SMTP_HOST=host.docker.internal</code> (default) - o Docker Desktop "
        "resolve isso para o IP do host, alcancando o MailHog na porta 1025 do "
        "host. Em Linux, o compose do Jenkins ja tem "
        "<code>extra_hosts: host.docker.internal:host-gateway</code> para o mesmo "
        "efeito funcionar.",
        styles["Body"]))

    s.append(PageBreak())

    # ====== 7) PREENCHER O JENKINSFILE ======
    s.append(Paragraph("7. Como preencher o Jenkinsfile", styles["H1"]))
    s.append(Paragraph(
        "Abram o arquivo <code>Jenkinsfile</code> na raiz do repo. Vocas vao "
        "encontrar 5 stages declaradas - 3 delas com <code>// TODO time</code>. "
        "Substituam cada TODO por comandos reais. <b>Dica</b>: para 'commits "
        "relevantes de todos', dividam uma stage por integrante.",
        styles["Body"]))

    s.append(Paragraph("Stage 'Install' - sugestao", styles["H2"]))
    s.append(code_block(
        "stage('Install') {\n"
        "  steps {\n"
        "    sh 'cd backend  && npm ci'\n"
        "    sh 'cd frontend && npm ci'\n"
        "    sh 'cd scripts  && npm ci'\n"
        "  }\n"
        "}\n"
    ))

    s.append(Paragraph("Stage 'Test' - sugestao", styles["H2"]))
    s.append(code_block(
        "stage('Test') {\n"
        "  steps {\n"
        "    sh 'cd backend && npx prisma generate'\n"
        "    sh 'cd backend && npm run test:cov'\n"
        "    sh 'cd frontend && npm test -- --coverage --ci'\n"
        "    // O coverageThreshold 90% no Jest faz o build quebrar se cair.\n"
        "  }\n"
        "}\n"
    ))

    s.append(Paragraph("Stage 'Build' - sugestao", styles["H2"]))
    s.append(code_block(
        "stage('Build') {\n"
        "  steps {\n"
        "    sh 'cd backend && npm run build'\n"
        "    sh 'docker build -t SEU_DOCKER_USER/adotapet-backend:${BUILD_NUMBER} \\\n"
        "        -f backend/Dockerfile backend'\n"
        "    withCredentials([usernamePassword(\n"
        "        credentialsId: 'dockerhub',\n"
        "        usernameVariable: 'DH_USER',\n"
        "        passwordVariable: 'DH_PASS')]) {\n"
        "      sh 'echo $DH_PASS | docker login -u $DH_USER --password-stdin'\n"
        "      sh 'docker push SEU_DOCKER_USER/adotapet-backend:${BUILD_NUMBER}'\n"
        "      sh 'docker tag  SEU_DOCKER_USER/adotapet-backend:${BUILD_NUMBER} \\\n"
        "          SEU_DOCKER_USER/adotapet-backend:latest'\n"
        "      sh 'docker push SEU_DOCKER_USER/adotapet-backend:latest'\n"
        "    }\n"
        "  }\n"
        "}\n"
    ))

    s.append(Paragraph(
        "<b>Atencao:</b> antes de descomentar o 'docker push', criem a credencial "
        "<code>dockerhub</code> em <b>Manage Jenkins -> Credentials -> System -> "
        "Global -> Add Credentials</b> (tipo: <i>Username with password</i>, "
        "ID exato: <code>dockerhub</code>).",
        styles["Warn"]))

    s.append(Paragraph("Stages 'Checkout' e 'Notify' (ja prontas)", styles["H2"]))
    s.append(Paragraph(
        "Nao precisam mexer. 'Checkout' faz o clone do SCM. 'Notify' chama "
        "<code>scripts/notify-email.js</code> que ja le NOTIFY_EMAIL do ambiente. "
        "O bloco <code>post { always {} }</code> arquiva pacote + relatorio + "
        "junit (criterio 4 do PDF). O bloco <code>post { failure {} }</code> "
        "reenvia notificacao com BUILD_STATUS=FAILURE.",
        styles["Body"]))

    s.append(PageBreak())

    # ====== 8) DOCKER HUB ======
    s.append(Paragraph("8. Publicar a imagem no Docker Hub", styles["H1"]))
    s.extend(bullets([
        "Criem conta em <code>https://hub.docker.com/</code> (usem o usuario do time).",
        "Criem um <b>repositorio publico</b>, ex: <code>SEU_USER/adotapet-backend</code>.",
        "No Jenkins, criem a credencial conforme passo anterior.",
        "Rodem o pipeline. Apos sucesso, voltem em <code>https://hub.docker.com/r/SEU_USER/adotapet-backend</code>.",
        "Copiem o link e adicionem ao README na secao 'Publicacao' ou no proprio "
        "topo. Tambem entreguem este link na tarefa do Teams (criterio explicito).",
    ]))
    s.append(Paragraph(
        "Para testar o que esta publicado, peguem a tag desejada e rodem: "
        "<code>docker run --rm -p 3010:3000 SEU_USER/adotapet-backend:latest</code>. "
        "Lembrem: esse run precisa de um MySQL acessivel - use a rede do compose "
        "principal ou suba so o mysql antes.",
        styles["Note"]))

    s.append(PageBreak())

    # ====== 9) USO DE IA ======
    s.append(Paragraph("9. Como preencher a secao 'Uso de IA' do README", styles["H1"]))
    s.append(Paragraph(
        "Esta secao eh <b>obrigatoria</b> pelo PDF do professor (secao 5) e <b>sejam "
        "honestos</b>. A avaliacao nao pune o uso de IA - pune a falta de "
        "transparencia. Copiar IA sem entender eh criterio eliminatorio. "
        "Abram <code>README.md</code> na raiz e encontrem a secao <i>Uso de IA</i>; "
        "ela esta com placeholders, basta preencher:",
        styles["Body"]))

    s.append(Paragraph("Modelos utilizados", styles["H3"]))
    s.append(Paragraph(
        "Listem os modelos usados pelo time. Ex: Claude (Sonnet 4.5), ChatGPT (GPT-4), "
        "Cursor, Copilot, Gemini. Se algum nao foi usado, removam.",
        styles["Body"]))

    s.append(Paragraph("Para que foram usados", styles["H3"]))
    s.append(Paragraph(
        "Sejam especificos. Exemplos honestos: 'geracao do esqueleto do Jenkinsfile', "
        "'debugging do docker-compose com erro de rewrite no Next', 'gerar este "
        "guia em PDF', 'revisar matriz de permissoes', 'sugerir specs de Jest'.",
        styles["Body"]))

    s.append(Paragraph("Exemplos de prompts (pelo menos 3)", styles["H3"]))
    s.append(Paragraph(
        "Coloquem o prompt <b>real</b> que voces usaram (copy-paste). Para cada, "
        "registrem: aceita / ajustada / descartada e o porque. Exemplos:",
        styles["Body"]))
    s.append(code_block(
        "1) Prompt: \"Como adicionar coverageThreshold no Jest do NestJS\n"
        "    com jest-junit como reporter pro Jenkins ler?\"\n"
        "   Resposta: aceita; ajustamos a porcentagem de branches para 75.\n"
        "\n"
        "2) Prompt: \"O rewrite do Next nao funciona dentro do Docker, ele\n"
        "    chama localhost:3000 em vez do container backend. Por que?\"\n"
        "   Resposta: ajustada; a IA sugeriu mudar para route handler, nos\n"
        "    escolhemos passar BACKEND_INTERNAL_URL como ARG no Dockerfile.\n"
        "\n"
        "3) Prompt: \"Sugira um Jenkinsfile declarativo para stages Install /\n"
        "    Test / Build / Notify, sem preencher os comandos (so esqueleto).\"\n"
        "   Resposta: aceita o esqueleto; cada um do time escreveu os sh do\n"
        "    proprio stage para garantir entendimento.\n"
    ))

    s.append(Paragraph("Dinamica de uso", styles["H3"]))
    s.append(Paragraph(
        "Como o time usou IA? Exemplos: 'cada PR foi revisado pelo Claude antes do "
        "merge', 'usamos ChatGPT em pair programming para tirar duvidas de Prisma', "
        "'usamos Copilot inline para testes Jest', etc.",
        styles["Body"]))

    s.append(Paragraph("O que NAO foi feito por IA", styles["H3"]))
    s.append(Paragraph(
        "Destaquem o que cada integrante fez a mao. Ex: 'definicao das regras de "
        "negocio da adocao', 'desenho da matriz de permissoes', 'criacao da "
        "credencial Docker Hub e do Job no Jenkins'.",
        styles["Body"]))

    s.append(PageBreak())

    # ====== 10) CHECKLIST + CRITERIOS ======
    s.append(Paragraph("10. Checklist final + mapeamento dos criterios", styles["H1"]))
    s.append(Paragraph(
        "Tabela completa cruzando o que o PDF do professor avalia com o que ja "
        "esta atendido vs o que cabe ao time. Levem este PDF impresso na defesa.",
        styles["Body"]))
    s.append(criteria_table())

    s.append(Spacer(1, 0.5 * cm))
    s.append(Paragraph(
        "Checklist 5 minutos antes da defesa", styles["H2"]))
    s.extend(bullets([
        "Stack do projeto sobe? <code>docker compose up -d</code> -> 4 containers verdes?",
        "Swagger abre em <code>http://localhost:3010/docs</code>?",
        "Frontend abre em <code>http://localhost:3011</code>?",
        "DBeaver conecta em localhost:3316?",
        "Jenkins abre em <code>http://localhost:8080</code>?",
        "Job 'adotapet-pipeline' configurado pelo SCM (NAO pela GUI)?",
        "Variavel NOTIFY_EMAIL setada em Configure System?",
        "Credencial 'dockerhub' criada (se ja publicaram)?",
        "Pipeline roda 'Build Now' sem erro?",
        "MailHog em <code>http://localhost:8025</code> mostra o e-mail apos o build?",
        "Imagem aparece em <code>hub.docker.com/r/SEU_USER/adotapet-backend</code>?",
        "Secao 'Uso de IA' do README preenchida?",
        "Todos os membros tem commits relevantes no historico?",
    ]))

    s.append(PageBreak())

    # ====== 11) FAQ ======
    s.append(Paragraph("11. FAQ e troubleshooting", styles["H1"]))

    s.append(Paragraph("Port already allocated ao subir o compose", styles["H3"]))
    s.append(Paragraph(
        "Algum outro projeto seu esta usando a porta 3010, 3011, 3316, 1025 ou 8025. "
        "Edite <code>.env</code> e mude o numero (variaveis BACKEND_HOST_PORT, "
        "FRONTEND_HOST_PORT, etc.). Depois <code>docker compose up -d</code>.",
        styles["Body"]))

    s.append(Paragraph("Erro de prisma generate dentro do container backend", styles["H3"]))
    s.append(Paragraph(
        "O Dockerfile do backend ja roda <code>npx prisma generate</code>. Se voce "
        "rodar fora do Docker e esquecer, vai dar <i>'UserRole has no exported member'</i>. "
        "Solucao: <code>cd backend && npx prisma generate</code>.",
        styles["Body"]))

    s.append(Paragraph("Frontend mostra 404 em /api-backend/*", styles["H3"]))
    s.append(Paragraph(
        "O rewrite do Next eh compilado em <b>build time</b>. Se voce mexer em "
        "<code>next.config.ts</code> ou mudar BACKEND_INTERNAL_URL, eh preciso "
        "<b>rebuild</b>: <code>docker compose up --build -d frontend</code>.",
        styles["Body"]))

    s.append(Paragraph("Notify-email diz 'NOTIFY_EMAIL ausente'", styles["H3"]))
    s.append(Paragraph(
        "Eh proposital - o script falha quando voce esquece de definir a variavel. "
        "No Jenkins, defina em <i>Configure System > Global properties</i>. Em teste "
        "manual, exporte antes de chamar o script.",
        styles["Body"]))

    s.append(Paragraph("Jenkins nao acha 'docker' no PATH", styles["H3"]))
    s.append(Paragraph(
        "Se voce buildou a imagem do Jenkins sem o nosso jenkins/Dockerfile, vai faltar "
        "Docker CLI. Use sempre <code>docker compose -f docker-compose.jenkins.yml "
        "up --build</code> a partir da raiz do repo.",
        styles["Body"]))

    s.append(Paragraph("Login pelo frontend nao popula o menu", styles["H3"]))
    s.append(Paragraph(
        "Antes desta versao, o backend devolvia apenas o token. Foi corrigido para "
        "devolver tambem o objeto <code>user</code>. Se persistir, conferir "
        "<code>backend/src/modules/auth/auth.service.ts</code> e o spec.",
        styles["Body"]))

    s.append(Paragraph("MySQL nao sobe (porta 3306 / 3316 ocupada)", styles["H3"]))
    s.append(Paragraph(
        "Em geral acontece quando ha um MySQL nativo no Windows. Pare o servico ou "
        "mude a porta no <code>.env</code> (MYSQL_HOST_PORT=3308, por ex.). Lembre-se "
        "de atualizar a conexao do DBeaver tambem.",
        styles["Body"]))

    s.append(Spacer(1, 1*cm))
    s.append(Paragraph(
        "<i>Sucesso na defesa. Quando duvidarem entre 'usar GUI' e 'colocar no "
        "Jenkinsfile', a resposta eh sempre Jenkinsfile.</i>",
        styles["CoverSub"]))
    return s


def main():
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=1.7 * cm,
        bottomMargin=1.5 * cm,
        title="Guia NP2 S07 - AdotaPet",
        author="Time AdotaPet",
        subject="DevOps - Jenkins, Docker, CI/CD",
    )
    story = build_story()
    doc.build(story, onFirstPage=_draw_header_footer,
              onLaterPages=_draw_header_footer)
    print(f"PDF gerado em: {OUTPUT}")


if __name__ == "__main__":
    main()
