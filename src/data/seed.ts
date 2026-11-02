import type {
  Client,
  Project,
  Suggestion,
  Task,
  HistoryEvent,
} from '@/store'

export const seedClients: Omit<Client, 'id' | 'projectCount' | 'createdAt'>[] = [
  {
    name: 'Doce Massa Confeitaria',
    email: 'contato@docemassa.com.br',
    phone: '(11) 3456-7890',
  },
  {
    name: 'Clínica Sorriso Odontológico',
    email: 'contato@clinicasorriso.com.br',
    phone: '(11) 2345-6789',
  },
  {
    name: 'LogiFast Startup de Logística',
    email: 'contato@logifast.com.br',
    phone: '(11) 9876-5432',
  },
]

export const seedProjects: Omit<Project, 'id' | 'createdAt'>[] = [
  {
    clientId: 'cliente-1',
    name: 'Site e Cardápio Online',
    status: 'ativo',
  },
  {
    clientId: 'cliente-2',
    name: 'Portal de Agendamento',
    status: 'ativo',
  },
  {
    clientId: 'cliente-3',
    name: 'App de Rastreamento de Entregas',
    status: 'ativo',
  },
  {
    clientId: 'cliente-1',
    name: 'Loja Virtual de Bolos',
    status: 'pausado',
  },
]

export const BRIEFING_EXEMPLO = `Oi, pessoal! Preciso de um site urgente para minha confeitaria. Quero um cardápio online onde os clientes possam ver os bolos e doces, e pedir entrega. Também quero pagamento por Pix, tipo um Instagram integrado pra postar fotos dos produtos. O prazo é curto, preciso entregar rapidinho. O orçamento é limitado, não posso gastar muito. Ah, e precisa ter um formulário de contato e área administrativa pra eu conseguir atualizar os preços. Obrigado!`

export const seedSuggestions: Omit<
  Suggestion,
  'id' | 'projectId' | 'status'
>[] = [
  {
    type: 'funcionalidade',
    title: 'Cardápio online com fotos',
    description: 'Página para exibir bolos e doces com preços e descrições.',
    sourceQuote:
      'Quero um cardápio online onde os clientes possam ver os bolos e doces',
    priority: 'alta',
  },
  {
    type: 'funcionalidade',
    title: 'Formulário de contato',
    description: 'Campo para clientes entrarem em contato com a confeitaria.',
    sourceQuote: 'precisa ter um formulário de contato',
    priority: 'media',
  },
  {
    type: 'requisito',
    title: 'Pagamento por Pix',
    description: 'Integração com QR Code Pix para pagamento de pedidos.',
    sourceQuote: 'também quero pagamento por Pix',
    priority: 'alta',
  },
  {
    type: 'requisito',
    title: 'Área administrativa de preços',
    description: 'Painel para atualizar preços dos produtos.',
    sourceQuote: 'área administrativa pra eu conseguir atualizar os preços',
    priority: 'media',
  },
  {
    type: 'duvida',
    title: 'Prazo de entrega',
    description: 'Qual é o prazo máximo para entrega dos pedidos?',
    sourceQuote: 'O prazo é curto, preciso entregar rapidinho',
    priority: 'media',
  },
  {
    type: 'duvida',
    title: 'Orçamento disponível',
    description: 'Qual o valor máximo que o cliente pode investir?',
    sourceQuote: 'O orçamento é limitado, não posso gastar muito',
    priority: 'alta',
  },
  {
    type: 'risco',
    title: 'Integração com Instagram',
    description:
      'A API do Instagram pode ter limitações para exibição automática de fotos.',
    sourceQuote: 'tipo um Instagram integrado pra postar fotos dos produtos',
    priority: 'alta',
  },
  {
    type: 'entregavel',
    title: 'Site institucional responsivo',
    description: 'Site completo com cardápio, contato e área admin.',
    sourceQuote: 'Preciso de um site urgente para minha confeitaria',
    priority: 'alta',
  },
  {
    type: 'entregavel',
    title: 'QR Code Pix impressível',
    description: 'Gerar QR Code para pagamento presencial ou delivery.',
    sourceQuote: 'também quero pagamento por Pix',
    priority: 'media',
  },
]

