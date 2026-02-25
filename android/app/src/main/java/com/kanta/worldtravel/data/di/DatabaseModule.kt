package com.kanta.worldtravel.data.di

import android.content.Context
import androidx.room.Room
import com.kanta.worldtravel.data.local.AppDatabase
import com.kanta.worldtravel.data.local.dao.CountryDao
import com.kanta.worldtravel.data.local.dao.SafetyInfoDao
import com.kanta.worldtravel.data.repository.CountryRepositoryImpl
import com.kanta.worldtravel.domain.repository.CountryRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * データベース関連のHilt DIモジュール
 * Room DBとDAOの依存を提供する
 * Swift移植時: ModelContainer / NSPersistentContainer の設定
 */
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            AppDatabase.DATABASE_NAME
        )
            .fallbackToDestructiveMigration()
            .build()
    }

    @Provides
    fun provideCountryDao(database: AppDatabase): CountryDao {
        return database.countryDao()
    }

    @Provides
    fun provideSafetyInfoDao(database: AppDatabase): SafetyInfoDao {
        return database.safetyInfoDao()
    }
}

/**
 * Repositoryのバインドモジュール
 * インターフェースと実装クラスを結びつける
 */
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindCountryRepository(
        impl: CountryRepositoryImpl
    ): CountryRepository
}
