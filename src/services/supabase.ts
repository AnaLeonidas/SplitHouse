import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const SECURE_STORE_CHUNK_SIZE = 1800;

async function clearSecureStoreChunks(key: string): Promise<void> {
  try {
    const chunkCountRaw = await SecureStore.getItemAsync(`${key}__chunks`);
    const chunkCount = chunkCountRaw ? parseInt(chunkCountRaw, 10) : 0;
    if (Number.isFinite(chunkCount) && chunkCount > 0) {
      for (let i = 0; i < chunkCount; i++) {
        await SecureStore.deleteItemAsync(`${key}__chunk_${i}`);
      }
    }
    await SecureStore.deleteItemAsync(`${key}__chunks`);
  } catch {
    // Ignore cleanup errors when keystore entries do not exist
  }
}

/**
 * Adaptador de armazenamento para o cliente Supabase.
 * Utiliza o Expo SecureStore em plataformas móveis (iOS/Android) com fragmentação
 * para respeitar o limite de 2 KB por chave, e localStorage no ambiente Web.
 */
const ExpoSecureStoreAdapter = {
  /**
   * Recupera um valor persistido pela chave no armazenamento seguro ou localStorage.
   *
   * @param key Chave do item armazenado.
   * @returns Valor salvo ou null se ausente.
   */
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
      } catch {
        return null;
      }
      return null;
    }

    try {
      const chunkCountRaw = await SecureStore.getItemAsync(`${key}__chunks`);
      if (chunkCountRaw) {
        const chunkCount = parseInt(chunkCountRaw, 10);
        if (Number.isFinite(chunkCount) && chunkCount > 0) {
          const parts: string[] = [];
          for (let i = 0; i < chunkCount; i++) {
            const part = await SecureStore.getItemAsync(`${key}__chunk_${i}`);
            if (part === null) return null;
            parts.push(part);
          }
          return parts.join('');
        }
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  /**
   * Grava um par chave/valor no armazenamento seguro (mobile) ou localStorage (web).
   *
   * @param key Chave de identificação do dado.
   * @param value Conteúdo serializado a persistir.
   */
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
      } catch {
        // Ignore storage quota / security errors on restricted web contexts
      }
      return;
    }

    try {
      await clearSecureStoreChunks(key);
      if (value.length <= SECURE_STORE_CHUNK_SIZE) {
        await SecureStore.setItemAsync(key, value);
        return;
      }

      const chunks: string[] = [];
      for (let i = 0; i < value.length; i += SECURE_STORE_CHUNK_SIZE) {
        chunks.push(value.slice(i, i + SECURE_STORE_CHUNK_SIZE));
      }
      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(`${key}__chunk_${i}`, chunks[i]);
      }
      await SecureStore.setItemAsync(`${key}__chunks`, String(chunks.length));
      await SecureStore.deleteItemAsync(key);
    } catch (err) {
      console.warn('Falha ao salvar sessão no SecureStore:', err);
    }
  },
  /**
   * Remove um item armazenado pela sua chave.
   *
   * @param key Chave do item a excluir.
   */
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
      } catch {
        // Ignore security errors
      }
      return;
    }

    try {
      await clearSecureStoreChunks(key);
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore deletion errors
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/** Indica se as credenciais públicas do Supabase foram carregadas no build */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Aviso: EXPO_PUBLIC_SUPABASE_URL ou EXPO_PUBLIC_SUPABASE_ANON_KEY não foram encontradas no arquivo .env!'
  );
}

/**
 * Instância cliente singleton do Supabase para o SplitHouse.
 * Configurada com persistência de sessão nativa, renovação automática de tokens
 * e integração com os serviços de Auth, Database, Storage e Realtime.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-unconfigured.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);