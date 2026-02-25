package com.kanta.worldtravel.domain.usecase

import com.kanta.worldtravel.domain.model.AttractionsInfo
import com.kanta.worldtravel.domain.repository.CountryRepository
import javax.inject.Inject

// Swift: struct GetAttractionsUseCase {
//     let repository: CountryRepository
//     func callAsFunction(code: String) async -> Result<AttractionsInfo, Error>
// }

/**
 * 観光情報取得ユースケース
 * Swift移植時: struct GetAttractionsUseCase
 */
class GetAttractionsUseCase @Inject constructor(
    private val repository: CountryRepository
) {
    suspend operator fun invoke(code: String): Result<AttractionsInfo> {
        return repository.getAttractions(code)
    }
}
