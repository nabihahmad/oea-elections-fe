import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface AuthUser {
  id: string;
  username: string;
  fullname: string;
  token: string;
  roles: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const AUTH_TOKEN_COOKIE = "auth:token";
const AUTH_TOKEN_MAX_AGE = 60 * 60 * 24;

const getTokenFromCookie = () => {
  const cookieEntry = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${AUTH_TOKEN_COOKIE}=`));
  return cookieEntry ? decodeURIComponent(cookieEntry.split("=")[1]) : null;
};

const setTokenCookie = (token: string) => {
  const secureFlag = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${AUTH_TOKEN_MAX_AGE}; samesite=lax${secureFlag}`;
};

const clearTokenCookie = () => {
  document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || errData.message || "Failed to load user");
    }

    const data = await response.json();
    const authUser: AuthUser = {
      id: data.admin.id,
      username: data.admin.username,
      fullname: data.admin.full_name,
      token,
      roles: data.admin.roles ?? [],
    };

    setUser(authUser);
  }, []);

  useEffect(() => {
    const token = getTokenFromCookie();
    if (!token || user) {
      setIsInitializing(false);
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setError(null);

    fetchCurrentUser(token)
      .catch((err: any) => {
        if (!isActive) return;
        clearTokenCookie();
        setUser(null);
        setError(err.message || "Failed to restore session");
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
          setIsInitializing(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [fetchCurrentUser, user]);

  const login = useCallback(async (username: string, password: string) => {
    console.log("logging in");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Invalid credentials");
      }

      const data = await response.json();
      
      // Expected response shape:
      const authUser: AuthUser = {
        id: data.admin.id,
        username: data.admin.username,
        fullname: data.admin.full_name,
        token: data.token,
        roles: data.admin.roles ?? [],
      };

      console.log("Login successful, user data:", authUser);
      setTokenCookie(data.token);
      setUser(authUser);
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearTokenCookie();
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isInitializing, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
