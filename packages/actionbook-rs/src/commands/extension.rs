use colored::Colorize;

use crate::browser::embedded_extension;
use crate::browser::extension_bridge;
use crate::cli::{Cli, ExtensionCommands};
use crate::error::Result;

pub async fn run(cli: &Cli, command: &ExtensionCommands) -> Result<()> {
    match command {
        ExtensionCommands::Serve { port } => serve(cli, *port).await,
        ExtensionCommands::Status { port } => status(cli, *port).await,
        ExtensionCommands::Ping { port } => ping(cli, *port).await,
        ExtensionCommands::Install { force } => install(cli, *force).await,
        ExtensionCommands::Path => path(cli).await,
        ExtensionCommands::Uninstall => uninstall(cli).await,
    }
}

async fn serve(_cli: &Cli, port: u16) -> Result<()> {
    let extension_path = if embedded_extension::is_installed() {
        let dir = embedded_extension::extension_dir()?;
        let path_str = dir.display().to_string();
        if embedded_extension::is_outdated() {
            format!(
                "{} {}",
                path_str,
                "(outdated - run 'actionbook extension install --force')".yellow()
            )
        } else {
            path_str
        }
    } else {
        "(not installed - run 'actionbook extension install')".dimmed().to_string()
    };

    println!();
    println!("  {}", "Actionbook Extension Bridge".bold());
    println!("  {}", "─".repeat(40).dimmed());
    println!();
    println!(
        "  {}  WebSocket server on ws://127.0.0.1:{}",
        "◆".cyan(),
        port
    );
    println!(
        "  {}  Extension: {}",
        "◆".cyan(),
        extension_path
    );
    println!();
    println!("  {}  Press Ctrl+C to stop", "ℹ".dimmed());
    println!();

    extension_bridge::serve(port).await
}

async fn status(_cli: &Cli, port: u16) -> Result<()> {
    let running = extension_bridge::is_bridge_running(port).await;

    if running {
        println!(
            "  {} Bridge server is running on port {}",
            "✓".green(),
            port
        );
    } else {
        println!(
            "  {} Bridge server is not running on port {}",
            "✗".red(),
            port
        );
        println!(
            "  {}  Start with: {}",
            "ℹ".dimmed(),
            "actionbook extension serve".dimmed()
        );
    }

    Ok(())
}

async fn ping(_cli: &Cli, port: u16) -> Result<()> {
    let start = std::time::Instant::now();
    let result = extension_bridge::send_command(
        port,
        "Extension.ping",
        serde_json::json!({}),
    )
    .await;

    match result {
        Ok(resp) => {
            let elapsed = start.elapsed();
            println!(
                "  {} Extension responded: {} ({}ms)",
                "✓".green(),
                resp,
                elapsed.as_millis()
            );
        }
        Err(e) => {
            println!("  {} Ping failed: {}", "✗".red(), e);
        }
    }

    Ok(())
}

async fn install(cli: &Cli, force: bool) -> Result<()> {
    let dir = embedded_extension::extension_dir()?;

    if embedded_extension::is_installed() && !force {
        let current = embedded_extension::installed_version().unwrap_or_default();
        if current == embedded_extension::EXTENSION_VERSION {
            if cli.json {
                println!(
                    "{}",
                    serde_json::json!({
                        "status": "already_installed",
                        "version": current,
                        "path": dir.display().to_string()
                    })
                );
            } else {
                println!(
                    "  {} Extension v{} is already installed at {}",
                    "✓".green(),
                    current,
                    dir.display()
                );
                println!(
                    "  {}  Use {} to force reinstall",
                    "ℹ".dimmed(),
                    "--force".dimmed()
                );
            }
            return Ok(());
        }

        if !force {
            if cli.json {
                println!(
                    "{}",
                    serde_json::json!({
                        "status": "outdated",
                        "installed_version": current,
                        "embedded_version": embedded_extension::EXTENSION_VERSION,
                        "path": dir.display().to_string()
                    })
                );
            } else {
                println!(
                    "  {} Extension is outdated (installed: v{}, embedded: v{})",
                    "!".yellow(),
                    current,
                    embedded_extension::EXTENSION_VERSION
                );
                println!(
                    "  {}  Use {} to upgrade",
                    "ℹ".dimmed(),
                    "actionbook extension install --force".dimmed()
                );
            }
            return Ok(());
        }
    }

    let path = embedded_extension::extract(force)?;

    if cli.json {
        println!(
            "{}",
            serde_json::json!({
                "status": "installed",
                "version": embedded_extension::EXTENSION_VERSION,
                "path": path.display().to_string()
            })
        );
    } else {
        println!();
        println!(
            "  {} Extension v{} installed successfully",
            "✓".green(),
            embedded_extension::EXTENSION_VERSION
        );
        println!("  {}  Path: {}", "◆".cyan(), path.display());
        println!();
        println!("  {}", "Next steps:".bold());
        println!("  1. Open {} in Chrome", "chrome://extensions".cyan());
        println!("  2. Enable {}", "Developer mode".bold());
        println!(
            "  3. Click {} and select:",
            "Load unpacked".bold()
        );
        println!("     {}", path.display().to_string().dimmed());
        println!(
            "  4. Run {}",
            "actionbook extension serve".cyan()
        );
        println!();
    }

    Ok(())
}

async fn path(cli: &Cli) -> Result<()> {
    let dir = embedded_extension::extension_dir()?;

    if cli.json {
        println!(
            "{}",
            serde_json::json!({
                "path": dir.display().to_string(),
                "installed": embedded_extension::is_installed(),
                "version": embedded_extension::installed_version(),
            })
        );
    } else {
        println!("{}", dir.display());
    }

    Ok(())
}

async fn uninstall(cli: &Cli) -> Result<()> {
    if !embedded_extension::is_installed() {
        if cli.json {
            println!(
                "{}",
                serde_json::json!({ "status": "not_installed" })
            );
        } else {
            println!(
                "  {} Extension is not installed",
                "ℹ".dimmed()
            );
        }
        return Ok(());
    }

    let dir = embedded_extension::extension_dir()?;
    embedded_extension::uninstall()?;

    if cli.json {
        println!(
            "{}",
            serde_json::json!({
                "status": "uninstalled",
                "path": dir.display().to_string()
            })
        );
    } else {
        println!(
            "  {} Extension removed from {}",
            "✓".green(),
            dir.display()
        );
    }

    Ok(())
}
