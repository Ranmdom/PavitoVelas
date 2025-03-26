import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL= "https://zgtqpisusyupfcegrcnh.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndHFwaXN1c3l1cGZjZWdyY25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDk5MjQsImV4cCI6MjA1ODA4NTkyNH0.FyLsKds9F85RKAQLxRiXXgRLCgthWcZj3eQoKktvs7Q" // Usar a public key (para upload no front)
)

interface Iparams {
  params: {
    id: string
  }
}

// POST - Upload da imagem
export async function POST(req: NextRequest, { params }: Iparams) {
  const produtoId = params.id

  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'Arquivo não enviado.' }, { status: 400 })
  }

  const filePath = `produtos/${produtoId}/${file.name}`

  const { data, error } = await supabase
    .storage // CORRIGIDO (você escreveu `storege`)
    .from('produtos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao fazer upload da foto.' }, { status: 500 })
  }

  return NextResponse.json({ path: data.path })
}

// GET - Lista imagens do produto
export async function GET(req: NextRequest, { params }: Iparams) {
  const produtoId = params.id

  const { data, error } = await supabase
    .storage
    .from('produtos')
    .list(`produtos/${produtoId}`) // CORRETO, você usou a pasta inteira no path

  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao listar fotos.' }, { status: 500 })
  }

  const fotos = data.map((file: any) => ({
    nome: file.name,
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produtos/${produtoId}/${file.name}`
    // CORRIGIDO: precisa do caminho completo da imagem
  }))

  return NextResponse.json(fotos)
}

// DELETE - Remove uma imagem
export async function DELETE(req: NextRequest, { params }: Iparams) {
  const produtoId = params.id
  const { nome } = await req.json()

  const { error } = await supabase
    .storage
    .from('produtos')
    .remove([`produtos/${produtoId}/${nome}`]) // CORRETO

  if (error) {
    return NextResponse.json({ error: 'Erro ao deletar a foto.' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Foto deletada com sucesso.' })
}
