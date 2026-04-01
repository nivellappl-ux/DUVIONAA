import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatAOA } from '@/lib/angola/moeda'
import { calcularSalarioLiquido } from '@/lib/angola/irt'
import { Users, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function FolhaSalarialPage() {
    const supabase = await createClient()

    // Pegar todos os funcionários ativos
    const { data: cols } = await supabase.from('funcionarios').select('*').eq('activo', true)

    const funcionarios = (cols as any[]) || []

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    const mesAtual = new Date().getMonth()
    const anoAtual = new Date().getFullYear()

    // Processar salário líquido
    const folhaCalculada = funcionarios.map(func => {
        const calc = calcularSalarioLiquido({
            salarioBase: Number(func.salario_base),
            subsidioAlimentacao: Number(func.subsidio_alimentacao),
            subsidioTransporte: Number(func.subsidio_transporte),
            outrosSubsidios: Number(func.outros_subsidios),
        })

        return {
            funcionario: func,
            calculo: calc
        }
    })

    const totalLiquido = folhaCalculada.reduce((acc, f) => acc + f.calculo.salarioLiquido, 0)
    const totalINSS = folhaCalculada.reduce((acc, f) => acc + f.calculo.inss + f.calculo.inssPatronal, 0)
    const totalIRT = folhaCalculada.reduce((acc, f) => acc + f.calculo.irt, 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Folha de Salários</h1>
                    <p className="text-gray-500">Mês de processamento: {meses[mesAtual]} {anoAtual}</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <FileDown className="h-4 w-4" /> Exportar Mapa (Excel)
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500 flex items-center justify-between">
                            Total Líquido a Pagar
                            <Users className="h-4 w-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">{formatAOA(totalLiquido)}</p>
                        <p className="text-xs text-gray-400 mt-1">{folhaCalculada.length} Colaboradores</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500 flex items-center justify-between">
                            Total INSS (DGT)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-600">{formatAOA(totalINSS)}</p>
                        <p className="text-xs text-gray-400 mt-1">Trabalhador + Patronal</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500 flex items-center justify-between">
                            Total IRT (AGT)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-600">{formatAOA(totalIRT)}</p>
                        <p className="text-xs text-gray-400 mt-1">Retenção na fonte</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b text-gray-700 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Nº</th>
                                <th className="px-6 py-3 font-semibold">Nome</th>
                                <th className="px-6 py-3 font-semibold text-right">Salário Base</th>
                                <th className="px-6 py-3 font-semibold text-right">Subsídios</th>
                                <th className="px-6 py-3 font-semibold text-right text-red-600">INSS (-3%)</th>
                                <th className="px-6 py-3 font-semibold text-right text-red-600">IRT</th>
                                <th className="px-6 py-3 font-semibold text-right text-blue-600">Salário Líquido</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {folhaCalculada.map(({ funcionario, calculo }) => (
                                <tr key={funcionario.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-mono text-gray-500">{funcionario.numero}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {funcionario.nome}
                                        <div className="text-xs text-gray-400 font-normal">{funcionario.cargo}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">{formatAOA(funcionario.salario_base)}</td>
                                    <td className="px-6 py-4 text-right">
                                        {formatAOA(calculo.salarioBruto - Number(funcionario.salario_base))}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-red-600">
                                        - {formatAOA(calculo.inss)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-red-600">
                                        - {formatAOA(calculo.irt)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-blue-600">
                                        {formatAOA(calculo.salarioLiquido)}
                                    </td>
                                </tr>
                            ))}
                            {folhaCalculada.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        Nenhum colaborador activo no sistema.
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
