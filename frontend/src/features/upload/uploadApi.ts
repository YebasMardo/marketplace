import { api } from '../../lib/apiClient';

interface UploadResponse {
  url: string;
}

export const uploadApi = api.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<
      UploadResponse,
      { file: File; folder?: string }
    >({
      query: ({ file, folder }) => {
        const formData = new FormData();
        formData.append('image', file); // le nom de champ attendu par Multer côté backend
        const qs = folder ? `?folder=${encodeURIComponent(folder)}` : '';
        return { url: `/upload/image${qs}`, method: 'POST', body: formData };
      },
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;