# SeJoga — Portal de Eventos

Projeto da disciplina **Projeto de Desenvolvimento em Front-End** (ADS · UNISUAM · 2026.2 · Prof. Bruno Cezario).

O SeJoga reúne em um só lugar festas, jogos de futebol e basquete, encontros de fantasia e campeonatos de e-sports perto de você. O visitante vê os destaques e o calendário. Quem cria uma conta também pode ver todos os eventos, montar a própria agenda, cadastrar eventos e mandar feedback.

> **Projeto 100% Front-End.** Não tem servidor nem banco de dados: tudo é salvo no `localStorage` do navegador, como o enunciado pede.

## Links

- **Site no ar:** _(colar aqui o link do GitHub Pages / Vercel / Netlify)_
- **Protótipo no Figma:** _(colar aqui o link do Figma)_
- **Repositório:** https://github.com/dxvz10/sejogav2

## Integrantes

- Davi
- Rafael
- Rodrigo

## Como rodar

Não precisa instalar nada. Duas formas:

1. Abrir o `index.html` direto no navegador; ou
2. Usar a extensão **Live Server** do VS Code (botão direito no `index.html` → *Open with Live Server*).

> A busca de endereço pelo CEP usa a API ViaCEP, então precisa de internet.

## Tecnologias

- **HTML5 semântico:** `header`, `nav`, `main`, `section`, `footer`, `fieldset`, `dl`
- **CSS3 puro:** variáveis CSS para o tema claro/escuro, Flexbox, Grid e `@media` para a responsividade
- **JavaScript puro (ES6+):** manipulação do DOM, validações, `fetch` assíncrono e `localStorage`
- **API:** [ViaCEP](https://viacep.com.br/)

## Telas

| Fluxo | Página | O que faz |
|---|---|---|
| Público | `index.html` | Landing page: carrossel de destaques, categorias, "Sobre nós" e contato |
| Público | `calendario.html` | Calendário mensal com os eventos e a busca com filtros |
| Público | `cadastro.html` | Cadastro de usuário com todas as validações do enunciado |
| Público | `login.html` | Login conferido com o que está salvo no localStorage |
| Público | `404.html` | Erro personalizado: página inexistente (404) ou falha de autenticação (`?tipo=auth`) |
| Restrito | `eventos.html` | Todos os eventos, com busca e filtros (categoria, região, preço, status) |
| Restrito | `perfil.html` | Dados do usuário, troca de senha e "Minha agenda" |
| Restrito | `cadastro-evento.html` | Publicar um evento novo |
| Restrito | `feedback.html` | Formulário de feedback com **range, select, radio e checkbox** |
| Restrito | `confirmacao.html` | Mostra os dados enviados no feedback |

Nas páginas restritas, o nome do usuário logado fica no canto superior direito, com o menu que tem o botão **Sair**.

## Requisitos do enunciado

**Validações do cadastro** (`js/validacoes.js`)

- **Nome completo:** 15 a 80 caracteres, só letras e com pelo menos duas palavras.
- **CPF:** cálculo real dos dois dígitos verificadores. CPFs com todos os números iguais são recusados.
- **CEP:** consulta a ViaCEP e preenche Rua, Bairro, Cidade e UF automaticamente.
- **Telefones:** máscara `(+55)XX-XXXXXXXX`. O celular também aceita 9 dígitos, porque todo celular no Brasil tem 9 desde 2016.
- **Login:** exatamente 6 letras.
- **Senha:** exatamente 8 letras.
- **Confirmação:** precisa ser igual à senha.

**Persistência e sessão** (`js/storage.js` e `js/auth.js`)

- As contas ficam no localStorage como uma lista JSON (`portalEventos_usuarios`).
- O login compara login e senha com o que está salvo.
- A sessão (`portalEventos_sessao`) guarda só o login e o nome, nunca a senha.
- Páginas restritas são marcadas com `<html data-pagina="restrita">`:
  - quem não está logado é levado para o login;
  - uma sessão corrompida leva para a página de erro de autenticação.

**UX/UI**

- Nenhum `alert()`: as mensagens usam toasts, modais e avisos dentro do próprio formulário (`js/ui.js`).
- Responsivo em celular (375px+), tablet (768px+) e computador (1024px+).
- Menu fixo no topo, com submenu de categorias no item **Eventos**.

**Desafio Plus: acessibilidade** (`js/tema.js`)

- Alternância entre tema claro e tema escuro.
- Botões **A−** e **A+** mudam o tamanho da fonte em 5 níveis, pela variável CSS `--escala-fonte`.
- As duas escolhas ficam salvas no localStorage.

**Sinalização dos eventos por cor**

| Cor | Status | Quando aparece |
|---|---|---|
| Verde | Disponível | Ainda há vagas |
| Amarelo | Perto do início | Faltam 48h ou menos |
| Vermelho | Esgotado ou cancelado | Vagas acabaram ou o evento foi cancelado |
| Cinza | Já realizado | A data do evento já passou |

O status é **calculado** na hora (`calcularStatusEvento` em `js/eventos.js`), nunca salvo. Assim ele não fica desatualizado.

## Estrutura de pastas

```
/assets         logo e imagens de fundo
/img/icons      ícones das redes sociais
/css            style.css (global) + uma pasta por página
/js             storage, ui, auth, validacoes, eventos, tema, cabecalho...
  /home         scripts exclusivos da página inicial
index.html, login.html, cadastro.html, calendario.html, eventos.html,
perfil.html, cadastro-evento.html, feedback.html, confirmacao.html, 404.html
```

## Chaves do localStorage

| Chave | Conteúdo |
|---|---|
| `portalEventos_usuarios` | Lista de contas cadastradas |
| `portalEventos_sessao` | Quem está logado (login + nome) |
| `portalEventos_eventos` | Lista de eventos |
| `portalEventos_meusEventos` | Agenda de cada usuário |
| `portalEventos_feedbacks` | Respostas do formulário de feedback |
| `portalEventos_preferencias` | Tema e tamanho de fonte |

## Limitação conhecida (proposital)

Como não existe servidor, a senha fica salva em texto puro no localStorage, e qualquer pessoa consegue ver isso pelo DevTools do navegador. Num sistema real, a senha ficaria num servidor, guardada com *hash* (bcrypt, por exemplo). Aqui é assim porque o enunciado pede uma simulação feita 100% no navegador.
