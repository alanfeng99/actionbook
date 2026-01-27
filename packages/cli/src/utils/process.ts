import { spawn } from 'node:child_process'
import chalk from 'chalk'

/**
 * Spawn a command with arguments, inheriting stdio
 * Returns the exit code
 * If command is not found (ENOENT), shows installation instructions
 * @param suppressInstallInstructions - If true, don't show installation instructions on ENOENT
 */
export async function spawnCommand(
  command: string,
  args: string[],
  suppressInstallInstructions = false
): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      env: process.env,
    })

    child.on('close', (code, signal) => {
      if (signal) {
        // Process was killed by signal (e.g., SIGINT from Ctrl+C)
        // Convert signal to exit code: 128 + signal number
        resolve(128 + (signal === 'SIGINT' ? 2 : 15))
      } else {
        resolve(code ?? 1)
      }
    })

    child.on('error', (error: NodeJS.ErrnoException) => {
      // Command not found - show installation instructions
      if (error.code === 'ENOENT') {
        if (!suppressInstallInstructions) {
          showAgentBrowserInstallation()
        }
        resolve(127) // Standard exit code for command not found
      } else {
        console.error(chalk.red(`Failed to execute ${command}: ${error.message}`))
        resolve(1)
      }
    })
  })
}

/**
 * Show installation instructions for agent-browser
 */
export function showAgentBrowserInstallation(): void {
  console.error(chalk.red('\nagent-browser is not installed or not in PATH.\n'))

  console.error(chalk.white('agent-browser is a fast browser automation CLI for AI agents.'))
  console.error(chalk.white('To install it, run:\n'))

  console.error(chalk.cyan('  npm install -g agent-browser\n'))

  console.error(chalk.white('Learn more: ') + chalk.cyan('https://github.com/vercel-labs/agent-browser\n'))

  console.error(chalk.white('After installation, verify with:\n'))
  console.error(chalk.cyan('  agent-browser --help\n'))
}

/**
 * Install Chromium browser binaries for agent-browser
 * @param installArgs - Additional arguments for agent-browser install (e.g., ['--with-deps'])
 */
export async function installAgentBrowser(installArgs: string[] = []): Promise<number> {
  console.log(chalk.cyan('Setting up browser automation...\n'))
  console.log(chalk.yellow('Downloading Chromium browser binaries...\n'))

  const installCommand = ['install', ...installArgs]
  const exitCode = await spawnCommand('agent-browser', installCommand)

  if (exitCode === 0) {
    console.log(chalk.green('\n✓ Browser automation setup complete!\n'))
    console.log(chalk.white('You can now use: ') + chalk.cyan('actionbook browser <command>\n'))
  } else {
    console.error(chalk.red('\nBrowser setup encountered an error.'))
    console.error(chalk.white('Please check the output above for details.\n'))
  }

  return exitCode
}
