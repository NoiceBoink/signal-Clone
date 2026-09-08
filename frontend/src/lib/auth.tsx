"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, api, getAuthToken, setAuthToken } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: { username: string; password: string }) => Promise<User>;
  register: (data: {
    username: string;
    phone: string;
    display_name: string;
    password: string;
  }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const savedToken = getAuthToken();
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      setToken(savedToken);
      const currentUser = await api.getMe();
      setUser(currentUser);
    } catch {
      setAuthToken(null);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (data: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.login(data);
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    username: string;
    phone: string;
    display_name: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
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

