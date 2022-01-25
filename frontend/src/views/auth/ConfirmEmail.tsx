import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import CenteredBox from "../../components/CenteredBox";
import { apiPostRequest } from "../../services/api";
import { setSession } from "../../services/store";
import { EMPTY_SESSION } from "../../utils/constants";
import { useGlobalState } from "../../App";
import { RouteNames } from "../../utils/types";
import BasePage from "../../components/BasePage";

export default function ConfirmEmail(): JSX.Element {
  const [{ isAuthenticated }, dispatchGlobalState] = useGlobalState();
  const { key } = useParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // If we are logged in we logout out as it is possible that a different
      //  user than the one this confirmation link belongs to is logged in.
      apiPostRequest("users/auth/logout")
        .catch((e: any) => {
          console.error(`Error during logout: ${e}`);
        })
        .finally(() => {
          dispatchGlobalState(setSession(EMPTY_SESSION));
        });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Only verify if we are not logged in
    if (isAuthenticated) {
      return;
    }

    const data = {
      key,
    };
    apiPostRequest("users/auth/verify-email", data)
      .then((result) => {
        if (result && result.detail === "ok") {
          navigate(
            `${RouteNames.Login}?emailVerified=true`,
            { replace: true }
          );
        } else {
          console.log(`Error during email confirmation: request failed`);
        }
      })
      .catch((e: any) => {
        console.error(`Error during email confirmation: ${e}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key, isAuthenticated]);

  return (
    <BasePage>
      <CenteredBox loading={loading}>
        <div data-test="block-error">
          <p>
            <FontAwesomeIcon
              className="icon has-text-danger is-large"
              icon={faTimes}
              size="lg"
            />
          </p>
          <p className="mt-3">
            Bestätigung fehlgeschlagen, eventuell ist der Bestätigungslink
            ungültig.
          </p>
          <p className="mt-3">
            <Link
              className="has-text-primary"
              to={RouteNames.Index}
              data-test="link-home"
            >
              Homepage
            </Link>
          </p>
        </div>
      </CenteredBox>
    </BasePage>
  );
}
