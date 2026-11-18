Add-Type -AssemblyName System.Drawing

$baseDir = "d:\project X-ray jantung1\project X-ray jantung"
$xrayPath = Join-Path $baseDir "testing\cardiomegaly.png"
$targetDirs = @(
    (Join-Path $baseDir "docs\manuscript"),
    (Join-Path $baseDir "evaluation_reports"),
    "d:\project X-ray jantung1"
)

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

    if ($brush -ne $null) { $g.FillPath($brush, $path) }
    if ($pen -ne $null) { $g.DrawPath($pen, $path) }
    $path.Dispose()
}

function Draw-Cuboid {
    param(
        [System.Drawing.Graphics]$g,
        [float]$x, [float]$y, [float]$w, [float]$h, [float]$depth,
        [System.Drawing.Color]$cFront,
        [System.Drawing.Color]$cTop,
        [System.Drawing.Color]$cSide,
        [System.Drawing.Pen]$edgePen
    )
    $dx = $depth * 0.707
    $dy = -$depth * 0.50

    # Top face
    $topPts = @(
        [System.Drawing.PointF]::new($x, $y),
        [System.Drawing.PointF]::new($x + $dx, $y + $dy),
        [System.Drawing.PointF]::new($x + $w + $dx, $y + $dy),
        [System.Drawing.PointF]::new($x + $w, $y)
    )
    $bTop = [System.Drawing.SolidBrush]::new($cTop)
    $g.FillPolygon($bTop, $topPts)
    if ($edgePen) { $g.DrawPolygon($edgePen, $topPts) }
    $bTop.Dispose()

    # Side face
    $sidePts = @(
        [System.Drawing.PointF]::new($x + $w, $y),
        [System.Drawing.PointF]::new($x + $w + $dx, $y + $dy),
        [System.Drawing.PointF]::new($x + $w + $dx, $y + $h + $dy),
        [System.Drawing.PointF]::new($x + $w, $y + $h)
    )
    $bSide = [System.Drawing.SolidBrush]::new($cSide)
    $g.FillPolygon($bSide, $sidePts)
    if ($edgePen) { $g.DrawPolygon($edgePen, $sidePts) }
    $bSide.Dispose()

    # Front face
    $bFront = [System.Drawing.SolidBrush]::new($cFront)
    $g.FillRectangle($bFront, $x, $y, $w, $h)
    if ($edgePen) { $g.DrawRectangle($edgePen, $x, $y, $w, $h) }
    $bFront.Dispose()
}

