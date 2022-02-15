import {DEFAULT_HEADERS, spritstatApi} from "../../common/apis/spritstatApi"

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

const extendedApi = spritstatApi.injectEndpoints({
  endpoints: (builder) => ({
    validatePassword: builder.mutation<PasswordValidationResponse, ValidatePasswordData>({
      query: ({password, email}) => {
        let headers;
        if (window.csrfToken) {
          headers = {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
          }
        } else {
          headers = DEFAULT_HEADERS;
        }
        return {
          url: "users/auth/password/validate/",
          method: "POST",
          headers,
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
    login: builder.mutation<boolean, LoginData>({
      query: ({email, password, remember}) => {
        return {
          url: "users/auth/login/",
          method: "POST",
          headers: DEFAULT_HEADERS,
          body: {email, password, remember}
        };
      },
      transformResponse: () => true,
      invalidatesTags: ["Locations", "Prices", "Session", "Stations"]
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
      transformResponse: (response: {detail?: string}) => {
        return response.detail !== "undefined";
      },
    }),
    resendEmail: builder.mutation<boolean, string>({
      query: (email) => {
        return {
          url: "users/auth/password/resend-email/",
          method: "POST",
          headers: DEFAULT_HEADERS,
          body: {email}
        };
      },
      transformResponse: (response: {detail?: string}) => {
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
      transformResponse: (response: {detail?: string}) => {
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
      transformResponse: (response: {detail?: string}) => {
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
      transformResponse: (response: {detail?: string}) => {
        return response.detail !== "undefined";
      },
    }),
  })
})

export const {
  useChangePasswordMutation,
  useVerifyEmailMutation,
  useLoginMutation,
  useLogoutMutation,
  useResendEmailMutation,
  useResetPasswordMutation,
  useResetPasswordConfirmMutation,
  useSignupMutation,
  useValidatePasswordMutation
} = extendedApi;

export type {PasswordValidationResponse};
