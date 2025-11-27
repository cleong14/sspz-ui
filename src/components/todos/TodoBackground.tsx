/**
 * Background overlay component for displaying todos.
 * Shows todos in a semi-transparent panel on the right side of the screen.
 * @module components/todos/TodoBackground
 */
import { useState } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Fab from '@mui/material/Fab'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Divider from '@mui/material/Divider'
import Slide from '@mui/material/Slide'
import Badge from '@mui/material/Badge'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import ChecklistIcon from '@mui/icons-material/Checklist'
import { useTheme, alpha } from '@mui/material/styles'
import { useTodos } from '@/contexts/TodoContext'
import { TodoPriority } from '@/types/todo'
import TodoList from './TodoList'

const DRAWER_WIDTH = 380

/**
 * TodoBackground component that displays todos in a slide-out drawer
 * with a floating action button toggle.
 */
const TodoBackground: React.FC = () => {
  const theme = useTheme()
  const { todos, showBackground, toggleBackground, addTodo } = useTodos()
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<TodoPriority>('medium')

  const incompleteTodos = todos.filter((t) => t.status !== 'completed').length

  const handleAddTodo = () => {
    if (newTitle.trim()) {
      addTodo({
        title: newTitle.trim(),
        status: 'pending',
        priority: newPriority,
      })
      setNewTitle('')
      setNewPriority('medium')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTitle.trim()) {
      handleAddTodo()
    }
  }

  return (
    <>
      {/* Floating Action Button to toggle todos */}
      <Slide direction="left" in={!showBackground} mountOnEnter unmountOnExit>
        <Fab
          color="primary"
          onClick={toggleBackground}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: theme.zIndex.drawer - 1,
          }}
          aria-label="Show todos"
        >
          <Badge
            badgeContent={incompleteTodos}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                right: -3,
                top: -3,
              },
            }}
          >
            <ChecklistIcon />
          </Badge>
        </Fab>
      </Slide>

      {/* Todos Drawer */}
      <Drawer
        anchor="right"
        open={showBackground}
        onClose={toggleBackground}
        variant="persistent"
        sx={{
          width: showBackground ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)',
            borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChecklistIcon />
            <Typography variant="h6">Todos</Typography>
            <Badge
              badgeContent={incompleteTodos}
              color="error"
              sx={{ ml: 1 }}
            />
          </Box>
          <IconButton
            onClick={toggleBackground}
            size="small"
            sx={{ color: 'inherit' }}
            aria-label="Close todos"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Add Todo Form */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Add a new todo..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newPriority}
                label="Priority"
                onChange={(e) => setNewPriority(e.target.value as TodoPriority)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddTodo}
              disabled={!newTitle.trim()}
              sx={{ flex: 1 }}
            >
              Add
            </Button>
          </Box>
        </Box>

        <Divider />

        {/* Todo List */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
          }}
        >
          <TodoList />
        </Box>

        {/* Footer Stats */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            background: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {todos.length} total &bull;{' '}
            {todos.filter((t) => t.status === 'completed').length} completed &bull;{' '}
            {todos.filter((t) => t.status === 'in_progress').length} in progress
          </Typography>
        </Box>
      </Drawer>
    </>
  )
}

export default TodoBackground
