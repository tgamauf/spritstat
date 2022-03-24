import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import Cookie from "universal-cookie";


interface SessionData {
  isAuthenticated: boolean;
  hasBetaAccess: boolean;
  email: string;
}

interface ValidatePasswordData {
  password: string;
  email?: string;
}

interface PasswordValidationResponse {
  valid: boolean;
  score: number;
  suggestions: string[];
}

interface SignupData {
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
  remember: boolean;
}

interface PasswordResetConfirmData {
  uid: string;
  token: string;
  password: string;
}

interface PasswordChangeData {
  oldPassword: string;
  newPassword: string;
}

interface IntroSettings {
  add_location_active: boolean;
  location_details_active: boolean;
  location_list_active: boolean;
  no_location_active: boolean;
}

interface SettingsData {
  intro: IntroSettings;
  notifications_active: boolean;
}

interface UnsubscribeData {
  uid: string;
  token: string;
}

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
}

function updateCsrfToken() {
  // Get the CSRF token from the cookie and store it on the window to make it
  //  available to all requests.

  const cookie = new Cookie();
  window.csrfToken = cookie.get("csrftoken")
}

const spritstatApi = createApi({
  reducerPath: "spritstatApi",
  baseQuery: fetchBaseQuery({baseUrl: "/api/v1"}),
  tagTypes: ["Locations", "Session", "Settings"],
  endpoints: (builder) => ({
    getSession: builder.query<SessionData, void>({
      query: () => {
        // Reload the CSRF token on every call to getSession. This ensures that
        //  the token is set or removed automatically on login/logout.
        updateCsrfToken();

        return {
          url: "users/account/session/",
          method: "POST",
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
          }
        };
      },
      providesTags: ["Session"],
    }),
    validatePassword: builder.mutation<PasswordValidationResponse, ValidatePasswordData>({
      query: ({password, email}) => {
        return {
          url: "users/auth/password/validate/",
          method: "POST",
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
          },
          body: {password, email}
        };
      }
    }),
    signup: builder.mutation<boolean, SignupData>({
      query: ({email, password}) => {
        return {
          url: "users/auth/register/",
          method: "POST",
          headers: DEFAULT_HEADERS,
          body: {
            email,
            // We have to send the password twice to satisfy dj_rest_auth
            password1: password,
            password2: password
          }
        };
      }
    }),
    login: builder.mutation<void, LoginData>({
      query: ({email, password, remember}) => {
        return {
          url: "users/auth/login/",
          method: "POST",
          headers: DEFAULT_HEADERS,
          body: {email, password, remember}
        };
      },
      invalidatesTags: (result, error, arg) => {
        // Invalidate the tags only if login succeeded. This prevents reloading
        //  of the session, which in turn would prevent a login error message
        //  from being shown
        return error ? [] : ["Locations", "Session", "Settings"]
      }
    }),
    logout: builder.mutation<boolean, void>({
      query: () => {
        return {
          url: "users/auth/logout/",
          method: "POST",
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
          }
        };
      },
      invalidatesTags: ["Session"]
    }),
    verifyEmail: builder.mutation<boolean, string>({
      query: (key) => {
        return {
          url: "users/auth/verify-email/",
          method: "POST",
          headers: DEFAULT_HEADERS,
          body: {key}
        };
      },
      transformResponse: (response: { detail?: string }) => {
        return response.detail !== "undefined";
      },
    }),
    resendEmail: builder.mutation<boolean, string>({
      query: (email) => {
        return {
          url: "users/auth/resend-email/",
          method: "POST",
          headers: DEFAULT_HEADERS,
          body: {email}
        };
      },
      transformResponse: (response: { detail?: string }) => {
        return response.detail !== "undefined";
      },
    }),
    resetPassword: builder.mutation<boolean, string>({
      query: (email) => {
        return {
          url: "users/auth/password/reset/",
          method: "POST",
          headers: DEFAULT_HEADERS,
          body: {email}
        };
      },
      transformResponse: (response: { detail?: string }) => {
        return response.detail !== "undefined";
      },
    }),
    resetPasswordConfirm: builder.mutation<boolean, PasswordResetConfirmData>({
      query: ({uid, token, password}) => {
        return {
          url: "users/auth/password/reset/confirm/",
          method: "POST",
          headers: DEFAULT_HEADERS,
          body: {
            uid,
            token,
            // We have to send the new password twice to satisfy
            //  dj_rest_auth
            new_password1: password,
            new_password2: password
          }
        };
      },
      transformResponse: (response: { detail?: string }) => {
        return response.detail !== "undefined";
      },
    }),
    changePassword: builder.mutation<boolean, PasswordChangeData>({
      query: ({oldPassword, newPassword}) => {
        return {
          url: "users/auth/password/change/",
          method: "POST",
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
          },
          body: {
            old_password: oldPassword,
            // We have to send the new password twice to satisfy
            //  dj_rest_auth
            new_password1: newPassword,
            new_password2: newPassword
          }
        };
      },
      transformResponse: (response: { detail?: string }) => {
        return response.detail !== "undefined";
      },
    }),
    deleteAccount: builder.mutation<boolean, void>({
      query: () => {
        return {
          url: "users/account/delete/",
          method: "DELETE",
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
          }
        };
      },
      transformResponse: () => true,
      invalidatesTags: ["Session"]
    }),
    getSettings: builder.query<SettingsData, void>({
      query: () => {
        return {
          url: "sprit/settings/",
          method: "GET",
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
          }
        };
      },
      providesTags: ["Settings"]
    }),
    setSetting: builder.mutation<void, RecursivePartial<SettingsData>>({
      query: (settings) => {
        return {
          url: "sprit/settings/",
          method: "PATCH",
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
          },
          body: settings
        };
      },
      invalidatesTags: ["Settings"]
    }),
    unsubscribe: builder.mutation<void, UnsubscribeData>({
      query: (data) => {
        return {
          url: "sprit/unsubscribe/",
          method: "POST",
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
          },
          body: data
        };
      },
      invalidatesTags: ["Settings"]
    })
  }),
});

const {
  useChangePasswordMutation,
  useGetSessionQuery,
  useVerifyEmailMutation,
  useLoginMutation,
  useLogoutMutation,
  useResendEmailMutation,
  useResetPasswordMutation,
  useResetPasswordConfirmMutation,
  useSignupMutation,
  useValidatePasswordMutation,
  useDeleteAccountMutation,
  useLazyGetSettingsQuery,
  useSetSettingMutation,
  useUnsubscribeMutation,
} = spritstatApi;

export {
  DEFAULT_HEADERS,
  spritstatApi,
  useChangePasswordMutation,
  useGetSessionQuery,
  useVerifyEmailMutation,
  useLoginMutation,
  useLogoutMutation,
  useResendEmailMutation,
  useResetPasswordMutation,
  useResetPasswordConfirmMutation,
  useSignupMutation,
  useValidatePasswordMutation,
  useDeleteAccountMutation,
  useLazyGetSettingsQuery,
  useSetSettingMutation,
  useUnsubscribeMutation,
};
export type {PasswordValidationResponse, SettingsData};
