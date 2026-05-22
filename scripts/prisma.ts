import chalk from 'chalk'
import { parse } from 'dotenv'
import { existsSync } from 'fs'
import { concat } from 'concat-str'
import { readFileSync } from 'node:fs'
import { DotenvCli } from '@clscripts/dotenv-cli'
import { runCommand } from '@clscripts/cl-common'
import { Prisma, PrismaRunMode } from '@clscripts/prisma'
import { select, confirm, input } from '@inquirer/prompts'

const shellEscape = (value: string) => `'${value.replace(/'/g, `'"'"'`)}'`
const isDatabaseEnabled = (value?: string) => (value ?? 'no') === 'yes'
const PRISMA_RUN_MODES: PrismaRunMode[] = [
  'init',
  'generate',
  'push',
  'migrate',
  'seed',
  'deploy',
  'validate',
  'studio',
]

async function main() {
  const nodeEnv = process.env.NODE_ENV ?? 'development'
  const possibleEnvFiles = [`.env.${nodeEnv}.local`, '.env.local', `.env.${nodeEnv}`, '.env']
  const dotenvFile = possibleEnvFiles.find((file) => existsSync(file))
  if (!dotenvFile) {
    console.error("You don't have any environment file specified, please define one first!")
    process.exit(-1)
  }
  console.log(chalk.cyanBright('Using environment file: '), chalk.bold.greenBright(dotenvFile))
  const fileEnv = parse(readFileSync(dotenvFile))

  if (!isDatabaseEnabled(fileEnv.ENABLE_DATABASE ?? process.env.ENABLE_DATABASE)) {
    console.error(
      chalk.redBright(
        'Prisma commands are disabled because ENABLE_DATABASE is set to "no" in the active environment.'
      )
    )
    process.exit(-1)
  }

  // Read command-line arguments
  const args = process.argv.slice(2) // Ignore "node/bun" and script filename
  const separatorIndex = args.indexOf('--')
  const wantsExplicitPassthrough = separatorIndex >= 0
  const passthroughArgs = wantsExplicitPassthrough ? args.slice(separatorIndex + 1) : args
  const maybeMode = passthroughArgs[0]
  const isKnownMode = PRISMA_RUN_MODES.includes(maybeMode as PrismaRunMode)
  const shouldPassthrough =
    passthroughArgs.length > 0 &&
    (wantsExplicitPassthrough || passthroughArgs.length > 1 || !isKnownMode)

  if (shouldPassthrough) {
    const prismaCommand = `prisma ${passthroughArgs.map(shellEscape).join(' ')}`
    runCommand(
      new DotenvCli({
        envFile: dotenvFile,
        execute: prismaCommand,
      }).command
    )
    return
  }

  let mode: PrismaRunMode = maybeMode as PrismaRunMode // e.g., "migrate" or "studio"
  if (!mode)
    mode = await select({
      message: 'Choose an operation for the Prisma CLI to execute:',
      pageSize: 10,
      choices: [
        {
          name: 'Initialize',
          value: 'init',
          description: 'Generates the prisma/schema.prisma file',
        },
        {
          name: 'Generate prisma client',
          value: 'generate',
          description: 'Generates the Prisma Client for interacting with your database',
        },
        {
          name: 'Push changes',
          value: 'push',
          description: concat(
            'Synchronizes Prisma schema with the database',
            "(Doesn't generate migration files)"
          ),
        },
        {
          name: 'Migrate',
          value: 'migrate',
          description: concat(
            'Creates a new migration based on schema changes',
            'and can apply the migration to the database'
          ),
        },
        {
          name: 'Seed',
          value: 'seed',
          description: 'Populates your database with initial data',
        },
        {
          name: 'Deploy',
          value: 'deploy',
          description: concat(
            'Apply all pending migrations to a production database.',
            '(does not create new migration files or run seed scripts automatically)'
          ),
        },
        {
          name: 'Validate',
          value: 'validate',
          description: 'Validates your schema.prisma file',
        },
        {
          name: 'Studio',
          value: 'studio',
          description: 'Opens a web-based interface to view and edit data',
        },
      ],
    })

  let forceReset = false
  let createOnly = true
  let migrationName = ''
  let studioPort = 5555
  switch (mode) {
    case 'push':
      forceReset = await confirm({
        default: false,
        message: concat(
          'Run the force reset command?\n',
          chalk.bold.redBright(
            '🚧🔴 WARNING: this deletes your tables and re-creates them',
            'which causes your data to be deleted!'
          )
        ),
      })
      break
    case 'migrate':
      createOnly = await confirm({
        default: false,
        message: concat(
          'Would you like to run the generated migration',
          'and apply it to the database automatically?'
        ),
      })
      migrationName = await input({ message: 'Enter migration name' })
      break
    case 'studio':
      studioPort = +(await input({
        default: studioPort.toString(),
        message: 'Port',
      }))
  }

  runCommand(
    new DotenvCli({
      envFile: dotenvFile,
      execute: new Prisma({
        mode,
        forceReset,
        createOnly,
        studioPort,
        migrationName,
      }).command,
    }).command
  )
}
main()
