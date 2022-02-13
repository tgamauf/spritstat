import React, { Dispatch, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Logo from "../../../assets/img/logo.svg";
import { ActionTypes } from "../../services/store";
import { RouteNames } from "../types";
import HeaderBurger from "./HeaderBurger";
import HeaderDropdown, { HeaderDropdownItem } from "./HeaderDropdown";
import HeaderLoginButton from "./HeaderLoginButton";

interface Props {
  isAuthenticated: boolean;
  dispatchGlobalState: Dispatch<ActionTypes>;
  dropdownItems: HeaderDropdownItem[];
}

export default function Header({
  isAuthenticated,
  dispatchGlobalState,
  dropdownItems,
}: Props): JSX.Element {
  const menuRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const [menuActive, setMenuActive] = useState(false);

  useEffect(() => {
    if (!menuRef.current) {
      return;
    }

    if (menuActive) {
      menuRef.current.classList.add("is-active");
    } else {
      menuRef.current.classList.remove("is-active");
    }
  }, [menuActive]);

  return (
    <nav
      className="navbar has-shadow is-primary"
      role="navigation"
      aria-label="main navigation"
      data-test="header"
    >
      <div className="navbar-brand">
        <Link
          className="navbar-item"
          to={RouteNames.Home}
          data-test="header-logo-link"
        >
          <img src={Logo} alt="SPRITSTAT" width="250" data-test="header-logo-img"/>
        </Link>
        <HeaderBurger onClick={() => setMenuActive(!menuActive)} />
      </div>
      <div ref={menuRef} className="navbar-menu">
        <div className="navbar-end">
          {!isAuthenticated ? (
            <HeaderLoginButton />
          ) : (
            <HeaderDropdown
              dispatchGlobalState={dispatchGlobalState}
              items={dropdownItems}
            />
          )}
        </div>
      </div>
    </nav>
  );
}
