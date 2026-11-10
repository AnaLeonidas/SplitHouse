const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Lógica de Confirmação de E-mail e Recuperação de Senha', () => {
  it('Deve identificar corretamente erros de e-mail não confirmado', () => {
    const error1 = { message: 'Email not confirmed' };
    const error2 = { code: 'email_not_confirmed', message: 'User email is not confirmed' };
    const error3 = { message: 'Invalid login credentials' };

    const isUnconfirmed = (err) =>
      (err?.message && err.message.includes('Email not confirmed')) ||
      err?.code === 'email_not_confirmed';

    assert.strictEqual(isUnconfirmed(error1), true);
    assert.strictEqual(isUnconfirmed(error2), true);
    assert.strictEqual(isUnconfirmed(error3), false);
  });

  it('Deve identificar e rotear deep links de recuperação de senha', () => {
    const link1 = 'splithouse://reset-password#access_token=xyz&type=recovery';
    const link2 = 'exp://192.168.1.5:8081/--/reset-password';
    const link3 = 'https://splithouse.app/auth?type=recovery';
    const linkNormal = 'splithouse://home';

    const isRecoveryLink = (url) =>
      url.includes('reset-password') || url.includes('type=recovery');

    assert.strictEqual(isRecoveryLink(link1), true);
    assert.strictEqual(isRecoveryLink(link2), true);
    assert.strictEqual(isRecoveryLink(link3), true);
    assert.strictEqual(isRecoveryLink(linkNormal), false);
  });

  it('Deve identificar e rotear deep links de ativação de e-mail', () => {
    const link1 = 'splithouse://confirm-email#access_token=xyz&type=signup';
    const link2 = 'https://supabase.co/auth/v1/verify?type=email&token=123';
    const linkNormal = 'splithouse://login';

    const isConfirmEmailLink = (url) =>
      url.includes('confirm-email') ||
      url.includes('type=signup') ||
      url.includes('type=email');

    assert.strictEqual(isConfirmEmailLink(link1), true);
    assert.strictEqual(isConfirmEmailLink(link2), true);
    assert.strictEqual(isConfirmEmailLink(linkNormal), false);
  });

  it('Deve validar tamanho mínimo de senha e confirmação de senha', () => {
    const validate = (pass, confirm) => {
      if (!pass || pass.length < 6) return 'Tamanho mínimo de 6 caracteres';
      if (pass !== confirm) return 'Senhas não conferem';
      return 'OK';
    };

    assert.strictEqual(validate('123', '123'), 'Tamanho mínimo de 6 caracteres');
    assert.strictEqual(validate('123456', '654321'), 'Senhas não conferem');
    assert.strictEqual(validate('minhasenha123', 'minhasenha123'), 'OK');
  });

  it('Deve determinar se sessão ativa dispensa o preenchimento manual do token OTP', () => {
    const requiresToken = (hasActiveSession, token) => {
      if (hasActiveSession) return true; // sessão já autorizada
      return Boolean(token && token.trim().length >= 6);
    };

    assert.strictEqual(requiresToken(true, ''), true);
    assert.strictEqual(requiresToken(false, ''), false);
    assert.strictEqual(requiresToken(false, '123456'), true);
  });
});
