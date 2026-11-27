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
 * Resumo do perfil do responsável retornado via join na consulta de tarefas.
 */
export interface TarefaResponsavelResumo {
  /** UUID do morador responsável pela tarefa */
  id?: string;
  /** Nome completo do morador responsável */
  nome_completo?: string | null;
}

/**
 * Representação da tabela 'public.tarefas' no Supabase.
 * Mapeia afazeres domésticos da moradia (rotativas, fixas e emergenciais), atribuição e recompensas.
 */
export interface TarefaDB {
  /** Identificador único da tarefa (UUID) */
  id: string;
  /** Identificador da moradia à qual a tarefa pertence */
  moradia_id: string | null;
  /** Título descritivo da atividade */
  titulo: string;
  /** Descrição detalhada das orientações da tarefa */
  descricao?: string | null;
  /** Cômodo ou ambiente de execução na casa */
  comodo: string;
  /** Tipologia de rotatividade da tarefa */
  tipo: 'Rotativa' | 'Fixa' | 'Emergencial';
  /** UUID do morador atribuído como responsável (referencia auth.users.id) */
  responsavel_id: string | null;
  /** Nome em cache do responsável (esquema legado) */
  responsavel_nome?: string | null;
  /** Dados do perfil do responsável obtidos via consulta em 'perfis' */
  responsavel?: TarefaResponsavelResumo | null;
  /** Texto de prazo amigável (esquema legado) */
  prazo?: string | null;
  /** Prazo limite de conclusão (timestamptz) */
  prazo_limite: string | null;
  /** Quantidade de pontos de experiência (XP) concedidos */
  recompensa_xp: number;
  /** Quantidade de moedas distribuídas */
  recompensa_moedas: number;
  /** Indica se a conclusão requer validação por pares com foto */
  requer_validacao: boolean;
  /** Informações do executor em validação */
  executor_info?: string | null;
  /** Estado atual da tarefa no banco */
  status: 'pendente' | 'em_validacao' | 'concluida' | 'expirada' | 'Pendente' | 'Concluída' | 'Aguardando validação';
  /** UUID do criador da tarefa (referencia auth.users.id) */
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
  /** Timestamp de criação do registro da moradia */
  criado_em?: string;
  /** Timestamp da última atualização do registro da moradia */
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
  /** Identificador único do vínculo de membro (UUID) */
  id: string;
  /** UUID da moradia vinculada */
  moradia_id: string;
  /** UUID do usuário morador (referencia public.perfis.id) */
  usuario_id: string;
  /** Papel de permissão do membro dentro da moradia */
  papel: PapelMembro;
  /** Estado atual de aprovação do vínculo na república */
  status: StatusMembro;
  /** Nível de gamificação atual do morador na moradia */
  nivel: number;
  /** Título honorífico correspondente ao nível atual */
  titulo_nivel: string;
  /** Total de pontos de experiência (XP) acumulados na moradia */
  xp: number;
  /** Saldo atual de moedas disponíveis para resgate na loja */
  moedas: number;
  /** Timestamp da aprovação e ingresso efetivo na moradia */
  entrou_em?: string | null;
}

/**
 * Vínculo do usuário logado com uma moradia (membro + dados da moradia).
 */
export interface MinhaMoradia {
  /** Id do registro em membros_moradia */
  membro_id: string;
  /** UUID da moradia associada */
  moradia_id: string;
  /** Nome de exibição da república ou residência */
  nome: string;
  /** Endereço completo do imóvel */
  endereco: string;
  /** Tipologia do imóvel ('apartamento' ou 'casa') */
  tipo: 'apartamento' | 'casa';
  /** Código de convite no formato SPLIT-0000 */
  codigo_convite: string;
  /** Nome descritivo do ciclo financeiro vigente */
  nome_ciclo_atual?: string | null;
  /** Papel exercido pelo usuário logado nesta moradia */
  papel: PapelMembro;
  /** Situação atual do vínculo do usuário com esta moradia */
  status: StatusMembro;
}

/**
 * Morador ou solicitação, já com os dados do perfil.
 */
export interface MembroMoradia extends MembroMoradiaDB {
  /** Nome completo do morador obtido da tabela 'perfis' */
  nome: string | null;
  /** E-mail de contato do morador obtido da tabela 'perfis' */
  email: string | null;
}

/**
 * Representação da tabela 'public.regras_moradia' no Supabase.
 */
export interface RegraMoradiaDB {
  /** Identificador único da regra (UUID) */
  id: string;
  /** UUID da moradia à qual a regra pertence */
  moradia_id: string;
  /** Posição da regra no estatuto */
  numero_ordem: number;
  /** Título resumido da regra de convivência */
  titulo: string;
  /** Resumo/destaque da regra */
  destaque?: string | null;
  /** Descrição detalhada e orientações da regra */
  descricao: string;
  /** Nome do ícone Feather */
  nome_icone?: string | null;
  /** Timestamp de criação da regra */
  criado_em?: string;
  /** Timestamp da última atualização da regra */
  atualizado_em?: string;
}

/** Dados de uma regra enviados ao backend (criação e edição). */
export interface RegraInput {
  /** Título da regra de convivência */
  titulo: string;
  /** Texto opcional em destaque exibido junto ao título */
  destaque?: string;
  /** Descrição completa da regra no estatuto */
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
  /** Título da recompensa proposta */
  title: string;
  /** Categoria na qual a recompensa se enquadra */
  category: CategoriaRecompensa;
  /** Quantidade de moedas necessárias para o resgate */
  cost: number;
  /** Descrição detalhada das regras e benefícios da recompensa */
  description: string;
  /** Limite textual de uso por ciclo (opcional) */
  limit?: string;
  /** Subtítulo curto exibido no card da loja (opcional) */
  subtitle?: string;
  /** Identificador do ícone representativo na interface (opcional) */
  iconType?: string;
}

