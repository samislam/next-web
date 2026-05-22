import chalk from 'chalk'
import { existsSync } from 'fs'
import { DotenvCli } from '@clscripts/dotenv-cli'
import { runCommand } from '@clscripts/cl-common'

const nodeEnv = process.env.NODE_ENV ?? 'development'
const possibleEnvFiles = [`.env.${nodeEnv}.local`, '.env.local', `.env.${nodeEnv}`, '.env']
const dotenvFile = possibleEnvFiles.find((file) => existsSync(file))

console.log(
  chalk.cyanBright('Using environment file: '),
  chalk.bold.greenBright(dotenvFile ?? 'None!')
)

const commandToRun = 'orval --config ./src/lib/orval/orval.config.ts'

runCommand(
  dotenvFile
    ? new DotenvCli({
        envFile: dotenvFile,
        execute: commandToRun,
      }).command
    : commandToRun
)
