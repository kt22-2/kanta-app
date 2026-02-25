package com.kanta.worldtravel.domain.repository

import com.kanta.worldtravel.domain.model.AttractionsInfo
import com.kanta.worldtravel.domain.model.Country
import com.kanta.worldtravel.domain.model.SafetyInfo

// Swift: protocol CountryRepository {
//     func getCountries(query: String?, region: String?) async throws -> [Country]
//     func getCountry(code: String) async throws -> Country
//     func getSafetyInfo(code: String) async throws -> SafetyInfo
//     func getAttractions(code: String) async throws -> AttractionsInfo
//     func refreshCountries() async throws
// }

/**
 * 国情報リポジトリのインターフェース（ドメイン層）
 * Swift移植時: protocol CountryRepository（DI はSwift DIコンテナで注入）
 */
interface CountryRepository {
    /**
     * 国一覧を取得する（クエリ・地域でフィルタ可能）
     * オフライン時はローカルキャッシュを返す
     */
    suspend fun getCountries(query: String? = null, region: String? = null): Result<List<Country>>

    /**
     * 国コードで単一の国情報を取得する
     */
    suspend fun getCountry(code: String): Result<Country>

    /**
     * 国の安全情報を取得する
     */
    suspend fun getSafetyInfo(code: String): Result<SafetyInfo>

    /**
     * 国の観光情報を取得する
     */
    suspend fun getAttractions(code: String): Result<AttractionsInfo>

    /**
     * 国一覧をAPIから強制再取得してキャッシュを更新する
     */
    suspend fun refreshCountries(): Result<Unit>
}
