const formCadastro = document.querySelector('#form-cadastro');
const avisoCadastro = document.querySelector('#aviso-cadastro');

// regras do cadastro = regras gerais + cpf, login, senha e confirmacao
const REGRAS_CADASTRO = Object.assign({}, REGRAS_DADOS, {
    'cpf': {
        testar: validarCPF,
        mensagem: 'CPF inválido. Confira os números.'
    },
    'login': {
        testar: validarLogin,
        mensagem: 'Exatamente 6 letras, sem números nem espaços.'
    },
    'senha': {
        testar: validarSenha,
        mensagem: 'Exatamente 8 letras, sem números nem símbolos.'
    },
    'confirmacao': {
        testar: function (valor) {
            return validarConfirmacaoSenha(document.getElementById('senha').value, valor);
        },
        mensagem: 'As senhas não são iguais.'
    }
});

let fotoEscolhida = '';

ligarValidacaoAoVivo(REGRAS_CADASTRO);
ligarMascaras();
ligarBuscaDeCep();
ligarEscolhaDeFoto('foto', 'previa-foto', function (foto) {
    fotoEscolhida = foto;
});

// aviso geral embaixo do formulario
function mostrarAvisoCadastro(texto) {
    avisoCadastro.textContent = texto;
    avisoCadastro.className = 'aviso-form visivel erro';
}

// envio do cadastro
formCadastro.addEventListener('submit', function (evento) {
    // nao deixa a pagina recarregar
    evento.preventDefault();

    const primeiroErro = validarTodos(REGRAS_CADASTRO);

    if (primeiroErro) {
        mostrarAvisoCadastro('Confira os campos marcados em vermelho.');
        document.getElementById(primeiroErro).focus();
        return;
    }

    const dados = Object.assign(lerDadosDoFormulario(), {
        cpf: valorDe('cpf').replace(/\D/g, ''),
        login: valorDe('login'),
        senha: document.getElementById('senha').value,
        foto: fotoEscolhida
    });

    // salva o usuario (auth.js)
    const resultado = cadastrarUsuario(dados);

    if (!resultado.ok) {
        if (document.getElementById('erro-' + resultado.campo)) {
            marcarCampo(resultado.campo, resultado.erro);
            document.getElementById(resultado.campo).focus();
        }
        mostrarAvisoCadastro(resultado.erro);
        return;
    }

    // deu certo: vai pro login com o login ja preenchido
    window.location.href = 'login.html?novo=' + encodeURIComponent(resultado.usuario.login);
});
