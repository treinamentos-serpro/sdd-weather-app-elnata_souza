# Especificação de Produto — Weather App

## Overview

O Weather App é uma aplicação web em português do Brasil (pt-BR) para pesquisar uma cidade e consultar suas condições meteorológicas atuais e a previsão diária de hoje mais os quatro dias seguintes. Open-Meteo é a fonte de geocodificação e meteorologia. Celsius é a unidade inicial.

A pessoa pesquisa e seleciona uma localização; a aplicação não solicita localização do dispositivo. Não há autenticação, favoritos, sincronização nem persistência de cidade ou unidade entre recargas. Chamadas ao provedor são feitas apenas após uma busca válida ou seleção de cidade. O uso de Open-Meteo em produção depende da validação de cobertura, limites, atribuição e termos aplicáveis.

## Functional Requirements

- **FR-01 — Buscar e selecionar cidade:** aceitar busca enviada por botão ou Enter com pelo menos dois caracteres após remover espaços nas extremidades. Preservar acentos e caracteres da consulta. Para cada resultado, exibir nome da cidade e, quando disponíveis, região administrativa e país. A seleção deve identificar a localização por suas coordenadas, não apenas pelo nome.
- **FR-02 — Consultar clima atual:** para a cidade selecionada, exibir temperatura, sensação térmica, condição meteorológica, umidade relativa, velocidade do vento e horário da observação. Se um campo individual não vier na resposta, exibir “Não disponível” para esse campo.
- **FR-03 — Consultar previsão:** exibir uma previsão diária para a data atual e os quatro dias seguintes no fuso horário da cidade selecionada. Para cada dia, exibir condição, temperaturas mínima e máxima e probabilidade máxima de precipitação.
- **FR-04 — Alternar unidade de temperatura:** iniciar em Celsius e permitir alternar entre Celsius e Fahrenheit. Aplicar a seleção a todas as temperaturas atuais e previstas; exibir valores arredondados a uma casa decimal com formatação pt-BR. A preferência dura apenas até a recarga da página.
- **FR-05 — Atualizar cidade consultada:** ao selecionar outra cidade, buscar e exibir seus dados. Somente a seleção mais recente pode atualizar a tela; respostas atrasadas de seleções anteriores devem ser ignoradas.
- **FR-06 — Informar estados da consulta:** distinguir carregamento, busca sem resultados, erro e dados parcialmente disponíveis. Estados de carregamento e resultado devem ser anunciados por tecnologia assistiva.
- **FR-07 — Repetir consulta com falha:** oferecer a ação “Tentar novamente” para busca ou consulta meteorológica que falhar, repetindo a última operação válida sem exigir que a pessoa redigite os dados.

## User Stories

- **US-01 (FR-01):** Como pessoa que se prepara para uma viagem, quero localizar e identificar a cidade de destino para consultar o lugar correto.
- **US-02 (FR-02):** Como pessoa que planeja o deslocamento diário, quero consultar as condições atuais para decidir como me preparar ao sair.
- **US-03 (FR-03):** Como pessoa que planeja atividades ao ar livre, quero consultar a previsão diária para escolher quando realizar uma atividade.
- **US-04 (FR-04):** Como pessoa que se prepara para uma viagem, quero alternar a unidade para interpretar as temperaturas com facilidade.
- **US-05 (FR-05):** Como pessoa que planeja atividades ao ar livre, quero trocar de cidade e ver somente os dados da seleção mais recente.
- **US-06 (FR-06, FR-07):** Como pessoa que consulta o clima, quero entender carregamentos, resultados vazios e falhas e poder repetir uma operação que falhou.

## Traceability Matrix

| User Story | Requisitos funcionais | Critérios de aceite | Requisitos não funcionais relevantes |
|---|---|---|---|
| US-01 — Buscar e identificar destino | FR-01 | AC-01, AC-02, AC-08 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-06, NFR-07 |
| US-02 — Consultar condições atuais | FR-02 | AC-03, AC-07, AC-09, AC-10, AC-11 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-07 |
| US-03 — Consultar previsão diária | FR-03 | AC-04, AC-07, AC-09, AC-10, AC-11 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-07 |
| US-04 — Alternar unidade | FR-04 | AC-05 | NFR-01, NFR-02, NFR-06, NFR-07 |
| US-05 — Trocar cidade | FR-05 | AC-06, AC-07, AC-09, AC-10, AC-11 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-07 |
| US-06 — Entender estados e repetir falha | FR-06, FR-07 | AC-07, AC-08, AC-09, AC-10, AC-11 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-07 |

## Acceptance Criteria

