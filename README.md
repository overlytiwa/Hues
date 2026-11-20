# Heus for Samsung Smart TV

A React + Vite pairing home screen inspired by the quiet, spacious presentation of Apple’s TV setup screens. Pure black, locally bundled Manrope typography, large pairing digits, and an original 3D hand holding an upright Android-style phone.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Open the local URL Vite prints. For another device on your local network, use the Network URL printed by Vite. The complete app artwork and fonts are bundled locally; the built app makes no external requests.

```sh
npm test
npm run build
npm run preview
```

`npm run build` creates `dist/`, ready for a static server or packaging with the Tizen Extension for Visual Studio Code. The downloadable source ZIP also includes a prebuilt copy of that folder.

## Pairing behavior

Every app launch generates a random six-digit code. “New code” generates a different one. The code stays visible until refreshed, so it will not expire while someone is typing.

Select “Need help?”, then “Try pairing preview”. Enter any six-digit code, including a different code from the one on screen. The preview shows the connected screen. Select “Pair another phone” to return to pairing with a fresh code. You can also click the Pair a TV area on the illustrated phone.

This is a UI prototype, as requested. It does not discover or connect to a physical phone. The included pairing preview operates locally. A production companion app would need a pairing service and a persistent connection; replace the local success transition in `src/App.jsx` and the prototype validation in `src/pairing.mjs` at that point.

## TV remote

Use the directional pad to move between actions and Enter/OK to select. The first directional press focuses an action. Browser Escape closes an open dialog. Samsung Return (10009) closes the current dialog or opens an exit confirmation. Tab navigation, visible focus, dialog focus trapping, accessible code announcements, and reduced motion are included.

## Samsung Tizen

The included `public/config.xml` targets the Samsung TV profile with Tizen 6.5 as the minimum declared version. The build uses relative asset paths and a classic IIFE script so it can load inside a packaged Tizen widget. The app does not require network privileges.

Tizen Studio is deprecated and no longer supported. Use the current [Tizen Extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=tizen.vscode-tizen-csharp) on your laptop or desktop computer. The extension manages its SDK components; follow its first-run setup prompts on that computer. Nothing from this development environment is installed on your TV.

On the laptop, clone this repository, open it in VS Code, then run `npm ci` and `npm run build` in its terminal. This creates the TV-ready files in `dist/`.

Connect the laptop and TV to the same local network. On the TV, open Apps, then App Settings, enter `12345` using the remote number keypad, enable Developer Mode, enter the laptop's local IP address, and restart the TV. These are the TV-side setup steps.

Back on the laptop, open the Tizen activity bar in VS Code. Under Actions, select Connect Device, then Create Custom Connection. Add your TV's local IP address and port `26101`, and connect to it. The TV's IP address and the laptop's IP address are different: the TV uses the laptop's address in Developer Mode; VS Code uses the TV's address to connect.

In the same Tizen Actions panel, select Create Certificate, then Create Samsung Certificate. Complete the author and distributor details, include your connected TV's DUID, and sign in with your Samsung Developer account when prompted. Use the resulting profile to sign the TV application.

Use Actions > Create Project to create a `web` application for the TV device with the Empty template, named Heus. Choose a separate folder for this generated TV project so you preserve the React source. Select Set this as a working project and Add this project to current workspace. Copy the contents of the React project's `dist/` folder into the generated TV project's root, replacing its template files. In the Tizen Actions panel, select Run Project to package, install, and launch it on your connected TV.

A signed `.wgt` is not included because signing requires your Samsung certificate. Update the sample application ID if your project or publishing account requires it. Official guides: [current extension](https://marketplace.visualstudio.com/items?itemName=tizen.vscode-tizen-csharp), [create a TV web project](https://developer.samsung.com/smarttv/develop/tools/additional-tools/vscode/create-web-applications.html), [connect your TV from VS Code](https://developer.samsung.com/smarttv/develop/tools/additional-tools/vscode/connecting-to-tv-device.html), and [create a signing certificate](https://developer.samsung.com/smarttv/develop/tools/additional-tools/vscode/creating-certificates.html).

The browser preview, pairing behavior, and production build were checked. Physical Samsung hardware and the Tizen emulator were not available for validation. The UI uses a static 3D render, so it does not require WebGL at runtime.

## Original artwork

No stock photograph, downloaded hand model, or image generation model is used in the delivered artwork. The hand is sculpted procedurally from smooth implicit surfaces, then rendered in Blender with skin scattering, procedural pores, natural nails, titanium, glass, and studio lighting. The upright phone’s mock Heus interface is drawn from text, shapes, and gradients.

The editable Blender scene is in `artwork/heus-scene.blend`. All build scripts are included. To rebuild the artwork, install Python 3 with Pillow and Blender 4.3+, then run:

```sh
node scripts/export-hand.mjs
python scripts/make-phone-screen.py
blender -b --python scripts/render-scene.py
```

The rendering scripts are optional and are not needed to build or run the React application. `src/scene/hand.js` owns the hand proportions and grip. `scripts/make-phone-screen.py` owns the miniature phone UI. `scripts/render-scene.py` owns the lighting, camera, materials, and phone geometry.

Manrope is by Mikhail Sharanda and is distributed under the SIL Open Font License included in `public/assets/Manrope-OFL.txt`. React, Vite and Three.js retain their respective upstream licenses. The project uses Three.js only for the optional geometry authoring script.
