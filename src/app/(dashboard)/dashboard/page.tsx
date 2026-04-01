import { createClient } from '@/lib/supabase/server'
import { formatAOA } from '@/lib/angola'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Users, Package, TrendingUp, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
    const supabase = await createClient()
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()

    const [faturasMes, faturasVencidas, clientesTotal, stockCritico] = await Promise.all([
        supabase.from('faturas').select('total').gte('created_at', inicioMes).eq('estado', 'paga'),
        supabase.from('faturas').select('id,numero,cliente_nome,total').eq('estado', 'vencida').limit(5),
        supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('activo', true),
        supabase.from('produtos').select('id,nome,stock_actual,stock_minimo')
            .filter('stock_actual', 'lte', 'stock_minimo').limit(5),
    ])

    const totalFaturado = (faturasMes.data as any[])?.reduce((s, f) => s + (f.total ?? 0), 0) ?? 0

    const metricas = [
        { label: 'Faturado este mês', valor: formatAOA(totalFaturado), icon: TrendingUp, cor: 'text-green-600' },
        { label: 'Faturas vencidas', valor: String(faturasVencidas.data?.length ?? 0), icon: AlertTriangle, cor: 'text-red-600' },
        { label: 'Clientes activos', valor: String(clientesTotal.count ?? 0), icon: Users, cor: 'text-blue-600' },
        { label: 'Alertas de stock', valor: String(stockCritico.data?.length ?? 0), icon: Package, cor: 'text-amber-600' },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Painel de Controlo</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {metricas.map(({ label, valor, icon: Icon, cor }) => (
                    <Card key={label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
                            <Icon className={cn('h-5 w-5', cor)} />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-gray-900">{valor}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {(faturasVencidas.data?.length ?? 0) > 0 && (
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-700 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> Faturas Vencidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {(faturasVencidas.data as any[])?.map(f => (
                                <div key={f.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <div>
                                        <p className="font-medium text-sm">{f.numero}</p>
                                        <p className="text-xs text-gray-500">{f.cliente_nome}</p>
                                    </div>
                                    <Badge variant="destructive">{formatAOA(f.total)}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
