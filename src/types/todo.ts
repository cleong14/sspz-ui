/**
 * Type definitions for Todo feature.
 * @module types/todo
 */

export type TodoStatus = 'pending' | 'in_progress' | 'completed'

export type TodoPriority = 'low' | 'medium' | 'high'

export interface Todo {
  id: string
  title: string
  description?: string
  status: TodoStatus
  priority: TodoPriority
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
}

export interface TodoContextType {
  todos: Todo[]
  showBackground: boolean
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
  deleteTodo: (id: string) => void
  toggleTodoStatus: (id: string) => void
  toggleBackground: () => void
  setShowBackground: (show: boolean) => void
}
