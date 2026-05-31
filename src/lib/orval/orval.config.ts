import path from 'node:path'
import { defineConfig } from 'orval'
import { orvalEnvSchema } from './orval-env.schema'

const orvalEnv = orvalEnvSchema.parse(process.env)

export default defineConfig({
  api: {
    input: {
      target: orvalEnv.ORVAL_OPENAPI_URL,
    },
    output: {
      clean: true,
      mode: 'split',
      client: 'axios',
      target: path.resolve(process.cwd(), 'src/generated/orval/endpoints.ts'),
      schemas: path.resolve(process.cwd(), 'src/generated/orval/model'),
    },
  },
})
