# Tarefas de Implementação — Weather App

Tarefas derivadas de `plans/weather-app-plan.md` e organizadas por entrega. As dependências indicam pré-requisitos para iniciar cada tarefa; tarefas sem dependência podem começar em paralelo dentro da entrega.

## Estado da execução — 27/10/2026

| Tarefa | Status |
|---|---|
| T-01 | Concluída para protótipo educacional; gate de produção comercial bloqueado. |
| T-02 | Concluída: km/h e NFR-01 a NFR-07 aprovados; registro no plano e na spec. |
| T-03 | Concluída condicionalmente: browser-to-provider apenas para uso educacional não comercial. |
| T-04 | Concluída: tipos e contratos compilam em modo strict. |
| T-05 | Concluída: cinco datas locais, virada de dia e fallback UTC testados. |
| T-06 | Concluída: conversão e formatação pt-BR testadas. |
| T-07 | Concluída: códigos WMO e indisponibilidade testados. |
| T-08 | Concluída: geocoding validado por mapper e testes. |
| T-09 | Concluída: current/daily independentes, datas e campos ausentes testados. |
| T-10 | Concluída: geocoding com trim, encoding, timeout e AbortSignal. |
| T-11 | Concluída: forecast com parâmetros, timeout e erros de seção isolados. |
| T-12 | Concluída: busca, seleção explícita, validação e retry implementados. |
| T-13 | Concluída: concorrência, retry por seção e unidade no hook. |
| T-14 | Concluída: busca e seleção acessíveis por teclado. |
| T-15 | Concluída: feedback de loading, vazio e erro com roles acessíveis. |
| T-16 | Concluída: painel atual e campos indisponíveis implementados. |
| T-17 | Concluída: busca, seleção, clima atual e retry integrados. |
| T-18 | Concluída: cinco slots e apresentação de dados parciais implementados. |
| T-19 | Concluída: seletor de unidade conectado, sem novo request. |
| T-20 | Concluída: testes de datas locais, virada de dia e UTC. |
| T-21 | Concluída: testes de conversão, arredondamento e pt-BR. |
| T-22 | Concluída: testes de códigos conhecidos e desconhecidos. |
| T-23 | Concluída: testes de mapeamento válido, parcial e inválido. |
| T-24 | Concluída: testes de serviços mockam fetch, incluindo rede, HTTP, JSON, timeout e abort. |
| T-25 | Concluída: testes do hook para busca, validação, vazio e retry. |
| T-26 | Concluída: testes de seção parcial, retry e resposta obsoleta. |
| T-27 | Concluída: testes de envio, seleção por teclado e estados acessíveis. |
| T-28 | Concluída: testes de campos atuais disponíveis e ausentes. |
| T-29 | Concluída: testes de cinco dias e slot indisponível. |
| T-30 | Concluída: testes de unidade e composição da tela. |
| T-31 | Concluída: E2E interceptado e fluxo exercitado em 320, 375, 768 e 1280 px. |
| T-32 | Bloqueada: falta relatório nas duas versões estáveis de Chrome, Edge, Firefox e Safari. |
| T-33 | Parcial/bloqueada para release: testes de teclado e anúncios existem; falta revisão manual WCAG 2.2 AA com leitor de tela. |
| T-34 | Concluída: 100 execuções simuladas; pelo menos 95 exibiram resultado em até 3 s. |
| T-35 | Bloqueada: requer URL implantada e mecanismo de CI/monitoramento definidos. |

**Gates restantes para release:** confirmar que o uso e o volume previstos atendem aos termos/cobertura do provedor; completar T-32 e a revisão manual de T-33; definir deploy, URL e monitoramento para T-35. T-01/T-03 não autorizam produção comercial.

## Entrega 1 — Decisões e base de dados

### T-01 — Validar termos e cobertura da Open-Meteo
- **ID:** T-01
- **Título:** Validar termos e cobertura da Open-Meteo
- **Descrição:** Confirmar que o provedor atende aos requisitos de produção.
- **Critérios de aceite:**
  - Termos, atribuição, cobertura e limites são verificados em fontes do provedor e registrados com links/data de consulta.
  - Resultado é marcado como aprovado ou bloqueado para produção; bloqueio impede o gate de release.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `plans/weather-app-plan.md`.
