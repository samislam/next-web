import { z } from 'zod'

export const orvalEnvSchema = z.object({
  ORVAL_OPENAPI_URL: z.string().trim().min(1),
})

export type OrvalEnv = z.infer<typeof orvalEnvSchema>
