# BriefForge — direção visual e plano de design

> **Status:** proposta da Etapa 1 — aguardando validação antes da implementação.
> **Base:** auditoria do repositório `guiguix7/BriefForge`, `PRODUCT.md`,
> `AGENTS.md`, skills locais e o documento *BriefForge — Prompt de Frontend Premium*.
> **Escopo desta entrega:** diagnóstico e plano, sem alterações de interface ou comportamento.

## 1. Diagnóstico do produto e do repositório

### 1.1. Stack e arquitetura observadas

- React 19, TypeScript, Vite 7 e Tailwind CSS 4.
- Rotas com React Router.
- Estado global com Zustand e persistência em `localStorage`.
- Formulários com React Hook Form e Zod.
- Primitivos Radix UI e ícones Lucide React.
- Drag-and-drop com dnd-kit.
- Testes com Vitest, Testing Library e jsdom; lint com Oxlint.
- Estrutura por páginas, componentes, funcionalidades, dados, estado e utilitários em `src/`.
- `backend/` existe como workspace reservado, mas não possui API implementada.
- Não há `DESIGN.md` na branch auditada. O sistema visual vigente está centralizado em `src/styles/tokens.css` e `src/index.css`.

A stack atual será preservada. A referência do PDF a React 18 não será aplicada literalmente porque o repositório já utiliza React 19. Também não será introduzida uma segunda solução de estilos.

### 1.2. Verdade funcional confirmada

O `PRODUCT.md`, os modelos de `src/store/index.ts`, `src/lib/domain.ts` e as páginas confirmam:

- CRUD de clientes, com busca, edição e exclusão em cascata.
- CRUD de projetos, associação com cliente e estados `ativo`, `pausado` e `concluido`.
- Edição de briefing com salvamento automático local e exemplos semeados.
- Análise simulada e determinística, com estados de carregamento, timeout, resposta inválida e briefing vazio.
- Revisão humana de sugestões: selecionar, aprovar, rejeitar, editar título/descrição, alterar prioridade e converter itens aprovados em tarefas.
- Lista e quadro de tarefas, filtros por estado/prioridade, busca, alteração de estado, drag-and-drop e painel de detalhes.
- Dashboard de projeto com métricas derivadas das tarefas.
- Histórico com filtros.
- Exportação do escopo em Markdown, cópia, download e impressão/PDF.
- Tela de login com sessão de demonstração, sem provedor real de identidade.

**Limites que precisam permanecer visíveis:**

- Não existem endpoints, serviço de persistência remoto, serviço de IA ou autenticação real.
- A análise é um mock determinístico; não pode ser descrita como IA em produção.
- O login é uma sessão demonstrativa local. Cadastro, recuperação de senha, gestão de equipe e cobrança não fazem parte do produto confirmado.
- A criação de tarefas acontece a partir de sugestões aprovadas. Cadastro manual de tarefas não está implementado.
- Os dados de `src/data/seed.ts` são demonstração, não evidência de clientes ou resultados comerciais.

### 1.3. Estado visual atual

O tema existente usa uma direção de papel/sálvia/cobre, sidebar escura, Inter e JetBrains Mono. Há tokens centralizados, componentes Radix reestilizados, tema claro/escuro, foco visível, skip link, estilos de impressão e suporte a movimento reduzido.

Essa base é organizada e deve ser reaproveitada estruturalmente; porém, a identidade cobre/sálvia/Inter diverge da direção explicitamente definida no novo briefing visual. Para este redesign, a aparência anterior será tratada como referência técnica, não como identidade a preservar.

### 1.4. Skills do repositório examinadas

Foram identificadas e lidas as instruções locais relevantes:

- `.opencode/skills/auditoria-repositorio/SKILL.md`
- `.opencode/skills/frontend-design/SKILL.md`
- `.opencode/skills/ui-acessibilidade/SKILL.md`
- `.opencode/skills/qualidade-multistack/SKILL.md`
- `.opencode/skills/seguranca-e-segredos/SKILL.md`
- `.opencode/skills/debug-sistematico/SKILL.md`
- `.opencode/skills/release-seguro/SKILL.md`
- `.opencode/skills/impeccable/SKILL.md` e a referência `reference/new-work.md`

Também foram lidos `AGENTS.md`, `PRODUCT.md`, `ACCESSIBILITY.md`, `CONTRIBUTING.md`, `package.json` e `skills-lock.json`.