- **Tipo:** Infra

### T-02 — Aprovar unidade do vento e metas não funcionais
- **ID:** T-02
- **Título:** Aprovar unidade do vento e metas não funcionais
- **Descrição:** Resolver as decisões de produto que ainda estão marcadas como propostas.
- **Critérios de aceite:**
  - Unidade de exibição do vento tem aprovação explícita registrada e valor definido para API, modelo e UI.
  - Cada NFR proposto tem aprovação ou valor substituto registrado com responsável e data.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `plans/weather-app-plan.md`, `specs/weather-app-spec.md`.
- **Tipo:** Infra

### T-03 — Decidir necessidade de proxy/backend
- **ID:** T-03
- **Título:** Decidir necessidade de proxy/backend
- **Descrição:** Confirmar se acesso browser-to-provider atende às restrições de termos, cotas e operação.
- **Critérios de aceite:**
  - Decisão entre acesso direto e proxy/backend está registrada com justificativa baseada em T-01.
  - Se a decisão exigir proxy/backend, o plano é revisado antes de iniciar T-10 e T-11.
- **Dependências:** T-01.
- **Arquivos prováveis:** `plans/weather-app-plan.md`.
- **Tipo:** Infra

## Entrega 2 — Tipos e funções puras

### T-04 — Definir tipos de domínio e contratos
- **ID:** T-04
- **Título:** Definir tipos de domínio e contratos
- **Descrição:** Declarar modelos e estados compartilhados pelas camadas.
- **Critérios de aceite:**
  - `City`, `CurrentWeather`, `ForecastDay`, `WeatherData` e `Unit` correspondem ao plano.
  - Campos opcionais e falhas independentes de current/forecast estão representados.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data

### T-05 — Implementar normalização de datas e fuso
- **ID:** T-05
- **Título:** Implementar normalização de datas e fuso
- **Descrição:** Criar funções puras para produzir as cinco datas locais da previsão.
- **Critérios de aceite:**
  - Produz hoje e os quatro dias seguintes no fuso do provedor ou em UTC como fallback.
  - Mantém cinco slots em ordem quando algum dia não possui dados.
- **Dependências:** T-04.
- **Arquivos prováveis:** `src/lib/date.ts`.
- **Tipo:** Data

### T-06 — Implementar conversão e formatação de temperatura
- **ID:** T-06
- **Título:** Implementar conversão e formatação de temperatura
- **Descrição:** Criar função pura de apresentação Celsius/Fahrenheit.
- **Critérios de aceite:**
  - Converte Celsius para Fahrenheit sem alterar valores canônicos.
  - Formata com uma casa decimal e localidade `pt-BR`.
- **Dependências:** T-04.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data

### T-07 — Mapear códigos meteorológicos
- **ID:** T-07
- **Título:** Mapear códigos meteorológicos
- **Descrição:** Converter códigos WMO/Open-Meteo em descrições pt-BR.
- **Critérios de aceite:**
  - Códigos suportados têm descrição pt-BR.
  - Código desconhecido resulta em condição indisponível sem invalidar os demais dados.
- **Dependências:** T-04.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data

### T-08 — Mapear resultados de geocoding
- **ID:** T-08
- **Título:** Mapear resultados de geocoding
- **Descrição:** Validar itens desconhecidos da API e convertê-los em `City`.
- **Critérios de aceite:**
  - Mapeia id, nome, região, país e coordenadas.
  - Campos opcionais ausentes viram `null`; estrutura inválida é distinguida de lista vazia.
- **Dependências:** T-04.
- **Arquivos prováveis:** `src/lib/mapOpenMeteo.ts`, `src/types/weather.ts`.
- **Tipo:** Data

