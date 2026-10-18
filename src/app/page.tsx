import { BarChart } from '@/components/BarChart'
import { sampleJobs } from '@/data/sample'
import { countTechnologies } from '@/lib/aggregate'

export default function Home() {
  const technologies = countTechnologies(sampleJobs)

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Radar do Emprego Tech PT</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          O que as empresas tech em Portugal estão a pedir nas vagas. {sampleJobs.length} vagas
          analisadas (dados de exemplo).
        </p>
      </header>
      <BarChart title="Tecnologias mais pedidas" data={technologies} />
    </main>
  )
}
