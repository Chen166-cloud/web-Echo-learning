import type { Course, CourseForm } from './types'

// 与后端 model.Response 对应的统一响应结构
interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

/**
 * 极简 fetch 封装：
 * - 自动带 JSON 头
 * - 后端约定 HTTP 恒为 200，业务成败看 code：非 0 时抛出 msg
 */
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`请求失败（HTTP ${res.status}）`)
  }
  const body = (await res.json()) as ApiResponse<T>
  if (body.code !== 0) {
    throw new Error(body.msg || '请求失败')
  }
  return body.data
}

// 课程增删改查 API，路径经 vite 代理转发到后端
export const api = {
  list: () => request<Course[]>('/api/courses'),
  create: (data: CourseForm) =>
    request<Course>('/api/courses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: CourseForm) =>
    request<Course>(`/api/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) => request<null>(`/api/courses/${id}`, { method: 'DELETE' }),
}
