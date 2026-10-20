// 与后端 model.Course 结构体一一对应
export interface Course {
  id: number
  title: string
  teacher: string
  description: string
  price: number
  created_at: string
  updated_at: string
}

// 新增/编辑课程时提交的表单字段
export interface CourseForm {
  title: string
  teacher: string
  description: string
  price: number
}
