Add-Type -AssemblyName System.Drawing

# Trim transparent padding around the logo to its content bounding box.
$srcPath = "C:\Users\Sudeep Vishwakarma\Downloads\LABS\src\IMAGE\ChatGPT Image Jul 12, 2026, 09_30_42 PM.png"
$outPath = "C:\Users\Sudeep Vishwakarma\Downloads\LABS\public\logo.png"

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$w = $src.Width
$h = $src.Height

$bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::Transparent)
$g.DrawImage($src, 0, 0, $w, $h)
$g.Dispose()
$src.Dispose()

$rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $data.Stride
$len = [Math]::Abs($stride) * $h
$bytes = New-Object byte[] $len
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $len)
$bmp.UnlockBits($data)

$alphaThr = 12
$minX = $w; $minY = $h; $maxX = 0; $maxY = 0

for ($y = 0; $y -lt $h; $y++) {
    $row = $y * $stride
    for ($x = 0; $x -lt $w; $x++) {
        $a = $bytes[$row + $x * 4 + 3]
        if ($a -gt $alphaThr) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

if ($maxX -lt $minX) { throw "No opaque pixels found." }

$pad = 8
$cx = [Math]::Max(0, $minX - $pad)
$cy = [Math]::Max(0, $minY - $pad)
$cw = [Math]::Min($w - $cx, ($maxX - $minX) + 1 + 2 * $pad)
$ch = [Math]::Min($h - $cy, ($maxY - $minY) + 1 + 2 * $pad)

$cropRect = New-Object System.Drawing.Rectangle $cx, $cy, $cw, $ch
$cropped = $bmp.Clone($cropRect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$cropped.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

"Original: ${w}x${h}"
"Content bbox: X=$minX..$maxX Y=$minY..$maxY"
"Cropped saved: ${cw}x${ch} -> $outPath"

$cropped.Dispose()
$bmp.Dispose()
