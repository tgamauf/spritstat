import React, {useEffect, useLayoutEffect, useState} from "react";

import {useLazyGetSettingsQuery} from "../apis/spritstatApi";
import {useAppDispatch, useAppSelector} from "../utils";
import {setSettings} from "./settingsSlice";
import LoadingPage from "../components/LoadingPage";
import {selectIsAuthenticated} from "../auth/accountSlice";


interface Props {
  children: React.ReactNode;
}

function SettingsProvider({children}: Props): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [getSettings, {data, error, isError, isFetching, isSuccess}] = useLazyGetSettingsQuery();
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    // Trigger update of setting only if we are newly authenticated
    if (isAuthenticated) {
      getSettings();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isError) {
      console.error(`Get settings failed: ${JSON.stringify(error, null, 2)}`);
    }
  }, [isError]);

  useEffect(() => {
    if(!isFetching && isSuccess && data) {
      dispatch(setSettings(data));
    }
  }, [isFetching]);

  return <div>{children}</div>;
}

export {SettingsProvider};
