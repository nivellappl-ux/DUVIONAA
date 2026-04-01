export const TAXAS_IVA = { isento: 0, reduzida: 5, normal: 14 } as const
export type TaxaIVA = keyof typeof TAXAS_IVA

export const calcularIVA = (subtotal: number, taxa: number) => {
    const valorIVA = Math.round(subtotal * (taxa / 100) * 100) / 100
    return { subtotal, valorIVA, total: subtotal + valorIVA, taxa }
}

export const calcularLinhaFatura = (
    quantidade: number, precoUnit: number, taxaIVA: number, descontoPct = 0
) => {
    const subtotalBruto = quantidade * precoUnit
    const descontoValor = Math.round(subtotalBruto * (descontoPct / 100) * 100) / 100
    const subtotal = subtotalBruto - descontoValor
    const valorIVA = Math.round(subtotal * (taxaIVA / 100) * 100) / 100
    return { subtotal, valorIVA, total: subtotal + valorIVA, descontoValor }
}
