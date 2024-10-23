# Automação de Emails no JIRA

## Descrição
Script para automatizar o envio de emails com resumos semanais de épicos utilizando a API do JIRA e Google Apps Script. O objetivo é facilitar a comunicação e o acompanhamento de atividades em projetos.

## Funcionalidades
- Autenticação via API do JIRA.
- Coleta de informações sobre épicos e tarefas associadas.
- Geração de emails em HTML com um resumo das atividades.
- Envio automático para destinatários configurados no campo personalizado "Email Ponto Focal".

## Como Configurar
1. Gere um API Token no JIRA e configure o Google Apps Script conforme as instruções.
2. Edite o script para incluir as suas credenciais e chaves de projeto.
3. Execute o script para enviar os resumos automaticamente.

## Estrutura do Projeto
- **/scripts**: Contém o script de automação.
- **/docs**: Documentação adicional e instruções detalhadas.

## Futuras Melhorias
- Logs para monitorar o envio de emails.
- Opções para pausar o envio ao concluir um épico.

## Autor
Christian Moura - Inspira Rede de Educadores
