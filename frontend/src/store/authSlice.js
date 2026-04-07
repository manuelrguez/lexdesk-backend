import { createSlice } from '@reduxjs/toolkit'

const saved = localStorage.getItem('lexdesk_auth')
const initial = saved ? JSON.parse(saved) : { user: null, token: null }

const authSlice = createSlice({
  name: 'auth',
  initialState: initial,
  reducers: {
    login: (state, { payload }) => {
      state.user  = payload.user
      state.token = payload.token
      localStorage.setItem('lexdesk_auth', JSON.stringify(payload))
    },
    logout: (state) => {
      state.user  = null
      state.token = null
      localStorage.removeItem('lexdesk_auth')
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer