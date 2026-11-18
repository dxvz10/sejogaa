// versao antiga do login da home
function obterSessao(){
    const bruto = localStorage.getItem('portalEventos_sessao');

    if (!bruto) {
        return null;
    }

    try {
        return JSON.parse(bruto);
    } catch (erro) {
        return null;
    }
}

function usuarioLogado() {
    return obterSessao() !== null;
}

const modalConta = document.querySelector('#modal-conta');
const fecharModalConta =  modalConta.querySelector('.modal-fechar');
const linksProtegidos = document.querySelectorAll('[data-precisa-login]')

linksProtegidos.forEach(function (link) {
    link.addEventListener('click', function (evento) {
        if (usuarioLogado()) {
            return;
        }

        evento.preventDefault();
        modalConta.classList.add('aberto');
    });
});

fecharModalConta.addEventListener('click', function() {
    modalConta.classList.remove('aberto');
});

modalConta.addEventListener('click', function(evento) {
    if (evento.target === modalConta){
        modalConta.classList.remove('aberto');
    }
});

document.addEventListener('keydown', function (evento) {
    if(evento.key === 'Escape'){
        modalConta.classList.remove('aberto');
    }
});

function aplicarSessaoNoCabecalho() {
    const sessao = obterSessao();
    const logado = sessao !== null;

    document.querySelectorAll('[data-sessao="deslogado"]').forEach(function (elemento) {
        elemento.hidden = logado;
    });

    document.querySelectorAll('[data-sessao="logado"]').forEach(function (elemento) {
        elemento.hidden = !logado;
    });

    if (logado) {
        const nome = sessao.nomeCompleto || sessao.login || '';

        const primeiroNome = nome.trim().split(' ')[0];

        document.querySelectorAll('.usuario-nome').forEach(function (elemento) {
            elemento.textContent = 'Olá, ' + primeiroNome;
        });

        if (sessao.foto) {
            document.querySelectorAll('.usuario-avatar').forEach(function (elemento) {
                elemento.style.backgroundImage = 'url("' + sessao.foto + '")';
            });
        }
    }
}

const botaoSair = document.querySelector('#botao-sair');

if (botaoSair) {
    botaoSair.addEventListener('click', function () {
        localStorage.removeItem('portalEventos_sessao');
        window.location.href = 'index.html';
    });
}

aplicarSessaoNoCabecalho();
