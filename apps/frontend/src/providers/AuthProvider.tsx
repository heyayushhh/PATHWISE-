"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import type { User, Profile } from "@/types";
import { getMe } from "@/services/auth";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: { user: User; profile: Profile } };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  profile: null,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        profile: null,
        isLoading: false,
      };
    case "SET_USER":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        profile: action.payload.profile,
        isLoading: false,
      };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      (async () => {
        try {
          const res = await getMe();
          if (res.success && res.data) {
            dispatch({ type: "SET_USER", payload: res.data });
          } else {
            dispatch({ type: "LOGOUT" });
          }
        } catch (err) {
          dispatch({ type: "LOGOUT" });
        }
      })();
    } else {
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const login = (user: User, accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    dispatch({ type: "LOGIN_SUCCESS", payload: { user, accessToken, refreshToken } });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
