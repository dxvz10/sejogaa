// opcoes do filtro de status
const OPCOES_STATUS = [
    { valor: 'disponivel', texto: 'Disponível' },
    { valor: 'perto', texto: 'Perto do início' },
    { valor: 'esgotado', texto: 'Esgotado ou cancelado' },
    { valor: 'realizado', texto: 'Já realizado' }
];

// cria um checkbox de filtro
function caixaDeMarcar(nome, valor, texto) {
    const rotulo = criarElemento('label');
    const caixa = criarElemento('input');
    caixa.type = 'checkbox';
    caixa.name = nome;
    caixa.value = valor;

    rotulo.appendChild(caixa);
    rotulo.appendChild(document.createTextNode(' ' + texto));
    return rotulo;
}

// grupo de filtros com titulo
function grupoDeFiltro(titulo, filhos) {
    const grupo = criarElemento('fieldset', 'grupo-filtro');
    grupo.appendChild(criarElemento('legend', null, titulo));
    filhos.forEach(function (filho) {
        grupo.appendChild(filho);
    });
    return grupo;
}

// campo de preco minimo/maximo
function campoDePreco(id, rotuloTexto, dica) {
    const pedacos = [];
    const rotulo = criarElemento('label', null, rotuloTexto);
    rotulo.htmlFor = id;

    const campo = criarElemento('input');
    campo.type = 'number';
    campo.id = id;
    campo.min = '0';
    campo.step = '10';
    campo.placeholder = dica;
    campo.inputMode = 'numeric';

    pedacos.push(rotulo, campo);
    return pedacos;
}

// monta a busca com os filtros
function montarBusca(secao) {
    const sufixo = secao.id || 'busca';
    const titulo = secao.dataset.titulo || 'Todos os eventos';

    const cabecalho = criarElemento('h2', null, titulo);

    const topo = criarElemento('div', 'busca-topo');
    const rotuloBusca = criarElemento('label', null, 'Buscar');
    rotuloBusca.htmlFor = 'campo-' + sufixo;

    const campoBusca = criarElemento('input', 'campo-busca');
    campoBusca.type = 'search';
    campoBusca.id = 'campo-' + sufixo;
    campoBusca.placeholder = 'Nome, local ou descrição…';

    const contador = criarElemento('p', 'contador-resultados');
    contador.setAttribute('role', 'status');

    topo.appendChild(rotuloBusca);
    topo.appendChild(campoBusca);
    topo.appendChild(contador);

    const painel = criarElemento('aside', 'painel-filtros');
    painel.setAttribute('aria-label', 'Filtros');

    const topoFiltros = criarElemento('div', 'filtros-topo');
    topoFiltros.appendChild(criarElemento('h3', null, 'Filtros'));
    const limpar = criarElemento('button', 'limpar-filtros', 'Limpar');
    limpar.type = 'button';
    topoFiltros.appendChild(limpar);
    painel.appendChild(topoFiltros);

    painel.appendChild(grupoDeFiltro('Status', OPCOES_STATUS.map(function (opcao) {
        return caixaDeMarcar('status', opcao.valor, opcao.texto);
    })));

    painel.appendChild(grupoDeFiltro('Tipo de evento', Object.keys(NOMES_CATEGORIAS).map(function (chave) {
        return caixaDeMarcar('categoria', chave, NOMES_CATEGORIAS[chave]);
    })));

    const faixa = criarElemento('div', 'faixa-preco');
    campoDePreco('preco-min-' + sufixo, 'Mín', '0')
        .concat(campoDePreco('preco-max-' + sufixo, 'Máx', '999'))
        .forEach(function (pedaco) {
            faixa.appendChild(pedaco);
        });
    painel.appendChild(grupoDeFiltro('Preço (R$)', [faixa]));

    painel.appendChild(grupoDeFiltro('Região', listarRegioes().map(function (regiao) {
        return caixaDeMarcar('regiao', regiao, regiao);
    })));

    const resultados = criarElemento('div', 'resultados-busca');

    const layout = criarElemento('div', 'busca-layout');
    layout.appendChild(painel);
    layout.appendChild(resultados);

    secao.appendChild(cabecalho);
    secao.appendChild(topo);
    secao.appendChild(layout);

    ligarBusca(secao, campoBusca, contador, resultados, limpar, sufixo);
}

// refaz a lista sempre que muda a busca ou um filtro
function ligarBusca(secao, campoBusca, contador, resultados, limpar, sufixo) {
    const precoMin = secao.querySelector('#preco-min-' + sufixo);
    const precoMax = secao.querySelector('#preco-max-' + sufixo);
    let esperandoDigitar;

    function marcados(nome) {
        return Array.from(secao.querySelectorAll('input[name="' + nome + '"]:checked'))
            .map(function (caixa) {
                return caixa.value;
            });
    }

    function numeroOuNulo(campo) {
        const texto = campo.value.trim();
        return texto === '' ? null : Number(texto);
    }

    function aplicar() {
        const encontrados = ordenarParaExibir(filtrarEventos(obterEventos(), {
            texto: campoBusca.value,
            status: marcados('status'),
            categorias: marcados('categoria'),
            regioes: marcados('regiao'),
            precoMin: numeroOuNulo(precoMin),
            precoMax: numeroOuNulo(precoMax)
        }));

        resultados.textContent = '';

        if (encontrados.length === 0) {
            resultados.appendChild(criarElemento('p', 'sem-resultado',
                'Nenhum evento encontrado. Tente mudar a busca ou limpar os filtros.'));
        } else {
            encontrados.forEach(function (evento) {
                resultados.appendChild(montarCardEvento(evento));
            });
        }

        contador.textContent = encontrados.length +
            (encontrados.length === 1 ? ' evento encontrado' : ' eventos encontrados');
    }

    campoBusca.addEventListener('input', function () {
        clearTimeout(esperandoDigitar);
        esperandoDigitar = setTimeout(aplicar, 250);
    });

    secao.querySelector('.painel-filtros').addEventListener('change', aplicar);
    precoMin.addEventListener('input', aplicar);
    precoMax.addEventListener('input', aplicar);

    limpar.addEventListener('click', function () {
        campoBusca.value = '';
        precoMin.value = '';
        precoMax.value = '';
        secao.querySelectorAll('input[type="checkbox"]').forEach(function (caixa) {
            caixa.checked = false;
        });
        aplicar();
    });

    // filtro que vem pelo endereco (ex: ?categoria=futebol do submenu)
    const parametros = new URLSearchParams(window.location.search);
    const categoria = parametros.get('categoria');
    const busca = parametros.get('busca');

    if (categoria) {
        const caixa = secao.querySelector('input[name="categoria"][value="' + CSS.escape(categoria) + '"]');
        if (caixa) {
            caixa.checked = true;
        }
    }

    if (busca) {
        campoBusca.value = busca;
    }

    aplicar();
}

document.querySelectorAll('[data-busca-eventos]').forEach(montarBusca);
