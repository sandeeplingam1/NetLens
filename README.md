# NetLens

NetLens is a modern, AI-powered desktop network terminal designed specifically for Network Engineers. It is a state-of-the-art alternative to legacy applications like SecureCRT or PuTTY, combining professional terminal capabilities with a sleek, modern interface and integrated AI assistance.

## Features

- **Multi-Protocol Support:** Connect via SSH, Telnet, or direct Serial (Console) cables.
- **Advanced Layouts:** Support for multi-tab sessions and horizontal/vertical split views to monitor multiple devices simultaneously.
- **Broadcast Mode:** Type a command once (e.g., `write mem`) and send it to all open terminal tabs simultaneously.
- **AI Integration:** Highlight complex log outputs (like BGP drops or OSPF errors) and instantly ask the built-in AI assistant to explain what went wrong.
- **Macros:** Create custom command sequences with automated delays to speed up repetitive configuration tasks.
- **Visual Pattern Highlighting:** Automatically colorize keywords (e.g., `ERROR`, `DOWN`, `UP`) based on customizable regex rules.
- **Port Forwarding:** Built-in SSH tunnel management for securely accessing internal web interfaces.
- **Local & Secure:** All session data and credentials are encrypted and stored locally on your machine. No cloud databases required.

## Installation

NetLens runs entirely locally. You can download the latest installer from the [Releases](https://github.com/sandeep-lingam/netlens/releases) page.

### For Mac (Apple Silicon)
1. Download the `NetLens-v1.0-Mac.dmg` release.
2. Double-click the DMG and drag NetLens into your Applications folder.
3. *Note: As this is an unsigned application, you may need to Right-Click -> Open the app the first time to bypass the macOS "Unidentified Developer" warning.*

### For Windows
1. Download the latest `NetLens-v1.0-Windows.exe` from the [Releases](https://github.com/sandeep-lingam/netlens/releases) page.
2. Double-click the installer and follow the setup wizard.

### For Linux
1. Download the `.AppImage` or `.deb` from the [Releases](https://github.com/sandeep-lingam/netlens/releases) page.
2. Make the AppImage executable: `chmod +x NetLens-*.AppImage`
3. Run it: `./NetLens-*.AppImage`

## Development

NetLens is built with **Electron**, **React**, **TypeScript**, and **Vite**.

To run the app in developer mode (with hot-reloading):

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

To build a production release manually on your own machine:

```bash
npm run build
```

## License
MIT License
