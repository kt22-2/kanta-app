package com.kanta.worldtravel.domain.model

// Swift: struct SafetyInfo: Codable { ... }
// Swift: enum SafetyLevel: Int, Codable { case safe, caution, danger, doNotTravel, evacuate }

/**
 * 安全情報のドメインモデル
 * Swift移植時: struct SafetyInfo: Codable
 */
data class SafetyInfo(
    val countryCode: String,
    val level: SafetyLevel,
    val summary: String,
    val details: List<SafetyDetail>,
    val lastUpdated: Long?
)

/**
 * 安全レベルの列挙型
 * Swift移植時: enum SafetyLevel: Int, CaseIterable { var label: String { ... } }
 */
enum class SafetyLevel(val value: Int, val label: String, val color: Long) {
    SAFE(0, "安全", 0xFF2D5016),
    CAUTION(1, "注意", 0xFFB8860B),
    DANGER(2, "危険", 0xFFD2691E),
    DO_NOT_TRAVEL(3, "渡航中止", 0xFF8B2020),
    EVACUATE(4, "退避勧告", 0xFF4A0000);

    companion object {
        fun fromValue(value: Int): SafetyLevel =
            entries.find { it.value == value } ?: SAFE
    }
}

/**
 * 安全詳細情報
 * Swift移植時: struct SafetyDetail: Codable
 */
data class SafetyDetail(
    val category: String,
    val description: String,
    val severity: String
)
