// nome: 15 a 80 caracteres, so letras, e pelo menos 2 palavras
function validarNomeCompleto(nome) {
    const limpo = nome.trim();

    if (!/^[A-Za-zÀ-ÿ\s]{15,80}$/.test(limpo)) {
        return false;
    }

    return limpo.split(/\s+/).length >= 2;
}

// login: exatamente 6 letras
function validarLogin(login) {
    return /^[A-Za-z]{6}$/.test(login);
}

// senha: exatamente 8 letras
function validarSenha(senha) {
    return /^[A-Za-z]{8}$/.test(senha);
}

// confirmacao tem que ser igual a senha
function validarConfirmacaoSenha(senha, confirmacao) {
    return confirmacao !== '' && senha === confirmacao;
}

// email no formato nome@site.com
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// data de nascimento: nao pode ser no futuro e precisa ter 13 anos ou mais
function validarNascimento(valor) {
    if (!valor) {
        return false;
    }

    const nascimento = new Date(valor + 'T00:00:00');
    const hoje = new Date();

    if (isNaN(nascimento.getTime()) || nascimento > hoje) {
        return false;
    }

    let idade = hoje.getFullYear() - nascimento.getFullYear();

    const aindaNaoFez =
        hoje.getMonth() < nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());

    if (aindaNaoFez) {
        idade = idade - 1;
    }

    return idade >= 13 && idade <= 120;
}

// valida o CPF pelos digitos verificadores
function validarCPF(cpfDigitado) {
    // tira pontos e traco
    const cpf = cpfDigitado.replace(/\D/g, '');

    // precisa ter 11 numeros e nao pode ser tudo igual (tipo 111.111.111-11)
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    // 1o digito: multiplica os 9 primeiros por 10, 9, 8... ate 2 e soma
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma = soma + Number(cpf[i]) * (10 - i);
    }

    // resto da divisao por 11 (se der 10 vira 0)
    let digito1 = (soma * 10) % 11;
    if (digito1 === 10) {
        digito1 = 0;
    }

    if (digito1 !== Number(cpf[9])) {
        return false;
    }

    // 2o digito: mesma conta com os 10 primeiros, pesos de 11 ate 2
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma = soma + Number(cpf[i]) * (11 - i);
    }

    let digito2 = (soma * 10) % 11;
    if (digito2 === 10) {
        digito2 = 0;
    }

    // so e valido se os 2 digitos baterem
    return digito2 === Number(cpf[10]);
}

// telefone fixo: (+55)XX-XXXXXXXX
function validarTelefone(telefone) {
    return /^\(\+55\)\d{2}-\d{8}$/.test(telefone);
}

// celular aceita 8 ou 9 numeros (celular hoje tem 9)
function validarCelular(telefone) {
    return /^\(\+55\)\d{2}-\d{8,9}$/.test(telefone);
}

// CEP: 8 numeros
function validarCEP(cep) {
    return /^\d{5}-?\d{3}$/.test(cep);
}

// mascara do CPF: 000.000.000-00
function mascaraCPF(valor) {
    const n = valor.replace(/\D/g, '').slice(0, 11);

    if (n.length > 9) return n.slice(0, 3) + '.' + n.slice(3, 6) + '.' + n.slice(6, 9) + '-' + n.slice(9);
    if (n.length > 6) return n.slice(0, 3) + '.' + n.slice(3, 6) + '.' + n.slice(6);
    if (n.length > 3) return n.slice(0, 3) + '.' + n.slice(3);
    return n;
}

// mascara do CEP: 00000-000
function mascaraCEP(valor) {
    const n = valor.replace(/\D/g, '').slice(0, 8);
    return n.length > 5 ? n.slice(0, 5) + '-' + n.slice(5) : n;
}

// mascara do telefone (+55)XX-XXXXXXXX
function mascaraTelefone(valor, digitosDoNumero = 8) {
    const limite = 2 + digitosDoNumero;

    // tira o (+55) antes, senao o 55 vira DDD
    const semPrefixo = valor.replace(/^\(\+5{0,2}\)?/, '');
    let n = semPrefixo.replace(/\D/g, '');

    if (n.length > limite && n.startsWith('55')) {
        n = n.slice(2);
    }

    n = n.slice(0, limite);

    if (n.length === 0) return '';
    if (n.length <= 2) return '(+55)' + n;
    return '(+55)' + n.slice(0, 2) + '-' + n.slice(2);
}

// busca o endereco na API do ViaCEP
async function buscarEnderecoPorCep(cepDigitado) {
    const cep = cepDigitado.replace(/\D/g, '');

    if (cep.length !== 8) {
        return null;
    }

    try {
        // await espera a resposta da API chegar
        const resposta = await fetch('https://viacep.com.br/ws/' + cep + '/json/');
        const dados = await resposta.json();

        // CEP que nao existe
        if (dados.erro) {
            return null;
        }

        return {
            rua: dados.logradouro,
            bairro: dados.bairro,
            cidade: dados.localidade,
            uf: dados.uf
        };
    // sem internet ou ViaCEP fora do ar
    } catch (erro) {
        throw new Error('sem-conexao');
    }
}
