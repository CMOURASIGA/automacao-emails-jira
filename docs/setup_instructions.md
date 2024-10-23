
### Documentação: Configuração e Uso do Script `envio_resumo_jira.js`

#### 1. **Pré-requisitos**
Antes de configurar o script, certifique-se de que você tem:
   - **API Token do JIRA**: Gere um token de API no seu perfil do JIRA.
   - **Acesso ao Google Apps Script**: Para automatizar o processo, você precisará de acesso ao Google Apps Script, uma ferramenta do Google que permite a automação de tarefas utilizando scripts em JavaScript.

#### 2. **Configuração Inicial**
   - Abra o **Google Apps Script** (https://script.google.com) e crie um novo projeto.
   - Copie o conteúdo do arquivo `envio_resumo_jira.js` e cole no editor do Google Apps Script.

#### 3. **Ajuste de Variáveis no Script**
   - Substitua as seguintes variáveis no início do script:
     ```javascript
     const jiraUsername = 'seu_usuario_do_JIRA';
     const jiraApiToken = 'seu_token_de_API_do_JIRA';
     ```
     Esses valores são essenciais para autenticação na API do JIRA e devem ser configurados corretamente.

#### 4. **Configuração de Projetos no JIRA**
   - No script, há uma configuração inicial para os projetos que serão consultados. Eles são definidos na variável `projectKeys`:
     ```javascript
     var projectKeys = ["GI", "INCO"];  // Chaves dos projetos que você deseja consultar
     ```
     Atualize esses valores para incluir as chaves dos projetos que deseja monitorar.

#### 5. **Estrutura do Script**
   - **Função `buscarEpicosNosProjetos`**: Busca todos os épicos nos projetos configurados e retorna a lista de épicos.
   - **Função `gerarResumoEpic`**: Gera o resumo em HTML de um épico específico, categorizando as tarefas (pendentes, em andamento e concluídas) e construindo um layout visual.
   - **Função `enviarResumoDosEpicos`**: Envia os resumos gerados por email para os destinatários configurados no JIRA, utilizando os campos personalizados definidos:
     - `customfield_10089`: Campo que define se o resumo semanal será enviado ("Sim" ou "Não").
     - `customfield_10090`: Campo que armazena os emails dos destinatários separados por ponto e vírgula.
     - `customfield_10091`: Nome do projeto.

#### 6. **Executando o Script**
   - No editor do Google Apps Script, clique em **Run** (Executar) e selecione a função `enviarResumoDosEpicos` para rodar o script.
   - Permita as autorizações necessárias para que o script possa acessar sua conta do JIRA e enviar emails.
   - Após a execução, o log mostrará informações sobre os épicos encontrados, as atividades e os emails enviados.

#### 7. **Personalização e Melhorias Futuras**
   - Você pode personalizar o layout HTML alterando o conteúdo da função `gerarResumoEpic`.
   - Logs detalhados são exibidos usando `Logger.log`, que ajudam a entender o que está acontecendo durante a execução.
   - Melhorias sugeridas incluem:
     - Adição de um sistema de logs mais robusto.
     - Opção para pausar envios automaticamente quando um épico for concluído.

#### 8. **Manutenção e Atualizações**
   - À medida que novos projetos forem adicionados ou os campos personalizados forem atualizados no JIRA, ajuste o script para refletir essas mudanças.
   - Manter o script e os tokens seguros é essencial para a segurança do processo.

