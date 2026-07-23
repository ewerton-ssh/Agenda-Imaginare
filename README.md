# Agenda Imaginare

O Agenda Imaginare é uma aplicação web para gestão de serviços, calendário e usuários, com uma interface moderna e uma API REST para autenticação, cadastros e administração de serviços.

## Visão Geral

O projeto é dividido em duas partes:

- Frontend: aplicação React + TypeScript + Vite
- Backend: API Node.js + Express + MongoDB

A plataforma permite:

- cadastro e login de usuários
- autenticação com JWT e cookies
- cadastro, edição, exclusão e marcação de serviços como concluídos
- visualização em calendário semanal/mensal
- filtros, busca e painel com estatísticas
- upload de imagens para serviços
- painel administrativo para gerenciamento de usuários

## Tecnologias

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios
- Chart.js
- React Hot Toast

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT
- bcrypt
- multer
- cookie-parser
- express-rate-limit

## Estrutura do Projeto

```text
Agenda_Imaginare/
├── Backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── uploads/
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
└── README.md
```

## Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- Node.js 18 ou superior
- npm ou yarn
- MongoDB rodando localmente ou acessível por URL

## Configuração do Backend

1. Acesse a pasta do backend:

```bash
cd Backend
```

2. Instale as dependências:

```bash
npm run setup
```

3. Crie um arquivo `.env` com as variáveis abaixo:

```env
HTTP_PORT=3000
CORS_ADDRESS=http://localhost:5173
MONGODB_URL=mongodb://localhost:27017/
MONGODB_DATABASE=agenda_imaginare
JWT_SECRET=seu_token_secreto
NODE_ENV=development
```

4. Inicie a API:

```bash
npm start
```

## Configuração do Frontend

1. Acesse a pasta do frontend:

```bash
cd Frontend
```

2. Instale as dependências:

```bash
npm run setup
```

3. Crie um arquivo `.env` com a variável abaixo:

```env
VITE_BACKEND_URI=http://localhost:3000
```

4. Inicie o projeto:

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:5173
```

## Scripts Disponíveis

### Backend
- `npm start` — inicia o servidor com nodemon
- `npm run setup` — instala as dependências

### Frontend
- `npm run dev` — inicia o ambiente de desenvolvimento
- `npm run build` — gera a build de produção
- `npm run lint` — executa a análise lint do projeto
- `npm run preview` — visualiza a build localmente

## Funcionalidades Principais

- Autenticação de usuários
- Registro e login
- Gerenciamento de serviços com imagens
- Calendário semanal e mensal
- Filtros e busca
- Estatísticas e gráficos
- Administração de usuários

## Observações

- Alguns recursos administrativos estão restritos a usuários com perfil de administrador.
- Os uploads de imagem são armazenados na pasta de uploads do backend.
- A API utiliza rotas com prefixo `/api/v1`.

## Licença

Este projeto é de uso interno e pode ser adaptado conforme necessário.
