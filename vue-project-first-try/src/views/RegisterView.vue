<template>
  <div class="container">
    <h2>注册</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label>账号：</label>
        <input v-model="form.account" type="text" required placeholder="请输入账号" />
      </div>
      <div class="form-group">
        <label>姓名：</label>
        <input v-model="form.name" type="text" required placeholder="请输入姓名" />
      </div>
      <div class="form-group">
        <label>密码：</label>
        <input v-model="form.password" type="password" required placeholder="请输入密码" />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </form>
    <p class="link">
      已有账号？<router-link to="/login">立即登录</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/user'

const router = useRouter()

const form = ref({
  account: '',
  name: '',
  password: ''
})
const loading = ref(false)

const handleRegister = async () => {
  loading.value = true
  try {
    await register(form.value)
    alert('注册成功！请登录')
    router.push('/login')
  } catch (err) {
    alert('注册失败：' + (err.response?.data?.error || '未知错误'))
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