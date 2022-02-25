import React from "react";


interface Props {
  children: React.ReactNode;
}

export default function InfoBox({children}: Props): JSX.Element {
  return (
    <div className="box has-background-info has-text-centered is-unselectable">
      <span>{children}</span>
    </div>
  );
};
