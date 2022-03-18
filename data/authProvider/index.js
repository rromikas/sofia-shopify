import {
  IS_AUTH,
  PERMISSIONS,
  REFRESH_TIME,
  REFRESH_TOKEN,
  TOKEN,
  USER,
  USER_INFO,
  PUBLIC_ROUTES,
  API_URL,
} from "./constants";
import JWT from "jwt-decode";
import lodash from "lodash";
import moment from "moment";

const defaultHttpClient = (url) => {
  const token = localStorage.getItem(TOKEN);
  console.log({ token });
  const options = {};

  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" });
  }
  if (token) {
    options.headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, options);
};
const decodeUserData = (resp, decoded) => {
  const { user_roles, organization } = resp.json;

  let userInfo = { ...decoded.identity, organization };
  const currentRole = lodash.find(
    user_roles,
    (role) =>
      userInfo.current_role && role.role_id === userInfo.current_role.role_id
  );
  currentRole &&
    localStorage.setItem(
      PERMISSIONS,
      JSON.stringify(currentRole.role.permissions)
    );
  return { ...userInfo, ...resp.json };
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  login: ({ username, password, success }) => {
    const request = new Request(`${API_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: new Headers({ "Content-Type": "application/json" }),
    });

    return fetch(request)
      .then((response) => {
        if (response.status === 401) {
          throw new Error("Incorrect username and password.");
        }
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((response) => {
        const { access_token, refresh_token, message } = response;
        if (access_token) {
          var decoded = JWT(access_token);
          localStorage.setItem(TOKEN, access_token);
          localStorage.setItem(REFRESH_TOKEN, refresh_token);

          return defaultHttpClient(`${API_URL}/users/me`).then((resp) => {
            if (resp.status === 200) {
              localStorage.setItem(
                USER,
                JSON.stringify(decodeUserData(resp, decoded))
              );
              return true;
            }
          });
        } else {
          throw new Error("Incorrect username and password.");
        }
      });
  },
  logout: () => {
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(USER);
    localStorage.removeItem(USER_INFO);
    localStorage.removeItem(PERMISSIONS);
    localStorage.removeItem(IS_AUTH);
    localStorage.removeItem(REFRESH_TIME);

    return Promise.resolve();
  },
  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      return Promise.reject();
    }
    return Promise.resolve();
  },
  checkAuth: () => {
    return localStorage.getItem(TOKEN)
      ? Promise.resolve()
      : Promise.reject({ redirectTo: "/no-access" });
  },
  getPermissions: () => {
    const permissions = localStorage.getItem(PERMISSIONS);
    //getPermission gets called when navigating to forgot-password page thereby forcing a redirect to login page
    // returning Promise.resolve prevents react-admin from forcing a redirect
    if (!permissions)
      return PUBLIC_ROUTES.find((x) => window.location.href.includes(x))
        ? Promise.resolve()
        : Promise.reject();

    return JSON.parse(permissions)
      ? Promise.resolve(permissions)
      : Promise.reject();
  },
  refreshToken: () => {
    const request = new Request(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem(REFRESH_TOKEN)}`,
      }),
    });

    return fetch(request)
      .then((response) => {
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(({ access_token, refresh_token }) => {
        if (access_token) {
          localStorage.setItem(TOKEN, access_token);
          localStorage.setItem(REFRESH_TIME, moment().add("minutes", 2));
          return access_token;
        } else {
          throw new Error("Incorrect username and password.");
        }
      });
  },
  getIdentity: () => {
    try {
      return defaultHttpClient(`${API_URL}/users/me`).then((resp) => {
        if (resp.status === 200) {
          const access_token = localStorage.getItem(TOKEN);
          var decoded = JWT(access_token);
          return Promise.resolve(decodeUserData(resp, decoded));
        }
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },
};
