import React, {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import {useIntl} from "react-intl";

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
  const intl = useIntl();

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
      {intl.formatMessage({
        description: "Unsubscribe link home",
        defaultMessage: "Homepage"
      })}
    </Link>
  );

  return (
    <BasePage>
      {error ? (
        <LoadingError
          message={intl.formatMessage({
              description: "Unsubscribe error",
              defaultMessage: "Abmeldung fehlgeschlagen, eventuell ist der " +
                "Abmeldelink ungültig."
            })
          }
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
            {intl.formatMessage({
              description: "Unsubscribe message success",
              defaultMessage: "Du hast dich erfolgreich von Benachrichtigungen abgemeldet."
            })}
          </p>
          <p className="mt-3">{homeLink}</p>
        </CenteredBox>
      )}
    </BasePage>
  );
}
