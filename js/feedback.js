/* =============================================================
   SEJOGA — FORMULÁRIO DE FEEDBACK (feedback.html)

   Área restrita: o auth.js já mandou para o login quem não está
   logado. Aqui:
     1. o range mostra o número escolhido enquanto a pessoa arrasta;
     2. no envio, valida o select (obrigatório) e o radio (obrigatório);
     3. monta o objeto do feedback e salva no localStorage
        (chave portalEventos_feedbacks, uma LISTA de respostas);
     4. leva para a confirmacao.html, que mostra o que foi enviado.

   Reaproveita: gravarNoArmazenamento/lerDoArmazenamento
   (storage.js) e loginAtual (eventos.js).
   ============================================================= */


const formFeedback = document.querySelector('#form-feedback');
const campoNota = document.querySelector('#nota');
const valorNota = document.querySelector('#valor-nota');
const avisoFeedback = document.querySelector('#aviso-feedback');


/* RANGE: o evento 'input' dispara a CADA movimento do controle
   (o 'change' só dispararia ao soltar o mouse). */
campoNota.addEventListener('input', function () {
    valorNota.textContent = campoNota.value;
});


/* Mostra (ou apaga) a mensagem embaixo de um campo e marca o
   aria-invalid — o mesmo padrão do campos-conta.js, para o erro
   ter a mesma cara em todos os formulários do site. */
function marcarErro(id, mensagem) {
    const elemento = document.getElementById(id);
    document.getElementById('erro-' + id).textContent = mensagem;

    if (mensagem) {
        elemento.setAttribute('aria-invalid', 'true');
    } else {
        elemento.removeAttribute('aria-invalid');
    }
}


/* RADIO: não existe ".value" do grupo inteiro. Procuramos o que
   está marcado com o seletor :checked. Se nenhum estiver, o
   querySelector devolve null. */
function radioMarcado(nome) {
    const marcado = formFeedback.querySelector('input[name="' + nome + '"]:checked');
    return marcado ? marcado.value : '';
}


/* CHECKBOX em grupo: querySelectorAll devolve TODOS os marcados.
   Array.from transforma a lista em array, e o map pega só o value.
   Nenhum marcado = array vazio [] (não é erro: é opcional). */
function checkboxesMarcados(nome) {
    const marcados = formFeedback.querySelectorAll('input[name="' + nome + '"]:checked');
    return Array.from(marcados).map(function (caixa) {
        return caixa.value;
    });
}


/* Valida e devolve o id do PRIMEIRO campo com erro (ou null).
   Confere todos de uma vez: a pessoa vê tudo o que falta. */
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


/* Assim que a pessoa corrige, a mensagem de erro some. */
formFeedback.addEventListener('change', function () {
    if (formFeedback.querySelector('[aria-invalid="true"]')) {
        validarFeedback();
    }
});


formFeedback.addEventListener('submit', function (envio) {
    // Sem isto, o navegador recarregaria a página e perderia tudo.
    envio.preventDefault();

    const primeiroErro = validarFeedback();

    if (primeiroErro) {
        avisoFeedback.textContent = 'Confira os campos marcados em vermelho.';
        avisoFeedback.className = 'aviso-form visivel erro';

        // No radio, o foco vai para a primeira opção do grupo.
        const alvo = primeiroErro === 'forma-indicacao'
            ? formFeedback.querySelector('input[name="forma-indicacao"]')
            : document.getElementById(primeiroErro);
        alvo.focus();
        return;
    }

    // MONTAR o objeto no formato combinado do grupo.
    const feedback = {
        id: 'fbk_' + Date.now(),
        loginUsuario: loginAtual(),
        nota: Number(campoNota.value),                       // texto → número
        categoriaPreferida: document.getElementById('categoria-preferida').value,
        formaIndicacao: radioMarcado('forma-indicacao'),
        interesses: checkboxesMarcados('interesses'),
        comentario: document.getElementById('comentario').value.trim(),
        aceitaNovidades: document.getElementById('aceita-novidades').checked,  // true/false
        enviadoEm: new Date().toISOString()
    };

    // SALVAR: lê a lista, acrescenta no fim e grava a lista INTEIRA
    // (o localStorage não sabe "acrescentar", só substituir).
    const lista = lerDoArmazenamento(CHAVES.feedbacks, []);
    lista.push(feedback);

    if (!gravarNoArmazenamento(CHAVES.feedbacks, lista)) {
        mostrarToast('Não foi possível salvar agora. Tente de novo.', 'erro');
        return;
    }

    // MOSTRAR: a página de confirmação lê o feedback pelo id do endereço.
    window.location.href = 'confirmacao.html?id=' + encodeURIComponent(feedback.id);
});
