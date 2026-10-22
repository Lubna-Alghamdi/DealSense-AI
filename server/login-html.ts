        <p class="switch">Don't have an account? <button type="button" id="show-signup">Sign Up</button></p>
      </form>

      <form id="signup-form" class="hidden" novalidate>
        <div class="field">
          <label for="signup-name">Name</label>
          <div class="input-wrap">
            <svg class="lead" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
            <input id="signup-name" type="text" placeholder="Enter your name" autocomplete="name" />
          </div>
        </div>
        <div class="field">
          <label for="signup-email">Email Address</label>
          <div class="input-wrap">
            <svg class="lead" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
            <input id="signup-email" type="text" inputmode="email" placeholder="Enter your email address" autocomplete="email" />
          </div>
        </div>
        <div class="field">
          <label for="signup-password">Password</label>
          <div class="input-wrap">
            <svg class="lead" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
            <input id="signup-password" class="has-trailing" type="password" placeholder="At least 8 characters" autocomplete="new-password" />
            <button type="button" class="toggle-pass" id="toggle-signup-pass" aria-label="Show password">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <p class="error" id="signup-error" role="alert"></p>
        <button class="submit" id="signup-submit" type="submit">Create Account</button>
        <p class="switch">Already have an account? <button type="button" id="show-login">Login</button></p>
      </form>
    </div>
  </main>
</div>

<script>
(function () {
  var headingTitle = document.getElementById("heading-title");
  var headingSubtitle = document.getElementById("heading-subtitle");
  var loginForm = document.getElementById("login-form");
  var signupForm = document.getElementById("signup-form");
  var showSignup = document.getElementById("show-signup");
  var showLogin = document.getElementById("show-login");

  var loginEmail = document.getElementById("login-email");
  var loginPassword = document.getElementById("login-password");
  var loginSubmit = document.getElementById("login-submit");
  var loginError = document.getElementById("login-error");

  var signupName = document.getElementById("signup-name");
  var signupEmail = document.getElementById("signup-email");
  var signupPassword = document.getElementById("signup-password");
  var signupSubmit = document.getElementById("signup-submit");
  var signupError = document.getElementById("signup-error");

  var themeToggle = document.getElementById("theme-toggle");
  var iconSun = document.getElementById("icon-sun");
  var iconMoon = document.getElementById("icon-moon");

  function cleanEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setMode(mode, updateUrl) {
    var signup = mode === "signup";
    loginForm.classList.toggle("hidden", signup);
    signupForm.classList.toggle("hidden", !signup);
    headingTitle.textContent = signup ? "Create your account" : "Login to your account";
    headingSubtitle.textContent = signup ? "Enter your details to get started" : "Enter your credentials to continue";
    loginError.textContent = "";
    signupError.textContent = "";
    if (updateUrl) {
      try {
        history.replaceState(null, "", signup ? "/signup" : "/login");
      } catch (e) {}
    }
  }

  var initialSignup = window.location.pathname === "/signup" || window.location.hash === "#signup";
  setMode(initialSignup ? "signup" : "login", false);

  showSignup.addEventListener("click", function () {
    signupEmail.value = cleanEmail(loginEmail.value);
    setMode("signup", true);
  });

  showLogin.addEventListener("click", function () {
    loginEmail.value = cleanEmail(signupEmail.value);
    setMode("login", true);
  });

  function syncThemeIcons() {
    var dark = document.documentElement.classList.contains("dark");
    iconSun.style.display = dark ? "" : "none";
    iconMoon.style.display = dark ? "none" : "";
  }
  syncThemeIcons();

  themeToggle.addEventListener("click", function () {
    var dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
    syncThemeIcons();
  });

  function bindPasswordToggle(buttonId, input) {
    var button = document.getElementById(buttonId);
    button.addEventListener("click", function () {
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      button.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  }

  bindPasswordToggle("toggle-login-pass", loginPassword);
  bindPasswordToggle("toggle-signup-pass", signupPassword);

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    loginError.textContent = "";

    var email = cleanEmail(loginEmail.value);
    var password = loginPassword.value;

    if (!email || !password) {
      loginError.textContent = "Enter your email and password.";
      return;
    }

    loginSubmit.disabled = true;
    loginSubmit.textContent = "Logging in...";

    try {
      var response = await fetch("/_agent-native/auth/ba/sign-in/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email, password: password }),
      });

      if (!response.ok) {
        loginError.textContent = "Email or password is incorrect.";
        return;
      }

      window.location.replace("/dashboard");
    } catch (e) {
      loginError.textContent = "Could not reach the server. Please try again.";
    } finally {
      loginSubmit.disabled = false;
      loginSubmit.textContent = "Continue";
    }
  });

  signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    signupError.textContent = "";

    var name = String(signupName.value || "").trim();
    var email = cleanEmail(signupEmail.value);
    var password = signupPassword.value;

    if (!name || !email || !password) {
      signupError.textContent = "Enter your name, email, and password.";
      return;
    }

    if (password.length < 8) {
      signupError.textContent = "Password must be at least 8 characters.";
      return;
    }

    signupSubmit.disabled = true;
    signupSubmit.textContent = "Creating account...";

    try {
      var signupResponse = await fetch("/_agent-native/auth/ba/sign-up/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name, email: email, password: password }),
      });

      if (!signupResponse.ok) {
        var signupBody = await signupResponse.json().catch(function () { return null; });
        signupError.textContent =
          (signupBody && (signupBody.message || (signupBody.error && signupBody.error.message))) ||
          "Could not create the account.";
        return;
      }
