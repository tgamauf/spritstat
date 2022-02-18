import React, {PropsWithChildren} from "react";
import CenteredBox from "./CenteredBox";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";


interface OwnProps {
  loading: boolean;
  message: string;
}
type Props = PropsWithChildren<OwnProps>;

export default function LoadingError(
  {loading, message, children}: Props
): JSX.Element {
  return (
    <CenteredBox loading={loading}>
      <div data-test="block-error" >
        <p>
          <FontAwesomeIcon
            className="icon has-text-danger is-large"
            icon={faTimes}
            size="lg"
          />
        </p>
        <p className="mt-3">{message}</p>
        <p className="mt-3">
          {children}
        </p>
      </div>
    </CenteredBox>
  );
};
