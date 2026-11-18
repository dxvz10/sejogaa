const formFeedback = document.querySelector('#form-feedback');
const campoNota = document.querySelector('#nota');
const valorNota = document.querySelector('#valor-nota');
const avisoFeedback = document.querySelector('#aviso-feedback');

// mostra o numero do range enquanto arrasta
campoNota.addEventListener('input', function () {
    valorNota.textContent = campoNota.value;
});

// escreve o erro embaixo do campo
function marcarErro(id, mensagem) {
    const elemento = document.getElementById(id);
    document.getElementById('erro-' + id).textContent = mensagem;

    if (mensagem) {
        elemento.setAttribute('aria-invalid', 'true');
    } else {
        elemento.removeAttribute('aria-invalid');
    }
}

// pega o radio marcado (ou vazio se nenhum)
function radioMarcado(nome) {
    const marcado = formFeedback.querySelector('input[name="' + nome + '"]:checked');
    return marcado ? marcado.value : '';
}

// pega todos os checkboxes marcados
function checkboxesMarcados(nome) {
    const marcados = formFeedback.querySelectorAll('input[name="' + nome + '"]:checked');
    return Array.from(marcados).map(function (caixa) {
        return caixa.value;
    });
}

// categoria e "como nos conheceu" sao obrigatorios
function validarFeedback() {
    let primeiroErro = null;

    if (document.getElementById('categoria-preferida').value === '') {
        marcarErro('categoria-preferida', 'Escolha uma categoria.');
        primeiroErro = 'categoria-preferida';
    } else {
        marcarErro('categoria-preferida', '');
    }

    if (radioMarcado('forma-indicacao') === '') {
        marcarErro('forma-indicacao', 'Marque uma das opções.');
        primeiroErro = primeiroErro || 'forma-indicacao';
    } else {
        marcarErro('forma-indicacao', '');
    }

    return primeiroErro;
}

// tira o erro quando a pessoa corrige
formFeedback.addEventListener('change', function () {
    if (formFeedback.querySelector('[aria-invalid="true"]')) {
        validarFeedback();
    }
});

// envio do feedback
formFeedback.addEventListener('submit', function (envio) {
    envio.preventDefault();

    const primeiroErro = validarFeedback();

    if (primeiroErro) {
        avisoFeedback.textContent = 'Confira os campos marcados em vermelho.';
        avisoFeedback.className = 'aviso-form visivel erro';

        const alvo = primeiroErro === 'forma-indicacao'
            ? formFeedback.querySelector('input[name="forma-indicacao"]')
            : document.getElementById(primeiroErro);
        alvo.focus();
        return;
    }

    // monta o objeto do feedback
    const feedback = {
        id: 'fbk_' + Date.now(),
        loginUsuario: loginAtual(),
        nota: Number(campoNota.value),
        categoriaPreferida: document.getElementById('categoria-preferida').value,
        formaIndicacao: radioMarcado('forma-indicacao'),
        interesses: checkboxesMarcados('interesses'),
        comentario: document.getElementById('comentario').value.trim(),
        aceitaNovidades: document.getElementById('aceita-novidades').checked,
        enviadoEm: new Date().toISOString()
    };

    // coloca na lista e salva no localStorage
    const lista = lerDoArmazenamento(CHAVES.feedbacks, []);
    lista.push(feedback);

    if (!gravarNoArmazenamento(CHAVES.feedbacks, lista)) {
        mostrarToast('Não foi possível salvar agora. Tente de novo.', 'erro');
        return;
    }

    // vai pra confirmacao passando o id
    window.location.href = 'confirmacao.html?id=' + encodeURIComponent(feedback.id);
});
