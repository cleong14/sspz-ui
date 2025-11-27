/**
 * Individual todo item component with status indicator and actions.
 * @module components/todos/TodoItem
 */
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Todo } from '@/types/todo'
import { useTodos } from '@/contexts/TodoContext'
import useBgColor from '@/hooks/useBgColor'

interface TodoItemProps {
  todo: Todo
}

const statusConfig = {
  pending: {
    icon: RadioButtonUncheckedIcon,
    label: 'Pending',
    colorKey: 'warningLight' as const,
  },
  in_progress: {
    icon: AutorenewIcon,
    label: 'In Progress',
    colorKey: 'infoLight' as const,
  },
  completed: {
    icon: CheckCircleOutlineIcon,
    label: 'Completed',
    colorKey: 'successLight' as const,
  },
}

const priorityColors = {
  low: 'default' as const,
  medium: 'warning' as const,
  high: 'error' as const,
}

/**
 * Renders a single todo item with status toggle and delete actions.
 */
const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const { toggleTodoStatus, deleteTodo } = useTodos()
  const bgColors = useBgColor()

  const config = statusConfig[todo.status]
  const StatusIcon = config.icon
  const bgStyle = bgColors[config.colorKey]

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.5,
        borderRadius: 1,
        ...bgStyle,
        mb: 1,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateX(4px)',
        },
      }}
    >
      <IconButton
        size="small"
        onClick={() => toggleTodoStatus(todo.id)}
        sx={{ color: 'inherit' }}
        aria-label={`Toggle status for ${todo.title}`}
      >
        <StatusIcon />
      </IconButton>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body1"
          sx={{
            textDecoration: todo.status === 'completed' ? 'line-through' : 'none',
            opacity: todo.status === 'completed' ? 0.7 : 1,
          }}
          noWrap
        >
          {todo.title}
        </Typography>
        {todo.description && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {todo.description}
          </Typography>
        )}
      </Box>

      <Chip
        label={todo.priority}
        size="small"
        color={priorityColors[todo.priority]}
        variant="outlined"
        sx={{ textTransform: 'capitalize' }}
      />

      <IconButton
        size="small"
        onClick={() => deleteTodo(todo.id)}
        color="error"
        aria-label={`Delete ${todo.title}`}
      >
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}

export default TodoItem
