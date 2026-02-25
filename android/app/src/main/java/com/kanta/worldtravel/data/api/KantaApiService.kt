package com.kanta.worldtravel.data.api

import com.kanta.worldtravel.data.api.dto.AttractionsResponseDto
import com.kanta.worldtravel.data.api.dto.CountryDto
import com.kanta.worldtravel.data.api.dto.EntryRequirementDto
import com.kanta.worldtravel.data.api.dto.SafetyInfoDto
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * Kanta API の Retrofit インターフェース
 * ベースURL: BuildConfig.API_BASE_URL (エミュレータ: http://10.0.2.2:8000/)
 * Swift移植時: protocol KantaAPIProtocol / struct KantaAPIClient（URLSession）
 */
interface KantaApiService {

    /**
     * 国一覧取得
     * @param query 国名検索クエリ（オプション）
     * @param region 地域フィルタ（オプション）
     */
    @GET("api/countries")
    suspend fun getCountries(
        @Query("q") query: String? = null,
        @Query("region") region: String? = null
    ): List<CountryDto>

    /**
     * 国詳細取得
     * @param code ISO 3166-1 alpha-2 国コード（例: "JP", "FR"）
     */
    @GET("api/countries/{code}")
    suspend fun getCountry(@Path("code") code: String): CountryDto

    /**
     * 安全情報取得
     */
    @GET("api/countries/{code}/safety")
    suspend fun getSafetyInfo(@Path("code") code: String): SafetyInfoDto

    /**
     * 入国要件取得
     */
    @GET("api/countries/{code}/entry")
    suspend fun getEntryRequirement(@Path("code") code: String): EntryRequirementDto

    /**
     * 観光情報取得
     */
    @GET("api/countries/{code}/attractions")
    suspend fun getAttractions(@Path("code") code: String): AttractionsResponseDto
}
