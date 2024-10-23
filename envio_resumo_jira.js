// Configuração de autenticação para a API do JIRA
const jiraUsername = //colocar usuário do JIRA;
const jiraApiToken = //colcoar API TOKEN do JIRA;

const headers = {
  "Authorization": "Basic " + Utilities.base64Encode(jiraUsername + ":" + jiraApiToken),
  "Content-Type": "application/json"
};

// Função para buscar todos os épicos nos projetos INTEGRAÇÃO-TI (GI) e INCO
function buscarEpicosNosProjetos() {
  Logger.log("Acessando o JIRA...");
  var projectKeys = ["GI", "INCO"];  // Chaves dos projetos que você deseja consultar
  var jqlQuery = `project in (${projectKeys.join(",")}) AND issuetype=Epic`;  // JQL para buscar todos os épicos nos projetos
  var url = `https://redeinspiraeducadores.atlassian.net/rest/api/2/search?jql=${encodeURIComponent(jqlQuery)}`;
  
  var options = {
    "method": "GET",
    "headers": headers
  };
  
  var response = UrlFetchApp.fetch(url, options);
  Logger.log("Projetos encontrados: " + projectKeys.join(", "));
  
  var data = JSON.parse(response.getContentText());

  return data.issues;  // Retorna a lista de épicos dos projetos
}

// Função para gerar o resumo do Épico (tarefas associadas) com layout em HTML e melhorias
function gerarResumoEpic(epicKey, destinatario) {
  Logger.log(`Gerando resumo do Épico ${epicKey}...`);

  // URL JQL ajustada para buscar as tarefas associadas ao Épico utilizando "parent"
  var url = `https://redeinspiraeducadores.atlassian.net/rest/api/2/search?jql=project=GI AND parent=${epicKey}`;
  
  var options = {
    "method": "GET",
    "headers": headers,
    "muteHttpExceptions": true  // Captura erros para entender melhor
  };
  
  var response = UrlFetchApp.fetch(url, options);
  
  // Verificar se houve erro na requisição
  if (response.getResponseCode() !== 200) {
    Logger.log(`Erro ao buscar tarefas para o Épico ${epicKey}: ${response.getContentText()}`);
    throw new Error(`Erro ao buscar tarefas para o Épico ${epicKey}`);
  }
  
  var data = JSON.parse(response.getContentText());

  // Verificar se foram retornadas tarefas
  if (data.total === 0) {
    Logger.log(`Nenhuma tarefa encontrada para o Épico ${epicKey}`);
    return `Nenhuma tarefa encontrada para o Épico ${epicKey}`;
  }

  // Variáveis para armazenar as tarefas categorizadas
  var tarefasConcluidas = [];
  var tarefasEmAndamento = [];
  var tarefasPendentes = [];

  // Loop pelas tarefas relacionadas ao Épico
  data.issues.forEach(function(issue) {
    var status = issue.fields.status.name;
    var resumo = issue.fields.summary;

    // Categorizar as tarefas conforme o status
    if (status === "Concluído") {
      tarefasConcluidas.push(resumo);
    } else if (status === "Em andamento") {
      tarefasEmAndamento.push(resumo);
    } else {
      tarefasPendentes.push(resumo);
    }
  });

  // Total de atividades
  var totalAtividades = tarefasConcluidas.length + tarefasEmAndamento.length + tarefasPendentes.length;

  // Pegar as atividades recentes
  var atividadesRecentes = pegarAtividadesRecentes(epicKey);

  // Buscar o nome do projeto no campo customfield_10091
  var urlEpicDetails = `https://redeinspiraeducadores.atlassian.net/rest/api/2/issue/${epicKey}`;
  
  var responseEpicDetails = UrlFetchApp.fetch(urlEpicDetails, options);
  var epicDetails = JSON.parse(responseEpicDetails.getContentText());

  // Acessar o nome do projeto a partir do campo customfield_10091
  var epicName = epicDetails.fields.customfield_10091 ? epicDetails.fields.customfield_10091 : "Sem nome";
  
  // Montar o resumo do Épico com HTML estruturado em tabelas para garantir layout adequado
  var resumoTexto = `
  <div style="font-family: Arial, sans-serif; font-size: 14px; width: 100%; margin: auto;">

    <!-- Mensagem inicial -->
    <p style="text-align: center; font-size: 18px;">
      Bom dia,
      <br>
      Segue um resumo do status, das prioridades, das atividades vinculado ao projeto abaixo.
      <br>
      Caso tenha dúvidas de alguma atividade peço retornarem no mesmo email 
    </p>
    
    <!-- Informações do Projeto -->
    <p style="text-align: center; font-size: 16px;">
      Informações do projeto: <b>${epicName}</b>
    </p>
    
    <!-- Quadro de status em tabela -->
    <table style="width: 100%; text-align: center; margin-bottom: 20px;">
      <tr>
        <td style="padding: 10px;">
          <div style="background-color: #E74C3C; color: white; padding: 15px; border-radius: 5px; font-size: 26px;">
            ${tarefasPendentes.length}
            <br>
            <span style="font-size: 16px;">Pendente</span>
          </div>
        </td>
        <td style="padding: 10px;">
          <div style="background-color: #F4D03F; color: white; padding: 15px; border-radius: 5px; font-size: 26px;">
            ${tarefasEmAndamento.length}
            <br>
            <span style="font-size: 16px;">Em andamento</span>
          </div>
        </td>
        <td style="padding: 10px;">
          <div style="background-color: #28B463; color: white; padding: 15px; border-radius: 5px; font-size: 26px;">
            ${tarefasConcluidas.length}
            <br>
            <span style="font-size: 16px;">Concluídos</span>
          </div>
        </td>
        <td style="padding: 10px;">
          <div style="background-color: #3498DB; color: white; padding: 15px; border-radius: 5px; font-size: 26px;">
            ${atividadesRecentes.length}
            <br>
            <span style="font-size: 16px;">Atualizados</span>
          </div>
        </td>
      </tr>
    </table>
    
    <!-- Quadro de tarefas em tabela -->
    <table style="width: 100%; text-align: left; margin-top: 20px;">
      <tr>
        <td style="width: 33%; vertical-align: top;">
          <h3 style="color: #E74C3C;">Tarefas Pendentes</h3>
          ${tarefasPendentes.map(tarefa => `<p>- ${tarefa}</p>`).join('')}
        </td>
        <td style="width: 33%; vertical-align: top;">
          <h3 style="color: #F4D03F;">Tarefas em Andamento</h3>
          ${tarefasEmAndamento.map(tarefa => `<p>- ${tarefa}</p>`).join('')}
        </td>
        <td style="width: 33%; vertical-align: top;">
          <h3 style="color: #28B463;">Tarefas Concluídas</h3>
          ${tarefasConcluidas.map(tarefa => `<p>- ${tarefa}</p>`).join('')}
        </td>
      </tr>
    </table>
    
    <!-- Quadro de atividades recentes -->
    <div style="margin-top: 30px; text-align: left;">
      <p><strong>Atividades Recentes:</strong></p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="border: 1px solid black; padding: 8px;">Tarefa</th>
          <th style="border: 1px solid black; padding: 8px;">Data de Atualização</th>
          <th style="border: 1px solid black; padding: 8px;">Prioridade</th>
          <th style="border: 1px solid black; padding: 8px;">Último Comentário</th>
        </tr>
        ${atividadesRecentes.map(atividade => {
          var dataFormatada = Utilities.formatDate(new Date(atividade.dataAtualizacao), Session.getScriptTimeZone(), "dd/MM/yyyy");
          return `
            <tr>
              <td style="border: 1px solid black; padding: 8px;">${atividade.resumo}</td>
              <td style="border: 1px solid black; padding: 8px;">${dataFormatada}</td>
              <td style="border: 1px solid black; padding: 8px;">${atividade.prioridade}</td>
              <td style="border: 1px solid black; padding: 8px;">${atividade.comentario}</td>
            </tr>`;
        }).join('')}
      </table>
    </div>


    <!-- Assinatura do email -->
    <p style="margin-top: 40px;">
      Atenciosamente,
      <br>
      <strong>Christian Moura</strong>
      <br>
      Equipe Projeto INTEGRAÇÃO - TI
    </p>
  </div>
  `;

  return resumoTexto;
}


