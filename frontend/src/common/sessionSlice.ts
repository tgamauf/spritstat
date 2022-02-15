import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {RootState} from "../app/store";
import {SessionData} from "./apis/spritstatApi";
import {EMPTY_SESSION} from "./constants";

interface SessionState {
  isAuthenticated: boolean;
  hasBetaAccess: boolean;
  email: string;
}

const initialState: SessionState = {...EMPTY_SESSION};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<SessionData>) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.hasBetaAccess = action.payload.hasBetaAccess;
      state.email = action.payload.email;
    }
  }
});

const {setSession} = sessionSlice.actions;
const selectIsAuthenticated = (state: RootState) => state.session.isAuthenticated;
const selectHasBetaAccess = (state: RootState) => state.session.hasBetaAccess;
const selectEmail = (state: RootState) => state.session.email;

export {sessionSlice, selectEmail, selectHasBetaAccess, selectIsAuthenticated, setSession};
