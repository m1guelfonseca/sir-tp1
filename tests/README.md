# Testes Postman

`postman-collection.json` testa o CRUD de alunos e a leitura de cursos.

1. Arrancar a API (`npm start` na pasta `mock-server`).
2. No Postman: **Import** → escolher `postman-collection.json`.
3. Correr a coleção (**Run collection**) pela ordem em que está.

O pedido "Criar aluno" guarda o id do aluno novo na variável `alunoId`, que é usada
para o atualizar e apagar a seguir. No fim, a base de dados fica como estava.

Para testar outra API (por exemplo a do Render), basta mudar a variável `baseUrl` da coleção.
