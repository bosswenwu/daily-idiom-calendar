# 每日成语 · 桌面挂件启动器（PowerShell 版）
# 以 Edge/Chrome 的“应用模式(独立小窗)”打开，隐藏标签/地址栏。
# 用法：右键“使用 PowerShell 运行”，或在终端里 .\open-widget.ps1
$url = "file:///C:/Users/ty00545/Desktop/chengyu-calendar/index.html"
$candidates = @(
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)
$browser = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($browser) {
  Start-Process -FilePath $browser -ArgumentList @("--app=$url", "--window-size=480,880", "--window-position=1200,140")
  Write-Host "已用独立小窗打开「每日成语」挂件 (应用模式)。"
} else {
  Start-Process $url
  Write-Host "未找到 Edge/Chrome，已用默认浏览器打开。"
}
