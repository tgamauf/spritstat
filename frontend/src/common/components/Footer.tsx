import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";

import { RouteNames } from "../types";

export default function Footer() {
  return (
    <div className="hero-foot has-text-centered" data-test="footer">
      <div>
        <Link
          className="has-text-primary"
          to={RouteNames.Imprint}
          data-test="link-imprint"
        >
          Impressum
        </Link>
        <span> &bull; </span>
        <Link
          className="has-text-primary"
          to={RouteNames.PrivacyPolicy}
          data-test={"link-privacy"}
        >
          Datenschutzerklärung
        </Link>
      </div>
      <div className="mt-2">
        <a
          href="https://github.com/tgamauf/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            className="icon has-text-grey is-size-2"
            icon={faGithub}
          />
        </a>
        <a
          href="https://at.linkedin.com/in/thomas-gamauf-15aa96105"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            className="icon has-text-grey is-size-2"
            icon={faLinkedin}
          />
        </a>
      </div>
    </div>
  );
}
