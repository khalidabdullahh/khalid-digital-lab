/**
 * Vercel Serverless Function: GitHub OAuth Login Dispatcher
 * Author: Khalid Abdullah
 */

export default function handler(req, res) {
  let clientId = (process.env.GITHUB_CLIENT_ID || "Ov23lih963qD082N8ktB").trim();
  // Normalize typo if letter O was typed instead of 0
  if (clientId.includes("qDO82")) {
    clientId = clientId.replace("qDO82", "qD082");
  }
  if (!clientId || clientId === "undefined") {
    clientId = "Ov23lih963qD082N8ktB";
  }

  const redirectUri = "https://khalid-digital-lab.vercel.app/api/auth/callback";
  const scope = "repo";
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
  
  res.redirect(302, githubAuthUrl);
}
