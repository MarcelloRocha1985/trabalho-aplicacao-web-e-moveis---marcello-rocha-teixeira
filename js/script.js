/* ============================================================
   PORTFÓLIO — script.js
   Responsável por:
     1. Menu hambúrguer (mobile)
     2. Alternância de tema claro / escuro
     3. Validação do formulário de contato
     4. Modal de confirmação de envio
   ============================================================ */


/* ----------------------------------------------------------
   1. MENU HAMBÚRGUER
   Controla a abertura e fechamento do menu de navegação
   em dispositivos móveis, alternando a classe CSS que expande
   o menu verticalmente via max-height.
   ---------------------------------------------------------- */

// Referências ao botão hambúrguer e ao elemento <nav>
const menuToggle = document.getElementById('menuToggle');
const navMenu    = document.getElementById('navMenu');

// Ao clicar no hambúrguer, alterna a classe de abertura do menu
menuToggle.addEventListener('click', function () {
  // toggle retorna true se a classe foi adicionada, false se removida
  const estaAberto = navMenu.classList.toggle('nav--aberto');

  // Atualiza o atributo de acessibilidade para leitores de tela
  menuToggle.setAttribute('aria-expanded', estaAberto);
});

// Seleciona todos os links do menu
const navLinks = document.querySelectorAll('.nav__link');

// Fecha o menu automaticamente ao clicar em qualquer link.
// Necessário porque a página não recarrega ao navegar por âncoras.
navLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    navMenu.classList.remove('nav--aberto');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});


/* ----------------------------------------------------------
   2. ALTERNÂNCIA DE TEMA CLARO / ESCURO
   Alterna o atributo data-theme no <html> entre "light" e "dark".
   O CSS usa esse atributo para aplicar a paleta correta via
   variáveis CSS. A preferência é salva no localStorage para
   persistir entre visitas do usuário.
   ---------------------------------------------------------- */

// Referências ao botão de tema e ao elemento raiz <html>
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Ao carregar a página, verifica se o usuário já tinha um tema salvo
const temaSalvo = localStorage.getItem('tema');
if (temaSalvo) {
  htmlElement.setAttribute('data-theme', temaSalvo);
  // Atualiza o ícone conforme o tema restaurado
  themeToggle.textContent = temaSalvo === 'dark' ? '☀️' : '🌙';
}

// Ao clicar, lê o tema atual e aplica o oposto
themeToggle.addEventListener('click', function () {
  const temaAtual = htmlElement.getAttribute('data-theme');

  if (temaAtual === 'light') {
    htmlElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';        // Sol = tema escuro ativo, clique para clarear
    localStorage.setItem('tema', 'dark');  // Persiste a preferência
  } else {
    htmlElement.setAttribute('data-theme', 'light');
    themeToggle.textContent = '🌙';         // Lua = tema claro ativo, clique para escurecer
    localStorage.setItem('tema', 'light');
  }
});


/* ----------------------------------------------------------
   3. FORMULÁRIO DE CONTATO — Referências do DOM
   ---------------------------------------------------------- */

// Campos do formulário
const form          = document.getElementById('contatoForm');
const campoNome     = document.getElementById('nome');
const campoEmail    = document.getElementById('email');
const campoMensagem = document.getElementById('mensagem');

// Spans que exibem mensagens de erro individuais abaixo de cada campo
const erroNome      = document.getElementById('erroNome');
const erroEmail     = document.getElementById('erroEmail');
const erroMensagem  = document.getElementById('erroMensagem');

// Elementos do modal de confirmação
const modal         = document.getElementById('modal');
const modalOverlay  = document.getElementById('modalOverlay');
const fecharModal   = document.getElementById('fecharModal');

// Div de feedback geral exibida acima do formulário (erro ou sucesso global)
const formFeedback  = document.getElementById('formFeedback');


/* ----------------------------------------------------------
   4. FUNÇÕES AUXILIARES — Validação de campos
   ---------------------------------------------------------- */

/**
 * Marca um campo como inválido:
 * aplica borda vermelha e exibe a mensagem de erro.
 * @param {HTMLElement} campo        — Input ou textarea com problema
 * @param {HTMLElement} elementoErro — <span> que exibe a mensagem
 * @param {string}      mensagem     — Texto descritivo do erro
 */
function mostrarErro(campo, elementoErro, mensagem) {
  campo.classList.add('form__input--erro'); // Borda vermelha via CSS
  elementoErro.textContent = mensagem;
}

/**
 * Remove o estado de erro de um campo:
 * apaga a borda vermelha e limpa a mensagem.
 * @param {HTMLElement} campo        — Input ou textarea a limpar
 * @param {HTMLElement} elementoErro — <span> a esvaziar
 */
function limparErro(campo, elementoErro) {
  campo.classList.remove('form__input--erro');
  elementoErro.textContent = '';
}

/**
 * Valida o formato de um e-mail com expressão regular.
 * Aceita formatos como usuario@dominio.com e nome@sub.dominio.com.br
 * @param  {string}  email — String a ser testada
 * @return {boolean}       — true se o formato for válido
 */
function emailValido(email) {
  // Exige: caracteres sem espaço/@ + @ + domínio + ponto + extensão
  const regex = /
^
[^\s@]+@[^\s@]+\.[^\s@]+
$
/;
  return regex.test(email);
}


/* ----------------------------------------------------------
   5. FUNÇÕES DO MODAL
   O modal usa display: none por padrão no CSS.
   As funções abaixo adicionam/removem as classes que o tornam
   visível (display: flex na caixa, display: block no overlay).
   ---------------------------------------------------------- */

