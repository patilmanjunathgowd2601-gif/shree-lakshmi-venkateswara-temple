import axios from 'axios';

// The booking-service is a separate Python microservice from the main Node
// backend (see /booking-service). It shares the same admin JWT, so we reuse
// the same token from localStorage.
const bookingApi = axios.create({
  baseURL: import.meta.env.VITE_BOOKING_API_URL || '/booking-api',
});

bookingApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('temple_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default bookingApi;
