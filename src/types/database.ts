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
  moradia_id?: string | null;
  /** Título descritivo da atividade */
  titulo: string;
  /** Descrição detalhada das orientações da tarefa */
  descricao?: string | null;
  /** Cômodo ou ambiente de execução na casa */
  comodo: string;
  /** Tipologia de rotatividade da tarefa */
  tipo: 'Fixa' | 'Rotativa' | 'Emergencial';
  /** UUID do morador atribuído como responsável */
  responsavel_id?: string | null;
  /** Nome de exibição do morador atribuído */
  responsavel_nome?: string | null;
  /** Prazo ou data limite de conclusão */
  prazo: string;
  /** Quantidade de pontos de experiência (XP) concedidos */
  xp: number;
  /** Quantidade de moedas concedidas ao morador */
  moedas: number;
  /** Estado atual da tarefa no ciclo de vida */
  status: 'Pendente' | 'Concluída' | 'Aguardando validação';
  /** Indica se a conclusão requer validação por pares com foto */
  requer_validacao: boolean;
  /** URL da foto comprobatória enviada pelo executor */
  foto_comprovante_url?: string | null;
  /** Informação textual do executor para auditoria */
  executor_info?: string | null;
  /** Timestamp de criação do registro */
  criado_em?: string;
  /** Timestamp de conclusão da tarefa */
  concluido_em?: string | null;
}

/**
 * Representação da tabela 'public.validacoes_tarefa' no Supabase.
 * Registra a auditoria por pares da conclusão de tarefas com foto.
 */
export interface ValidacaoTarefaDB {
  /** Identificador único da validação (UUID) */
  id: string;
  /** Identificador da tarefa validada */
  tarefa_id: string;
  /** UUID do morador que avaliou a tarefa */
  validador_id: string;
  /** Nome do morador avaliador */
  validador_nome?: string | null;
  /** Parecer da validação */
  status: 'aprovada' | 'recusada';
  /** Justificativa informada pelo avaliador */
  justificativa?: string | null;
  /** Timestamp da avaliação */
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