### T-09 — Mapear resposta de forecast
- **ID:** T-09
- **Título:** Mapear resposta de forecast
- **Descrição:** Validar e converter clima atual e previsão diária em resultados independentes.
- **Critérios de aceite:**
  - Converte unidades/campos externos para `WeatherData` em Celsius e km/h ou unidade aprovada.
  - Preserva cinco datas e campos ausentes; falha de current não descarta forecast e vice-versa.
- **Dependências:** T-04, T-05, T-08.
- **Arquivos prováveis:** `src/lib/mapOpenMeteo.ts`, `src/lib/date.ts`.
- **Tipo:** Data

## Entrega 3 — Services

### T-10 — Implementar serviço de geocoding
- **ID:** T-10
- **Título:** Implementar serviço de geocoding
- **Descrição:** Consultar a API de geocoding e retornar cidades do domínio.
- **Critérios de aceite:**
  - Envia consulta aparada e codificada, idioma pt e limite de resultados.
  - Distingue lista vazia, HTTP, rede, timeout e resposta inválida; respeita `AbortSignal` e limite de 10 s.
- **Dependências:** T-03, T-08.
- **Arquivos prováveis:** `src/services/openMeteo.ts`, `src/lib/mapOpenMeteo.ts`.
- **Tipo:** Data

### T-11 — Implementar serviço de forecast
- **ID:** T-11
- **Título:** Implementar serviço de forecast
- **Descrição:** Consultar clima atual e cinco dias para as coordenadas selecionadas.
- **Critérios de aceite:**
  - Envia coordenadas, campos `current`/`daily`, Celsius, unidade de vento aprovada, `timezone=auto` e cinco dias.
  - Distingue falhas HTTP, rede, timeout e resposta inválida; respeita `AbortSignal` e limite de 10 s.
  - Rejeita `current` ou `daily` ausente ou `null` com `WeatherServiceError` de tipo `invalid-response`.
  - Normaliza probabilidade de precipitação explicitamente `null` para `0`, sem preencher campos ou dias ausentes com zero.
- **Dependências:** T-03, T-09, T-10.
- **Arquivos prováveis:** `src/services/openMeteo.ts`, `src/lib/mapOpenMeteo.ts`.
- **Tipo:** Data

## Entrega 4 — Hook

### T-12 — Orquestrar busca e seleção de cidade
- **ID:** T-12
- **Título:** Orquestrar busca e seleção de cidade
- **Descrição:** Implementar no hook o input, geocoding e seleção da cidade.
- **Critérios de aceite:**
  - Mantém consulta e estados idle/loading/success/empty/error da busca.
  - Bloqueia consulta com menos de dois caracteres após trim e permite repetir a última busca válida.
- **Dependências:** T-10.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data

### T-13 — Orquestrar clima, retry e concorrência
- **ID:** T-13
- **Título:** Orquestrar clima, retry e concorrência
- **Descrição:** Gerir consulta de forecast e atualização da cidade selecionada.
- **Critérios de aceite:**
  - Current e forecast têm estados independentes; retry de uma seção preserva a outra válida.
  - Só a seleção mais recente pode atualizar a tela; troca de cidade não mantém dados vinculados à cidade anterior.
  - O hook mantém a unidade, inicia em Celsius e não chama serviços quando ela é alterada.
- **Dependências:** T-11, T-12.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data

## Entrega 5 — Componentes

### T-14 — Implementar busca e seleção na UI
- **ID:** T-14
- **Título:** Implementar busca e seleção na UI
- **Descrição:** Criar o campo de busca e a lista de cidades selecionáveis.
- **Critérios de aceite:**
  - Envio funciona por Enter e botão; opções exibem cidade, país e região quando disponível.
  - Testes de componente confirmam nome acessível, foco por teclado e seleção por Enter/Space.
- **Dependências:** T-04, T-12.
- **Arquivos prováveis:** `src/components/CitySearch.tsx`.
- **Tipo:** UI

### T-15 — Exibir feedback de busca e consulta
- **ID:** T-15
- **Título:** Exibir feedback de busca e consulta
- **Descrição:** Apresentar mensagens de loading, validação, vazio, erro e retry.
- **Critérios de aceite:**
  - Busca vazia mostra a mensagem de nenhum resultado; erros mostram retry sem exigir novo input.
  - Testes verificam texto de loading, vazio e erro, retry e roles `status`/`alert` apropriados.
