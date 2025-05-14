import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/tarefa',
});

export const getTasks = () => api.get('/');
export const createTask = (data) => api.post('/', data);
export const deleteTask = (id) => api.delete(`/${id}`);
