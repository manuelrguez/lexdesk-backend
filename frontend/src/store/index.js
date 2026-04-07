import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice.js'
import uiReducer from './uiSlice.js'
import clientesReducer from './clientesSlice.js'

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    ui:       uiReducer,
    clientes: clientesReducer,
  },
})