- **Dependências:** T-12, T-13.
- **Arquivos prováveis:** `src/components/QueryFeedback.tsx`.
- **Tipo:** UI

### T-16 — Implementar painel de clima atual
- **ID:** T-16
- **Título:** Implementar painel de clima atual
- **Descrição:** Exibir os campos atuais para a cidade selecionada.
- **Critérios de aceite:**
  - Exibe temperatura, sensação térmica, condição, umidade, vento e horário.
  - Campos ausentes mostram “Não disponível”; falha de current não oculta forecast.
- **Dependências:** T-07, T-13.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI

### T-17 — Integrar busca e clima atual
- **ID:** T-17
- **Título:** Integrar busca e clima atual
- **Descrição:** Compor a primeira tela funcional com busca, seleção, feedback e condições atuais.
- **Critérios de aceite:**
  - A busca e a seleção exibem o nome da cidade selecionada e o clima atual correspondente.
  - Loading, vazio, erro e retry da busca permanecem acessíveis.
  - A tela funciona sem forecast diário ou seletor de unidade, que serão acrescentados em T-18 e T-19.
- **Dependências:** T-14, T-15, T-16.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI

### T-18 — Implementar previsão diária na UI
- **ID:** T-18
- **Título:** Implementar previsão diária na UI
- **Descrição:** Exibir os cinco dias locais e acrescentar a previsão à tela integrada.
- **Critérios de aceite:**
  - Exibe condição, mínima, máxima e probabilidade máxima de precipitação para cada slot.
  - Dia/campo ausente permanece na posição esperada e mostra indisponibilidade.
  - O painel é adicionado à tela existente sem regressão no fluxo de busca/clima atual.
- **Dependências:** T-07, T-13, T-17.
- **Arquivos prováveis:** `src/components/DailyForecast.tsx`, `src/App.tsx`.
- **Tipo:** UI

### T-19 — Integrar seletor de unidade
- **ID:** T-19
- **Título:** Integrar seletor de unidade
- **Descrição:** Criar o controle acessível e conectá-lo à tela com clima atual e previsão.
- **Critérios de aceite:**
  - Celsius é a unidade inicial e a seleção funciona por teclado.
  - Todas as temperaturas atuais e previstas alternam entre Celsius/Fahrenheit sem novo request.
  - A unidade não persiste após recarga.
- **Dependências:** T-04, T-06, T-13, T-18.
- **Arquivos prováveis:** `src/components/UnitSelector.tsx`, `src/App.tsx`.
- **Tipo:** UI

## Entrega 6 — Integração incremental

## Entrega 7 — Testes

### T-20 — Testar normalização de datas
- **ID:** T-20
- **Título:** Testar normalização de datas
- **Descrição:** Verificar datas locais, virada de dia e fallback de fuso.
- **Critérios de aceite:**
  - Relógio e fuso são controlados nos testes.
  - Testes cobrem cinco slots em ordem, virada de dia, UTC e dia ausente.
- **Dependências:** T-05, T-18.
- **Arquivos prováveis:** `tests/unit/date.test.ts`.
- **Tipo:** Test

### T-21 — Testar conversão de temperatura
- **ID:** T-21
- **Título:** Testar conversão de temperatura
- **Descrição:** Verificar conversões e formatação para apresentação.
- **Critérios de aceite:**
  - `20 °C` é exibido como `68,0 °F` e retorna a `20,0 °C`.
  - Arredondamento e formatação pt-BR são verificados.
  - O teste é unitário da função em `lib/`, sem montar componente ou chamar service/rede.
- **Dependências:** T-06, T-19.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test

### T-22 — Testar descrições de códigos meteorológicos
- **ID:** T-22
- **Título:** Testar descrições de códigos meteorológicos
- **Descrição:** Verificar tabela WMO e comportamento para códigos desconhecidos.
- **Critérios de aceite:**
  - Códigos conhecidos retornam descrições em pt-BR.
  - Código desconhecido retorna estado indisponível.
