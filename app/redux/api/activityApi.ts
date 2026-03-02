import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Activity } from '../../types/dashboard';
import { RootState } from '../store';
import { API_CONFIG } from '../../../constants/config';

export const activityApi = createApi({
  reducerPath: 'activityApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Activity'],
  endpoints: (builder) => ({
    getActivities: builder.query<Activity[], void>({
      query: () => '/activity',
      providesTags: ['Activity'],
    }),
  }),
});

export const { useGetActivitiesQuery } = activityApi;
