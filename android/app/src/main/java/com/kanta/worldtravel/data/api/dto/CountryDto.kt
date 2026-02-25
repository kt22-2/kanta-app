package com.kanta.worldtravel.data.api.dto

import com.google.gson.annotations.SerializedName
import com.kanta.worldtravel.data.local.entity.CountryEntity
import com.kanta.worldtravel.domain.model.Country
import com.kanta.worldtravel.domain.model.Currency

/**
 * 国情報のAPIレスポンスDTO
 * Gson のデシリアライゼーション用
 * Swift移植時: struct CountryDto: Codable → CountryResponse として実装
 */
data class CountryDto(
    @SerializedName("code") val code: String,
    @SerializedName("name") val name: String,
    @SerializedName("name_ja") val nameJa: String?,
    @SerializedName("capital") val capital: String?,
    @SerializedName("region") val region: String,
    @SerializedName("subregion") val subregion: String?,
    @SerializedName("population") val population: Int = 0,
    @SerializedName("languages") val languages: List<String> = emptyList(),
    @SerializedName("currencies") val currencies: List<CurrencyDto> = emptyList(),
    @SerializedName("flag_url") val flagUrl: String = "",
    @SerializedName("flag_emoji") val flagEmoji: String = "",
    @SerializedName("latitude") val latitude: Double?,
    @SerializedName("longitude") val longitude: Double?
) {
    /** DTOをドメインモデルに変換 */
    fun toDomain(): Country = Country(
        code = code,
        name = name,
        nameJa = nameJa,
        capital = capital,
        region = region,
        subregion = subregion,
        population = population,
        languages = languages,
        currencies = currencies.map { it.toDomain() },
        flagUrl = flagUrl,
        flagEmoji = flagEmoji,
        latitude = latitude,
        longitude = longitude
    )

    /** DTOをRoomエンティティに変換（キャッシュ保存用） */
    fun toEntity(cachedAt: Long = System.currentTimeMillis()): CountryEntity = CountryEntity(
        code = code,
        name = name,
        nameJa = nameJa,
        capital = capital,
        region = region,
        subregion = subregion,
        population = population,
        languages = languages.joinToString(","),
        currenciesJson = com.google.gson.Gson().toJson(currencies),
        flagUrl = flagUrl,
        flagEmoji = flagEmoji,
        latitude = latitude,
        longitude = longitude,
        cachedAt = cachedAt
    )
}

data class CurrencyDto(
    @SerializedName("code") val code: String,
    @SerializedName("name") val name: String,
    @SerializedName("symbol") val symbol: String?
) {
    fun toDomain(): Currency = Currency(code = code, name = name, symbol = symbol)
}
