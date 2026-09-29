// Gestão de alunos: interface CRUD que comunica com a API através da Fetch API.

// URL base da API. Vazio = mesma origem (o json-server serve este frontend com --static).
// Na Parte 5, trocar pelo URL da API alojada no Render.
const API = "";

// Uma cor por curso, usada nos avatares, etiquetas e barras.
const CORES = ["#4f46e5", "#0891b2", "#db2777", "#059669", "#b45309"];

// ---------- Estado da aplicação ----------

let alunos = [];
let cursos = [];
let alunoEmEdicao = null; // null quando se está a adicionar um aluno novo
let alunoParaApagar = null;
let temporizadorAviso;

// ---------- Elementos da página ----------

const $ = (seletor) => document.querySelector(seletor);

const lista = $("#lista");
const estado = $("#estado");
const contagem = $("#contagem");
const pesquisa = $("#pesquisa");
const filtroCurso = $("#filtro-curso");
const statAlunos = $("#stat-alunos");
const statCursos = $("#stat-cursos");
const barras = $("#barras");
const aviso = $("#toast");

const dlgForm = $("#dlg-form");
const form = $("#form");
const formTitulo = $("#form-titulo");
const formErro = $("#form-erro");
const btnGuardar = $("#btn-guardar");
const selectCurso = $("#idCurso");

const dlgApagar = $("#dlg-apagar");
const apagarTexto = $("#apagar-texto");
const btnConfirmarApagar = $("#btn-confirmar-apagar");

// ---------- Comunicação com a API ----------

// Faz o pedido e devolve o JSON da resposta. Lança um erro se o servidor responder com falha.
async function pedir(caminho, opcoes) {
  const resposta = await fetch(API + caminho, opcoes);
  if (!resposta.ok) {
    throw new Error(`O servidor respondeu com o erro ${resposta.status}.`);
  }
  return resposta.status === 204 ? null : resposta.json();
}

// Opções de um pedido que envia dados em JSON (POST e PUT).
const comCorpo = (metodo, dados) => ({
  method: metodo,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(dados),
});

async function recarregarAlunos() {
  alunos = await pedir("/alunos");
  desenhar();
}

// ---------- Funções auxiliares ----------

function elemento(tag, classe, texto = "") {
  const novo = document.createElement(tag);
  novo.className = classe;
  novo.textContent = texto;
  return novo;
}

const nomeCompleto = (aluno) => `${aluno.nome} ${aluno.apelido}`;
const procurarCurso = (idCurso) => cursos.find((curso) => curso.id === idCurso);

function corDoCurso(idCurso) {
  const posicao = Math.max(0, cursos.findIndex((curso) => curso.id === idCurso));
  return CORES[posicao % CORES.length];
}

function mostrarEstado(mensagem, erro = false) {
  estado.textContent = mensagem;
  estado.classList.toggle("com-erro", erro);
  estado.hidden = false;
}

function mostrarAviso(mensagem, erro = false) {
  aviso.textContent = mensagem;
  aviso.classList.toggle("com-erro", erro);
  aviso.classList.add("visivel");
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove("visivel"), 2800);
}

// ---------- Desenhar a página ----------

function criarBotao(texto, classe, rotulo, aoClicar) {
  const botao = elemento("button", classe, texto);
  botao.type = "button";
  botao.setAttribute("aria-label", rotulo);
  botao.addEventListener("click", aoClicar);
  return botao;
}

function criarLinha(aluno) {
  const linha = elemento("li", "aluno");
  linha.style.setProperty("--cor", corDoCurso(aluno.idCurso));

  const iniciais = (aluno.nome[0] + aluno.apelido[0]).toUpperCase();
  const curso = procurarCurso(aluno.idCurso);

  const dados = elemento("div", "");
  dados.append(
    elemento("span", "nome", nomeCompleto(aluno)),
    elemento("span", "curso", curso ? curso.nomeDoCurso : "Curso desconhecido")
  );

  const acoes = elemento("div", "acoes");
  acoes.append(
    criarBotao("Editar", "btn-texto", `Editar ${nomeCompleto(aluno)}`, () => abrirFormulario(aluno)),
    criarBotao("Apagar", "btn-texto apagar", `Apagar ${nomeCompleto(aluno)}`, () => abrirConfirmacao(aluno))
  );

  linha.append(
    elemento("span", "avatar", iniciais),
    dados,
    elemento("span", "ano", `${aluno.anoCurricular}.º ano`),
    acoes
  );
  return linha;
}

