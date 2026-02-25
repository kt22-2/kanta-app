package com.kanta.worldtravel.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.kanta.worldtravel.data.local.entity.CountryEntity

/**
 * 国情報のRoom DAOインターフェース
 * Swift移植時: protocol CountryCacheStore (SwiftData / CoreData クエリ)
 */
@Dao
interface CountryDao {

    /** 全国一覧を取得（名前でソート） */
    @Query("SELECT * FROM countries ORDER BY name ASC")
    suspend fun getAllCountries(): List<CountryEntity>

    /** 名前または日本語名でフィルタリング */
    @Query("SELECT * FROM countries WHERE name LIKE '%' || :query || '%' OR name_ja LIKE '%' || :query || '%' ORDER BY name ASC")
    suspend fun searchCountries(query: String): List<CountryEntity>

    /** 地域でフィルタリング */
    @Query("SELECT * FROM countries WHERE region = :region ORDER BY name ASC")
    suspend fun getCountriesByRegion(region: String): List<CountryEntity>

    /** 国コードで単一取得 */
    @Query("SELECT * FROM countries WHERE code = :code LIMIT 1")
    suspend fun getCountryByCode(code: String): CountryEntity?

    /** 一括挿入（競合時は置換してキャッシュ更新） */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(countries: List<CountryEntity>)

    /** 単一挿入・更新 */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(country: CountryEntity)

    /** 全件削除（キャッシュクリア） */
    @Query("DELETE FROM countries")
    suspend fun deleteAll()

    /** レコード数を取得 */
    @Query("SELECT COUNT(*) FROM countries")
    suspend fun count(): Int
}
