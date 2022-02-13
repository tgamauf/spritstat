import React, {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {faChartLine} from "@fortawesome/free-solid-svg-icons";

import BasePage from "../../common/components/BasePage";
import {RouteNames} from "../../common/types";


const breadcrumb = {
  name: "Ort",
  icon: faChartLine,
  destination: RouteNames.LocationDetails,
};

export default function LocationDetails(): JSX.Element {
  const {location: locationId} = useParams();
  const [errorMessage, setErrorMessage] = useState("");

  console.log(`LocationDetails [0] locationId=${JSON.stringify(locationId)}`);//TODO

  breadcrumb.name = `Ort ${locationId}`;

  return (
    <BasePage
      breadcrumbItems={[breadcrumb]}
      active={errorMessage !== ""}
      message={errorMessage}
      discardMessage={() => setErrorMessage("")}
    >
      // TODO delete button
      // TODO tile with location details
      // TODO tile with interactive price graph
    </BasePage>
  );
}

export { breadcrumb as locationDetailsBreadcrumb };
