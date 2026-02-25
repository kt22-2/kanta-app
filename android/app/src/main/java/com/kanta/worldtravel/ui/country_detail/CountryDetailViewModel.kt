package com.kanta.worldtravel.ui.country_detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kanta.worldtravel.domain.model.AttractionsInfo
import com.kanta.worldtravel.domain.model.Country
import com.kanta.worldtravel.domain.model.SafetyInfo
import com.kanta.worldtravel.domain.usecase.GetAttractionsUseCase
import com.kanta.worldtravel.domain.usecase.GetCountryDetailUseCase
import com.kanta.worldtravel.domain.usecase.GetSafetyInfoUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// Swift移植時: @MainActor class CountryDetailViewModel: ObservableObject {
//     @Published var uiState: CountryDetailUiState = .loading
//     let countryCode: String
// }

/**
 * 国詳細画面のViewModel
 * 国情報・安全情報・観光情報を並行取得する
 */
@HiltViewModel
class CountryDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val getCountryDetailUseCase: GetCountryDetailUseCase,
    private val getSafetyInfoUseCase: GetSafetyInfoUseCase,
    private val getAttractionsUseCase: GetAttractionsUseCase
) : ViewModel() {

    private val countryCode: String = checkNotNull(savedStateHandle["countryCode"])

    private val _uiState = MutableStateFlow<CountryDetailUiState>(CountryDetailUiState.Loading)
    val uiState: StateFlow<CountryDetailUiState> = _uiState.asStateFlow()

    init {
        loadCountryDetail()
    }

    fun loadCountryDetail() {
        viewModelScope.launch {
            _uiState.value = CountryDetailUiState.Loading

            // 国情報・安全情報・観光情報を並行取得
            val countryDeferred = async { getCountryDetailUseCase(countryCode) }
            val safetyDeferred = async { getSafetyInfoUseCase(countryCode) }
            val attractionsDeferred = async { getAttractionsUseCase(countryCode) }

            val countryResult = countryDeferred.await()
            val safetyResult = safetyDeferred.await()
            val attractionsResult = attractionsDeferred.await()

            if (countryResult.isFailure) {
                _uiState.value = CountryDetailUiState.Error(
                    countryResult.exceptionOrNull()?.message ?: "エラーが発生しました"
                )
                return@launch
            }

            _uiState.value = CountryDetailUiState.Success(
                country = countryResult.getOrThrow(),
                safetyInfo = safetyResult.getOrNull(),
                attractionsInfo = attractionsResult.getOrNull()
            )
        }
    }
}

/**
 * 国詳細画面のUIState
 * Swift移植時: enum CountryDetailUiState { case loading, success(Country, SafetyInfo?, AttractionsInfo?), error(String) }
 */
sealed class CountryDetailUiState {
    object Loading : CountryDetailUiState()
    data class Success(
        val country: Country,
        val safetyInfo: SafetyInfo?,
        val attractionsInfo: AttractionsInfo?
    ) : CountryDetailUiState()
    data class Error(val message: String) : CountryDetailUiState()
}
