import { createAuthPlugin } from "@agent-native/core/server";

import { LOGIN_HTML } from "../login-html";

export default createAuthPlugin({
  rootAuth: true,
  loginHtml: LOGIN_HTML,
});
