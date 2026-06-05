# AdotaPet — Monorepo

![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.x-000000?logo=nextdotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?logo=jenkins&logoColor=white)

Plataforma digital para **adoção responsável de animais**. Projeto acadêmico da disciplina **S204 / INATEL 2026-1**.

---

## Estrutura do Repositório

```
adotapet-monorepo/
├── backend/          # API REST — NestJS + Prisma + MySQL
├── frontend/         # App web — Next.js 16 + React 19
├── mysql/            # Script de inicialização do MySQL
├── jenkins/          # Imagem Jenkins customizada + Jenkinsfile
├── docker-compose.jenkins.yml  # Sobe o Jenkins com Docker socket
└── README.md
```

---

## Stack

| Camada    | Tecnologia                                      |
|-----------|-------------------------------------------------|
| Backend   | NestJS 11, TypeScript, Prisma ORM, JWT, Bcrypt  |
| Frontend  | Next.js 16, React 19, Tailwind CSS 4, Zod       |
| Banco     | MySQL 8                                         |
| CI/CD     | Jenkins (pipeline declarativo)                  |
| Imagens   | Docker + DockerHub (`fabioooo/adotapet-backend`) |

---

## Rodando localmente (sem Docker)

### Pré-requisitos
- Node.js 22+
- MySQL 8 rodando (ou via Docker — veja abaixo)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # ajuste DATABASE_URL e JWT_SECRET
npx prisma migrate dev
npm run start:dev
# API em http://localhost:3000
# Swagger em http://localhost:3000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App em http://localhost:3001
```

---

## Subindo o MySQL com Docker

```bash
docker run --name adotapet-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=adotapet \
  -p 3306:3306 \
  -d mysql:8
```

---

## CI/CD com Jenkins

### 1. Build e push da imagem Jenkins (fazer UMA vez)

Antes de subir o Jenkins, publique a imagem customizada no DockerHub para que qualquer membro do time possa puxá-la.

```bash
# Na raiz do repositório:
docker build -t fabioooo/jenkins-adotapet:latest ./jenkins
docker login
docker push fabioooo/jenkins-adotapet:latest
```

### 2. Subir o Jenkins

```bash
docker compose -f docker-compose.jenkins.yml up -d
```

Acesse `http://localhost:8080`. Na primeira vez, pegue a senha inicial com:

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 3. Configurar credencial do DockerHub no Jenkins

1. **Manage Jenkins → Credentials → System → Global credentials**
2. Adicione uma credencial do tipo **Username with password**
3. ID: `dockerhub-credentials`
4. Username: `fabioooo` | Password: seu token DockerHub

### 4. Criar o Pipeline

1. **New Item → Pipeline**
2. Em *Pipeline Definition*, escolha **Pipeline script from SCM**
3. SCM: **Git** | URL do repositório
4. Script Path: `jenkins/Jenkinsfile`

### Pipeline (o que ele faz)

```
Checkout → Instalar deps → Testes unitários → Build imagem → Push DockerHub
```

A cada push na branch `main`, o Jenkins:
- Roda os testes unitários do backend
- Coleta relatório JUnit
- Builda `fabioooo/adotapet-backend:<build_number>` e `latest`
- Faz push para o DockerHub

---

## Testes

| Tipo         | Comando                          | Localização                   |
|--------------|----------------------------------|-------------------------------|
| Unit         | `npm test`                       | `backend/src/**`              |
| Integration  | `npm run test:integration`       | `backend/test/integration/`   |
| E2E backend  | `npm run test:e2e`               | `backend/test/`               |
| E2E frontend | `npm run cypress:open`           | `frontend/cypress/`           |

---

## Equipe

- Roger
- Fabio
- Igor
- João Paulo

---

## Licença

Projeto acadêmico para fins educacionais — INATEL S07 / 2026-1.