- **AC-01 (FR-01) — Validar e enviar busca:** Given o campo de cidade vazio, com apenas espaços ou com um caractere após trim, When a pessoa envia o formulário, Then nenhuma chamada de geocodificação é feita e a orientação “Digite pelo menos 2 caracteres.” é exibida. Given uma consulta com pelo menos dois caracteres após trim, When enviada por Enter ou pelo botão de busca, Then uma única consulta é enviada com o texto aparado e acentos preservados.
- **AC-02 (FR-01) — Selecionar resultado:** Given uma resposta de geocodificação com duas cidades homônimas de regiões diferentes, When os resultados são exibidos, Then cada opção mostra cidade e país, inclui região quando fornecida, e selecionar uma opção envia as coordenadas dessa opção à consulta meteorológica.
- **AC-03 (FR-02) — Exibir clima atual:** Given uma resposta de teste com temperatura, sensação térmica, código de condição, umidade, vento e horário, When a consulta termina, Then todos os seis valores correspondentes são exibidos, a condição é rotulada em pt-BR e o horário é apresentado no fuso da cidade.
- **AC-04 (FR-03) — Exibir cinco dias locais:** Given um relógio fixo e uma resposta com cinco datas no fuso da cidade, When a previsão carrega, Then são exibidas exatamente essas cinco datas, em ordem, com condição, mínima, máxima e probabilidade de precipitação para cada dia.
- **AC-05 (FR-04) — Unidade inicial e conversão:** Given temperaturas conhecidas de 20,0 °C nos dados atuais e na previsão, When a página é carregada sem estado anterior e depois a pessoa seleciona °F, Then a unidade inicial é °C e todos os valores de 20,0 °C são exibidos como 68,0 °F. When a pessoa seleciona °C, Then todos voltam a 20,0 °C.
- **AC-06 (FR-05) — Trocar cidade:** Given dados da cidade A exibidos, When a pessoa seleciona B, Then o cabeçalho identifica B e os dados passam a corresponder às coordenadas de B. Given que a resposta de B chega antes da resposta pendente de A, When a resposta de A chega por último, Then a tela continua exibindo B.
- **AC-07 (FR-06) — Carregamento acessível:** Given uma solicitação pendente, When a busca ou consulta começa, Then o texto “Carregando…” fica visível e exposto como status acessível até sucesso ou falha.
- **AC-08 (FR-06) — Sem resultados:** Given uma resposta de geocodificação vazia, When a busca termina, Then “Nenhuma cidade encontrada.” é exibido e nenhuma consulta meteorológica é feita.
- **AC-09 (FR-06, FR-07) — Erro e nova tentativa:** Given uma resposta de rede não bem-sucedida ou timeout, When a operação termina, Then “Não foi possível carregar os dados.” e o botão “Tentar novamente” são exibidos como erro acessível. When a pessoa aciona o botão, Then a mesma operação é enviada novamente uma vez.
- **AC-10 (FR-06) — Timeout:** Given uma solicitação sem resposta, When dez segundos se passam, Then a solicitação é encerrada e o estado de erro de AC-09 é exibido.
- **AC-11 (FR-06) — Dados parciais:** Given que a resposta não contém um dos campos definidos, When os dados são exibidos, Then os demais campos válidos permanecem e o campo ausente mostra “Não disponível.” Given uma probabilidade de precipitação explicitamente `null`, Then ela é normalizada para `0`. Given que falta uma data da previsão, Then sua posição é mantida e marcada como indisponível, sem deslocar as datas seguintes. Given que `current` ou `daily` está ausente ou é `null`, Then o serviço rejeita a resposta com `WeatherServiceError` de tipo `invalid-response` e a consulta oferece nova tentativa. Se ambos os blocos estão presentes, mas um tem formato inválido, somente a seção afetada mostra erro e a outra seção válida permanece visível.

Os testes de datas devem fixar relógio e fuso da cidade. O fuso de produção é o fornecido pela resposta meteorológica; se ausente, usar UTC e mostrar o fuso aplicado.

## Non-Functional Requirements

