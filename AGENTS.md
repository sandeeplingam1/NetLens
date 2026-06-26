# NetLens (Helix) OpenCode Instructions

This file serves as the primary rulebook and context guide for the OpenCode AI agent when working on the NetLens project.

## Project Context
- **Name:** NetLens (Package: `netlens`)
- **Description:** AI-powered network terminal for network engineers.
- **Tech Stack:** React 19, TypeScript, Vite, Electron, Zustand, xterm.js, node-pty, ssh2, serialport.

## Development & Build Commands
- **Start Development Server:** `npm run dev` (Runs Vite and Electron concurrently)
- **Build App:** `npm run build` (Builds via Vite and electron-builder)
- **Preview:** `npm run preview`

## Coding Standards & Guidelines
- **Language:** Use TypeScript (`.ts`, `.tsx`) for all source code. Avoid using JavaScript (`.js`, `.jsx`) unless absolutely necessary for specific configuration files.
- **Components:** Use functional React components with Hooks.
- **State Management:** Use Zustand for global state management.
- **Terminal Integration:** Use `@xterm/xterm` for terminal emulation, connected with `node-pty` or `ssh2`/`serialport` depending on the protocol.

## Project Structure
- `electron/`: Contains Electron main process code (`main.js` / main process scripts).
- `src/`: Contains the React UI and renderer process code.
- `public/`: Static assets.