A skill de frontend encaminha o trabalho visual para Impeccable. O carregador de contexto da skill não pôde ser executado neste ambiente porque o clone do GitHub falhou por indisponibilidade de DNS. Por isso, o diagnóstico foi feito pela leitura direta dos arquivos do repositório; nenhuma execução local ou inspeção do app em navegador foi alegada.

## 2. Direção visual proposta

### 2.1. Conceito

**Marca-texto: o BriefForge lê um texto bruto e destaca o que importa.**

A identidade materializa o mecanismo central do produto: a voz humana e desorganizada do cliente aparece em Newsreader; a interpretação estruturada aparece em Bricolage Grotesque. Os marca-textos são um sistema de informação, não decoração. Cada matiz conserva o mesmo significado na landing page, na revisão, nas tarefas e na exportação.

A única expressão visual deliberadamente memorável será a transformação do texto bruto em itens estruturados no hero. A tela de revisão retoma a mesma metáfora como uma folha anotada com comentários na margem. As demais áreas serão calmas, precisas e orientadas à operação.

### 2.2. Paleta especificada no briefing

| Token | Valor | Uso |
|---|---|---|
| Papel | `#F5F6F8` | Fundo claro |
| Folha | `#FFFFFF` | Superfícies |
| Tinta | `#12263A` | Texto e superfícies escuras |
| Tinta secundária | `#4A5B6D` | Texto secundário |
| Linha | `rgba(18, 38, 58, 0.12)` | Bordas |
| Hover | `rgba(18, 38, 58, 0.04)` | Realce discreto |
| Cobalto | `#2447F5` | Ação primária, foco e links |
| Alerta | `#D92D20` | Prioridade crítica e erros |
| Marca-texto — requisito | `#FFE45C` | Requisito |
| Marca-texto — dúvida | `#FF8FB1` | Dúvida |
| Marca-texto — risco | `#FF9A3D` | Risco |
| Marca-texto — entregável | `#7DD3FC` | Entregável |
| Marca-texto — aprovado | `#8EE3B8` | Estado aprovado |

Tema escuro, conforme o documento: fundo `#0C1A28`, superfície `#13273A`, texto `#E8EEF4`, texto secundário `#9FB0C2` e cobalto claro `#7D95FF`. Os cinco marca-textos mantêm seus matizes e continuam usando tinta escura no texto sobreposto. Linha, hover e demais estados escuros serão derivados dos tokens e validados por contraste durante a Etapa 2, sem inventar cores independentes.

### 2.3. Tipografia

- **Bricolage Grotesque variável:** títulos, navegação, componentes, dados e números; pesos 200–800, largura 75–100 e tamanho óptico 12–96.
- **Newsreader variável:** texto original do cliente, trechos longos, citações e folha anotada; inclui itálico.
- **JetBrains Mono:** exclusivamente para o visualizador de JSON, onde a forma monoespaçada tem função.

O pacote atual contém Inter e JetBrains Mono, mas não contém Bricolage Grotesque nem Newsreader. A etapa de implementação deve adicionar apenas as famílias variáveis necessárias, preferencialmente via Fontsource, com subconjuntos latin/latin-ext, preload dos arquivos críticos e fallback dimensionado.

### 2.4. Forma, espaçamento e profundidade

- Base de espaçamento: 4 px; escala 4, 8, 12, 16, 24, 32, 48, 72 e 112 px.
- Três raios: 3 px para marca-textos/tags, 8 px para controles, 14 px para painéis.
- Painéis com borda fina e mudança de superfície, sem sombra.
- Uma sombra, reservada a menus, modais e outras superfícies flutuantes.
- Grade de 12 colunas, alinhamento de texto à esquerda e margens responsivas equivalentes a `clamp(20px, 5vw, 80px)`.
- Ritmo assimétrico entre seções; não repetir a mesma composição verticalmente.

### 2.5. Vocabulário visual de status e prioridade

Status de tarefa por glifo e rótulo textual, sem depender da cor:

- `pendente`: círculo vazio.
- `andamento`: meio círculo.
- `revisao`: anel tracejado.
- `concluido`: círculo com check.

Prioridade por uma a quatro barras ascendentes e rótulo:

