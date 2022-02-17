import React, {PropsWithChildren} from "react";

import Spinner from "./Spinner";

interface OwnProps {
  loading?: boolean;
}
type Props = PropsWithChildren<OwnProps>;

export default function CenteredBox({
  children,
  loading = false,
}: Props): JSX.Element {
  return (
    <div className="has-text-centered">
      {loading ? <Spinner /> : <div className="box">{children}</div>}
    </div>
  );
};
