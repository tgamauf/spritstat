import {configureStore} from "@reduxjs/toolkit";

import {eControlApi} from "../common/apis/eControl";
import {spritstatApi} from "../common/apis/spritstatApi";
import {sessionSlice} from "../common/sessionSlice";


const store = configureStore({
  reducer: {
    [eControlApi.reducerPath]: eControlApi.reducer,
    [spritstatApi.reducerPath]: spritstatApi.reducer,
    session: sessionSlice.reducer,
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
