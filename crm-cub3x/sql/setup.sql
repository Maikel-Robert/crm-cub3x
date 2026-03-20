-- =============================================
-- CRM cub3x — Setup Supabase
-- Cole este SQL no SQL Editor do Supabase
-- =============================================

-- 1. CRIAR TABELA DE COLUNAS (fases do kanban)
create table if not exists public.columns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#4A4A5A',
  position integer not null default 0,
  created_at timestamptz default now()
);

-- 2. CRIAR TABELA DE PROSPECTS
create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  niche text,
  phone text,
  address text,
  stars numeric(2,1),
  reviews integer default 0,
  pitch text,
  details text,
  followup_date date,
  column_id uuid references public.columns(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. DESABILITAR RLS (acesso público compartilhado)
alter table public.columns enable row level security;
alter table public.prospects enable row level security;

create policy "allow all columns" on public.columns for all using (true) with check (true);
create policy "allow all prospects" on public.prospects for all using (true) with check (true);

-- 4. SEED: COLUNAS PADRÃO
insert into public.columns (name, color, position) values
  ('Não Contatado', '#4A4A5A', 0),
  ('Em Contato',    '#5AB8E8', 1),
  ('Proposta Env.', '#F0A830', 2),
  ('Negociação',    '#A070E8', 3),
  ('Fechado ✓',     '#40C870', 4);

-- 5. SEED: 44 PROSPECTS
-- (Coloca todos na coluna "Não Contatado" por padrão)
do $$
declare col_id uuid;
begin
  select id into col_id from public.columns where name = 'Não Contatado' limit 1;

  insert into public.prospects (name, niche, phone, address, stars, reviews, pitch, column_id) values

  -- ODONTO
  ('Centro Odontológico Pio XII', 'odonto', '(41) 3232-6195', 'Av. Silva Jardim, 1347 — Rebouças', 4.6, 1741,
   'Vocês têm mais de 1.700 avaliações no Google — uma das clínicas com maior reputação de Curitiba, construída ao longo de mais de 40 anos. O problema é que toda essa credibilidade fica presa dentro do Google. Um site profissional transformaria esse histórico em argumento de conversão real: quem pesquisa o nome de vocês encontra um blog de 2013. Com o volume de atendimento de vocês, cada paciente a mais que um site converte já paga o investimento no primeiro mês.', col_id),

  ('Clinicare Centro de Atendimento à Saúde', 'odonto', '(41) 3023-9800', 'R. Gen. Carneiro, 990 — Alto da Glória', 3.7, 130,
   'Quando alguém pesquisa "dentista 24h Curitiba", a Clinicare aparece. Mas o que o paciente encontra quando clica? Nenhuma página de vocês — só diretórios genéricos. Um site bem feito apresenta a equipe, os horários de emergência e os diferenciais, e converte o visitante antes que ele vá para o concorrente.', col_id),

  ('Dra. Rosangela Polonio Lopes', 'odonto', '(41) 3222-7725', 'R. José Loureiro, 133 sl. 1212 — Centro', 5.0, 50,
   'Dra. Rosangela, a senhora tem nota 5.0 com avaliações que falam em confiança e décadas de cuidado. Só que quem pesquisa "periodontista no Centro de Curitiba" não encontra a senhora, encontra o Doctoralia. Um site próprio coloca a senhora no controle da sua imagem digital e atrai o perfil de paciente particular que valoriza exatamente o que você oferece.', col_id),

  ('Dra. Katia Lourenço', 'odonto', '(41) 99627-7433', 'Av. Cândido de Abreu, 660 sl. 506 — Centro Cívico', 5.0, 6,
   'Dra. Katia, sua nota é perfeita — mas com 6 avaliações, quem ainda não te conhece não tem como saber disso. Você atende 24h, faz harmonização facial e endodontia em região nobre de Curitiba. Cada serviço tem pessoas buscando agora mesmo no Google, e sem um site esse tráfego vai direto para a concorrência.', col_id),

  -- DEDETIZAÇÃO
  ('WP Controle de Pragas Urbanas', 'dedet', '(41) 99940-2994', 'R. Raul Félix, 451 — Portão', 5.0, 65,
   'William, você tem nota 5.0 e seus clientes fazem questão de citar seu nome nas avaliações — isso é raro. Mas hoje quem busca "dedetização Portão Curitiba" no Google não chega até você: chega nas empresas grandes com site. Um site simples com suas avaliações e serviços muda isso completamente.', col_id),

  ('Dedetizador Curitiba — Alto da XV', 'dedet', '(41) 99172-1382', 'R. XV de Novembro, 2359 — Alto da XV', 5.0, 24,
   'Nota 5.0 com clientes elogiando a equipe, o preço e o profissionalismo. Só que no Google, quem busca dedetização na região encontra concorrentes com site antes de chegar até vocês. Um site com as avaliações reais de vocês, lista de serviços e botão de WhatsApp seria suficiente para dobrar o volume de contatos.', col_id),

  ('Líder Dedetizadora', 'dedet', '(41) 3256-3422', 'R. Enemézio do Rosário Jr., 438 — Atuba, Colombo', 4.9, 777,
   'São quase 800 avaliações, uma equipe que emite nota fiscal e tem planos de manutenção. Isso é credibilidade corporativa — mas sem um site, vocês perdem clientes empresariais que exigem presença digital antes de fechar contrato. Condomínios e restaurantes pesquisam online antes de contratar.', col_id),

  ('Biotrat Dedetização e Controle de Pragas', 'dedet', '(41) 3732-4868', 'R. Corbélia, 1475 — Alto Tarumã, Pinhais', 4.9, 149,
   'Vocês atendem condomínios com laudos técnicos, NR33 e NR35 — esse é o perfil de empresa que faz parceria de longo prazo. Um site que exiba as certificações, os serviços para condomínios e os laudos torna o processo de aprovação muito mais fácil junto às administradoras.', col_id),

  ('Dedetizadora Curitiba — Smag Inset', 'dedet', '(41) 99284-3948', 'R. Cristiano Strobel, 105 — Xaxim', 4.9, 38,
   'Clientes que voltam há anos e recomendam sem hesitar — essa fidelização é seu maior ativo. Um site com depoimentos reais, plano de manutenção preventiva e formulário de agendamento transforma esses clientes fiéis em prova social que convence novos clientes antes mesmo do primeiro contato.', col_id),

  -- AUTO ELÉTRICA
  ('MG Car Auto Elétrica', 'autoele', '(41) 99133-5386', 'R. Prof. Nivaldo Braga, 629 — Cajuru', 4.7, 172,
   'Vocês atendem de madrugada, domingo, feriado — e o relato de clientes que viajam 3.000 km e voltam satisfeitos diz muito. Uma landing page simples com horário de atendimento 24h, serviços de emergência e botão de WhatsApp seria a vitrine certa para capturar quem pesquisa socorro elétrico com urgência.', col_id),

  ('Gavale Auto Elétrica', 'autoele', '(41) 3039-6121', 'R. Frei Henrique de Coimbra, 1237 — Hauer', 5.0, 11,
   'Nota 5.0, preço justo, profissionalismo reconhecido. O problema é que 11 avaliações não geram volume de busca suficiente para aparecer no Google fora do Maps. Um site local bem feito com foco em "auto elétrica Hauer" e bairros próximos pode dobrar o alcance de vocês.', col_id),

  ('Formosa Auto Elétrica', 'autoele', '(41) 3022-1397', 'R. Vieira Fazenda, 850 — Portão', 4.8, 18,
   'Clientes elogiam serviço honesto e preço acessível — dois atributos difíceis de transmitir antes do primeiro contato. Um site que mostre isso, com depoimentos reais e lista de serviços, cria essa percepção antes mesmo de ligarem.', col_id),

  ('Auto Elétrica Milek', 'autoele', '(41) 99963-8516', 'R. João Gbur, 1468 — Santa Cândida', 4.9, 11,
   '"Melhor auto elétrica de Curitiba" — isso foi dito por um cliente. Mas essa frase só aparece no Google Maps. Um site simples que capture essa reputação e apareça em buscas de bairros próximos pode transformar o boca-a-boca em demanda digital consistente.', col_id),

  ('Auto Elétrica — Cajuru', 'autoele', 'Verificar no Google Maps', 'R. Dante Melara, 2061 — Cajuru', 4.8, 27,
   'Atendimento rápido, eficaz e preço justo — o tripé que gera fidelização. Ivan é citado pessoalmente nas avaliações, o que mostra vínculo com o cliente. Um site com foco em "elétrica automotiva Cajuru" seria suficiente para dobrar o número de consultas digitais.', col_id),

  -- SOM AUTOMOTIVO
  ('JM Sound Car', 'som', '(41) 98446-7097', 'R. São José dos Pinhais, 295 — Sítio Cercado', 5.0, 79,
   'Nota 5.0, trabalhos de película em janela de casa, insulfilm em GPS de moto sem cobrar — vocês tratam cada detalhe como se fosse o próprio carro. Mas quem procura "instalação de som Sítio Cercado" no Google não encontra vocês. Um site com fotos dos trabalhos seria o portfólio que ainda falta.', col_id),

  ('MT Films — Insulfilm e Som Automotivo', 'som', '(41) 3206-4259', 'R. Clara Polsin, 829 — Novo Mundo', 4.9, 74,
   'Peter e Rafael são citados pelo nome, mandam vídeo do serviço, buscam o carro do cliente para finalizar. Esse é um serviço premium. Um portfólio online com fotos de antes e depois e as avaliações reais capturaria clientes que buscam qualidade e não apenas o menor preço.', col_id),

  ('Rally Sound', 'som', '(41) 3225-3537', 'R. Dr. Reynaldo Machado, 687 — Rebouças', 4.8, 476,
   'Quase 500 avaliações numa loja de som automotivo em Rebouças — isso é volume de confiança significativo. Um site com catálogo de marcas trabalhadas, galeria de instalações e tabela de serviços transformaria esse histórico em argumento de compra antes do primeiro contato telefônico.', col_id),

  ('Audio Power', 'som', '(41) 3092-8258', 'R. Delegado Leopoldo Belczak, 1436 — Capão da Imbuia', 4.9, 491,
   'Phelipe é descrito como alguém que "ama o que faz" e entrega além do esperado — isso é posicionamento de especialista. Com quase 500 avaliações, um site com portfólio, marcas trabalhadas e serviços seria a diferença entre ser apenas conhecido e ser referência online.', col_id),

  ('Ekipcar Equipamentos Automotivos', 'som', '(41) 3077-8844', 'Av. Pres. Getúlio Vargas, 2309 — Água Verde', 4.8, 283,
   'Luís e Léo atendem há quase 10 anos os mesmos clientes — inclusive com marcenaria de porta-malas personalizada. Esse nível de customização e especialização precisa de um portfólio visual. Um site com galeria de projetos seria um argumento de venda poderoso.', col_id),

  -- ARMARINHOS
  ('Armarinhos Nodari', 'armar', '(41) 99111-4859', 'R. José Loureiro, 370 — Centro', 4.7, 4122,
   'São mais de 4.000 avaliações — um dos estabelecimentos de armarinhos com maior reputação de Curitiba. Sem um site vocês perdem o cliente que pesquisa "comprar linha para crochê online" ou "armarinho com estoque de tecidos em Curitiba". Um site com catálogo e WhatsApp capturaria esse público.', col_id),

  ('Switta Armarinhos e Artesanatos', 'armar', '(41) 99932-1321', 'R. Emiliano Perneta, 147 — Centro', 4.3, 1757,
   '30 anos de mercado, quase 2.000 avaliações e 3.500 seguidores no Instagram — mas sem site próprio. O público de artesanato e costura é altamente ativo online. Um site com blog de dicas, catálogo de produtos poderia transformar esse engajamento em vendas digitais.', col_id),

  ('Armarinhos Mariartes', 'armar', '(41) 3024-8535', 'R. São Francisco, 204 — Centro', 4.7, 475,
   'Clientes vêm de longe até a loja, descrevem como "paraíso para artesanato". Um site com catálogo de aviamentos, tecidos e artigos de crochê — com possibilidade de reserva — abriria a loja para quem é de outros bairros e regiões.', col_id),

  ('Armarinhos Curitiba e Tecidos', 'armar', '(41) 98495-9989', 'Tv. Tobias de Macedo, 109 — Centro', 4.2, 236,
   'Uma loja de referência no Centro com costureira no local e vasta variedade de tecidos. Um site simples com foto do espaço, serviços da costureira, tipos de tecidos e WhatsApp seria suficiente para capturar o cliente que pesquisa antes de ir ao Centro.', col_id),

  ('Armarinhos Central', 'armar', '(41) 3322-9872', 'Al. Dr. Muricy, 465 — Centro', 4.4, 114,
   'Bordado personalizado na hora, toalhas com nome, atendimento em inglês — isso é diferencial claro e nichado. Turistas e clientes internacionais pesquisam online antes de sair. Um site bilíngue simples com galeria dos trabalhos seria suficiente para capturar esse público premium.', col_id),

  -- CLÍNICA MÉDICA
  ('Dra. Isabela Polonio Lopes — Médica', 'clinmed', '(41) 98744-5434', 'R. José Loureiro, 133 cj. 1213 — Centro', 5.0, 2,
   'Dra. Isabela, você aplica toxina botulínica e trabalha na medicina estética — um segmento onde a presença digital é praticamente obrigatória. Quem busca harmonização facial pesquisa o Instagram e o site do profissional antes de agendar. Um site com seus procedimentos e galeria de resultados seria o primeiro passo.', col_id),

  ('Dr. Glauco Moeckel — Clínico Geral', 'clinmed', '(41) 99611-5335', 'R. Emiliano Perneta, 860 sl. 903 — Centro', 5.0, 8,
   'Pacientes descrevem o Dr. Glauco como alguém que "trata como se fossem da família" e vêm consultando há 5 anos. Um site simples com a abordagem humanizada, forma de agendamento e horários tornaria essa reputação visível para novos pacientes que chegam pelo Google.', col_id),

  ('Dra. Ana Paula Ruthes — Clínica Geral', 'clinmed', '(41) 99919-0302', 'Av. do Batel, 1898 — Batel', 5.0, 1,
   'Uma única avaliação que cita que a atenção da Dra. Ana Paula salvou sua vida e a do bebê — o testemunho mais forte que existe. Sem site, quem pesquisa "médica pré-natal Curitiba" não vai encontrá-la. Um site que apresente sua especialidade pode converter buscas em pacientes fiéis.', col_id),

  ('Dr. Francisco Pascoal — Clínico Geral', 'clinmed', 'Consultar pelo Google Maps', 'Al. Pres. Taunay, 1741 — Batel', 4.3, 6,
   'Especialista em obesidade e reabilitação metabólica no Batel — nicho em alta explosiva. Pacientes que buscam esse tratamento pesquisam muito antes de escolher um médico. Um site com metodologia, resultados e agendamento seria o argumento de peso para atrair esse público.', col_id),

  ('Dr. Gustavo Jurca da Silva — Clínico Geral', 'clinmed', 'Consultar pelo Google Maps', 'R. Prof. Ephigênia do Rego Barros, 63 — Mercês', 5.0, 1,
   'Consultório nas Mercês, nota máxima, sem qualquer presença digital além do Maps. Um site bem posicionado para "médico Mercês Curitiba" pode ser o canal de aquisição principal para os primeiros 50 pacientes fixos.', col_id),

  -- JARDINAGEM
  ('Jardim Verde Jardinagem e Serviços', 'jard', '(41) 98769-6744', 'R. São José dos Pinhais, 190 — Sítio Cercado', 5.0, 64,
   'Atendimento no mesmo dia em que o cliente entrou em contato, trabalho caprichoso. Mas quem busca "jardinagem Sítio Cercado" ou "manutenção de jardim Curitiba" não vai encontrar vocês. Um site com fotos dos trabalhos e botão de orçamento pelo WhatsApp seria o suficiente.', col_id),

  ('Jotajardinagem', 'jard', '(41) 99675-3348', 'R. Oscar Schrappe Senior, 557 — Capão da Imbuia', 5.0, 13,
   'Nota 5.0, atende em sábado, serviço no mesmo dia, ajuda a cliente a planejar o próprio jardim. Esse nível de atendimento gera indicação — mas indicação tem limite. Um site com portfólio de antes e depois leva esse nível de qualidade para quem ainda não te conhece.', col_id),

  ('Arte Nativa Paisagismo', 'jard', '(41) 99974-4010', 'R. Gen. Aristides Athayde Jr., 530 — Bigorrilho', 5.0, 9,
   'Célia é descrita como paisagista com "sensibilidade e conhecimento profundo de plantas", que entrega muito além do combinado. Esse é o perfil de profissional que atrai o cliente de alto padrão — e esse cliente pesquisa online antes de contratar.', col_id),

  ('Jardinagem Curitiba — Abranches', 'jard', '(41) 99937-2315', 'R. Blaise Pascal, 96 — Abranches', 5.0, 16,
   'Nota máxima, atendimento 7 dias da semana das 7h às 19h, preço justo. Um site local focado nos bairros da região Norte — Abranches, Taboão, Bacacheri — seria o suficiente para posicioná-lo como referência em jardinagem nessa área.', col_id),

  ('Viva Verde Paisagismo e Jardinagem', 'jard', '(41) 99174-5158', 'R. John Foster Dulles, 215 — Seminário', 5.0, 2,
   'Matheus e Thiago são descritos com "profissionalismo, cuidado e sensibilidade" — avaliação que descreve design de jardins de verdade. Um site com portfólio de projetos e processo de trabalho seria o argumento de entrada para projetos de alto padrão.', col_id),

  -- MECÂNICA
  ('Socorro Mecânico e Elétrico 24h', 'mec', '(41) 99838-5853', 'R. Cruzeiro do Sul, 336 sl. 2 — Sítio Cercado', 5.0, 23,
   'Atendimento 24h, nota 5.0, preço justo, resolve no local. Quem precisa de socorro mecânico de madrugada não tem tempo de procurar — pesquisa no Google e liga para o primeiro que aparecer. Uma landing page com "socorro mecânico 24h Curitiba" no título captura exatamente esse momento.', col_id),

  ('Oficina Mecânica Mário', 'mec', '(41) 99103-1686', 'R. Des. Westphalen, 931 — Centro', 4.9, 140,
   'Marcelo é citado como "a melhor oficina de Curitiba" por quem passou por 4 outras sem solução. Com 140 avaliações e gravação de vídeo do serviço para o cliente acompanhar, vocês já têm o conteúdo. Um site que mostre esse processo com transparência seria um diferencial gigante.', col_id),

  ('AConcept Car Service — Oficina Mecânica', 'mec', '(41) 99937-8334', 'R. Dr. Carvalho Chaves, 683 — Parolin', 4.7, 244,
   'Mulheres que descrevem não se sentir enganadas na oficina — isso é posicionamento de mercado. Com 244 avaliações e reputação de transparência, vocês têm um nicho claro. Um site que comunique isso com linguagem acessível captiva exatamente esse público que pesquisa muito antes de confiar.', col_id),

  ('Carros Auto Center', 'mec', '(41) 3045-5050', 'R. Eng. Rebouças, 1981 — Rebouças', 4.9, 353,
   '353 avaliações com 4.9 de nota — a consistência é o diferencial de vocês. Clientes que mencionam troca de óleo com Motul e peças genuínas estão falando de posicionamento premium. Um site com lista de serviços, diferenciais e formulário de agendamento seria o canal que falta.', col_id),

  ('RP Serviços Automotivos', 'mec', '(41) 3333-2600', 'R. Des. Westphalen, 1642 — Rebouças', 4.7, 318,
   'Cliente há 13 anos, carro passa por essa porta e nenhuma outra — esse é o maior elogio que uma oficina pode receber. 318 avaliações e fidelização dessa magnitude mostram entrega consistente de qualidade e confiança. Um site que comunique essa história seria a apresentação perfeita para novos clientes.', col_id);

end $$;
