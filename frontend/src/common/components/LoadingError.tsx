import React from "react";
import CenteredBox from "./CenteredBox";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";


interface Props {
  loading: boolean;
  message: string;
  linkTo: string;
  linkName: string;
}

export default function LoadingError(
  {loading, message, linkTo, linkName}: Props
): JSX.Element {
  return (
    <CenteredBox loading={loading}>
      <div data-test="block-error">
        <p>
          <FontAwesomeIcon
            className="icon has-text-danger is-large"
            icon={faTimes}
            size="lg"
          />
        </p>
        <p className="mt-3">{message}</p>
        <p className="mt-3">
          <Link
            className="has-text-primary"
            to={linkTo}
            data-test="link-action"
          >
            {linkName}
          </Link>
        </p>
      </div>
    </CenteredBox>
  );
};
