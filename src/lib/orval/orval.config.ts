import path from 'node:path'
import { z } from 'zod'
import { defineConfig } from 'orval'

const orvalEnv = z
  .object({
    ORVAL_OPENAPI_URL: z.string().trim().url(),
  })
  .parse(process.env)

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
