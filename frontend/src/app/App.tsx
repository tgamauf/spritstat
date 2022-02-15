import React, {useEffect} from "react";
import {Outlet} from "react-router-dom";
import moment from "moment-timezone";

import Header from "../common/components/Header";
import {HeaderDropdownItem} from "../common/components/HeaderDropdown";
import {RouteNames} from "../common/types";
import {useGetSessionQuery} from "../common/apis/spritstatApi";
import {useAppDispatch} from "../common/utils";
import {setSession} from "../common/sessionSlice";
import {EMPTY_SESSION} from "../common/constants";


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

export default function App() {
  const {data: session, error, isError, isFetching, isSuccess} = useGetSessionQuery();
  const dispatch = useAppDispatch();

  // Set the locale for moment timestamps to german
  useEffect(() => {
    moment.locale("de-at");
  }, []);

  useEffect(() => {
    if (isError) {
      console.error(`Get session failed: ${JSON.stringify(error, null, 2)}`);
      dispatch(setSession(EMPTY_SESSION));
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess && session) {
      dispatch(setSession(session));
    }
  }, [isFetching]);

  return (
    <div className="App">
      <Header dropdownItems={headerDropdownItems} />
      <Outlet />
    </div>
  );
}
