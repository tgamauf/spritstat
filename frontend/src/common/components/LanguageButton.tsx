import React, {MutableRefObject, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGlobe} from "@fortawesome/free-solid-svg-icons";
import {useAppDispatch, useAppSelector} from "../utils";
import {localeNames, selectLocale, setLocale} from "../i18n";
import {Link} from "react-router-dom";


interface Props {
  className?: string;
}


export default function LanguageButton(
  {className = "has-text-primary"}: Props
): JSX.Element {
  const dropdownRef = useRef() as MutableRefObject<HTMLDivElement>;
  const dispatch = useAppDispatch();
  const locale = useAppSelector(selectLocale);
  const [dropdownActive, setDropdownActive] = useState(false);

  if (dropdownRef.current) {
    if (dropdownActive) {
      dropdownRef.current.classList.add("is-active");
    } else {
      dropdownRef.current.classList.remove("is-active");
    }
  }

  return (
    <div className="dropdown" ref={dropdownRef} data-test="dropdown-language">
      <div className="dropdown-trigger">
        <Link
          className={className}
          to=""
          onClick={() => setDropdownActive(!dropdownActive)}
          data-test="dropdown-language-trigger"
        >
          <FontAwesomeIcon icon={faGlobe}/>
          <span className="ml-1">{localeNames.get(locale)}</span>
        </Link>
      </div>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          {Array.from(localeNames).map(([value, name], index) => {
            if (value !== locale) {
              return (
                <a
                  href="#"
                  className="dropdown-item"
                  key={index}
                  onClick={() => dispatch(setLocale({locale: value}))}
                >
                  {name}
                </a>
              );
            }
          })
          }
        </div>
      </div>
    </div>
  )
}