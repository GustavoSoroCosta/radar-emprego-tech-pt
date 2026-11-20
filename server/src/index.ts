import { createApp } from './app.ts'
import { createPool } from './db/pool.ts'

const port = Number(process.env.PORT ?? 4000)
const app = createApp(createPool())

app.listen(port, () => {
  console.log(`Radar API listening on http://localhost:${port}`)
})
