import React from "react";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";

interface Item {
  name: string;
  icon: IconDefinition;
  destination: string;
}

interface Props {
  items?: Item[];
}

export default function Breadcrumb({items}: Props) {
  return (
    <div className="ml-5 mt-1 mb-5">
      {items && (
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            {items.map((item, index) => {
              // The last breadcrumb shouldn't be interactive
              let destination;
              if (index >= items?.length - 1) {
                destination = ""
              } else {
                destination = item.destination
              }
              return (
                <li key={index} data-test={`breadcrumb-${index}`}>
                  <Link
                    className="has-text-primary"
                    to={destination}
                  >
                    <FontAwesomeIcon className="icon" icon={item.icon} />
                    <span>{item.name}</span>
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
