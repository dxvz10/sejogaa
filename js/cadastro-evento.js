const formEvento = document.querySelector('#form-evento');
const avisoEvento = document.querySelector('#aviso-evento');

// regras de cada campo do evento
const REGRAS_EVENTO = {
    'nome-evento': {
        testar: function (valor) {
            const tamanho = valor.trim().length;
            return tamanho >= 5 && tamanho <= 60;
        },
        mensagem: 'O nome precisa ter de 5 a 60 caracteres.'
    },
    'categoria': {
        testar: function (valor) {
            return valor !== '';
        },
        mensagem: 'Escolha uma categoria.'
    },
    'descricao': {
        testar: function (valor) {
            const tamanho = valor.trim().length;
            return tamanho >= 20 && tamanho <= 500;
        },
        mensagem: 'Conte um pouco mais: de 20 a 500 caracteres.'
    },

    'data-evento': {
        testar: function (valor) {
            return valor !== '';
        },
        mensagem: 'Escolha a data.'
    },
    'hora-evento': {
        testar: function (valor) {
            if (valor === '') {
                return false;
            }
            const data = valorDe('data-evento');
            if (data === '') {
                return true;
            }
            const quando = new Date(data + 'T' + valor);
            return quando > new Date();
        },
        mensagem: 'O evento precisa ser numa data e hora futuras.'
    },
    'local': {
        testar: function (valor) {
            const tamanho = valor.trim().length;
            return tamanho >= 3 && tamanho <= 80;
        },
        mensagem: 'Informe o local (de 3 a 80 caracteres).'
    },
    'regiao': {
        testar: function (valor) {
            return valor !== '';
        },
        mensagem: 'Escolha a região.'
    },

    'preco': {
        testar: function (valor) {
            if (valor === '') {
                return false;
            }
            const numero = Number(valor);
            return !isNaN(numero) && numero >= 0;
        },
        mensagem: 'Informe o preço (0 para gratuito).'
    },
    'capacidade': {
        testar: function (valor) {
            if (valor === '') {
                return false;
            }
            const numero = Number(valor);
            return Number.isInteger(numero) && numero >= 1;
        },
        mensagem: 'Informe quantas vagas (número inteiro, 1 ou mais).'
    },
    'comida-bebida': {
        testar: function (valor) {
            return valor.trim().length <= 200;
        },
        mensagem: 'No máximo 200 caracteres.'
    }
};

ligarValidacaoAoVivo(REGRAS_EVENTO);

document.getElementById('data-evento').addEventListener('change', function () {
    if (valorDe('hora-evento') !== '') {
        validarCampo('hora-evento', REGRAS_EVENTO);
    }
});

// aviso geral do formulario
function mostrarAvisoEvento(texto) {
    avisoEvento.textContent = texto;
    avisoEvento.className = 'aviso-form visivel erro';
}

function limparAvisoEvento() {
    avisoEvento.textContent = '';
    avisoEvento.className = 'aviso-form';
}

// envio do evento: valida, monta o objeto e salva na lista
formEvento.addEventListener('submit', function (envio) {
    envio.preventDefault();

    const primeiroErro = validarTodos(REGRAS_EVENTO);

    if (primeiroErro) {
        mostrarAvisoEvento('Confira os campos marcados em vermelho.');
        document.getElementById(primeiroErro).focus();
        return;
    }

    limparAvisoEvento();

    // o status nao e salvo, ele e calculado na hora
    const novoEvento = {
        id: 'evt_' + Date.now(),
        categoria: valorDe('categoria'),
        nome: valorDe('nome-evento'),
        local: valorDe('local'),
        regiao: valorDe('regiao'),
        preco: Number(valorDe('preco')),
        dataHora: valorDe('data-evento') + 'T' + valorDe('hora-evento') + ':00',
        descricao: valorDe('descricao'),
        comidaBebida: valorDe('comida-bebida'),
        capacidadeVagas: Number(valorDe('capacidade')),
        vagasOcupadas: 0,
        cancelado: false,
        criadoPorLogin: loginAtual()
    };

    const lista = obterEventos();
    lista.push(novoEvento);
    salvarEventos(lista);

    window.location.href = 'eventos.html?busca=' + encodeURIComponent(novoEvento.nome);
});
