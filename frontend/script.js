// Gestão de alunos: ver, adicionar, editar e apagar alunos através da Fetch API.

// Endereço da API. Vazio = o mesmo servidor que serve esta página
// (tanto o json-server como a API Express servem o frontend).
// Na Parte 5, trocar pelo endereço da API no Render.
const API_URL = "";

let alunos = [];
let cursos = [];
let aluno_em_edicao = null; // null quando se está a adicionar um aluno novo

// Elementos da página
const lista_alunos = document.querySelector("#lista-alunos");
const mensagem_lista = document.querySelector("#mensagem-lista");
const campo_pesquisa = document.querySelector("#pesquisa");
const filtro_curso = document.querySelector("#filtro-curso");
const dialogo_formulario = document.querySelector("#dialogo-formulario");
const formulario = document.querySelector("#formulario");
const titulo_formulario = document.querySelector("#titulo-formulario");
const erro_formulario = document.querySelector("#erro-formulario");
const notificacao = document.querySelector("#notificacao");

// ---------- Pedidos à API ----------

// Faz um pedido à API e devolve a resposta em JSON. Lança um erro se o pedido falhar.
async function call_api(caminho, metodo = "GET", dados) {
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

async function load_cursos() {
  cursos = await call_api("/cursos");
  fill_opcoes_cursos();
}

async function load_alunos() {
  alunos = await call_api("/alunos");
  show_alunos();
}

function create_aluno(dados_aluno) {
  return call_api("/alunos", "POST", dados_aluno);
}

function edit_aluno(id_aluno, dados_aluno) {
  return call_api(`/alunos/${id_aluno}`, "PUT", dados_aluno);
}

function delete_aluno(id_aluno) {
  return call_api(`/alunos/${id_aluno}`, "DELETE");
}

// ---------- Mensagens ----------

// Mensagem no lugar da lista (a carregar, lista vazia ou erro).
function show_mensagem_lista(texto, com_erro = false) {
  mensagem_lista.textContent = texto;
  mensagem_lista.classList.toggle("texto-erro", com_erro);
  mensagem_lista.hidden = false;
}

// Mensagem curta no fundo da página que desaparece sozinha.
function show_notificacao(texto) {
  notificacao.textContent = texto;
  notificacao.hidden = false;
  setTimeout(() => (notificacao.hidden = true), 2500);
}

// ---------- Cursos ----------

// Compara ids como texto: o json-server usa números (1) e o MongoDB usa texto ("665f...").
function is_same_id(id_1, id_2) {
  return String(id_1) === String(id_2);
}

function find_curso(id_curso) {
  return cursos.find((curso) => is_same_id(curso.id, id_curso));
}

function get_nome_curso(id_curso) {
  const curso = find_curso(id_curso);
  return curso ? curso.nomeDoCurso : "Curso desconhecido";
}

// Acrescenta os cursos às opções do filtro e do formulário.
function fill_opcoes_cursos() {
  for (const curso of cursos) {
    filtro_curso.add(new Option(curso.nomeDoCurso, curso.id));
    formulario.idCurso.add(new Option(curso.nomeDoCurso, curso.id));
  }
}

// ---------- Lista de alunos ----------

function get_nome_completo(aluno) {
  return `${aluno.nome} ${aluno.apelido}`;
}

function create_item_aluno(aluno) {
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
  item.querySelector(".nome").textContent = get_nome_completo(aluno);
  item.querySelector(".curso").textContent = get_nome_curso(aluno.idCurso);
  item.querySelector(".ano").textContent = `${aluno.anoCurricular}.º ano`;

  const [botao_editar, botao_apagar] = item.querySelectorAll("button");
  botao_editar.addEventListener("click", () => open_formulario(aluno));
  botao_apagar.addEventListener("click", () => confirm_delete_aluno(aluno));

  return item;
}

// Mostra os alunos que passam na pesquisa por nome e no filtro por curso.
function show_alunos() {
  const texto_pesquisa = campo_pesquisa.value.trim().toLowerCase();
  const curso_escolhido = filtro_curso.value; // "" = todos os cursos

  const alunos_filtrados = alunos.filter(
    (aluno) =>
      get_nome_completo(aluno).toLowerCase().includes(texto_pesquisa) &&
      (curso_escolhido === "" || is_same_id(aluno.idCurso, curso_escolhido))
  );

  lista_alunos.replaceChildren(...alunos_filtrados.map(create_item_aluno));

  if (alunos_filtrados.length === 0) {
    show_mensagem_lista("Nenhum aluno para mostrar.");
  } else {
    mensagem_lista.hidden = true;
  }
}

// ---------- Formulário (adicionar e editar) ----------

// Sem aluno abre o formulário vazio (adicionar); com aluno abre-o preenchido (editar).
function open_formulario(aluno = null) {
  aluno_em_edicao = aluno;
  titulo_formulario.textContent = aluno ? "Editar aluno" : "Novo aluno";
  erro_formulario.hidden = true;

  const valores = aluno || { nome: "", apelido: "", idCurso: "", anoCurricular: 1 };
  formulario.nome.value = valores.nome;
  formulario.apelido.value = valores.apelido;
  formulario.idCurso.value = valores.idCurso;
  formulario.anoCurricular.value = valores.anoCurricular;

  dialogo_formulario.showModal();
}

function close_formulario() {
  dialogo_formulario.close();
}

// Lê os valores escritos no formulário.
function get_dados_formulario() {
  return {
    nome: formulario.nome.value.trim(),
    apelido: formulario.apelido.value.trim(),
    idCurso: find_curso(formulario.idCurso.value).id, // o <select> dá texto; assim fica com o tipo de id da API
    anoCurricular: Number(formulario.anoCurricular.value),
  };
}

// O navegador valida os campos obrigatórios antes de este evento ser disparado.
async function save_aluno(evento) {
  evento.preventDefault();
  const dados_aluno = get_dados_formulario();

  try {
    if (aluno_em_edicao) {
      await edit_aluno(aluno_em_edicao.id, dados_aluno);
      show_notificacao("Aluno atualizado");
    } else {
      await create_aluno(dados_aluno);
      show_notificacao("Aluno adicionado");
    }
    close_formulario();
    await load_alunos();
  } catch (erro) {
    erro_formulario.textContent = `Não foi possível guardar. ${erro.message}`;
    erro_formulario.hidden = false;
  }
}

// ---------- Apagar ----------

async function confirm_delete_aluno(aluno) {
  if (!confirm(`Apagar ${get_nome_completo(aluno)}?`)) {
    return;
  }

  try {
    await delete_aluno(aluno.id);
    show_notificacao("Aluno apagado");
    await load_alunos();
  } catch (erro) {
    show_notificacao(`Não foi possível apagar. ${erro.message}`);
  }
}

// ---------- Arranque ----------

async function start_app() {
  try {
    await load_cursos();
    await load_alunos();
  } catch (erro) {
    show_mensagem_lista("Não foi possível contactar a API. Confirma que o servidor está a correr.", true);
  }
}

document.querySelector("#btn-novo-aluno").addEventListener("click", () => open_formulario());
document.querySelector("#btn-cancelar").addEventListener("click", close_formulario);
formulario.addEventListener("submit", save_aluno);
campo_pesquisa.addEventListener("input", show_alunos);
filtro_curso.addEventListener("change", show_alunos);

start_app();
