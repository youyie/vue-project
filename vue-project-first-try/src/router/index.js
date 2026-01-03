import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import TodoListView from '@/views/TodoListView.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/', name: 'todo', component: TodoListView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：未登录跳转登录页
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.name !== 'login' && to.name !== 'register' && !authStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router