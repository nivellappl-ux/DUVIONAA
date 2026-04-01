'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard, FileText, Users, Package, ShoppingCart,
    Truck, UserCheck, BarChart3, Settings, Building2
} from 'lucide-react'

const NAV = [
    { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
    { href: '/faturas', label: 'Faturas', icon: FileText },
    { href: '/clientes', label: 'Clientes', icon: Users },
    { href: '/produtos', label: 'Produtos', icon: Package },
    { href: '/inventario', label: 'Inventário', icon: Package },
    { href: '/compras', label: 'Compras', icon: ShoppingCart },
    { href: '/fornecedores', label: 'Fornecedores', icon: Truck },
    { href: '/rh', label: 'Recursos Humanos', icon: UserCheck },
    { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <span className="font-bold text-gray-900 text-lg">ERP Angola</span>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {NAV.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            pathname.startsWith(href) && href !== '/dashboard'
                                ? 'bg-blue-50 text-blue-700'
                                : pathname === href
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        )}>
                        <Icon className="h-4 w-4" />
                        {label}
                    </Link>
                ))}
            </nav>
        </aside>
    )
}
