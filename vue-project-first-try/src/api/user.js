import request from './index'

export const login = (data) => request.post('/user/login', data)

export const register = (data) => request.post('/user/register', data)

export const updateUser = (data) => request.put('/user/update', data)