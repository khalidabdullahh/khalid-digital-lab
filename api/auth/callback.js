/**
 * Vercel Serverless Function: GitHub OAuth Callback Handler
 * Author: Khalid Abdullah
 */

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("Authorization code missing from GitHub.");
  }

  const clientId = process.env.GITHUB_CLIENT_ID || "Ov23lih963qD082N8ktB";
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientSecret) {
    return res.status(500).send("GITHUB_CLIENT_SECRET environment variable is missing in Vercel settings.");
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
      return res.status(401).send(`GitHub OAuth Error: ${tokenData.error_description || "Token exchange failed."}`);
    }
  } catch (err) {
    return res.status(500).send(`Authentication error: ${err.message}`);
  }
}
