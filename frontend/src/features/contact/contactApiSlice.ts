import {DEFAULT_HEADERS, spritstatApi} from "../../common/apis/spritstatApi"

interface ContactMessageData {
  formId: string;
  name: string;
  subject: string;
  message: string;
}

const extendedApi = spritstatApi.injectEndpoints({
  endpoints: (builder) => ({
    sendContactForm: builder.mutation<boolean, ContactMessageData>({
      query: ({formId, name, subject, message}) => {
        return {
          url: "users/account/contact/",
          method: "POST",
          headers: {
            ...DEFAULT_HEADERS,
            "X-CSRFToken": window.csrfToken
          },
          body: {
            contact_form_id: formId,
            name,
            subject,
            message
          }
        };
      },
      transformResponse: () => true,
    })
  })
})

export const {useSendContactFormMutation} = extendedApi;
