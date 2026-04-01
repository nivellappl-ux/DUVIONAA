import { calcularLinhaFatura } from './iva'

export const gerarNumeroFatura = (ano: number, sequencia: number): string => {
    const seq = String(sequencia).padStart(6, '0')
    return `${ano}/${seq}`
}

export const calcularTotalFatura = (itens: Array<{
    quantidade: number; precoUnitario: number; taxaIVA: number; descontoPct?: number
}>) => {
    let subtotal = 0, totalIVA = 0
    const linhas = itens.map(item => {
        const linha = calcularLinhaFatura(item.quantidade, item.precoUnitario, item.taxaIVA, item.descontoPct)
        subtotal += linha.subtotal
        totalIVA += linha.valorIVA
        return linha
    })
    return { linhas, subtotal, totalIVA, total: subtotal + totalIVA }
}
