const fs = require("node:fs");
const path = require("node:path");

const htmlPath = path.join(process.cwd(), "dist", "index.html");

if (!fs.existsSync(htmlPath)) {
  throw new Error("dist/index.html not found. Run Expo web export first.");
}

let html = fs.readFileSync(htmlPath, "utf8");

const headTags = `
    <meta name="theme-color" content="#6133B5" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="RAIZ" />
    <meta
      name="description"
      content="RAIZ ajuda mulheres com endometriose a registrar sintomas, observar padrões e seguir um plano diário educativo."
    />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
`;

const serviceWorkerScript = `
    <script>
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
          navigator.serviceWorker.register("/sw.js").catch(function () {});
        });
      }
    </script>
`;

if (!html.includes('rel="manifest"')) {
  html = html.replace("  </head>", `${headTags}  </head>`);
}

if (!html.includes("serviceWorker")) {
  html = html.replace("</body>", `${serviceWorkerScript}</body>`);
}

fs.writeFileSync(htmlPath, html);
fs.writeFileSync(path.join(process.cwd(), "dist", "_redirects"), "/* /index.html 200\n");
console.log("PWA metadata injected into dist/index.html");
