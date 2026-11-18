const trilhoEventos = document.querySelector('.trilho-eventos');

const QUANTIDADE_CARROSSEL = 6;

// card do carrossel da home
function montarCardCarrossel(evento) {
    const status = calcularStatusEvento(evento);

    const card = criarElemento('article', 'card-evento');

    card.appendChild(criarElemento('span', 'categoria', NOMES_CATEGORIAS[evento.categoria] || evento.categoria));
    card.appendChild(criarElemento('h2', 'titulo', evento.nome));
    card.appendChild(criarElemento('p', 'local', evento.local));
    card.appendChild(criarElemento('p', 'data', formatarDataCurta(evento.dataHora)));
    card.appendChild(criarElemento('p', 'descricao', evento.descricao));

    const rodape = criarElemento('div', 'rodape-card');
    rodape.appendChild(criarElemento('span', 'preco', formatarPreco(evento.preco)));
    rodape.appendChild(criarElemento('span', status.classe, status.rotulo));
    card.appendChild(rodape);

    return card;
}

// coloca os proximos eventos no carrossel
function renderizarCarrossel() {
    trilhoEventos.textContent = '';

    proximosEventosAbertos(QUANTIDADE_CARROSSEL).forEach(function (evento) {
        trilhoEventos.appendChild(montarCardCarrossel(evento));
    });
}

// quantos eventos tem em cada categoria
function contarCategorias() {
    const abertos = obterEventos().filter(eventoAberto);

    document.querySelectorAll('[data-contar-categoria]').forEach(function (alvo) {
        const categoria = alvo.dataset.contarCategoria;

        const quantos = abertos.filter(function (evento) {
            return evento.categoria === categoria;
        }).length;

        if (quantos === 0) {
            alvo.textContent = 'Em breve';
        } else {
            alvo.textContent = quantos + (quantos === 1 ? ' próximo evento' : ' próximos eventos');
        }
    });
}

renderizarCarrossel();
contarCategorias();