function Render-ArchitectureDiagram {
    $W = 3200
    $H = 1350
    $bmp = [System.Drawing.Bitmap]::new($W, $H)
    $bmp.SetResolution(300, 300)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Background
    $g.Clear([System.Drawing.Color]::FromArgb(248, 250, 252))

    # Inner Canvas Card
    $whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
    $borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(226, 232, 240), 2)
    Draw-RoundedRectangle -g $g -pen $borderPen -brush $whiteBrush -x 20 -y 20 -width ($W - 40) -height ($H - 40) -radius 24

    # Fonts
    $fontTitle = [System.Drawing.Font]::new("Segoe UI", 26, [System.Drawing.FontStyle]::Bold)
    $fontSubtitle = [System.Drawing.Font]::new("Segoe UI", 14, [System.Drawing.FontStyle]::Regular)
    $fontHdr = [System.Drawing.Font]::new("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
    $fontBold = [System.Drawing.Font]::new("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $fontRegular = [System.Drawing.Font]::new("Segoe UI", 10, [System.Drawing.FontStyle]::Regular)
    $fontSmall = [System.Drawing.Font]::new("Segoe UI", 9, [System.Drawing.FontStyle]::Regular)
    $fontMono = [System.Drawing.Font]::new("Consolas", 11, [System.Drawing.FontStyle]::Bold)
    $fontMonoLarge = [System.Drawing.Font]::new("Consolas", 13, [System.Drawing.FontStyle]::Bold)

    # Brushes & Pens
    $whiteText = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
    $textDark = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(15, 23, 42))
    $textMuted = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(100, 116, 139))
    $textBlue = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(29, 78, 216))
    $textGreen = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(4, 120, 87))
    $textRed = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(220, 38, 38))
    $textPurple = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(126, 34, 206))
    $grayPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(203, 213, 225), 1.5)
    $arrowPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(148, 163, 184), 3)
    $arrowPen.CustomEndCap = [System.Drawing.Drawing2D.AdjustableArrowCap]::new(6, 6, $true)

    # Header
    $tagBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(239, 246, 255))
    $tagPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(191, 219, 254), 1.5)
    Draw-RoundedRectangle -g $g -pen $tagPen -brush $tagBrush -x 60 -y 45 -width 180 -height 32 -radius 16
    $tagTextBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(29, 78, 216))
    $g.DrawString("RESEARCH MANUSCRIPT", $fontBold, $tagTextBrush, 75, 52)

    $g.DrawString("Custom CNN Architecture for Cardiomegaly Detection", $fontTitle, $textDark, 60, 85)
    $g.DrawString("A 4-Block Hierarchical Deep Convolutional Neural Network with 2,485,825 Parameters", $fontSubtitle, $textMuted, 60, 130)

    # Header Badges (Right)
    $badgeX = $W - 840
    # Badge 1: Input Res
    $b1Brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(248, 250, 252))
    Draw-RoundedRectangle -g $g -pen $grayPen -brush $b1Brush -x $badgeX -y 60 -width 175 -height 65 -radius 12
    $g.DrawString("INPUT RESOLUTION", $fontSmall, $textMuted, ($badgeX + 15), 70)
    $g.DrawString("160 × 160 × 3", $fontMonoLarge, $textDark, ($badgeX + 15), 92)

    # Badge 2: Total Params
    $b2Brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(239, 246, 255))
    $b2Pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(191, 219, 254), 1.5)
    Draw-RoundedRectangle -g $g -pen $b2Pen -brush $b2Brush -x ($badgeX + 190) -y 60 -width 175 -height 65 -radius 12
    $g.DrawString("TOTAL PARAMETERS", $fontSmall, $textBlue, ($badgeX + 205), 70)
    $g.DrawString("2,485,825", $fontMonoLarge, $textBlue, ($badgeX + 205), 92)

    # Badge 3: Accuracy
    $b3Brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(236, 253, 245))
    $b3Pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(167, 243, 208), 1.5)
    Draw-RoundedRectangle -g $g -pen $b3Pen -brush $b3Brush -x ($badgeX + 380) -y 60 -width 175 -height 65 -radius 12
    $g.DrawString("TEST ACCURACY", $fontSmall, $textGreen, ($badgeX + 395), 70)
    $g.DrawString("75.49%", $fontMonoLarge, $textGreen, ($badgeX + 395), 92)

    # Badge 4: ROC-AUC
    $b4Brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(250, 245, 255))
    $b4Pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(233, 213, 255), 1.5)
    Draw-RoundedRectangle -g $g -pen $b4Pen -brush $b4Brush -x ($badgeX + 570) -y 60 -width 175 -height 65 -radius 12
    $g.DrawString("ROC-AUC SCORE", $fontSmall, $textPurple, ($badgeX + 585), 70)
    $g.DrawString("0.8350", $fontMonoLarge, $textPurple, ($badgeX + 585), 92)

    # Separator Line
    $g.DrawLine($grayPen, 60, 155, ($W - 60), 155)

    # Colors for Layers
    $cConvFront = [System.Drawing.Color]::FromArgb(59, 130, 246)
    $cConvTop   = [System.Drawing.Color]::FromArgb(96, 165, 250)
    $cConvSide  = [System.Drawing.Color]::FromArgb(30, 64, 175)
    $convPen    = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(29, 78, 216), 1.5)

    $cPoolFront = [System.Drawing.Color]::FromArgb(245, 158, 11)
    $cPoolTop   = [System.Drawing.Color]::FromArgb(251, 191, 36)
    $cPoolSide  = [System.Drawing.Color]::FromArgb(180, 83, 9)
    $poolPen    = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(217, 119, 6), 1.5)

    $cFlatFront = [System.Drawing.Color]::FromArgb(168, 85, 247)
    $cFlatTop   = [System.Drawing.Color]::FromArgb(192, 132, 252)
    $cFlatSide  = [System.Drawing.Color]::FromArgb(107, 33, 168)
    $flatPen    = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(126, 34, 206), 1.5)

    $cDenseFront = [System.Drawing.Color]::FromArgb(16, 185, 129)
    $cDenseTop   = [System.Drawing.Color]::FromArgb(52, 211, 153)
    $cDenseSide  = [System.Drawing.Color]::FromArgb(6, 95, 70)
    $densePen    = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(4, 120, 87), 1.5)

    # -------------------------------------------------------------
    # STAGE 0: INPUT IMAGE (X: 60)
    # -------------------------------------------------------------
    $cardBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
    Draw-RoundedRectangle -g $g -pen $grayPen -brush $cardBrush -x 60 -y 180 -width 300 -height 740 -radius 20
    
    $stgHdrBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(241, 245, 249))
    Draw-RoundedRectangle -g $g -pen $null -brush $stgHdrBrush -x 80 -y 200 -width 130 -height 28 -radius 8
    $g.DrawString("STAGE 0 : INPUT", $fontBold, $textMuted, 90, 205)

    $xrayBoxBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(15, 23, 42))
    Draw-RoundedRectangle -g $g -pen $null -brush $xrayBoxBrush -x 110 -y 250 -width 200 -height 200 -radius 16
    if (Test-Path $xrayPath) {
        $xrayImg = [System.Drawing.Image]::FromFile($xrayPath)
        $g.DrawImage($xrayImg, 120, 260, 180, 180)
        $xrayImg.Dispose()
    }
    
    $imgSubBadgeBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(200, 15, 23, 42))
    Draw-RoundedRectangle -g $g -pen $null -brush $imgSubBadgeBrush -x 135 -y 415 -width 150 -height 26 -radius 6
    $cyanBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(56, 189, 248))
    $g.DrawString("160 × 160 × 3 (RGB)", $fontMono, $cyanBrush, 142, 420)

    $g.DrawString("Input Radiograph", $fontHdr, $textDark, 140, 470)
    $g.DrawString("Chest X-Ray Image", $fontRegular, $textMuted, 145, 495)

    $preBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(248, 250, 252))
    Draw-RoundedRectangle -g $g -pen $grayPen -brush $preBg -x 85 -y 530 -width 250 -height 360 -radius 14
    $g.DrawString("Preprocessing Pipeline:", $fontBold, $textDark, 100, 545)
    
    $blueDot = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(59, 130, 246))
    $g.FillEllipse($blueDot, 105, 580, 8, 8)
    $g.DrawString("Target Resolution:", $fontBold, $textDark, 120, 575)
    $g.DrawString("160 × 160 pixels", $fontMono, $textMuted, 120, 595)

    $g.FillEllipse($blueDot, 105, 630, 8, 8)
    $g.DrawString("Pixel Normalization:", $fontBold, $textDark, 120, 625)
    $g.DrawString("[0.0 , 1.0] (scale 1/255)", $fontMono, $textMuted, 120, 645)

    $g.FillEllipse($blueDot, 105, 680, 8, 8)
    $g.DrawString("Resampling Filter:", $fontBold, $textDark, 120, 675)
    $g.DrawString("Nearest-Neighbor (Sharp edges)", $fontRegular, $textMuted, 120, 695)

    $g.FillEllipse($blueDot, 105, 730, 8, 8)
    $g.DrawString("Augmentation (Train only):", $fontBold, $textDark, 120, 725)
    $g.DrawString("Rotation ±5°, Zoom 5%", $fontRegular, $textMuted, 120, 745)
    $g.DrawString("Horizontal Flip: True", $fontRegular, $textMuted, 120, 765)

    $balBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(239, 246, 255))
    $balPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(191, 219, 254), 1)
    Draw-RoundedRectangle -g $g -pen $balPen -brush $balBrush -x 100 -y 805 -width 220 -height 34 -radius 8
    $g.DrawString("Balanced: 2,776 / class", $fontBold, $textBlue, 135, 813)

    $g.DrawLine($arrowPen, 370, 550, 400, 550)

    # -------------------------------------------------------------
    # STAGE 1: 4 CONVOLUTIONAL BLOCKS
    # -------------------------------------------------------------
    function Draw-ConvBlockUI {
        param($blockNum, $bx, $convFilters, $convOut, $poolOut, $params, $cumParams, $receptive, $features, $wConv, $hConv, $dConv, $wPool, $hPool, $dPool)
        
        Draw-RoundedRectangle -g $g -pen $grayPen -brush $cardBrush -x $bx -y 180 -width 450 -height 740 -radius 20
        
        $bHdrBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(219, 234, 254))
        Draw-RoundedRectangle -g $g -pen $null -brush $bHdrBrush -x ($bx + 20) -y 200 -width 180 -height 28 -radius 8
        $g.DrawString("BLOCK $blockNum : CONV & POOL", $fontBold, $textBlue, ($bx + 30), 205)
        $g.DrawString("$params Params", $fontMono, $textBlue, ($bx + 310), 205)

        # 3D Cuboids
        Draw-Cuboid -g $g -x ($bx + 60) -y 270 -w $wConv -h $hConv -depth $dConv -cFront $cConvFront -cTop $cConvTop -cSide $cConvSide -edgePen $convPen
        $g.DrawString("$convOut", $fontBold, $whiteText, ($bx + 65), (270 + $hConv/2 - 15))
        $g.DrawString("$convFilters flt", $fontSmall, $whiteText, ($bx + 65), (270 + $hConv/2 + 5))

        $interArrow = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(245, 158, 11), 2.5)
        $interArrow.CustomEndCap = [System.Drawing.Drawing2D.AdjustableArrowCap]::new(5, 5, $true)
        $g.DrawLine($interArrow, ($bx + 60 + $wConv + 35), 335, ($bx + 260), 335)

        Draw-Cuboid -g $g -x ($bx + 280) -y (270 + ($hConv - $hPool)/2) -w $wPool -h $hPool -depth $dPool -cFront $cPoolFront -cTop $cPoolTop -cSide $cPoolSide -edgePen $poolPen
        $g.DrawString("$poolOut", $fontBold, $whiteText, ($bx + 285), (270 + $hConv/2 - 15))
        $g.DrawString("Pool /2", $fontSmall, $whiteText, ($bx + 285), (270 + $hConv/2 + 5))

        $g.DrawString("Conv2D Layer", $fontBold, $textDark, ($bx + 40), 450)
        $g.DrawString("$convFilters filters (3×3), ReLU", $fontRegular, $textMuted, ($bx + 40), 472)
        $g.DrawString("Tensor: $convOut × $convFilters", $fontMono, $textDark, ($bx + 40), 492)
        $g.DrawString("Params: $params", $fontMono, $textBlue, ($bx + 40), 512)

        $g.DrawString("MaxPooling2D", $fontBold, $textDark, ($bx + 260), 450)
        $g.DrawString("Pool 2×2, Stride 2", $fontRegular, $textMuted, ($bx + 260), 472)
        $g.DrawString("Tensor: $poolOut × $convFilters", $fontMono, $textDark, ($bx + 260), 492)
        $g.DrawString("Params: 0 (Valid)", $fontMono, $textMuted, ($bx + 260), 512)

        Draw-RoundedRectangle -g $g -pen $grayPen -brush $preBg -x ($bx + 25) -y 550 -width 400 -height 340 -radius 14
        $ftTag = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(239, 246, 255))
        Draw-RoundedRectangle -g $g -pen $null -brush $ftTag -x ($bx + 40) -y 565 -width 220 -height 26 -radius 6
        $g.DrawString("REPRESENTATION EXTRACTED", $fontBold, $textBlue, ($bx + 50), 570)

        $g.DrawString($features[0], $fontBold, $textDark, ($bx + 40), 605)
        for ($i = 1; $i -lt $features.Count; $i++) {
            $g.DrawString("• " + $features[$i], $fontRegular, $textMuted, ($bx + 40), (605 + $i * 24))
        }

        $g.DrawLine($grayPen, ($bx + 40), 755, ($bx + 390), 755)
        $g.DrawString("Cumulative Parameters: $cumParams", $fontBold, $textBlue, ($bx + 40), 770)
        $g.DrawString("Effective Receptive Field: $receptive", $fontRegular, $textGreen, ($bx + 40), 795)
    }

    # BLOCK 1
    $f1 = @(
        "Low-Level Thoracic Primitives:",
        "Gabor-like edge filters across radiograph",
        "Thoracic cavity periphery & clavicle lines",
        "Bone cortex vs lung parenchyma contrast",
        "Initial noise suppression"
    )
    Draw-ConvBlockUI -blockNum 1 -bx 410 -convFilters 32 -convOut "158×158" -poolOut "79×79" -params "896" -cumParams "896 (0.04%)" -receptive "5 × 5 pixels" -features $f1 -wConv 130 -hConv 130 -dConv 16 -wPool 90 -hPool 110 -dPool 16
    $g.DrawLine($arrowPen, 870, 550, 900, 550)

    # BLOCK 2
    $f2 = @(
        "Anatomical Mid-Level Structures:",
        "Posterior & anterior rib arches",
        "Right & left hemidiaphragm curvature",
        "Costophrenic angles & sharpness",
        "Mediastinal lateral borders"
    )
    Draw-ConvBlockUI -blockNum 2 -bx 910 -convFilters 64 -convOut "77×77" -poolOut "38×38" -params "18,496" -cumParams "19,392 (0.78%)" -receptive "14 × 14 pixels" -features $f2 -wConv 110 -hConv 110 -dConv 26 -wPool 75 -hPool 90 -dPool 26
    $g.DrawLine($arrowPen, 1370, 550, 1400, 550)

    # BLOCK 3
    $f3 = @(
        "Cardiac Silhouette Geometry:",
        "Left ventricular contour & apex position",
        "Right atrium lateral expansion margins",
        "Aortic knob prominence & silhouette",
        "Thoracic cage width normalization"
    )
    Draw-ConvBlockUI -blockNum 3 -bx 1410 -convFilters 128 -convOut "36×36" -poolOut "18×18" -params "73,856" -cumParams "93,248 (3.75%)" -receptive "32 × 32 pixels" -features $f3 -wConv 85 -hConv 85 -dConv 38 -wPool 60 -hPool 70 -dPool 38
    $g.DrawLine($arrowPen, 1870, 550, 1900, 550)

    # BLOCK 4
    $f4 = @(
        "High-Level Pathology Semantics:",
        "Cardiothoracic Ratio (CTR > 0.50 cutoff)",
        "Transverse cardiac diameter expansion",
        "Apex displacement toward left lateral wall",
        "Holistic cardiac silhouette assessment"
    )
    Draw-ConvBlockUI -blockNum 4 -bx 1910 -convFilters 256 -convOut "16×16" -poolOut "8×8" -params "295,168" -cumParams "388,416 (15.6%)" -receptive "68 × 68 pixels" -features $f4 -wConv 65 -hConv 65 -dConv 50 -wPool 50 -hPool 50 -dPool 50
    $g.DrawLine($arrowPen, 2370, 550, 2400, 550)

    # -------------------------------------------------------------
    # STAGE 2: CLASSIFIER HEAD (X: 2410)
    # -------------------------------------------------------------
    Draw-RoundedRectangle -g $g -pen $grayPen -brush $cardBrush -x 2410 -y 180 -width 450 -height 740 -radius 20
    
    $cHdrBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(243, 232, 255))
    Draw-RoundedRectangle -g $g -pen $null -brush $cHdrBrush -x 2430 -y 200 -width 200 -height 28 -radius 8
    $g.DrawString("STAGE 2 : CLASSIFIER HEAD", $fontBold, $textPurple, 2440, 205)
    $g.DrawString("2,097,409 Params", $fontMono, $textPurple, 2710, 205)

    # Visual representation of Classifier
    Draw-Cuboid -g $g -x 2445 -y 260 -w 12 -h 150 -depth 10 -cFront $cFlatFront -cTop $cFlatTop -cSide $cFlatSide -edgePen $flatPen
    $g.DrawString("Flatten", $fontBold, $textPurple, 2435, 425)
    $g.DrawString("16,384 nodes", $fontMono, $textMuted, 2420, 445)
    $g.DrawString("(8×8×256)", $fontSmall, $textMuted, 2435, 465)

    $smArrow = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(148, 163, 184), 2)
    $smArrow.CustomEndCap = [System.Drawing.Drawing2D.AdjustableArrowCap]::new(4, 4, $true)
    $g.DrawLine($smArrow, 2505, 335, 2530, 335)

    Draw-Cuboid -g $g -x 2540 -y 275 -w 20 -h 120 -depth 14 -cFront $cDenseFront -cTop $cDenseTop -cSide $cDenseSide -edgePen $densePen
    $g.DrawString("Dense 128", $fontBold, $textGreen, 2525, 425)
    $g.DrawString("128 neurons", $fontMono, $textMuted, 2520, 445)
    $g.DrawString("ReLU non-linear", $fontSmall, $textMuted, 2520, 465)

    $g.DrawLine($smArrow, 2600, 335, 2625, 335)

    $dropBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(253, 242, 248))
    $dropPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(244, 114, 182), 2)
    $dropPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
    Draw-RoundedRectangle -g $g -pen $dropPen -brush $dropBrush -x 2635 -y 275 -width 40 -height 120 -radius 8
    $dropTextBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(190, 24, 93))
    $g.DrawString("DROP", $fontSmall, $dropTextBrush, 2638, 305)
    $g.DrawString("50%", $fontBold, $dropTextBrush, 2640, 325)
    $g.DrawString("Dropout", $fontBold, $dropTextBrush, 2632, 425)
    $g.DrawString("Rate 0.50", $fontRegular, $textMuted, 2630, 445)

    $g.DrawLine($smArrow, 2695, 335, 2720, 335)

    $outCircleBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(254, 242, 242))
    $outCirclePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(239, 68, 68), 2.5)
    $g.FillEllipse($outCircleBrush, 2730, 310, 50, 50)
    $g.DrawEllipse($outCirclePen, 2730, 310, 50, 50)
    $sigText = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(220, 38, 38))
    $g.DrawString("σ", $fontTitle, $sigText, 2743, 312)
    $g.DrawString("Dense 1", $fontBold, $textRed, 2730, 425)
    $g.DrawString("Sigmoid", $fontRegular, $textMuted, 2732, 445)

    Draw-RoundedRectangle -g $g -pen $grayPen -brush $preBg -x 2435 -y 510 -width 400 -height 380 -radius 14
    $g.DrawString("Classifier Parameter Accounting:", $fontBold, $textDark, 2455, 530)
    $g.DrawString("1. Flatten Reshape Layer:", $fontBold, $textDark, 2455, 565)
    $g.DrawString("8 × 8 × 256 = 16,384 nodes (0 params)", $fontRegular, $textMuted, 2455, 585)
    $g.DrawString("2. Dense Hidden Layer (128 units, ReLU):", $fontBold, $textDark, 2455, 620)
    $g.DrawString("Weights: 16,384 × 128 = 2,097,152", $fontMono, $textMuted, 2455, 640)
    $g.DrawString("Biases: 128 | Subtotal: 2,097,280 params", $fontMono, $textMuted, 2455, 660)
    $g.DrawString("3. Dropout Regularization:", $fontBold, $textDark, 2455, 695)
    $g.DrawString("Rate = 0.50 (active during train, 0 params)", $fontRegular, $textMuted, 2455, 715)
    $g.DrawString("4. Dense Output (1 unit, Sigmoid):", $fontBold, $textDark, 2455, 750)
    $g.DrawString("Weights: 128 × 1 + 1 bias = 129 params", $fontMono, $textMuted, 2455, 770)

    $g.DrawLine($grayPen, 2455, 805, 2815, 805)
    $g.DrawString("Classifier Subtotal: 2,097,409 params", $fontBold, $textPurple, 2455, 825)
    $g.DrawString("Represents 84.37% of total network weights", $fontRegular, $textMuted, 2455, 850)

    $g.DrawLine($arrowPen, 2870, 550, 2900, 550)

    # -------------------------------------------------------------
    # STAGE 3: OUTPUT / DECISION (X: 2910)
    # -------------------------------------------------------------
    Draw-RoundedRectangle -g $g -pen $grayPen -brush $cardBrush -x 2910 -y 180 -width 230 -height 740 -radius 20
    
    $oHdrBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(254, 226, 226))
    Draw-RoundedRectangle -g $g -pen $null -brush $oHdrBrush -x 2930 -y 200 -width 140 -height 28 -radius 8
    $g.DrawString("STAGE 3 : OUTPUT", $fontBold, $textRed, 2940, 205)

    Draw-RoundedRectangle -g $g -pen $grayPen -brush $preBg -x 2930 -y 250 -width 190 -height 110 -radius 12
    $g.DrawString("PROBABILITY SCORE", $fontSmall, $textMuted, 2960, 265)
    $g.DrawString("ŷ = σ(z)", $fontTitle, $textDark, 2965, 290)
    $g.DrawString("Range: [0.00 , 1.00]", $fontRegular, $textMuted, 2965, 335)

    $threshBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(15, 23, 42))
    Draw-RoundedRectangle -g $g -pen $null -brush $threshBrush -x 2950 -y 385 -width 150 -height 28 -radius 14
    $g.DrawString("THRESHOLD τ = 0.50", $fontBold, $whiteText, 2960, 392)

    # Class 1: Cardiomegaly
    $c1Brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(254, 242, 242))
    $c1Pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(248, 113, 113), 2)
    Draw-RoundedRectangle -g $g -pen $c1Pen -brush $c1Brush -x 2930 -y 435 -width 190 -height 150 -radius 14
    $c1Circle = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(239, 68, 68))
    $g.FillEllipse($c1Circle, 2945, 450, 24, 24)
    $g.DrawString("+", $fontBold, $whiteText, 2951, 452)
    $g.DrawString("POSITIVE (1)", $fontSmall, $textRed, 2975, 445)
    $g.DrawString("Cardiomegaly", $fontHdr, $textRed, 2975, 460)
    $g.DrawString("Condition: ŷ ≥ 0.50", $fontBold, $textDark, 2945, 495)
    $g.DrawString("Heart Enlarged (CTR > 0.5)", $fontRegular, $textMuted, 2945, 515)
    $g.DrawString("TP: 436 | FN: 121 (Sens 78%)", $fontBold, $textRed, 2945, 545)

    # Class 0: Normal
    $c0Brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(236, 253, 245))
    $c0Pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(52, 211, 153), 2)
    Draw-RoundedRectangle -g $g -pen $c0Pen -brush $c0Brush -x 2930 -y 605 -width 190 -height 150 -radius 14
    $c0Circle = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(16, 185, 129))
    $g.FillEllipse($c0Circle, 2945, 620, 24, 24)
    $g.DrawString("✓", $fontBold, $whiteText, 2950, 622)
    $g.DrawString("NEGATIVE (0)", $fontSmall, $textGreen, 2975, 615)
    $g.DrawString("Normal", $fontHdr, $textGreen, 2975, 630)
    $g.DrawString("Condition: ŷ < 0.50", $fontBold, $textDark, 2945, 665)
    $g.DrawString("Normal Silhouette (CTR ≤ 0.5)", $fontRegular, $textMuted, 2945, 685)
    $g.DrawString("TN: 405 | FP: 152 (Spec 73%)", $fontBold, $textGreen, 2945, 715)

    # Triage Flag
    Draw-RoundedRectangle -g $g -pen $grayPen -brush $preBg -x 2930 -y 775 -width 190 -height 115 -radius 12
    $g.DrawString("CLINICAL TRIAGE AID", $fontBold, $textDark, 2945, 790)
    $g.DrawString("Rapid automated screening", $fontRegular, $textMuted, 2945, 815)
    $g.DrawString("Reduces missed diagnosis", $fontRegular, $textMuted, 2945, 835)
    $g.DrawString("Tested on 1,114 cases", $fontBold, $textBlue, 2945, 860)

    # -------------------------------------------------------------
    # FOOTER: LEGEND, TRAINING SPECS, RESULTS
    # -------------------------------------------------------------
    Draw-RoundedRectangle -g $g -pen $grayPen -brush $cardBrush -x 60 -y 940 -width 900 -height 350 -radius 18
    $g.DrawString("Layer Operation Color Legend", $fontHdr, $textDark, 90, 960)
    $g.DrawLine($grayPen, 90, 985, 930, 985)

    Draw-RoundedRectangle -g $g -pen $convPen -brush (New-Object System.Drawing.SolidBrush($cConvFront)) -x 90 -y 1005 -width 32 -height 32 -radius 6
    $g.DrawString("Convolutional Layer (Conv2D): 3×3 kernels, Stride 1, Valid padding, ReLU", $fontRegular, $textDark, 135, 1012)

    Draw-RoundedRectangle -g $g -pen $poolPen -brush (New-Object System.Drawing.SolidBrush($cPoolFront)) -x 90 -y 1055 -width 32 -height 32 -radius 6
    $g.DrawString("MaxPooling2D: 2×2 pool window, Stride 2, spatial downsampling /2 (Valid)", $fontRegular, $textDark, 135, 1062)

    Draw-RoundedRectangle -g $g -pen $flatPen -brush (New-Object System.Drawing.SolidBrush($cFlatFront)) -x 90 -y 1105 -width 32 -height 32 -radius 6
    $g.DrawString("Flatten: Reshapes 3D tensor (8×8×256) into 1D feature vector (16,384)", $fontRegular, $textDark, 135, 1112)

    Draw-RoundedRectangle -g $g -pen $densePen -brush (New-Object System.Drawing.SolidBrush($cDenseFront)) -x 90 -y 1155 -width 32 -height 32 -radius 6
    $g.DrawString("Dense Hidden Layer: 128 fully connected units with ReLU activation", $fontRegular, $textDark, 135, 1162)

    Draw-RoundedRectangle -g $g -pen $dropPen -brush $dropBrush -x 90 -y 1205 -width 32 -height 32 -radius 6
    $g.DrawString("Dropout Regularization: 50% random deactivation during training to prevent overfit", $fontRegular, $textDark, 135, 1212)

    $g.FillEllipse($outCircleBrush, 90, 1250, 32, 32)
    $g.DrawEllipse($outCirclePen, 90, 1250, 32, 32)
    $g.DrawString("σ", $fontBold, $sigText, 98, 1253)
    $g.DrawString("Dense Output: 1 sigmoid neuron outputting cardiomegaly probability ŷ ∈ [0, 1]", $fontRegular, $textDark, 135, 1258)

    # Box 2: Training Specifications
    Draw-RoundedRectangle -g $g -pen $grayPen -brush $cardBrush -x 990 -y 940 -width 1180 -height 350 -radius 18
    $g.DrawString("Training Protocol & Hyperparameter Specifications", $fontHdr, $textDark, 1020, 960)
    $g.DrawLine($grayPen, 1020, 985, 2140, 985)

    $g.DrawString("OPTIMIZATION ALGORITHM", $fontSmall, $textMuted, 1020, 1005)
    $g.DrawString("Adam Optimizer", $fontBold, $textDark, 1020, 1025)
    $g.DrawString("Learning Rate: η = 1 × 10⁻⁴ (0.0001)", $fontRegular, $textMuted, 1020, 1045)
    $g.DrawString("β₁ = 0.90, β₂ = 0.999, ε = 10⁻⁷", $fontRegular, $textMuted, 1020, 1065)

    $g.DrawString("LOSS FUNCTION", $fontSmall, $textMuted, 1400, 1005)
    $g.DrawString("Binary Cross-Entropy", $fontBold, $textDark, 1400, 1025)
    $g.DrawString("ℒ = -[y·log(ŷ) + (1-y)·log(1-ŷ)]", $fontMono, $textMuted, 1400, 1045)
    $g.DrawString("Strict log-loss penalization", $fontRegular, $textMuted, 1400, 1065)

    $g.DrawString("EARLY STOPPING", $fontSmall, $textMuted, 1780, 1005)
    $g.DrawString("Patience = 4 Epochs", $fontBold, $textDark, 1780, 1025)
    $g.DrawString("Monitored: Validation Loss (val_loss)", $fontRegular, $textMuted, 1780, 1045)
    $g.DrawString("restore_best_weights = True", $fontRegular, $textGreen, 1780, 1065)

    $g.DrawLine($grayPen, 1020, 1105, 2140, 1105)

    $g.DrawString("DATA PARTITIONS & SAMPLING", $fontSmall, $textMuted, 1020, 1125)
    $g.DrawString("Total Dataset: 5,552 Balanced Chest X-Rays (2,776 Cardiomegaly / 2,776 Normal)", $fontBold, $textDark, 1020, 1145)
    $g.DrawString("• Training Partition (80%): 4,438 images (2,219 Cardiomegaly, 2,219 Normal), Batch size = 16, Max Epochs = 15", $fontRegular, $textMuted, 1020, 1170)
    $g.DrawString("• Independent Test Partition (20%): 1,114 hold-out images strictly reserved for unbiased benchmarking (557 per class)", $fontRegular, $textMuted, 1020, 1195)
    $g.DrawString("• Data Augmentation: Rotation ±5°, Zoom 5%, Horizontal Flip (Applied strictly to training partition, omitted on test)", $fontRegular, $textMuted, 1020, 1220)
    $g.DrawString("• Input Resampling: Nearest-neighbor interpolation preserves high-frequency cardiac boundary fidelity", $fontBold, $textBlue, 1020, 1245)

    # Box 3: Hold-Out Test Results
    Draw-RoundedRectangle -g $g -pen $grayPen -brush $cardBrush -x 2200 -y 940 -width 940 -height 350 -radius 18
    $g.DrawString("Hold-Out Test Performance (N = 1,114)", $fontHdr, $textDark, 2230, 960)
    $g.DrawLine($grayPen, 2230, 985, 3110, 985)

    Draw-RoundedRectangle -g $g -pen $null -brush $stgHdrBrush -x 2230 -y 1000 -width 880 -height 30 -radius 6
    $g.DrawString("METRIC", $fontBold, $textDark, 2245, 1006)
    $g.DrawString("CUSTOM CNN (PROPOSED)", $fontBold, $textBlue, 2480, 1006)
    $g.DrawString("MOBILENETV2", $fontBold, $textMuted, 2760, 1006)
    $g.DrawString("GAIN (Δ)", $fontBold, $textGreen, 2980, 1006)

    function Draw-MetricRow {
        param($yPos, $name, $cnnVal, $mobVal, $gainVal, $isHighlighted)
        $txtColor = if ($isHighlighted) { $textRed } else { $textDark }
        $g.DrawString($name, $fontRegular, $txtColor, 2245, $yPos)
        $g.DrawString($cnnVal, $fontBold, $textBlue, 2520, $yPos)
        $g.DrawString($mobVal, $fontRegular, $textMuted, 2780, $yPos)
        $g.DrawString($gainVal, $fontBold, $textGreen, 2980, $yPos)
    }

    Draw-MetricRow -yPos 1040 -name "Overall Accuracy" -cnnVal "75.49%" -mobVal "70.20%" -gainVal "+5.29%" -isHighlighted $false
    Draw-MetricRow -yPos 1075 -name "Area Under ROC (AUC)" -cnnVal "0.8350" -mobVal "0.7867" -gainVal "+0.0483 (+6.1%)" -isHighlighted $false
    Draw-MetricRow -yPos 1110 -name "Precision (PPV)" -cnnVal "74.15%" -mobVal "68.23%" -gainVal "+5.92%" -isHighlighted $false
    Draw-MetricRow -yPos 1145 -name "Recall / Sensitivity" -cnnVal "78.28%" -mobVal "75.58%" -gainVal "+2.70%" -isHighlighted $false
    Draw-MetricRow -yPos 1180 -name "Missed Cases (FN)" -cnnVal "121 / 557" -mobVal "136 / 557" -gainVal "-15 Missed Cases" -isHighlighted $true
    Draw-MetricRow -yPos 1215 -name "False Alarms (FP)" -cnnVal "152 / 557" -mobVal "196 / 557" -gainVal "-44 False Alarms" -isHighlighted $false
    Draw-MetricRow -yPos 1250 -name "F1-Score" -cnnVal "76.16%" -mobVal "71.72%" -gainVal "+4.44%" -isHighlighted $false

    # Save
    foreach ($dir in $targetDirs) {
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
        $outPath = Join-Path $dir "cnn_architecture_diagram.png"
        $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host "Saved high-res PNG to: $outPath"
    }

    $g.Dispose()
    $bmp.Dispose()
}