/**
 * Exibe o modal de confirmação e o overlay escuro.
 * Move o foco para o botão "Fechar" para garantir acessibilidade:
 * usuários de teclado e leitores de tela interagem imediatamente
 * com o modal sem precisar navegar pela página inteira.
 */
function abrirModal() {
  modal.classList.add('modal--ativo');
  modalOverlay.classList.add('modal__overlay--ativo');
  fecharModal.focus(); // Acessibilidade: foco vai direto ao botão de fechar
}

/**
 * Oculta o modal e o overlay removendo as classes ativas.
 * Chamada pelo botão "Fechar", pelo clique no overlay
 * e pela tecla Escape.
 */
function fecharModalFuncao() {
  modal.classList.remove('modal--ativo');
  modalOverlay.classList.remove('modal__overlay--ativo');
}


/* ----------------------------------------------------------
   6. VALIDAÇÃO COMPLETA DO FORMULÁRIO
   Percorre todos os campos, acumulando erros sem parar no
   primeiro — o usuário vê todos os problemas de uma só vez.
   Retorna true apenas se todos os campos forem válidos.
   ---------------------------------------------------------- */

function validarFormulario() {
  let valido = true; // Assume válido e muda para false se encontrar erro

  // --- Nome: obrigatório, mínimo 3 caracteres ---
  if (campoNome.value.trim() === '') {
    mostrarErro(campoNome, erroNome, 'O nome é obrigatório.');
    valido = false;
  } else if (campoNome.value.trim().length < 3) {
    mostrarErro(campoNome, erroNome, 'O nome deve ter pelo menos 3 caracteres.');
    valido = false;
  } else {
    limparErro(campoNome, erroNome);
  }

  // --- E-mail: obrigatório e formato válido ---
  if (campoEmail.value.trim() === '') {
    mostrarErro(campoEmail, erroEmail, 'O e-mail é obrigatório.');
    valido = false;
  } else if (!emailValido(campoEmail.value.trim())) {
    mostrarErro(campoEmail, erroEmail, 'Informe um e-mail válido (ex: usuario@dominio.com).');
    valido = false;
  } else {
    limparErro(campoEmail, erroEmail);
  }

  // --- Mensagem: obrigatória, mínimo 10 caracteres ---
  if (campoMensagem.value.trim() === '') {
    mostrarErro(campoMensagem, erroMensagem, 'A mensagem é obrigatória.');
    valido = false;
  } else if (campoMensagem.value.trim().length < 10) {
    mostrarErro(campoMensagem, erroMensagem, 'A mensagem deve ter pelo menos 10 caracteres.');
    valido = false;
  } else {
    limparErro(campoMensagem, erroMensagem);
  }

  return valido;
}


/* ----------------------------------------------------------
   7. FEEDBACK EM TEMPO REAL
   Limpa o estado de erro de cada campo assim que o usuário
   começa a digitar — retorno visual imediato sem esperar
   o próximo clique em "Enviar".
   ---------------------------------------------------------- */

campoNome.addEventListener('input', function () {
  limparErro(campoNome, erroNome);
});

campoEmail.addEventListener('input', function () {
  limparErro(campoEmail, erroEmail);
});

campoMensagem.addEventListener('input', function () {
  limparErro(campoMensagem, erroMensagem);
});


/* ----------------------------------------------------------
   8. ENVIO DO FORMULÁRIO
   Intercepta o submit, valida os campos e, se tudo estiver
   correto, simula o envio, limpa o formulário e abre o modal.
   ---------------------------------------------------------- */

form.addEventListener('submit', function (evento) {
  // Impede o comportamento padrão do navegador (recarregar a página)
  evento.preventDefault();

  // Reseta o feedback geral antes de cada nova tentativa,
  // removendo classes de erro ou sucesso de envios anteriores
  formFeedback.className = 'form__feedback';
  formFeedback.textContent = '';

  // Executa a validação; se algum campo falhar, exibe o feedback e para
  if (!validarFormulario()) {
    formFeedback.textContent = 'Por favor, corrija os erros antes de enviar.';
    formFeedback.classList.add('form__feedback--erro');
    return; // Interrompe aqui — não abre o modal
  }

  // Todos os campos são válidos.
  // Em produção, aqui seria feita uma requisição fetch() para um
  // back-end ou serviço externo (ex: EmailJS, Formspree).
  // Como este é um projeto estático, apenas simulamos o envio.

  form.reset();   // Limpa todos os campos do formulário
  abrirModal();   // Exibe o modal de confirmação
});


/* ----------------------------------------------------------
   9. FECHAMENTO DO MODAL
   Três formas de fechar, seguindo boas práticas de
   acessibilidade e usabilidade:
     a) Botão "Fechar" dentro da caixa do modal
     b) Clique no overlay escuro fora da caixa
     c) Tecla Escape
   ---------------------------------------------------------- */

// a) Botão "Fechar" dentro do modal
fecharModal.addEventListener('click', fecharModalFuncao);

// b) Clique no overlay (área escura ao redor da caixa)
modalOverlay.addEventListener('click', fecharModalFuncao);

// c) Tecla Escape — só age se o modal estiver aberto no momento
document.addEventListener('keydown', function (evento) {
  if (evento.key === 'Escape' && modal.classList.contains('modal--ativo')) {
    fecharModalFuncao();
  }
});