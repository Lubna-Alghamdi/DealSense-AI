const LOGO_URL="https://cdn.builder.io/api/v1/image/assets%2Fa9b10afc88c54a1485913eb386474032%2F603f781baa244e5381e72d059c3c9ace?format=webp&width=800&height=1200";

export const LOGIN_HTML=`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DealSense AI</title>
<style>
:root{--bg:#0f172a;--card:#1e293b;--fg:#f8fafc;--mut:#94a3b8;--blue:#2563eb;--border:#334155}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--fg)}
.page{min-height:100vh;display:grid;grid-template-columns:1fr}
.left{display:none;position:absolute;inset:0 auto 0 0;width:50%;overflow:hidden;background:linear-gradient(160deg,#1e3a8a,#2563eb 60%,#60a5fa);color:#fff}
.curve{position:absolute;right:-1px;top:0;width:35%;height:100%;background:var(--bg);clip-path:ellipse(70% 60% at 100% 50%)}
.leftin{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:center;padding-left:64px;gap:48px}
.left h2{font-size:36px;margin:6px 0 0}.features{display:grid;gap:24px}.feature{display:flex;gap:12px;align-items:center}.ico{width:40px;height:40px;border:1px solid #ffffff55;border-radius:8px;display:grid;place-items:center}
.brand{position:absolute;top:24px;left:24px;z-index:3;display:flex;gap:10px;align-items:center;font-weight:700}.brand img{width:36px;height:36px;object-fit:contain;filter:brightness(0) invert(1)}
.main{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:60px 24px}.card{width:100%;max-width:448px}.lock{width:64px;height:64px;border:2px solid #3b82f6;border-radius:50%;display:grid;place-items:center;margin:0 auto 26px;color:#3b82f6;font-size:26px}.head{text-align:center;margin-bottom:28px}.head h1{margin:0 0 6px;font-size:24px}.head p{margin:0;color:var(--mut)}
form{display:grid;gap:16px}.field{display:grid;gap:8px}label{font-size:14px;font-weight:600}.wrap{position:relative}.lead{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--mut)}input{width:100%;height:48px;border:1px solid var(--border);border-radius:7px;background:var(--card);color:var(--fg);padding:0 44px 0 42px;font-size:14px}.eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:0;color:var(--mut);cursor:pointer}
.submit{height:50px;border:0;border-radius:7px;background:var(--blue);color:#fff;font-weight:700;font-size:15px;cursor:pointer}.submit:disabled{opacity:.6}.error{margin:0;color:#ef4444;font-size:14px}.switch{text-align:center;color:var(--mut);font-size:14px}.switch button{background:none;border:0;color:#3b82f6;font-weight:700;cursor:pointer}.hidden{display:none}
.theme{position:absolute;top:20px;right:20px;width:38px;height:38px;border:1px solid var(--border);border-radius:8px;background:none;color:var(--fg)}
@media(min-width:768px){.page{grid-template-columns:1fr 1fr}.left{display:block}.main{grid-column:2}.brand{color:#fff}}
</style>
</head>
<body>
<div class="page">
<div class="left"><div class="curve"></div><div class="leftin"><div><p>Welcome back!</p><h2>Good to see you again!</h2></div><div class="features"><div class="feature"><span class="ico">↗</span><span><b>Analytics</b><br><small>Track real time performance</small></span></div><div class="feature"><span class="ico">▣</span><span><b>Security</b><br><small>Enterprise grade protection</small></span></div><div class="feature"><span class="ico">ϟ</span><span><b>Speed</b><br><small>Super fast and reliable</small></span></div></div></div></div>
<div class="brand"><img src="${LOGO_URL}" alt="">DealSense AI</div>
<main class="main"><button class="theme" id="theme">☼</button><div class="card"><div class="lock">▢</div><div class="head"><h1 id="title">Login to your account</h1><p id="sub">Enter your credentials to continue</p></div>

<form id="login" novalidate>
<div class="field"><label>Email Address</label><div class="wrap"><span class="lead">✉</span><input id="le" type="text" inputmode="email" autocomplete="email" placeholder="Enter your email address"></div></div>
<div class="field"><label>Password</label><div class="wrap"><span class="lead">▢</span><input id="lp" type="password" autocomplete="current-password" placeholder="Enter your password"><button class="eye" type="button" id="ley">◉</button></div></div>
<p class="error" id="lerr"></p><button class="submit" id="ls" type="submit">Continue</button><p class="switch">Don't have an account? <button type="button" id="toSignup">Sign Up</button></p>
</form>

<form id="signup" class="hidden" novalidate>
<div class="field"><label>Name</label><div class="wrap"><span class="lead">○</span><input id="sn" type="text" autocomplete="name" placeholder="Enter your name"></div></div>
<div class="field"><label>Email Address</label><div class="wrap"><span class="lead">✉</span><input id="se" type="text" inputmode="email" autocomplete="email" placeholder="Enter your email address"></div></div>
<div class="field"><label>Password</label><div class="wrap"><span class="lead">▢</span><input id="sp" type="password" autocomplete="new-password" placeholder="At least 8 characters"><button class="eye" type="button" id="sey">◉</button></div></div>
<p class="error" id="serr"></p><button class="submit" id="ss" type="submit">Create Account</button><p class="switch">Already have an account? <button type="button" id="toLogin">Login</button></p>
</form>
</div></main></div>

<script>
(function(){
const $=id=>document.getElementById(id),login=$("login"),signup=$("signup"),title=$("title"),sub=$("sub"),le=$("le"),lp=$("lp"),lerr=$("lerr"),ls=$("ls"),sn=$("sn"),se=$("se"),sp=$("sp"),serr=$("serr"),ss=$("ss");
const email=v=>String(v||"").trim().toLowerCase();
function mode(s){login.classList.toggle("hidden",s);signup.classList.toggle("hidden",!s);title.textContent=s?"Create your account":"Login to your account";sub.textContent=s?"Enter your details to get started":"Enter your credentials to continue";lerr.textContent="";serr.textContent=""}
$("toSignup").onclick=()=>{se.value=email(le.value);mode(true)};$("toLogin").onclick=()=>{le.value=email(se.value);mode(false)};
$("ley").onclick=()=>lp.type=lp.type==="password"?"text":"password";$("sey").onclick=()=>sp.type=sp.type==="password"?"text":"password";
$("theme").onclick=()=>document.documentElement.classList.toggle("light");

login.onsubmit=async e=>{e.preventDefault();lerr.textContent="";const em=email(le.value),pw=lp.value;if(!em||!pw){lerr.textContent="Enter your email and password.";return}ls.disabled=true;ls.textContent="Logging in...";try{const r=await fetch("/_agent-native/auth/ba/sign-in/email",{method:"POST",headers:{"content-type":"application/json"},credentials:"include",body:JSON.stringify({email:em,password:pw})});if(!r.ok){lerr.textContent="Email or password is incorrect.";return}location.replace("/dashboard")}catch{lerr.textContent="Could not reach the server."}finally{ls.disabled=false;ls.textContent="Continue"}};

signup.onsubmit=async e=>{e.preventDefault();serr.textContent="";const name=sn.value.trim(),em=email(se.value),pw=sp.value;if(!name||!em||!pw){serr.textContent="Enter your name, email, and password.";return}if(pw.length<8){serr.textContent="Password must be at least 8 characters.";return}ss.disabled=true;ss.textContent="Creating account...";try{const r=await fetch("/_agent-native/auth/ba/sign-up/email",{method:"POST",headers:{"content-type":"application/json"},credentials:"include",body:JSON.stringify({name,email:em,password:pw})});if(!r.ok){const b=await r.json().catch(()=>null);serr.textContent=(b&&(b.message||(b.error&&b.error.message)))||"Could not create the account.";return}const lr=await fetch("/_agent-native/auth/ba/sign-in/email",{method:"POST",headers:{"content-type":"application/json"},credentials:"include",body:JSON.stringify({email:em,password:pw})});if(lr.ok){location.replace("/dashboard");return}le.value=em;mode(false);lerr.textContent="Account created. Sign in to continue."}catch{serr.textContent="Could not reach the server."}finally{ss.disabled=false;ss.textContent="Create Account"}};
})();
</script>
</body></html>`;
