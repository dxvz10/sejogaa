// nomes das chaves que usamos no localStorage
const CHAVES = {
    usuarios: 'portalEventos_usuarios',
    sessao: 'portalEventos_sessao',
    eventos: 'portalEventos_eventos',
    meusEventos: 'portalEventos_meusEventos',
    feedbacks: 'portalEventos_feedbacks',
    notificacoesVistas: 'portalEventos_notificacoesVistas',
    preferencias: 'portalEventos_preferencias',
    versaoSemente: 'portalEventos_versaoSemente'
};

// pega do localStorage e transforma de volta em objeto (se der erro volta o valor padrao)
function lerDoArmazenamento(chave, reserva) {
    const bruto = localStorage.getItem(chave);

    if (bruto === null) {
        return reserva;
    }

    try {
        return JSON.parse(bruto);
    } catch (erro) {
        return reserva;
    }
}

// salva no localStorage em formato de texto (JSON)
function gravarNoArmazenamento(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
        return true;
    } catch (erro) {
        return false;
    }
}

// apaga uma chave do localStorage
function apagarDoArmazenamento(chave) {
    localStorage.removeItem(chave);
}
