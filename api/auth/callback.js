/**
 * Vercel Serverless Function: GitHub OAuth Callback Handler
 * Author: Khalid Abdullah
 */

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Auth Error</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="font-family:monospace;background:#050811;color:#fff;display:flex;align-items:center;justify-content:center;height:90vh;padding:20px;text-align:center;">
        <div style="max-width:500px;background:#0c1220;border:1px solid #ff0055;padding:30px;border-radius:16px;">
          <h2 style="color:#ff0055;">⚠️ Authorization Code Missing</h2>
          <p style="color:#aaa;font-size:13px;">GitHub did not provide an authorization code in the callback.</p>
          <a href="/admin.html" style="color:#00f0ff;text-decoration:none;font-weight:bold;display:inline-block;margin-top:15px;">← Return to Admin Studio</a>
        </div>
      </body>
      </html>
    `);
  }

  let clientId = (process.env.GITHUB_CLIENT_ID || "Ov23lih963qD082N8ktB").trim();
  if (clientId.includes("qDO82")) {
    clientId = clientId.replace("qDO82", "qD082");
  }
  if (!clientId || clientId === "undefined") {
    clientId = "Ov23lih963qD082N8ktB";
  }

  const clientSecret = process.env.GITHUB_CLIENT_SECRET ? process.env.GITHUB_CLIENT_SECRET.trim() : "";

  if (!clientSecret) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Vercel Config Required</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="font-family:monospace;background:#050811;color:#fff;display:flex;align-items:center;justify-content:center;height:90vh;padding:20px;text-align:center;">
        <div style="max-width:520px;background:#0c1220;border:1px solid #ffaa00;padding:30px;border-radius:16px;">
          <h2 style="color:#ffaa00;">⚙️ GITHUB_CLIENT_SECRET Missing in Vercel</h2>
          <p style="color:#ccc;font-size:13px;line-height:1.6;">
            Please add <code>GITHUB_CLIENT_SECRET</code> in Vercel Project Settings &rarr; Environment Variables.
          </p>
          <div style="margin-top:20px;">
            <a href="/admin.html" style="background:#00f0ff;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;display:inline-block;">
              Use Direct PAT Login Instead →
            </a>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const tokenData = await tokenRes.json();
    if (tokenData.access_token) {
      const host = req.headers["x-forwarded-host"] || req.headers.host || "khalid-digital-lab.vercel.app";
      const proto = req.headers["x-forwarded-proto"] || "https";
      const redirectUrl = `${proto}://${host}/admin.html?token=${encodeURIComponent(tokenData.access_token)}`;
      
      return res.redirect(302, redirectUrl);
    } else {
      return res.status(401).send(`
        <!DOCTYPE html>
        <html>
        <head><title>OAuth Exchange Failed</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="font-family:monospace;background:#050811;color:#fff;display:flex;align-items:center;justify-content:center;height:90vh;padding:20px;text-align:center;">
          <div style="max-width:500px;background:#0c1220;border:1px solid #ff0055;padding:30px;border-radius:16px;">
            <h2 style="color:#ff0055;">❌ GitHub Token Exchange Failed</h2>
            <p style="color:#ccc;font-size:13px;">${tokenData.error_description || tokenData.error || "GitHub rejected the client secret or code."}</p>
            <a href="/admin.html" style="color:#00f0ff;text-decoration:none;font-weight:bold;display:inline-block;margin-top:15px;">← Return to Admin Studio</a>
          </div>
        </body>
        </html>
      `);
    }
  } catch (err) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Server Error</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="font-family:monospace;background:#050811;color:#fff;display:flex;align-items:center;justify-content:center;height:90vh;padding:20px;text-align:center;">
        <div style="max-width:500px;background:#0c1220;border:1px solid #ff0055;padding:30px;border-radius:16px;">
          <h2 style="color:#ff0055;">⚠️ Server Error</h2>
          <p style="color:#ccc;font-size:13px;">${err.message}</p>
          <a href="/admin.html" style="color:#00f0ff;text-decoration:none;font-weight:bold;display:inline-block;margin-top:15px;">← Return to Admin Studio</a>
        </div>
      </body>
      </html>
    `);
  }
}
