import React, {PropsWithChildren} from "react";

import Breadcrumb, {BreadcrumbItem} from "./Breadcrumb";
import {DASHBOARD_BREADCRUMB} from "../../features/location/Dashboard";
import Footer from "./Footer";
import {useAppSelector} from "../utils";
import {HeaderDropdownItem} from "./HeaderDropdown";
import {RouteNames} from "../types";
import Header from "./Header";
import {selectIsAuthenticated} from "../auth/accountSlice";


enum Severity {
  Error = 0,
  Warning,
  Info,
}

const headerDropdownItems: HeaderDropdownItem[] = [
  {
    name: "Einstellungen",
    route: RouteNames.Settings,
    "data-test": "link-settings"
 },
  {
    name: "Kontakt",
    route: RouteNames.Contact,
    "data-test": "link-contact"
 },
];

interface OwnProps {
  breadcrumbItems?: BreadcrumbItem[];
  severity?: Severity;
  active?: boolean;
  message?: string;
  discardMessage?: () => void;
}
type Props = PropsWithChildren<OwnProps>;

export default function BasePage({
  breadcrumbItems: additionalBreadcrumbItems,
  severity,
  active,
  message,
  discardMessage,
  children,
}: Props): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  let breadcrumbItems;
  if (isAuthenticated) {
    if (additionalBreadcrumbItems) {
      breadcrumbItems = [DASHBOARD_BREADCRUMB, ...additionalBreadcrumbItems];
   } else {
      breadcrumbItems = [DASHBOARD_BREADCRUMB];
   }
 }

  let severityModifier;
  if (typeof severity === "undefined" || severity === Severity.Error) {
    severityModifier = "is-danger";
 } else if (severity === Severity.Warning) {
    severityModifier = "is-warning";
 } else {
    severityModifier = "is-info";
 }

  return (
    <div>
      <Header dropdownItems={headerDropdownItems} />
      <section className="hero is-fullheight-with-navbar">
        {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}
        {active && discardMessage && (
          <div
            className={`notification ${severityModifier}`}
            data-test="notification"
          >
            <button className="delete" onClick={() => discardMessage()} />
            {message}
          </div>
        )}
        <div className="hero-body">
          {children}
        </div>
        <Footer />
      </section>
    </div>
  );
}

export {Severity as BasePageSeverity};
