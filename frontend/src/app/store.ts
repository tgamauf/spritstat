import {configureStore} from "@reduxjs/toolkit";

import {settingsSlice} from "../common/settings/settingsSlice";
import {eControlApi} from "../common/apis/eControl";
import {spritstatApi} from "../common/apis/spritstatApi";
import {accountSlice} from "../common/auth/accountSlice";


const store = configureStore({
  reducer: {
    [eControlApi.reducerPath]: eControlApi.reducer,
    [spritstatApi.reducerPath]: spritstatApi.reducer,
    account: accountSlice.reducer,
    settings: settingsSlice.reducer
 },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
   }).concat(
      eControlApi.middleware,
      spritstatApi.middleware
    ),
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch

export type {AppDispatch, RootState};
export {store};
