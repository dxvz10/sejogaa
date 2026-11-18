// regras de cada campo: funcao que testa + mensagem de erro
const REGRAS_DADOS = {
    'nome': {
        testar: validarNomeCompleto,
        mensagem: 'Digite nome e sobrenome, só letras (de 15 a 80 caracteres).'
    },
    'email': {
        testar: validarEmail,
        mensagem: 'Digite um e-mail válido, como nome@exemplo.com.'
    },
    'data-nascimento': {
        testar: validarNascimento,
        mensagem: 'Informe uma data válida. É preciso ter 13 anos ou mais.'
    },
    'telefone-celular': {
        testar: validarCelular,
        mensagem: 'Use o formato (+55)XX-XXXXXXXXX (DDD + 8 ou 9 números).'
    },
    'telefone-fixo': {
        testar: function (valor) { return valor === '' || validarTelefone(valor); },
        mensagem: 'Use o formato (+55)XX-XXXXXXXX, ou deixe em branco.'
    },
    'cep': {
        testar: validarCEP,
        mensagem: 'O CEP tem 8 números.'
    },
    'rua': {
        testar: function (valor) { return valor.trim().length >= 3; },
        mensagem: 'Informe a rua.'
    },
    'numero': {
        testar: function (valor) { return valor.trim() !== ''; },
        mensagem: 'Informe o número (ou "s/n").'
    },
    'bairro': {
        testar: function (valor) { return valor.trim().length >= 2; },
        mensagem: 'Informe o bairro.'
    },
    'cidade': {
        testar: function (valor) { return valor.trim().length >= 2; },
        mensagem: 'Informe a cidade.'
    },
    'uf': {
        testar: function (valor) { return /^[A-Za-z]{2}$/.test(valor); },
        mensagem: 'Duas letras, como RJ.'
    }
};

// escreve o erro embaixo do campo e deixa ele vermelho (aria-invalid)
function marcarCampo(id, mensagem) {
    const campo = document.getElementById(id);
    const erro = document.getElementById('erro-' + id);

    if (erro) {
        erro.textContent = mensagem || '';
        erro.classList.remove('info');
    }

    if (mensagem) {
        campo.setAttribute('aria-invalid', 'true');
    } else {
        campo.removeAttribute('aria-invalid');
    }
}

// valida um campo so
function validarCampo(id, regras) {
    const valor = document.getElementById(id).value;
    const passou = regras[id].testar(valor);

    marcarCampo(id, passou ? '' : regras[id].mensagem);
    return passou;
}

// valida todos e devolve o primeiro campo com erro
function validarTodos(regras) {
    let primeiroErro = null;

    Object.keys(regras).forEach(function (id) {
        if (!validarCampo(id, regras) && !primeiroErro) {
            primeiroErro = id;
        }
    });

    return primeiroErro;
}

// valida quando sai do campo, e depois do erro valida a cada tecla
function ligarValidacaoAoVivo(regras) {
    Object.keys(regras).forEach(function (id) {
        const campo = document.getElementById(id);

        campo.addEventListener('blur', function () {
            if (campo.value !== '') {
                validarCampo(id, regras);
            }
        });

        campo.addEventListener('input', function () {
            if (campo.hasAttribute('aria-invalid')) {
                validarCampo(id, regras);
            }
        });
    });
}

// aplica a mascara a cada tecla digitada
function aplicarMascara(id, mascara) {
    const campo = document.getElementById(id);

    if (!campo) {
        return;
    }

    campo.addEventListener('input', function () {
        campo.value = mascara(campo.value);
    });
}

// liga as mascaras nos campos
function ligarMascaras() {
    aplicarMascara('cpf', mascaraCPF);
    aplicarMascara('cep', mascaraCEP);
    aplicarMascara('telefone-celular', function (valor) {
        return mascaraTelefone(valor, 9);
    });
    aplicarMascara('telefone-fixo', mascaraTelefone);
    aplicarMascara('uf', function (valor) {
        return valor.replace(/[^A-Za-z]/g, '').toUpperCase();
    });
}

