/**
 * Representação dos dados cadastrais do morador.
 * Mapeia as colunas da tabela relacional 'public.perfis' sincronizada com auth.users via trigger.
 */
export interface Perfil {
  /** Identificador único do usuário (UUID referenciando auth.users.id) */
  id: string;
  /** Nome completo do morador informado no cadastro */
  nome_completo: string;
  /** Endereço de e-mail do morador */
  email: string;
  /** URL pública da foto de avatar armazenada no bucket do Supabase Storage */
  foto_url?: string | null;
  /** Chave Pix cadastrada para recebimento e acerto de despesas */
  chave_pix?: string | null;
  /** Timestamp de registro inicial do perfil na aplicação */
  criado_em?: string;
  /** Timestamp da última atualização cadastral do morador */
  atualizado_em?: string;
}

/**
 * Representação da tabela 'public.tarefas' no Supabase.
 * Mapeia afazeres domésticos da moradia (rotativas, fixas e emergenciais), atribuição e recompensas.
 */
export interface TarefaDB {
  /** Identificador único da tarefa (UUID) */
  id: string;
  /** Identificador da moradia à qual a tarefa pertence */
  moradia_id: string;
  /** Título descritivo da atividade */
  titulo: string;
  /** Descrição detalhada das orientações da tarefa */
  descricao?: string | null;
  /** Cômodo ou ambiente de execução na casa */
  comodo: string;
  /** Tipologia de rotatividade da tarefa */
  tipo: 'Rotativa' | 'Fixa' | 'Emergencial';
  /** UUID do morador atribuído como responsável (referencia public.perfis.id) */
  responsavel_id: string;
  /** Dados do perfil do responsável obtidos via join */
  responsavel?: {
    id?: string;
    nome_completo?: string | null;
  } | null;
  /** Prazo limite de conclusão (timestamptz) */
  prazo_limite: string;
  /** Quantidade de pontos de experiência (XP) concedidos */
  recompensa_xp: number;
  /** Quantidade de moedas distribuídas */
  recompensa_moedas: number;
  /** Indica se a conclusão requer validação por pares com foto */
  requer_validacao: boolean;
  /** Estado atual da tarefa no banco */
  status: 'pendente' | 'em_validacao' | 'concluida' | 'expirada';
  /** UUID do criador da tarefa (referencia public.perfis.id) */
  criado_por?: string | null;
  /** Timestamp de criação do registro */
  criado_em?: string;
  /** Timestamp da última atualização do registro */
  atualizado_em?: string;
}

/**
 * Representação da tabela 'public.validacoes_tarefa' no Supabase.
 * Registra a auditoria por pares da conclusão de tarefas com foto.
 */
export interface ValidacaoTarefaDB {
  /** Identificador único da validação (UUID) */
  id: string;
  /** Identificador da tarefa validada (referencia public.tarefas.id) */
  tarefa_id: string;
  /** UUID do executor da tarefa (referencia public.perfis.id) */
  executor_id: string;
  /** URL pública da foto comprobatória */
  foto_comprovante_url: string;
  /** Data e hora em que a foto foi registrada */
  data_hora_foto?: string;
  /** UUID do morador avaliador (referencia public.perfis.id) */
  validador_id?: string | null;
  /** Parecer da validação */
  status: 'pendente' | 'aprovada' | 'recusada';
  /** Justificativa informada pelo avaliador em caso de recusa */
  justificativa?: string | null;
  /** Timestamp da avaliação */
  validado_em?: string | null;
  /** Timestamp de registro */
  criado_em?: string;
}

/**
 * Dados agregados para exibição no painel principal (Home Dashboard).
 */
export interface HomeDashboardData {
  /** Nome de exibição do usuário logado */
  userName: string;
  /** Iniciais do usuário para avatar */
  userInitials: string;
  /** Nível de gamificação do usuário */
  userLevel: number;
  /** Nome da república */
  houseName: string;
  /** Saldo monetário líquido na casa */
  balanceAmount: string;
  /** Status do saldo (credor ou devedor) */
  balanceStatus: string;
  /** Detalhe de quem deve ao usuário */
  debtorText?: string;
  /** Valor individual devido */
  debtorAmount?: string;
  /** Nome do líder do ranking */
  leaderName: string;
  /** Pontos de XP do líder */
  leaderXp: number;
}

