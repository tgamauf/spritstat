import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUserCircle} from "@fortawesome/free-solid-svg-icons";

import {RouteNames} from "../types";
import {useLogoutMutation} from "../apis/spritstatApi";
import {useAppDispatch} from "../utils";
import {INVALID_ACCOUNT, setAccount} from "../auth/accountSlice";


interface Item {
  name: string;
  route: RouteNames;
  "data-test": string;
}

interface Props {
  items: Item[];
}

export default function HeaderDropdown({items,}: Props): JSX.Element {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const [doLogout, setDoLogout] = useState(false);

  useEffect(() => {
    if (doLogout) {
      setDoLogout(false);

      // Clear session to prevent any page from fetching data during logout
      dispatch(setAccount(INVALID_ACCOUNT));
      logout().unwrap()
        .then(() => {
          navigate(RouteNames.Login, {replace: true});
       })
        .catch((e) => {
          console.error(`Error during logout: ${JSON.stringify(e, null, 2)}`);
       });
   }
 }, [doLogout]);

  return (
    <div
      className="navbar-item has-dropdown is-hoverable"
      data-test="header-dropdown"
    >
      <a className="navbar-link">
        <FontAwesomeIcon
          className="icon has-text-link"
          icon={faUserCircle}
          size="2x"
        />
      </a>
      <div className="navbar-dropdown is-right">
        {items.map((item, index) => {
          return (
            <div className="navbar-item" key={index}>
              <Link
                className="has-text-primary"
                to={item.route}
                data-test={item["data-test"]}
              >
                {item.name}
              </Link>
            </div>
          );
       })}
        <hr className="navbar-divider"/>
        <div className="navbar-item">
          <Link
            className="has-text-primary"
            to=""
            onClick={() => setDoLogout(true)}
            data-test="link-logout"
          >
            Abmelden
          </Link>
        </div>
      </div>
    </div>
  );
}

export type {Item as HeaderDropdownItem, Props as HeaderDropdownProps};
