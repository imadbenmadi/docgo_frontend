import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import apiClient from "./utils/apiClient";
import {
  getApiErrorMessage,
  translateApiError,
} from "./utils/apiErrorTranslate";

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

const initialState = {
  isAuth: false,
  userId: null,
  userType: null,
  user: null,
  Notifications: null,
  loading: true,
  // App-wide public data fetched once on startup
  siteSettings: null, // { brandName, logoUrl, logoUpdatedAt }
  contactInfo: null, // { phone, email, facebook, - }
  homePageContent: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOGOUT":
      return {
        ...state,
        isAuth: false,
        userId: null,
        userType: null,
        user: null,
      };
    case "SET_AUTH":
      return {
        ...state,
        isAuth: action.payload,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuth: !!action.payload,
        userId: action.payload?.id || null,
        userType: action.payload?.userType || null,
      };
    case "SET_NOTIFICATIONS":
      return {
        ...state,
        Notifications: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_APP_DATA":
      return {
        ...state,
        siteSettings: action.payload.siteSettings ?? state.siteSettings,
        contactInfo: action.payload.contactInfo ?? state.contactInfo,
        homePageContent:
          action.payload.homePageContent ?? state.homePageContent,
      };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Configure axios defaults (avoid doing this on every render)
  useEffect(() => {
    apiClient.defaults.withCredentials = true;
    delete apiClient.defaults.headers.common["X-Dev-Auth-UserId"];
  }, []);

  const set_Auth = useCallback(
    (isAuth) => {
      dispatch({ type: "SET_AUTH", payload: isAuth });
    },
    [dispatch],
  );

  const store_logout = useCallback(async () => {
    try {
      await apiClient.post("/Logout");
    } catch (error) {
    } finally {
      try {
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        // Keep _appSiteData - it's public data not tied to user session
      } catch {
        // ignore storage errors
      }
      dispatch({ type: "LOGOUT" });
    }
  }, [dispatch]);

  const set_user = useCallback(
    (user) => {
      dispatch({ type: "SET_USER", payload: user });
    },
    [dispatch],
  );

  const updateUserProfile = useCallback(
    (partialUser) => {
      const mergedUser = {
        ...(state.user || {}),
        ...(partialUser || {}),
      };

      dispatch({ type: "SET_USER", payload: mergedUser });
      try {
        localStorage.setItem("user", JSON.stringify(mergedUser));
        sessionStorage.setItem("user", JSON.stringify(mergedUser));
      } catch {
        // ignore storage errors
      }
    },
    [state.user],
  );

  const set_Notifications = useCallback(
    (Notifications) => {
      dispatch({
        type: "SET_NOTIFICATIONS",
        payload: Notifications,
      });
    },
    [dispatch],
  );

  const setLoading = useCallback(
    (loading) => {
      dispatch({ type: "SET_LOADING", payload: loading });
    },
    [dispatch],
  );

  const setAppData = useCallback(
    (payload) => {
      dispatch({ type: "SET_APP_DATA", payload });
    },
    [dispatch],
  );

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);

      // Serve cached site data instantly so navbar/footer render immediately
      // Cache TTL: 2 minutes - re-fetch after that so dashboard changes propagate
      const SITE_CACHE_TTL_MS = 2 * 60 * 1000;
      let cachedSiteRaw = null;
      let cacheIsValid = false;
      try {
        cachedSiteRaw = sessionStorage.getItem("_appSiteData");
      } catch {}
      if (cachedSiteRaw) {
        try {
          const cached = JSON.parse(cachedSiteRaw);
          const age = Date.now() - (cached._fetchedAt || 0);
          cacheIsValid = age < SITE_CACHE_TTL_MS;
          if (cacheIsValid) {
            setAppData({
              siteSettings: cached.siteSettings,
              contactInfo: cached.contactInfo,
              homePageContent: cached.homePageContent,
            });
          }
        } catch {}
      }

      // Fire auth check AND site-settings in parallel - single round-trip cost
      const [authResult, siteResult] = await Promise.allSettled([
        apiClient.get("/check_Auth", {
          validateStatus: () => true,
        }),
        // Only skip refetch if cache is still fresh
        cacheIsValid
          ? Promise.resolve(null)
          : apiClient.get("/public/site-settings", {
              validateStatus: () => true,
            }),
      ]);

      // - Auth -
      if (authResult.status === "fulfilled") {
        const r = authResult.value;
        if (r?.status === 200 && r.data?.user) {
          set_user(r.data.user);
          localStorage.setItem("user", JSON.stringify(r.data.user));
          sessionStorage.setItem("user", JSON.stringify(r.data.user));
        } else {
          set_user(null);
          localStorage.removeItem("user");
          sessionStorage.removeItem("user");
        }
      } else {
        set_user(null);
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
      }

      // - Site / branding data -
      if (siteResult.status === "fulfilled" && siteResult.value) {
        const sd = siteResult.value?.data;
        if (sd && sd.success !== false) {
          const s = sd.settings || {};
          const siteSettings = {
            brandName: s.brandName || null,
            logoUrl: s.logoUrl || null,
            logoUpdatedAt: s.logoUpdatedAt || null,
          };
          const contactInfo = s.contact || {};
          const homePageContent = sd.homePageContent || null;
          setAppData({ siteSettings, contactInfo, homePageContent });
          // Cache so next navigate doesn't re-fetch (TTL applied on read)
          try {
            sessionStorage.setItem(
              "_appSiteData",
              JSON.stringify({
                siteSettings,
                contactInfo,
                homePageContent,
                _fetchedAt: Date.now(),
              }),
            );
          } catch {}
        }
      }

      return (
        authResult.status === "fulfilled" &&
        authResult.value?.status === 200 &&
        !!authResult.value?.data?.user
      );
    } catch (error) {
      set_user(null);
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, set_user, setAppData]);

  const login = useCallback(
    async (credentials) => {
      try {
        const response = await apiClient.post("/Login", credentials, {
          validateStatus: () => true,
        });

        if (response.status === 200 && response.data.user) {
          // Normalize user shape: backend returns userId/userType at the top level.
          const normalizedUser = {
            ...response.data.user,
            id: response.data.user?.id ?? response.data.userId,
            userType: response.data.user?.userType ?? response.data.userType,
          };
          set_user(normalizedUser);
          localStorage.setItem("user", JSON.stringify(normalizedUser));
          sessionStorage.setItem("user", JSON.stringify(normalizedUser));
          set_Auth(true);
          return { success: true, user: normalizedUser };
        } else {
          if (
            response.status === 403 &&
            (response.data?.code === "USER_BLOCKED" ||
              String(response.data?.message || "")
                .toLowerCase()
                .includes("blocked"))
          ) {
            return {
              success: false,
              blocked: true,
              message:
                response.data?.message || "Your account has been blocked",
            };
          } else if (
            response.status === 403 &&
            (response.data?.code === "USER_DELETED" ||
              String(response.data?.message || "")
                .toLowerCase()
                .includes("removed"))
          ) {
            return {
              success: false,
              deleted: true,
              message:
                response.data?.message || "Your account has been removed",
            };
          }
          return {
            success: false,
            message:
              translateApiError(response.data?.message) || "Login failed",
          };
        }
      } catch (error) {
        return {
          success: false,
          message: getApiErrorMessage(error),
        };
      }
    },
    [set_Auth, set_user],
  );

  const register = useCallback(async (userData) => {
    try {
      const response = await apiClient.post("/Register", userData, {
        validateStatus: () => true,
      });

      if (response.status === 200) {
        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          message:
            translateApiError(response.data?.message) || "Registration failed",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error) || "Registration failed",
      };
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const AppContextValue = useMemo(
    () => ({
      ...state,
      set_Notifications,
      store_logout,
      set_Auth,
      set_user,
      updateUserProfile,
      checkAuthStatus,
      login,
      register,
      isAuthenticated: state.isAuth,
    }),
    [
      state,
      set_Notifications,
      store_logout,
      set_Auth,
      set_user,
      updateUserProfile,
      checkAuthStatus,
      login,
      register,
    ],
  );

  return (
    <AppContext.Provider value={AppContextValue}>
      {children}
    </AppContext.Provider>
  );
};