/**
 * Representação da tabela 'public.moradias' no Supabase.
 */
export interface MoradiaDB {
  /** Identificador único da moradia (UUID) */
  id: string;
  /** Nome da casa ou apartamento */
  nome: string;
  /** Endereço do imóvel */
  endereco: string;
  /** Tipologia do imóvel */
  tipo: 'apartamento' | 'casa';
  /** Quantidade estimada de moradores */
  estimativa_moradores?: number | null;
  /** Código de convite no formato SPLIT-0000 */
  codigo_convite: string;
  /** Nome do ciclo financeiro atual */
  nome_ciclo_atual?: string | null;
  /** UUID do usuário criador */
  criado_por?: string | null;
  criado_em?: string;
  atualizado_em?: string;
}

/** Papel do morador dentro da moradia. */
export type PapelMembro = 'admin' | 'morador';

/** Estado do vínculo do morador com a moradia. */
export type StatusMembro = 'pendente' | 'aprovado' | 'recusado' | 'saiu';

/**
 * Representação da tabela 'public.membros_moradia' no Supabase.
 */
export interface MembroMoradiaDB {
  id: string;
  moradia_id: string;
  usuario_id: string;
  papel: PapelMembro;
  status: StatusMembro;
  nivel: number;
  titulo_nivel: string;
  xp: number;
  moedas: number;
  entrou_em?: string | null;
}

/**
 * Vínculo do usuário logado com uma moradia (membro + dados da moradia).
 */
export interface MinhaMoradia {
  /** Id do registro em membros_moradia */
  membro_id: string;
  moradia_id: string;
  nome: string;
  endereco: string;
  tipo: 'apartamento' | 'casa';
  codigo_convite: string;
  nome_ciclo_atual?: string | null;
  papel: PapelMembro;
  status: StatusMembro;
}

/**
 * Morador ou solicitação, já com os dados do perfil.
 */
export interface MembroMoradia extends MembroMoradiaDB {
  nome: string | null;
  email: string | null;
}

/**
 * Representação da tabela 'public.regras_moradia' no Supabase.
 */
export interface RegraMoradiaDB {
  id: string;
  moradia_id: string;
  /** Posição da regra no estatuto */
  numero_ordem: number;
  titulo: string;
  /** Resumo/destaque da regra */
  destaque?: string | null;
  descricao: string;
  /** Nome do ícone Feather */
  nome_icone?: string | null;
  criado_em?: string;
  atualizado_em?: string;
}

/** Dados de uma regra enviados ao backend (criação e edição). */
export interface RegraInput {
  titulo: string;
  destaque?: string;
  descricao: string;
}

/**
 * Categorias permitidas para recompensas da loja da república.
 */
export type CategoriaRecompensa = 'Folga' | 'Convivência' | 'Bônus';

/**
 * Status de moderação de uma recompensa proposta.
 */
export type StatusAprovacaoRecompensa = 'pendente' | 'aprovada' | 'recusada';

/**
 * Representação da tabela 'public.recompensas_loja' no Supabase.
 */
export interface RecompensaLojaDB {
  /** Identificador único da recompensa (UUID) */
  id: string;
  /** Identificador da moradia proprietária do item */
  moradia_id: string;
  /** Título da recompensa (ex.: 'Isenção da louça') */
  titulo: string;
  /** Subtítulo descritivo breve */
  subtitulo?: string | null;
  /** Categoria da recompensa */
  categoria: CategoriaRecompensa;
  /** Custo em moedas SplitHouse para resgate */
  custo_moedas: number;
  /** Descrição detalhada dos termos e condições */
  descricao?: string | null;
  /** Informação textual de disponibilidade */
  disponibilidade?: string | null;
  /** Limite de resgates por ciclo de moradia */
  limite_por_ciclo?: number;
  /** Nome do ícone representativo (minus-circle, tv, sofa, pizza, etc.) */
  tipo_icone?: string | null;
  /** Se o item está ativo para visualização na loja */
  ativo: boolean;
  /** Status de aprovação comunitária */
  status_aprovacao: StatusAprovacaoRecompensa;
  /** UUID do morador que cadastrou ou propôs o benefício */
  criado_por?: string | null;
  /** Timestamp de cadastro */
  criado_em?: string;
  /** Timestamp de atualização */
  atualizado_em?: string;
}

