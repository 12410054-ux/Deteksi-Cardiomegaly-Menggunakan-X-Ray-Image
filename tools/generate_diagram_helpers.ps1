Add-Type -AssemblyName System.Drawing

function Draw-RoundedRectangle {
    param(
        [System.Drawing.Graphics]$g,
        [System.Drawing.Pen]$pen,
        [System.Drawing.Brush]$brush,
        [float]$x, [float]$y, [float]$width, [float]$height, [float]$radius
    )
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $diameter = $radius * 2
    $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
    $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
    $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()

    if ($brush -ne $null) {
        $g.FillPath($brush, $path)
    }
    if ($pen -ne $null) {
        $g.DrawPath($pen, $path)
    }
    $path.Dispose()
}

function Draw-Cuboid3D {
    param(
        [System.Drawing.Graphics]$g,
        [float]$centerX, [float]$centerY,
        [float]$w, [float]$h, [float]$depth,
        [System.Drawing.Color]$frontColor,
        [System.Drawing.Color]$topColor,
        [System.Drawing.Color]$sideColor,
        [System.Drawing.Pen]$edgePen
    )
    $x0 = $centerX - ($w / 2.0)
    $y0 = $centerY - ($h / 2.0)
    
    # Perspective offsets
    $dx = $depth * 0.707
    $dy = -$depth * 0.50

    # Top face
    $topPts = @(
        [System.Drawing.PointF]::new($x0, $y0),
        [System.Drawing.PointF]::new($x0 + $dx, $y0 + $dy),
        [System.Drawing.PointF]::new($x0 + $w + $dx, $y0 + $dy),
        [System.Drawing.PointF]::new($x0 + $w, $y0)
    )
    $topBrush = [System.Drawing.SolidBrush]::new($topColor)
    $g.FillPolygon($topBrush, $topPts)
    if ($edgePen) { $g.DrawPolygon($edgePen, $topPts) }
    $topBrush.Dispose()

    # Side face
    $sidePts = @(
        [System.Drawing.PointF]::new($x0 + $w, $y0),
        [System.Drawing.PointF]::new($x0 + $w + $dx, $y0 + $dy),
        [System.Drawing.PointF]::new($x0 + $w + $dx, $y0 + $h + $dy),
        [System.Drawing.PointF]::new($x0 + $w, $y0 + $h)
    )
    $sideBrush = [System.Drawing.SolidBrush]::new($sideColor)
    $g.FillPolygon($sideBrush, $sidePts)
    if ($edgePen) { $g.DrawPolygon($edgePen, $sidePts) }
    $sideBrush.Dispose()

    # Front face
    $frontBrush = [System.Drawing.SolidBrush]::new($frontColor)
    $g.FillRectangle($frontBrush, $x0, $y0, $w, $h)
    if ($edgePen) { $g.DrawRectangle($edgePen, $x0, $y0, $w, $h) }
    $frontBrush.Dispose()
}

function Draw-Arrow {
    param(
        [System.Drawing.Graphics]$g,
        [float]$x1, [float]$y1,
        [float]$x2, [float]$y2,
        [System.Drawing.Color]$color,
        [float]$penWidth = 3
    )
    $pen = [System.Drawing.Pen]::new($color, $penWidth)
    $pen.CustomEndCap = [System.Drawing.Drawing2D.AdjustableArrowCap]::new(6, 6, $true)
    $g.DrawLine($pen, $x1, $y1, $x2, $y2)
    $pen.Dispose()
}

Write-Host "Helper functions loaded."
