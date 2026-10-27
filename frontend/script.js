// Gestão de alunos: ver, adicionar, editar e apagar alunos através da Fetch API.

// Endereço da API. Vazio = o mesmo servidor que serve esta página
// (tanto o json-server como a API Express servem o frontend).
// Na Parte 5, trocar pelo endereço da API no Render.
const API_URL = "";

let alunos = [];
let cursos = [];
let alunoEmEdicao = null; // null quando se está a adicionar um aluno novo

// Elementos da página
const listaAlunos = document.querySelector("#lista-alunos");
const mensagemLista = document.querySelector("#mensagem-lista");
const campoPesquisa = document.querySelector("#pesquisa");
const filtroCurso = document.querySelector("#filtro-curso");
const dialogoFormulario = document.querySelector("#dialogo-formulario");
const formulario = document.querySelector("#formulario");
const tituloFormulario = document.querySelector("#titulo-formulario");
const erroFormulario = document.querySelector("#erro-formulario");
const notificacao = document.querySelector("#notificacao");

// ---------- Comunicação com a API ----------

// Faz um pedido à API e devolve a resposta em JSON. Lança um erro se o pedido falhar.
async function chamarApi(caminho, metodo = "GET", dados) {
  const opcoes = { method: metodo };
  if (dados) {
    opcoes.headers = { "Content-Type": "application/json" };
    opcoes.body = JSON.stringify(dados);
  }

  const resposta = await fetch(API_URL + caminho, opcoes);
  if (!resposta.ok) {
    throw new Error(`O servidor respondeu com o erro ${resposta.status}.`);
  }
  // 204 = sucesso sem conteúdo (resposta da API Express ao apagar)
  return resposta.status === 204 ? null : resposta.json();
}

async function carregarAlunos() {
  alunos = await chamarApi("/alunos");
  mostrarAlunos();
}

// ---------- Mensagens ----------

// Mensagem no lugar da lista (a carregar, lista vazia ou erro).
function mostrarMensagemLista(texto, eErro = false) {
  mensagemLista.textContent = texto;
  mensagemLista.classList.toggle("texto-erro", eErro);
  mensagemLista.hidden = false;
}

// Mensagem curta no fundo da página que desaparece sozinha.
function mostrarNotificacao(texto) {
  notificacao.textContent = texto;
  notificacao.hidden = false;
  setTimeout(() => (notificacao.hidden = true), 2500);
}

// ---------- Cursos ----------

// Compara ids como texto: o json-server usa números (1) e o MongoDB usa texto ("665f...").
const idsIguais = (id1, id2) => String(id1) === String(id2);

const procurarCurso = (idCurso) => cursos.find((curso) => idsIguais(curso.id, idCurso));

function nomeDoCurso(idCurso) {
  const curso = procurarCurso(idCurso);
  return curso ? curso.nomeDoCurso : "Curso desconhecido";
}

// Acrescenta os cursos às opções do filtro e do formulário.
function preencherOpcoesDeCursos() {
  for (const curso of cursos) {
    filtroCurso.add(new Option(curso.nomeDoCurso, curso.id));
    formulario.idCurso.add(new Option(curso.nomeDoCurso, curso.id));
  }
}

// ---------- Lista de alunos ----------

const nomeCompleto = (aluno) => `${aluno.nome} ${aluno.apelido}`;

function criarItemAluno(aluno) {
  const item = document.createElement("li");
  item.className = "aluno";
  item.innerHTML = `
    <div class="info-aluno">
      <span class="nome"></span>
      <span class="curso"></span>
    </div>
    <span class="ano"></span>
    <button type="button" class="botao-texto">Editar</button>
    <button type="button" class="botao-texto apagar">Apagar</button>
  `;

  // Os dados entram com textContent para que o texto escrito pelo utilizador nunca seja lido como HTML.
  item.querySelector(".nome").textContent = nomeCompleto(aluno);
  item.querySelector(".curso").textContent = nomeDoCurso(aluno.idCurso);
  item.querySelector(".ano").textContent = `${aluno.anoCurricular}.º ano`;

  const [botaoEditar, botaoApagar] = item.querySelectorAll("button");
  botaoEditar.addEventListener("click", () => abrirFormulario(aluno));
  botaoApagar.addEventListener("click", () => apagarAluno(aluno));

  return item;
}

