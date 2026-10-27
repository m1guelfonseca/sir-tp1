// Gestão de alunos: ver, adicionar, editar e apagar alunos através da Fetch API.

// URL base da API. Vazio = mesma origem (o json-server serve este frontend com --static).
// Na Parte 5, trocar pelo URL da API alojada no Render.
const API = "";

let alunos = [];
let cursos = [];
let alunoEmEdicao = null; // null quando se está a adicionar um aluno novo

const lista = document.querySelector("#lista");
const estado = document.querySelector("#estado");
const pesquisa = document.querySelector("#pesquisa");
const filtroCurso = document.querySelector("#filtro-curso");
const dialogo = document.querySelector("#dialogo");
const form = document.querySelector("#form");
const formTitulo = document.querySelector("#form-titulo");
const formErro = document.querySelector("#form-erro");
const aviso = document.querySelector("#aviso");

// ---------- Comunicação com a API ----------

// Faz um pedido à API e devolve o JSON da resposta. Lança um erro se o pedido falhar.
async function pedir(caminho, metodo = "GET", dados) {
  const opcoes = { method: metodo };
  if (dados) {
    opcoes.headers = { "Content-Type": "application/json" };
    opcoes.body = JSON.stringify(dados);
  }

  const resposta = await fetch(API + caminho, opcoes);
  if (!resposta.ok) {
    throw new Error(`O servidor respondeu com o erro ${resposta.status}.`);
  }
  return resposta.status === 204 ? null : resposta.json();
}

async function carregarAlunos() {
  alunos = await pedir("/alunos");
  desenharLista();
}

// ---------- Mensagens ----------

function mostrarEstado(mensagem, erro = false) {
  estado.textContent = mensagem;
  estado.classList.toggle("texto-erro", erro);
  estado.hidden = false;
}

// Mostra uma mensagem curta no fundo da página durante alguns segundos.
function mostrarAviso(mensagem) {
  aviso.textContent = mensagem;
  aviso.hidden = false;
  setTimeout(() => (aviso.hidden = true), 2500);
}

// ---------- Lista de alunos ----------

const nomeCompleto = (aluno) => `${aluno.nome} ${aluno.apelido}`;

function nomeDoCurso(idCurso) {
  const curso = cursos.find((curso) => curso.id === idCurso);
  return curso ? curso.nomeDoCurso : "Curso desconhecido";
}

function criarLinha(aluno) {
  const linha = document.createElement("li");
  linha.className = "aluno";
  linha.innerHTML = `
    <div class="dados">
      <span class="nome"></span>
      <span class="curso"></span>
    </div>
    <span class="ano"></span>
    <button type="button" class="btn-texto">Editar</button>
    <button type="button" class="btn-texto apagar">Apagar</button>
  `;

  // Os dados entram com textContent para que o texto escrito pelo utilizador nunca seja lido como HTML.
  linha.querySelector(".nome").textContent = nomeCompleto(aluno);
  linha.querySelector(".curso").textContent = nomeDoCurso(aluno.idCurso);
  linha.querySelector(".ano").textContent = `${aluno.anoCurricular}.º ano`;

  const [btnEditar, btnApagar] = linha.querySelectorAll("button");
  btnEditar.addEventListener("click", () => abrirFormulario(aluno));
  btnApagar.addEventListener("click", () => apagar(aluno));

  return linha;
}

// Mostra os alunos que passam na pesquisa por nome e no filtro por curso.
function desenharLista() {
  const termo = pesquisa.value.trim().toLowerCase();
  const idCurso = Number(filtroCurso.value); // 0 = todos os cursos

  const visiveis = alunos.filter(
    (aluno) =>
      nomeCompleto(aluno).toLowerCase().includes(termo) &&
      (idCurso === 0 || aluno.idCurso === idCurso)
  );

  lista.replaceChildren(...visiveis.map(criarLinha));

  if (visiveis.length === 0) {
    mostrarEstado("Nenhum aluno para mostrar.");
  } else {
    estado.hidden = true;
  }
}

// Acrescenta os cursos ao filtro e ao formulário.
function preencherCursos() {
  for (const curso of cursos) {
    filtroCurso.add(new Option(curso.nomeDoCurso, curso.id));
    form.idCurso.add(new Option(curso.nomeDoCurso, curso.id));
  }
}

// ---------- Adicionar e editar ----------

function abrirFormulario(aluno = null) {
  alunoEmEdicao = aluno;
  formTitulo.textContent = aluno ? "Editar aluno" : "Novo aluno";
  formErro.hidden = true;

  form.nome.value = aluno ? aluno.nome : "";
  form.apelido.value = aluno ? aluno.apelido : "";
  form.idCurso.value = aluno ? aluno.idCurso : "";
  form.anoCurricular.value = aluno ? aluno.anoCurricular : 1;

  dialogo.showModal();
}

// O navegador valida os campos obrigatórios antes de este evento ser disparado.
async function guardar(evento) {
  evento.preventDefault();

  const dados = {
    nome: form.nome.value.trim(),
    apelido: form.apelido.value.trim(),
    idCurso: Number(form.idCurso.value),
    anoCurricular: Number(form.anoCurricular.value),
  };

  try {
    if (alunoEmEdicao) {
      await pedir(`/alunos/${alunoEmEdicao.id}`, "PUT", dados);
    } else {
      await pedir("/alunos", "POST", dados);
    }
    dialogo.close();
    mostrarAviso(alunoEmEdicao ? "Aluno atualizado" : "Aluno adicionado");
    await carregarAlunos();
  } catch (erro) {
    formErro.textContent = `Não foi possível guardar. ${erro.message}`;
    formErro.hidden = false;
  }
}

// ---------- Apagar ----------

async function apagar(aluno) {
  if (!confirm(`Apagar ${nomeCompleto(aluno)}?`)) {
    return;
  }

  try {
    await pedir(`/alunos/${aluno.id}`, "DELETE");
    mostrarAviso("Aluno apagado");
    await carregarAlunos();
  } catch (erro) {
    mostrarAviso(`Não foi possível apagar. ${erro.message}`);
  }
}

// ---------- Arranque ----------

async function iniciar() {
  try {
    cursos = await pedir("/cursos");
    preencherCursos();
    await carregarAlunos();
  } catch (erro) {
    mostrarEstado(
      "Não foi possível contactar a API. Confirma que o servidor está a correr (npm start na pasta mock-server).",
      true
    );
  }
}

document.querySelector("#btn-novo").addEventListener("click", () => abrirFormulario());
document.querySelector("#btn-cancelar").addEventListener("click", () => dialogo.close());
form.addEventListener("submit", guardar);
pesquisa.addEventListener("input", desenharLista);
filtroCurso.addEventListener("change", desenharLista);

iniciar();