- `baixa`: uma barra.
- `media`: duas barras.
- `alta`: três barras.
- `critica`: quatro barras e sinal de exclamação em Alerta.

Na revisão, o estado da sugestão será tratado separadamente: pendente com marca-texto a 70%; aprovada com preenchimento sólido e check; rejeitada sem marca-texto e com texto discretamente riscado; editada com indicador textual de edição.

O modelo atual também contém o tipo `funcionalidade`, separado de `requisito`. Ele continuará com seu nome e significado próprios. Não será criado um sexto matiz semântico nem uma fusão silenciosa entre tipos; o tratamento visual final desse tipo será decidido na implementação mantendo o rótulo e a distinção de dados.

## 3. Arquitetura de experiência

### 3.1. Landing page pública

A landing page ainda não existe no conjunto de rotas auditado. Ela será uma nova superfície pública, sem substituir nem enfraquecer o app autenticado.

Objetivo: em até dez segundos, explicar a transformação de briefing desorganizado em escopo revisado, e permitir que a pessoa teste a demonstração. A landing será em português do Brasil, sem depoimentos, logotipos, estatísticas de uso, preços ou alegações não comprovadas.

Seções previstas pelo briefing:

1. Hero com demonstração viva da transformação.
2. Como funciona, em quatro passos reais.
3. Folha anotada, com aprovar/rejeitar funcionais na demonstração.
4. Dados estruturados: JSON e representação legível, incluindo recusa de exemplo inválido.
5. Do escopo à entrega: tarefas, progresso e folha de exportação.
6. Decisões técnicas: SQLite, rotas protegidas, falhas de IA e limites do MVP só serão mencionados depois de confirmados no código; hoje não há SQLite nem API implementada, então essa parte precisa explicar honestamente a arquitetura atual ou aguardar sua implementação.
7. Chamada final e rodapé simples, com link real para o repositório.

Wireframe desktop:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ BriefForge                         Como funciona  Demonstração  Entrar  │
├─────────────────────────────────────────────────────────────────────────┤
│ Transforme o briefing do       ┌───────────────────────────────────────┐ │
│ cliente em escopo, tarefas     │ Mensagem do cliente (Newsreader)     │ │
│ e entregáveis.                 │ texto original com trechos marcados  │ │
│                                ├───────────────────────────────────────┤ │
│ Cole a mensagem. A IA separa   │ Requisitos | Dúvidas | Riscos | ...  │ │
│ requisitos, dúvidas e riscos.  │ itens estruturados derivados do texto│ │
│ Você aprova o que entra        └───────────────────────────────────────┘ │
│ no projeto.                                                               │
│ [Analisar briefing de exemplo]                                            │
│ Entrar com a conta de demonstração                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

Wireframe mobile: navegação compacta no topo; texto de apresentação primeiro; mensagem bruta abaixo; itens estruturados empilhados depois; ação principal em largura total. O hero conserva a demonstração sem comprimir a leitura em duas colunas.

O exemplo visual do hero usará somente a mensagem e as extrações de exemplo fornecidas no PDF, identificadas como demonstração. O botão de entrada no app usará o fluxo de conta demonstrativa que já existe. A animação do hero poderá ser repetida manualmente; com movimento reduzido, o resultado final já aparecerá marcado.

### 3.2. Casca do aplicativo

- Sidebar de 64 px, expansível a 232 px, com navegação rotulada e estado ativo claro.
- Breadcrumb contextual para cliente/projeto/área.
- Conteúdo alinhado a uma largura legível, com densidade adequada a sessões de trabalho.
- Paleta de comandos em Ctrl/Cmd + K, limitada à busca e navegação/ações que existirem de fato.
- Troca de tema claro/escuro, preservando preferência salva e preferência de sistema inicial.
- Mobile com navegação em drawer e superfícies que não exijam hover.

### 3.3. Folha anotada — revisão de sugestões

Esta será a superfície central do produto e o ponto de maior cuidado de UX.

Desktop:

```text
┌──────────────────────────────────────────┬───────────────────────────────┐
│ Folha original do briefing               │ Margem de comentários         │
│                                          │                               │
│ Texto em Newsreader, largura de leitura  │ [Entregável] ...              │
│ Trechos de origem com marca-texto        │ [Requisito] ...               │
│                                          │ [Dúvida] ...                  │
│                                          │ [Risco] ...                   │
├──────────────────────────────────────────┴───────────────────────────────┤
│ Aprovadas · Pendentes · Rejeitadas          [Criar N tarefas]             │
└─────────────────────────────────────────────────────────────────────────┘
```

