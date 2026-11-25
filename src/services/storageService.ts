import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import { supabase } from './supabase';

/** Nome do bucket público do Supabase Storage usado para fotos e comprovantes. */
export const STORAGE_BUCKET = 'comprovantes';

/**
 * Abre a câmera (ou galeria) e retorna a URI local da imagem escolhida.
 * Retorna null se o usuário cancelar ou negar a permissão.
 *
 * @param source Origem de captura desejada ('camera' ou 'library').
 * @returns URI local do arquivo de imagem ou null em caso de cancelamento/erro.
 */
export async function pickImage(source: 'camera' | 'library'): Promise<string | null> {
  try {
    if (source === 'camera') {
      if (Platform.OS !== 'web') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permissão necessária', 'Permita o acesso à câmera para tirar a foto.');
          return null;
        }
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: false });
      if (result.canceled || !result.assets?.length) return null;
      return result.assets[0].uri;
    }

    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permissão necessária', 'Permita o acesso à galeria para anexar a imagem.');
        return null;
      }
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
 *
 * @param title Título exibido no alerta de seleção de origem (padrão: 'Anexar imagem').
 * @returns URI local da imagem selecionada ou null se cancelado.
 */
export function pickImageWithPrompt(title = 'Anexar imagem'): Promise<string | null> {
  if (Platform.OS === 'web') {
    return pickImage('library');
  }

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
 * Extrai a extensão e MIME type adequados a partir de uma URI local de imagem.
 */
function resolveImageMetadata(uri: string): { ext: string; contentType: string } {
  if (uri.startsWith('data:image/')) {
    const mime = uri.slice(5, uri.indexOf(';')).toLowerCase();
    if (mime === 'image/png') return { ext: 'png', contentType: 'image/png' };
    if (mime === 'image/webp') return { ext: 'webp', contentType: 'image/webp' };
    if (mime === 'image/heic' || mime === 'image/heif') return { ext: 'heic', contentType: 'image/heic' };
    return { ext: 'jpg', contentType: 'image/jpeg' };
  }

  const cleanUri = uri.split('?')[0].split('#')[0];
  const rawExt = cleanUri.includes('.') ? cleanUri.split('.').pop()?.toLowerCase() || '' : '';
  const ext = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(rawExt) ? rawExt : 'jpg';
  const contentType =
    ext === 'png'
      ? 'image/png'
      : ext === 'webp'
      ? 'image/webp'
      : ext === 'heic'
      ? 'image/heic'
      : 'image/jpeg';

  return { ext, contentType };
}

/**
 * Envia uma imagem local para o bucket e retorna a URL pública.
 *
 * @param uri URI local da imagem.
 * @param folder Pasta lógica (ex.: 'tarefas', 'despesas', 'pagamentos').
 * @returns URL pública permanente do arquivo enviado ao Supabase Storage.
 */
export async function uploadImage(uri: string, folder: string): Promise<string> {
  if (!uri || !uri.trim()) {
    throw new Error('Nenhuma imagem selecionada para envio.');
  }

  let buffer: ArrayBuffer;
  if (Platform.OS !== 'web') {
    try {
      const localFile = new File(uri);
      buffer = await localFile.arrayBuffer();
    } catch {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Não foi possível ler a imagem selecionada (HTTP ${response.status}).`);
      }
      buffer = await response.arrayBuffer();
    }
  } else {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Não foi possível ler a imagem selecionada (HTTP ${response.status}).`);
    }
    buffer = await response.arrayBuffer();
  }

  if (!buffer || buffer.byteLength === 0) {
    throw new Error('O arquivo de imagem selecionado está vazio.');
  }

  const { ext, contentType } = resolveImageMetadata(uri);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

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
