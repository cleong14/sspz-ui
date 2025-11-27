/**
 * Todo list component displaying all todos grouped by status.
 * @module components/todos/TodoList
 */
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTodos } from '@/contexts/TodoContext'
import TodoItem from './TodoItem'

/**
 * Renders a list of all todos.
 * Shows a message when no todos exist.
 */
const TodoList: React.FC = () => {
  const { todos } = useTodos()

  const pendingTodos = todos.filter((t) => t.status === 'pending')
  const inProgressTodos = todos.filter((t) => t.status === 'in_progress')
  const completedTodos = todos.filter((t) => t.status === 'completed')

  if (todos.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 4,
          color: 'text.secondary',
        }}
      >
        <Typography variant="body1">No todos yet</Typography>
        <Typography variant="caption">Add a todo to get started</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {inProgressTodos.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="info.main" gutterBottom>
            In Progress ({inProgressTodos.length})
          </Typography>
          {inProgressTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </Box>
      )}

      {pendingTodos.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="warning.main" gutterBottom>
            Pending ({pendingTodos.length})
          </Typography>
          {pendingTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </Box>
      )}

      {completedTodos.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="success.main" gutterBottom>
            Completed ({completedTodos.length})
          </Typography>
          {completedTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </Box>
      )}
    </Box>
  )
}

export default TodoList