function criarBarra(curso, total, maximo) {
  const item = elemento("div", "");
  item.style.setProperty("--cor", corDoCurso(curso.id));

  const legenda = elemento("div", "barra-topo");
  legenda.append(elemento("span", "", curso.nomeDoCurso), elemento("span", "", total));

  const barra = elemento("div", "barra");
  const preenchimento = document.createElement("i");
  preenchimento.style.width = `${(total / maximo) * 100}%`;
  barra.append(preenchimento);

  item.append(legenda, barra);
  return item;
}

function desenharResumo() {
  statAlunos.textContent = alunos.length;
  statCursos.textContent = cursos.length;

  const totais = cursos.map((curso) => alunos.filter((aluno) => aluno.idCurso === curso.id).length);
  const maximo = Math.max(1, ...totais);

  barras.replaceChildren(...cursos.map((curso, i) => criarBarra(curso, totais[i], maximo)));
}

// Alunos que passam na pesquisa por nome e no filtro por curso.
function alunosVisiveis() {
  const termo = pesquisa.value.trim().toLowerCase();
  const idCurso = Number(filtroCurso.value); // 0 = todos os cursos

  return alunos.filter(
    (aluno) =>
      nomeCompleto(aluno).toLowerCase().includes(termo) && (!idCurso || aluno.idCurso === idCurso)
  );
}

function desenhar() {
  const visiveis = alunosVisiveis();

  lista.replaceChildren(...visiveis.map(criarLinha));
  desenharResumo();
  contagem.textContent = visiveis.length === 1 ? "1 aluno" : `${visiveis.length} alunos`;

  if (visiveis.length > 0) {
    estado.hidden = true;
  } else if (alunos.length === 0) {
    mostrarEstado("Ainda não há alunos. Adiciona o primeiro com o botão Novo aluno.");
  } else {
    mostrarEstado("Nenhum aluno encontrado com esses filtros.");
  }
}

function preencherCursos() {
  const opcoes = () => cursos.map((curso) => new Option(curso.nomeDoCurso, curso.id));

  selectCurso.replaceChildren(new Option("Escolhe um curso", ""), ...opcoes());
  filtroCurso.replaceChildren(new Option("Todos os cursos", ""), ...opcoes());
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

  dlgForm.showModal();
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
  const editar = alunoEmEdicao !== null;

  btnGuardar.disabled = true;
  try {
    if (editar) {
      await pedir(`/alunos/${alunoEmEdicao.id}`, comCorpo("PUT", dados));
    } else {
      await pedir("/alunos", comCorpo("POST", dados));
    }
    await recarregarAlunos();
    dlgForm.close();
    mostrarAviso(editar ? "Aluno atualizado" : "Aluno adicionado");
  } catch (erro) {
    formErro.textContent = `Não foi possível guardar. ${erro.message}`;
    formErro.hidden = false;
  } finally {
    btnGuardar.disabled = false;
  }
}

// ---------- Apagar ----------

function abrirConfirmacao(aluno) {
  alunoParaApagar = aluno;
  apagarTexto.textContent = `${nomeCompleto(aluno)} vai ser removido. Esta ação não pode ser desfeita.`;
  dlgApagar.showModal();
}

async function apagar() {
  btnConfirmarApagar.disabled = true;
  try {
    await pedir(`/alunos/${alunoParaApagar.id}`, { method: "DELETE" });
    await recarregarAlunos();
    mostrarAviso("Aluno apagado");
  } catch (erro) {
    mostrarAviso(`Não foi possível apagar. ${erro.message}`, true);
  } finally {
    dlgApagar.close();
    btnConfirmarApagar.disabled = false;
  }
}

// ---------- Arranque ----------

async function iniciar() {
  mostrarEstado("A carregar alunos…");
  try {
    [alunos, cursos] = await Promise.all([pedir("/alunos"), pedir("/cursos")]);
    preencherCursos();
    desenhar();
  } catch (erro) {
    mostrarEstado(
      "Não foi possível contactar a API. Confirma que o servidor está a correr (npm start na pasta mock-server).",
      true
    );
  }
}

$("#btn-novo").addEventListener("click", () => abrirFormulario());
form.addEventListener("submit", guardar);
btnConfirmarApagar.addEventListener("click", apagar);
pesquisa.addEventListener("input", desenhar);
filtroCurso.addEventListener("change", desenhar);

document.querySelectorAll("[data-fechar]").forEach((botao) => {
  botao.addEventListener("click", () => botao.closest("dialog").close());
});

iniciar();
