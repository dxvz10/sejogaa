const usuario = usuarioAtual();

let fotoAtual = '';

// mostra o CPF com pontos e traco
function formatarCPF(cpf) {
    return mascaraCPF(cpf || '');
}

// preenche o formulario com os dados do usuario
function preencherPerfil() {
    document.getElementById('perfil-nome').textContent = usuario.nomeCompleto || usuario.login;
    document.getElementById('perfil-login').textContent = '@' + usuario.login;

    if (fotoAtual) {
        document.getElementById('previa-foto').style.backgroundImage = 'url("' + fotoAtual + '")';
    }

    const campos = {
        'nome': usuario.nomeCompleto,
        'email': usuario.email,
        'data-nascimento': usuario.dataNascimento,
        'cpf-exibicao': formatarCPF(usuario.cpf),
        'telefone-celular': usuario.telefoneCelular,
        'telefone-fixo': usuario.telefoneFixo,
        'cep': mascaraCEP(usuario.cep || ''),
        'rua': usuario.rua,
        'numero': usuario.numero,
        'bairro': usuario.bairro,
        'cidade': usuario.cidade,
        'uf': usuario.uf
    };

    Object.keys(campos).forEach(function (id) {
        document.getElementById(id).value = campos[id] || '';
    });
}

// troca a foto no cabecalho tambem
function atualizarAvataresDoCabecalho(foto) {
    document.querySelectorAll('.cabecalho .usuario-avatar').forEach(function (avatar) {
        avatar.style.backgroundImage = foto ? 'url("' + foto + '")' : '';
    });
}

// aviso embaixo de cada formulario
function mostrarAviso(id, texto, tipo) {
    const aviso = document.getElementById(id);
    aviso.textContent = texto;
    aviso.className = 'aviso-form visivel ' + tipo;
}

// regras da troca de senha
const REGRAS_SENHA = {
    'senha-atual': {
        testar: function (valor) { return valor === buscarUsuario(usuario.login).senha; },
        mensagem: 'Senha atual incorreta.'
    },
    'nova-senha': {
        testar: validarSenha,
        mensagem: 'Exatamente 8 letras, sem números nem símbolos.'
    },
    'confirmacao-nova': {
        testar: function (valor) {
            return validarConfirmacaoSenha(document.getElementById('nova-senha').value, valor);
        },
        mensagem: 'As senhas não são iguais.'
    }
};

// lista os eventos da agenda (proximos e passados)
function desenharAgenda() {
    const proximos = document.getElementById('agenda-proximos');
    const passados = document.getElementById('agenda-passados');
    const agora = new Date();

    const todos = eventosDaMinhaAgenda();

    const futuros = todos.filter(function (evento) {
        return new Date(evento.dataHora) >= agora;
    });

    const antigos = todos.filter(function (evento) {
        return new Date(evento.dataHora) < agora;
    }).reverse();

    proximos.textContent = '';
    passados.textContent = '';

    if (todos.length === 0) {
        const vazio = criarElemento('div', 'agenda-vazia');
        vazio.appendChild(criarElemento('p', null, 'Sua agenda está vazia.'));
        const link = criarElemento('a', 'botao-cadastro', 'Explorar eventos');
        link.href = 'eventos.html';
        vazio.appendChild(link);
        proximos.appendChild(vazio);
        return;
    }

    if (futuros.length > 0) {
        proximos.appendChild(criarElemento('h3', 'agenda-subtitulo', 'Próximos'));
        const grade = criarElemento('div', 'cards-eventos');
        futuros.forEach(function (evento) {
            grade.appendChild(montarCardEvento(evento, { permitirRemoverEncerrado: true }));
        });
        proximos.appendChild(grade);
    }

    if (antigos.length > 0) {
        passados.appendChild(criarElemento('h3', 'agenda-subtitulo', 'Já aconteceram'));
        const grade = criarElemento('div', 'cards-eventos cards-passados');
        antigos.forEach(function (evento) {
            grade.appendChild(montarCardEvento(evento, { permitirRemoverEncerrado: true }));
        });
        passados.appendChild(grade);
    }
}

// liga tudo da pagina de perfil
function iniciarPerfil() {
    fotoAtual = usuario.foto || '';

    ligarValidacaoAoVivo(REGRAS_DADOS);
    ligarMascaras();
    ligarBuscaDeCep();

    ligarEscolhaDeFoto('foto', 'previa-foto', function (foto) {
        fotoAtual = foto;

        if (atualizarUsuario(usuario.login, { foto: foto })) {
            atualizarAvataresDoCabecalho(foto);
            mostrarToast('Foto atualizada.', 'sucesso');
        } else {
            mostrarToast('A foto não coube no armazenamento do navegador.', 'erro');
        }
    });

    document.getElementById('remover-foto').addEventListener('click', function () {
        fotoAtual = '';
        atualizarUsuario(usuario.login, { foto: '' });

        document.getElementById('previa-foto').style.backgroundImage = '';
        atualizarAvataresDoCabecalho('');
        mostrarToast('Foto removida.', 'info');
    });

    document.getElementById('form-perfil').addEventListener('submit', function (evento) {
        evento.preventDefault();

        const primeiroErro = validarTodos(REGRAS_DADOS);

        if (primeiroErro) {
            mostrarAviso('aviso-perfil', 'Confira os campos marcados em vermelho.', 'erro');
            document.getElementById(primeiroErro).focus();
            return;
        }

        const dados = lerDadosDoFormulario();

        if (valorJaCadastrado('email', dados.email, usuario.login)) {
            marcarCampo('email', 'Este e-mail já é usado por outra conta.');
            document.getElementById('email').focus();
            return;
        }

        if (!atualizarUsuario(usuario.login, dados)) {
            mostrarAviso('aviso-perfil', 'Não foi possível salvar agora. Tente de novo.', 'erro');
            return;
        }

        Object.assign(usuario, dados);
        document.getElementById('perfil-nome').textContent = usuario.nomeCompleto;

        document.querySelectorAll('.cabecalho .usuario-nome').forEach(function (nome) {
            nome.textContent = 'Olá, ' + usuario.nomeCompleto.split(' ')[0];
        });

        mostrarAviso('aviso-perfil', 'Dados salvos.', 'sucesso');
        mostrarToast('Perfil atualizado.', 'sucesso');
    });

    document.getElementById('form-senha').addEventListener('submit', function (evento) {
        evento.preventDefault();

        const primeiroErro = validarTodos(REGRAS_SENHA);

        if (primeiroErro) {
            mostrarAviso('aviso-senha', 'Confira os campos marcados em vermelho.', 'erro');
            document.getElementById(primeiroErro).focus();
            return;
        }

        atualizarUsuario(usuario.login, { senha: document.getElementById('nova-senha').value });

        this.reset();
        mostrarAviso('aviso-senha', 'Senha alterada.', 'sucesso');
        mostrarToast('Senha alterada.', 'sucesso');
    });

    document.addEventListener('agenda-mudou', desenharAgenda);

    preencherPerfil();
    desenharAgenda();
}

if (usuario) {
    iniciarPerfil();
}
