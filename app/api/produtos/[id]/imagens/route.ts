import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service_role só no backend
);

interface Iparams {
  params: {
    id: string; // ID do Pedido
  };
}

// POST - Upload da imagem + Atualiza o array no banco
export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const produtoId = context.params.id;
  const formData = await req.formData();
  const files = formData.getAll("imagens") as File[]; // <-- aceita vários arquivos

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const uploadedUrls: string[] = [];

  for (const file of files) {
    const filePath = `produtos/${produtoId}/${file.name}`;

    const { data, error } = await supabase
      .storage
      .from("produtos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Erro ao enviar imagem:", error);
      continue; // tenta enviar as outras mesmo se uma falhar
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produtos/${filePath}`;
    uploadedUrls.push(publicUrl);
  }

  // Atualiza o array no banco com as novas imagens:
  const { data: pedido, error: pedidoError } = await supabase
    .from("Produto")
    .select("imagens")
    .eq("produtoId", produtoId)
    .single();

  if (pedidoError) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const imagensAtualizadas = Array.isArray(pedido.imagens)
    ? [...pedido.imagens, ...uploadedUrls]
    : [...uploadedUrls];

  const { error: updateError } = await supabase
    .from("Produto")
    .update({ imagens: imagensAtualizadas })
    .eq("produtoId", produtoId);

  if (updateError) {
    return NextResponse.json({ error: "Erro ao atualizar o pedido com as imagens." }, { status: 500 });
  }

  return NextResponse.json({ urls: uploadedUrls });
}


// DELETE - Remove a imagem do bucket e atualiza o banco
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { params } = await context;
  const produtoId = params.id;

  const { nome } = await req.json(); // nome = nome do arquivo, ex: 'foto1.jpg'

  const filePath = `produtos/${produtoId}/${nome}`;

  // 1. Remove do storage
  const { error: deleteError } = await supabase
    .storage
    .from("produtos")
    .remove([filePath]);

  if (deleteError) {
    return NextResponse.json({ error: "Erro ao deletar a imagem do bucket." }, { status: 500 });
  }

  // 2. Atualiza o array no banco (remove a imagem do array)
  const { data: pedido, error: pedidoError } = await supabase
    .from("Produto")
    .select("imagens")
    .eq("produtoId", produtoId)
    .single();

  if (pedidoError) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produtos/${filePath}`;

  const imagensAtualizadas = (pedido.imagens || []).filter((url: string) => url !== publicUrl);

  const { error: updateError } = await supabase
    .from("Produto")
    .update({ imagens: imagensAtualizadas })
    .eq("produtoId", produtoId);

  if (updateError) {
    return NextResponse.json({ error: "Erro ao atualizar o pedido após deletar imagem." }, { status: 500 });
  }

  return NextResponse.json({ message: "Imagem deletada e banco atualizado com sucesso." });
}
