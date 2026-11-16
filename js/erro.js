/* =============================================================
   SEJOGA — PÁGINA DE ERRO (404.html)

   Uma página só para os dois erros do enunciado:
     404.html            -> navegação: o endereço não existe
     404.html?tipo=auth  -> falha crítica de autenticação
                            (o auth.js manda para cá quando a
                            sessão gravada está corrompida)

   O HTML já vem com os textos do 404. Se o tipo for "auth",
   trocamos os textos e os botões.
   ============================================================= */

(function ajustarPaginaDeErro() {
    const tipo = new URLSearchParams(window.location.search).get('tipo');

    if (tipo !== 'auth') {
        return;
    }

    document.title = 'SeJoga - Acesso negado';

    document.getElementById('codigo-erro').textContent = '401';
    document.getElementById('titulo-erro').textContent = 'Acesso negado';
    document.getElementById('etiqueta-erro').textContent = 'Erro de autenticação · Sessão inválida';
    document.getElementById('texto-erro').textContent =
        'Não conseguimos confirmar quem você é: sua sessão expirou ou foi alterada. ' +
        'Por segurança, desconectamos sua conta. Entre de novo para continuar.';

    const principal = document.getElementById('acao-principal');
    principal.textContent = 'Entrar de novo';
    principal.href = 'login.html';

    const secundaria = document.getElementById('acao-secundaria');
    secundaria.textContent = 'Voltar para o início';
    secundaria.href = 'index.html';
})();
