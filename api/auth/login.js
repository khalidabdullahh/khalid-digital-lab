/**
 * Vercel Serverless Function: GitHub OAuth Login Dispatcher
 * Author: Khalid Abdullah
 */

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID || "Ov23lih963qD082N8ktB";
  const redirectUri = "https://khalid-digital-lab.vercel.app/api/auth/callback";
  const scope = "repo";
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
  
  res.redirect(302, githubAuthUrl);
}
