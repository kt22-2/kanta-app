package com.kanta.worldtravel.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.kanta.worldtravel.data.local.entity.SafetyInfoEntity

/**
 * 安全情報のRoom DAOインターフェース
 * Swift移植時: protocol SafetyInfoCacheStore
 */
@Dao
interface SafetyInfoDao {

    /** 国コードで安全情報を取得 */
    @Query("SELECT * FROM safety_info WHERE country_code = :countryCode LIMIT 1")
    suspend fun getSafetyInfo(countryCode: String): SafetyInfoEntity?

    /** 挿入・更新 */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(safetyInfo: SafetyInfoEntity)

    /** 全件削除 */
    @Query("DELETE FROM safety_info")
    suspend fun deleteAll()

    /** 指定した国コードのキャッシュを削除 */
    @Query("DELETE FROM safety_info WHERE country_code = :countryCode")
    suspend fun delete(countryCode: String)
}
