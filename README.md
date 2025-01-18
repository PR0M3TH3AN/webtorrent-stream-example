# How to Install & Build with Webpack

This guide covers installing Node, bundling with Webpack, and running the site on both **Windows** and **Debian** systems.

---

## 1. Install Node.js & npm

### Windows
1. Download the [Node.js installer](https://nodejs.org/en/download/) for Windows.
2. Run the installer and follow the steps.
3. Verify installation in a terminal (e.g. PowerShell or cmd):
   ```bash
   node -v
   npm -v
   ```

### Debian / Ubuntu
1. Update your package index:
   ```bash
   sudo apt-get update
   ```
2. Install Node.js and npm:
   ```bash
   sudo apt-get install -y nodejs npm
   ```
3. Verify installation:
   ```bash
   node -v
   npm -v
   ```

---

## 2. Install Dependencies

Inside your project folder (the one containing `package.json`):

```bash
npm install
```

This installs all required packages (including Webpack and Babel).

---

## 3. Build the Project

Run the build script from `package.json`:

```bash
npm run build
```

Webpack will bundle your code and output files to the `dist/` folder.

---

## 4. Serve the Site

1. **Method 1: Node-based static server**  
   If you have a lightweight HTTP server (like `serve` or `http-server`) installed globally, you can do:
   ```bash
   npx http-server dist
   ```
   or
   ```bash
   npx serve dist
   ```
   This starts a local server hosting files from the `dist/` folder.

2. **Method 2: Built-in `webpack` dev server** (if configured)  
   Some setups have a dev server configured. In that case:
   ```bash
   npm start
   ```
   (Or whatever script your `package.json` uses to launch the dev server.)

---

## 5. Open the App

- Once the server is running, open your browser to:
  ```
  http://127.0.0.1:8080
  ```
  *(Adjust the port if your server logs a different port.)*

You should now see the WebTorrent streaming demo functioning in your browser.