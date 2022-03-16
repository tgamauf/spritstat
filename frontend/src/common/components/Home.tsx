import React from "react";
import {Link} from "react-router-dom";
import {useIntl} from "react-intl";

import DemoGraph from "../../../assets/img/home-graph.png";
import {RouteNames} from "../types";
import BasePage from "./BasePage";

export default function Home() {
  const intl = useIntl();

  return (
    <BasePage>
      <div className="columns is-centered is-family-monospace has-text-weight-semibold">
        <div className="column is-10 is-8-desktop">
          <div className="block content" data-test="content-text">
            <p className="box has-background-link">
              {intl.formatMessage({
                description: "Home paragraph 1",
                defaultMessage: "Hast du dich schon immer gefragt wie sich der " +
                  "Spritpreis in deiner Gegend über die Zeit entwickelt? Oder an " +
                  "welchen Tagen es wirklich am günstigsten zu tanken ist? Ich auch " +
                  "und deswegen gibt es jetzt <color>SPRITSTAT</color>. Noch nie war " +
                  "es einfacher einen Überblick über die langfristige Preisentwicklung " +
                  "von Treibstoff in deiner Gegend zu bekommen."
                },
                {color: str => <span className="has-text-primary">{str}</span>}
              )}
            </p>
          </div>
          <div className="columns is-centered">
            <div className="column is-half-tablet is-one-third-fullhd">
              <div className="box has-background-info">
                <div className="block content" data-test="content-text">
                  <p>
                    {intl.formatMessage({
                      description: "Home paragraph 2",
                      defaultMessage: "So gehts - einfach anmelden, einen Ort anlegen " +
                        "und von diesem Zeitpunkt an werden die Spritkosten in deiner " +
                        "Gegend aufgezeichnet."
                    })}
                  </p>
                  <p>
                    {intl.formatMessage({
                      description: "Home paragraph 3",
                      defaultMessage: "Und das Beste? Das ganze ist gratis!"
                    })}
                  </p>
                </div>
                <div className="block has-text-centered">
                  <Link to={RouteNames.Signup}>
                    <button
                      className="button is-primary"
                      data-test="btn-register"
                    >
                      {intl.formatMessage({
                        description: "Home register button",
                        defaultMessage: "Los gehts!"
                      })}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="column is-half-tablet is-two-thirds-fullhd">
              <figure className="box image">
                <img
                  alt={intl.formatMessage({
                    description: "Home figure alt text",
                    defaultMessage: "Demo Graph"
                  })}
                  src={DemoGraph}
                  data-test="content-img"
                />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </BasePage>
  );
}
