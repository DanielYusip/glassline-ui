# Architecture

Glassline has three layers.

## 1. Engine Host

The engine host owns renderer instances, input, texture composition, file access, and game-event binding. In Unreal this is the `GlasslineUI` plugin.

Core concepts:

- `Layer`: one UI surface, such as `hud`, `garage`, `weather`, or `pause`.
- `Transport`: message pipe between engine and JavaScript.
- `Renderer`: implementation that can load a URL/document and present pixels.
- `InputRouter`: converts engine input into DOM-like events or backend-native input.

## 2. Browser Runtime

The browser runtime is a tiny JavaScript API injected into UI documents. It does not require React, Vue, Solid, Svelte, or any specific framework.

```ts
glassline.on("telemetry.vehicle", (frame) => updateHud(frame));
glassline.emit("vehicle.shiftUp");
const settings = await glassline.request("settings.read", { section: "video" });
```

## 3. Authoring Apps

Authoring apps are ordinary web projects. They can be a single HTML file or a full Vite/React/Solid app. Glassline only requires a compiled entrypoint and a manifest.

## Message Shape

```json
{
  "id": "42",
  "type": "telemetry.vehicle",
  "payload": {
    "speedKmh": 124.2,
    "rpm": 6320,
    "gear": 4
  }
}
```

## First Unreal Milestone

The Unreal plugin starts with a WebBrowser-backed layer so the JavaScript runtime and authoring workflow can mature. The renderer API is intentionally separate so a real offscreen CEF backend can replace it without changing UI code.
