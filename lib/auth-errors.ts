const AUTH_ERROR_MAP: Record<string, string> = {
  'invalid login credentials': 'E-mail ou senha incorretos.',
  'invalid email or password': 'E-mail ou senha incorretos.',
  'email not confirmed': 'E-mail ainda não confirmado. Verifique sua caixa de entrada.',
  'user not found': 'Nenhuma conta encontrada com esse e-mail.',
  'user already registered': 'Este e-mail já está cadastrado.',
  'email already in use': 'Este e-mail já está cadastrado.',
  'password should be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres.',
  'weak password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
  'too many requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'email rate limit exceeded': 'Limite de envio de e-mail atingido. Tente novamente mais tarde.',
  'signup disabled': 'Cadastro desabilitado no momento.',
  'email link is invalid or has expired': 'O link expirou ou já foi usado. Solicite um novo.',
  'token has expired or is invalid': 'O link expirou ou já foi usado. Solicite um novo.',
  'network request failed': 'Sem conexão. Verifique sua internet e tente novamente.',
};

export function translateAuthError(message: string): string {
  const key = message.toLowerCase().trim();
  for (const [pattern, translation] of Object.entries(AUTH_ERROR_MAP)) {
    if (key.includes(pattern)) return translation;
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}
