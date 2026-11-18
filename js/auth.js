// lista de usuarios cadastrados
function obterUsuarios() {
    return lerDoArmazenamento(CHAVES.usuarios, []);
}

function salvarUsuarios(lista) {
    return gravarNoArmazenamento(CHAVES.usuarios, lista);
}

// procura o usuario pelo login
function buscarUsuario(login) {
    const alvo = login.toLowerCase();

    return obterUsuarios().find(function (usuario) {
        return usuario.login.toLowerCase() === alvo;
    });
}

// ve se ja tem alguem com esse login, cpf ou email
function valorJaCadastrado(campo, valor, ignorarLogin) {
    const alvo = String(valor).toLowerCase();

    return obterUsuarios().some(function (usuario) {
        if (ignorarLogin && usuario.login === ignorarLogin) {
            return false;
        }
        return String(usuario[campo]).toLowerCase() === alvo;
    });
}

// cadastra um usuario novo (se nao for repetido)
function cadastrarUsuario(dados) {
    if (valorJaCadastrado('login', dados.login)) {
        return { ok: false, campo: 'login', erro: 'Este login já está em uso. Escolha outro.' };
    }

    if (valorJaCadastrado('cpf', dados.cpf)) {
        return { ok: false, campo: 'cpf', erro: 'Já existe uma conta com este CPF.' };
    }

    if (valorJaCadastrado('email', dados.email)) {
        return { ok: false, campo: 'email', erro: 'Já existe uma conta com este e-mail.' };
    }

    const usuario = Object.assign({ id: 'usr_' + Date.now() }, dados);

    const lista = obterUsuarios();
    lista.push(usuario);

    if (!salvarUsuarios(lista)) {
        return { ok: false, campo: 'foto', erro: 'Não coube no armazenamento do navegador. Tente uma foto menor.' };
    }

    return { ok: true, usuario: usuario };
}

// atualiza os dados do usuario (tela de perfil)
function atualizarUsuario(login, novosDados) {
    const lista = obterUsuarios();

    const posicao = lista.findIndex(function (usuario) {
        return usuario.login === login;
    });

    if (posicao === -1) {
        return false;
    }

    lista[posicao] = Object.assign({}, lista[posicao], novosDados);

    if (!salvarUsuarios(lista)) {
        return false;
    }

    gravarSessao(lista[posicao]);
    return true;
}

// sessao = quem esta logado agora
function obterSessao() {
    const sessao = lerDoArmazenamento(CHAVES.sessao, null);

    if (!sessao || typeof sessao.login !== 'string') {
        return null;
    }

    return sessao;
}

function usuarioLogado() {
    return obterSessao() !== null;
}

// dados completos de quem esta logado
function usuarioAtual() {
    const sessao = obterSessao();
    return sessao ? (buscarUsuario(sessao.login) || sessao) : null;
}

// salva so login e nome na sessao (nunca a senha)
function gravarSessao(usuario) {
    gravarNoArmazenamento(CHAVES.sessao, {
        login: usuario.login,
        nomeCompleto: usuario.nomeCompleto
    });
}

// login: procura o usuario e compara a senha
function entrar(login, senha) {
    const usuario = buscarUsuario(login);

    // mesma mensagem pros dois casos pra nao entregar quais logins existem
    if (!usuario || usuario.senha !== senha) {
        return { ok: false, erro: 'Login ou senha incorretos.' };
    }

    gravarSessao(usuario);

    try {
        sessionStorage.setItem('portalEventos_mostrarSemana', '1');
    } catch (erro) {
    }

    return { ok: true, usuario: usuario };
}

// logout: apaga a sessao e volta pro inicio
function sair() {
    apagarDoArmazenamento(CHAVES.sessao);
    window.location.href = 'index.html';
}

// cria o modal de "entre para continuar"
function garantirModalConta() {
    if (document.getElementById('modal-conta')) {
        return;
    }

    const modal = criarElemento('div', 'modal');
    modal.id = 'modal-conta';

    const caixa = criarElemento('div', 'modal-caixa');
    caixa.setAttribute('role', 'dialog');
    caixa.setAttribute('aria-modal', 'true');
    caixa.setAttribute('aria-labelledby', 'modal-conta-titulo');

    const fechar = criarElemento('button', 'modal-fechar', '×');
    fechar.type = 'button';
    fechar.setAttribute('aria-label', 'Fechar');

    const titulo = criarElemento('h2', null, 'Entre para continuar');
    titulo.id = 'modal-conta-titulo';

    const texto = criarElemento('p', null,
        'Faça login ou crie sua conta para ver todos os eventos e montar sua agenda.');

    const acoes = criarElemento('div', 'modal-acoes');
    const linkEntrar = criarElemento('a', 'botao-entrar', 'Entrar');
    const linkCadastro = criarElemento('a', 'botao-cadastro', 'Cadastrar');

    linkEntrar.href = 'login.html?voltar=' + encodeURIComponent(paginaAtual());
    linkCadastro.href = 'cadastro.html';

    acoes.appendChild(linkEntrar);
    acoes.appendChild(linkCadastro);

    caixa.appendChild(fechar);
    caixa.appendChild(titulo);
    caixa.appendChild(texto);
    caixa.appendChild(acoes);
    modal.appendChild(caixa);
    document.body.appendChild(modal);
}

// abre o modal pedindo login
function pedirLogin(destino) {
    garantirModalConta();

    document.querySelector('#modal-conta .botao-entrar').href =
        'login.html?voltar=' + encodeURIComponent(destino || paginaAtual());

    abrirModal('modal-conta');
}

// nome da pagina atual (pra voltar depois do login)
function paginaAtual() {
    const caminho = window.location.pathname.split('/').pop() || 'index.html';
    return caminho + window.location.search;
}

// links com data-precisa-login abrem o modal se a pessoa nao estiver logada
document.addEventListener('click', function (evento) {
    const link = evento.target.closest('[data-precisa-login]');

    if (!link || usuarioLogado()) {
        return;
    }

    evento.preventDefault();

    pedirLogin(link.getAttribute('href'));
});

// protege as paginas restritas (so funciona na tela, sem servidor nao e seguranca de verdade)
(function verificarAcessoDaPagina() {
    const tipo = document.documentElement.dataset.pagina;

    if (tipo === 'restrita') {
        const temSessaoGravada = localStorage.getItem(CHAVES.sessao) !== null;
        const sessao = obterSessao();

        // sessao com problema: desloga e mostra o erro
        if (temSessaoGravada && (!sessao || !buscarUsuario(sessao.login))) {
            apagarDoArmazenamento(CHAVES.sessao);
            window.location.replace('404.html?tipo=auth');
            return;
        }

        // nao esta logado: vai pro login
        if (!usuarioLogado()) {
            window.location.replace('login.html?voltar=' + encodeURIComponent(paginaAtual()));
            return;
        }
        document.documentElement.dataset.sessaoOk = '';
    }

    if (tipo === 'visitante' && usuarioLogado()) {
        window.location.replace('index.html');
    }
})();
