Deploy: 

Troslei
Checklist: 

Obs: eu ainda vou fazer o pente fino e botar um V de verificado e um X de falta
## 1. Funcionalidades de Conta de Usuário
- [x ] Cadastro de usuário (fluxo de criação de conta)
- [x ] Login e logout
- [ ] Recuperação de senha por e-mail
- [x ] Atualização de perfil (nome, e-mail, senha, foto)
- [ ] Verificação de e-mail (link de confirmação)

## 2. Catálogo de Produtos
- [x ] Listagem de produtos por categoria
- [x ] Busca por nome, filtros e ordenação
- [x ] Páginas individuais de produto (imagens, descrição, preço, estoque)
- [x ] Variações de produto (tamanho, cor) e disponibilidade
- [x ] Produtos relacionados/sugeridos

## 3. Carrinho de Compras
- [x ] Adicionar e remover itens
- [x ] Atualizar quantidades
- [x ] Cálculo automático de subtotal, frete e impostos
- [ ] Mensagens de estoque insuficiente
- [x ] Persistência do carrinho (após logout ou fechamento do navegador)

## 4. Checkout e Pagamentos
- [x ] Seleção/gerenciamento de endereços de entrega
- [x ] Cálculo de frete (tabelas, correio, transportadora)
- [x ] Integração Stripe Checkout (pagamento aprovado e recusado)
- [ ] Boleto bancário (geração, vencimento, baixa automática)
- [ ] PIX (ou outro meio de pagamento)
- [ ] Testes de 3D Secure e autenticação adicional
- [x ] Fluxos de falha (cartão vencido, saldo insuficiente)
- [ ] Reembolsos (parcial e total)

## 5. Pedidos e Notificações
- [x ] Geração de pedido com número único
- [ ] Status do pedido (pendente, pago, em transporte, entregue)
- [ ] E-mails transacionais (confirmação, envio, cancelamento)
- [x ] Histórico de pedidos no painel do cliente
- [x ] Tela administrativa de gestão de pedidos

## 6. UX/UI e Responsividade
- [x ] Layout em desktop, tablet e mobile
- [x ] Compatibilidade cross-browser (Chrome, Firefox, Safari, Edge)
- [x ] Validações de formulário e mensagens de erro claras
- [x ] Tempo de carregamento de imagens e lazy loading
- [x ] Navegação, breadcrumbs e links internos
- [ ] Feedback visual em interações (botões, loading spinners)

## 7. Segurança
- [x ] HTTPS em todas as páginas (SSL configurado)
- [x ] Validação de entradas no front-end e back-end
- [ ] Proteção contra CSRF e XSS
- [ ] Proteção contra SQL Injection
- [ ] Políticas de senha (complexidade, bloqueio após tentativas)
- [x ] Autorização de rotas (acesso restrito para áreas administrativas)

## 8. Performance
- [x ] Tempo de carregamento da home e páginas críticas (< 2 s)
- [ ] Minificação e bundling de CSS/JS
- [x ] Compressão de imagens (WebP, lazy load)
- [ ] Cache HTTP e CDN configurados
- [ ] Monitoramento de uso de recursos (CPU, memória)

## 9. SEO e Metadados
- [ ] Títulos e descrições únicos (meta tags)
- [ ] URLs limpas e amigáveis
- [ ] Sitemap.xml e robots.txt atualizados
- [ ] Dados estruturados (schema.org para produtos e reviews)
- [ ] Open Graph e Twitter Cards para redes sociais

## 10. Acessibilidade
- [x ] Contraste de cores adequado
- [x ] Navegação por teclado completa
- [x ] Labels em todos os campos de formulário
- [x ] Textos alternativos (alt) em imagens
- [ ] Uso correto de roles e atributos ARIA

## 11. Integrações Externas
- [ ] ERP/CRM (sincronização de clientes e pedidos)
- [ ] Sistema de estoque (atualização de disponibilidade)
- [ ] Ferramentas de e-mail marketing (Mailchimp, RD Station)
- [ ] Google Analytics / Google Tag Manager
- [ ] Chat ao vivo ou suporte (Zendesk, Intercom)

## 12. Analytics e Monitoramento
- [ ] Eventos de e-commerce no GA4 configurados
- [ ] Funil de conversão e acompanhamento de checkout
- [ ] Logs de erros e alertas (Sentry, LogRocket)
- [ ] Uptime e performance (Pingdom, UptimeRobot)

## 13. Infraestrutura e Deploy
- [ ] Ambientes de staging e produção separados
- [ ] Pipeline de CI/CD com testes automatizados
- [ ] Scripts de build e deploy documentados
- [ ] Plano de rollback em caso de falha

## 14. Documentação e Suporte
- [ ] Manual de instalação e setup local
- [ ] Documentação das APIs (endpoints, exemplos)
- [ ] Guia de uso para equipe de atendimento
- [ ] Planos de contingência e contato de suporte


-----------------------------------------------------------------------

Checklist para melhor envio 

Variáveis de ambiente

Confirme seu .env.local contém:

bash
Copiar
Editar
MELHOR_ENVIO_ACCESS_TOKEN=…
STRIPE_SECRET_KEY=…
STRIPE_WEBHOOK_SECRET=…
NEXT_PUBLIC_BASE_URL=https://seusite.com
Instalação de dependências

bash
Copiar
Editar
npm install stripe micro
npm install --save-dev @types/micro
Registrar webhook na Stripe

No Dashboard da Stripe → Developers → Webhooks

Aponte para https://seusite.com/api/stripe-webhook

Selecione pelo menos checkout.session.completed

Copie o secret e coloque em STRIPE_WEBHOOK_SECRET

Endpoints de back-end

 /api/shipping-options → retorna packages do Melhor Envio

 /api/calculate-shipping → proxy para /shipment/calculate

 /api/checkout → cria pedido + cotação + sessão Stripe

 /api/stripe-webhook → reserva, paga frete e atualiza pedido

Front-end: exibir opções de frete

Chamar POST /api/shipping-options com { postalCode, items }

Renderizar a lista de packages (serviço + preço) num dropdown ou botões

Front-end: checkout

Ao submeter, chamar POST /api/checkout passando { items, postalCode, shippingServiceId }

Redirecionar para a url retornada (Checkout Stripe)

Página de sucesso

Criar rota /pedido/sucesso?session_id=…

Opcional: buscar dados da Stripe (stripe.checkout.sessions.retrieve) para mostrar confirmação

Testes em sandbox

Verificar cotação → criação de sessão → webhook dispara reserva/pagamento → pedido atualiza para “pago”

Conferir no painel Melhor Envio se o envio foi cadastrado corretamente

Go-live

Trocar URLs do Melhor Envio de sandbox para produção (api.melhorenvio.com.br)

Usar chaves live da Stripe (sk_live_…)

Atualizar NEXT_PUBLIC_BASE_URL para seu domínio definitivo

Tratamento de erros & monitoramento

Adicionar logs no front para falhas de fetch

Configurar alertas de 500 no backend (Sentry, LogRocket…)

Validar cenários de falha no webhook (retries, idempotência)
