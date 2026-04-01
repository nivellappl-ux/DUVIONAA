import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2 } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Login - ERP Angola',
}

export default async function LoginPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')

    const signIn = async (formData: FormData) => {
        'use server'
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const supabase = await createClient()

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return redirect('/login?message=Não+foi+possível+autenticar')
        }

        return redirect('/dashboard')
    }

    return (
        <div className="flex h-screen w-full items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl"></div>
            <div className="z-10 w-full max-w-md p-4">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-600/20">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                </div>
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight">ERP Angola</CardTitle>
                        <CardDescription className="text-gray-500">
                            Insira as suas credenciais para aceder ao portal
                        </CardDescription>
                    </CardHeader>
                    <form action={signIn}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Empresarial</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="admin@empresa.co.ao"
                                    required
                                    className="bg-white/50 border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Palavra-Passe</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="bg-white/50 border-gray-200"
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/30">
                                Entrar no Sistema
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
                <p className="text-center text-sm text-gray-500 mt-6">
                    &copy; {new Date().getFullYear()} ERP Angola. Todos os direitos reservados.
                </p>
            </div>
        </div>
    )
}
