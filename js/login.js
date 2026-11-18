const formLogin = document.querySelector('#form-login');
const campoLogin = document.querySelector('#login');
const campoSenha = document.querySelector('#senha');
const avisoLogin = document.querySelector('#aviso-login');

// mostra o aviso de erro ou sucesso no login
function mostrarAvisoLogin(texto, tipo) {
    avisoLogin.textContent = texto;
    avisoLogin.className = 'aviso-form visivel ' + tipo;
}

// le o que vem depois do ? no endereco
const parametros = new URLSearchParams(window.location.search);

if (parametros.get('novo')) {
    campoLogin.value = parametros.get('novo');
    mostrarAvisoLogin('Conta criada! Agora é só digitar sua senha.', 'sucesso');
    campoSenha.focus();
}

// envio do login
formLogin.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const login = campoLogin.value.trim();
    const senha = campoSenha.value;

    // primeiro confere o formato
    if (!validarLogin(login)) {
        mostrarAvisoLogin('O login tem exatamente 6 letras.', 'erro');
        campoLogin.focus();
        return;
    }

    if (!validarSenha(senha)) {
        mostrarAvisoLogin('A senha tem exatamente 8 letras.', 'erro');
        campoSenha.focus();
        return;
    }

    // depois confere com o que ta salvo
    const resultado = entrar(login, senha);

    if (!resultado.ok) {
        mostrarAvisoLogin(resultado.erro, 'erro');
        campoSenha.value = '';
        campoSenha.focus();
        return;
    }

    const voltar = parametros.get('voltar');
    // volta pra pagina de antes, mas so se for uma pagina do proprio site
    const destinoSeguro = voltar && !voltar.includes('/') && !voltar.includes(':');

    window.location.href = destinoSeguro ? voltar : 'index.html';
});
