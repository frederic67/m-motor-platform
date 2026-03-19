import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Link,
} from '@mui/material'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')

    const result = await registerUser({
      full_name: data.full_name,
      email: data.email,
      password: data.password,
    })

    if (result.success) {
      navigate('/login', { 
        state: { message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' } 
      })
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Inscription
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Nom complet"
              margin="normal"
              {...register('full_name', {
                required: 'Nom requis',
                minLength: {
                  value: 2,
                  message: 'Minimum 2 caractères',
                },
              })}
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              {...register('email', {
                required: 'Email requis',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email invalide',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              fullWidth
              label="Mot de passe"
              type="password"
              margin="normal"
              {...register('password', {
                required: 'Mot de passe requis',
                minLength: {
                  value: 8,
                  message: 'Minimum 8 caractères',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <TextField
              fullWidth
              label="Confirmer le mot de passe"
              type="password"
              margin="normal"
              {...register('confirm_password', {
                required: 'Confirmation requise',
                validate: (value) =>
                  value === password || 'Les mots de passe ne correspondent pas',
              })}
              error={!!errors.confirm_password}
              helperText={errors.confirm_password?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Inscription...' : "S'inscrire"}
            </Button>

            <Box textAlign="center">
              <Link component={RouterLink} to="/login" variant="body2">
                Déjà un compte ? Se connecter
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  )
}

export default Register
