import React, { Dispatch, useEffect, useReducer, useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import moment from "moment-timezone";

import Footer from "./components/Footer";
import Header from "./components/Header";
import { HeaderDropdownItem } from "./components/HeaderDropdown";
import { apiGetSessionRequest } from "./services/api";
import { ActionTypes, reducer, setSession } from "./services/store";
import { EMPTY_SESSION } from "./utils/constants";
import { GlobalState, RouteNames } from "./utils/types";
import CenteredBox from "./components/CenteredBox";

const initialGlobalState: GlobalState = {
  isAuthenticated: false,
  email: "",
};

const headerDropdownItems: HeaderDropdownItem[] = [
  {
    name: "Einstellungen",
    route: RouteNames.Settings,
    "data-test": "link-settings"
  },
  {
    name: "Kontakt",
    route: RouteNames.Contact,
    "data-test": "link-contact"
  },
];

type GlobalStateContext = [GlobalState, Dispatch<ActionTypes>];

function useGlobalState() {
  return useOutletContext<GlobalStateContext>();
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialGlobalState);
  const [loading, setLoading] = useState(true);

  // Set the locale for moment timestamps to german
  useEffect(() => {
    moment.locale("de-at");
  }, []);

  // Check if we are authenticated on mount only, afterwards it"s the
  //  responsibility of the login/logout methods
  useEffect(() => {
    apiGetSessionRequest()
      .then((session) => {
        dispatch(setSession(session));
      })
      .catch((e) => {
        // Assume user isn"t logged in
        dispatch(setSession(EMPTY_SESSION));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="App app-wrapper">
      <Header
        isAuthenticated={state.isAuthenticated}
        dispatchGlobalState={dispatch}
        dropdownItems={headerDropdownItems}
      />
      <div className="content-wrapper">
        {loading ? (
          <CenteredBox loading={loading} />
        ) : (
          <Outlet context={[state, dispatch]} />
        )}
      </div>
    </div>
  );
}

export type { GlobalStateContext };

export { useGlobalState };
