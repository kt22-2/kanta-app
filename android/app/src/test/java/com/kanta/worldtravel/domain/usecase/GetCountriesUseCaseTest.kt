package com.kanta.worldtravel.domain.usecase

import com.kanta.worldtravel.domain.model.Country
import com.kanta.worldtravel.domain.model.Currency
import com.kanta.worldtravel.domain.repository.CountryRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@DisplayName("GetCountriesUseCase テスト")
class GetCountriesUseCaseTest {

    private lateinit var repository: CountryRepository
    private lateinit var useCase: GetCountriesUseCase

    // テスト用のモック国データ
    private val mockJapan = Country(
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
    )

    private val mockFrance = Country(
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

    @BeforeEach
    fun setup() {
        repository = mockk()
        useCase = GetCountriesUseCase(repository)
    }

    @Test
    @DisplayName("国一覧取得成功時にResultSuccessを返す")
    fun `国一覧取得成功時にResultSuccessを返す`() = runTest {
        // Given: リポジトリが成功レスポンスを返すようにモック
        val mockCountries = listOf(mockJapan, mockFrance)
        coEvery { repository.getCountries(null, null) } returns Result.success(mockCountries)

        // When: ユースケースを実行
        val result = useCase()

        // Then: 成功結果が返される
        assertTrue(result.isSuccess)
        assertEquals(mockCountries, result.getOrNull())
        assertEquals(2, result.getOrNull()?.size)
    }

    @Test
    @DisplayName("APIエラー時にResultFailureを返す")
    fun `APIエラー時にResultFailureを返す`() = runTest {
        // Given: リポジトリがネットワークエラーを返すようにモック
        val networkException = Exception("Network error: Connection refused")
        coEvery { repository.getCountries(null, null) } returns Result.failure(networkException)

        // When: ユースケースを実行
        val result = useCase()

        // Then: 失敗結果が返される
        assertTrue(result.isFailure)
        assertEquals("Network error: Connection refused", result.exceptionOrNull()?.message)
    }

    @Test
    @DisplayName("検索クエリを渡した場合にリポジトリに転送される")
    fun `検索クエリを渡した場合にリポジトリに転送される`() = runTest {
        // Given: 検索クエリ付きのモック
        val searchQuery = "Japan"
        coEvery { repository.getCountries(searchQuery, null) } returns Result.success(listOf(mockJapan))

        // When: クエリ付きでユースケースを実行
        val result = useCase(query = searchQuery)

        // Then: 正しいクエリがリポジトリに渡されている
        assertTrue(result.isSuccess)
        assertEquals(1, result.getOrNull()?.size)
        assertEquals("JP", result.getOrNull()?.first()?.code)
        coVerify(exactly = 1) { repository.getCountries(searchQuery, null) }
    }

    @Test
    @DisplayName("地域フィルタを渡した場合にリポジトリに転送される")
    fun `地域フィルタを渡した場合にリポジトリに転送される`() = runTest {
        // Given: 地域フィルタ付きのモック
        val region = "Asia"
        coEvery { repository.getCountries(null, region) } returns Result.success(listOf(mockJapan))

        // When: 地域フィルタ付きでユースケースを実行
        val result = useCase(region = region)

        // Then: 正しい地域がリポジトリに渡されている
        assertTrue(result.isSuccess)
        coVerify(exactly = 1) { repository.getCountries(null, region) }
    }

    @Test
    @DisplayName("空の国一覧が返された場合にResultSuccessの空リストを返す")
    fun `空の国一覧が返された場合にResultSuccessの空リストを返す`() = runTest {
        // Given: 空のリストを返すモック
        coEvery { repository.getCountries(null, null) } returns Result.success(emptyList())

        // When: ユースケースを実行
        val result = useCase()

        // Then: 空の成功結果が返される
        assertTrue(result.isSuccess)
        assertTrue(result.getOrNull()?.isEmpty() == true)
    }

    @Test
    @DisplayName("タイムアウトエラー時にResultFailureを返す")
    fun `タイムアウトエラー時にResultFailureを返す`() = runTest {
        // Given: タイムアウト例外を返すモック
        coEvery { repository.getCountries(null, null) } returns Result.failure(
            Exception("Timeout: Request took too long")
        )

        // When: ユースケースを実行
        val result = useCase()

        // Then: 失敗結果が返される
        assertTrue(result.isFailure)
    }
}
