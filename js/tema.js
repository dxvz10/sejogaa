const CHAVE_PREFERENCIAS = 'portalEventos_preferencias';

// tamanhos da fonte do A- e A+
const ESCALAS_DE_FONTE = [0.9, 1, 1.1, 1.2, 1.3];

// le o tema e o tamanho da fonte salvos (padrao: escuro e 1)
function obterPreferencias() {
    try {
        const guardadas = JSON.parse(localStorage.getItem(CHAVE_PREFERENCIAS));
        return {
            tema: guardadas && guardadas.tema === 'claro' ? 'claro' : 'escuro',
            escala: guardadas && ESCALAS_DE_FONTE.indexOf(guardadas.escala) !== -1 ? guardadas.escala : 1
        };
    } catch (erro) {
        return { tema: 'escuro', escala: 1 };
    }
}

// salva as escolhas no localStorage
function salvarPreferencias(preferencias) {
    try {
        localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(preferencias));
    } catch (erro) {
    }
}

// coloca o data-tema no html e muda a variavel do tamanho da fonte
function aplicarPreferencias(preferencias) {
    const raiz = document.documentElement;
    raiz.dataset.tema = preferencias.tema;
    raiz.style.setProperty('--escala-fonte', preferencias.escala);
}

// troca entre claro e escuro
function alternarTema() {
    const preferencias = obterPreferencias();
    preferencias.tema = preferencias.tema === 'escuro' ? 'claro' : 'escuro';
    salvarPreferencias(preferencias);
    aplicarPreferencias(preferencias);
    return preferencias.tema;
}

// A+ (passo 1) ou A- (passo -1), sem passar do menor nem do maior
function mudarEscala(passo) {
    const preferencias = obterPreferencias();
    const atual = ESCALAS_DE_FONTE.indexOf(preferencias.escala);
    const nova = Math.min(Math.max(atual + passo, 0), ESCALAS_DE_FONTE.length - 1);

    preferencias.escala = ESCALAS_DE_FONTE[nova];
    salvarPreferencias(preferencias);
    aplicarPreferencias(preferencias);
    return preferencias.escala;
}

// aplica assim que a pagina abre
aplicarPreferencias(obterPreferencias());
