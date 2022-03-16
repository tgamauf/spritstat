import React from "react";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {MessageDescriptor, useIntl} from "react-intl";


interface Item {
  name: MessageDescriptor;
  icon: IconDefinition;
  destination: string;
}

interface Props {
  items?: Item[];
}

export default function Breadcrumb({items}: Props) {
  const intl = useIntl();
  return (
    <div className="ml-5 mt-1 mb-5">
      {items && (
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            {items.map((item, index) => {
              return (
                <li key={index} data-test={`breadcrumb-${index}`}>
                  <Link
                    className="has-text-primary"
                    to={item.destination}
                  >
                    <FontAwesomeIcon className="icon" icon={item.icon} />
                    <span>{intl.formatMessage(item.name)}</span>
                  </Link>
                </li>
              );
           })}
          </ul>
        </nav>
      )}
    </div>
  );
}

export type {Item as BreadcrumbItem};
