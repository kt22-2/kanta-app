package com.kanta.worldtravel.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

// 冒険テーマのダークカラースキーム
// Swift移植時: extension ColorScheme { ... } / .preferredColorScheme(.dark)
private val DarkColorScheme = darkColorScheme(
    primary = NavyPrimary,
    onPrimary = OffWhite,
    primaryContainer = SurfaceBg,
    onPrimaryContainer = OffWhite,
    secondary = SandAccent,
    onSecondary = DarkBg,
    secondaryContainer = NavyPrimary,
    onSecondaryContainer = SandAccent,
    tertiary = ForestGreen,
    onTertiary = OffWhite,
    background = DarkBg,
    onBackground = OffWhite,
    surface = SurfaceBg,
    onSurface = OffWhite,
    surfaceVariant = NavyPrimary,
    onSurfaceVariant = MutedGray,
    error = AlertRed,
    onError = OffWhite
)

/**
 * Kanta World Travel アプリのテーマ
 * 常にダークモード（旅行・冒険テーマ）
 * Swift移植時: struct KantaTheme: ViewModifier { ... }
 */
@Composable
fun KantaWorldTravelTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = KantaTypography,
        content = content
    )
}
