export type Provincia = 'Luanda' | 'Benguela' | 'Huambo' | 'Bié' | 'Malanje'
    | 'Lunda Norte' | 'Lunda Sul' | 'Huíla' | 'Namibe' | 'Cunene'
    | 'Cuando Cubango' | 'Moxico' | 'Uíge' | 'Zaire' | 'Cabinda'
    | 'Bengo' | 'Cuanza Norte' | 'Cuanza Sul' | 'Kwanza Norte' | 'Kwanza Sul'

export type MetodoPagamento = 'dinheiro' | 'transferencia' | 'multicaixa' | 'tpa' | 'cheque' | 'outro'
export type EstadoFatura = 'rascunho' | 'emitida' | 'paga' | 'vencida' | 'anulada'
export type TipoContrato = 'indefinido' | 'prazo_certo' | 'prestacao_servicos' | 'estagio'
export type PerfilUtilizador = 'admin' | 'gestor' | 'operador' | 'contabilista'

export interface ResultadoCalculo {
    salarioBruto: number
    inss: number
    inssPatronal: number
    irt: number
    totalDescontos: number
    salarioLiquido: number
    rendimentoColectavel: number
}
