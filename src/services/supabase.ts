import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

/**
 * Adaptador de armazenamento para o cliente Supabase.
 * Utiliza o Expo SecureStore em plataformas móveis (iOS/Android) e
 * localStorage no ambiente Web para persistência de sessão.
 */
const ExpoSecureStoreAdapter = {
  /**
   * Recupera um valor persistido pela chave no armazenamento seguro ou localStorage.
   *
   * @param key Chave do item armazenado.
   * @returns Valor salvo ou null se ausente.
   */
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    }
    return SecureStore.getItemAsync(key);
  },
  /**
   * Grava um par chave/valor no armazenamento seguro (mobile) ou localStorage (web).
   *
   * @param key Chave de identificação do dado.
   * @param value Conteúdo serializado a persistir.
   */
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      return;
    }
    SecureStore.setItemAsync(key, value);
  },
  /**
   * Remove um item armazenado pela sua chave.
   *
   * @param key Chave do item a excluir.
   */
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      return;
    }
    SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Aviso: EXPO_PUBLIC_SUPABASE_URL ou EXPO_PUBLIC_SUPABASE_ANON_KEY não foram encontradas no arquivo .env!'
  );
}

/**
 * Instância cliente singleton do Supabase para o SplitHouse.
 * Configurada com persistência de sessão nativa, renovação automática de tokens
 * e integração com os serviços de Auth, Database, Storage e Realtime.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});