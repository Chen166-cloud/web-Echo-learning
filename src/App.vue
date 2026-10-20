<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { api } from './api'
import type { Course } from './types'

const courses = ref<Course[]>([])
const loading = ref(false)
const error = ref('')
const message = ref('') // 成功提示，2 秒后自动消失

// 正在编辑的课程 ID：null 表示当前是「新增」模式
const editingId = ref<number | null>(null)

const form = reactive({
  title: '',
  teacher: '',
  description: '',
  price: 0,
})

// 拉取课程列表
async function loadCourses() {
  loading.value = true
  error.value = ''
  try {
    courses.value = await api.list()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载课程列表失败'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  editingId.value = null
  form.title = ''
  form.teacher = ''
  form.description = ''
  form.price = 0
}

// 点击表格里的「编辑」：回填表单并切换到编辑模式
function startEdit(course: Course) {
  editingId.value = course.id
  form.title = course.title
  form.teacher = course.teacher
  form.description = course.description
  form.price = course.price
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 提交表单：根据 editingId 判断是新增还是更新
async function submitForm() {
  error.value = ''
  if (!form.title.trim()) {
    error.value = '课程标题不能为空'
    return
  }
  try {
    if (editingId.value === null) {
      await api.create({ ...form })
      showTip('课程创建成功')
    } else {
      await api.update(editingId.value, { ...form })
      showTip('课程更新成功')
    }
    resetForm()
    await loadCourses()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败'
  }
}

async function removeCourse(course: Course) {
  if (!confirm(`确定删除课程「${course.title}」吗？`)) return
  try {
    await api.remove(course.id)
    showTip('课程已删除')
    // 如果删的是正在编辑的课程，重置表单
    if (editingId.value === course.id) resetForm()
    await loadCourses()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '删除失败'
  }
}

function showTip(text: string) {
  message.value = text
  setTimeout(() => (message.value = ''), 2000)
}

// 价格显示：¥99.50
function fmtPrice(p: number): string {
  return `¥${p.toFixed(2)}`
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN', { hour12: false })
}

onMounted(loadCourses)
</script>

<template>
  <div class="container">
    <header>
      <h1>📚 Echo 课程管理</h1>
      <p>Vue3 + TypeScript 前端 · Echo + GORM + MySQL 后端</p>
    </header>

    <!-- 成功 / 失败提示 -->
    <div v-if="message" class="banner success">{{ message }}</div>
    <div v-if="error" class="banner error">{{ error }}</div>

    <!-- 新增 / 编辑表单 -->
    <form class="card" @submit.prevent="submitForm">
      <h2>{{ editingId === null ? '新增课程' : `编辑课程 #${editingId}` }}</h2>
      <div class="fields">
        <label>
          课程标题 <span class="required">*</span>
          <input v-model.trim="form.title" placeholder="例如：Go Web 开发入门" required />
        </label>
        <label>
          讲师
          <input v-model.trim="form.teacher" placeholder="例如：张三" />
        </label>
        <label>
          价格（元）
          <input v-model.number="form.price" type="number" min="0" step="0.01" />
        </label>
      </div>
      <label class="desc">
        课程简介
        <textarea v-model.trim="form.description" rows="2" placeholder="一句话介绍课程内容"></textarea>
      </label>
      <div class="actions">
        <button type="submit" class="primary">{{ editingId === null ? '新增' : '保存' }}</button>
        <button v-if="editingId !== null" type="button" class="ghost" @click="resetForm">取消编辑</button>
      </div>
    </form>

    <!-- 课程列表 -->
    <div class="card">
      <h2>课程列表 <span class="count">共 {{ courses.length }} 门</span></h2>
      <p v-if="loading" class="empty">加载中…</p>
      <p v-else-if="courses.length === 0" class="empty">暂无课程，先在上方添加一门吧</p>
      <table v-else>
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>讲师</th>
            <th>简介</th>
            <th>价格</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in courses" :key="course.id" :class="{ editing: course.id === editingId }">
            <td>{{ course.id }}</td>
            <td class="title">{{ course.title }}</td>
            <td>{{ course.teacher || '—' }}</td>
            <td class="desc-cell">{{ course.description || '—' }}</td>
            <td>{{ fmtPrice(course.price) }}</td>
            <td class="time">{{ fmtTime(course.created_at) }}</td>
            <td class="ops">
              <button class="link" @click="startEdit(course)">编辑</button>
              <button class="link danger" @click="removeCourse(course)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
