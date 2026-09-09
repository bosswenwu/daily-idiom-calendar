# 每日成语 · 日历挂件

一个 **Windows 网页版**「每日成语」日历组件：拟物撕历风格，内置成语库，显示农历/节气，可前后翻日，并可作为桌面独立小窗与任务看板每日推送使用。

## 文件清单

| 文件 | 作用 |
| --- | --- |
| `index.html` | 组件主页面（样式 + 交互），双击即可浏览器打开 |
| `data.js` / `data2.js` / `data3.js` | 成语库，共 **141 条**（拼音、四字逐字拼音、中英释义、例句及拼音/英译、配色） |
| `lunar.js` | 农历 + 二十四节气计算（1900–2100） |
| `open-widget.cmd` | 以 Chrome/Edge「应用模式」打开**独立小窗**（桌面挂件，双击即可，纯 ASCII 兼容任意代码页） |
| `open-widget.ps1` | 同一挂件的 PowerShell 启动器（带中文提示，参数更稳，可选） |
| `idiom-daily.mjs` | 命令行生成今天的成语（`--json` 输出结构化数据） |
| `任务看板-每日成语推送.md` | 接入任务看板、每天定时推送的步骤与卡片 |
| `journal.md` | （运行后生成）每日追加的成语日志 |

## 怎么打开

**方式 A：直接看（浏览器）**
双击 `index.html`，或运行 `open-widget.cmd`。

**方式 B：桌面挂件（独立小窗）**
双击 `open-widget.cmd` —— 会用系统里的 Edge 或 Chrome 以 `--app` 应用模式启动一个独立小窗（隐藏标签栏/地址栏），可拖到桌面角落当挂件。
（若本机 `cmd` 对中文脚本不兼容，也可右键 `open-widget.ps1` → “使用 PowerShell 运行”。）

## 功能

- 拟物撕历：双层装饰框、装订针、撕下毛边、米黄纸张、内阴影。
- 日期栏：月·日 / 年 / 星期 / **节气**。
- 农历条：**农历日期 + 干支年 + 生肖**；当天是节气则高亮「今日·XX」，否则显示「距『XX』N天」。
- 大字成语 + 整句拼音；四格**逐字拆解**（每字带拼音）。
- **释义 Meaning / 例句 Example**（例句含拼音行 + 英文翻译）。
- 红/绿卡片配色：默认「自动」随成语（红/绿），可切「自动 / 红 / 绿」。
- 交互：`◀ 前一天` / `后一天 ▶` / `今天`；按「一年中的第 N 天」稳定轮换，同一天看到同一成语。
- 动效：翻页成语逐字弹出、拆解格悬浮、背景渐变与漂浮圆。

## 命令行

```powershell
node idiom-daily.mjs            # 今天成语（人读文本）
node idiom-daily.mjs --json     # 今天成语（JSON，含逐字拼音等）
node idiom-daily.mjs --date=2026-09-06   # 指定某天
node idiom-daily.mjs +3          # 今天 +3 天
```

## 每日自动推送（可选）

按 `任务看板-每日成语推送.md` 在看板新建定时任务，cron `0 8 * * *`，Host 会把当天成语写入 `journal.md` 并在会话中展示。

> 注意：看板定时执行会消耗与普通 DSH 会话相同的 API 额度；错过的时间点不补跑；需 Host 保持运行。

## 发布上线（GitHub + Pages）

本机沙箱默认禁止进程出网，无法由我直接推送；请在你自己的终端（网络正常）运行一键脚本即可：

```powershell
cd C:\Users\ty00545\Desktop\chengyu-calendar
$env:GH_TOKEN = "ghp_你的token"      # 只在本会话生效，不落盘
.\publish.ps1 -Repo bosswenwu/daily-idiom-calendar
```

脚本会：校验 Token →（若无则自动创建公开仓库）→ 推送 `main` → 开启 GitHub Pages，并打印公开链接：

```
https://bosswenwu.github.io/daily-idiom-calendar/
```

> 公开链接第一次部署通常 1–3 分钟内生效，之后发给别人即可直接访问。
> 仓库里已含 `.nojekyll`（禁用 Jekyll，按原样托管静态页面）、`.gitignore`（忽略 `journal.md` 等生成文件）。
