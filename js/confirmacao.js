/* =============================================================
   SEJOGA — CONFIRMAÇÃO DO FEEDBACK (confirmacao.html)

   "Visualização de dados" do enunciado: mostra o que o usuário
   acabou de enviar no feedback.html.

   O id vem no endereço (confirmacao.html?id=fbk_123). Buscamos
   esse feedback na lista do localStorage. Sem id, mostramos o
   ÚLTIMO feedback de quem está logado.
   ============================================================= */


/* Os textos legíveis de cada valor salvo. Salvamos o identificador
   curto ("redes-sociais") e traduzimos só na hora de mostrar —
   assim, se o texto mudar, os dados antigos continuam valendo. */
const TEXTOS_INDICACAO = {
    'amigos': 'Indicação de amigos',
    'redes-sociais': 'Redes sociais',
    'busca': 'Pesquisa no Google',
    'outro': 'Outro'
};

const TEXTOS_INTERESSES = {
    'mais-eventos': 'Mais eventos perto de mim',
    'eventos-gratuitos': 'Eventos gratuitos',
    'lembretes': 'Lembretes da minha agenda',
    'ingressos': 'Compra de ingressos'
};


function escreverNoResumo(id, texto) {
    // textContent (e não innerHTML): o comentário foi digitado pelo
    // usuário; com innerHTML, um "<script>" digitado seria executado.
    document.getElementById(id).textContent = texto;
}


function encontrarFeedback() {
    const meuLogin = loginAtual();

    // Só os feedbacks de quem está logado: ninguém vê o dos outros
    // trocando o id no endereço.
    const meus = lerDoArmazenamento(CHAVES.feedbacks, []).filter(function (item) {
        return item.loginUsuario === meuLogin;
    });

    const id = new URLSearchParams(window.location.search).get('id');

    if (id) {
        return meus.find(function (item) {
            return item.id === id;
        });
    }

    return meus[meus.length - 1];   // o mais recente
}


(function mostrarResumo() {
    const feedback = encontrarFeedback();

    if (!feedback) {
        const aviso = document.getElementById('aviso-confirmacao');
        aviso.textContent = 'Não encontramos nenhum feedback seu. Que tal enviar um agora?';
        aviso.className = 'aviso-form visivel erro';
        return;
    }

    const usuario = usuarioAtual();

    escreverNoResumo('resumo-usuario', usuario.nomeCompleto + ' (@' + usuario.login + ')');

    // toLocaleString('pt-BR') = data e hora no jeito brasileiro.
    escreverNoResumo('resumo-data', new Date(feedback.enviadoEm).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }));

    escreverNoResumo('resumo-nota', feedback.nota + ' / 10');
    escreverNoResumo('resumo-categoria', NOMES_CATEGORIAS[feedback.categoriaPreferida] || '—');
    escreverNoResumo('resumo-indicacao', TEXTOS_INDICACAO[feedback.formaIndicacao] || '—');

    const interesses = feedback.interesses.map(function (valor) {
        return TEXTOS_INTERESSES[valor];
    });
    escreverNoResumo('resumo-interesses', interesses.length ? interesses.join(', ') : 'Nenhum marcado');

    escreverNoResumo('resumo-comentario', feedback.comentario || 'Sem comentário');
    escreverNoResumo('resumo-novidades', feedback.aceitaNovidades ? 'Sim' : 'Não');

    mostrarToast('Feedback recebido. Valeu!', 'sucesso');
})();
