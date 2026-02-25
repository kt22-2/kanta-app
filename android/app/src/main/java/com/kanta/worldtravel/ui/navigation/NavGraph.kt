package com.kanta.worldtravel.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.kanta.worldtravel.ui.country_detail.CountryDetailScreen
import com.kanta.worldtravel.ui.country_list.CountryListScreen
import com.kanta.worldtravel.ui.home.HomeScreen

/**
 * アプリ全体のナビゲーショングラフ
 * Swift移植時: NavigationStack / NavigationSplitView
 */
sealed class Screen(val route: String) {
    object Home : Screen("home")
    object CountryList : Screen("country_list")
    object CountryDetail : Screen("country_detail/{countryCode}") {
        fun createRoute(countryCode: String) = "country_detail/$countryCode"
    }
}

@Composable
fun KantaNavGraph(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                onNavigateToCountryList = {
                    navController.navigate(Screen.CountryList.route)
                }
            )
        }

        composable(Screen.CountryList.route) {
            CountryListScreen(
                onCountryClick = { countryCode ->
                    navController.navigate(Screen.CountryDetail.createRoute(countryCode))
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.CountryDetail.route,
            arguments = listOf(
                navArgument("countryCode") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val countryCode = backStackEntry.arguments?.getString("countryCode") ?: return@composable
            CountryDetailScreen(
                countryCode = countryCode,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
