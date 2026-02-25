package com.kanta.worldtravel.domain.usecase

import com.kanta.worldtravel.domain.model.Country
import com.kanta.worldtravel.domain.repository.CountryRepository
import javax.inject.Inject

// Swift: struct GetCountryDetailUseCase {
//     let repository: CountryRepository
//     func callAsFunction(code: String) async -> Result<Country, Error>
// }

/**
 * 国詳細取得ユースケース
 * Swift移植時: struct GetCountryDetailUseCase
 */
class GetCountryDetailUseCase @Inject constructor(
    private val repository: CountryRepository
) {
    suspend operator fun invoke(code: String): Result<Country> {
        return repository.getCountry(code)
    }
}
