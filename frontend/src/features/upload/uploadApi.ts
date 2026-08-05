import { api } from '../../lib/apiClient';

interface UploadResponse {
  url: string;
}

export const uploadApi = api.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('image', file); // le nom de champ attendu par Multer côté backend
        return { url: '/upload/image', method: 'POST', body: formData };
      },
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;