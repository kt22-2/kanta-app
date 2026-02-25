package com.kanta.worldtravel.domain.usecase

import com.kanta.worldtravel.domain.model.SafetyDetail
import com.kanta.worldtravel.domain.model.SafetyInfo
import com.kanta.worldtravel.domain.model.SafetyLevel
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

@DisplayName("GetSafetyInfoUseCase テスト")
class GetSafetyInfoUseCaseTest {

    private lateinit var repository: CountryRepository
    private lateinit var useCase: GetSafetyInfoUseCase

    // テスト用のモック安全情報
    private val mockSafeSafetyInfo = SafetyInfo(
        countryCode = "JP",
        level = SafetyLevel.SAFE,
        summary = "日本は安全な国です。自然災害に注意してください。",
        details = listOf(
            SafetyDetail(
                category = "自然災害",
                description = "地震・台風のリスクがあります。",
                severity = "medium"
            )
        ),
        lastUpdated = 1700000000L
    )

    private val mockDangerSafetyInfo = SafetyInfo(
        countryCode = "XX",
        level = SafetyLevel.DO_NOT_TRAVEL,
        summary = "危険なため渡航を中止してください。",
        details = listOf(
            SafetyDetail(
                category = "治安",
                description = "武力衝突が発生しています。",
                severity = "critical"
            )
        ),
        lastUpdated = 1700000000L
    )

    @BeforeEach
    fun setup() {
        repository = mockk()
        useCase = GetSafetyInfoUseCase(repository)
    }

    @Test
    @DisplayName("安全な国の安全情報取得成功時にSAFEレベルを返す")
    fun `安全な国の安全情報取得成功時にSAFEレベルを返す`() = runTest {
        // Given
        coEvery { repository.getSafetyInfo("JP") } returns Result.success(mockSafeSafetyInfo)

        // When
        val result = useCase("JP")

        // Then
        assertTrue(result.isSuccess)
        assertEquals(SafetyLevel.SAFE, result.getOrNull()?.level)
        assertEquals("JP", result.getOrNull()?.countryCode)
    }

    @Test
    @DisplayName("危険な国の安全情報取得成功時にDO_NOT_TRAVELレベルを返す")
    fun `危険な国の安全情報取得成功時にDO_NOT_TRAVELレベルを返す`() = runTest {
        // Given
        coEvery { repository.getSafetyInfo("XX") } returns Result.success(mockDangerSafetyInfo)

        // When
        val result = useCase("XX")

        // Then
        assertTrue(result.isSuccess)
        assertEquals(SafetyLevel.DO_NOT_TRAVEL, result.getOrNull()?.level)
    }

    @Test
    @DisplayName("APIエラー時にResultFailureを返す")
    fun `APIエラー時にResultFailureを返す`() = runTest {
        // Given: APIエラーのモック
        coEvery { repository.getSafetyInfo("UNKNOWN") } returns Result.failure(
            Exception("Country not found")
        )

        // When
        val result = useCase("UNKNOWN")

        // Then
        assertTrue(result.isFailure)
        assertEquals("Country not found", result.exceptionOrNull()?.message)
    }

    @Test
    @DisplayName("国コードが正しくリポジトリに渡される")
    fun `国コードが正しくリポジトリに渡される`() = runTest {
        // Given
        val countryCode = "JP"
        coEvery { repository.getSafetyInfo(countryCode) } returns Result.success(mockSafeSafetyInfo)

        // When
        useCase(countryCode)

        // Then
        coVerify(exactly = 1) { repository.getSafetyInfo(countryCode) }
    }

    @Test
    @DisplayName("安全情報の詳細リストが正しく返される")
    fun `安全情報の詳細リストが正しく返される`() = runTest {
        // Given
        coEvery { repository.getSafetyInfo("JP") } returns Result.success(mockSafeSafetyInfo)

        // When
        val result = useCase("JP")

        // Then
        val safetyInfo = result.getOrNull()
        assertEquals(1, safetyInfo?.details?.size)
        assertEquals("自然災害", safetyInfo?.details?.first()?.category)
        assertEquals("medium", safetyInfo?.details?.first()?.severity)
    }

    @Test
    @DisplayName("SafetyLevelのvalueからの変換が正しく動作する")
    fun `SafetyLevelのvalueからの変換が正しく動作する`() {
        // SafetyLevel enum のfromValue機能テスト
        assertEquals(SafetyLevel.SAFE, SafetyLevel.fromValue(0))
        assertEquals(SafetyLevel.CAUTION, SafetyLevel.fromValue(1))
        assertEquals(SafetyLevel.DANGER, SafetyLevel.fromValue(2))
        assertEquals(SafetyLevel.DO_NOT_TRAVEL, SafetyLevel.fromValue(3))
        assertEquals(SafetyLevel.EVACUATE, SafetyLevel.fromValue(4))
        // 不明な値はSAFEにフォールバック
        assertEquals(SafetyLevel.SAFE, SafetyLevel.fromValue(99))
    }
}
