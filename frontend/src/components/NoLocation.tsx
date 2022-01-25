import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

import CenteredBox from "./CenteredBox";
import { RouteNames } from "../utils/types";

export default function NoLocation() {
  return (
    <div className="tile is-anchestor" data-test="no-location">
      <div className="tile is-parent is-vertical is-align-items-center">
        <div className="tile is-child is-4">
          <p className="box has-background-info has-text-centered is-family-monospace">
            Fügen einen neuen Ort hinzu für den Spritpreise aufgezeichnet werden
            sollen.
          </p>
        </div>
        <div className="tile is-child">
          <CenteredBox>
            <Link to={RouteNames.AddLocation}>
              <div className="container has-text-centered has-text-primary">
                <p>
                  <FontAwesomeIcon
                    className="icon is-large"
                    icon={faMapMarkerAlt}
                  />
                </p>
                <p className="mt-3">Neuen Ort hinzufügen</p>
              </div>
            </Link>
          </CenteredBox>
        </div>
      </div>
    </div>
  );
};
