import React from "react";

interface Props {
  onClick: () => void;
}

export default function HeaderBurger({ onClick }: Props): JSX.Element {
  return (
    <a
      role="button"
      className="navbar-burger has-text-link"
      data-target="navMenu"
      aria-label="menu"
      aria-expanded="false"
      onClick={() => onClick()}
      data-test="header-burger"
    >
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </a>
  );
}

export type { Props as HeaderBurgerProps };
