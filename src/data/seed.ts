import type {
  Client,
  HistoryEvent,
  Project,
  Suggestion,
  Task,
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

export const BRIEFING_EXEMPLO = `Oi, pessoal! Preciso de um site urgente para minha confeitaria. Quero um cardápio online onde os clientes possam ver os bolos e doces, e pedir entrega. Também quero pagamento por Pix, tipo um Instagram integrado pra postar fotos dos produtos. O prazo é curto, preciso entregar rapidinho. O orçamento é limitado, não posso gastar muito. Ah, e precisa ter um formulário de contato e área administrativa pra eu conseguir atualizar os preços. Obrigado!`

export const BRIEFING_CLINICA = `Olá! A Clínica Sorriso precisa de um portal para os pacientes agendarem consultas online. Hoje a recepção faz tudo por telefone e WhatsApp, e isso toma muito tempo. Queremos mostrar horários disponíveis por profissional e permitir remarcar ou cancelar. Também precisamos de prontuário digital para os dentistas registrarem o atendimento, com acesso restrito. A clínica atende por convênios e particular, então o portal precisa lidar com essas regras. Temos duas unidades. Precisamos seguir a LGPD porque vamos tratar dados sensíveis de saúde. A confirmação por WhatsApp seria importante para reduzir faltas. O prazo para lançar é de três meses e o orçamento ainda está em aprovação.`

export const BRIEFING_LOGIFAST = `A LogiFast precisa de um app para acompanhar entregas em tempo real. Os motoristas usam Android e muitas vezes ficam em regiões com internet instável, então o app precisa funcionar offline e sincronizar depois. O cliente final quer receber um SMS quando a entrega sair para distribuição. A central precisa ver o status de cada entrega e gerar relatórios semanais por motorista e rota. Também precisamos integrar com o ERP que já usamos para faturas. A cobertura de rede é uma preocupação. Temos dados de geolocalização e precisamos tratar isso conforme a LGPD.`

export interface SeedProject
  extends Omit<Project, 'id' | 'createdAt' | 'clientId'> {
  projectIndex: number
  createdDaysAgo: number
}

export const seedProjects: SeedProject[] = [
  {
    projectIndex: 0,
    name: 'Site e Cardápio Online',
    status: 'ativo',
    briefingText: BRIEFING_EXEMPLO,
    createdDaysAgo: 30,
  },
  {
    projectIndex: 1,
    name: 'Portal de Agendamento',
    status: 'ativo',
    briefingText: BRIEFING_CLINICA,
    createdDaysAgo: 28,
  },
  {
    projectIndex: 2,
    name: 'App de Rastreamento de Entregas',
    status: 'ativo',
    briefingText: BRIEFING_LOGIFAST,
    createdDaysAgo: 21,
  },
  {
    projectIndex: 3,
    name: 'Loja Virtual de Bolos',
    status: 'pausado',
    createdDaysAgo: 12,
  },
]

export interface SeedSuggestion
  extends Omit<Suggestion, 'id' | 'projectId' | 'status'> {
  projectIndex: number
  status?: Suggestion['status']
  decidedDaysAgo?: number
}

export const seedSuggestions: SeedSuggestion[] = [
  // Doce Massa — Site e Cardápio Online
  {
    projectIndex: 0,
    type: 'funcionalidade',
    title: 'Cardápio online com fotos',
    description: 'Página para exibir bolos e doces com preços e descrições.',
    sourceQuote:
      'Quero um cardápio online onde os clientes possam ver os bolos e doces',
    priority: 'alta',
    status: 'convertida',
    decidedDaysAgo: 26,
  },
  {
    projectIndex: 0,
    type: 'funcionalidade',
    title: 'Formulário de contato',
    description: 'Campo para clientes entrarem em contato com a confeitaria.',
    sourceQuote: 'precisa ter um formulário de contato',
    priority: 'media',
    status: 'convertida',
    decidedDaysAgo: 26,
  },
  {
    projectIndex: 0,
    type: 'requisito',
    title: 'Pagamento por Pix',
    description: 'Integração com QR Code Pix para pagamento de pedidos.',
    sourceQuote: 'Também quero pagamento por Pix',
    priority: 'alta',
    status: 'convertida',
    decidedDaysAgo: 24,
  },
  {
    projectIndex: 0,
    type: 'requisito',
    title: 'Área administrativa de preços',
    description: 'Painel para atualizar preços dos produtos.',
    sourceQuote: 'área administrativa pra eu conseguir atualizar os preços',
    priority: 'media',
    status: 'convertida',
    decidedDaysAgo: 22,
  },
  {
    projectIndex: 0,
    type: 'duvida',
    title: 'Prazo de entrega',
    description: 'Qual é o prazo máximo para entrega dos pedidos?',
    sourceQuote: 'O prazo é curto, preciso entregar rapidinho',
    priority: 'media',
    status: 'pendente',
  },
  {
    projectIndex: 0,
    type: 'duvida',
    title: 'Orçamento disponível',
    description: 'Qual o valor máximo que o cliente pode investir?',
    sourceQuote: 'O orçamento é limitado, não posso gastar muito',
    priority: 'alta',
    status: 'pendente',
  },
  {
    projectIndex: 0,
    type: 'risco',
    title: 'Integração com Instagram',
    description:
      'A API do Instagram pode ter limitações para exibição automática de fotos.',
    sourceQuote: 'tipo um Instagram integrado pra postar fotos dos produtos',
    priority: 'alta',
    status: 'pendente',
  },
  {
    projectIndex: 0,
    type: 'entregavel',
    title: 'Site institucional responsivo',
    description: 'Site completo com cardápio, contato e área admin.',
    sourceQuote: 'Preciso de um site urgente para minha confeitaria',
    priority: 'alta',
    status: 'aprovada',
    decidedDaysAgo: 25,
  },
  {
    projectIndex: 0,
    type: 'entregavel',
    title: 'QR Code Pix imprimível',
    description: 'Gerar QR Code para pagamento presencial ou delivery.',
    sourceQuote: 'Também quero pagamento por Pix',
    priority: 'media',
    status: 'aprovada',
    decidedDaysAgo: 25,
  },
  {
    projectIndex: 0,
    type: 'funcionalidade',
    title: 'Feed integrado do Instagram',
    description: 'Exibir automaticamente as últimas fotos do Instagram no site.',
    sourceQuote: 'tipo um Instagram integrado pra postar fotos dos produtos',
    priority: 'baixa',
    status: 'rejeitada',
    decidedDaysAgo: 23,
  },

  // Clínica Sorriso — Portal de Agendamento
  {
    projectIndex: 1,
    type: 'funcionalidade',
    title: 'Agendamento online',
    description:
      'Pacientes escolhem profissional, horário e unidade sem ligar para a recepção.',
    sourceQuote: 'precisa de um portal para os pacientes agendarem consultas online',
    priority: 'critica',
    status: 'convertida',
    decidedDaysAgo: 20,
  },
  {
    projectIndex: 1,
    type: 'requisito',
    title: 'Prontuário digital',
    description: 'Registro do atendimento vinculado ao paciente e ao profissional.',
    sourceQuote: 'Também precisamos de prontuário digital',
    priority: 'alta',
    status: 'convertida',
    decidedDaysAgo: 18,
  },
  {
    projectIndex: 1,
    type: 'entregavel',
    title: 'Portal responsivo para pacientes',
    description: 'Agendamento utilizável em celular, tablet e desktop.',
    sourceQuote: 'portal para os pacientes agendarem consultas online',
    priority: 'baixa',
    status: 'convertida',
    decidedDaysAgo: 15,
  },
  {
    projectIndex: 1,
    type: 'requisito',
    title: 'Conformidade com a LGPD',
    description:
      'Controle de acesso, registro de consentimento e trilha de auditoria para dados de saúde.',
    sourceQuote: 'Precisamos seguir a LGPD porque vamos tratar dados sensíveis de saúde',
    priority: 'critica',
    status: 'aprovada',
    decidedDaysAgo: 17,
  },
  {
    projectIndex: 1,
    type: 'risco',
    title: 'Exposição de dados sensíveis',
    description:
      'Prontuários e dados de contato exigem isolamento por perfil e política de retenção.',
    sourceQuote: 'dados sensíveis de saúde',
    priority: 'critica',
    status: 'aprovada',
    decidedDaysAgo: 17,
  },
  {
    projectIndex: 1,
    type: 'funcionalidade',
    title: 'Painel da recepção',
    description:
      'Visão diária da agenda por unidade, com remarcação e bloqueio de horários.',
    sourceQuote: 'Hoje a recepção faz tudo por telefone e WhatsApp',
    priority: 'alta',
    status: 'aprovada',
    decidedDaysAgo: 16,
  },
  {
    projectIndex: 1,
    type: 'duvida',
    title: 'Regras de convênios',
    description: 'Quais convênios precisam ser aceitos no agendamento online?',
    sourceQuote: 'A clínica atende por convênios e particular',
    priority: 'alta',
    status: 'pendente',
  },
  {
    projectIndex: 1,
    type: 'duvida',
    title: 'Confirmação por WhatsApp',
    description:
      'A confirmação por WhatsApp depende de um provedor oficial. Qual canal deve ser usado?',
    sourceQuote: 'A confirmação por WhatsApp seria importante para reduzir faltas',
    priority: 'media',
    status: 'pendente',
  },

  // LogiFast — App de Rastreamento
  {
    projectIndex: 2,
    type: 'funcionalidade',
    title: 'Rastreamento em tempo real',
    description:
      'Cliente e central acompanham a posição e o status de cada entrega.',
    sourceQuote: 'precisa de um app para acompanhar entregas em tempo real',
    priority: 'critica',
    status: 'convertida',
    decidedDaysAgo: 12,
  },
  {
    projectIndex: 2,
    type: 'funcionalidade',
    title: 'Notificação por SMS',
    description:
      'Aviso automático quando a entrega sair para distribuição.',
    sourceQuote: 'O cliente final quer receber um SMS quando a entrega sair para distribuição',
    priority: 'media',
    status: 'convertida',
    decidedDaysAgo: 11,
  },
  {
    projectIndex: 2,
    type: 'entregavel',
    title: 'Relatórios de entrega',
    description: 'Relatórios semanais por motorista e rota.',
    sourceQuote: 'gerar relatórios semanais por motorista e rota',
    priority: 'baixa',
    status: 'convertida',
    decidedDaysAgo: 10,
  },
  {
    projectIndex: 2,
    type: 'requisito',
    title: 'Funcionamento offline',
    description:
      'O app registra a entrega sem conexão e sincroniza quando a rede voltar.',
    sourceQuote: 'o app precisa funcionar offline e sincronizar depois',
    priority: 'alta',
    status: 'aprovada',
    decidedDaysAgo: 9,
  },
  {
    projectIndex: 2,
    type: 'requisito',
    title: 'Aplicativo Android',
    description: 'Aplicativo nativo ou instalável para os motoristas.',
    sourceQuote: 'Os motoristas usam Android',
    priority: 'alta',
    status: 'aprovada',
    decidedDaysAgo: 9,
  },
  {
    projectIndex: 2,
    type: 'duvida',
    title: 'Integração com o ERP',
    description:
      'A integração com faturas do ERP entra neste ciclo ou fica para uma segunda fase?',
    sourceQuote: 'precisamos integrar com o ERP que já usamos para faturas',
    priority: 'media',
    status: 'rejeitada',
    decidedDaysAgo: 8,
  },
  {
    projectIndex: 2,
    type: 'risco',
    title: 'Cobertura de rede',
    description:
      'Regiões com internet instável podem atrasar a sincronização e a visibilidade da entrega.',
    sourceQuote: 'muitas vezes ficam em regiões com internet instável',
    priority: 'alta',
    status: 'pendente',
  },
  {
    projectIndex: 2,
    type: 'risco',
    title: 'Geolocalização e LGPD',
    description:
      'O rastreamento contínuo exige base legal, retenção limitada e transparência com o motorista.',
    sourceQuote: 'Temos dados de geolocalização e precisamos tratar isso conforme a LGPD',
    priority: 'critica',
    status: 'pendente',
  },
]

export interface SeedTask extends Omit<Task, 'id' | 'projectId' | 'createdAt'> {
  projectIndex: number
  createdDaysAgo: number
  completedDaysAgo?: number
  suggestionTitle?: string
}

export const seedTasks: SeedTask[] = [
  {
    projectIndex: 0,
    title: 'Desenvolver cardápio online',
    description: 'Criar páginas de produtos com fotos e preços.',
    status: 'andamento',
    priority: 'alta',
    createdDaysAgo: 25,
    suggestionTitle: 'Cardápio online com fotos',
  },
  {
    projectIndex: 0,
    title: 'Integrar pagamento Pix',
    description: 'Implementar geração de QR Code Pix.',
    status: 'pendente',
    priority: 'alta',
    createdDaysAgo: 24,
    suggestionTitle: 'Pagamento por Pix',
  },
  {
    projectIndex: 0,
    title: 'Área administrativa',
    description: 'Painel para atualizar preços e produtos.',
    status: 'pendente',
    priority: 'media',
    createdDaysAgo: 22,
    suggestionTitle: 'Área administrativa de preços',
  },
  {
    projectIndex: 0,
    title: 'Formulário de contato',
    description: 'Campo para clientes enviarem mensagens.',
    status: 'concluido',
    priority: 'baixa',
    createdDaysAgo: 25,
    completedDaysAgo: 10,
    suggestionTitle: 'Formulário de contato',
  },
  {
    projectIndex: 1,
    title: 'Portal de agendamento',
    description: 'Sistema para pacientes agendarem consultas.',
    status: 'pendente',
    priority: 'critica',
    createdDaysAgo: 20,
    suggestionTitle: 'Agendamento online',
  },
  {
    projectIndex: 1,
    title: 'Prontuário digital',
    description: 'Área para dentistas registrarem o atendimento.',
    status: 'revisao',
    priority: 'alta',
    createdDaysAgo: 18,
    suggestionTitle: 'Prontuário digital',
  },
  {
    projectIndex: 1,
    title: 'Layout responsivo',
    description: 'Adaptar o portal para celulares e tablets.',
    status: 'concluido',
    priority: 'baixa',
    createdDaysAgo: 15,
    completedDaysAgo: 6,
    suggestionTitle: 'Portal responsivo para pacientes',
  },
  {
    projectIndex: 2,
    title: 'Rastreamento de entregas',
    description: 'App para motoristas atualizarem o status da entrega.',
    status: 'concluido',
    priority: 'critica',
    createdDaysAgo: 12,
    completedDaysAgo: 4,
    suggestionTitle: 'Rastreamento em tempo real',
  },
  {
    projectIndex: 2,
    title: 'Notificação ao cliente',
    description: 'Enviar SMS quando a entrega sair para distribuição.',
    status: 'pendente',
    priority: 'media',
    createdDaysAgo: 11,
    suggestionTitle: 'Notificação por SMS',
  },
  {
    projectIndex: 2,
    title: 'Relatório de entregas',
    description: 'Gerar relatórios semanais de desempenho.',
    status: 'andamento',
    priority: 'baixa',
    createdDaysAgo: 10,
    suggestionTitle: 'Relatórios de entrega',
  },
]

export interface SeedHistoryEvent
  extends Omit<HistoryEvent, 'id' | 'projectId' | 'createdAt'> {
  projectIndex: number
  daysAgo: number
}

export const seedHistory: SeedHistoryEvent[] = [
  {
    projectIndex: 0,
    daysAgo: 30,
    type: 'criacao',
    title: 'Projeto criado',
    description:
      'Projeto "Site e Cardápio Online" criado para Doce Massa Confeitaria.',
  },
  {
    projectIndex: 0,
    daysAgo: 29,
    type: 'criacao',
    title: 'Briefing registrado',
    description:
      'O briefing da confeitaria foi salvo como rascunho local para análise.',
  },
  {
    projectIndex: 0,
    daysAgo: 27,
    type: 'criacao',
    title: 'Análise simulada concluída',
    description:
      'Dez propostas foram extraídas do briefing e ficaram pendentes de revisão humana.',
  },
  {
    projectIndex: 0,
    daysAgo: 26,
    type: 'aprovacao',
    title: 'Cardápio e formulário aprovados',
    description:
      'As funcionalidades "Cardápio online com fotos" e "Formulário de contato" foram aprovadas.',
  },
  {
    projectIndex: 0,
    daysAgo: 25,
    type: 'conversao',
    title: 'Tarefas do cardápio criadas',
    description:
      'Cardápio online e formulário de contato foram convertidos em tarefas de execução.',
  },
  {
    projectIndex: 0,
    daysAgo: 25,
    type: 'aprovacao',
    title: 'Entregáveis do site aprovados',
    description:
      'O site institucional e o QR Code Pix foram aprovados para o escopo.',
  },
  {
    projectIndex: 0,
    daysAgo: 24,
    type: 'conversao',
    title: 'Tarefa de pagamento Pix criada',
    description:
      'O requisito "Pagamento por Pix" foi convertido em tarefa com prioridade alta.',
  },
  {
    projectIndex: 0,
    daysAgo: 23,
    type: 'rejeicao',
    title: 'Feed do Instagram rejeitado',
    description:
      'A funcionalidade de feed automático foi rejeitada após avaliação das limitações da API. O risco correspondente segue em revisão.',
  },
  {
    projectIndex: 0,
    daysAgo: 22,
    type: 'conversao',
    title: 'Área administrativa convertida',
    description:
      'O requisito de atualização de preços foi convertido em tarefa.',
  },
  {
    projectIndex: 0,
    daysAgo: 20,
    type: 'alteracao',
    title: 'Cardápio em andamento',
    description:
      'A tarefa "Desenvolver cardápio online" passou de pendente para em andamento.',
  },
  {
    projectIndex: 0,
    daysAgo: 10,
    type: 'alteracao',
    title: 'Formulário concluído',
    description:
      'A tarefa "Formulário de contato" foi concluída e o prazo de entrega segue como dúvida aberta.',
  },

  {
    projectIndex: 1,
    daysAgo: 28,
    type: 'criacao',
    title: 'Projeto criado',
    description:
      'Projeto "Portal de Agendamento" criado para Clínica Sorriso Odontológico.',
  },
  {
    projectIndex: 1,
    daysAgo: 27,
    type: 'criacao',
    title: 'Briefing registrado',
    description:
      'O relato da clínica sobre agenda, prontuário e LGPD foi salvo para análise.',
  },
  {
    projectIndex: 1,
    daysAgo: 24,
    type: 'criacao',
    title: 'Análise simulada concluída',
    description:
      'Oito propostas foram geradas para o portal e aguardaram decisão humana.',
  },
  {
    projectIndex: 1,
    daysAgo: 20,
    type: 'conversao',
    title: 'Agendamento convertido em tarefa',
    description:
      'O agendamento online foi aprovado e convertido na tarefa de prioridade crítica.',
  },
  {
    projectIndex: 1,
    daysAgo: 18,
    type: 'conversao',
    title: 'Prontuário convertido em tarefa',
    description:
      'O prontuário digital entrou em execução com acesso restrito por perfil.',
  },
  {
    projectIndex: 1,
    daysAgo: 17,
    type: 'aprovacao',
    title: 'LGPD e risco de dados aprovados',
    description:
      'Os requisitos de conformidade e o risco de exposição de dados sensíveis foram aprovados.',
  },
  {
    projectIndex: 1,
    daysAgo: 16,
    type: 'aprovacao',
    title: 'Painel da recepção aprovado',
    description:
      'A visão da agenda por unidade foi aprovada para reduzir o trabalho manual da recepção.',
  },
  {
    projectIndex: 1,
    daysAgo: 15,
    type: 'conversao',
    title: 'Layout responsivo convertido',
    description:
      'O entregável de portal responsivo foi convertido em tarefa.',
  },
  {
    projectIndex: 1,
    daysAgo: 6,
    type: 'alteracao',
    title: 'Layout responsivo concluído',
    description:
      'A tarefa "Layout responsivo" foi concluída; agendamento e prontuário seguem abertos.',
  },

  {
    projectIndex: 2,
    daysAgo: 21,
    type: 'criacao',
    title: 'Projeto criado',
    description:
      'Projeto "App de Rastreamento de Entregas" criado para LogiFast.',
  },
  {
    projectIndex: 2,
    daysAgo: 20,
    type: 'criacao',
    title: 'Briefing registrado',
    description:
      'O briefing sobre motoristas, offline, SMS e ERP foi salvo para análise.',
  },
  {
    projectIndex: 2,
    daysAgo: 18,
    type: 'criacao',
    title: 'Análise simulada concluída',
    description:
      'Oito propostas foram geradas para o aplicativo e aguardaram revisão.',
  },
  {
    projectIndex: 2,
    daysAgo: 12,
    type: 'conversao',
    title: 'Rastreamento convertido em tarefa',
    description:
      'O rastreamento em tempo real foi aprovado e convertido em tarefa crítica.',
  },
  {
    projectIndex: 2,
    daysAgo: 11,
    type: 'conversao',
    title: 'Notificação SMS convertida',
    description:
      'A notificação ao cliente foi convertida em tarefa de execução.',
  },
  {
    projectIndex: 2,
    daysAgo: 10,
    type: 'conversao',
    title: 'Relatórios convertidos',
    description:
      'O entregável de relatórios semanais foi convertido em tarefa.',
  },
  {
    projectIndex: 2,
    daysAgo: 9,
    type: 'aprovacao',
    title: 'Offline e Android aprovados',
    description:
      'Os requisitos de funcionamento offline e aplicativo Android foram aprovados para o escopo.',
  },
  {
    projectIndex: 2,
    daysAgo: 8,
    type: 'rejeicao',
    title: 'Integração com ERP adiada',
    description:
      'A dúvida sobre integração com o ERP foi rejeitada neste ciclo; a integração fica para uma fase posterior.',
  },
  {
    projectIndex: 2,
    daysAgo: 4,
    type: 'alteracao',
    title: 'Rastreamento concluído',
    description:
      'A tarefa "Rastreamento de entregas" foi concluída. A cobertura de rede segue como risco aberto.',
  },

  {
    projectIndex: 3,
    daysAgo: 12,
    type: 'criacao',
    title: 'Projeto criado',
    description:
      'Projeto "Loja Virtual de Bolos" criado para Doce Massa Confeitaria.',
  },
  {
    projectIndex: 3,
    daysAgo: 11,
    type: 'alteracao',
    title: 'Projeto pausado',
    description:
      'O projeto foi pausado a pedido do cliente antes do briefing. Nenhuma tarefa foi criada.',
  },
]
