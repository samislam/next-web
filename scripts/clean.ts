import { DelCli } from '@clscripts/del-cli'
import { runCommand } from '@clscripts/cl-common'

runCommand(
  new DelCli({
    files: ['**/{node_modules,.next,*.tsbuildinfo,dist}', './src/generated'],
  }).command
)
