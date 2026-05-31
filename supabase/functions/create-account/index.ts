import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json"
};

type SignupPayload = {
  email?: string;
  name?: string;
  password?: string;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Metodo nao permitido." }, 405);
  }

  let payload: SignupPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Dados invalidos." }, 400);
  }

  const email = payload.email?.trim().toLowerCase() ?? "";
  const name = payload.name?.trim() ?? "";
  const password = payload.password ?? "";

  if (!name || !email || !password) {
    return json({ error: "Preencha os campos para continuar." }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "E-mail invalido." }, 400);
  }

  if (password.length < 6) {
    return json({ error: "A senha precisa ter pelo menos 6 caracteres." }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Cadastro indisponivel no momento." }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password,
    user_metadata: { name }
  });

  if (error) {
    return json({ error: translateAdminError(error.message) }, 400);
  }

  if (data.user) {
    await admin.from("profiles").upsert(
      {
        name,
        user_id: data.user.id
      },
      { onConflict: "user_id" }
    );
  }

  return json({ ok: true });
});

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: corsHeaders,
    status
  });
}

function translateAdminError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("already") || normalized.includes("registered")) {
    return "Esse e-mail ja possui cadastro.";
  }
  if (normalized.includes("password")) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  if (normalized.includes("email")) {
    return "E-mail invalido.";
  }
  return "Nao foi possivel criar a conta agora.";
}
