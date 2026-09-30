# SplitHouse

## Projeto
O SplitHouse é uma aplicação mobile estruturada para centralizar a gestão de despesas e tarefas domésticas em moradias compartilhadas. O foco principal do sistema é substituir
o gerenciamente manual por processos automatizados, promovendo transparência, organização financeira e operacional entre os moradores de um imóvel.

## Status do Projeto
O projeto está em fase de desenvolvimento. A etapa atual consiste na finalização da prototipação e do Front-end. A estruturação do banco de dados 
e a integração com o Back-end estão planejadas para as próximas entregas do cronograma.

## Funcionalidades/Telas do Sistema
A interface atual está modularizada em pastas:
- Autenticação e Acesso (auth): Telas de abertura, login, cadastro de usuário e recuperação de senha.
- Painel Principal (finance): Módulo contendo a lista de despesas, cadastro de nova conta, detalhes do rateio, acerto de contas. confirmação de pagamentos e relatório financeiro mensal.
- Gestão de Imóvel (house): Fluxos de seleção, criação e entrada em uma casa, geração de convite via código QR, gerenciamento de moradores, tela de solicitações pendentes
e configuração inicial de regras.
- Notificações (notifications): Tela de avisos sobre pendências financeiras e operacionais da casa.
- Perfil e Regras (profile): Área do usuário contendo edição de perfil, visualização e edição das regras de convivência da casa, e o fluxo de saída do imóvel.
- Classificação (ranking): Tela para acompanhamento da pontuação, experiência e posição dos moradores no ranking do imóvel.
- Loja e Recompensas (store): Interface da loja da casa e tela para propor novas recompensas a partir dos pontos acumulados.
- Tarefas Domésticas (tasks): Lista geral de afazeres, cadastro de nova atividade, detalhamento de execuções e validação de tarefas feitas por outros moradores.

## Tecnologias e Arquitetura
A arquitetura do projeto segue o padrão Cliente-Servidor (MVC). As ferramentas definidas para o ecossistema incluem:
- Front-end (Fase Atual): React Native, Expo, TypeScript e Expo Router. Responsável pela renderização nativa, captura de entradas e rotas de navegação.
- Prototipação: Figma.

## Como Executar a Aplicação (Front-end)
1. Faça o clone do repositório para o seu ambiente local.
2. Acesse a pasta raiz do projeto através do terminal.
3. Instale as dependências executando o comando npm install (ou yarn install).
4. Inicie o servidor do Expo com o comando npx expo start --tunnel.
5. Leia o QR Code gerado no terminal utilizando o aplicativo Expo Go em um aparelho físico ou no emulador.

## Equipe Desenvolvedora
- Ana Paula Pereira Leonidas
- Camila Moura
- Elder Matheus Maia de Oliveira
- Emanuelly de Almeida e Silva
- Gabriel Lima Pereira
