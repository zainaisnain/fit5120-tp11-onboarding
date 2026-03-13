import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    // All authenticated pages share AppLayout (Header + Navbar)
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/home' },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
      },
      {
        path: 'uv-index',
        name: 'UVIndex',
        component: () => import('@/views/UVIndexView.vue'),
      },
      {
        path: 'screen-reminder',
        name: 'ScreenReminder',
        component: () => import('@/views/ScreenReminderView.vue'),
      },
      {
        path: 'personal-recommendation',
        name: 'PersonalRecommendation',
        component: () => import('@/views/PersonalRecommendationView.vue'),
      },
      {
        path: 'data-insights',
        name: 'DataInsights',
        component: () => import('@/views/DataInsightsView.vue'),
      },
      {
        path: 'effects-of-sun-exposure',
        name: 'EffectsOfSunExposure',
        component: () => import('@/views/EffectsOfSunExposureView.vue'),
      },
      {
        path: 'sunscreen-calculator',
        name: 'SunscreenCalculator',
        component: () => import('@/views/SunscreenCalculatorView.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return '/login'
  }
  if (to.path === '/login' && authStore.isLoggedIn) {
    return '/home'
  }
})

export default router
