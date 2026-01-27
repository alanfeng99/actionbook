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

/**
 * Check if agent-browser is installed
 */
function checkAgentBrowserInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn('agent-browser', ['--version'], {
      stdio: 'pipe',
      shell: false,
      env: process.env,
    })

    child.on('close', (code) => {
      resolve(code === 0)
    })

    child.on('error', (error: NodeJS.ErrnoException) => {
      // Command not found
      if (error.code === 'ENOENT') {
        resolve(false)
      } else {
        resolve(false)
      }
    })
  })
}

/**
 * Install agent-browser and setup Chromium
 * @param installArgs - Additional arguments for agent-browser install (e.g., ['--with-deps'])
 */
export async function installAgentBrowser(installArgs: string[] = []): Promise<number> {
  console.log(chalk.cyan('Setting up browser automation...\n'))

  // Check if agent-browser is already installed
  const isInstalled = await checkAgentBrowserInstalled()

  if (!isInstalled) {
    console.log(chalk.yellow('Step 1/2: Installing agent-browser via npm...\n'))

    const npmExitCode = await spawnCommand('npm', ['install', '-g', 'agent-browser'])

    if (npmExitCode !== 0) {
      console.error(chalk.red('\nFailed to install agent-browser via npm.'))
      console.error(chalk.white('Please check your npm installation and try again.\n'))
      return npmExitCode
    }

    console.log(chalk.green('\n✓ agent-browser installed successfully\n'))
  } else {
    console.log(chalk.green('✓ agent-browser is already installed\n'))
  }

  // Run agent-browser install to download Chromium
  console.log(chalk.yellow(`Step 2/2: Downloading Chromium browser binaries...\n`))

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
