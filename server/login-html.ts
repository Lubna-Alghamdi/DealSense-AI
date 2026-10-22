const LOGO_URL =
  "https://cdn.builder.io/api/v1/image/assets%2Fa9b10afc88c54a1485913eb386474032%2F603f781baa244e5381e72d059c3c9ace?format=webp&width=800&height=1200";

export const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DealSense AI</title>
<script>
(function(){
  var stored=null;
  try{stored=localStorage.getItem("theme")}catch(e){}
  var dark=stored==="light"?false:stored==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches:true;
  document.documentElement.classList.toggle("dark",dark);
})();
</script>
<style>
:root{--bg:#fff;--fg:#0f172a;--muted:#64748b;--card:#fff;--border:#cbd5e1}
.dark{--bg:#0f172a;--fg:#f8fafc;--muted:#94a3b8;--card:#1e293b;--border:#334155}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow-x:hidden}
body{font-family:Inter,system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--fg)}
.page{position:relative;min-height:100vh;overflow:hidden;display:grid;grid-template-columns:1fr}
.promo{display:none;position:absolute;z-index:0;inset:0 auto 0 0;width:50%;overflow:hidden;background:linear-gradient(160deg,#1e3a8a 0%,#2563eb 60%,#60a5fa 100%);color:#fff}
.promo>.wave{position:absolute;inset-block:0;right:-4px;height:100%;width:calc(40% + 4px);color:var(--bg)}
.promo-content{position:relative;z-index:1;padding-left:64px;height:100%;display:flex;flex-direction:column;justify-content:center;gap:48px}
.promo-title p{margin:0 0 8px;font-size:16px;font-weight:500}
.promo-title h2{margin:0;font-size:36px;line-height:1.2;font-weight:600}
.features{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:24px}
.features li{display:flex;align-items:center;gap:12px}
.icon{width:40px;height:40px;border-radius:8px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center}
.features strong{display:block;font-weight:600}
.desc{font-size:12px;color:rgba(255,255,255,.75)}
.brand{position:absolute;top:24px;left:24px;z-index:2;display:flex;align-items:center;gap:10px;font-weight:600;font-size:16px;color:var(--fg)}
.brand img{width:36px;height:36px;object-fit:contain}
.form-side{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;padding:96px 24px 40px}
.card{width:100%;max-width:448px;display:flex;flex-direction:column;gap:24px}
.lock{width:64px;height:64px;margin:0 auto;border-radius:50%;border:2px solid #3b82f6;background:rgba(37,99,235,.15);display:flex;align-items:center;justify-content:center;color:#3b82f6}
.heading{text-align:center}
.heading h1{margin:0 0 4px;font-size:24px;font-weight:600}
.heading p{margin:0;font-size:14px;color:var(--muted)}
form{display:flex;flex-direction:column;gap:16px}
label{font-size:14px;font-weight:500}
.field{display:flex;flex-direction:column;gap:8px}
.input-wrap{position:relative}
.lead{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none}
.toggle-pass{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:0;padding:0;color:var(--muted);cursor:pointer}
input{width:100%;height:44px;padding:0 12px 0 40px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--fg);font:inherit;font-size:14px}
input.has-trailing{padding-right:40px}
input::placeholder{color:var(--muted)}
input:focus{outline:2px solid #2563eb;outline-offset:1px}
.submit{height:44px;border:0;border-radius:6px;background:#2563eb;color:#fff;font:inherit;font-size:14px;font-weight:600;cursor:pointer}
.submit:hover{background:#1d4ed8}
.submit:disabled{opacity:.7;cursor:default}
.error{margin:0;font-size:14px;color:#ef4444}
.switch{margin:0;text-align:center;color:var(--muted);font-size:14px}
.switch button{border:0;background:none;padding:0;color:#3b82f6;font:inherit;font-weight:600;cursor:pointer}
.hidden{display:none!important}
.theme-toggle{position:absolute;top:20px;right:20px;z-index:2;background:none;border:1px solid var(--border);border-radius:8px;width:36px;height:36px;color:var(--fg);cursor:pointer;display:flex;align-items:center;justify-content:center}
@media(min-width:768px){.page{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.promo{display:block}.form-side{grid-column:2}.brand{color:#fff}.brand img{filter:brightness(0) invert(1)}}
</style>
</head>
<body>
<div class="page">
  <div class="promo" aria-hidden="true">
    <svg class="wave" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M72 0 C40 25 95 50 55 75 S60 95 62 100 L100 100 L100 0 Z" fill="currentColor"/></svg>
    <div class="promo-content">
      <div class="promo-title"><p>Welcome back!</p><h2>Good to see you again!</h2></div>
      <ul class="features">
        <li><span class="icon">↗</span><span><strong>Analytics</strong><span class="desc">Track real time performance</span></span></li>
        <li><span class="icon">▣</span><span><strong>Security</strong><span class="desc">Enterprise grade protection</span></span></li>
        <li><span class="icon">ϟ</span><span><strong>Speed</strong><span class="desc">Super fast and reliable</span></span></li>
      </ul>
    </div>
  </div>

  <div class="brand"><img src="${LOGO_URL}" alt="">DealSense AI</div>

  <main class="form-side">
    <button type="button" class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">☼</button>

    <div class="card">
      <div class="lock" aria-hidden="true">▢</div>
      <div class="heading">
        <h1 id="heading-title">Login to your account</h1>
        <p id="heading-subtitle">Enter your credentials to continue</p>
      </div>

      <form id="login-form" novalidate>
        <div class="field">
          <label for="login-email">Email Address</label>
          <div class="input-wrap"><span class="lead">✉</span><input id="login-email" type="text" inputmode="email" placeholder="Enter your email address" autocomplete="email"></div>
        </div>
        <div class="field">
          <label for="login-password">Password</label>
