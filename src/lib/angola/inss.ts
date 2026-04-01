export const INSS = {
    TAXA_TRABALHADOR: 0.03,
    TAXA_PATRONAL: 0.08,
    TECTO_MAXIMO: 750000, // AOA — actualizar conforme decreto
}

export const calcularINSS = (salarioBruto: number) => {
    const base = Math.min(salarioBruto, INSS.TECTO_MAXIMO)
    const trabalhador = Math.round(base * INSS.TAXA_TRABALHADOR * 100) / 100
    const patronal = Math.round(base * INSS.TAXA_PATRONAL * 100) / 100
    return { trabalhador, patronal, total: trabalhador + patronal, base }
}
