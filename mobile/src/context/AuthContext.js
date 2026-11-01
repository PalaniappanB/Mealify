import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY, ROLE_KEY } from '../api/client';
import * as authApi from '../api/auth';
import i18n from '../i18n';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null); // 'customer' | 'partner_staff' | null
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState(null);
  const [booting, setBooting] = useState(true);

  const restore = useCallback(async () => {
    setBooting(true);
    try {
      const [token, savedRole] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(ROLE_KEY)
      ]);
      if (!token || !savedRole) {
        setBooting(false);
        return;
      }
      if (savedRole === 'customer') {
        const me = await authApi.fetchMe();
        setUser(me);
        setRole('customer');
        if (me.preferred_language) i18n.changeLanguage(me.preferred_language);
      } else if (savedRole === 'partner_staff') {
        const me = await authApi.fetchPartnerMe();
        setStaff(me);
        setRole('partner_staff');
      }
    } catch (err) {
      await AsyncStorage.multiRemove([TOKEN_KEY, ROLE_KEY]);
    } finally {
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    restore();
  }, [restore]);

  const persistSession = async (token, sessionRole) => {
    await AsyncStorage.multiSet([[TOKEN_KEY, token], [ROLE_KEY, sessionRole]]);
  };

  const loginCustomer = async (payload) => {
    const { token, user: loggedInUser } = await authApi.login(payload);
    await persistSession(token, 'customer');
    setUser(loggedInUser);
    setRole('customer');
    if (loggedInUser.preferred_language) i18n.changeLanguage(loggedInUser.preferred_language);
    return loggedInUser;
  };

  const signupCustomer = async (payload) => {
    const { token, user: newUser } = await authApi.signup(payload);
    await persistSession(token, 'customer');
    setUser(newUser);
    setRole('customer');
    return newUser;
  };

  const verifyOtpLogin = async (payload) => {
    const { token, user: otpUser } = await authApi.verifyOtp(payload);
    await persistSession(token, 'customer');
    setUser(otpUser);
    setRole('customer');
    return otpUser;
  };

  const loginPartner = async (payload) => {
    const { token, staff: loggedInStaff } = await authApi.partnerLogin(payload);
    await persistSession(token, 'partner_staff');
    setStaff(loggedInStaff);
    setRole('partner_staff');
    return loggedInStaff;
  };

  const signupPartner = async (payload) => {
    const { token, staff: newStaff } = await authApi.partnerSignup(payload);
    await persistSession(token, 'partner_staff');
    setStaff(newStaff);
    setRole('partner_staff');
    return newStaff;
  };

  const updateLanguage = async (lang) => {
    i18n.changeLanguage(lang);
    if (role === 'customer') {
      const updated = await authApi.updateMe({ preferred_language: lang });
      setUser(updated);
    }
  };

  const updateProfile = async (payload) => {
    const updated = await authApi.updateMe(payload);
    setUser(updated);
    return updated;
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, ROLE_KEY]);
    setUser(null);
    setStaff(null);
    setRole(null);
  };

  const value = useMemo(
    () => ({
      role,
      user,
      staff,
      booting,
      isAuthenticated: !!role,
      loginCustomer,
      signupCustomer,
      verifyOtpLogin,
      loginPartner,
      signupPartner,
      updateLanguage,
      updateProfile,
      logout
    }),
    [role, user, staff, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
