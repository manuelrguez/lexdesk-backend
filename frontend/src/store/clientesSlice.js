import { createSlice } from '@reduxjs/toolkit'

const clientesSlice = createSlice({
  name: 'clientes',
  initialState: { list: [], selected: null, loading: false },
  reducers: {
    setClientes:  (state, { payload }) => { state.list = payload },
    setSelected:  (state, { payload }) => { state.selected = payload },
    setLoading:   (state, { payload }) => { state.loading = payload },
  },
})

export const { setClientes, setSelected, setLoading } = clientesSlice.actions
export default clientesSlice.reducer
