/**
 * Context for managing todos with background display feature.
 * @module contexts/TodoContext
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Todo, TodoContextType, TodoStatus } from '@/types/todo'

const TodoContext = createContext<TodoContextType | undefined>(undefined)

/**
 * Generate a unique ID for todos.
 */
function generateId(): string {
  return `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Provider component for Todo context.
 * Manages todo list state and background visibility.
 */
export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [showBackground, setShowBackground] = useState(false)

  const addTodo = useCallback((todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date()
    const newTodo: Todo = {
      ...todo,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    setTodos((prev) => [...prev, newTodo])
  }, [])

  const updateTodo = useCallback((id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, ...updates, updatedAt: new Date() }
          : todo
      )
    )
  }, [])

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }, [])

  const toggleTodoStatus = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id !== id) return todo
        const statusOrder: TodoStatus[] = ['pending', 'in_progress', 'completed']
        const currentIndex = statusOrder.indexOf(todo.status)
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
        return { ...todo, status: nextStatus, updatedAt: new Date() }
      })
    )
  }, [])

  const toggleBackground = useCallback(() => {
    setShowBackground((prev) => !prev)
  }, [])

  const handleSetShowBackground = useCallback((show: boolean) => {
    setShowBackground(show)
  }, [])

  return (
    <TodoContext.Provider
      value={{
        todos,
        showBackground,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodoStatus,
        toggleBackground,
        setShowBackground: handleSetShowBackground,
      }}
    >
      {children}
    </TodoContext.Provider>
  )
}

/**
 * Hook to access the Todo context.
 * @throws Error if used outside of TodoProvider
 */
export function useTodos(): TodoContextType {
  const context = useContext(TodoContext)
  if (!context) {
    throw new Error('useTodos must be used within TodoProvider')
  }
  return context
}
