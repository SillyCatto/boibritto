import { ComponentLoader } from "adminjs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentLoader = new ComponentLoader();

const Components = {
  Login: componentLoader.override(
    "Login",
    path.join(__dirname, "Login.jsx")
  ),
  Dashboard: componentLoader.add(
    "Dashboard",
    path.join(__dirname, "Dashboard.jsx")
  ),
  // other custom components
};

export { componentLoader, Components };