- **Dependências:** T-07, T-17.
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`.
- **Tipo:** Test

### T-23 — Testar mapeadores Open-Meteo
- **ID:** T-23
- **Título:** Testar mapeadores Open-Meteo
- **Descrição:** Cobrir payloads válidos, inválidos e parciais das duas APIs.
- **Critérios de aceite:**
  - Testes cobrem resultados geográficos e blocos current/daily.
  - Campos ausentes viram `null`, falhas de seção são isoladas e datas ausentes mantêm slots.
- **Dependências:** T-08, T-09, T-17.
- **Arquivos prováveis:** `tests/unit/mapOpenMeteo.test.ts`.
- **Tipo:** Test

### T-24 — Testar serviços com fetch mockado
- **ID:** T-24
- **Título:** Testar serviços com fetch mockado
- **Descrição:** Verificar requests, timeout e erros de transporte sem acessar a rede real.
- **Critérios de aceite:**
  - Vitest substitui `fetch` por mock em todos os casos e verifica URL, parâmetros, encoding e mapeamento dos dois endpoints.
  - Cobrem resposta vazia, HTTP não OK, rejeição, JSON inválido, timeout e abort.
  - Nenhum teste desta tarefa envia request real.
  - Verifica input vazio sem fetch, `results` omitido como lista vazia, cinco dias mapeados, precipitação `null` como `0` e rejeição de `current`/`daily` ausentes ou nulos.
- **Dependências:** T-10, T-11, T-17.
- **Arquivos prováveis:** `tests/unit/openMeteo.test.ts`.
- **Tipo:** Test

### T-25 — Testar o hook de busca e seleção
- **ID:** T-25
- **Título:** Testar o hook de busca e seleção
- **Descrição:** Testar a máquina de estados de geocoding com serviço controlado.
- **Critérios de aceite:**
  - Cobrir validação, loading, sucesso, vazio, erro e retry.
  - Confirmar que buscas curtas não chamam o serviço.
- **Dependências:** T-12, T-17.
- **Arquivos prováveis:** `tests/hooks/useWeather.test.tsx`.
- **Tipo:** Test

### T-26 — Testar estados de clima e concorrência do hook
- **ID:** T-26
- **Título:** Testar estados de clima e concorrência do hook
- **Descrição:** Verificar seções independentes, retry e seleção mais recente.
- **Critérios de aceite:**
  - Cobrir sucesso, falha parcial, retry e preservação da seção válida.
  - Promise adiada confirma que resposta antiga não substitui cidade mais recente.
- **Dependências:** T-13, T-17, T-25.
- **Arquivos prováveis:** `tests/hooks/useWeather.test.tsx`.
- **Tipo:** Test

### T-27 — Testar componentes de busca e feedback
- **ID:** T-27
- **Título:** Testar componentes de busca e feedback
- **Descrição:** Verificar interação de busca e mensagens acessíveis isoladamente.
- **Critérios de aceite:**
  - Testing Library verifica os estados loading, success, empty e error, incluindo texto visível, opções de sucesso, mensagem vazia, alerta e ação de retry.
  - Testes cobrem envio por Enter/botão, seleção de resultado, nome acessível e anúncio de loading/erro.
- **Dependências:** T-14, T-15, T-17.
- **Arquivos prováveis:** `tests/components/CitySearch.test.tsx`, `tests/components/QueryFeedback.test.tsx`.
- **Tipo:** Test

### T-28 — Testar apresentação do clima atual
- **ID:** T-28
- **Título:** Testar apresentação do clima atual
- **Descrição:** Cobrir campos disponíveis e ausentes do painel atual.
- **Critérios de aceite:**
  - Valores fornecidos são exibidos; campo ausente mostra “Não disponível”.
  - Estado de erro atual não esconde conteúdo de outra seção.
- **Dependências:** T-16, T-17.
- **Arquivos prováveis:** `tests/components/CurrentWeather.test.tsx`.
- **Tipo:** Test

### T-29 — Testar apresentação da previsão diária
- **ID:** T-29
- **Título:** Testar apresentação da previsão diária
- **Descrição:** Cobrir cinco slots, dados ausentes e apresentação de datas.
- **Critérios de aceite:**
  - Cinco dias são apresentados em ordem local.
  - Slot/dado indisponível mantém a posição e é rotulado como indisponível.
- **Dependências:** T-18.
- **Arquivos prováveis:** `tests/components/DailyForecast.test.tsx`.
- **Tipo:** Test

### T-30 — Testar unidade e composição da tela
- **ID:** T-30
- **Título:** Testar unidade e composição da tela
- **Descrição:** Verificar alternância de unidade e integração da tela principal.
- **Critérios de aceite:**
  - Todas as temperaturas alternam entre Celsius e Fahrenheit sem request adicional.
  - App compõe busca, feedback e painéis conforme a cidade selecionada.
- **Dependências:** T-19.
- **Arquivos prováveis:** `tests/components/UnitSelector.test.tsx`, `tests/components/App.test.tsx`.
- **Tipo:** Test

### T-31 — Testar fluxo E2E e viewports
- **ID:** T-31
- **Título:** Testar fluxo E2E e viewports
- **Descrição:** Validar o fluxo completo com APIs Open-Meteo interceptadas.
- **Critérios de aceite:**
  - `tests/e2e/weather.spec.ts` cobre envio pelo botão Buscar, seleção explícita, região “Previsão de 5 dias” e conversão de `0,0 °C` para `32,0 °F`.
  - Playwright cobre busca válida, seleção por coordenadas, forecast de cinco dias, retry/erro e troca para Fahrenheit sem novo request de forecast.
  - O fluxo é executado em 320 px e 375 px (mobile), além de 768 px e 1280 px; nenhuma largura tem rolagem horizontal.
  - Cada viewport usa contexto isolado; requisições externas sem mock falham explicitamente e a conversão verifica todos os dias, incluindo retorno a Celsius.
- **Dependências:** T-17, T-18, T-19, T-20, T-21, T-22, T-23, T-24, T-25, T-26, T-27, T-28, T-29, T-30.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test

## Entrega 8 — Hardening

### T-32 — Verificar compatibilidade de navegadores
- **ID:** T-32
- **Título:** Verificar compatibilidade de navegadores
- **Descrição:** Executar os fluxos principais nos navegadores exigidos pela spec.
- **Critérios de aceite:**
  - Relatório registra execução dos fluxos principais nas duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari.
  - Se CI não executar Safari, a validação em Safari real é anexada; limitação documentada sem essa execução não conta como aprovação.
- **Dependências:** T-31.
- **Arquivos prováveis:** `playwright.config.ts`, `tests/e2e/weather-app.spec.ts`.
- **Tipo:** Test

### T-33 — Verificar acessibilidade dos fluxos
- **ID:** T-33
- **Título:** Verificar acessibilidade dos fluxos
- **Descrição:** Validar teclado, nomes acessíveis e anúncios de estado nos fluxos principais.
- **Critérios de aceite:**
  - Checklist registra resultado de teclado, nome acessível, loading/status, erro/alert e leitura dos dados para busca, seleção e unidade.
  - Achados WCAG 2.2 AA têm correção verificada ou status de bloqueio registrado antes do release.
- **Dependências:** T-31.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`.
- **Tipo:** Test