- Cada sugestão mantém ligação com seu trecho de origem.
- Foco/hover no cartão realça o trecho correspondente; o foco por teclado deve produzir a mesma relação.
- Ações existentes: aprovar, editar e rejeitar; a conversão informa quantas tarefas serão criadas.
- Dúvidas podem ser copiadas para envio ao cliente; riscos permanecem destacados e não viram tarefas automaticamente.
- Em telas estreitas, a fonte e as sugestões passam a áreas/abas separadas; tocar no trecho abre o cartão numa bottom sheet.
- Nenhuma sugestão da demonstração ou da análise mock será apresentada como verdade validada.

### 3.4. Tarefas, dashboard e exportação

- **Tarefas:** lista como visão rápida e quadro por status como alternativa; linhas leves, glifos de status/prioridade, título e origem. Arrastar continua disponível, mas menu e teclado oferecem alternativa equivalente. Detalhes em painel lateral.
- **Dashboard do projeto:** uma barra segmentada por status; gráfico burn-up apenas se a série puder ser derivada dos registros reais; matriz prioridade × status com alternativa tabular. Não criar métricas artificiais nem repetir cartões estatísticos.
- **Histórico:** linha do tempo textual com filtros já suportados e linguagem que explique a mudança.
- **Exportação:** prévia de documento A4 com tipografia do produto, cópia/Markdown/download e impressão com cabeçalho e quebras de página.

## 4. Revisão contra padrões genéricos

| Padrão a evitar | Decisão específica para BriefForge |
|---|---|
| Índigo/roxo, Inter e cartões SaaS iguais | Cobalto, Bricolage Grotesque e Newsreader; painéis com funções e hierarquias diferentes |
| Marcações coloridas usadas como enfeite | Cada marca-texto codifica um tipo de informação e mantém o significado em todas as superfícies |
| Hero de número grande e gradiente | Demonstração do conteúdo real sendo interpretado e organizado |
| Grade de cards estatísticos no dashboard | Barra segmentada, burn-up e matriz com alternativa em tabela |
| Kanban obrigatório | Lista e quadro, escolhidos conforme a tarefa e densidade |
| IA como chatbot genérico | Proposta estruturada ligada ao trecho de origem e sujeita à aprovação humana |
| Cor como único indicador | Glifos, rótulos, bordas e tratamentos redundantes |
| Animação em cada seção | Uma sequência orquestrada no hero; demais animações respondem a ações |
| Depoimentos, métricas e logos inventados | Conteúdo de demonstração declarado e fatos técnicos confirmados no repositório |

## 5. Movimento, responsividade e acessibilidade

- Uma única sequência automática no hero, com duração aproximada de 4,5 s: entrada estática, marcação progressiva do texto e aparecimento dos itens estruturados.
- Demais movimentos só respondem a uma interação e deixam claro o que mudou; duração prevista entre 120 e 240 ms.
- `prefers-reduced-motion`: mostrar diretamente o estado final, sem animação de posição.
- Cobertura de viewport: 360, 375, 768, 1280 e 1920 px; também verificar zoom e conteúdo longo.
- WCAG 2.2 AA como referência: 4,5:1 para texto normal e 3:1 para componentes/elementos gráficos; foco visível; teclado; semântica; labels; nomes acessíveis; `aria-live` em conclusão de análise e aprovação; alvos de toque de 44 px.
- Tabelas, drag-and-drop, gráficos e drawers terão alternativas utilizáveis por teclado e leitores de tela.

## 6. Dependências e restrições técnicas

Dependências já presentes que podem sustentar a implementação: Radix UI, Lucide React, React Hook Form, Zod, Zustand e dnd-kit. O projeto atual não declara `framer-motion`, `cmdk`, `recharts`, Bricolage Grotesque ou Newsreader no `package.json`. A Etapa 2 deve decidir caso a caso se cada dependência é realmente necessária; não instalar bibliotecas por conveniência.

A referência do PDF sugere Recharts e Framer Motion. Para preservar simplicidade, efeitos que podem ser executados em CSS não exigirão uma biblioteca de animação; drag-and-drop continuará usando dnd-kit já instalado. Uma paleta de comandos só será adicionada com suporte real à busca/rotas existentes.

