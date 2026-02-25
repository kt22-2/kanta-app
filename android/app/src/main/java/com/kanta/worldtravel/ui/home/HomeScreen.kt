package com.kanta.worldtravel.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.kanta.worldtravel.ui.theme.DarkBg
import com.kanta.worldtravel.ui.theme.NavyPrimary
import com.kanta.worldtravel.ui.theme.OffWhite
import com.kanta.worldtravel.ui.theme.SandAccent

/**
 * ホーム画面
 * Swift移植時: struct HomeView: View { @StateObject var viewModel = HomeViewModel() ... }
 */
@Composable
fun HomeScreen(
    onNavigateToCountryList: () -> Unit,
    viewModel: HomeViewModel = hiltViewModel()
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBg),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(32.dp)
        ) {
            // アプリロゴ・タイトル
            Text(
                text = "🌍",
                style = MaterialTheme.typography.headlineLarge,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            Text(
                text = "Kanta World Travel",
                style = MaterialTheme.typography.headlineMedium,
                color = SandAccent,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "世界一周旅行者のための情報アプリ",
                style = MaterialTheme.typography.bodyMedium,
                color = OffWhite.copy(alpha = 0.7f),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(48.dp))

            // 機能紹介カード
            FeatureCard(
                emoji = "🗺️",
                title = "国情報",
                description = "世界195カ国の詳細情報"
            )

            Spacer(modifier = Modifier.height(12.dp))

            FeatureCard(
                emoji = "🛡️",
                title = "安全情報",
                description = "外務省レベルの渡航安全情報"
            )

            Spacer(modifier = Modifier.height(12.dp))

            FeatureCard(
                emoji = "📶",
                title = "オフライン対応",
                description = "Wi-Fi不安定な旅先でもキャッシュで閲覧可能"
            )

            Spacer(modifier = Modifier.height(48.dp))

            Button(
                onClick = onNavigateToCountryList,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = SandAccent
                )
            ) {
                Text(
                    text = "国一覧を見る",
                    style = MaterialTheme.typography.titleMedium,
                    color = DarkBg
                )
            }
        }
    }
}

@Composable
private fun FeatureCard(
    emoji: String,
    title: String,
    description: String
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                color = NavyPrimary,
                shape = RoundedCornerShape(12.dp)
            )
            .padding(16.dp)
    ) {
        Column {
            Text(
                text = "$emoji $title",
                style = MaterialTheme.typography.titleMedium,
                color = SandAccent
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                color = OffWhite.copy(alpha = 0.8f)
            )
        }
    }
}
