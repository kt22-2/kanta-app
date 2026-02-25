package com.kanta.worldtravel.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.kanta.worldtravel.data.local.dao.CountryDao
import com.kanta.worldtravel.data.local.dao.SafetyInfoDao
import com.kanta.worldtravel.data.local.entity.CountryEntity
import com.kanta.worldtravel.data.local.entity.SafetyInfoEntity

/**
 * Room データベース定義
 * 世界一周旅行中のオフラインキャッシュとして機能する
 * Swift移植時: @ModelContainer / NSPersistentContainer (CoreData)
 */
@Database(
    entities = [
        CountryEntity::class,
        SafetyInfoEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun countryDao(): CountryDao
    abstract fun safetyInfoDao(): SafetyInfoDao

    companion object {
        const val DATABASE_NAME = "kanta_world_travel.db"
    }
}
