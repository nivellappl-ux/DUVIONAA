'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { calcularTotalFatura, gerarNumeroFatura } from '@/lib/angola'
import { z } from 'zod'

const ItemSchema = z.object({
    produto_id: z.string().uuid().optional(),
    descricao: z.string().min(1),
    quantidade: z.number().positive(),
    preco_unitario: z.number().positive(),
    taxa_iva: z.number().min(0).max(100).default(14),
    desconto_pct: z.number().min(0).max(100).default(0),
})

const FaturaSchema = z.object({
    cliente_id: z.string().uuid().optional(),
    cliente_nome: z.string().min(1, 'Nome do cliente obrigatório'),
    cliente_nif: z.string().optional(),
    data_emissao: z.string(),
    data_vencimento: z.string().optional(),
    notas: z.string().optional(),
    itens: z.array(ItemSchema).min(1, 'Adicione pelo menos um item'),
})

export async function criarFatura(formData: z.infer<typeof FaturaSchema>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { erro: 'Não autenticado' }

    const parsed = FaturaSchema.safeParse(formData)
    if (!parsed.success) return { erro: parsed.error.flatten() }

    const { data: utilObj } = await supabase.from('utilizadores')
        .select('empresa_id').eq('id', user.id).single()

    const util = utilObj as any
    if (!util) return { erro: 'Utilizador sem empresa' }

    // Gerar número sequencial
    const { count } = await supabase.from('faturas')
        .select('*', { count: 'exact', head: true }).eq('empresa_id', util.empresa_id)
    const numero = gerarNumeroFatura(new Date().getFullYear(), (count ?? 0) + 1)

    const totais = calcularTotalFatura(parsed.data.itens.map(i => ({
        quantidade: i.quantidade,
        precoUnitario: i.preco_unitario,
        taxaIVA: i.taxa_iva,
        descontoPct: i.desconto_pct,
    })))

    const { data: faturaObj, error } = await supabase.from('faturas').insert({
        empresa_id: util.empresa_id,
        numero,
        cliente_id: parsed.data.cliente_id,
        cliente_nome: parsed.data.cliente_nome,
        cliente_nif: parsed.data.cliente_nif,
        data_emissao: parsed.data.data_emissao,
        data_vencimento: parsed.data.data_vencimento,
        notas: parsed.data.notas,
        subtotal: totais.subtotal,
        total_iva: totais.totalIVA,
        total: totais.total,
        estado: 'emitida',
        criado_por: user.id,
    } as any).select().single()

    const fatura = faturaObj as any
    if (error) return { erro: error.message }

    // Inserir linhas
    await supabase.from('fatura_itens').insert(
        parsed.data.itens.map((item, i) => {
            const linha = totais.linhas[i]
            return {
                fatura_id: fatura.id,
                produto_id: item.produto_id,
                descricao: item.descricao,
                quantidade: item.quantidade,
                preco_unitario: item.preco_unitario,
                taxa_iva: item.taxa_iva,
                desconto_percent: item.desconto_pct,
                subtotal: linha.subtotal,
                valor_iva: linha.valorIVA,
                total: linha.total,
                ordem: i,
            }
        }) as any
    )

    revalidatePath('/faturas')
    return { sucesso: true, fatura }
}

export async function marcarFaturaPaga(faturaId: string, metodoPagamento: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { erro: 'Não autenticado' }

    const { data: faturaObj } = await supabase.from('faturas')
        .select('total,empresa_id').eq('id', faturaId).single()

    const fatura = faturaObj as any
    if (!fatura) return { erro: 'Fatura não encontrada' }

    await supabase.from('faturas').update({ estado: 'paga', updated_at: new Date().toISOString() } as any)
        .eq('id', faturaId)

    await supabase.from('pagamentos').insert({
        empresa_id: fatura.empresa_id,
        fatura_id: faturaId,
        valor: fatura.total,
        metodo: metodoPagamento,
        data_pagamento: new Date().toISOString().split('T')[0],
        criado_por: user.id,
    } as any)

    revalidatePath('/faturas')
    revalidatePath(`/faturas/${faturaId}`)
    return { sucesso: true }
}