/**
 * Representação da tabela 'public.resgates_recompensa' no Supabase.
 * Registra o histórico de troca de moedas por benefícios na loja.
 */
export interface ResgateRecompensaDB {
  /** Identificador único do resgate (UUID) */
  id: string;
  /** UUID da recompensa resgatada */
  recompensa_id: string;
  /** UUID da moradia */
  moradia_id: string;
  /** UUID do morador que resgatou */
  usuario_id: string;
  /** Quantidade de moedas debitadas no momento do resgate */
  custo_moedas: number;
  /** Estado de usufruto do benefício */
  status: 'ativo' | 'utilizado' | 'cancelado';
  /** Timestamp da transação de resgate */
  resgatado_em?: string;
}

/**
 * Dados de entrada para criação ou proposição de nova recompensa.
 */
export interface ProposeRewardInput {
  title: string;
  category: CategoriaRecompensa;
  cost: number;
  description: string;
  limit?: string;
  subtitle?: string;
  iconType?: string;
}

/**
 * Parâmetros para transacionar resgate de uma recompensa na loja.
 */
export interface RedeemRewardInput {
  rewardId: string;
  userId: string;
  moradiaId: string;
  cost: number;
  rewardTitle: string;
}

/**
 * Tipos de eventos registrados na central de notificações.
 */
export type TipoNotificacao = 'Cutucada' | 'Validação' | 'Vencimento' | 'Concluída' | 'Recompensa';

/**
 * Representação da tabela 'public.notificacoes' no Supabase.
 */
export interface NotificacaoDB {
  /** Identificador único da notificação (UUID) */
  id: string;
  /** UUID da moradia vinculada */
  moradia_id?: string | null;
  /** UUID do destinatário da notificação */
  usuario_id: string;
  /** UUID do autor da notificação (ex.: quem enviou a cutucada) */
  remetente_id?: string | null;
  /** Tipo visual do alerta */
  tipo: TipoNotificacao;
  /** Categoria para filtros na interface */
  category_filter: 'Validações' | 'Finanças' | 'Cutucadas' | 'Geral';
  /** Título do alerta */
  titulo: string;
  /** Mensagem descritiva */
  descricao: string;
  /** Rótulo do botão de ação rápida */
  action_text?: string | null;
  /** Metadados complementares */
  extra_meta?: string | null;
  /** Sinaliza se exibe ícone de moedas */
  has_coin_icon?: boolean;
  /** Indica se o morador já visualizou o alerta */
  lida: boolean;
  /** Timestamp de envio */
  criado_em?: string;
}

/**
 * Parâmetros para envio de cutucada entre moradores a partir do ranking.
 */
export interface SendNudgeInput {
  targetUserId: string;
  targetName: string;
  senderUserId: string;
  senderName: string;
  moradiaId: string;
}


/**
 * Categorias permitidas para despesas coletivas.
 */
export type CategoriaDespesa = 'Utilidades' | 'Aluguel' | 'Mercado' | 'Limpeza' | 'Outros' | string;

/**
 * Status de quitação da despesa coletiva.
 */
export type StatusDespesa = 'pendente' | 'pago' | 'parcial' | 'recorrente';

/**
 * Modalidades de rateio de despesa.
 */
export type TipoDivisaoDespesa = 'igualitaria' | 'porcentagem' | 'fixo';

/**
 * Representação da tabela 'public.despesas' no Supabase.
 */
