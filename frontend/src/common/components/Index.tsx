import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";

import {RouteNames} from "../types";
import {useAppSelector} from "../utils";
import {selectIsAuthenticated} from "../../features/auth/accountSlice";

export default function Index() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(RouteNames.Dashboard, {replace: true});
   } else {
      navigate(RouteNames.Home, {replace: true});
   }
 }, [isAuthenticated]);

  return <div />;
}