// Mostra os alunos que passam na pesquisa por nome e no filtro por curso.
function mostrarAlunos() {
  const textoPesquisa = campoPesquisa.value.trim().toLowerCase();
  const cursoEscolhido = filtroCurso.value; // "" = todos os cursos

  const alunosFiltrados = alunos.filter(
    (aluno) =>
      nomeCompleto(aluno).toLowerCase().includes(textoPesquisa) &&
      (cursoEscolhido === "" || idsIguais(aluno.idCurso, cursoEscolhido))
  );

  listaAlunos.replaceChildren(...alunosFiltrados.map(criarItemAluno));

  if (alunosFiltrados.length === 0) {
    mostrarMensagemLista("Nenhum aluno para mostrar.");
  } else {
    mensagemLista.hidden = true;
  }
}

// ---------- Adicionar e editar ----------

// Sem aluno abre o formulário vazio (adicionar); com aluno abre-o preenchido (editar).
function abrirFormulario(aluno = null) {
  alunoEmEdicao = aluno;
  tituloFormulario.textContent = aluno ? "Editar aluno" : "Novo aluno";
  erroFormulario.hidden = true;

  const valores = aluno || { nome: "", apelido: "", idCurso: "", anoCurricular: 1 };
  formulario.nome.value = valores.nome;
  formulario.apelido.value = valores.apelido;
  formulario.idCurso.value = valores.idCurso;
  formulario.anoCurricular.value = valores.anoCurricular;

  dialogoFormulario.showModal();
}

// O navegador valida os campos obrigatórios antes de este evento ser disparado.
async function guardarAluno(evento) {
  evento.preventDefault();

  const dadosAluno = {
    nome: formulario.nome.value.trim(),
    apelido: formulario.apelido.value.trim(),
    idCurso: procurarCurso(formulario.idCurso.value).id, // o <select> dá texto; assim fica com o tipo de id da API
    anoCurricular: Number(formulario.anoCurricular.value),
  };

  try {
    if (alunoEmEdicao) {
      await chamarApi(`/alunos/${alunoEmEdicao.id}`, "PUT", dadosAluno);
    } else {
      await chamarApi("/alunos", "POST", dadosAluno);
    }
    dialogoFormulario.close();
    mostrarNotificacao(alunoEmEdicao ? "Aluno atualizado" : "Aluno adicionado");
    await carregarAlunos();
  } catch (erro) {
    erroFormulario.textContent = `Não foi possível guardar. ${erro.message}`;
    erroFormulario.hidden = false;
  }
}

// ---------- Apagar ----------

async function apagarAluno(aluno) {
  if (!confirm(`Apagar ${nomeCompleto(aluno)}?`)) {
    return;
  }

  try {
    await chamarApi(`/alunos/${aluno.id}`, "DELETE");
    mostrarNotificacao("Aluno apagado");
    await carregarAlunos();
  } catch (erro) {
    mostrarNotificacao(`Não foi possível apagar. ${erro.message}`);
  }
}

// ---------- Arranque ----------

async function iniciar() {
  try {
    cursos = await chamarApi("/cursos");
    preencherOpcoesDeCursos();
    await carregarAlunos();
  } catch (erro) {
    mostrarMensagemLista("Não foi possível contactar a API. Confirma que o servidor está a correr.", true);
  }
}

document.querySelector("#btn-novo-aluno").addEventListener("click", () => abrirFormulario());
document.querySelector("#btn-cancelar").addEventListener("click", () => dialogoFormulario.close());
formulario.addEventListener("submit", guardarAluno);
campoPesquisa.addEventListener("input", mostrarAlunos);
filtroCurso.addEventListener("change", mostrarAlunos);

iniciar();
