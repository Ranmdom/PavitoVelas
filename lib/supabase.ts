import { createClient } from '@supabase/supabase-js'

// Configuração do cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Nome do bucket onde as imagens serão armazenadas
export const BUCKET_NAME = 'produtos'

// Cliente Supabase para uso no frontend
export const supabase = createClient(supabaseUrl, supabaseKey)

// Função para fazer upload de uma imagem para o Supabase
export async function uploadImagem(file: File, produtoId: number, fileName?: string): Promise<string> {
  // Gera um nome único para o arquivo baseado no timestamp e nome original
  const nomeArquivo = fileName || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
  const caminhoCompleto = `produto_${produtoId}/${nomeArquivo}`
  
  // Faz o upload do arquivo para o bucket
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(caminhoCompleto, file, {
      cacheControl: '3600',
      upsert: true
    })
  
  if (error) {
    console.error('Erro ao fazer upload:', error)
    throw new Error(`Erro ao fazer upload da imagem: ${error.message}`)
  }
  
  // Retorna o caminho do arquivo no Supabase
  return data?.path || ''
}

// Função para excluir uma imagem do Supabase
export async function excluirImagem(caminho: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([caminho])
  
  if (error) {
    console.error('Erro ao excluir imagem:', error)
    throw new Error(`Erro ao excluir a imagem: ${error.message}`)
  }
}

// Função para obter a URL pública de uma imagem
export function obterUrlImagem(caminho: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(caminho)
  
  return data.publicUrl
}
