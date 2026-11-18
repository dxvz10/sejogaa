// cria o lugar onde os avisos aparecem (so na primeira vez)
function obterAreaDeToasts() {
    let area = document.querySelector('.area-toasts');

    if (!area) {
        area = document.createElement('div');
        area.className = 'area-toasts';

        area.setAttribute('aria-live', 'polite');
        document.body.appendChild(area);
    }

    return area;
}

// mostra um aviso no canto da tela no lugar do alert
function mostrarToast(texto, tipo, duracao) {
    const area = obterAreaDeToasts();

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (tipo || 'info');
    toast.textContent = texto;
    area.appendChild(toast);

    // espera um frame pra animacao funcionar
    requestAnimationFrame(function () {
        toast.classList.add('visivel');
    });

    // some depois de alguns segundos
    setTimeout(function () {
        toast.classList.remove('visivel');

        setTimeout(function () {
            toast.remove();
        }, 300);
    }, duracao || 3500);
}

let focoAntesDoModal = null;

// abre o modal pelo id
function abrirModal(id) {
    const modal = document.getElementById(id);

    if (!modal) {
        return;
    }

    focoAntesDoModal = document.activeElement;
    modal.classList.add('aberto');

    const caixa = modal.querySelector('.modal-caixa');
    if (caixa) {
        caixa.setAttribute('tabindex', '-1');
        caixa.focus();
    }
}

// fecha o modal e devolve o foco
function fecharModal(modal) {
    if (typeof modal === 'string') {
        modal = document.getElementById(modal);
    }

    if (!modal || !modal.classList.contains('aberto')) {
        return;
    }

    modal.classList.remove('aberto');

    if (focoAntesDoModal) {
        focoAntesDoModal.focus();
        focoAntesDoModal = null;
    }
}

// fecha o modal clicando no X ou fora dele
document.addEventListener('click', function (evento) {

    const botaoFechar = evento.target.closest('.modal-fechar, [data-fechar-modal]');

    if (botaoFechar) {
        fecharModal(botaoFechar.closest('.modal'));
        return;
    }

    if (evento.target.classList.contains('modal')) {
        fecharModal(evento.target);
    }
});

// fecha o modal com Esc
document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape') {
        document.querySelectorAll('.modal.aberto').forEach(fecharModal);
    }
});

// atalho pra criar um elemento com classe e texto
function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) {
        elemento.className = classe;
    }

    if (texto !== undefined && texto !== null) {
        elemento.textContent = texto;
    }

    return elemento;
}
