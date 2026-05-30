# RAIZ Endometriose

MVP mobile nativo do Método RAIZ, criado com Expo, React Native, TypeScript e `expo-router`.

## Rodar localmente

```bash
npm install
npm run start
```

Depois, abra no Expo Go pelo QR Code ou use as opções do terminal para iOS, Android ou web.

## Usar como app sem loja

O projeto está preparado como PWA. Depois de publicar a versão web em HTTPS, a usuária pode abrir o link no celular e adicionar à tela inicial.

- iPhone: abrir no Safari, tocar em Compartilhar e escolher "Adicionar à Tela de Início".
- Android: abrir no Chrome e escolher "Instalar app" ou "Adicionar à tela inicial".

Para funcionar como PWA em produção, publique o conteúdo web com HTTPS e mantenha `manifest.webmanifest`, `sw.js` e os ícones disponíveis na raiz do site.

## Produção

URL publicada:

```text
https://raiz-endometriose.vercel.app
```

Backend:

- Supabase Auth para login e senha.
- Supabase Postgres para `profiles`, `daily_entries`, `reminder_settings` e `doctor_reports`.
- Row Level Security ativo para que cada usuária acesse apenas os próprios dados.

## Verificações

```bash
npm run typecheck
npm run export:web
```

## Escopo do MVP

- Abas: Hoje, Registrar, Plano RAIZ, Evolução e Cuidado.
- Login e senha com Supabase Auth.
- Dados sincronizados no Supabase quando a usuaria está logada, com fallback local no dispositivo.
- Regras educativas para risco de crise e próximo passo.
- Conteúdo informativo, sem diagnóstico, prescrição ou substituição de acompanhamento profissional.
