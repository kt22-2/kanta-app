package com.kanta.worldtravel.data.api.dto

import com.google.gson.annotations.SerializedName
import com.kanta.worldtravel.domain.model.SafetyDetail
import com.kanta.worldtravel.domain.model.SafetyInfo
import com.kanta.worldtravel.domain.model.SafetyLevel

/**
 * 安全情報のAPIレスポンスDTO
 * Swift移植時: struct SafetyInfoResponse: Codable
 */
data class SafetyInfoDto(
    @SerializedName("country_code") val countryCode: String,
    @SerializedName("level") val level: Int,
    @SerializedName("summary") val summary: String,
    @SerializedName("details") val details: List<SafetyDetailDto> = emptyList(),
    @SerializedName("last_updated") val lastUpdated: Long?
) {
    fun toDomain(): SafetyInfo = SafetyInfo(
        countryCode = countryCode,
        level = SafetyLevel.fromValue(level),
        summary = summary,
        details = details.map { it.toDomain() },
        lastUpdated = lastUpdated
    )
}

data class SafetyDetailDto(
    @SerializedName("category") val category: String,
    @SerializedName("description") val description: String,
    @SerializedName("severity") val severity: String
) {
    fun toDomain(): SafetyDetail = SafetyDetail(
        category = category,
        description = description,
        severity = severity
    )
}
