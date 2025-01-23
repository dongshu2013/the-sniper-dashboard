import { deleteCookie, getCookie, setCookie } from 'cookies-next';

export const COOKIE_KEY_JWT = 'jwt_cookie';

export async function saveJwt(jwt: string) {
  localStorage.setItem(COOKIE_KEY_JWT, jwt);
}

export function getJwt() {
  return localStorage.getItem(COOKIE_KEY_JWT);
}

export function deleteJwt() {
  localStorage.removeItem(COOKIE_KEY_JWT);
}
