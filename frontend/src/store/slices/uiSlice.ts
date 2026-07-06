import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  pageTitle: string;
}

const initialState: UiState = {
  sidebarOpen: true,
  pageTitle: 'Dashboard',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setPageTitle(state, action: PayloadAction<string>) {
      state.pageTitle = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setPageTitle } = uiSlice.actions;
export default uiSlice.reducer;
