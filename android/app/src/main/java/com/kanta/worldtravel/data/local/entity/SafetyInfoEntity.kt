package com.kanta.worldtravel.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.Gson
import com.kanta.worldtravel.data.api.dto.SafetyDetailDto
import com.kanta.worldtravel.domain.model.SafetyInfo
import com.kanta.worldtravel.domain.model.SafetyLevel

/**
 * Room データベース用の安全情報エンティティ
 * Swift移植時: @Model class SafetyInfoCache (SwiftData)
 */
@Entity(tableName = "safety_info")
data class SafetyInfoEntity(
    @PrimaryKey
    @ColumnInfo(name = "country_code")
    val countryCode: String,

    @ColumnInfo(name = "level")
    val level: Int,

    @ColumnInfo(name = "summary")
    val summary: String,

    /** JSON文字列として保存（List<SafetyDetailDto>） */
    @ColumnInfo(name = "details_json")
    val detailsJson: String = "[]",

    @ColumnInfo(name = "last_updated")
    val lastUpdated: Long?,

    /** キャッシュ日時（Unix timestamp ミリ秒） */
    @ColumnInfo(name = "cached_at")
    val cachedAt: Long = System.currentTimeMillis()
) {
    /** エンティティをドメインモデルに変換 */
    fun toDomain(): SafetyInfo {
        val gson = Gson()
        val detailDtos = try {
            gson.fromJson(detailsJson, Array<SafetyDetailDto>::class.java)?.toList() ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
        return SafetyInfo(
            countryCode = countryCode,
            level = SafetyLevel.fromValue(level),
            summary = summary,
            details = detailDtos.map { it.toDomain() },
            lastUpdated = lastUpdated
        )
    }
}
