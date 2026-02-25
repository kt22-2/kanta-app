package com.kanta.worldtravel

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.navigation.compose.rememberNavController
import com.kanta.worldtravel.ui.navigation.KantaNavGraph
import com.kanta.worldtravel.ui.theme.KantaWorldTravelTheme
import dagger.hilt.android.AndroidEntryPoint

// Swift移植時: @main struct KantaWorldTravelApp: App {
//     var body: some Scene {
//         WindowGroup { ContentView().preferredColorScheme(.dark) }
//     }
// }

/**
 * メインActivity
 * @AndroidEntryPoint でHiltによる依存性注入を有効化
 * Jetpack Compose の setContent でUI全体をセットアップ
 * Swift移植時: KantaWorldTravelApp.swift の @main エントリポイント
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            KantaWorldTravelTheme {
                val navController = rememberNavController()
                KantaNavGraph(navController = navController)
            }
        }
    }
}
