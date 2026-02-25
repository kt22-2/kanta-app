package com.kanta.worldtravel.domain.usecase

import com.kanta.worldtravel.domain.model.SafetyInfo
import com.kanta.worldtravel.domain.repository.CountryRepository
import javax.inject.Inject

// Swift: struct GetSafetyInfoUseCase {
//     let repository: CountryRepository
//     func callAsFunction(code: String) async -> Result<SafetyInfo, Error>
// }

/**
 * 安全情報取得ユースケース
 * Swift移植時: struct GetSafetyInfoUseCase
 */
class GetSafetyInfoUseCase @Inject constructor(
    private val repository: CountryRepository
) {
    suspend operator fun invoke(code: String): Result<SafetyInfo> {
        return repository.getSafetyInfo(code)
    }
}
