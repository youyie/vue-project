<template>
  <div class="container">
    <div class="header">
      <h2>我的待办事项</h2>
      <button @click="logout" class="logout-btn">退出登录</button>
    </div>

    <!-- 添加新 Todo -->
    <div class="add-form">
      <input v-model="newTodo.title" placeholder="标题" />
      <input v-model="newTodo.description" placeholder="描述（可选）" />
      <input v-model="newTodo.end_time" type="datetime-local" placeholder="截止时间（可选）" />
      <button @click="addTodo">添加</button>
    </div>

    <!-- Todo 列表 -->
    <ul class="todo-list">
      <li v-for="todo in todos" :key="todo.id" class="todo-item">
        <div class="todo-content">
          <h3>{{ todo.title }}</h3>
          <p>{{ todo.description || '无描述' }}</p>
          <p>截止时间：{{ formatTime(todo.end_time) }}</p>
          <span :class="{ completed: todo.status === 1 }">
            {{ todo.status === 1 ? '已完成' : '未完成' }}
          </span>
        </div>
        <div class="actions">
          <button @click="toggleStatus(todo)" class="small-btn">
            {{ todo.status === 1 ? '标记未完成' : '完成' }}
          </button>
          <button @click="deleteTodo(todo.id)" class="small-btn delete">删除</button>
        </div>
      </li>
    </ul>

    <p v-if="todos.length === 0" class="empty">暂无待办事项～</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTodoList, addTodo as apiAddTodo, deleteTodo as apiDeleteTodo, updateTodo as apiUpdateTodo } from '@/api/todo'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const todos = ref([])
const newTodo = ref({
  title: '',
  description: '',
  end_time: ''
})

const loadTodos = async () => {
  try {
    const res = await getTodoList()
    todos.value = res.data || []
  } catch (err) {
    alert('获取列表失败')
  }
}

const addTodo = async () => {
  if (!newTodo.value.title.trim()) {
    return alert('标题不能为空！')
  }

  const payload = {
    title: newTodo.value.title.trim(),
    description: newTodo.value.description.trim() || '无描述'
  }

  if (newTodo.value.end_time) {
    const formattedEndTime = newTodo.value.end_time + ':00+08:00'
    payload.end_time = formattedEndTime
  }

  try {
    await apiAddTodo(payload)
    alert('添加成功！')
    newTodo.value = { title: '', description: '', end_time: '' }
    await loadTodos()
  } catch (err) {
    console.error(err)
    alert('添加失败：' + (err.response?.data?.error || '未知错误'))
  }
}

const deleteTodo = async (id) => {
  if (!confirm('确定删除？')) return
  try {
    await apiDeleteTodo(id)
    loadTodos()
  } catch (err) {
    alert('删除失败')
  }
}

const toggleStatus = async (todo) => {
  const newStatus = todo.status === 1 ? 0 : 1

  todo.status = newStatus

  try {
    await apiUpdateTodo(todo.id, { status: newStatus })
  } catch (err) {
    console.warn('后端状态更新可能失败，但本地已切换', err)
    alert('状态已本地切换（后端可能稍后同步）')
  }
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const formatTime = (timeStr) => {
  if (!timeStr || timeStr.includes('0001-01-01') || timeStr === '0001-01-01T00:00:00Z') {
    return '无截止时间'
  }
  return new Date(timeStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  loadTodos()
})
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.logout-btn {
  padding: 8px 16px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.add-form {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}
.add-form input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  flex: 1;
  min-width: 200px;
}
.add-form button {
  padding: 10px 20px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 5px;
}
.todo-list {
  list-style: none;
  padding: 0;
}
.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 15px;
  background: #fff;
}
.todo-content h3 {
  margin: 0 0 8px 0;
}
.completed {
  color: #67c23a;
  font-weight: bold;
}
.actions {
  display: flex;
  gap: 10px;
}
.small-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #409eff;
  color: white;
}
.delete {
  background: #f56c6c;
}
.empty {
  text-align: center;
  color: #999;
  font-size: 18px;
}

/* 响应式：移动端调整 */
@media (max-width: 768px) {
  .container { padding: 10px; }
  .header { flex-direction: column; gap: 10px; }
  .add-form { flex-direction: column; }
  .todo-item { flex-direction: column; align-items: flex-start; gap: 10px; }
  .actions { width: 100%; justify-content: flex-end; }
}
</style>