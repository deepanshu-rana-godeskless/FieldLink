/**
 * Default Dashboard Services
 * All API calls for the default dashboard page
 */

import { getApiBaseUrl } from '@/lib/api-utils';

async function fetchApi({ endpoint, token, method = 'GET', body }: {
  endpoint: string;
  token: string;
  method?: 'GET' | 'POST';
  body?: any;
}) {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const headers: Record<string, string> = {
    'Accept': 'application/json, text/plain, */*',
    'Authorization': `Bearer ${token}`,
  };
  if (method === 'POST') headers['Content-Type'] = 'application/json';
  const res = await fetch(url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    return { status: false, data: null, error: { message: res.statusText, status: res.status } };
  }
  try {
    return await res.json();
  } catch {
    return { status: false, data: null, error: { message: 'Invalid JSON', status: res.status } };
  }
}

export const defaultDashboardServices = {
  // 1. Get Timezones
  getTimezones: (token: string) =>
    fetchApi({ endpoint: '/timezone/', token }),

  // 2. Get User Access Permission
  getUserAccessPermission: (token: string) =>
    fetchApi({ endpoint: '/admin/user_access_permission/v2/', token }),

  // 3. Get Steps Status
  getStepsStatus: (token: string) =>
    fetchApi({ endpoint: '/admin/steps_status/', token }),

  // 4. Validate Token (POST)
  validateToken: (token: string) =>
    fetchApi({ endpoint: '/validate/token/', token, method: 'POST', body: { token } }),

  // 5. Get Login Status
  getLoginStatus: (token: string) =>
    fetchApi({ endpoint: '/login/status/', token }),

  // 6. Get Dashboard Analytics (POST, empty from_date/to_date)
  getDashboardAnalytics: (token: string) =>
    fetchApi({ endpoint: '/admin/analytics/dashboard/count/', token, method: 'POST', body: { from_date: '', to_date: '' } }),

  // 7. Get Language List
  getLanguageList: (token: string) =>
    fetchApi({ endpoint: '/language_list/', token }),

  // 8. Get Logged In Users (POST, paginated, with search)
  getLoggedInUsers: (token: string, page: number, searchText: string) => {
    return fetchApi({
      endpoint: `/admin/login/users/?page=${page}`,
      token,
      method: 'POST',
      body: { search_text: searchText },
    });
  },
};
