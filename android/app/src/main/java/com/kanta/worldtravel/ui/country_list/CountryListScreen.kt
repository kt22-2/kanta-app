package com.kanta.worldtravel.ui.country_list

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.kanta.worldtravel.domain.model.Country
import com.kanta.worldtravel.ui.theme.DarkBg
import com.kanta.worldtravel.ui.theme.MutedGray
import com.kanta.worldtravel.ui.theme.NavyPrimary
import com.kanta.worldtravel.ui.theme.OffWhite
import com.kanta.worldtravel.ui.theme.SandAccent
import com.kanta.worldtravel.ui.theme.SurfaceBg

/**
 * 国一覧画面
 * Swift移植時: struct CountryListView: View { @StateObject var viewModel = CountryListViewModel() }
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CountryListScreen(
    onCountryClick: (String) -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: CountryListViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "国一覧",
                        style = MaterialTheme.typography.titleLarge,
                        color = OffWhite
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
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = NavyPrimary
                )
            )
        },
        containerColor = DarkBg
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // 検索バー
            OutlinedTextField(
                value = searchQuery,
                onValueChange = viewModel::onSearchQueryChange,
                placeholder = {
                    Text(
                        "国名・地域で検索",
                        color = MutedGray
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "検索",
                        tint = MutedGray
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = OffWhite,
                    unfocusedTextColor = OffWhite,
                    focusedBorderColor = SandAccent,
                    unfocusedBorderColor = MutedGray,
                    cursorColor = SandAccent,
                    focusedContainerColor = SurfaceBg,
                    unfocusedContainerColor = SurfaceBg
                ),
                singleLine = true
            )

            // コンテンツエリア
            when (val state = uiState) {
                is CountryListUiState.Loading -> LoadingContent()
                is CountryListUiState.Success -> CountryList(
                    countries = state.countries,
                    onCountryClick = onCountryClick
                )
                is CountryListUiState.Error -> ErrorContent(
                    message = state.message,
                    onRetry = { viewModel.loadCountries() }
                )
            }
        }
    }
}

@Composable
private fun LoadingContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(color = SandAccent)
    }
}

@Composable
private fun CountryList(
    countries: List<Country>,
    onCountryClick: (String) -> Unit
) {
    if (countries.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "該当する国が見つかりません",
                color = MutedGray,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(1.dp)
        ) {
            items(
                items = countries,
                key = { it.code }
            ) { country ->
                CountryListItem(
                    country = country,
                    onClick = { onCountryClick(country.code) }
                )
            }
        }
    }
}

@Composable
private fun CountryListItem(
    country: Country,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(SurfaceBg)
            .clickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // 国旗画像
        if (country.flagUrl.isNotBlank()) {
            AsyncImage(
                model = country.flagUrl,
                contentDescription = "${country.name}の国旗",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
            )
        } else {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(NavyPrimary),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = country.flagEmoji,
                    style = MaterialTheme.typography.titleLarge
                )
            }
        }

        Spacer(modifier = Modifier.width(16.dp))

        // 国名情報
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = country.nameJa ?: country.name,
                style = MaterialTheme.typography.titleMedium,
                color = OffWhite,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = country.name,
                style = MaterialTheme.typography.bodySmall,
                color = MutedGray,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = country.region,
                style = MaterialTheme.typography.bodySmall,
                color = SandAccent
            )
        }

        // 首都
        country.capital?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.bodySmall,
                color = MutedGray,
                maxLines = 1
            )
        }
    }
}

@Composable
private fun ErrorContent(
    message: String,
    onRetry: () -> Unit
) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(32.dp)
        ) {
            Text(
                text = "エラーが発生しました",
                style = MaterialTheme.typography.titleMedium,
                color = OffWhite
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = message,
                style = MaterialTheme.typography.bodySmall,
                color = MutedGray
            )
            Spacer(modifier = Modifier.height(16.dp))
            TextButton(onClick = onRetry) {
                Text(
                    text = "再試行",
                    color = SandAccent
                )
            }
        }
    }
}
