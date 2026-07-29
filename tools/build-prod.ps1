# Сборка папки PROD — того, что заливается в каталог домена evgeny35.online.
#
# PROD никогда не правится руками: это копия исходников плюс два серверных
# файла (.htaccess и robots.txt), которые лежат в репозитории рядом.
# Запуск из любого места:  powershell -File tools\build-prod.ps1
# by MRWLTR

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$prod = Join-Path $root 'PROD'

# Серверные файлы переживают пересборку: они существуют только в PROD.
$keep = @('.htaccess', 'robots.txt')
$stash = Join-Path $env:TEMP ("prod-keep-" + [guid]::NewGuid().ToString('N'))

if (Test-Path $prod) {
  New-Item -ItemType Directory -Force $stash | Out-Null
  foreach ($f in $keep) {
    $p = Join-Path $prod $f
    if (Test-Path $p) { Copy-Item $p $stash -Force }
  }
  Remove-Item $prod -Recurse -Force
}

New-Item -ItemType Directory -Force $prod | Out-Null

# Что уезжает на сайт. Всё остальное (README, CLAUDE.md, _docs, tools, .git)
# остаётся в репозитории и на домен не попадает.
$files = @('index.html', 'favicon.ico', 'apple-touch-icon.png')
foreach ($f in $files) { Copy-Item (Join-Path $root $f) $prod -Force }

Copy-Item (Join-Path $root 'assets') $prod -Recurse -Force

if (Test-Path $stash) {
  foreach ($f in $keep) {
    $p = Join-Path $stash $f
    if (Test-Path $p) { Copy-Item $p $prod -Force }
  }
  Remove-Item $stash -Recurse -Force
}

# Опись: по ней сверяется, что на сервер доехало ровно это.
$manifest = Join-Path $root '_docs\prod-manifest.txt'
$rows = Get-ChildItem $prod -Recurse -File -Force | ForEach-Object {
  $rel = $_.FullName.Substring($prod.Length + 1) -replace '\\', '/'
  '{0,-38} {1,9} b  {2}' -f $rel, $_.Length, (Get-FileHash $_.FullName -Algorithm SHA256).Hash.Substring(0, 16)
}
$total = (Get-ChildItem $prod -Recurse -File -Force | Measure-Object Length -Sum).Sum

@(
  "Опись пакета PROD для домена evgeny35.online"
  "Собрано скриптом tools/build-prod.ps1, руками не править."
  ""
  ("файлов: {0}, всего {1:N2} МБ" -f $rows.Count, ($total / 1MB))
  ""
) + $rows | Set-Content $manifest -Encoding utf8

Write-Host ("PROD собран: {0} файлов, {1:N2} МБ" -f $rows.Count, ($total / 1MB))
Write-Host ("опись: {0}" -f $manifest)
