// textos pra mostrar no lugar dos valores salvos
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

// usa textContent e nao innerHTML pra nao rodar codigo digitado pelo usuario
function escreverNoResumo(id, texto) {
    document.getElementById(id).textContent = texto;
}

// pega o feedback pelo id do endereco (so os do usuario logado)
function encontrarFeedback() {
    const meuLogin = loginAtual();

    const meus = lerDoArmazenamento(CHAVES.feedbacks, []).filter(function (item) {
        return item.loginUsuario === meuLogin;
    });

    const id = new URLSearchParams(window.location.search).get('id');

    if (id) {
        return meus.find(function (item) {
            return item.id === id;
        });
    }

    return meus[meus.length - 1];
}

// preenche a tela com os dados enviados
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