export const seedTasks: Omit<Task, 'id' | 'createdAt'>[] = [
  {
    projectId: 'projeto-1',
    title: 'Desenvolver cardápio online',
    description: 'Criar páginas de produtos com fotos e preços.',
    status: 'andamento',
    priority: 'alta',
  },
  {
    projectId: 'projeto-1',
    title: 'Integrar pagamento Pix',
    description: 'Implementar geração de QR Code Pix.',
    status: 'pendente',
    priority: 'alta',
  },
  {
    projectId: 'projeto-2',
    title: 'Portal de agendamento',
    description: 'Sistema para pacientes agendarem consultas.',
    status: 'pendente',
    priority: 'critica',
  },
  {
    projectId: 'projeto-2',
    title: 'Prontuário digital',
    description: 'Área para médicos inserirem dados do atendimento.',
    status: 'revisao',
    priority: 'alta',
  },
  {
    projectId: 'projeto-3',
    title: 'Rastreamento de entregas',
    description: 'App para motoristas atualizarem status da entrega.',
    status: 'concluido',
    priority: 'critica',
  },
  {
    projectId: 'projeto-3',
    title: 'Notificação ao cliente',
    description: 'Enviar SMS quando entrega sair para distribuição.',
    status: 'pendente',
    priority: 'media',
  },
  {
    projectId: 'projeto-1',
    title: 'Área administrativa',
    description: 'Painel para atualizar preços e produtos.',
    status: 'pendente',
    priority: 'media',
  },
  {
    projectId: 'projeto-2',
    title: 'Layout responsivo',
    description: 'Adaptar portal para celulares.',
    status: 'concluido',
    priority: 'baixa',
  },
  {
    projectId: 'projeto-3',
    title: 'Relatório de entregas',
    description: 'Gerar relatórios semanais de desempenho.',
    status: 'andamento',
    priority: 'baixa',
  },
  {
    projectId: 'projeto-1',
    title: 'Formulário de contato',
    description: 'Campo para clientes enviarem mensagens.',
    status: 'concluido',
    priority: 'baixa',
  },
]

export const seedHistory: Omit<HistoryEvent, 'id' | 'projectId' | 'createdAt'>[] = [
  {
    type: 'criacao',
    title: 'Projeto criado',
    description: 'Projeto "Site e Cardápio Online" criado para Doce Massa Confeitaria.',
  },
  {
    type: 'criacao',
    title: 'Briefing salvo',
    description: 'Texto do briefing salvo automaticamente como rascunho.',
  },
  {
    type: 'edicao',
    title: 'Briefing editado',
    description: 'Usuário ajustou o texto do briefing adicionando detalhes de Pix.',
  },
  {
    type: 'aprovacao',
    title: 'Sugestão aprovada',
    description: 'Funcionalidade "Cardápio online com fotos" aprovada.',
  },
  {
    type: 'rejeicao',
    title: 'Sugestão rejeitada',
    description: 'Funcionalidade "Chat ao vivo" rejeitada pelo usuário.',
  },
  {
    type: 'conversao',
    title: 'Tarefa criada',
    description: 'Tarefa "Desenvolver cardápio online" convertida de sugestão aprovada.',
  },
  {
    type: 'alteracao',
    title: 'Prioridade alterada',
    description: 'Prioridade da tarefa "Integrar pagamento Pix" alterada de Média para Alta.',
  },
  {
    type: 'alteracao',
    title: 'Status alterado',
    description: 'Status da tarefa "Portal de agendamento" alterado de Pendente para Em andamento.',
  },
  {
    type: 'aprovacao',
    title: 'Sugestão aprovada',
    description: 'Requisito "Pagamento por Pix" aprovado.',
  },
  {
    type: 'conversao',
    title: 'Tarefa criada',
    description: 'Tarefa "Integrar pagamento Pix" convertida de sugestão aprovada.',
  },
  {
    type: 'criacao',
    title: 'Projeto criado',
    description: 'Projeto "Portal de Agendamento" criado para Clínica Sorriso.',
  },
  {
    type: 'aprovacao',
    title: 'Sugestão aprovada',
    description: 'Requisito "Prontuário digital" aprovado.',
  },
  {
    type: 'conversao',
    title: 'Tarefa criada',
    description: 'Tarefa "Prontuário digital" convertida de sugestão aprovada.',
  },
  {
    type: 'alteracao',
    title: 'Status alterado',
    description: 'Status da tarefa "Rastreamento de entregas" alterado para Concluído.',
  },
  {
    type: 'rejeicao',
    title: 'Sugestão rejeitada',
    description: 'Dúvida "Integração com ERP" rejeitada.',
  },
]
