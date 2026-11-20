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

`npm run build` creates `dist/`, ready for a static server or packaging in Tizen Studio. The downloadable source ZIP also includes a prebuilt copy of that folder.

## Pairing behavior

Every app launch generates a random six-digit code. “New code” generates a different one. The code stays visible until refreshed, so it will not expire while someone is typing.

Select “Need help?”, then “Try pairing preview”. Enter any six-digit code, including a different code from the one on screen. The preview shows the connected screen. Select “Pair another phone” to return to pairing with a fresh code. You can also click the Pair a TV area on the illustrated phone.

This is a UI prototype, as requested. It does not discover or connect to a physical phone. The included pairing preview operates locally. A production companion app would need a pairing service and a persistent connection; replace the local success transition in `src/App.jsx` and the prototype validation in `src/pairing.mjs` at that point.

## TV remote

Use the directional pad to move between actions and Enter/OK to select. The first directional press focuses an action. Browser Escape closes an open dialog. Samsung Return (10009) closes the current dialog or opens an exit confirmation. Tab navigation, visible focus, dialog focus trapping, accessible code announcements, and reduced motion are included.

## Samsung Tizen

The included `public/config.xml` targets the Samsung TV profile with Tizen 6.5 as the minimum declared version. The build uses relative asset paths and a classic IIFE script so it can load inside a packaged Tizen widget. The app does not require network privileges.

Install Tizen Studio on your laptop or desktop computer. On that same computer, open its Package Manager and install TV Extensions and Samsung Certificate Extension. Tizen Studio is not installed on the TV.

Connect the computer and TV to the same local network. On the TV, open Apps, then App Settings, enter `12345` using the remote number keypad, enable Developer Mode, enter the computer's local IP address, and restart the TV. In Tizen Studio on the computer, open Tools > Device Manager > Remote Device Manager and connect to the TV using the TV's local IP address.

In Tools > Certificate Manager, create a Samsung TV certificate profile with your Samsung account and include your connected TV's DUID. Create an Empty Samsung TV Web Application project named Heus. After `npm run build`, copy the contents of `dist/` into that project's root folder, replacing its template files. Right-click the project and choose Run As > Tizen Web Application to install and launch it on the connected TV.

A signed `.wgt` is not included because signing requires your Samsung certificate. Update the sample application ID if your project or publishing account requires it. Samsung's setup guides: [install the SDK](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html), [connect a TV](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html), and [create certificates](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html).

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
