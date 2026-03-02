import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LoginCredentials, LoginResponse, OTPVerification } from '../../types/auth';
import { API_CONFIG } from '../../../constants/config';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.AUTH_API,
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/signin/credentials',
        method: 'POST',
        body: credentials,
      }),
    }),
    verifyOTP: builder.mutation<LoginResponse, OTPVerification>({
      query: (data) => ({
        url: '/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),
    refreshToken: builder.mutation<{ token: string }, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: '/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyOTPMutation,
  useRefreshTokenMutation,
} = authApi;