// quando o CEP tiver 8 numeros, busca no ViaCEP e preenche o endereco
function ligarBuscaDeCep() {
    const campoCep = document.getElementById('cep');
    let ultimoCepBuscado = campoCep.value.replace(/\D/g, '');

    campoCep.addEventListener('input', async function () {
        const cep = campoCep.value.replace(/\D/g, '');

        if (cep.length !== 8 || cep === ultimoCepBuscado) {
            return;
        }

        ultimoCepBuscado = cep;
        const aviso = document.getElementById('erro-cep');
        aviso.textContent = 'Buscando endereço…';
        aviso.classList.add('info');

        try {
            const endereco = await buscarEnderecoPorCep(cep);

            if (!endereco) {
                marcarCampo('cep', 'CEP não encontrado. Confira os números ou preencha o endereço à mão.');
                return;
            }

            marcarCampo('cep', '');

            // preenche os campos com o que veio da API
            ['rua', 'bairro', 'cidade', 'uf'].forEach(function (id) {
                document.getElementById(id).value = endereco[id];
                marcarCampo(id, '');
            });

            document.getElementById('numero').focus();

        } catch (erro) {
            ultimoCepBuscado = '';
            marcarCampo('cep', 'Não foi possível consultar o CEP agora. Preencha o endereço à mão.');
        }
    });
}

// diminui a foto pra caber no localStorage
function reduzirFoto(arquivo, tamanho) {
    return new Promise(function (resolver, rejeitar) {
        const leitor = new FileReader();

        leitor.onload = function () {
            const imagem = new Image();

            imagem.onload = function () {
                const tela = document.createElement('canvas');
                tela.width = tamanho;
                tela.height = tamanho;

                const lado = Math.min(imagem.width, imagem.height);
                const x = (imagem.width - lado) / 2;
                const y = (imagem.height - lado) / 2;

                tela.getContext('2d').drawImage(imagem, x, y, lado, lado, 0, 0, tamanho, tamanho);
                resolver(tela.toDataURL('image/jpeg', 0.85));
            };

            imagem.onerror = rejeitar;
            imagem.src = leitor.result;
        };

        leitor.onerror = rejeitar;
        leitor.readAsDataURL(arquivo);
    });
}

// mostra a previa da foto escolhida
function ligarEscolhaDeFoto(idCampo, idPrevia, aoEscolher) {
    document.getElementById(idCampo).addEventListener('change', async function () {
        const arquivo = this.files[0];

        if (!arquivo) {
            return;
        }

        if (!arquivo.type.startsWith('image/')) {
            mostrarToast('Escolha um arquivo de imagem (JPG ou PNG).', 'erro');
            this.value = '';
            return;
        }

        try {
            const foto = await reduzirFoto(arquivo, 160);
            document.getElementById(idPrevia).style.backgroundImage = 'url("' + foto + '")';
            aoEscolher(foto);
        } catch (erro) {
            mostrarToast('Não foi possível ler essa imagem.', 'erro');
        }

        this.value = '';
    });
}

// pega o valor do campo sem espacos nas pontas
function valorDe(id) {
    return document.getElementById(id).value.trim();
}

// junta os dados do formulario num objeto
function lerDadosDoFormulario() {
    return {
        nomeCompleto: valorDe('nome').replace(/\s+/g, ' '),
        email: valorDe('email').toLowerCase(),
        dataNascimento: valorDe('data-nascimento'),
        telefoneCelular: valorDe('telefone-celular'),
        telefoneFixo: valorDe('telefone-fixo'),
        cep: valorDe('cep').replace(/\D/g, ''),
        rua: valorDe('rua'),
        numero: valorDe('numero'),
        bairro: valorDe('bairro'),
        cidade: valorDe('cidade'),
        uf: valorDe('uf').toUpperCase()
    };
}
