export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            faturas: {
                Row: { id: string; numero: string; cliente_nome: string; total: number; estado: string; empresa_id: string; created_at: string; cliente_id: string | null; cliente_nif: string | null; data_emissao: string; data_vencimento: string | null; notas: string | null; subtotal: number; total_iva: number; criado_por: string | null };
                Insert: any; Update: any;
            };
            clientes: {
                Row: { id: string; activo: boolean; count: number };
                Insert: any; Update: any;
            };
            produtos: {
                Row: { id: string; nome: string; stock_actual: number; stock_minimo: number };
                Insert: any; Update: any;
            };
            utilizadores: {
                Row: { id: string; empresa_id: string };
                Insert: any; Update: any;
            };
            fatura_itens: {
                Row: any; Insert: any; Update: any;
            };
            pagamentos: {
                Row: any; Insert: any; Update: any;
            };
            funcionarios: {
                Row: { id: string; numero: string; nome: string; cargo: string; activo: boolean; salario_base: number; subsidio_alimentacao: number; subsidio_transporte: number; outros_subsidios: number };
                Insert: any; Update: any;
            };
        };
        Views: { [key: string]: any };
        Functions: { [key: string]: any };
    }
}
