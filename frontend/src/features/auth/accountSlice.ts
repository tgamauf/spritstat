import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {RootState} from "../../app/store";


interface AccountState {
  isAuthenticated: boolean;
  hasBetaAccess: boolean;
  email: string;
}

const INVALID_ACCOUNT: AccountState = {
  isAuthenticated: false,
  email: "",
  hasBetaAccess: false
}

const initialState: AccountState = {...INVALID_ACCOUNT};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setAccount: (state, action: PayloadAction<AccountState>) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.hasBetaAccess = action.payload.hasBetaAccess;
      state.email = action.payload.email;
   }
 }
});

const {setAccount} = accountSlice.actions;
const selectIsAuthenticated = (state: RootState) => state.account.isAuthenticated;
const selectEmail = (state: RootState) => state.account.email;
const selectHasBetaAccess = (state: RootState) => state.account.hasBetaAccess;

export {
  accountSlice,
  INVALID_ACCOUNT,
  selectEmail,
  selectHasBetaAccess,
  selectIsAuthenticated,
  setAccount
};
