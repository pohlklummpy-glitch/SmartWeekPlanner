// ─── Email via Brevo (Sendinblue) API ─────────────────────────────────────────
// 300 Emails/Tag kostenlos, keine eigene Domain nötig

const BREVO_API_KEY = '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';
const FROM_EMAIL    = 'noreply.timeplanner@gmail.com';
const FROM_NAME     = 'Smart Week Planner';
const BREVO_API     = 'https://api.brevo.com/v3/smtp/email';

// ─── Generate 6-digit code ────────────────────────────────────────────────────
export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Build HTML email ─────────────────────────────────────────────────────────
function buildEmailHtml(toName, code) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0C0C14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0C0C14;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#13131E;border-radius:20px;border:1px solid #22223A;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6E5CF6 0%,#8B5CF6 100%);padding:36px 32px;text-align:center;">
            <div style="font-size:40px;margin-bottom:12px;">📅</div>
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Smart Week Planner</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Email Bestätigung</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            <p style="margin:0 0 6px;color:#8080A8;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">Hallo ${toName},</p>
            <p style="margin:0 0 28px;color:#EEEEFF;font-size:15px;line-height:1.7;">
              Gib diesen Code in der App ein um dein Account zu bestätigen:
            </p>

            <!-- Code box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td align="center" style="background:#1A1A2A;border:2px solid #6E5CF6;border-radius:16px;padding:28px 20px;">
                  <div style="letter-spacing:14px;font-size:40px;font-weight:900;color:#6E5CF6;font-family:'Courier New',monospace;padding-left:14px;">${code}</div>
                  <p style="margin:12px 0 0;color:#404060;font-size:12px;">Gültig für 10 Minuten · Nicht weitergeben</p>
                </td>
              </tr>
            </table>

            <!-- Info -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#1A1A2A;border-radius:12px;padding:16px 18px;border-left:3px solid #6E5CF6;">
                  <p style="margin:0;color:#8080A8;font-size:13px;line-height:1.6;">
                    Falls du dich nicht bei Smart Week Planner registriert hast, kannst du diese Email ignorieren.
                  </p>
                </td>
              </tr>
            </table>

            <!-- Footer -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-top:1px solid #22223A;padding-top:20px;text-align:center;">
                  <p style="margin:0;color:#404060;font-size:12px;">Smart Week Planner · Your week. Your pace.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Send verification email ──────────────────────────────────────────────────
export async function sendVerificationEmail(toEmail, toName, code) {
  try {
    const res = await fetch(BREVO_API, {
      method: 'POST',
      headers: {
        'accept':       'application/json',
        'api-key':      BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender:  { name: FROM_NAME, email: FROM_EMAIL },
        to:      [{ email: toEmail, name: toName || toEmail }],
        subject: 'Dein Bestätigungscode – Smart Week Planner',
        htmlContent: buildEmailHtml(toName || toEmail, code),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || `Error ${res.status}`);
    }

    return { ok: true };
  } catch (e) {
    console.error('sendVerificationEmail:', e);
    throw new Error('Email konnte nicht gesendet werden. Bitte versuche es erneut.');
  }
}
