package com.kanta.worldtravel

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

// Swift移植時: @main struct KantaWorldTravelApp: App { var body: some Scene { ... } }

/**
 * Kanta World Travel Applicationクラス
 * @HiltAndroidApp アノテーションでHiltの依存性注入を有効化する
 * Swift移植時: @main struct KantaWorldTravelApp: App
 */
@HiltAndroidApp
class KantaApp : Application()
