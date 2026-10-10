"use strict";

const GOOGLE_WEB_CLIENT_ID =
  "204207878528-k5jlbmusgn0q0e2dcfkm22k2colpjuur.apps.googleusercontent.com";
const DELETE_ENDPOINT =
  "https://bakalim-api.onrender.com/api/v1/account/deletion-requests";

function setStatus(message, kind) {
  const node = document.getElementById("delete-status");
  node.textContent = message;
  node.className = "status" + (kind ? " " + kind : "");
}

async function handleGoogleCredential(response) {
  const confirmed = document.getElementById("confirm-delete").checked;
  if (!confirmed) {
    setStatus("Devam etmek için kalıcı silme onay kutusunu işaretleyin.", "error");
    return;
  }
  if (!response || !response.credential) {
    setStatus("Google kimliği doğrulanamadı. Lütfen tekrar deneyin.", "error");
    return;
  }
  setStatus("Kimlik doğrulanıyor ve silme talebi işleniyor…", "");
  try {
    const result = await fetch(DELETE_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "GOOGLE", identity_token: response.credential }),
    });
    if (result.status === 202) {
      setStatus("Talep kabul edildi. Hesap mevcutsa ilişkili veriler silindi.", "success");
      document.getElementById("confirm-delete").disabled = true;
      return;
    }
    if (result.status === 401) {
      setStatus("Kimlik doğrulaması geçersiz veya süresi dolmuş. Lütfen tekrar giriş yapın.", "error");
      return;
    }
    setStatus("Talep şu anda tamamlanamadı. Lütfen daha sonra tekrar deneyin.", "error");
  } catch (_) {
    setStatus("Güvenli bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.", "error");
  }
}

window.addEventListener("load", function () {
  if (!window.google || !google.accounts || !google.accounts.id) {
    setStatus("Google doğrulama hizmeti yüklenemedi. Lütfen daha sonra tekrar deneyin.", "error");
    return;
  }
  google.accounts.id.initialize({
    client_id: GOOGLE_WEB_CLIENT_ID,
    callback: handleGoogleCredential,
    auto_select: false,
    cancel_on_tap_outside: true,
  });
  google.accounts.id.renderButton(document.getElementById("google-signin"), {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "rectangular",
  });
});
