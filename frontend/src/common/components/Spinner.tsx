import React from "react";


export default function Spinner(): JSX.Element {
  return (
      <progress
        className="progress is-large is-primary"
        max="100"
        data-test="loading"
      />
  );
}
