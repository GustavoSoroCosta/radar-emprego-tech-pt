import { SMALL_SAMPLE } from '@/lib/insights'

/**
 * How the numbers are produced and where they fall short. Native <details>, so it opens with
 * the keyboard and is announced as expandable without any JavaScript.
 */
export function Methodology() {
  return (
    <details className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500">
        Como são tratados os dados
      </summary>
      <dl className="mt-4 space-y-3 text-zinc-700 dark:text-zinc-300">
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-100">Origem</dt>
          <dd>Todas as vagas ativas na API oficial do itjobs.pt, recolhidas uma vez por dia.</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-100">Tecnologias</dt>
          <dd>
            Procuradas no título e na descrição a partir de uma lista fechada, para não contar ruído como
            &ldquo;Office&rdquo;. Cada vaga conta uma vez por tecnologia, por isso as percentagens não somam 100%.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-100">Área</dt>
          <dd>
            Decidida pelo título. Títulos genéricos, como &ldquo;Software Engineer&rdquo;, são decididos pelas
            tecnologias pedidas. Plataformas como SAP ou Salesforce, suporte e gestão ficam em &ldquo;Outras&rdquo;.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-100">Júnior</dt>
          <dd>
            Só quando o título diz júnior, estágio, trainee ou recém-licenciado. Muitas vagas abertas a júniores não
            o dizem no título, por isso o número real deve ser maior.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-100">Limites</dt>
          <dd>
            Uma vaga pode estar em várias cidades. Cada gráfico indica a sua base: com menos de {SMALL_SAMPLE} vagas,
            uma ou duas vagas mudam muito as percentagens, por isso convém lê-las com cautela.
          </dd>
        </div>
      </dl>
    </details>
  )
}
