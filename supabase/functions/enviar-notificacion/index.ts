
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const FCM_SCOPE =
  "https://www.googleapis.com/auth/firebase.messaging";

const TOKEN_URL = "https://oauth2.googleapis.com/token";

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function encodeJson(value: unknown): string {
  return base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(value))
  );
}

async function obtenerTokenGoogle(
  cuenta: Record<string, string>
): Promise<string> {
  const ahora = Math.floor(Date.now() / 1000);

  const encabezado = encodeJson({
    alg: "RS256",
    typ: "JWT",
    kid: cuenta.private_key_id
  });

  const contenido = encodeJson({
    iss: cuenta.client_email,
    scope: FCM_SCOPE,
    aud: TOKEN_URL,
    iat: ahora,
    exp: ahora + 3600
  });

  const mensaje = `${encabezado}.${contenido}`;

  const pem = cuenta.private_key.replace(/\\n/g, "\n");

  const claveBase64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const claveBytes = Uint8Array.from(
    atob(claveBase64),
    (caracter) => caracter.charCodeAt(0)
  );

  const clave = await crypto.subtle.importKey(
    "pkcs8",
    claveBytes.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const firma = new Uint8Array(
    await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      clave,
      new TextEncoder().encode(mensaje)
    )
  );

  const assertion =
    `${mensaje}.${base64UrlEncode(firma)}`;

  const respuesta = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type:
        "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });

  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error("No se pudo obtener el token OAuth de Google.");
  }

  return resultado.access_token;
}

async function enviarFCM(
  proyectoId: string,
  tokenAcceso: string,
  tokenDispositivo: string,
  titulo: string,
  cuerpo: string,
  chatId: string,
  mensajeId: string,
  tipo: string
): Promise<boolean> {
  const respuesta = await fetch(
    `https://fcm.googleapis.com/v1/projects/${proyectoId}/messages:send`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokenAcceso}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: {
          token: tokenDispositivo,
          notification: {
            title: titulo,
            body: cuerpo
          },
          data: {
            chat_id: chatId,
            message_id: mensajeId,
            tipo
          }
        }
      })
    }
  );

  if (!respuesta.ok) {
    console.error(
      "Error FCM:",
      respuesta.status,
      await respuesta.text()
    );
    return false;
  }

  return true;
}

export default {
  fetch: withSupabase(
    { auth: "user" },
    async (req, ctx) => {
      try {
        if (req.method !== "POST") {
          return Response.json(
            { error: "Método no permitido." },
            { status: 405 }
          );
        }

        const usuarioId = ctx.userClaims?.id;

        if (!usuarioId) {
          return Response.json(
            { error: "Usuario no autenticado." },
            { status: 401 }
          );
        }

        const { chat_id, message_id } = await req.json();

        if (
          typeof chat_id !== "string" ||
          typeof message_id !== "string"
        ) {
          return Response.json(
            { error: "chat_id y message_id son obligatorios." },
            { status: 400 }
          );
        }

        const admin = ctx.supabaseAdmin;

        // Verificar que el mensaje exista y pertenezca
        // al usuario que realiza la solicitud.
        const { data: mensaje, error: errorMensaje } =
          await admin
            .from("messages")
            .select("id, chat_id, sender_id, contenido, tipo")
            .eq("id", message_id)
            .eq("chat_id", chat_id)
            .eq("sender_id", usuarioId)
            .single();

        if (errorMensaje || !mensaje) {
          return Response.json(
            { error: "Mensaje no encontrado o no autorizado." },
            { status: 403 }
          );
        }

        // Obtener los participantes del chat.
        const { data: participantes, error: errorParticipantes } =
          await admin
            .from("chat_participants")
            .select("user_id")
            .eq("chat_id", chat_id);

        if (errorParticipantes) {
          throw errorParticipantes;
        }

        const usuarios = [
          ...new Set(
            (participantes ?? [])
              .map((p) => p.user_id)
              .filter((id) => id !== usuarioId)
          )
        ];

        if (!usuarios.length) {
          return Response.json({
            success: true,
            enviados: 0,
            mensaje: "No hay otros participantes."
          });
        }

        // Recuperar tokens de los demás participantes.
        const { data: dispositivos, error: errorTokens } =
          await admin
            .from("fcm_tokens")
            .select("token")
            .in("user_id", usuarios);

        if (errorTokens) {
          throw errorTokens;
        }

        if (!dispositivos?.length) {
          return Response.json({
            success: true,
            enviados: 0,
            mensaje: "Los destinatarios no tienen tokens FCM registrados."
          });
        }

        const cuentaJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");

        if (!cuentaJson) {
          throw new Error("Falta configurar FIREBASE_SERVICE_ACCOUNT.");
        }

        const cuenta = JSON.parse(cuentaJson);
        const proyectoId = cuenta.project_id;

        if (!proyectoId || !cuenta.private_key || !cuenta.client_email) {
          throw new Error("La cuenta de servicio de Firebase no es válida.");
        }

        const tokenAcceso = await obtenerTokenGoogle(cuenta);

        const titulo = "Nuevo mensaje";

        const cuerpo =
          mensaje.contenido?.trim() ||
          (mensaje.tipo === "imagen"
            ? "Te enviaron una imagen."
            : mensaje.tipo === "archivo"
              ? "Te enviaron un archivo."
              : mensaje.tipo === "ubicacion"
                ? "Te compartieron una ubicación."
                : "Tienes un nuevo mensaje.");

        const resultados = await Promise.all(
          dispositivos.map((dispositivo) =>
            enviarFCM(
              proyectoId,
              tokenAcceso,
              dispositivo.token,
              titulo,
              cuerpo.slice(0, 180),
              chat_id,
              message_id,
              mensaje.tipo
            )
          )
        );

        const enviados = resultados.filter(Boolean).length;
        const fallidos = resultados.length - enviados;

        return Response.json({
          success: true,
          enviados,
          fallidos,
          total: resultados.length
        });

      } catch (error) {
        console.error("Error en enviar-notificacion:", error);

        return Response.json(
          { error: "No se pudo procesar el envío de notificaciones." },
          { status: 500 }
        );
      }
    }
  )
};
