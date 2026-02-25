package com.kanta.worldtravel.data.api.dto

import com.google.gson.annotations.SerializedName
import com.kanta.worldtravel.domain.model.Attraction
import com.kanta.worldtravel.domain.model.AttractionsInfo

/**
 * 観光スポット情報のAPIレスポンスDTO
 * Swift移植時: struct AttractionsResponse: Codable
 */
data class AttractionsResponseDto(
    @SerializedName("country_code") val countryCode: String,
    @SerializedName("country_name") val countryName: String,
    @SerializedName("attractions") val attractions: List<AttractionDto> = emptyList(),
    @SerializedName("best_season") val bestSeason: String?,
    @SerializedName("travel_tips") val travelTips: List<String> = emptyList()
) {
    fun toDomain(): AttractionsInfo = AttractionsInfo(
        countryCode = countryCode,
        countryName = countryName,
        attractions = attractions.map { it.toDomain() },
        bestSeason = bestSeason,
        travelTips = travelTips
    )
}

data class AttractionDto(
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String,
    @SerializedName("category") val category: String,
    @SerializedName("highlights") val highlights: List<String> = emptyList()
) {
    fun toDomain(): Attraction = Attraction(
        name = name,
        description = description,
        category = category,
        highlights = highlights
    )
}

/**
 * 入国要件DTO（将来の拡張用）
 * Swift移植時: struct EntryRequirementResponse: Codable
 */
data class EntryRequirementDto(
    @SerializedName("country_code") val countryCode: String,
    @SerializedName("visa_required") val visaRequired: Boolean,
    @SerializedName("visa_on_arrival") val visaOnArrival: Boolean,
    @SerializedName("notes") val notes: String?
)
