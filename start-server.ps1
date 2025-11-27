# Frostbyte Cup - HTTP Server für localhost:8080
$port = 8080
$url = "http://localhost:$port/"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Frostbyte Cup Server wird gestartet" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server läuft auf: $url" -ForegroundColor Yellow
Write-Host "Drücke Ctrl+C um den Server zu stoppen" -ForegroundColor Gray
Write-Host ""

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()

Write-Host "✓ Server erfolgreich gestartet!" -ForegroundColor Green
Write-Host "✓ Öffne Browser: $url" -ForegroundColor Green
Write-Host ""

# Öffne Browser automatisch
Start-Process $url

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Log request
        $timestamp = Get-Date -Format "HH:mm:ss"
        Write-Host "[$timestamp] " -NoNewline -ForegroundColor DarkGray
        Write-Host "$($request.HttpMethod) " -NoNewline -ForegroundColor Cyan
        Write-Host "$($request.Url.LocalPath)" -ForegroundColor White
        
        # Get requested path
        $path = $request.Url.LocalPath
        if ($path -eq '/') {
            $path = '/index.html'
        }
        
        # Build file path
        $filePath = Join-Path $PSScriptRoot $path.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            try {
                $content = [System.IO.File]::ReadAllBytes($filePath)
                
                # Set content type based on extension
                $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = switch ($extension) {
                    '.html' { 'text/html; charset=utf-8' }
                    '.css'  { 'text/css; charset=utf-8' }
                    '.js'   { 'application/javascript; charset=utf-8' }
                    '.json' { 'application/json; charset=utf-8' }
                    '.jpg'  { 'image/jpeg' }
                    '.jpeg' { 'image/jpeg' }
                    '.png'  { 'image/png' }
                    '.gif'  { 'image/gif' }
                    '.svg'  { 'image/svg+xml' }
                    '.ico'  { 'image/x-icon' }
                    '.txt'  { 'text/plain; charset=utf-8' }
                    default { 'application/octet-stream' }
                }
                
                $response.ContentType = $contentType
                $response.ContentLength64 = $content.Length
                $response.StatusCode = 200
                $response.OutputStream.Write($content, 0, $content.Length)
            }
            catch {
                Write-Host "  ✗ Fehler beim Lesen der Datei: $_" -ForegroundColor Red
                $response.StatusCode = 500
            }
        }
        else {
            Write-Host "  ✗ Datei nicht gefunden: $filePath" -ForegroundColor Red
            $response.StatusCode = 404
            $errorContent = [System.Text.Encoding]::UTF8.GetBytes("404 - Datei nicht gefunden")
            $response.ContentType = 'text/plain; charset=utf-8'
            $response.ContentLength64 = $errorContent.Length
            $response.OutputStream.Write($errorContent, 0, $errorContent.Length)
        }
        
        $response.Close()
    }
}
catch {
    Write-Host "Fehler: $_" -ForegroundColor Red
}
finally {
    $listener.Stop()
    Write-Host ""
    Write-Host "Server wurde beendet." -ForegroundColor Yellow
}
