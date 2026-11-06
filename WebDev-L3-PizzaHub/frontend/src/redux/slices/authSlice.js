import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state,value){
        state.user=value.payload;
    },
    setToken(state,value){
        state.token=value.payload;
    },
    setLoading(state,value){
        state.loading=value.payload;
    },
    setError(state,value){
        state.error=value.payload;
    }
  },
});

export const {setUser,setToken,setLoading,setError} = authSlice.actions;
export default authSlice.reducer;
