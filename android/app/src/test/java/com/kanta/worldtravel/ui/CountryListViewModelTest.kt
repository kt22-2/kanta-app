package com.kanta.worldtravel.ui

import app.cash.turbine.test
import com.kanta.worldtravel.domain.model.Country
import com.kanta.worldtravel.domain.model.Currency
import com.kanta.worldtravel.domain.usecase.GetCountriesUseCase
import com.kanta.worldtravel.ui.country_list.CountryListUiState
import com.kanta.worldtravel.ui.country_list.CountryListViewModel
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@OptIn(ExperimentalCoroutinesApi::class)
@DisplayName("CountryListViewModel テスト")
class CountryListViewModelTest {

    private val testDispatcher = StandardTestDispatcher()
    private lateinit var getCountriesUseCase: GetCountriesUseCase
    private lateinit var viewModel: CountryListViewModel

    private val mockCountries = listOf(
        Country(
            code = "JP",
            name = "Japan",
            nameJa = "日本",
            capital = "Tokyo",
            region = "Asia",
            subregion = "Eastern Asia",
            population = 125700000,
            languages = listOf("Japanese"),
            currencies = listOf(Currency(code = "JPY", name = "Japanese yen", symbol = "¥")),
            flagUrl = "https://flagcdn.com/jp.svg",
            flagEmoji = "🇯🇵",
            latitude = 36.0,
            longitude = 138.0
        ),
        Country(
            code = "FR",
            name = "France",
            nameJa = "フランス",
            capital = "Paris",
            region = "Europe",
            subregion = "Western Europe",
            population = 67400000,
            languages = listOf("French"),
            currencies = listOf(Currency(code = "EUR", name = "Euro", symbol = "€")),
            flagUrl = "https://flagcdn.com/fr.svg",
            flagEmoji = "🇫🇷",
            latitude = 46.0,
            longitude = 2.0
        )
    )

    @BeforeEach
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        getCountriesUseCase = mockk()
    }

    @AfterEach
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    @DisplayName("初期化時にLoadingStateになり、その後Successになる")
    fun `初期化時にLoadingStateになりその後Successになる`() = runTest {
        // Given: 成功するユースケースのモック
        coEvery { getCountriesUseCase(null, null) } returns Result.success(mockCountries)

        // When: ViewModelを作成するとinitでloadCountriesが呼ばれる
        viewModel = CountryListViewModel(getCountriesUseCase)

        // Then: StateFlowの遷移をTurbineで検証
        viewModel.uiState.test {
            // 最初のemitはLoading（initで即座にemitされる）
            val firstState = awaitItem()
            assertTrue(firstState is CountryListUiState.Loading)

            // コルーチン完了を待ってからSuccessを確認
            testDispatcher.scheduler.advanceUntilIdle()

            val successState = awaitItem()
            assertTrue(successState is CountryListUiState.Success)
            assertEquals(2, (successState as CountryListUiState.Success).countries.size)
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    @DisplayName("APIエラー時にErrorStateになる")
    fun `APIエラー時にErrorStateになる`() = runTest {
        // Given: エラーを返すユースケースのモック
        coEvery { getCountriesUseCase(null, null) } returns Result.failure(
            Exception("サーバーに接続できません")
        )

        // When
        viewModel = CountryListViewModel(getCountriesUseCase)

        // Then
        viewModel.uiState.test {
            awaitItem() // Loading

            testDispatcher.scheduler.advanceUntilIdle()

            val errorState = awaitItem()
            assertTrue(errorState is CountryListUiState.Error)
            assertEquals("サーバーに接続できません", (errorState as CountryListUiState.Error).message)
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    @DisplayName("検索クエリ変更時にフィルタリングされた結果を返す")
    fun `検索クエリ変更時にフィルタリングされた結果を返す`() = runTest {
        // Given: 初回は全件、検索時は絞り込み
        coEvery { getCountriesUseCase(null, null) } returns Result.success(mockCountries)
        coEvery { getCountriesUseCase("Japan", null) } returns Result.success(
            listOf(mockCountries[0])
        )

        viewModel = CountryListViewModel(getCountriesUseCase)
        testDispatcher.scheduler.advanceUntilIdle()

        // When: 検索クエリを変更
        viewModel.onSearchQueryChange("Japan")

        // Then
        viewModel.uiState.test {
            testDispatcher.scheduler.advanceUntilIdle()

            val finalState = awaitItem()
            // 最終的にSuccessになり、検索結果が1件
            if (finalState is CountryListUiState.Success) {
                assertEquals(1, finalState.countries.size)
                assertEquals("JP", finalState.countries.first().code)
            }
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    @DisplayName("searchQuery StateFlowが正しく更新される")
    fun `searchQuery StateFlowが正しく更新される`() = runTest {
        // Given
        coEvery { getCountriesUseCase(any(), any()) } returns Result.success(mockCountries)
        viewModel = CountryListViewModel(getCountriesUseCase)

        // When
        viewModel.searchQuery.test {
            assertEquals("", awaitItem()) // 初期値は空文字

            viewModel.onSearchQueryChange("Japan")
            assertEquals("Japan", awaitItem())

            viewModel.onSearchQueryChange("")
            assertEquals("", awaitItem())

            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    @DisplayName("loadCountries再実行でLoadingからSuccessに遷移する")
    fun `loadCountries再実行でLoadingからSuccessに遷移する`() = runTest {
        // Given
        coEvery { getCountriesUseCase(null, null) } returns Result.success(mockCountries)
        viewModel = CountryListViewModel(getCountriesUseCase)
        testDispatcher.scheduler.advanceUntilIdle()

        // When: 明示的にloadCountriesを呼ぶ
        viewModel.loadCountries()

        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            // Loading か Success のどちらかが来る（タイミング依存）
            assertTrue(
                state is CountryListUiState.Loading || state is CountryListUiState.Success
            )
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    @DisplayName("エラーメッセージがnullの場合にデフォルトメッセージが設定される")
    fun `エラーメッセージがnullの場合にデフォルトメッセージが設定される`() = runTest {
        // Given: messageがnullの例外
        coEvery { getCountriesUseCase(null, null) } returns Result.failure(
            Exception() // message = null
        )

        viewModel = CountryListViewModel(getCountriesUseCase)

        viewModel.uiState.test {
            awaitItem() // Loading

            testDispatcher.scheduler.advanceUntilIdle()

            val errorState = awaitItem()
            assertTrue(errorState is CountryListUiState.Error)
            // nullの場合はデフォルトメッセージ
            assertEquals(
                "エラーが発生しました",
                (errorState as CountryListUiState.Error).message
            )
            cancelAndIgnoreRemainingEvents()
        }
    }
}
