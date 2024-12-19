import { createRouter, createWebHistory } from 'vue-router'
import SignupView from '@/views/SignupView.vue'
import LoginView from '@/views/LoginView.vue'
import LandingView from '@/views/LandingView.vue'
import DashboardView from '@/views/DashboardView.vue'
import {useUserStore} from '../stores/userStore.js';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
  ],
})

// Add the navigation guard
router.beforeEach(async (to, from) => {
  const userStore = useUserStore();
  if (
    // make sure the user is authenticated
    !userStore.isLoggedIn &&
    // ❗️ Avoid an infinite redirect
    to.name !== 'login' && to.name !=='signup' && to.name!=='landing'
  ) {
    // redirect the user to the login page
    return { name: 'Login' }
  }
})

export default router