## 7. Sequência de execução proposta

Após a validação deste documento:

1. Tokens, fontes, temas e componentes-base.
2. Landing page: hero e sequência orquestrada.
3. Landing page: demais seções.
4. Casca do app, navegação e paleta de comandos.
5. Folha anotada e revisão.
6. Tarefas e histórico.
7. Dashboard e exportação.
8. Estados, texto da interface e microinterações.
9. Responsividade, acessibilidade, desempenho, capturas e autocrítica.
10. README com imagens e documentação final.

A ordem poderá mudar somente por dependência técnica observada. Ao final de cada etapa haverá resumo e pausa para validação, conforme o prompt.

## 8. Validação pendente antes de codificar

- [ ] Aprovar o conceito marca-texto e a tipografia de duas vozes.
- [ ] Aprovar a paleta especificada no PDF e sua adaptação clara/escura.
- [ ] Aprovar a landing page pública como nova superfície, mantendo o app atual.
- [ ] Confirmar a abordagem neutra para o tipo `funcionalidade`, sem criar uma nova cor semântica.
- [ ] Confirmar que o site técnico apresentará o estado atual como protótipo local, sem afirmar SQLite/backend/IA real.

**Nenhuma interface foi alterada nesta etapa.** A implementação começa somente depois da validação desta direção.


## 9. Design System — Etapa 2 implementada

A Etapa 1 foi aprovada sem ressalvas. O tipo `funcionalidade` permanece neutro e não recebe uma nova cor semântica.

### Tokens e temas

- Tokens centralizados em `src/styles/tokens.css` para papel, folha, tinta, cobalto, alerta e os cinco marca-textos aprovados.
- Tema escuro baseado nos valores aprovados; os marca-textos mantêm os mesmos matizes e usam `--marker-ink` como texto.
- Aliases de Tailwind e dos componentes existentes foram preservados para reduzir migração desnecessária.
- Raios de 3 px, 8 px e 14 px representam marca-textos, controles e painéis.
- A sombra do sistema fica reservada às superfícies flutuantes. Controles e painéis comuns não recebem elevação.
- Escala de espaçamento, camadas, timings, larguras e medida de leitura estão centralizadas.

### Tipografia e ativos locais

- Bricolage Grotesque variável para interface, títulos, números e marca.
- Newsreader variável regular e itálica para a voz do cliente e textos longos.
- JetBrains Mono permanece disponível por meio de `--font-code` para código/JSON; os consumidores antigos de `font-mono` foram alinhados à voz de interface.
- As fontes variáveis são servidas localmente em `public/fonts/`, com `font-display: swap` e preload das duas famílias críticas.
- Os arquivos de licença SIL OFL 1.1 acompanham os arquivos das fontes.

### Componentes-base

- Botões e campos usam o raio de controle e os aliases existentes do Tailwind.
- Painéis usam o raio de 14 px por meio de `rounded-lg` remapeado.
- Badges usam raio de 3 px em vez de cápsulas universais.
- `HighlightTag` codifica categorias e `HighlightMark` aplica a mesma gramática visual a trechos inline do briefing. `funcionalidade` usa o estado neutro.
- `TaskStatusGlyph` desenha estados pendente, andamento, revisão e concluído.
- `TaskPriorityGlyph` desenha uma a quatro barras; prioridade crítica recebe sinal de exclamação e cor de alerta.
- A marca usa o símbolo de duas linhas, com a segunda destacada em amarelo.

### Arquivos importantes

- `src/styles/tokens.css`
- `src/index.css`
- `src/app/theme.tsx`
- `src/components/brand-mark.tsx`
- `src/components/domain-badges.tsx`
- `src/components/domain-glyphs.tsx`
- `src/components/ui/highlight-tag.tsx`
- `src/components/ui/highlight-mark.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/badge.tsx`
- `index.html`
- `public/fonts/`

### Validação desta etapa

As alterações foram gravadas na branch `design/phase-2-design-system`. O ambiente utilizado não disponibiliza um checkout local executável do repositório nem um terminal de projeto. Por isso, `npm run build`, `npm run lint`, testes, axe, Lighthouse e capturas Playwright ainda não foram executados; não há alegação de que esses verificadores passaram. A Etapa 3 deverá começar depois da validação desta etapa.
