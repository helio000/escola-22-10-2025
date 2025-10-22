import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const uri = import.meta.env.VITE_API_URI || 'http://localhost:3000'
axios.defaults.baseURL = uri

function Atividades() {
    const navigate = useNavigate()
    const { state } = useLocation()
    const id = state?.turmaId || ''
    const turma = state?.nome || ''
    const professor = JSON.parse(window.localStorage.getItem('professor') ?? '{}')
    const [atividades, setAtividades] = useState<Array<{ id: number; descricao: string }>>([])

    // Modal state
    const [open, setOpen] = useState(false)
    const [descricao, setDescricao] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!professor.id) {
            window.localStorage.removeItem('professor')
            sair()
            return
        }
        loadAtividades()
    }, [])

    function loadAtividades() {
        axios.get('/atividade/' + id)
            .then(response => { setAtividades(response.data) })
            .catch(error => {
                console.error('Erro ao buscar atividades:', error)
            })
    }

    function sair() {
        navigate('/home')
    }

    return (<>
<header className="w-full bg-green-700 text-white flex flex-row items-center justify-between p-4 shadow-lg">
    <h1 className="font-bold text-lg">{professor.nome}</h1>
    <Button variant="destructive" className="bg-green-600 hover:bg-green-800 text-white py-2 px-4 rounded-lg" onClick={() => sair()}>Sair</Button>
</header>

        <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-3xl space-y-6 flex flex-col">
                <div className="w-full flex justify-end">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-green-500 text-white hover:bg-green-600 py-2 px-4 rounded-lg">Cadastrar atividade</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-white shadow-xl rounded-lg p-6">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold">Nova atividade</DialogTitle>
                                <DialogDescription className="text-sm text-gray-600">
                                    Informe a descrição da atividade para a turma selecionada.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={(e) => {
                                e.preventDefault()
                                const turmaId = Number(id)
                                if (!turmaId) {
                                    console.error('turmaId inválido')
                                    return
                                }
                                setSubmitting(true)
                                axios.post('/atividade', { descricao, turmaId })
                                    .then(() => {
                                        setDescricao("")
                                        setOpen(false)
                                        loadAtividades()
                                    })
                                    .catch((error) => {
                                        console.error('Erro ao cadastrar atividade:', error)
                                    })
                                    .finally(() => setSubmitting(false))
                            }} className="space-y-4">
                                <Input
                                    type="text"
                                    placeholder="Descrição da atividade"
                                    value={descricao}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescricao(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                                />
                                <DialogFooter>
                                    <Button type="submit" disabled={submitting || !descricao.trim()} className="bg-green-500 text-white hover:bg-green-600 py-2 px-4 rounded-lg">
                                        {submitting ? 'Enviando...' : 'Salvar'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Turma: <span className="text-green-600">{turma}</span></h2>
                <ul className="space-y-3">
                    {atividades.map(atividade => (
                        <li className="w-full flex justify-between items-center bg-white p-4 rounded-lg shadow-md border border-gray-200" key={atividade.id}>
                            <span className="text-lg">{atividade.id} - {atividade.descricao}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    </>)
}

export default Atividades
