# backend

API RESTful de alunos e cursos com Node.js, Express e MongoDB Atlas (mongoose).
Tem os mesmos endpoints que o json-server, por isso o frontend funciona com as duas.

## Estrutura (MVC)

```
backend/
├── server.js          ← cria a app Express, liga as rotas e trata os erros
├── seed.js            ← migra mock-data/bd.json para o MongoDB
├── config/db.js       ← ligação ao MongoDB
├── models/            ← esquemas mongoose (Aluno, Curso)
├── controllers/       ← o que cada endpoint faz
└── routes/            ← liga cada URL ao controller
```

## Como correr

Requer Node.js 22 ou mais recente.

1. No [MongoDB Atlas](https://www.mongodb.com/atlas), criar um cluster gratuito, um utilizador da base de dados
   e permitir o acesso a partir do teu IP (Network Access). Copiar a connection string (Connect → Drivers).
2. Copiar `.env.example` para `.env` e colar a connection string em `MONGODB_URI`
   (com o nome da base de dados no fim, por exemplo `.../sir-tp1`).
3. Instalar, migrar os dados e arrancar:

```bash
npm install
npm run seed
npm start
```

A API fica em http://localhost:3000 e o frontend também é servido no mesmo endereço.

## Endpoints

| Método | URL | Descrição | Resposta |
|---|---|---|---|
| GET | `/alunos` | lista os alunos | 200 |
| GET | `/alunos/:id` | obtém um aluno | 200 / 404 |
| POST | `/alunos` | cria um aluno | 201 / 400 |
| PUT | `/alunos/:id` | substitui um aluno | 200 / 400 / 404 |
| PATCH | `/alunos/:id` | altera alguns campos | 200 / 400 / 404 |
| DELETE | `/alunos/:id` | apaga um aluno | 204 / 404 |

Os mesmos endpoints existem para `/cursos`. Só é possível apagar um curso sem alunos (senão responde 409).

Aluno: `{ "nome": "Ana", "apelido": "Silva", "idCurso": "<id de um curso>", "anoCurricular": 1 }`
(todos obrigatórios; `anoCurricular` entre 1 e 3).

Curso: `{ "nomeDoCurso": "Engenharia Informática" }`

Os erros vêm no formato `{ "erro": "mensagem" }`.
