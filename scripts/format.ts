import { Prettier } from '@clscripts/prettier'
import { runCommand } from '@clscripts/cl-common'

runCommand(
  new Prettier({
    noErrorOnUnmatchedPattern: true,
    files: ['./**/*.{htm,html,css,md,mdx,js,jsx,ts,tsx}'],
    ignore: ['next-env.d.ts', '.agents'],
  }).command
)
