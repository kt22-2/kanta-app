package com.kanta.worldtravel.ui.home

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

// Swift移植時: @MainActor class HomeViewModel: ObservableObject { ... }

/**
 * ホーム画面のViewModel
 * 現在はシンプルだが、将来の機能（お気に入り、旅行プランなど）の拡張点
 */
@HiltViewModel
class HomeViewModel @Inject constructor() : ViewModel() {
    // 将来: お気に入り国リスト、旅行統計、次の目的地 など
}
