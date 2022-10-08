import React, {useEffect, useLayoutEffect} from "react";

import {useAppDispatch, useAppSelector} from "../utils";
import {loadMessages, selectLocaleData, setLocale, setMessages} from "./i18nSlice";
import {selectIsAuthenticated} from "../auth/accountSlice";
import {IntlProvider} from "react-intl";
import {useLazyGetLocaleQuery} from "./i18nApiSlice";


interface Props {
  children: React.ReactNode;
}

export default function I18nProvider({children}: Props): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const {locale, messages} = useAppSelector(selectLocaleData);
  const [
    getUserLocale,
    {
      data: userLocale,
      error,
      isError,
      isFetching,
      isSuccess
    }
  ] = useLazyGetLocaleQuery();
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    // Load messages initially
    loadMessages(locale)
      .then((messages) => dispatch(setMessages(messages)))
      .catch((e) => console.error(`Failed to load messages for locale '${locale}': ${e}`));
  }, []);

  useLayoutEffect(() => {
    // Trigger update of the locale only if we are newly authenticated
    if (isAuthenticated) {
      getUserLocale();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isError) {
      console.error(`Get locale for user failed: ${JSON.stringify(error, null, 2)}`);
    }
  }, [isError]);

  useEffect(() => {
    if (!isFetching && isSuccess && userLocale) {
      dispatch(setLocale(userLocale));
    }
  }, [isFetching]);

  return (
    <IntlProvider
      defaultLocale="de"
      locale={locale}
      messages={messages}
      key={locale}
    >
      {children}
    </IntlProvider>
  )
}
