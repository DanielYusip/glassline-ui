# Tooling And Feature Inventory

Glassline aims to become real game UI middleware, not just a browser widget wrapper. The work is split into replaceable tools.

## Renderer Backends

- **Prototype WebView backend:** use an engine-provided browser view to validate bridge, input, and authoring.
- **CEF offscreen backend:** Chromium Embedded Framework rendered to a GPU texture.
- **Lightweight backend:** evaluate Ultralight-style renderers or RmlUi-like layout for lower memory UI.
- **Native fallback backend:** engine-native Slate/UMG-style widgets for emergency overlays and platform-limited builds.

## Unreal Plugin Tools

- Layer subsystem: creates, orders, shows, hides, and destroys UI layers.
- Message bridge: Unreal JSON messages to JavaScript and JavaScript commands back to Unreal.
- Input router: pointer, keyboard, text input, focus, gamepad, and transparent hit testing.
- Texture compositor: render UI into engine textures and composite with scene/HUD layers.
- Asset resolver: maps `glassline://` URLs to packaged project assets.
- Dev reloader: refresh a layer from local files or dev server without restarting PIE.
- Performance HUD: frame cost, texture upload cost, message throughput, JS timing.
- Packaging validator: checks fonts, images, JS chunks, and generated manifests.

## JavaScript Runtime Tools

- `glassline.emit(type, payload)` for UI-to-game commands.
- `glassline.on(type, handler)` for game-to-UI events.
- `glassline.stream(type, handler)` for high-frequency telemetry.
- request/response RPC with IDs and timeouts.
- layer lifecycle events: `mount`, `show`, `hide`, `focus`, `blur`, `destroy`.
- typed schema helpers for command/event payloads.
- framework-agnostic bindings first, React/Solid/Vue adapters later.

## Designer Tools

- token package: colors, radius, typography, motion, spacing.
- component kit: buttons, sliders, tabs, toasts, modals, radial gauges.
- Figma token import/export later.
- HUD canvas helpers for racing, flight, debug, and telemetry overlays.

## Hard Problems

- transparent input hit testing without breaking gameplay input
- sub-frame telemetry without flooding JS
- DPI scaling and font rendering consistency
- gamepad navigation that does not feel like a webpage
- memory footprint for Chromium-class renderers
- crash isolation for renderer subprocesses
- deterministic packaging for consoles and offline builds
