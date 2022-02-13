import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import CenteredBox from "../../common/components/CenteredBox";
import {apiPostRequest, apiVerifyEmailKey} from "../../services/api";
import { setSession } from "../../services/store";
import { EMPTY_SESSION } from "../../common/constants";
import { useGlobalState } from "../../app/App";
import { RouteNames } from "../../common/types";
import BasePage from "../../common/components/BasePage";

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

    if (!key) {
      console.error("Email verification failed, no key provided");
      setLoading(false);
      return;
    }

    apiVerifyEmailKey(key)
      .then((valid) => {
        if (valid) {
          navigate(
            `${RouteNames.Login}?emailVerified=true`,
            { replace: true }
          );
        } else {
          console.log("Email verification returned false");
        }
      })
      .catch((e: any) => {
        console.error(`Email verification failed: ${e}`);
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
