export const formatAOA = (valor: number): string =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 2 }).format(valor)

export const formatNumero = (valor: number, decimais = 2): string =>
    new Intl.NumberFormat('pt-AO', { minimumFractionDigits: decimais, maximumFractionDigits: decimais }).format(valor)

export const parseValor = (texto: string): number =>
    parseFloat(texto.replace(/[^\d,]/g, '').replace(',', '.')) || 0

export const converterCambio = (valor: number, cambio: number): number =>
    Math.round((valor / cambio) * 100) / 100
