import { Alert, AlertButton, Platform } from 'react-native';

/**
 * Exibe um alerta multiplataforma compatível com Android/iOS (Alert nativo) e Web.
 * No ambiente Web do react-native-web, `Alert.alert` é um no-op silencioso,
 * portanto esta função garante feedback visual e execução dos callbacks de confirmação/navegação.
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  const fullText = message ? `${title}\n\n${message}` : title;
  if (!buttons || buttons.length === 0) {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(fullText);
    }
    return;
  }

  if (buttons.length === 1) {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(fullText);
    }
    buttons[0]?.onPress?.();
    return;
  }

  const cancelBtn = buttons.find((b) => b.style === 'cancel');
  const actionButtons = buttons.filter((b) => b.style !== 'cancel');

  if (actionButtons.length === 1) {
    const confirmed =
      typeof window !== 'undefined' && typeof window.confirm === 'function'
        ? window.confirm(fullText)
        : true;
    if (confirmed) {
      actionButtons[0]?.onPress?.();
    } else {
      cancelBtn?.onPress?.();
    }
    return;
  }

  // Para múltiplos botões não-cancel (ex: Promover / Remover / Cancelar)
  const firstAction = actionButtons[0];
  const secondAction = actionButtons[1];
  if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
    if (window.confirm(`${fullText}\n\n[OK] ${firstAction.text || 'Confirmar'}  |  [Cancelar] Outra opção`)) {
      firstAction?.onPress?.();
    } else if (secondAction && window.confirm(`Deseja executar: ${secondAction.text}?`)) {
      secondAction?.onPress?.();
    } else {
      cancelBtn?.onPress?.();
    }
  }
}
