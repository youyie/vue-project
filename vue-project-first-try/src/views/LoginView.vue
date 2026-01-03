<template>
  <div class="container">
    <h2>登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label>账号：</label>
        <input v-model="form.account" type="text" required placeholder="请输入账号" />
      </div>
      <div class="form-group">
        <label>密码：</label>
        <input v-model="form.password" type="password" required placeholder="请输入密码" />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>
    <p class="link">
      没有账号？<router-link to="/register">立即注册</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/user'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  account: '',
  password: ''
})
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    const res = await login(form.value)
    authStore.setToken(res.data.token)
    authStore.setUser(res.data.user)
    alert('登录成功！')
    router.push('/')
  } catch (err) {
    alert('登录失败：' + (err.response?.data?.error || '未知错误'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  max-width: 400px;
  margin: 100px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: #fff;
}
h2 {
  text-align: center;
  margin-bottom: 30px;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}
input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}
button {
  width: 100%;
  padding: 12px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}
button:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}
.link {
  text-align: center;
  margin-top: 20px;
}
</style>