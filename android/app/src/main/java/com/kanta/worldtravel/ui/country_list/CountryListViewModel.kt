package com.kanta.worldtravel.ui.country_list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kanta.worldtravel.domain.model.Country
import com.kanta.worldtravel.domain.usecase.GetCountriesUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// Swift移植時: @MainActor class CountryListViewModel: ObservableObject {
//     @Published var uiState: CountryListUiState = .loading
//     @Published var searchQuery: String = ""
//     private let getCountriesUseCase: GetCountriesUseCase
// }

/**
 * 国一覧画面のViewModel
 * StateFlow で UIState を管理し、Compose が自動的に再描画する
 * Swift移植時: @MainActor class CountryListViewModel: ObservableObject
 */
@HiltViewModel
class CountryListViewModel @Inject constructor(
    private val getCountriesUseCase: GetCountriesUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<CountryListUiState>(CountryListUiState.Loading)
    val uiState: StateFlow<CountryListUiState> = _uiState.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    init {
        loadCountries()
    }

    /**
     * 検索クエリ変更時のハンドラ
     * Swift移植時: func onSearchQueryChange(_ query: String) { searchQuery = query; loadCountries(query: query) }
     */
    fun onSearchQueryChange(query: String) {
        _searchQuery.value = query
        loadCountries(query)
    }

    /**
     * 国一覧を読み込む
     * Swift移植時: func loadCountries(query: String? = nil) { Task { ... } }
     */
    fun loadCountries(query: String? = null) {
        viewModelScope.launch {
            _uiState.value = CountryListUiState.Loading
            getCountriesUseCase(query).fold(
                onSuccess = { countries ->
                    _uiState.value = CountryListUiState.Success(countries)
                },
                onFailure = { error ->
                    _uiState.value = CountryListUiState.Error(
                        error.message ?: "エラーが発生しました"
                    )
                }
            )
        }
    }
}

/**
 * 国一覧画面のUIState
 * Swift移植時: enum CountryListUiState { case loading, success([Country]), error(String) }
 */
sealed class CountryListUiState {
    /** 読み込み中 */
    object Loading : CountryListUiState()

    /** 読み込み成功 */
    data class Success(val countries: List<Country>) : CountryListUiState()

    /** エラー */
    data class Error(val message: String) : CountryListUiState()
}
