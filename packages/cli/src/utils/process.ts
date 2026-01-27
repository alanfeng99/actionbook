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
 * Show installation instructions for agent-browser setup (including Chromium)
 */
export function showAgentBrowserSetupInstructions(): void {
  console.error(chalk.yellow('\nTo use browser automation, you need to:\n'))

  console.error(chalk.white('1. Install agent-browser (recommended):\n'))
  console.error(chalk.cyan('   npm install -g agent-browser\n'))

  console.error(chalk.white('2. Download Chromium:\n'))
  console.error(chalk.cyan('   agent-browser install\n'))

  console.error(chalk.white('Linux users - install system dependencies:\n'))
  console.error(chalk.cyan('   agent-browser install --with-deps\n'))

  console.error(chalk.white('Learn more: ') + chalk.cyan('https://github.com/vercel-labs/agent-browser\n'))
}
