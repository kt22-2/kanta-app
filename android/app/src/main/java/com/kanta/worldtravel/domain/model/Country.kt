package com.kanta.worldtravel.domain.model

// Swift: struct Country: Codable, Identifiable { let code: String; ... }

/**
 * 国情報のドメインモデル
 * Swift移植時: struct Country: Codable, Identifiable
 */
data class Country(
    val code: String,
    val name: String,
    val nameJa: String?,
    val capital: String?,
    val region: String,
    val subregion: String?,
    val population: Int,
    val languages: List<String>,
    val currencies: List<Currency>,
    val flagUrl: String,
    val flagEmoji: String,
    val latitude: Double?,
    val longitude: Double?
)

/**
 * 通貨情報
 * Swift移植時: struct Currency: Codable
 */
data class Currency(
    val code: String,
    val name: String,
    val symbol: String?
)
