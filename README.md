# SplitHouse

## Projeto
O SplitHouse é uma aplicação mobile estruturada para centralizar a gestão de despesas e tarefas domésticas em moradias compartilhadas (repúblicas). O foco principal do sistema é substituir o gerenciamento manual por processos automatizados, promovendo transparência, organização financeira, divisão de responsabilidades e convivência harmoniosa entre os moradores de um imóvel.

## Status do Projeto
O projeto concluiu a integração dos módulos principais, a atualização das docstrings e a suíte de testes unitários e de integração, encontrando-se atualmente em **fase de preparação para deploy (geração do APK)**.
- **Autenticação e Perfis (#60):** Integrado ao Supabase Auth com persistência de credenciais em armazenamento seguro nativo (SecureStore), criação automática de perfil em PostgreSQL via triggers e recuperação de senha.
- **Home e Tarefas Domésticas (#61):** Integrado ao Supabase com tabelas relacionais (`tarefas` e `validacoes_tarefa`), políticas de segurança por linha (RLS), serviços dedicados (`tasksService` e `homeService`), ciclo de vida de tarefas, auditoria por pares com envio de foto comprobatória e fallback transparente para execução offline.
- **Moradia, Membros e Regras:** Conectado ao Supabase com fluxo completo de cadastro da residência, código de convite dinâmico `SPLIT-XXXX`, fila de espera, aprovação de novos membros e persistência de estatuto com regras de convivência (`houseService` e `profileService`).
- **Gestão Financeira e Despesas:** Integrado ao Supabase com tabelas `despesas`, `rateios_despesa` e `pagamentos_acerto`, serviço dedicado (`financeService`), divisão automatizada de despesas coletivas, cálculo de balanço líquido bilateral, fluxo de confirmação de liquidações via Pix e relatório financeiro consolidado.
- **Ranking e Loja de Recompensas (#64):** Integrado ao Supabase com tabelas `recompensas_loja`, `resgates_recompensa` e `notificacoes`, serviços dedicados (`storeService`, `rankingService` e `notificationsService`), ordenação de ranking dinâmico por XP com contadores reais de tarefas cumpridas, débito transacional de moedas em resgates, catálogo de recompensas da república e envio de cutucadas interativas.
- **Testes e Documentação:** Suíte de testes automatizados (unitários e de integração com o Supabase) concluída e docstrings TSDoc/JSDoc atualizadas em todo o projeto.
- **Próximas Etapas:** Preparação para deploy da aplicação mobile com geração do pacote instalável **APK** para Android.

## Funcionalidades e Módulos do Sistema
A interface do sistema está estruturada e modularizada em diretórios:
- **Autenticação e Acesso (`src/screens/auth`):** Telas de apresentação (Splash, Welcome), login, cadastro de usuário sincronizado com Supabase, recuperação de senha e gestão de sessão com `AuthContext`.
- **Painel Principal (`src/screens/dashboard`):** Tela inicial com resumo dinâmico do morador, saldo financeiro da casa, próximas tarefas a vencer, atalhos rápidos e métricas da moradia.
- **Tarefas Domésticas (`src/screens/tasks`):** Listagem de afazeres filtrados por status, criação de nova atividade (fixa, rotativa ou emergencial), detalhamento da execução, submissão de foto comprobatória e auditoria/validação por pares (RN-09).
- **Gestão Financeira (`src/screens/finance`):** Lista de contas e despesas coletivas, lançamento de novos gastos com anexo de comprovante, detalhes do rateio, confirmação de liquidações e relatório financeiro mensal consolidado.
- **Gestão da Moradia (`src/screens/house`):** Seleção de imóvel, criação de república, convite via QR Code, administração de moradores, regras de convivência e aprovação de novas solicitações de entrada.
- **Perfil e Convivência (`src/screens/profile`):** Informações do morador, edição cadastral, visualização das regras da casa e fluxo formal de desvinculação/saída do imóvel.
- **Classificação e Gamificação (`src/screens/ranking`):** Acompanhamento de pontuação de experiência (XP), moedas acumuladas por tarefas concluídas e posição no ranking da república.
- **Loja e Recompensas (`src/screens/store`):** Catálogo de recompensas e folgas de tarefas disponíveis para troca por moedas acumuladas, além de proposta de novos benefícios pelos moradores.
- **Notificações (`src/screens/notifications`):** Central de avisos sobre pendências financeiras, tarefas a vencer e solicitações de validação pendentes.

## Tecnologias e Arquitetura
A arquitetura do projeto adota o padrão Cliente-Servidor com separação clara de responsabilidades:
- **Front-end:** React Native, Expo (SDK 57), TypeScript.
- **Estilização e Ícones:** StyleSheet nativo, React Native SVG e `@expo/vector-icons` (Feather).
- **Armazenamento Seguro:** `expo-secure-store` para persistência local criptografada de tokens de sessão.
- **Back-end e Banco de Dados:** Supabase (PostgreSQL 15), Supabase Auth, Row Level Security (RLS) e Supabase Storage.
- **Padrão de Documentação:** Tipagem estrita com TypeScript e documentação formal TSDoc/JSDoc em 100% dos componentes, serviços e esquemas de dados.

## Modelagem do Banco de Dados (Supabase)
O banco de dados relacional foi estruturado em tabelas modulares com Row Level Security (RLS) habilitado:
- `perfis`: Dados cadastrais do morador vinculados ao `auth.users.id`, nome completo, foto de perfil e chave Pix.
- `moradias`: Informações do imóvel compartilhado, endereço e código de convite.
- `membros_moradia`: Relação morador-república, papel de acesso (admin/morador), status de aprovação, nível, XP e saldo de moedas.
- `tarefas`: Afazeres domésticos da moradia (fixa, rotativa ou emergencial), atribuição de responsáveis, prazo, pontos de XP, moedas e status de ciclo de vida.
- `validacoes_tarefa`: Auditoria por pares para tarefas que requerem validação com foto comprobatória, impedindo autovalidação pelo executor (RN-09).
- `despesas`: Registro de contas e despesas coletivas, data de vencimento, pagador e anexos.
- `rateios_despesa`: Divisão da cota-parte de cada morador em cada despesa da moradia.
- `recompensas_loja`: Catálogo de benefícios e vantagens resgatáveis por moedas no imóvel.
- `resgates_recompensa`: Registro transacional de trocas de moedas por benefícios na loja da moradia.
- `notificacoes`: Central de alertas de tarefas a vencer, pedidos de validação, avisos de resgate e cutucadas do ranking.

### Scripts de Provisionamento SQL
- **Tarefas e Dashboard:** `supabase/schema_tarefas_home.sql`
- **Finanças e Despesas:** `supabase/schema_despesas.sql`
- **Ranking, Loja, Recompensas e Notificações (#64):** `supabase/schema_ranking_loja.sql`
- **Esquema Relacional Unificado Completo:** `supabase/schema_completo.sql`

Para provisionar, basta executar o conteúdo dos arquivos no **SQL Editor** do dashboard do Supabase.

## Testes Automatizados e Qualidade de Código
O projeto conta com verificação estática de tipos e suíte abrangente de **testes unitários e de integração com o Supabase**:

```bash
npm test
```

O comando executa:
1. **Verificação de Tipos:** `npx tsc --noEmit` garantindo tipagem estrita e ausência de inconsistências em tempo de compilação.
2. **Testes Unitários:**
   - **Esquema SQL (`tests/schemaValidation.test.js`):** Valida a integridade do arquivo DDL `schema_tarefas_home.sql`, conferindo tabelas, constraints de integridade e políticas RLS.
   - **Autenticação e Recuperação (`tests/authEmailAndRecoveryLogic.test.js`):** Valida erros de e-mail não confirmado, roteamento de deep links e regras de senha.
   - **Finanças e Moradia (`tests/financeAndHouseLogic.test.js`):** Valida ajuste de centavos em rateios, quitação ordenada de pendências e seleção de vínculo de moradia.
   - **Gamificação (`tests/gamificationLogic.test.js`):** Testa progressão de níveis e títulos de reputação por XP.
   - **QR Code (`tests/qrCodeGenerator.test.js`):** Valida a geração dinâmica de QR Code para convites.
   - **Ranking e Loja (`tests/rankingStoreLogic.test.js`):** Valida DDL de recompensas, resgates e notificações (`schema_ranking_loja.sql`), ordenação de ranking por XP, desempate por tarefas concluídas, highlight de cutucadas, débito transacional de moedas e validação de propostas.
   - **Tarefas (`tests/tasksBusinessLogic.test.js`):** Testa mapeamento de registros, ciclo de vida de validação, aprovação, recusa justificada e bloqueio de autofraude (regra RN-09).
   - **Painel Home (`tests/homeDashboardLogic.test.js`):** Testa extração de iniciais de perfis, cálculo de pendências e filtragem prioritária de tarefas para a tela inicial.
3. **Testes de Integração com o Supabase:**
   - **Moradias e Membros (`tests/integrationMoradias.test.js`):** Valida a conexão real com o Supabase e a integridade dos dados nas tabelas `moradias`, `regras_moradia` e `membros_moradia`.
   - **Finanças e Rateios (`tests/integrationFinancas.test.js`):** Verifica em banco real a estrutura e tipagem das tabelas `despesas`, `rateios_despesa` e `pagamentos_acerto`.
   - **Tarefas e Auditoria (`tests/integrationTarefas.test.js`):** Valida em banco real a consulta de `tarefas`, campos de gamificação, filtragem por status e estrutura de auditoria por pares em `validacoes_tarefa` (RN-09).

## Como Executar a Aplicação

### 1. Clonar o repositório e instalar dependências
```bash
git clone https://github.com/AnaLeonidas/SplitHouse.git
cd SplitHouse
npm install
```

### 2. Configurar as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com as chaves do seu projeto no Supabase:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

### 3. Iniciar o servidor de desenvolvimento Expo
No Linux ou ambientes gerais, execute:

```bash
ELECTRON_DISABLE_SANDBOX=1 npx expo start --tunnel -c
```

Para conexão em rede local direta (mesmo Wi-Fi):
```bash
npx expo start --lan -c
```

### 4. Abrir no dispositivo móvel
- Escaneie o QR Code gerado no terminal usando o aplicativo **Expo Go** no Android ou a câmera nativa no iOS.

## Preparação para Deploy (Geração do APK)
Com os módulos integrados, docstrings atualizadas e testes unitários e de integração concluídos, o projeto encontra-se na etapa de preparação para build e deploy com a geração do arquivo instalável **`.apk`** para dispositivos Android.

## Documentação Técnica (Swagger e TypeDoc)
O repositório disponibiliza dois portais estáticos de documentação em `docs/`:
- **Documentação da API (Swagger / OpenAPI):** `docs/index.html` e `docs/openapi.yaml`.
- **Documentação do Código / Docstrings (TypeDoc):** `docs/code/` (gerada a partir das docstrings TSDoc/JSDoc de `App.tsx` e `src/`).

Comandos disponíveis:
```bash
# Servir toda a documentação (Swagger em / e TypeDoc em /code/)
npm run docs

# Servir apenas o portal TypeDoc das docstrings
npm run docs:code

# Regerar os arquivos HTML/CSS/JS em docs/code/ a partir das docstrings
npm run docs:build

# Validar estritamente se há erros ou docstrings ausentes/quebradas
npm run docs:check
```

## Equipe Desenvolvedora
- Ana Paula Pereira Leonidas
- Camila Moura
- Elder Matheus Maia de Oliveira
- Emanuelly de Almeida e Silva
- Gabriel Lima Pereira
