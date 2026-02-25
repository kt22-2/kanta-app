package com.kanta.worldtravel.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.Gson
import com.kanta.worldtravel.data.api.dto.CurrencyDto
import com.kanta.worldtravel.domain.model.Country

/**
 * Room データベース用の国情報エンティティ
 * オフラインキャッシュとして機能する
 * Swift移植時: @Model class CountryCache (SwiftData) または CoreData エンティティ
 */
@Entity(tableName = "countries")
data class CountryEntity(
    @PrimaryKey
    @ColumnInfo(name = "code")
    val code: String,

    @ColumnInfo(name = "name")
    val name: String,

    @ColumnInfo(name = "name_ja")
    val nameJa: String?,

    @ColumnInfo(name = "capital")
    val capital: String?,

    @ColumnInfo(name = "region")
    val region: String,

    @ColumnInfo(name = "subregion")
    val subregion: String?,

    @ColumnInfo(name = "population")
    val population: Int = 0,

    /** カンマ区切りで保存 */
    @ColumnInfo(name = "languages")
    val languages: String = "",

    /** JSON文字列として保存（List<CurrencyDto>） */
    @ColumnInfo(name = "currencies_json")
    val currenciesJson: String = "[]",

    @ColumnInfo(name = "flag_url")
    val flagUrl: String = "",

    @ColumnInfo(name = "flag_emoji")
    val flagEmoji: String = "",

    @ColumnInfo(name = "latitude")
    val latitude: Double?,

    @ColumnInfo(name = "longitude")
    val longitude: Double?,

    /** キャッシュ日時（Unix timestamp ミリ秒） */
    @ColumnInfo(name = "cached_at")
    val cachedAt: Long = System.currentTimeMillis()
) {
    /** エンティティをドメインモデルに変換 */
    fun toDomain(): Country {
        val gson = Gson()
        val currencyDtos = try {
            gson.fromJson(currenciesJson, Array<CurrencyDto>::class.java)?.toList() ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
        return Country(
            code = code,
            name = name,
            nameJa = nameJa,
            capital = capital,
            region = region,
            subregion = subregion,
            population = population,
            languages = if (languages.isBlank()) emptyList() else languages.split(","),
            currencies = currencyDtos.map { it.toDomain() },
            flagUrl = flagUrl,
            flagEmoji = flagEmoji,
            latitude = latitude,
            longitude = longitude
        )
    }
}
