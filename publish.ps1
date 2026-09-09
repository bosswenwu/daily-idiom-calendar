# ============================================================
#  每日成语日历 · 一键发布到 GitHub 并开启 Pages
#  在你的【本机终端】运行（这里网络正常、可用你的 Token）
#
#  用法：
#     .\publish.ps1                          # 用环境变量 GH_TOKEN / GH_REPO
#     .\publish.ps1 -Repo bosswenwu/daily-idiom-calendar -Branch main
#     $env:GH_TOKEN="ghp_xxx"; .\publish.ps1
# ============================================================
param(
  [string]$Repo   = $env:GH_REPO,     # 形如 owner/repo
  [string]$Branch = "main",
  [string]$Token  = $env:GH_TOKEN
)
# 默认发布目标（可被 -Repo 或 $env:GH_REPO 覆盖）
if ([string]::IsNullOrWhiteSpace($Repo)) { $Repo = "bosswenwu/daily-idiom-calendar" }

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

# ---- 1) Token ----
if ([string]::IsNullOrWhiteSpace($Token)) {
  $Token = Read-Host "请输入你的 GitHub Personal Access Token（不会显示）"
  if ([string]::IsNullOrWhiteSpace($Token)) { throw "未提供 Token" }
}
# ---- 2) Repo ----
if ([string]::IsNullOrWhiteSpace($Repo)) {
  $Repo = Read-Host "仓库名（形如 owner/repo，例如 bosswenwu/daily-idiom-calendar）"
  if ([string]::IsNullOrWhiteSpace($Repo)) { throw "未提供仓库名" }
}
$parts = $Repo -split "/"
if ($parts.Count -ne 2) { throw "仓库名格式应为 owner/repo" }
$Owner = $parts[0]; $Name = $parts[1]

$apiHeaders = @{ Authorization = "Bearer $Token"; 'Accept' = 'application/vnd.github+json'; 'User-Agent' = 'dsh-publish' }
Write-Host "== 1/5 校验 Token 与身份 =="
$me = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $apiHeaders
Write-Host "   登录用户: $($me.login)"

Write-Host "== 2/5 确保仓库存在（不存在则自动创建 public 仓库）=="
$repoFull = "repos/$Owner/$Name"
$exists = $true
try { Invoke-RestMethod -Uri "https://api.github.com/$repoFull" -Headers $apiHeaders | Out-Null }
catch { $exists = $false }
if ($exists) {
  Write-Host "   仓库已存在: $Owner/$Name"
} else {
  Write-Host "   创建公开仓库: $Owner/$Name"
  $body = @{ name = $Name; private = $false; auto_init = $false; description = "每日成语日历挂件：拟物撕历、农历/节气、桌面挂件、141条成语库" } | ConvertTo-Json
  Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $apiHeaders -Body $body -ContentType "application/json" | Out-Null
}

Write-Host "== 3/5 设置远端并推送 =="
# 远端用不带 Token 的普通 https（避免 token 写入 .git/config 长期留存）
git remote remove origin 2>$null
git remote add origin "https://github.com/$Owner/$Name.git"
# 推送时临时用带 Token 的地址（仅命令行，不落盘）
git push "https://x-access-token:$Token@github.com/$Owner/$Name.git" "HEAD:$Branch" -u origin $Branch 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "   推送失败，尝试用 Token 地址重推..."
  git push "https://x-access-token:$Token@github.com/$Owner/$Name.git" "HEAD:$Branch"
}
Write-Host "   推送完成 ✅"

Write-Host "== 4/5 开启 GitHub Pages =="
try {
  $pagesBody = @{ source = @{ branch = $Branch; path = "/" } } | ConvertTo-Json
  Invoke-RestMethod -Uri "https://api.github.com/$repoFull/pages" -Method Post -Headers $apiHeaders -Body $pagesBody -ContentType "application/json" | Out-Null
  Write-Host "   Pages 已创建."
} catch {
  Write-Host "   Pages 可能已存在或需手动开启: $($_.Exception.Message)"
}

Write-Host "== 5/5 你的公开访问链接 =="
Write-Host "   https://$Owner.github.io/$Name/"
Write-Host "   （首次部署通常 1-3 分钟内生效）"
Write-Host ""
Write-Host "后续修改后重新发布："
Write-Host "   git add -A; git commit -am update; git push origin $Branch"
