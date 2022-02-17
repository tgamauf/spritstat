import React, {useEffect, useState} from "react";
import {Navigate, useLocation} from "react-router-dom";

import {useGetSessionQuery} from "../../common/apis/spritstatApi";
import LoadingPage from "../../common/components/LoadingPage";
import {useAppDispatch, useAppSelector} from "../../common/utils";
import {INVALID_ACCOUNT, selectIsAuthenticated, setAccount} from "./accountSlice";
import {RouteNames} from "../../common/types";
import {useLogoutMutation} from "./authApiSlice";


interface LocationState {
  fromPathName: string
}

interface Props {
  children: React.ReactNode;
}

function AuthProvider({children}: Props): JSX.Element {
  const {data: session, error, isError, isFetching, isSuccess} = useGetSessionQuery();
  const dispatch = useAppDispatch();
  const [isSessionValid, setIsSessionValid] = useState(false);

  useEffect(() => {
    if (isFetching) {
      setIsSessionValid(false);
    }
  }, [isFetching]);

  useEffect(() => {
    if (isError) {
      console.error(`Get session failed: ${JSON.stringify(error, null, 2)}`);
      dispatch(setAccount(INVALID_ACCOUNT));
      setIsSessionValid(true);
   }
 }, [isError]);

  useEffect(() => {
    if (!isFetching && isSuccess && session) {

      dispatch(setAccount({
        isAuthenticated: session.isAuthenticated,
        email: session.email,
        hasBetaAccess: session.hasBetaAccess
     }));
      setIsSessionValid(true);
   }
 }, [isFetching]);

  return (
    <div>
      {isSessionValid ? (children) : (<LoadingPage/>)}
    </div>
  )
}

function RequireAuth({children}: {children: JSX.Element}): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    const locationState: LocationState = {fromPathName: location.pathname};
    return <Navigate to={RouteNames.Login} state={locationState} replace />;
 }

  return children;
}

function RequireNoAuth({children}: {children: JSX.Element}): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [logout] = useLogoutMutation();

  useEffect(() => {
    if (isAuthenticated) {
      logout().unwrap()
        .catch((e) => {
          console.error(`Error during logout: ${JSON.stringify(e, null, 2)}`);
        });
    }
  }, [isAuthenticated]);

  return !isAuthenticated ? children : <LoadingPage />;
}

export {AuthProvider, RequireAuth, RequireNoAuth};
export type {LocationState};