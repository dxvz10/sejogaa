// monta o card de um evento
function montarCardEvento(evento, opcoes) {
    opcoes = opcoes || {};

    const status = calcularStatusEvento(evento);
    const naAgenda = obterMeusEventos().indexOf(evento.id) !== -1;

    const card = criarElemento('article', 'card');

    card.appendChild(criarElemento('span', 'categoria', NOMES_CATEGORIAS[evento.categoria] || evento.categoria));
    card.appendChild(criarElemento('h3', null, evento.nome));
    card.appendChild(criarElemento('p', 'local', '📍 ' + evento.local));
    card.appendChild(criarElemento('p', 'data', '📅 ' + formatarDataCurta(evento.dataHora)));

    const rodape = criarElemento('div', 'rodape-card');
    rodape.appendChild(criarElemento('span', 'preco', formatarPreco(evento.preco)));
    rodape.appendChild(criarElemento('span', status.classe, status.rotulo));
    card.appendChild(rodape);

    if (eventoAberto(evento) || (naAgenda && opcoes.permitirRemoverEncerrado)) {
        const botao = criarElemento('button', 'botao-agenda');
        botao.type = 'button';
        botao.dataset.id = evento.id;
        pintarBotaoAgenda(botao, naAgenda);
        card.appendChild(botao);
    }

    return card;
}

// muda o botao quando o evento esta na agenda
function pintarBotaoAgenda(botao, naAgenda) {
    botao.textContent = naAgenda ? '✓ No meu calendário' : '+ Adicionar ao calendário';
    botao.classList.toggle('na-agenda', naAgenda);
    botao.setAttribute('aria-pressed', naAgenda ? 'true' : 'false');
}

// clique no botao de adicionar na agenda
document.addEventListener('click', function (evento) {
    const botao = evento.target.closest('.botao-agenda');

    if (!botao) {
        return;
    }

    if (!usuarioLogado()) {
        pedirLogin();
        return;
    }

    const ficou = alternarMeuEvento(botao.dataset.id);
    const dados = buscarEvento(botao.dataset.id);

    document.querySelectorAll('.botao-agenda[data-id="' + botao.dataset.id + '"]').forEach(function (outro) {
        pintarBotaoAgenda(outro, ficou);
    });

    if (dados) {
        mostrarToast(ficou
            ? dados.nome + ' foi para a sua agenda.'
            : dados.nome + ' saiu da sua agenda.',
            ficou ? 'sucesso' : 'info');
    }

    document.dispatchEvent(new CustomEvent('agenda-mudou', {
        detail: { id: botao.dataset.id, naAgenda: ficou }
    }));
});
