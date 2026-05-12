import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { User, Order } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getOrdersForUser, createOrder } from '../services/orders';
import { mapProfileRecord, ProfileRecord } from '../lib/database';

interface AuthContextType {
  user: User | null;
  orders: Order[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  addOrder: (order: Order) => Promise<Order>;
  updateProfile: (profile: Pick<User, 'name' | 'phone' | 'address'>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'bookhouse_user';
const ORDERS_STORAGE_KEY = 'bookhouse_orders';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(() => {
    if (isSupabaseConfigured) {
      return null;
    }
    const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    if (isSupabaseConfigured) {
      return [];
    }
    const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    const supabaseClient = supabase;

    const resolveDisplayName = (authUser: SupabaseAuthUser) =>
      (authUser.user_metadata?.name as string | undefined)?.trim()
      || authUser.email?.split('@')[0]
      || 'User';

    const ensureProfile = async (authUser: SupabaseAuthUser): Promise<User> => {
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (profile) {
        return mapProfileRecord(profile as ProfileRecord);
      }

      const { data: createdProfile, error: createError } = await supabaseClient
        .from('profiles')
        .upsert({
          id: authUser.id,
          email: authUser.email ?? '',
          name: resolveDisplayName(authUser),
          role: 'customer',
        })
        .select('*')
        .single();

      if (createError) {
        throw createError;
      }

      return mapProfileRecord(createdProfile as ProfileRecord);
    };

    const syncUser = async (authUser: SupabaseAuthUser | null) => {
      if (!authUser) {
        setUser(null);
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        const nextUser = await ensureProfile(authUser);
        setUser(nextUser);
      } catch {
        setUser(null);
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        const nextOrders = await getOrdersForUser(authUser.id);
        setOrders(nextOrders);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    supabaseClient.auth.getSession().then(({ data }) => {
      void syncUser(data.session?.user ?? null);
    });

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      void syncUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) {
      return;
    }

    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (isSupabaseConfigured) {
      return;
    }

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      return true;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      role: email === 'admin@bookhouse.com' ? 'admin' : 'customer',
    };
    setUser(mockUser);
    return true;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        throw error;
      }

      return true;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const mockUser: User = {
      id: Date.now().toString(),
      email,
      name,
    };
    setUser(mockUser);
    return true;
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      void supabase.auth.signOut();
      return;
    }

    setUser(null);
  };

  const requestPasswordReset = async (email: string): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Password reset is unavailable');
    }

    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      throw error;
    }
  };

  const updatePassword = async (password: string): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Password update is unavailable');
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      throw error;
    }
  };

  const addOrder = async (order: Order): Promise<Order> => {
    if (isSupabaseConfigured) {
      const createdOrder = await createOrder({
        userId: order.userId,
        items: order.items,
        total: order.total,
        status: order.status,
        shippingInfo: order.shippingInfo,
      });
      setOrders(prev => [createdOrder, ...prev]);
      return createdOrder;
    }

    setOrders(prev => [order, ...prev]);
    return order;
  };

  const updateProfile = async (profile: Pick<User, 'name' | 'phone' | 'address'>): Promise<void> => {
    if (!user) {
      throw new Error('User is not authenticated');
    }

    if (isSupabaseConfigured && supabase) {
      const payload = {
        name: profile.name.trim(),
        phone: profile.phone?.trim() || null,
        address: profile.address?.trim() || null,
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      setUser(mapProfileRecord(data as ProfileRecord));
      return;
    }

    setUser(prev => (prev ? { ...prev, ...profile } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        orders,
        login,
        register,
        requestPasswordReset,
        updatePassword,
        logout,
        isAuthenticated: !!user,
        addOrder,
        updateProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