### T-34 — Medir performance conforme NFR-03
- **ID:** T-34
- **Título:** Medir performance conforme NFR-03
- **Descrição:** Executar o perfil de rede simulado definido na spec.
- **Critérios de aceite:**
  - São feitas 100 execuções com latência, banda e resposta simuladas conforme NFR-03.
  - Pelo menos 95 exibem resultado final em até três segundos após envio.
- **Dependências:** T-31.
- **Arquivos prováveis:** `tests/e2e/performance.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test

### T-35 — Configurar verificação sintética do shell
- **ID:** T-35
- **Título:** Configurar verificação sintética do shell
- **Descrição:** Monitorar disponibilidade do shell separadamente das consultas ao provedor.
- **Critérios de aceite:**
  - Verificação automática executa a cada cinco minutos contra a URL implantada e confirma carregamento do shell.
  - Relatório mensal calcula taxa de sucesso do shell separadamente das chamadas à API e compara o resultado com a meta de 99,5%.
- **Dependências:** T-31; requer URL implantada e mecanismo de CI/monitoramento definido.
- **Arquivos prováveis:** `.github/workflows/` ou configuração da ferramenta de monitoramento a definir.
- **Tipo:** Infra

## Rastreabilidade

Cada ID abaixo aponta para os requisitos funcionais (FR), critérios de aceite (AC) ou requisitos não funcionais (NFR) que seu aceite ajuda a demonstrar. `Overview`, `Risks` e `Open Questions` identificam gates do documento sem ID formal.

| Tarefa | Requisitos da spec |
|---|---|
| T-01 | Overview (termos, cobertura, limites e atribuição); Risks (Open-Meteo) |
| T-02 | FR-04, AC-05; NFR-01 a NFR-06; Open Questions |
| T-03 | Overview (arquitetura sem backend); Risks (termos, cotas e políticas do provedor) |
| T-04 | FR-01, FR-02, FR-03, FR-04; AC-11 |
| T-05 | FR-03; AC-04, AC-11; Edge Cases (virada de dia); NFR-07 |
| T-06 | FR-04; AC-05; NFR-07 |
| T-07 | FR-02, FR-03; AC-03, AC-04; NFR-07 |
| T-08 | FR-01; AC-02, AC-08; Edge Cases (cidades homônimas) |
| T-09 | FR-02, FR-03; AC-03, AC-04, AC-11 |
| T-10 | FR-01, FR-06, FR-07; AC-01, AC-08, AC-09, AC-10; NFR-04, NFR-07 |
| T-11 | FR-02, FR-03, FR-05, FR-06, FR-07; AC-03, AC-04, AC-06, AC-09, AC-10, AC-11; NFR-04 |
| T-20 | AC-04, AC-11; Edge Cases (virada de dia) |
| T-21 | FR-04; AC-05; NFR-07 |
| T-22 | FR-02, FR-03; AC-03, AC-04; NFR-07 |
| T-23 | AC-02, AC-03, AC-04, AC-11 |
| T-24 | AC-01, AC-08, AC-09, AC-10; NFR-04 |
| T-12 | FR-01, FR-06, FR-07; AC-01, AC-08, AC-09 |
| T-13 | FR-02, FR-03, FR-04, FR-05, FR-06, FR-07; AC-05, AC-06, AC-07, AC-09, AC-11 |
| T-14 | FR-01; AC-01, AC-02; NFR-02 |
| T-15 | FR-06, FR-07; AC-07, AC-08, AC-09; NFR-02 |
| T-16 | FR-02; AC-03, AC-11; NFR-02, NFR-07 |
| T-17 | FR-01, FR-02, FR-06, FR-07; AC-01, AC-02, AC-03, AC-07, AC-08, AC-09; NFR-01, NFR-02 |
| T-18 | FR-03; AC-04, AC-11; NFR-02, NFR-07 |
| T-19 | FR-04; AC-05; NFR-02 |
| T-25 | FR-01, FR-06, FR-07; AC-01, AC-08, AC-09 |
| T-26 | FR-05, FR-06, FR-07; AC-06, AC-07, AC-09, AC-11 |
| T-27 | FR-01, FR-06, FR-07; AC-01, AC-02, AC-07, AC-08, AC-09; NFR-02 |
| T-28 | FR-02; AC-03, AC-11; NFR-02 |
| T-29 | FR-03; AC-04, AC-11; NFR-02, NFR-07 |
| T-30 | FR-04; AC-05; NFR-02 |
| T-31 | FR-01 a FR-07; AC-01 a AC-11; NFR-01, NFR-02 |
| T-32 | NFR-06 |
| T-33 | NFR-02; FR-06; AC-07, AC-09 |
| T-34 | NFR-03 |
| T-35 | NFR-05 |

## Requisitos funcionais → tarefas

| Requisito | Tarefas de implementação | Tarefas de verificação |
|---|---|---|
| FR-01 — Buscar e selecionar cidade | T-04, T-08, T-10, T-12, T-14, T-17 | T-23, T-24, T-25, T-27, T-31 |
| FR-02 — Consultar clima atual | T-04, T-07, T-09, T-11, T-13, T-16, T-17 | T-22, T-23, T-24, T-26, T-28, T-31 |
| FR-03 — Consultar previsão | T-04, T-05, T-07, T-09, T-11, T-13, T-18 | T-20, T-22, T-23, T-24, T-26, T-29, T-31 |
| FR-04 — Alternar unidade de temperatura | T-04, T-06, T-13, T-19 | T-21, T-30, T-31 |
| FR-05 — Atualizar cidade consultada | T-11, T-13, T-17 | T-26, T-31 |
| FR-06 — Informar estados da consulta | T-10, T-11, T-12, T-13, T-15, T-17 | T-24, T-25, T-26, T-27, T-31, T-33 |
| FR-07 — Repetir consulta com falha | T-12, T-13, T-15, T-17 | T-24, T-25, T-26, T-27, T-31 |

**Cobertura:** todos os requisitos funcionais FR-01 a FR-07 têm tarefas de implementação e verificação associadas; nenhum está sem tarefa correspondente.

**Prioridade e tamanho**

P0 desbloqueia a primeira fatia visível; P1 completa os fluxos de produto restantes; P2 cobre hardening operacional. P2 não significa opcional: seus gates continuam necessários antes de produção quando aplicáveis. Tamanho relativo: P = pequeno, M = médio, G = grande.

| Tarefa | Prioridade | Tamanho |
|---|---|---|
| T-01 | P0 | M |
| T-02 | P0 | M |
| T-03 | P0 | P |
| T-04 | P0 | P |
| T-05 | P0 | M |
| T-06 | P1 | P |
| T-07 | P0 | M |
| T-08 | P0 | M |
| T-09 | P0 | G |
| T-10 | P0 | M |
| T-11 | P0 | M |
| T-12 | P0 | M |
| T-13 | P0 | G |
| T-14 | P0 | M |
| T-15 | P0 | P |
| T-16 | P0 | M |
| T-17 | P0 | M |
| T-18 | P1 | M |
| T-19 | P1 | M |
| T-20 | P0 | M |
| T-21 | P1 | P |
| T-22 | P0 | P |
| T-23 | P0 | M |
| T-24 | P0 | M |
| T-25 | P0 | M |
| T-26 | P0 | M |
| T-27 | P0 | M |
| T-28 | P0 | P |
| T-29 | P1 | P |
| T-30 | P1 | M |
| T-31 | P1 | G |
| T-32 | P2 | G |
| T-33 | P1 | M |
| T-34 | P2 | G |
| T-35 | P2 | G |

**Sequência de fatias verticais**

| Fatia | Entrega visível | Tarefas de implementação | Verificação da fatia |
|---|---|---|---|
| 1 — Busca e clima atual (P0) | Pesquisar e selecionar uma cidade, consultar coordenadas e exibir condições atuais com loading, vazio e retry. | T-01 a T-05, T-07 a T-17 | T-20, T-22 a T-28 |
| 2 — Previsão diária (P1) | Acrescentar cinco dias locais, com dados parciais e datas ausentes mantidas na posição. | T-18 | T-29 |
| 3 — Unidade de temperatura (P1) | Alternar todas as temperaturas entre °C e °F sem novo request. | T-06, T-19 | T-21, T-30 |
| 4 — Validação de release | Validar o fluxo completo e os requisitos operacionais antes de produção. | Sem novas funcionalidades | T-31 a T-35 |

Entregar cada fatia após sua verificação focada; executar T-31 a T-35 como fechamento de release. A primeira tela útil fica disponível após T-17, sem aguardar previsão diária ou seletor de unidade.
