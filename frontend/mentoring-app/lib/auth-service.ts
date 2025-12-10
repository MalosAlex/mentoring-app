const DEFAULT_API_BASE_URL = "https://localhost:7117/api";
const TOKEN_STORAGE_KEY = "mentoring_app_token";

type StoredToken = {
  token: string;
  expiresAt?: string;
};

type LoginResult = {
  success: boolean;
  token?: string;
  message?: string;
};

type RegisterResult = {
  success: boolean;
  message?: string;
};

type LogoutResult = {
  success: boolean;
  message?: string;
};

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
).replace(/\/$/, "");

const apiRoutes = {
  login: `${API_BASE_URL}/login`,
  register: `${API_BASE_URL}/register`,
  logout: `${API_BASE_URL}/logout`,
};

const getContentType = (response: Response) =>
  response.headers.get("content-type") ?? "";

export const parseErrorMessage = async (response: Response): Promise<string> => {
  const fallback = "Something went wrong. Please try again.";
  const contentType = getContentType(response);

  try {
    if (contentType.includes("application/json")) {
      const data = await response.json();
      if (!data) {
        return fallback;
      }

      if (typeof data === "string") {
        return data;
      }

      if (typeof data?.message === "string") {
        return data.message;
      }

      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        return data.errors.join(", ");
      }
    } else {
      const text = await response.text();
      if (text) {
        return text;
      }
    }
  } catch {
    // ignore parsing errors and fall back to default message
  }

  return fallback;
};

const decodeJwtExpiry = (token: string): string | undefined => {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return undefined;
    }

    const decoded = JSON.parse(atob(payload));
    if (typeof decoded?.exp !== "number") {
      return undefined;
    }

    return new Date(decoded.exp * 1000).toISOString();
  } catch {
    return undefined;
  }
};

export type User = {
  id: string;
  email: string;
  fullName: string;
}

export const getUserFromToken = (token: string): User | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const decoded = JSON.parse(atob(payload));
    return {
      id: decoded.sub || "",
      email: decoded.email || "",
      fullName: decoded.fullName || "",
    };
  } catch {
    return null;
  }
};

const storeToken = (token: string) => {
  if (typeof window === "undefined") {
    return;
  }

  const data: StoredToken = {
    token,
    expiresAt: decodeJwtExpiry(token),
  };

  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(data));
};

export const getStoredToken = (): StoredToken | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: StoredToken = JSON.parse(raw);
    if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const clearToken = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const login = async (
  identifier: string,
  password: string
): Promise<LoginResult> => {
  try {
    const response = await fetch(apiRoutes.login, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        message: await parseErrorMessage(response),
      };
    }

    const data = await response.json();
    const token =
      data?.token ?? data?.Token ?? data?.accessToken ?? data?.AccessToken;

    if (!token || typeof token !== "string") {
      return {
        success: false,
        message: "Authentication token is missing from the response.",
      };
    }

    storeToken(token);

    return {
      success: true,
      token,
    };
  } catch {
    return {
      success: false,
      message: "Unable to reach the server. Please try again later.",
    };
  }
};

export const registerUser = async (payload: {
  fullName: string;
  userName: string;
  email: string;
  password: string;
}): Promise<RegisterResult> => {
  try {
    const response = await fetch(apiRoutes.register, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: payload.fullName,
        username: payload.userName,
        email: payload.email,
        password: payload.password,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        message: await parseErrorMessage(response),
      };
    }

    return {
      success: true,
      message: "Account created successfully.",
    };
  } catch {
    return {
      success: false,
      message: "Unable to reach the server. Please try again later.",
    };
  }
};

export const logout = async (): Promise<LogoutResult> => {
  const stored = getStoredToken();

  if (!stored) {
    clearToken();
    return {
      success: true,
      message: "Logged out.",
    };
  }

  try {
    const response = await fetch(apiRoutes.logout, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stored.token}`,
      },
    });

    clearToken();

    if (!response.ok) {
      return {
        success: false,
        message: await parseErrorMessage(response),
      };
    }

    return {
      success: true,
      message: "Logged out successfully.",
    };
  } catch {
    clearToken();
    return {
      success: false,
      message: "Unable to reach the server. Please try again later.",
    };
  }
};