# ----------------------------------------------------------------------------------
# RENDER FLOWCHART DIAGRAM (MODULAR STEP-BY-STEP)
# ----------------------------------------------------------------------------------
function Render-FlowchartDiagram {
    $W = 2800
    $H = 1000
    $bmp = [System.Drawing.Bitmap]::new($W, $H)
    $bmp.SetResolution(300, 300)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    $g.Clear([System.Drawing.Color]::FromArgb(248, 250, 252))

    $whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
    $borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(226, 232, 240), 2)
    Draw-RoundedRectangle -g $g -pen $borderPen -brush $whiteBrush -x 20 -y 20 -width ($W - 40) -height ($H - 40) -radius 20

    $fontTitle = [System.Drawing.Font]::new("Segoe UI", 22, [System.Drawing.FontStyle]::Bold)
    $fontSubtitle = [System.Drawing.Font]::new("Segoe UI", 12, [System.Drawing.FontStyle]::Regular)
    $fontCardHdr = [System.Drawing.Font]::new("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $fontCardTitle = [System.Drawing.Font]::new("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
    $fontRegular = [System.Drawing.Font]::new("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)
    $fontBold = [System.Drawing.Font]::new("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
    $fontMono = [System.Drawing.Font]::new("Consolas", 10.5, [System.Drawing.FontStyle]::Bold)
    $fontSmall = [System.Drawing.Font]::new("Segoe UI", 8.5, [System.Drawing.FontStyle]::Regular)

    $textDark = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(15, 23, 42))
    $textMuted = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(100, 116, 139))
    $textBlue = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(29, 78, 216))
    $textOrange = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(217, 119, 6))
    $textPurple = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(126, 34, 206))
    $textGreen = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(4, 120, 87))
    $textRed = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(220, 38, 38))
    $grayPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(226, 232, 240), 1.5)
    $bluePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(191, 219, 254), 1.5)
    $purplePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(233, 213, 255), 1.5)
    $greenPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(167, 243, 208), 1.5)
    $redPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(254, 202, 202), 1.5)

    $arrowPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(148, 163, 184), 2.5)
    $arrowPen.CustomEndCap = [System.Drawing.Drawing2D.AdjustableArrowCap]::new(5, 5, $true)

    # Title
    $g.DrawString("Layer-by-Layer Architectural Pipeline: Custom CNN (4-Block)", $fontTitle, $textDark, 60, 45)
    $g.DrawString("Complete Tensor Dimensions, Filter Configurations, Activations, and Parameter Distributions", $fontSubtitle, $textMuted, 60, 85)
    $g.DrawLine($grayPen, 60, 115, ($W - 60), 115)

    # 1. INPUT (X: 60, W: 240)
    Draw-RoundedRectangle -g $g -pen $grayPen -brush $whiteBrush -x 60 -y 135 -width 230 -height 500 -radius 16
    $hdrBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(241, 245, 249))
    Draw-RoundedRectangle -g $g -pen $null -brush $hdrBg -x 60 -y 135 -width 230 -height 40 -radius 16
    $g.DrawString("INPUT LAYER", $fontCardHdr, $textDark, 120, 146)

    if (Test-Path $xrayPath) {
        $xrayBox = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(15, 23, 42))
        Draw-RoundedRectangle -g $g -pen $null -brush $xrayBox -x 80 -y 190 -width 190 -height 160 -radius 12
        $xrayImg = [System.Drawing.Image]::FromFile($xrayPath)
        $g.DrawImage($xrayImg, 90, 200, 170, 140)
        $xrayImg.Dispose()
    }

    $g.DrawString("Input Radiograph", $fontCardTitle, $textDark, 80, 365)
    $g.DrawString("Chest X-Ray Image", $fontRegular, $textMuted, 80, 388)

    $shpBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(239, 246, 255))
    Draw-RoundedRectangle -g $g -pen $bluePen -brush $shpBg -x 80 -y 415 -width 190 -height 38 -radius 8
    $g.DrawString("(None, 160, 160, 3)", $fontMono, $textBlue, 90, 425)

    $g.DrawString("Channels: 3 (RGB format)", $fontRegular, $textDark, 80, 465)
    $g.DrawString("Pixel Range: [0.0 , 1.0]", $fontRegular, $textDark, 80, 488)
    $g.DrawString("Nearest Resampling", $fontRegular, $textDark, 80, 511)

    Draw-RoundedRectangle -g $g -pen $null -brush $hdrBg -x 80 -y 575 -width 190 -height 34 -radius 8
    $g.DrawString("Params: 0", $fontBold, $textMuted, 135, 584)

    $g.DrawLine($arrowPen, 300, 385, 330, 385)

    # Function for Conv Blocks in Flowchart
    function Draw-FlowBlock {
        param($bx, $title, $convName, $convShape, $convParam, $poolShape, $cumParam, $rf, $cTag)
        Draw-RoundedRectangle -g $g -pen $bluePen -brush $whiteBrush -x $bx -y 135 -width 255 -height 500 -radius 16
        
        $bHdr = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(219, 234, 254))
        Draw-RoundedRectangle -g $g -pen $null -brush $bHdr -x $bx -y 135 -width 255 -height 40 -radius 16
        $g.DrawString($title, $fontCardHdr, $textBlue, ($bx + 70), 146)

        # Conv2D
        $g.DrawString($convName, $fontCardTitle, $textDark, ($bx + 20), 190)
        $g.DrawString("Activation: ReLU | Stride: 1", $fontRegular, $textMuted, ($bx + 20), 212)
        
        $cShpBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(239, 246, 255))
        Draw-RoundedRectangle -g $g -pen $bluePen -brush $cShpBg -x ($bx + 20) -y 235 -width 215 -height 36 -radius 8
        $g.DrawString($convShape, $fontMono, $textBlue, ($bx + 30), 244)
        $g.DrawString("Params: $convParam", $fontBold, $textBlue, ($bx + 20), 280)

        $g.DrawLine($grayPen, ($bx + 20), 305, ($bx + 235), 305)

        # MaxPooling
        $g.DrawString("MaxPooling2D", $fontCardTitle, $textDark, ($bx + 20), 320)
        $g.DrawString("Pool 2×2 | Stride 2 (Valid)", $fontRegular, $textMuted, ($bx + 20), 342)

        $pShpBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(254, 243, 199))
        $pPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(253, 230, 138), 1.5)
        Draw-RoundedRectangle -g $g -pen $pPen -brush $pShpBg -x ($bx + 20) -y 365 -width 215 -height 36 -radius 8
        $g.DrawString($poolShape, $fontMono, $textOrange, ($bx + 30), 374)
        $g.DrawString("Params: 0 (Downsample /2)", $fontRegular, $textMuted, ($bx + 20), 410)

        $g.DrawLine($grayPen, ($bx + 20), 435, ($bx + 235), 435)

        $g.DrawString("Receptive Field: $rf", $fontBold, $textGreen, ($bx + 20), 450)
        $g.DrawString("Cumulative: $cumParam", $fontRegular, $textMuted, ($bx + 20), 475)
        $g.DrawString($cTag, $fontSmall, $textBlue, ($bx + 20), 500)

        Draw-RoundedRectangle -g $g -pen $null -brush $hdrBg -x ($bx + 20) -y 575 -width 215 -height 34 -radius 8
        $g.DrawString("Block Params: $convParam", $fontBold, $textBlue, ($bx + 40), 584)
    }

    # Block 1
    Draw-FlowBlock -bx 340 -title "CONV BLOCK 1" -convName "Conv2D (32@3×3)" -convShape "(None, 158, 158, 32)" -convParam "896" -poolShape "(None, 79, 79, 32)" -cumParam "896" -rf "5 × 5 px" -cTag "Edges & Thoracic Periphery"
    $g.DrawLine($arrowPen, 605, 385, 635, 385)

    # Block 2
    Draw-FlowBlock -bx 645 -title "CONV BLOCK 2" -convName "Conv2D (64@3×3)" -convShape "(None, 77, 77, 64)" -convParam "18,496" -poolShape "(None, 38, 38, 64)" -cumParam "19,392" -rf "14 × 14 px" -cTag "Rib Arches & Diaphragm"
    $g.DrawLine($arrowPen, 910, 385, 940, 385)

    # Block 3
    Draw-FlowBlock -bx 950 -title "CONV BLOCK 3" -convName "Conv2D (128@3×3)" -convShape "(None, 36, 36, 128)" -convParam "73,856" -poolShape "(None, 18, 18, 128)" -cumParam "93,248" -rf "32 × 32 px" -cTag "Cardiac Borders & Apex"
    $g.DrawLine($arrowPen, 1215, 385, 1245, 385)

    # Block 4
    Draw-FlowBlock -bx 1255 -title "CONV BLOCK 4" -convName "Conv2D (256@3×3)" -convShape "(None, 16, 16, 256)" -convParam "295,168" -poolShape "(None, 8, 8, 256)" -cumParam "388,416" -rf "68 × 68 px" -cTag "Cardiothoracic Ratio (CTR)"
    $g.DrawLine($arrowPen, 1520, 385, 1550, 385)

    # Flatten (X: 1560, W: 220)
    Draw-RoundedRectangle -g $g -pen $purplePen -brush $whiteBrush -x 1560 -y 135 -width 220 -height 500 -radius 16
    $flHdr = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(250, 245, 255))
    Draw-RoundedRectangle -g $g -pen $null -brush $flHdr -x 1560 -y 135 -width 220 -height 40 -radius 16
    $g.DrawString("FLATTEN", $fontCardHdr, $textPurple, 1630, 146)

    $g.DrawString("Flatten Reshape", $fontCardTitle, $textDark, 1580, 190)
    $g.DrawString("Converts 3D → 1D Vector", $fontRegular, $textMuted, 1580, 212)

    $flShpBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(250, 245, 255))
    Draw-RoundedRectangle -g $g -pen $purplePen -brush $flShpBg -x 1580 -y 235 -width 180 -height 36 -radius 8
    $g.DrawString("(None, 16,384)", $fontMono, $textPurple, 1600, 244)

    $g.DrawString("Formula: 8 × 8 × 256", $fontMono, $textDark, 1580, 290)
    $g.DrawString("Total Nodes: 16,384", $fontBold, $textPurple, 1580, 315)
    $g.DrawString("Preserves spatial channels", $fontRegular, $textMuted, 1580, 345)
    $g.DrawString("Zero parameter overhead", $fontRegular, $textMuted, 1580, 370)

    Draw-RoundedRectangle -g $g -pen $null -brush $hdrBg -x 1580 -y 575 -width 180 -height 34 -radius 8
    $g.DrawString("Params: 0", $fontBold, $textPurple, 1630, 584)

    $g.DrawLine($arrowPen, 1790, 385, 1820, 385)

    # Dense 128 (X: 1830, W: 240)
    Draw-RoundedRectangle -g $g -pen $greenPen -brush $whiteBrush -x 1830 -y 135 -width 240 -height 500 -radius 16
    $dnHdr = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(236, 253, 245))
    Draw-RoundedRectangle -g $g -pen $null -brush $dnHdr -x 1830 -y 135 -width 240 -height 40 -radius 16
    $g.DrawString("DENSE HIDDEN", $fontCardHdr, $textGreen, 1890, 146)

    $g.DrawString("Dense (128 units)", $fontCardTitle, $textDark, 1850, 190)
    $g.DrawString("Activation: ReLU", $fontRegular, $textMuted, 1850, 212)

    $dnShpBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(236, 253, 245))
    Draw-RoundedRectangle -g $g -pen $greenPen -brush $dnShpBg -x 1850 -y 235 -width 200 -height 36 -radius 8
    $g.DrawString("(None, 128)", $fontMono, $textGreen, 1900, 244)

    $g.DrawString("Weight Matrix:", $fontBold, $textDark, 1850, 290)
    $g.DrawString("16,384 × 128 = 2,097,152", $fontMono, $textMuted, 1850, 312)
    $g.DrawString("Biases: 128", $fontMono, $textMuted, 1850, 332)
    $g.DrawString("Subtotal: 2,097,280", $fontBold, $textGreen, 1850, 355)
    $g.DrawString("Share: 84.37% of model", $fontRegular, $textMuted, 1850, 380)

    Draw-RoundedRectangle -g $g -pen $null -brush $hdrBg -x 1850 -y 575 -width 200 -height 34 -radius 8
    $g.DrawString("Params: 2,097,280", $fontBold, $textGreen, 1885, 584)

    $g.DrawLine($arrowPen, 2080, 385, 2110, 385)

    # Dropout (X: 2120, W: 200)
    Draw-RoundedRectangle -g $g -pen $redPen -brush $whiteBrush -x 2120 -y 135 -width 200 -height 500 -radius 16
    $drHdr = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(253, 242, 248))
    Draw-RoundedRectangle -g $g -pen $null -brush $drHdr -x 2120 -y 135 -width 200 -height 40 -radius 16
    $g.DrawString("DROPOUT", $fontCardHdr, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(190, 24, 93)), 2180, 146)

    $g.DrawString("Dropout Layer", $fontCardTitle, $textDark, 2140, 190)
    $g.DrawString("Rate = 0.50 (50%)", $fontRegular, $textMuted, 2140, 212)

    $drShpBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(253, 242, 248))
    $drBorder = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(244, 114, 182), 1.5)
    Draw-RoundedRectangle -g $g -pen $drBorder -brush $drShpBg -x 2140 -y 235 -width 160 -height 36 -radius 8
    $g.DrawString("(None, 128)", $fontMono, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(190, 24, 93)), 2170, 244)

    $g.DrawString("Stochastically zeros 50%", $fontRegular, $textDark, 2140, 290)
    $g.DrawString("of activations in training.", $fontRegular, $textDark, 2140, 312)
    $g.DrawString("Prevents co-adaptation", $fontRegular, $textMuted, 2140, 345)
    $g.DrawString("& memorization.", $fontRegular, $textMuted, 2140, 365)
    $g.DrawString("Inactive in test mode.", $fontBold, $textGreen, 2140, 395)

    Draw-RoundedRectangle -g $g -pen $null -brush $hdrBg -x 2140 -y 575 -width 160 -height 34 -radius 8
    $g.DrawString("Params: 0", $fontBold, $textMuted, 2185, 584)

    $g.DrawLine($arrowPen, 2330, 385, 2360, 385)

    # Output Dense (X: 2370, W: 200)
    Draw-RoundedRectangle -g $g -pen $redPen -brush $whiteBrush -x 2370 -y 135 -width 200 -height 500 -radius 16
    $outHdr = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(254, 226, 226))
    Draw-RoundedRectangle -g $g -pen $null -brush $outHdr -x 2370 -y 135 -width 200 -height 40 -radius 16
    $g.DrawString("OUTPUT DENSE", $fontCardHdr, $textRed, 2415, 146)

    $g.DrawString("Dense (1 unit)", $fontCardTitle, $textDark, 2390, 190)
    $g.DrawString("Activation: Sigmoid", $fontRegular, $textMuted, 2390, 212)

    $outShpBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(254, 242, 242))
    Draw-RoundedRectangle -g $g -pen $redPen -brush $outShpBg -x 2390 -y 235 -width 160 -height 36 -radius 8
    $g.DrawString("(None, 1)", $fontMono, $textRed, 2435, 244)

    $g.DrawString("Formula: ŷ = σ(z)", $fontBold, $textDark, 2390, 290)
    $g.DrawString("Weights: 128 × 1 = 128", $fontMono, $textMuted, 2390, 315)
    $g.DrawString("Bias: 1 unit", $fontMono, $textMuted, 2390, 335)
    $g.DrawString("Total: 129 params", $fontBold, $textRed, 2390, 360)
    $g.DrawString("Cardiomegaly proba", $fontRegular, $textMuted, 2390, 390)

    Draw-RoundedRectangle -g $g -pen $null -brush $hdrBg -x 2390 -y 575 -width 160 -height 34 -radius 8
    $g.DrawString("Params: 129", $fontBold, $textRed, 2430, 584)

    $g.DrawLine($arrowPen, 2580, 385, 2610, 385)

    # Decision (X: 2620, W: 140)
    Draw-RoundedRectangle -g $g -pen $grayPen -brush $whiteBrush -x 2620 -y 135 -width 140 -height 500 -radius 16
    Draw-RoundedRectangle -g $g -pen $null -brush $hdrBg -x 2620 -y 135 -width 140 -height 40 -radius 16
    $g.DrawString("DECISION", $fontCardHdr, $textDark, 2650, 146)

    # Pos
    $c1B = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(254, 242, 242))
    Draw-RoundedRectangle -g $g -pen $redPen -brush $c1B -x 2630 -y 190 -width 120 -height 190 -radius 10
    $g.DrawString("ŷ ≥ 0.50", $fontBold, $textRed, 2660, 205)
    $g.DrawString("Cardiomegaly", $fontBold, $textRed, 2640, 230)
    $g.DrawString("Positive (1)", $fontSmall, $textMuted, 2655, 250)
    $g.DrawLine($grayPen, 2640, 275, 2740, 275)
    $g.DrawString("TP: 436", $fontBold, $textRed, 2665, 290)
    $g.DrawString("FN: 121", $fontBold, $textRed, 2665, 315)
    $g.DrawString("Sens: 78.28%", $fontSmall, $textDark, 2648, 345)

    # Neg
    $c0B = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(236, 253, 245))
    Draw-RoundedRectangle -g $g -pen $greenPen -brush $c0B -x 2630 -y 400 -width 120 -height 190 -radius 10
    $g.DrawString("ŷ < 0.50", $fontBold, $textGreen, 2660, 415)
    $g.DrawString("Normal", $fontBold, $textGreen, 2665, 440)
    $g.DrawString("Negative (0)", $fontSmall, $textMuted, 2655, 460)
    $g.DrawLine($grayPen, 2640, 485, 2740, 485)
    $g.DrawString("TN: 405", $fontBold, $textGreen, 2665, 500)
    $g.DrawString("FP: 152", $fontBold, $textGreen, 2665, 525)
    $g.DrawString("Spec: 72.71%", $fontSmall, $textDark, 2648, 555)

    # Summary Table Bottom (Y: 660, H: 290)
    $tblBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(248, 250, 252))
    Draw-RoundedRectangle -g $g -pen $grayPen -brush $tblBg -x 60 -y 660 -width ($W - 120) -height 290 -radius 16

    $g.DrawString("Mathematical Parameter Accounting Table (Layer Breakdown)", $fontCardTitle, $textDark, 90, 680)
    
    # Table Header Row
    $tblHdrBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(226, 232, 240))
    Draw-RoundedRectangle -g $g -pen $null -brush $tblHdrBg -x 90 -y 715 -width ($W - 180) -height 32 -radius 6
    $g.DrawString("LAYER (TYPE)", $fontBold, $textDark, 110, 722)
    $g.DrawString("SPECIFICATIONS / ACTIVATION", $fontBold, $textDark, 480, 722)
    $g.DrawString("OUTPUT TENSOR SHAPE", $fontBold, $textDark, 950, 722)
    $g.DrawString("WEIGHT & BIAS FORMULATION", $fontBold, $textDark, 1400, 722)
    $g.DrawString("PARAM COUNT", $fontBold, $textDark, 1900, 722)
    $g.DrawString("CUMULATIVE PARAMS", $fontBold, $textDark, 2280, 722)

    function Draw-TblRow {
        param($y, $name, $specs, $shp, $form, $p, $cp)
        $g.DrawString($name, $fontBold, $textDark, 110, $y)
        $g.DrawString($specs, $fontRegular, $textMuted, 480, $y)
        $g.DrawString($shp, $fontMono, $textBlue, 950, $y)
        $g.DrawString($form, $fontMono, $textMuted, 1400, $y)
        $g.DrawString($p, $fontBold, $textDark, 1900, $y)
        $g.DrawString($cp, $fontRegular, $textMuted, 2280, $y)
    }

    Draw-TblRow -y 755 -name "Conv Block 1" -specs "Conv2D (32, 3×3, ReLU) + MaxPool (2×2)" -shp "(158, 158, 32) → (79, 79, 32)" -form "(3 × 3 × 3 + 1) × 32" -p "896" -cp "896 (0.04%)"
    Draw-TblRow -y 785 -name "Conv Block 2" -specs "Conv2D (64, 3×3, ReLU) + MaxPool (2×2)" -shp "(77, 77, 64) → (38, 38, 64)" -form "(3 × 3 × 32 + 1) × 64" -p "18,496" -cp "19,392 (0.78%)"
    Draw-TblRow -y 815 -name "Conv Block 3" -specs "Conv2D (128, 3×3, ReLU) + MaxPool (2×2)" -shp "(36, 36, 128) → (18, 18, 128)" -form "(3 × 3 × 64 + 1) × 128" -p "73,856" -cp "93,248 (3.75%)"
    Draw-TblRow -y 845 -name "Conv Block 4" -specs "Conv2D (256, 3×3, ReLU) + MaxPool (2×2)" -shp "(16, 16, 256) → (8, 8, 256)" -form "(3 × 3 × 128 + 1) × 256" -p "295,168" -cp "388,416 (15.63%)"
    Draw-TblRow -y 875 -name "Classifier" -specs "Flatten + Dense (128) + Dropout (0.50) + Dense (1)" -shp "16,384 → 128 → 1" -form "(16,384 + 1) × 128 + (128 + 1) × 1" -p "2,097,409" -cp "2,485,825 (100.0%)"

    $g.DrawLine($grayPen, 90, 910, ($W - 90), 910)
    $g.DrawString("TOTAL NETWORK CAPACITY: 2,485,825 PARAMETERS (100% TRAINABLE) | INPUT: 160 × 160 × 3 | BINARY CROSS-ENTROPY | ADAM (η = 10⁻⁴)", $fontBold, $textBlue, 110, 920)

    foreach ($dir in $targetDirs) {
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
        $outPath = Join-Path $dir "cnn_layers_flowchart.png"
        $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host "Saved flowchart PNG to: $outPath"
    }

    $g.Dispose()
    $bmp.Dispose()
}

Render-ArchitectureDiagram
Render-FlowchartDiagram
Write-Host "All PNG diagrams rendered successfully!"