- **NFR-01 — Responsividade:** os fluxos principais devem funcionar nas larguras de 320, 375, 768 e 1280 px, sem rolagem horizontal da página.
- **NFR-02 — Acessibilidade:** atender WCAG 2.2 nível AA nos fluxos de busca, seleção, leitura de dados e troca de unidade; todos os controles devem funcionar por teclado e ter nome acessível.
- **NFR-03 — Performance:** em 100 execuções automatizadas com latência de rede de 100 ms, banda de 10 Mbps e respostas simuladas do provedor em até 1 s, pelo menos 95 execuções devem exibir o resultado final em até 3 s após o envio.
- **NFR-04 — Timeout:** encerrar cada solicitação ao provedor após 10 s e apresentar o estado de erro definido em AC-09.
- **NFR-05 — Disponibilidade:** pelo menos 99,5% das verificações sintéticas, executadas a cada 5 minutos durante o mês, devem carregar o shell da aplicação com sucesso. Disponibilidade do provedor e taxa de sucesso das consultas devem ser medidas separadamente e não contam como indisponibilidade do shell.
- **NFR-06 — Compatibilidade:** suportar as duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari.
- **NFR-07 — Idioma e formatação:** interface, condições meteorológicas, mensagens, datas e números devem usar pt-BR; horários devem usar o fuso da cidade.

## Edge Cases

- **Cidade inexistente ou sem correspondência:** exibir “Nenhuma cidade encontrada.”, manter a consulta editável e não solicitar dados meteorológicos.
- **Input vazio, um caractere ou espaços externos:** aplicar trim; bloquear envio com menos de dois caracteres e não chamar geocodificação.
- **Acentos e caracteres especiais:** enviar a consulta UTF-8 corretamente codificada; ausência de correspondência é estado vazio, nunca erro de API.
- **Falha, timeout ou resposta inválida do provedor:** mostrar erro, preservar a cidade selecionada e permitir retry; não representar falha como resultado vazio.
- **Resposta parcial:** manter os campos válidos e mostrar “Não disponível.” em campo ausente; precipitação explicitamente `null` vira `0`. Conforme AC-11, `current` ou `daily` ausente ou nulo faz o serviço rejeitar a resposta; erro de formato em bloco presente afeta apenas sua seção.
- **Cidades homônimas:** diferenciar resultados por região/país; consultas meteorológicas usam as coordenadas do item selecionado.
- **Seleções rápidas:** se várias cidades forem selecionadas antes de as respostas chegarem, somente a resposta da seleção mais recente pode alterar a tela.
- **Virada de dia:** as cinco datas são determinadas no fuso retornado para a cidade; se o provedor não retornar fuso, usar UTC e informar essa escolha.
- **Troca de unidade durante carregamento:** aplicar a unidade ativa quando os dados forem renderizados; nenhuma temperatura pode permanecer na unidade anterior.

## Assumptions

- A busca é manual e exige no mínimo dois caracteres após trim.
- “Cinco dias” significa hoje e os quatro dias seguintes na data local da cidade.
- A previsão é diária; não há previsão horária nesta versão.
- Campos atuais: temperatura, sensação térmica, condição, umidade relativa, velocidade do vento e hora da observação. Campos diários: condição, mín./máx. e probabilidade máxima de precipitação.
- Unidade inicial Celsius; troca para Fahrenheit válida apenas até recarregar a página.
- Nenhuma cidade ou preferência é salva no servidor ou no dispositivo.
- O fuso retornado pelo provedor define as datas; UTC é o fallback.

## Risks

- **Termos, atribuição e limites do Open-Meteo:** uso sem API key não confirma permissão, cobertura ou cota para produção. Mitigação: validar termos, atribuição e limites antes do release; bloquear lançamento se não forem compatíveis.
- **Indisponibilidade ou dados incompletos:** o provedor pode falhar, exceder timeout ou omitir campos. Mitigação: aplicar AC-09/AC-11, monitorar taxa de sucesso e manter retry explícito.
- **Cidade errada:** homônimos podem levar a consulta incorreta. Mitigação: mostrar região/país e enviar as coordenadas selecionadas.
- **Previsão deslocada:** fuso ausente ou incorreto pode alterar as datas. Mitigação: usar timezone do provedor, fallback UTC visível e testar virada de dia.
- **Metas operacionais não atingidas:** performance e disponibilidade dependem da rede e de terceiros. Mitigação: medir shell e chamadas externas separadamente conforme NFR-03/NFR-05.

## Out of Scope

- Aplicativo nativo para iOS ou Android; o requisito atual é uma experiência web responsiva.
- Contas de usuário, autenticação e persistência de dados em servidor.
- Sincronização de preferências ou cidades entre dispositivos.
- Localização automática, favoritos, comparação de cidades e alertas meteorológicos.
- Previsão horária.
- Persistência local de cidade ou unidade.

## Decisões e gates abertos

- Unidade do vento aprovada como km/h e NFR-01 a NFR-07 aprovados sem alterações pelo responsável de produto (usuário solicitante; nome não informado) em 27/10/2026.
- A aprovação dos NFRs não substitui a validação de termos, limites e cobertura do provedor nem libera por si só o uso comercial em produção; esse gate está registrado no plano técnico.