// Função para substituir menções de accountId pelos nomes de usuário
function substituirMencoesPorNomes(comentario) {
  if (!comentario || typeof comentario !== 'string') {
    // Se o comentário for indefinido ou não for uma string, retornar como está
    return comentario;
  }

  // Expressão regular para identificar as menções no formato [~accountid:<id>]
  const regex = /\[~accountid:(\w+)\]/g;
  let match;
  let comentariosSubstituidos = comentario;

  // Percorrer todas as ocorrências das menções no comentário
  while ((match = regex.exec(comentario)) !== null) {
    const accountId = match[1]; // Captura o ID da conta

    // Fazer a requisição para obter o nome do usuário
    const url = `https://redeinspiraeducadores.atlassian.net/rest/api/3/user?accountId=${accountId}`;
    const options = {
      "method": "GET",
      "headers": headers
    };

    try {
      const response = UrlFetchApp.fetch(url, options);
      const userData = JSON.parse(response.getContentText());

      // Substituir a menção pelo nome completo do usuário
      if (userData.displayName) {
        comentariosSubstituidos = comentariosSubstituidos.replace(match[0], userData.displayName);
      }
    } catch (error) {
      Logger.log(`Erro ao buscar nome do usuário para accountId ${accountId}: ${error}`);
      // Em caso de erro, continuar sem substituir
    }
  }

  return comentariosSubstituidos;
}



