import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useGlobalState } from "../../app/App";
import { RouteNames } from "../types";

export default function Index() {
  const [{ isAuthenticated }] = useGlobalState();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(RouteNames.Dashboard, { replace: true });
    } else {
      navigate(RouteNames.Home, { replace: true });
    }
  }, [isAuthenticated]);

  return <div />;
}
