import React, {useEffect, useRef, useState} from "react";
import {Link} from "react-router-dom";

import Logo from "../../../assets/img/logo.png";
import Logo1_5x from "../../../assets/img/logo@1.5.png";
import Logo2x from "../../../assets/img/logo@2x.png";
import Logo3x from "../../../assets/img/logo@3x.png";
import Logo4x from "../../../assets/img/logo@4x.png";
import {RouteNames} from "../types";
import HeaderBurger from "./HeaderBurger";
import HeaderDropdown, {HeaderDropdownItem} from "./HeaderDropdown";
import HeaderLoginButton from "./HeaderLoginButton";
import {useAppSelector} from "../utils";
import {selectIsAuthenticated} from "../auth/accountSlice";

interface Props {
  dropdownItems: HeaderDropdownItem[];
}

export default function Header({dropdownItems}: Props): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
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
          <img
            className="logo"
            src={Logo}
            srcSet={`${Logo}, ${Logo1_5x} 1.5x, ${Logo2x} 2x, ${Logo3x} 3x, ${Logo4x} 4x`}
            alt="SPRITSTAT"
            data-test="header-logo-img"
          />
        </Link>
        <HeaderBurger onClick={() => setMenuActive(!menuActive)} />
      </div>
      <div ref={menuRef} className="navbar-menu">
        <div className="navbar-end">
          {!isAuthenticated ? (
            <HeaderLoginButton />
          ) : (
            <HeaderDropdown items={dropdownItems} />
          )}
        </div>
      </div>
    </nav>
  );
}
