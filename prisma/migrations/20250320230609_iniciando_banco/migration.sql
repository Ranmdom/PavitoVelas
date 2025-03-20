-- CreateTable
CREATE TABLE "Usuario" (
    "usuarioId" BIGSERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "sobrenome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("usuarioId")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "categoriaId" BIGSERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("categoriaId")
);

-- CreateTable
CREATE TABLE "Produto" (
    "produtoId" BIGSERIAL NOT NULL,
    "categoriaId" BIGINT,
    "nome" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "fragrancia" TEXT,
    "tempoQueima" INTEGER,
    "descricao" TEXT,
    "peso" DECIMAL(10,2),
    "altura" DECIMAL(10,2),
    "largura" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("produtoId")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "pedidoId" BIGSERIAL NOT NULL,
    "usuarioId" BIGINT NOT NULL,
    "statusPedido" TEXT NOT NULL,
    "dataPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataEnvio" TIMESTAMP(3),
    "valorTotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("pedidoId")
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "itemPedidoId" BIGSERIAL NOT NULL,
    "pedidoId" BIGINT NOT NULL,
    "produtoId" BIGINT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("itemPedidoId")
);

-- CreateTable
CREATE TABLE "MetodoPagamento" (
    "metodoPagamentoId" BIGSERIAL NOT NULL,
    "usuarioId" BIGINT NOT NULL,
    "nomeMetodo" TEXT,
    "numeroCartao" TEXT,
    "dataExpiracao" TEXT,
    "nomeTitular" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MetodoPagamento_pkey" PRIMARY KEY ("metodoPagamentoId")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "pagamentoId" BIGSERIAL NOT NULL,
    "pedidoId" BIGINT NOT NULL,
    "metodoPagamentoId" BIGINT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusPagamento" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("pagamentoId")
);

-- CreateTable
CREATE TABLE "Endereco" (
    "enderecoId" BIGSERIAL NOT NULL,
    "usuarioId" BIGINT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "bairro" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Endereco_pkey" PRIMARY KEY ("enderecoId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("categoriaId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("usuarioId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("pedidoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("produtoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetodoPagamento" ADD CONSTRAINT "MetodoPagamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("usuarioId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("pedidoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_metodoPagamentoId_fkey" FOREIGN KEY ("metodoPagamentoId") REFERENCES "MetodoPagamento"("metodoPagamentoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endereco" ADD CONSTRAINT "Endereco_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("usuarioId") ON DELETE RESTRICT ON UPDATE CASCADE;
