import {DEFAULT_HEADERS, spritstatApi} from "../../common/apis/spritstatApi"


const extendedApi = spritstatApi.injectEndpoints({
  endpoints: (builder) => ({
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
   })
 })
})

export const {useDeleteAccountMutation} = extendedApi;
