# Actionbook Extension 使用指南

本指南面向已经安装 `actionbook` Rust CLI 的用户，目标是让你用 Chrome 扩展模式直接执行页面自动化命令。

## 1. 前置条件

1. 已安装 `actionbook`（Rust CLI 版本）。
2. 已安装 Chrome（或 Chromium）。
3. 能在终端执行：

```bash
actionbook --version
```

## 2. 安装并加载扩展

1. 安装扩展文件（会解压到本机配置目录）：

```bash
actionbook extension install
```

2. 查看扩展目录：

```bash
actionbook extension path
```

3. 在 Chrome 打开 `chrome://extensions`：
- 打开 `Developer mode`
- 点击 `Load unpacked`
- 选择上一步的扩展目录

## 3. 启动 Bridge（必须）

扩展通过本地 WebSocket 与 CLI 通信。先启动 bridge：

```bash
actionbook extension serve
```

说明：
- 当前扩展默认连接 `ws://localhost:19222`，建议使用默认端口。
- 该命令需要保持运行（新开一个终端执行页面命令）。

## 4. 配对扩展

安装时 CLI 会注册 Native Messaging，通常会自动配对 token。  
如果未自动配对：

1. 点击扩展图标打开 popup
2. 把 `actionbook extension serve` 输出里的 token（`abk_...`）粘贴进去
3. 点击 `Save` / `Connect`

## 5. 连接检查

```bash
actionbook extension status
actionbook extension ping
```

看到 `running` / `responded` 即表示链路通畅。

## 6. 页面操作（Extension 模式）

所有浏览器命令都加 `--extension`（或设置环境变量 `ACTIONBOOK_EXTENSION=1`）。

### 6.1 基础导航

```bash
actionbook --extension browser open "https://example.com"
actionbook --extension browser goto "https://example.com/login"
actionbook --extension browser back
actionbook --extension browser forward
actionbook --extension browser reload
actionbook --extension browser close
actionbook --extension browser restart
```

### 6.2 页面交互

```bash
actionbook --extension browser wait "#username" --timeout 10000
actionbook --extension browser fill "#username" "demo"
actionbook --extension browser click "button[type='submit']"
actionbook --extension browser select "#country" "US"
actionbook --extension browser hover ".menu-item"
actionbook --extension browser focus "#search-input"
actionbook --extension browser press "Enter"
actionbook --extension browser wait-nav
actionbook --extension browser text
```

### 6.3 标签页管理

```bash
actionbook --extension browser pages
actionbook --extension browser switch tab:123456
```

### 6.4 调试与导出

```bash
actionbook --extension browser status
actionbook --extension browser eval "document.title"
actionbook --extension browser html
actionbook --extension browser snapshot
actionbook --extension browser inspect 200 300
actionbook --extension browser viewport
actionbook --extension browser screenshot output.png --full-page
actionbook --extension browser pdf output.pdf
```

### 6.5 Cookie 操作

```bash
actionbook --extension browser cookies list
actionbook --extension browser cookies get session_id
actionbook --extension browser cookies set demo_cookie hello
actionbook --extension browser cookies delete demo_cookie
actionbook --extension browser cookies clear
```

### 6.6 连接已有浏览器

```bash
actionbook --extension browser connect
```

## 7. 搭配 Action Manual 的推荐流程

```bash
actionbook search "github search repos" --domain github.com
actionbook get "<area_id>"
```

然后直接使用 `get` 返回的 CSS 选择器执行 `click/fill/select` 等命令。

## 8. 常见问题

1. `Ping failed` / `not running`
- 确认 `actionbook extension serve` 正在运行。
- 确认扩展已加载且启用。

2. `Token required` / `pairing_required`
- 重新打开 popup，粘贴最新 token。
- token 空闲 30 分钟会过期，重启 `serve` 可刷新。

3. `No tab attached`
- 先确保 Chrome 有可见活动标签页。
- 先执行一次 `open` 或 `goto`，再执行交互命令。

4. 非默认端口连不上
- 当前扩展默认连接 `localhost:19222`，请优先使用默认端口启动 bridge。

5. 高风险操作被拦截
- L3 操作（如部分 cookie/存储修改）会要求 popup 里确认，注意查看扩展弹窗状态。

## 9. 推荐的最小工作流

```bash
# 终端 A：启动 bridge（保持运行）
actionbook extension serve

# 终端 B：执行自动化
actionbook --extension browser open "https://example.com"
actionbook --extension browser fill "#username" "demo"
actionbook --extension browser click "button[type='submit']"
actionbook --extension browser wait-nav
actionbook --extension browser screenshot result.png
```
