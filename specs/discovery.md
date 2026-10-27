# Discovery — Aplicação de previsão do tempo

## Contexto

A empresa deseja oferecer uma aplicação de previsão do tempo para que usuários consultem as condições meteorológicas de cidades de interesse. A experiência deve funcionar em dispositivos móveis e permitir a visualização do clima atual e da previsão para os próximos cinco dias.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade e selecione o resultado correspondente.
- **RF-02 — Consultar clima atual:** exibir as condições meteorológicas atuais da cidade selecionada.
- **RF-03 — Consultar previsão:** exibir a previsão para os próximos cinco dias da cidade selecionada.
- **RF-04 — Alternar unidades:** permitir alternar entre Celsius e Fahrenheit para as informações de temperatura.
- **RF-05 — Atualizar dados da cidade:** atualizar as informações exibidas quando o usuário selecionar outra cidade.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** oferecer uma experiência utilizável em dispositivos móveis.
- **RNF-02 — Usabilidade:** apresentar informações meteorológicas de forma clara e fácil de consultar.
- **RNF-03 — Acessibilidade:** tornar busca, seleção de cidade e alternância de unidades acessíveis por teclado e compatíveis com tecnologias assistivas.
- **RNF-04 — Feedback de estado:** informar ao usuário quando os dados estão carregando, quando ocorre um erro ou quando não há resultados.
- **RNF-05 — Consistência:** manter as temperaturas exibidas na unidade selecionada pelo usuário.

## Riscos

- Os dados meteorológicos podem estar indisponíveis, desatualizados ou sujeitos a limites do provedor.
- Nomes de cidades iguais ou semelhantes podem levar à seleção de uma localização incorreta.
- A previsão disponível pode variar conforme a localização ou o provedor de dados.
- Diferenças entre fusos horários podem causar confusão na interpretação dos dias da previsão.
- Uma interface responsiva pode não oferecer a mesma clareza em telas muito pequenas sem validação em diferentes dispositivos.

## Perguntas em Aberto

- A busca deve aceitar nomes em diferentes idiomas, acentos e localidades?
- Como diferenciar cidades homônimas: país, estado, região ou coordenadas?
- Quais informações devem compor o clima atual e cada dia da previsão?
- A previsão deve ser apresentada em visão diária, horária ou ambas? O período está definido como hoje mais os quatro dias seguintes.
- A preferência de unidade deve ser salva localmente entre sessões? Não haverá persistência em servidor nem sincronização entre dispositivos.
- O produto deve oferecer localização automática ou salvar cidades favoritas?
- Quais são as expectativas de atualização, disponibilidade e desempenho?

## Decisões

- **Fonte de dados — Open-Meteo, sem API key.** A escolha permite integrar dados meteorológicos sem gerenciar uma chave de API. Resolve a pergunta sobre o provedor; cobertura, limites e disponibilidade ainda devem ser considerados nos riscos.
- **Período da previsão — hoje mais os quatro dias seguintes.** Isso define quais datas compõem os cinco dias e evita interpretações diferentes do período. Não define se os dados serão apresentados por hora ou por dia.
- **Unidade padrão — Celsius.** É a unidade inicial da interface e evita deixar a escolha inicial indefinida. Não determina se a preferência será salva localmente.
- **Autenticação e persistência — sem autenticação e sem persistência em servidor.** Isso reduz o escopo inicial ao dispensar contas e armazenamento de dados do usuário no backend. Não decide se preferências ou cidades serão salvas localmente no dispositivo.
- **Idioma da interface — português do Brasil (pt-BR).** Isso define o idioma dos textos da UI. Não define os idiomas aceitos pela busca de cidades.

## Suposições

- A busca e a consulta de previsão são iniciadas pelo usuário, sem exigir localização automática.
- A unidade selecionada deve ser aplicada a todas as temperaturas exibidas.
- A aplicação dependerá do Open-Meteo para obter dados meteorológicos e de geocodificação.
- O suporte a dispositivos móveis implica layout responsivo, sem requisito de aplicativo nativo.
