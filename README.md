# sir-tp1

Atividade Prática #1 de SIR: consumo e implementação de APIs RESTful (gestão de alunos e cursos).

## Links

- Aplicação (frontend + API): https://sir-tp1-backend.vercel.app
  - Alunos: https://sir-tp1-backend.vercel.app/alunos
  - Cursos: https://sir-tp1-backend.vercel.app/cursos
- Documentação da API: _(Parte 6 — por preencher)_

## Estrutura

| Pasta | Conteúdo |
|---|---|
| [`mock-data/`](mock-data/) | `bd.json` com os alunos e cursos originais |
| [`mock-server/`](mock-server/) | API simulada com json-server |
| [`tests/`](tests/) | coleção de testes do Postman |
| [`frontend/`](frontend/) | página web (HTML, CSS e JavaScript com Fetch API) |
| [`backend/`](backend/) | API real com Node.js, Express e MongoDB Atlas |
| [`api/`](api/) + [`vercel.json`](vercel.json) + [`package.json`](package.json) | configuração do deploy no Vercel |

## Como correr

**API simulada (json-server)** — ver [mock-server/README.md](mock-server/README.md):

```bash
cd mock-server
npm install
npm start
```

**API real (Express + MongoDB)** — ver [backend/README.md](backend/README.md):

```bash
cd backend
npm install
npm run seed
npm start
```

As duas usam a porta 3000 e servem também o frontend em http://localhost:3000.

**Testes** — importar [tests/postman-collection.json](tests/postman-collection.json) no Postman
e correr a coleção (ver [tests/README.md](tests/README.md)).

## Deploy no Vercel

O frontend e a API ficam no mesmo projeto do Vercel, com o mesmo endereço:

- os ficheiros da pasta `frontend/` são servidos como site (`outputDirectory` no `vercel.json`);
- os pedidos a `/alunos` e `/cursos` vão para a função `api/index.js`, que usa a app Express do backend;
- o `package.json` da raiz diz ao Vercel que dependências instalar para a API.

Passos: importar o repositório no Vercel (Framework Preset: Other, Root Directory: `./`) e
adicionar a variável de ambiente `MONGODB_URI` com a connection string do MongoDB Atlas.
