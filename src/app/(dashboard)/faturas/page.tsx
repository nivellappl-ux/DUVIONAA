import { createClient } from '@/lib/supabase/server'
import { formatAOA } from '@/lib/angola'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, CheckCircle, FileText } from 'lucide-react'
import { marcarFaturaPaga } from '@/lib/actions/fatura.actions'

export default async function FaturasPage() {
    const supabase = await createClient()
    const { data: faturas } = await supabase.from('faturas').select('*').order('created_at', { ascending: false }).limit(50)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paga': return 'bg-green-100 text-green-800 border-green-200'
            case 'vencida': return 'bg-red-100 text-red-800 border-red-200'
            case 'emitida': return 'bg-blue-100 text-blue-800 border-blue-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200' // rascunho
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Gestão de Faturas</h1>
                <Link href="/faturas/nova">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Nova Fatura
                    </Button>
                </Link>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b text-gray-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Número</th>
                                <th className="px-6 py-4 font-semibold">Cliente</th>
                                <th className="px-6 py-4 font-semibold">Data de Emissão</th>
                                <th className="px-6 py-4 font-semibold text-right">Total</th>
                                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                                <th className="px-6 py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(faturas as any[])?.map((fat) => (
                                <tr key={fat.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{fat.numero}</td>
                                    <td className="px-6 py-4 text-gray-600">{fat.cliente_nome}</td>
                                    <td className="px-6 py-4 text-gray-600">{fat.data_emissao}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatAOA(fat.total ?? 0)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge variant="outline" className={getStatusColor(fat.estado ?? '')}>
                                            {(fat.estado ?? 'Desconhecido').toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver Detalhes">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                            </Button>
                                            {fat.estado !== 'paga' && (
                                                <form action={async () => {
                                                    'use server'
                                                    await marcarFaturaPaga(fat.id, 'transferencia')
                                                }}>
                                                    <Button variant="outline" size="sm" className="h-8 gap-1 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700">
                                                        <CheckCircle className="h-3 w-3" /> Pagar
                                                    </Button>
                                                </form>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!faturas || faturas.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        Nenhuma fatura encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
