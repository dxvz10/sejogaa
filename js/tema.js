/* =============================================================
   SEJOGA — APARÊNCIA (Desafio Plus do enunciado)

   Tema claro/escuro e tamanho da fonte, guardados no
   localStorage para valer em todas as páginas.

   O Design System do site (YOZELEN) é escuro, então o tema
   ESCURO é o padrão: é o que aparece para quem nunca escolheu.
   O tema claro é a alternativa.

   Este arquivo é carregado no <head>, ANTES do <body> existir.
   Motivo: se o tema fosse aplicado só no fim da página, ela
   apareceria com a cor errada por um instante e depois trocaria —
   um "flash" incômodo. Aqui o tema é aplicado antes do primeiro
   desenho.

   Por rodar tão cedo, ele não pode usar o storage.js (que ainda
   não carregou) — por isso lê o localStorage diretamente.
   ============================================================= */

const CHAVE_PREFERENCIAS = 'portalEventos_preferencias';

/* Os tamanhos possíveis. Uma lista fixa é mais previsível do que
   somar 0.1 à vontade — e evita números como 1.2000000000000002,
   que é como o computador às vezes guarda decimais. */
const ESCALAS_DE_FONTE = [0.9, 1, 1.1, 1.2, 1.3];


function obterPreferencias() {
    try {
        const guardadas = JSON.parse(localStorage.getItem(CHAVE_PREFERENCIAS));
        return {
            // Só fica claro se a pessoa ESCOLHEU claro; qualquer outra
            // coisa (nada salvo, valor estranho) cai no padrão escuro.
            tema: guardadas && guardadas.tema === 'claro' ? 'claro' : 'escuro',
            escala: guardadas && ESCALAS_DE_FONTE.indexOf(guardadas.escala) !== -1 ? guardadas.escala : 1
        };
    } catch (erro) {
        return { tema: 'escuro', escala: 1 };
    }
}


function salvarPreferencias(preferencias) {
    try {
        localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(preferencias));
    } catch (erro) {
        // Sem armazenamento, o tema vale só nesta página. Tudo bem.
    }
}


/* O CSS faz o resto:
   - html[data-tema="claro"] troca as cores (o :root já é o escuro);
   - a variável --escala-fonte aumenta o conteúdo principal. */
function aplicarPreferencias(preferencias) {
    const raiz = document.documentElement;       // a tag <html>
    raiz.dataset.tema = preferencias.tema;
    raiz.style.setProperty('--escala-fonte', preferencias.escala);
}


function alternarTema() {
    const preferencias = obterPreferencias();
    preferencias.tema = preferencias.tema === 'escuro' ? 'claro' : 'escuro';
    salvarPreferencias(preferencias);
    aplicarPreferencias(preferencias);
    return preferencias.tema;
}


/* passo = +1 (A+) ou -1 (A−). Math.min e Math.max funcionam como
   trava: nunca passa do primeiro nem do último tamanho da lista. */
function mudarEscala(passo) {
    const preferencias = obterPreferencias();
    const atual = ESCALAS_DE_FONTE.indexOf(preferencias.escala);
    const nova = Math.min(Math.max(atual + passo, 0), ESCALAS_DE_FONTE.length - 1);

    preferencias.escala = ESCALAS_DE_FONTE[nova];
    salvarPreferencias(preferencias);
    aplicarPreferencias(preferencias);
    return preferencias.escala;
}


// Aplica já, na hora em que o <head> é lido.
aplicarPreferencias(obterPreferencias());
