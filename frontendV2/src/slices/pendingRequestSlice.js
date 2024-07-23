import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    count: 0,
};

export const pendingRequestSlice = createSlice({
    name: 'pendingRequest',
    initialState,
    reducers: {
        setCount: (state, action) => {
            state.count = action.payload;
        },
        decrementCount: (state) => {
            state.count -= 1;
        },
    },
});

export const { setCount, decrementCount } = pendingRequestSlice.actions;

export const selectCount = (state) => state.pendingRequest.count;

export default pendingRequestSlice.reducer;