/**
 * Parâmetros para transacionar resgate de uma recompensa na loja.
 */
export interface RedeemRewardInput {
  /** UUID da recompensa selecionada na loja */
  rewardId: string;
  /** UUID do morador que está realizando o resgate */
  userId: string;
  /** UUID da moradia associada à loja */
  moradiaId: string;
  /** Custo em moedas a ser debitado do saldo do morador */
  cost: number;
  /** Título da recompensa para composição do histórico e notificação */
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
  /** UUID do morador destinatário da cutucada */
  targetUserId: string;
  /** Nome completo do destinatário */
  targetName: string;
  /** UUID do morador que enviou a cutucada */
  senderUserId: string;
  /** Nome completo do remetente */
  senderName: string;
  /** UUID da moradia compartilhada */
  moradiaId: string;
}


/**
 * Categorias permitidas para despesas coletivas.
 */
export type CategoriaDespesa = 'Utilidades' | 'Aluguel' | 'Mercado' | 'Limpeza' | 'Outros' | string;

/**
 * Status de quitação da despesa coletiva.
 */
export type StatusDespesa = 'pendente' | 'quitada' | 'pago' | 'parcial' | 'recorrente';

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
  /** UUID da moradia à qual a despesa pertence */
  moradiaId: string;
  /** Título descritivo da despesa */
  titulo: string;
  /** Categoria financeira da despesa */
  categoria: CategoriaDespesa;
  /** Valor monetário total da conta */
  valorTotal: number;
  /** Data limite de pagamento no formato YYYY-MM-DD (opcional) */
  dataVencimento?: string | null;
  /** Modalidade de rateio entre os moradores (opcional) */
  tipoDivisao?: TipoDivisaoDespesa;
  /** UUID do morador responsável inicial pelo pagamento */
  pagadorId: string;
  /** URL pública do comprovante anexado no Storage (opcional) */
  comprovanteUrl?: string | null;
}

/**
 * Detalhe de rateio por morador para exibição na tela de detalhes.
 */
export interface ExpenseMemberSplit {
  /** Identificador único do registro de rateio */
  id: string;
  /** UUID do morador participante da divisão */
  userId: string;
  /** Nome completo do morador participante */
  name: string;
  /** Iniciais para exibição no avatar */
  initials: string;
  /** Papel ou rótulo complementar (ex.: 'Pagador') */
  role?: string;
  /** Valor monetário atribuído a este morador */
  amount: number;
  /** Indica se a cota deste morador já foi quitada */
  isPaid: boolean;
}

/**
 * Modelo consolidado de despesa para exibição em listas e detalhes.
 */
export interface ExpenseDetailsData {
  /** Identificador único da despesa */
  id: string;
  /** Título descritivo da despesa */
  title: string;
  /** Valor total formatado em reais (ex.: "150,00") */
  amount: string;
  /** Valor numérico bruto da despesa */
  rawAmount: number;
  /** Data de vencimento formatada para exibição (DD/MM/YYYY) */
  dueDate: string;
  /** Data bruta de vencimento no formato ISO */
  rawDueDate?: string | null;
  /** Categoria da despesa */
  categoria: string;
  /** UUID do morador que efetuou o pagamento inicial */
  payerId: string;
  /** Nome de exibição do pagador */
  payerName: string;
  /** URL pública do comprovante no Supabase Storage */
  receiptUrl?: string | null;
  /** Nome amigável do arquivo do comprovante */
  receiptName?: string;
  /** Status atual de quitação da despesa */
  status: StatusDespesa;
  /** Lista discriminada da participação de cada morador no rateio */
  members: ExpenseMemberSplit[];
}

/**
 * Item de pendência bilateral para exibição no Acerto de Contas.
 */
export interface DebtBalanceItem {
  /** Identificador único do saldo bilateral */
  id: string;
  /** UUID da contraparte (devedor ou credor) */
  debtorId: string;
  /** Nome completo da contraparte */
  debtorName: string;
  /** Iniciais para exibição no avatar */
  debtorInitials: string;
  /** Descrição textual da relação ('Deve a você' ou 'Você deve') */
  debtorStatus: string;
  /** Valor líquido formatado em moeda brasileira */
  debtAmount: string;
  /** Valor numérico líquido da pendência bilateral */
  rawAmount: number;
  /** Texto informativo adicional sobre a origem ou status da dívida */
  refText?: string;
  /** Indica se o saldo bilateral já está quitado */
  isSettled?: boolean;
}

/**
 * Item individual do histórico consolidado exibido no relatório financeiro.
 */
export interface FinancialHistoryItem {
  /** Identificador único do lançamento ou pagamento */
  id: string;
  /** Título do evento ou despesa */
  title: string;
  /** Subtítulo com contexto adicional (data, categoria ou envolvidos) */
  subtitle: string;
  /** Valor monetário formatado para exibição */
  value: string;
  /** Indica se representa uma entrada/recebimento positivo */
  isIncome?: boolean;
}

/**
 * Dados consolidados para o Relatório Financeiro da moradia.
 */
export interface FinancialReportData {
  /** Total acumulado de despesas formatado para exibição */
  totalAmount: string;
  /** Média calculada por morador formatada para exibição */
  averagePerResident: string;
  /** Lista cronológica de movimentações financeiras do período */
  history: FinancialHistoryItem[];
}
