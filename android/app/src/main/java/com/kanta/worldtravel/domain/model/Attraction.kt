package com.kanta.worldtravel.domain.model

// Swift: struct Attraction: Codable, Identifiable { ... }
// Swift: struct AttractionsInfo: Codable { ... }

/**
 * 観光スポット情報
 * Swift移植時: struct Attraction: Codable, Identifiable { var id: String { name } }
 */
data class Attraction(
    val name: String,
    val description: String,
    val category: String,
    val highlights: List<String>
)

/**
 * 観光情報全体（国単位）
 * Swift移植時: struct AttractionsInfo: Codable
 */
data class AttractionsInfo(
    val countryCode: String,
    val countryName: String,
    val attractions: List<Attraction>,
    val bestSeason: String?,
    val travelTips: List<String>
)
