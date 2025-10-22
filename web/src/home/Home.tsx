import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import axios from 'axios'

const uri = import.meta.env.VITE_API_URI || 'http://localhost:3000'
axios.defaults.baseURL = uri

function Home() {
    const navigate = useNavigate()
    const professor = JSON.parse(window.localStorage.getItem('professor') ?? '{}')
    const [turmas, setTurmas] = useState<Array<{ id: number; nome: string }>>([])
    const [open, setOpen] = useState(false)
    const [nome, setNome] = useState("")
    const [submitting] = useState(false)
    useEffect(() => {
        if (!professor.id) {
            sair()
            return
        }
        axios.get('/turma/' + professor.id)
            .then(response => { setTurmas(response.data) })
            .catch(error => {
                console.error('Erro ao buscar turmas:', error)
            })
    }, [])

    function sair() {
        window.localStorage.removeItem('professor')
        navigate('/login')
    }

    function excluir(turmaId: number) {
        axios.delete('/turma/' + turmaId)
            .then(response => { return { status: response.status, response: response.data } })
            .then(({ status }) => {
                if (status == 204) {
                    setTurmas(turmas.filter(turma => turma.id !== turmaId))
                    return
                }
            })
            .catch((error) => {
                const status = error?.response?.status
                if (status === 409) {
                    alert(error?.response.data?.message || 'Falha ao excluir turma.')
                    return
                }
            })
    }

    return (<>
       <header className="w-full bg-green-700 text-white flex flex-row items-center justify-between p-4 shadow-lg">
    <h1 className="font-bold text-lg">{professor.nome}</h1>
    <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg" onClick={() => sair()}>Sair</Button>
</header>

<main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
    <div className="w-full max-w-4xl space-y-6 flex flex-col">
        <div className="w-full flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg">Cadastrar turma</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white shadow-xl rounded-lg p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Nova turma</DialogTitle>
                        <DialogDescription className="text-sm text-gray-600">
                            Informe o nome da turma e confirme para cadastrar.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={() => { /* ... */ }} className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Nome da turma"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={submitting || !nome.trim()} className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg">
                                {submitting ? 'Enviando...' : 'Salvar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        <h2 className='text-xl font-semibold text-gray-800'>Turmas</h2>
        <ul className="space-y-3">
            {turmas.map(turma => (
                <li className="w-full flex justify-between items-center bg-white p-4 rounded-lg shadow-md border border-gray-200" key={turma.id}>
                    <span className="text-lg">{turma.id} - {turma.nome}</span>
                    <div className="flex gap-2">
                        <Button className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg" onClick={() => excluir(turma.id)}>Excluir</Button>
                        <Button className="bg-teal-500 hover:bg-teal-400 text-white py-1 px-3 rounded-lg" onClick={() => {
                            navigate('/atividades', { state: { turmaId: turma.id, nome: turma.nome } })
                        }}>Visualizar</Button>
                    </div>
                </li>
            ))}
        </ul>
    </div>
</main>

    </>)
}

export default Home