// Função para pegar as atividades recentes baseadas no campo customfield_10061 e os últimos comentários com menções substituídas
function pegarAtividadesRecentes(epicKey) {
  Logger.log(`Buscando atividades recentes para o Épico ${epicKey}...`);

  // Construir a consulta JQL corretamente
  var jqlQuery = `project=GI AND parent=${epicKey} AND updated >= "-7d"`;
  var url = `https://redeinspiraeducadores.atlassian.net/rest/api/2/search?jql=${encodeURIComponent(jqlQuery)}`;

  Logger.log(`Consulta JQL: ${jqlQuery}`);
  Logger.log(`URL gerada: ${url}`);

  var options = {
    "method": "GET",
    "headers": headers,
    "muteHttpExceptions": true  // Permitir a captura de erros HTTP
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    
    // Verificar o código de resposta para garantir que a chamada foi bem-sucedida
    if (response.getResponseCode() !== 200) {
      Logger.log(`Erro HTTP: Código ${response.getResponseCode()} - Detalhes: ${response.getContentText()}`);
      throw new Error(`Erro ao buscar atividades recentes para o Épico ${epicKey}`);
    }
    
    var data = JSON.parse(response.getContentText());
    
    // Criar uma lista de atividades recentes
    var atividadesRecentes = [];
    
    // Loop pelas tarefas para buscar o último comentário e substituir as menções
    data.issues.forEach(function(issue) {
      // Buscar comentários da tarefa atual
      var comentario = buscarUltimoComentario(issue.key);
      
      atividadesRecentes.push({
        resumo: issue.fields.summary,
        dataAtualizacao: issue.fields.updated,
        prioridade: issue.fields.priority.name,
        comentario: comentario
      });
    });
    
    return atividadesRecentes;

  } catch (error) {
    Logger.log(`Erro ao buscar atividades recentes: ${error.message}`);
    throw error;  // Relançar o erro para ser tratado externamente
  }
}


// Função para buscar o último comentário e substituir menções por nomes legíveis
function buscarUltimoComentario(issueKey) {
  var url = `https://redeinspiraeducadores.atlassian.net/rest/api/2/issue/${issueKey}/comment?orderBy=-created&maxResults=1`;
  var options = {
    "method": "GET",
    "headers": headers
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var comentariosData = JSON.parse(response.getContentText());
  
  if (comentariosData.total > 0) {
    var comentario = comentariosData.comments[0].body;
    
    // Substituir as menções por nomes legíveis
    comentario = substituirMencoesPorNomes(comentario);
    
    return comentario;
  } else {
    return "Sem comentários";
  }
}





// Função para enviar o email com o layout em HTML
function enviarResumoDosEpicos() {
  var epicos = buscarEpicosNosProjetos();  // Busca todos os épicos no projeto
  Logger.log(`Total de Épicos encontrados no projeto: ${epicos.length}`);

  epicos.forEach(function(epico) {
    // Verifica o valor do campo "Resumo Semanal" (customfield_10089)
    var resumoSemanalArray = epico.fields.customfield_10089;  // Campo "Resumo Semanal" retorna um array
    
    // Verifica se o campo "Resumo Semanal" contém a opção "Sim"
    var resumoSemanal = resumoSemanalArray && resumoSemanalArray.some(function(option) {
      return option.value === "Sim";  // Verifica se a opção "Sim" está presente
    });

    if (resumoSemanal) {
      Logger.log(`Épico encontrado para envio: ${epico.key}, Resumo Semanal: Sim`);

      // Pegar os emails do campo "Email Ponto Focal" (customfield_10090) e separá-los por ";"
      var emails = epico.fields.customfield_10090 ? epico.fields.customfield_10090.split(";") : [];
      Logger.log(`Emails encontrados para o Épico ${epico.key}: ${emails.join(", ")}`);

      if (emails.length === 0) {
        Logger.log(`Nenhum email foi encontrado no Épico ${epico.key}`);
        return;  // Se não houver emails, interrompe o envio
      }

      // Buscar o nome do épico (epicName) no campo customfield_10091
      var urlEpicDetails = `https://redeinspiraeducadores.atlassian.net/rest/api/2/issue/${epico.key}`;
      var responseEpicDetails = UrlFetchApp.fetch(urlEpicDetails, { method: "GET", headers: headers });
      var epicDetails = JSON.parse(responseEpicDetails.getContentText());
      var epicName = epicDetails.fields.customfield_10091 ? epicDetails.fields.customfield_10091 : "Sem nome";

      // Agora você pode usar o epicName no assunto
      var assunto = `Resumo do Projeto ${epicName}`;

      var corpo = gerarResumoEpic(epico.key);  // Gera o resumo do Épico com HTML
      Logger.log(`Corpo do email gerado para o Épico ${epico.key}: \n${corpo}`);

      // Enviar email para cada destinatário com corpo em HTML
      emails.forEach(function(email) {
        if (email.trim()) {  // Verifica se o email não está vazio
          Logger.log(`Enviando email para: ${email.trim()}`);
          MailApp.sendEmail({
            to: email.trim(),  // Remove espaços em branco
            subject: assunto,
            htmlBody: corpo,  // Utiliza o corpo em HTML
          });
        }
      });
    } else {
      Logger.log(`O Épico ${epico.key} está com o campo "Resumo Semanal" sem a opção "Sim". Nenhum email será enviado.`);
    }
  });
}





// Chamar a função para enviar o resumo dos Épicos
enviarResumoDosEpicos();





