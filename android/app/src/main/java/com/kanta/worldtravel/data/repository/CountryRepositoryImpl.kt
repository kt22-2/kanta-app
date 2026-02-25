package com.kanta.worldtravel.data.repository

import com.kanta.worldtravel.data.api.KantaApiService
import com.kanta.worldtravel.data.local.dao.CountryDao
import com.kanta.worldtravel.data.local.dao.SafetyInfoDao
import com.kanta.worldtravel.data.local.entity.SafetyInfoEntity
import com.kanta.worldtravel.domain.model.AttractionsInfo
import com.kanta.worldtravel.domain.model.Country
import com.kanta.worldtravel.domain.model.SafetyInfo
import com.kanta.worldtravel.domain.repository.CountryRepository
import com.google.gson.Gson
import javax.inject.Inject
import javax.inject.Singleton

/**
 * CountryRepository の実装クラス
 * オフライン戦略: キャッシュ確認 → API取得 → キャッシュ更新 → 失敗時キャッシュフォールバック
 * Swift移植時: class CountryRepositoryImpl: CountryRepository（actor で並行性管理）
 */
@Singleton
class CountryRepositoryImpl @Inject constructor(
    private val apiService: KantaApiService,
    private val countryDao: CountryDao,
    private val safetyInfoDao: SafetyInfoDao
) : CountryRepository {

    private val gson = Gson()

    override suspend fun getCountries(
        query: String?,
        region: String?
    ): Result<List<Country>> {
        return try {
            // 1. まずキャッシュを確認
            val cached = when {
                !query.isNullOrBlank() -> countryDao.searchCountries(query)
                !region.isNullOrBlank() -> countryDao.getCountriesByRegion(region)
                else -> countryDao.getAllCountries()
            }

            // クエリやリージョンがない全件取得の場合のみキャッシュTTLチェック
            if (cached.isNotEmpty() && query == null && region == null) {
                val oldestCache = cached.minByOrNull { it.cachedAt }
                if (oldestCache != null && !isCacheExpired(oldestCache.cachedAt, TTL_HOURS)) {
                    return Result.success(cached.map { it.toDomain() })
                }
            }

            // 2. APIから取得
            val dtos = apiService.getCountries(query, region)
            val entities = dtos.map { it.toEntity() }

            // 全件取得の場合のみキャッシュを更新（検索結果はキャッシュしない）
            if (query == null && region == null) {
                countryDao.insertAll(entities)
            }

            Result.success(entities.map { it.toDomain() })
        } catch (e: Exception) {
            // 3. オフライン時はキャッシュを返す
            val cached = when {
                !query.isNullOrBlank() -> countryDao.searchCountries(query)
                !region.isNullOrBlank() -> countryDao.getCountriesByRegion(region)
                else -> countryDao.getAllCountries()
            }
            if (cached.isNotEmpty()) {
                Result.success(cached.map { it.toDomain() })
            } else {
                Result.failure(e)
            }
        }
    }

    override suspend fun getCountry(code: String): Result<Country> {
        return try {
            // 1. キャッシュ確認
            val cached = countryDao.getCountryByCode(code)
            if (cached != null && !isCacheExpired(cached.cachedAt, TTL_HOURS)) {
                return Result.success(cached.toDomain())
            }

            // 2. API取得
            val dto = apiService.getCountry(code)
            val entity = dto.toEntity()
            countryDao.insert(entity)
            Result.success(entity.toDomain())
        } catch (e: Exception) {
            // 3. オフライン時キャッシュ
            val cached = countryDao.getCountryByCode(code)
            if (cached != null) {
                Result.success(cached.toDomain())
            } else {
                Result.failure(e)
            }
        }
    }

    override suspend fun getSafetyInfo(code: String): Result<SafetyInfo> {
        return try {
            // 1. キャッシュ確認
            val cached = safetyInfoDao.getSafetyInfo(code)
            if (cached != null && !isCacheExpired(cached.cachedAt, SAFETY_TTL_HOURS)) {
                return Result.success(cached.toDomain())
            }

            // 2. API取得
            val dto = apiService.getSafetyInfo(code)
            val entity = SafetyInfoEntity(
                countryCode = dto.countryCode,
                level = dto.level,
                summary = dto.summary,
                detailsJson = gson.toJson(dto.details),
                lastUpdated = dto.lastUpdated,
                cachedAt = System.currentTimeMillis()
            )
            safetyInfoDao.insert(entity)
            Result.success(dto.toDomain())
        } catch (e: Exception) {
            // 3. オフライン時キャッシュ
            val cached = safetyInfoDao.getSafetyInfo(code)
            if (cached != null) {
                Result.success(cached.toDomain())
            } else {
                Result.failure(e)
            }
        }
    }

    override suspend fun getAttractions(code: String): Result<AttractionsInfo> {
        return try {
            val dto = apiService.getAttractions(code)
            Result.success(dto.toDomain())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun refreshCountries(): Result<Unit> {
        return try {
            val dtos = apiService.getCountries()
            val entities = dtos.map { it.toEntity() }
            countryDao.deleteAll()
            countryDao.insertAll(entities)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /** キャッシュ期限切れチェック */
    private fun isCacheExpired(cachedAt: Long, ttlHours: Long): Boolean {
        val ttlMillis = ttlHours * 60 * 60 * 1000
        return System.currentTimeMillis() - cachedAt > ttlMillis
    }

    companion object {
        private const val TTL_HOURS = 24L
        private const val SAFETY_TTL_HOURS = 6L  // 安全情報は6時間で更新
    }
}
