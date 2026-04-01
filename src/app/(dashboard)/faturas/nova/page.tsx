'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { criarFatura } from '@/lib/actions/fatura.actions'
import { calcularTotalFatura } from '@/lib/angola/fatura'
import { formatAOA } from '@/lib/angola/moeda'

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

const faturaSchema = z.object({
    cliente_nome: z.string().min(2, 'Nome do cliente é obrigatório'),
    cliente_nif: z.string().optional(),
    data_emissao: z.string().min(1, 'Data de emissão obrigatória'),
    data_vencimento: z.string().optional(),
    notas: z.string().optional(),
    itens: z.array(z.object({
        descricao: z.string().min(1, 'Descrição obrigatória'),
        quantidade: z.number().min(1),
        preco_unitario: z.number().min(0),
        taxa_iva: z.number().min(0).max(100),
        desconto_pct: z.number().min(0).max(100)
    })).min(1, 'Adicione pelo menos um item')
})

type FaturaFormValues = z.infer<typeof faturaSchema>

export default function NovaFaturaPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FaturaFormValues>({
        resolver: zodResolver(faturaSchema),
        defaultValues: {
            cliente_nome: '',
            cliente_nif: '',
            data_emissao: new Date().toISOString().split('T')[0],
            itens: [{ descricao: '', quantidade: 1, preco_unitario: 0, taxa_iva: 14, desconto_pct: 0 }]
        }
    })

    const { fields, append, remove } = useFieldArray({
        name: 'itens',
        control: form.control
    })

    const watchItens = form.watch('itens')
    const totais = calcularTotalFatura(watchItens.map(i => ({
        quantidade: Number(i.quantidade) || 0,
        precoUnitario: Number(i.preco_unitario) || 0,
        taxaIVA: Number(i.taxa_iva) || 0,
        descontoPct: Number(i.desconto_pct) || 0,
    })))

    async function onSubmit(data: FaturaFormValues) {
        setIsSubmitting(true)
        try {
            const resp = await criarFatura(data)
            if (resp.erro) {
                toast.error('Erro ao criar fatura', { description: JSON.stringify(resp.erro) })
            } else {
                toast.success('Fatura criada com sucesso!')
                router.push('/faturas')
            }
        } catch (e) {
            toast.error('Erro de servidor')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/faturas">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Nova Fatura</h1>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Detalhes do Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
                            <Input id="cliente_nome" {...form.register('cliente_nome')} />
                            {form.formState.errors.cliente_nome && <p className="text-red-500 text-xs">{form.formState.errors.cliente_nome.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cliente_nif">NIF</Label>
                            <Input id="cliente_nif" {...form.register('cliente_nif')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="data_emissao">Data de Emissão *</Label>
                            <Input id="data_emissao" type="date" {...form.register('data_emissao')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                            <Input id="data_vencimento" type="date" {...form.register('data_vencimento')} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Linhas da Fatura</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ descricao: '', quantidade: 1, preco_unitario: 0, taxa_iva: 14, desconto_pct: 0 })}>
                            <Plus className="h-4 w-4 mr-2" /> Adicionar Linha
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-3 items-end border-b pb-4 last:border-0">
                                    <div className="col-span-12 md:col-span-4 space-y-1">
                                        <Label className="text-xs">Descrição</Label>
                                        <Input {...form.register(`itens.${index}.descricao`)} />
                                    </div>
                                    <div className="col-span-3 md:col-span-2 space-y-1">
                                        <Label className="text-xs">Qtd</Label>
                                        <Input type="number" step="0.01" {...form.register(`itens.${index}.quantidade`, { valueAsNumber: true })} />
                                    </div>
                                    <div className="col-span-5 md:col-span-2 space-y-1">
                                        <Label className="text-xs">Preço Unit.</Label>
                                        <Input type="number" step="0.01" {...form.register(`itens.${index}.preco_unitario`, { valueAsNumber: true })} />
                                    </div>
                                    <div className="col-span-2 md:col-span-1 space-y-1">
                                        <Label className="text-xs">IVA %</Label>
                                        <Input type="number" {...form.register(`itens.${index}.taxa_iva`, { valueAsNumber: true })} />
                                    </div>
                                    <div className="col-span-2 md:col-span-1 space-y-1">
                                        <Label className="text-xs">Desc %</Label>
                                        <Input type="number" {...form.register(`itens.${index}.desconto_pct`, { valueAsNumber: true })} />
                                    </div>
                                    <div className="col-span-10 md:col-span-1 border rounded h-10 flex items-center justify-center bg-gray-50 text-sm font-medium px-2">
                                        {formatAOA(totais.linhas[index]?.total || 0).replace('AOA', '')}
                                    </div>
                                    <div className="col-span-2 md:col-span-1 text-right">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Resumo */}
                        <div className="mt-8 pt-4 border-t w-full max-w-sm ml-auto space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatAOA(totais.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Total IVA</span>
                                <span>{formatAOA(totais.totalIVA)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t mt-2">
                                <span>Total a Pagar</span>
                                <span>{formatAOA(totais.total)}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-3 bg-gray-50 pt-6">
                        <Link href="/faturas">
                            <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                        <Button type="submit" disabled={isSubmitting} className="gap-2">
                            <Save className="h-4 w-4" /> {isSubmitting ? 'A Guardar...' : 'Emitir Fatura'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
