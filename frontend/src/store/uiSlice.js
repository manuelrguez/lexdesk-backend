import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: { loading: false, notification: null },
  reducers: {
    setLoading:      (state, { payload }) => { state.loading = payload },
    setNotification: (state, { payload }) => { state.notification = payload },
    clearNotification: (state) => { state.notification = null },
  },
})

export const { setLoading, setNotification, clearNotification } = uiSlice.actions
export default uiSlice.reducer
