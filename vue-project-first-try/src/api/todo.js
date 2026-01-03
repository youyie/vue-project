import request from './index'

export const addTodo = (data) => request.post('/todos/add', data)

export const getTodoList = () => request.get('/todos/list')

export const getTodoById = (id) => request.get(`/todos/get/${id}`)

export const updateTodo = (id, data) => request.put(`/todos/update/${id}`, data)

export const deleteTodo = (id) => request.delete(`/todos/delete/${id}`)