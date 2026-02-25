package com.kanta.worldtravel.ui.country_detail

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.kanta.worldtravel.domain.model.AttractionsInfo
import com.kanta.worldtravel.domain.model.Country
import com.kanta.worldtravel.domain.model.SafetyInfo
import com.kanta.worldtravel.domain.model.SafetyLevel
import com.kanta.worldtravel.ui.theme.DarkBg
import com.kanta.worldtravel.ui.theme.MutedGray
import com.kanta.worldtravel.ui.theme.NavyPrimary
import com.kanta.worldtravel.ui.theme.OffWhite
import com.kanta.worldtravel.ui.theme.SandAccent
import com.kanta.worldtravel.ui.theme.SurfaceBg

/**
 * 国詳細画面
 * Swift移植時: struct CountryDetailView: View { ... }
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CountryDetailScreen(
    countryCode: String,
    onNavigateBack: () -> Unit,
    viewModel: CountryDetailViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "国詳細",
                        color = OffWhite,
                        style = MaterialTheme.typography.titleLarge
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "戻る",
                            tint = OffWhite
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = NavyPrimary)
            )
        },
        containerColor = DarkBg
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (val state = uiState) {
                is CountryDetailUiState.Loading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = SandAccent)
                    }
                }

                is CountryDetailUiState.Success -> {
                    CountryDetailContent(
                        country = state.country,
                        safetyInfo = state.safetyInfo,
                        attractionsInfo = state.attractionsInfo
                    )
                }

                is CountryDetailUiState.Error -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(32.dp)
                        ) {
                            Text(
                                text = state.message,
                                color = OffWhite,
                                style = MaterialTheme.typography.bodyMedium
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            TextButton(onClick = { viewModel.loadCountryDetail() }) {
                                Text("再試行", color = SandAccent)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CountryDetailContent(
    country: Country,
    safetyInfo: SafetyInfo?,
    attractionsInfo: AttractionsInfo?
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // ヘッダー（国旗 + 基本情報）
        CountryHeaderSection(country)

        // 安全情報セクション
        safetyInfo?.let { SafetyInfoSection(it) }

        // 基本情報セクション
        CountryInfoSection(country)

        // 観光情報セクション
        attractionsInfo?.let { AttractionsSection(it) }

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
private fun CountryHeaderSection(country: Country) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(SurfaceBg, RoundedCornerShape(12.dp))
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        AsyncImage(
            model = country.flagUrl,
            contentDescription = "${country.name}の国旗",
            contentScale = ContentScale.Fit,
            modifier = Modifier
                .width(160.dp)
                .height(100.dp)
                .clip(RoundedCornerShape(8.dp))
        )
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = country.flagEmoji + " " + (country.nameJa ?: country.name),
            style = MaterialTheme.typography.headlineSmall,
            color = OffWhite
        )
        Text(
            text = country.name,
            style = MaterialTheme.typography.bodyMedium,
            color = MutedGray
        )
        country.capital?.let {
            Text(
                text = "首都: $it",
                style = MaterialTheme.typography.bodySmall,
                color = SandAccent
            )
        }
    }
}

@Composable
private fun SafetyInfoSection(safetyInfo: SafetyInfo) {
    val levelColor = Color(safetyInfo.level.color)

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(SurfaceBg, RoundedCornerShape(12.dp))
            .padding(16.dp)
    ) {
        Text(
            text = "安全情報",
            style = MaterialTheme.typography.titleMedium,
            color = SandAccent
        )
        Spacer(modifier = Modifier.height(8.dp))

        // 安全レベルバッジ
        Box(
            modifier = Modifier
                .background(levelColor.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                .padding(horizontal = 12.dp, vertical = 6.dp)
        ) {
            Text(
                text = safetyInfo.level.label,
                color = levelColor,
                style = MaterialTheme.typography.labelMedium
            )
        }

        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = safetyInfo.summary,
            style = MaterialTheme.typography.bodyMedium,
            color = OffWhite
        )

        if (safetyInfo.details.isNotEmpty()) {
            Spacer(modifier = Modifier.height(8.dp))
            safetyInfo.details.forEach { detail ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                ) {
                    Text(
                        text = "・${detail.category}: ",
                        style = MaterialTheme.typography.bodySmall,
                        color = SandAccent
                    )
                    Text(
                        text = detail.description,
                        style = MaterialTheme.typography.bodySmall,
                        color = MutedGray,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
    }
}

@Composable
private fun CountryInfoSection(country: Country) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(SurfaceBg, RoundedCornerShape(12.dp))
            .padding(16.dp)
    ) {
        Text(
            text = "基本情報",
            style = MaterialTheme.typography.titleMedium,
            color = SandAccent
        )
        Spacer(modifier = Modifier.height(8.dp))

        InfoRow("地域", "${country.region}${country.subregion?.let { " / $it" } ?: ""}")
        InfoRow("人口", "%,d 人".format(country.population))
        if (country.languages.isNotEmpty()) {
            InfoRow("言語", country.languages.joinToString(", "))
        }
        if (country.currencies.isNotEmpty()) {
            InfoRow(
                "通貨",
                country.currencies.joinToString(", ") { c ->
                    "${c.name}（${c.code}${c.symbol?.let { " $it" } ?: ""}）"
                }
            )
        }
    }
}

@Composable
private fun AttractionsSection(attractionsInfo: AttractionsInfo) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(SurfaceBg, RoundedCornerShape(12.dp))
            .padding(16.dp)
    ) {
        Text(
            text = "観光スポット",
            style = MaterialTheme.typography.titleMedium,
            color = SandAccent
        )

        attractionsInfo.bestSeason?.let {
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "ベストシーズン: $it",
                style = MaterialTheme.typography.bodySmall,
                color = MutedGray
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        attractionsInfo.attractions.take(5).forEach { attraction ->
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp)
            ) {
                Text(
                    text = attraction.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = OffWhite
                )
                Text(
                    text = attraction.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MutedGray
                )
                if (attraction.highlights.isNotEmpty()) {
                    Text(
                        text = attraction.highlights.joinToString(" · "),
                        style = MaterialTheme.typography.bodySmall,
                        color = SandAccent
                    )
                }
            }
        }

        if (attractionsInfo.travelTips.isNotEmpty()) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "旅のヒント",
                style = MaterialTheme.typography.titleMedium,
                color = SandAccent
            )
            attractionsInfo.travelTips.forEach { tip ->
                Text(
                    text = "・$tip",
                    style = MaterialTheme.typography.bodySmall,
                    color = MutedGray,
                    modifier = Modifier.padding(vertical = 2.dp)
                )
            }
        }
    }
}

@Composable
private fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MutedGray,
            modifier = Modifier.width(80.dp)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodySmall,
            color = OffWhite,
            modifier = Modifier.weight(1f)
        )
    }
}