export interface DespesaDB {
  /** Identificador único da despesa (UUID) */
  id: string;
  /** UUID da moradia associada */
  moradia_id: string;
  /** Título ou descrição resumida da despesa */
  titulo: string;
  /** Categoria da conta (ex.: Utilidades, Mercado, Aluguel) */
  categoria: CategoriaDespesa;
  /** Valor financeiro total da fatura */
  valor_total: number;
  /** Data limite de pagamento (YYYY-MM-DD) */
  data_vencimento?: string | null;
  /** Situação atual do pagamento da despesa */
  status: StatusDespesa;
  /** Modalidade de rateio adotada */
  tipo_divisao: TipoDivisaoDespesa;
  /** UUID do morador que arcou inicialmente com a despesa */
  pagador_id: string;
  /** URL pública do anexo da fatura ou nota fiscal */
  comprovante_url?: string | null;
  /** Timestamp de registro */
  criado_em?: string;
  /** Timestamp da última atualização */
  atualizado_em?: string;
}

/**
 * Representação da tabela 'public.rateios_despesa' no Supabase.
 * Registra a fração devida por cada membro na despesa coletiva.
 */
export interface RateioDespesaDB {
  /** Identificador único do rateio (UUID) */
  id: string;
  /** UUID da despesa de referência */
  despesa_id: string;
  /** UUID do morador devedor */
  usuario_id: string;
  /** Valor monetário proporcional devido por este morador */
  valor_parte: number;
  /** Estado de quitação da parte do morador */
  status: 'pendente' | 'pago';
  /** Timestamp de liquidação da parte */
  pago_em?: string | null;
}

/**
 * Representação da tabela 'public.pagamentos_acerto' no Supabase.
 * Registra transferências e acertos bilaterais entre moradores.
 */
export interface PagamentoAcertoDB {
  /** Identificador único da transferência (UUID) */
  id: string;
  /** UUID da moradia */
  moradia_id: string;
  /** UUID do morador pagador */
  devedor_id: string;
  /** UUID do morador recebedor */
  credor_id: string;
  /** Valor monetário transferido */
  valor: number;
  /** Estado de auditoria e validação pelo credor */
  status: 'aguardando_aprovacao' | 'confirmado' | 'rejeitado';
  /** URL pública do comprovante anexado */
  comprovante_url?: string | null;
  /** Método de liquidação utilizado (ex.: pix, dinheiro) */
  metodo_pagamento: string;
  /** Timestamp de confirmação pelo recebedor */
  confirmado_em?: string | null;
  /** Timestamp de criação do registro */
  criado_em?: string;
}

/**
 * Dados de entrada para o cadastro de uma nova despesa coletiva.
 */
export interface CreateExpenseInput {
  moradiaId: string;
  titulo: string;
  categoria: CategoriaDespesa;
  valorTotal: number;
  dataVencimento?: string | null;
  tipoDivisao?: TipoDivisaoDespesa;
  pagadorId: string;
  comprovanteUrl?: string | null;
}

/**
 * Detalhe de rateio por morador para exibição na tela de detalhes.
 */
export interface ExpenseMemberSplit {
  id: string;
  userId: string;
  name: string;
  initials: string;
  role?: string;
  amount: number;
  isPaid: boolean;
}

/**
 * Modelo consolidado de despesa para exibição em listas e detalhes.
 */
export interface ExpenseDetailsData {
  id: string;
  title: string;
  amount: string;
  rawAmount: number;
  dueDate: string;
  rawDueDate?: string | null;
  categoria: string;
  payerId: string;
  payerName: string;
  receiptUrl?: string | null;
  receiptName?: string;
  status: StatusDespesa;
  members: ExpenseMemberSplit[];
}

/**
 * Item de pendência bilateral para exibição no Acerto de Contas.
 */
export interface DebtBalanceItem {
  id: string;
  debtorId: string;
  debtorName: string;
  debtorInitials: string;
  debtorStatus: string;
  debtAmount: string;
  rawAmount: number;
  refText?: string;
  isSettled?: boolean;
}

/**
 * Dados consolidados para o Relatório Financeiro da moradia.
 */
export interface FinancialReportData {
  totalAmount: string;
  averagePerResident: string;
  history: {
    id: string;
    title: string;
    subtitle: string;
    value: string;
    isIncome?: boolean;
  }[];
}
