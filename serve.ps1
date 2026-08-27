param(
  [string]$Root = $PSScriptRoot,
  [string]$IPAddress = "192.168.100.13",
  [int]$Port = 8080
)

# Plain TCP socket server (not System.Net.HttpListener) — HttpListener goes
# through the http.sys kernel driver and needs a URL-ACL reservation (admin-
# only) for any non-loopback prefix. A raw TcpListener bind needs no special
# privileges for an ordinary port, so this avoids touching system/network
# settings entirely.

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".htm"  = "text/html; charset=utf-8"
  ".js"   = "application/javascript"
  ".css"  = "text/css"
  ".json" = "application/json"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
}

$ip = [System.Net.IPAddress]::Parse($IPAddress)
$listener = New-Object System.Net.Sockets.TcpListener($ip, $Port)
$listener.Start()
Write-Host "Serving $Root at http://${IPAddress}:${Port}/"

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $requestLine = $reader.ReadLine()
    while (($line = $reader.ReadLine()) -ne $null -and $line -ne "") { }

    if ([string]::IsNullOrWhiteSpace($requestLine)) { continue }
    $parts = $requestLine -split ' '
    $path = $parts[1]

    $localPath = $path.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($localPath)) { $localPath = "quiz.html" }
    $localPath = $localPath.Split('?')[0]
    $localPath = [System.Uri]::UnescapeDataString($localPath)
    $filePath = Join-Path $Root $localPath

    if (Test-Path $filePath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($filePath)
      $contentType = $mimeTypes[$ext]
      if (-not $contentType) { $contentType = "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
      $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($headerBytes, 0, $headerBytes.Length)
      $stream.Write($bytes, 0, $bytes.Length)
    } else {
      $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
      $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
      $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($headerBytes, 0, $headerBytes.Length)
      $stream.Write($body, 0, $body.Length)
    }
    $stream.Flush()
  } catch {
  } finally {
    $client.Close()
  }
}
