import React, {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import {t, Trans} from "@lingui/macro";

import BasePage from "../components/BasePage";
import {useUnsubscribeMutation} from "../apis/spritstatApi";
import LoadingError from "../components/LoadingError";
import {RouteNames} from "../types";
import CenteredBox from "../components/CenteredBox";

export default function Unsubscribe(): JSX.Element {
  const [unsubscribe] = useUnsubscribeMutation();
  const {uid, token} = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!uid || !token) {
      console.error("Could not unsubscribe, uid or token not found");
      return;
    }

    unsubscribe({uid, token}).unwrap()
      .catch((e: any) => {
        console.error(`Unsubscribe failed: ${JSON.stringify(e, null, 2)}`);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [uid, token]);

  const homeLink = (
    <Link
      className="has-text-primary"
      to={RouteNames.Index}
      data-test="link-home"
    >
      <Trans>Homepage</Trans>
    </Link>
  );

  return (
    <BasePage>
      {error ? (
        <LoadingError
          message={t`Abmeldung fehlgeschlagen, eventuell ist der Abmeldungslink ungültig.`}
          children={homeLink}
        />
      ) : (
        <CenteredBox loading={loading}>
          <p>
            <FontAwesomeIcon
              className="icon has-text-success is-large"
              icon={faCheckCircle}
              size="lg"
            />
          </p>
          <p className="mt-3">
            <Trans>Du hast dich erfolgreich von Benachrichtigungen abgemeldet.</Trans>
          </p>
          <p className="mt-3">{homeLink}</p>
        </CenteredBox>
      )}
    </BasePage>
  );
}
