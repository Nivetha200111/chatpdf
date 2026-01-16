# ChatGPT to PDF Exporter

A Chrome extension to download your ChatGPT conversations as well-formatted PDF documents.

## Installation

1.  **Download the extension files.** You can either clone this repository or download it as a ZIP file.
2.  **Build the extension:**
    ```bash
    npm install
    npm run build
    ```
    This will create a `dist` folder with the bundled extension files.
3.  **Load the extension in Chrome:**
    *   Open Chrome and navigate to `chrome://extensions`.
    *   Enable "Developer mode" in the top right corner.
    *   Click "Load unpacked" and select the `dist` folder created in the previous step.

## How to Use

1.  Navigate to a ChatGPT conversation at `https://chat.openai.com` or `https://chatgpt.com`.
2.  You will see a new "PDF" button appear near the message input area.
3.  Click the "PDF" button. The button will show a loading state while the PDF is being generated.
4.  Once finished, your browser will automatically download the PDF file, named after the conversation title.

## Development

To run the extension in development mode with live-reloading:

```bash
npm install
npm run dev
```

Then, load the `dist` folder as an unpacked extension in Chrome. Any changes to the source files will trigger a rebuild.

## Privacy Notice

This extension operates entirely on the client-side. Your conversations are not stored, transmitted, or processed on any external servers. All processing happens locally in your browser. We do not collect any data.
