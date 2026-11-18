const tituloMes = document.querySelector('#mes-ano');
const gradeDias = document.querySelector('#grade-dias');
const listaDestaques = document.querySelector('#cards-eventos');

const QUANTIDADE_DESTAQUES = 6;

// nomes dos meses pro titulo
const NOMES_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const hoje = new Date();
let anoAtual = hoje.getFullYear();
let mesAtual = hoje.getMonth();

// desenha os dias do mes e marca os que tem evento
function desenharMes() {
    const eventos = obterEventos();
    const meus = obterMeusEventos();

    tituloMes.textContent = NOMES_MESES[mesAtual] + ' ' + anoAtual;
    gradeDias.textContent = '';

    const casasVazias = new Date(anoAtual, mesAtual, 1).getDay();

    const totalDeDias = new Date(anoAtual, mesAtual + 1, 0).getDate();

    for (let i = 0; i < casasVazias; i++) {
        gradeDias.appendChild(criarElemento('div', 'dia vazio'));
    }

    for (let dia = 1; dia <= totalDeDias; dia++) {
        const celula = criarElemento('div', 'dia');
        celula.appendChild(criarElemento('span', 'numero-dia', dia));

        const doDia = eventos.filter(function (evento) {
            return mesmoDia(evento.dataHora, anoAtual, mesAtual, dia);
        });

        if (doDia.length > 0) {
            celula.classList.add('evento');
        }

        doDia.forEach(function (evento) {
            const etiqueta = criarElemento('small', 'etiqueta-evento', evento.nome);
            etiqueta.title = evento.nome + ' — ' + evento.local + ' — ' + formatarHora(evento.dataHora);

            if (meus.indexOf(evento.id) !== -1) {
                etiqueta.classList.add('meu-evento');
            }

            celula.appendChild(etiqueta);
        });

        if (mesmoDia(hoje.toISOString(), anoAtual, mesAtual, dia)) {
            celula.classList.add('hoje');
        }

        gradeDias.appendChild(celula);
    }
}

// setas de mes anterior e proximo
function mudarMes(passo) {
    mesAtual = mesAtual + passo;

    if (mesAtual > 11) {
        mesAtual = 0;
        anoAtual = anoAtual + 1;
    }

    if (mesAtual < 0) {
        mesAtual = 11;
        anoAtual = anoAtual - 1;
    }

    desenharMes();
}

document.querySelector('#mes-anterior').addEventListener('click', function () {
    mudarMes(-1);
});

document.querySelector('#mes-seguinte').addEventListener('click', function () {
    mudarMes(1);
});

// cards dos proximos eventos embaixo do calendario
function desenharDestaques() {
    listaDestaques.textContent = '';

    proximosEventosAbertos(QUANTIDADE_DESTAQUES).forEach(function (evento) {
        listaDestaques.appendChild(montarCardEvento(evento));
    });
}

document.addEventListener('agenda-mudou', desenharMes);

desenharMes();
desenharDestaques();
