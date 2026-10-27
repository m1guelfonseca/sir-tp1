# mock-server

API simulada com json-server, a partir de `../mock-data/bd.json`.
Também serve o frontend (`../frontend`) como ficheiros estáticos.

```bash
npm install
npm start
```

- Frontend: http://localhost:3000
- Alunos: http://localhost:3000/alunos
- Cursos: http://localhost:3000/cursos

`npm run reset` repõe o `bd.json` como está no último commit (útil depois de testar).
