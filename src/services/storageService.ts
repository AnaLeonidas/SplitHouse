import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { supabase } from './supabase';

/** Nome do bucket público do Supabase Storage usado para fotos e comprovantes. */
export const STORAGE_BUCKET = 'comprovantes';

/**
 * Abre a câmera (ou galeria) e retorna a URI local da imagem escolhida.
 * Retorna null se o usuário cancelar ou negar a permissão.
 */
export async function pickImage(source: 'camera' | 'library'): Promise<string | null> {
  try {
    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permissão necessária', 'Permita o acesso à câmera para tirar a foto.');
        return null;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: false });
      if (result.canceled || !result.assets?.length) return null;
      return result.assets[0].uri;
    }

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para anexar a imagem.');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    });
    if (result.canceled || !result.assets?.length) return null;
    return result.assets[0].uri;
  } catch (err) {
    Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível abrir a imagem.');
    return null;
  }
}

/**
 * Pergunta ao usuário se deseja usar a câmera ou a galeria e retorna a URI escolhida.
 */
export function pickImageWithPrompt(title = 'Anexar imagem'): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      'De onde deseja obter a imagem?',
      [
        { text: 'Câmera', onPress: async () => resolve(await pickImage('camera')) },
        { text: 'Galeria', onPress: async () => resolve(await pickImage('library')) },
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
}

/**
 * Envia uma imagem local para o bucket e retorna a URL pública.
 *
 * @param uri URI local da imagem.
 * @param folder Pasta lógica (ex.: 'tarefas', 'despesas', 'pagamentos').
 */
export async function uploadImage(uri: string, folder: string): Promise<string> {
  const response = await fetch(uri);
  const buffer = await response.arrayBuffer();
  const ext = (uri.split('?')[0].split('.').pop() || 'jpg').toLowerCase();
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext) ? ext : 'jpg';
  const contentType = safeExt === 'png' ? 'image/png' : safeExt === 'webp' ? 'image/webp' : 'image/jpeg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  });
  if (error) {
    throw new Error(`Falha no envio da imagem: ${error.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
