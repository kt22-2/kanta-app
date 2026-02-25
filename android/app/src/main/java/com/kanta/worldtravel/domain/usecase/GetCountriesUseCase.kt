package com.kanta.worldtravel.domain.usecase

import com.kanta.worldtravel.domain.model.Country
import com.kanta.worldtravel.domain.repository.CountryRepository
import javax.inject.Inject

// Swift: struct GetCountriesUseCase {
//     let repository: CountryRepository
//     func callAsFunction(query: String? = nil, region: String? = nil) async -> Result<[Country], Error>
// }

/**
 * 国一覧取得ユースケース
 * 単一責任: Repository から国一覧を取得する処理のみを担う
 * Swift移植時: struct GetCountriesUseCase（値型でDI）
 */
class GetCountriesUseCase @Inject constructor(
    private val repository: CountryRepository
) {
    suspend operator fun invoke(
        query: String? = null,
        region: String? = null
    ): Result<List<Country>> {
        return repository.getCountries(query, region)
    }
}
