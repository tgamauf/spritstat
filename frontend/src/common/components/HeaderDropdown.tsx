import React, { Dispatch, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RouteNames } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";

import { apiPostRequest } from "../../services/api";
import { ActionTypes, setSession } from "../../services/store";
import { EMPTY_SESSION } from "../constants";

interface Item {
  name: string;
  route: RouteNames;
  "data-test": string;
}

interface Props {
  items: Item[];
  dispatchGlobalState: Dispatch<ActionTypes>;
}

export default function HeaderDropdown({
  items,
  dispatchGlobalState,
}: Props): JSX.Element {
  const [doLogout, setDoLogout] = useState(false);

  useEffect(() => {
    if (doLogout) {
      setDoLogout(false);

      apiPostRequest("users/auth/logout")
        .catch((e: any) => {
          console.error(`Error during logout: ${e}`);
        })
        .finally(() => {
          dispatchGlobalState(setSession(EMPTY_SESSION));
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
        <hr className="navbar-divider" />
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

export type { Item as HeaderDropdownItem, Props as HeaderDropdownProps };
