# Glassline UI

Glassline UI is an open-source experiment in real-time game UI middleware: HTML, CSS, and JavaScript authored like modern web UI, rendered and driven inside game engines with deterministic input, telemetry streams, and low-latency layer composition.

The first target is Unreal Engine 5. The first implementation path is intentionally staged:

1. Build a browser-backed prototype plugin using Unreal's existing web stack.
2. Stabilize the JavaScript bridge, layer model, and authoring workflow.
3. Replace the prototype renderer with a dedicated offscreen renderer.
4. Add engine-grade packaging, input, debugging, profiling, and GPU compositing.

This is not affiliated with Coherent Labs or Gameface. It is a separate public project exploring the same broad principle: web-authored interfaces for games.

## Why

Game UI wants two different things at once:

- fast iteration, styling, layout, animation, and component reuse from web tools
- engine-native rendering, input, packaging, telemetry, and performance discipline

Glassline is the bridge between those worlds.

## Initial Toolset

- TypeScript runtime bridge for browser-side UI code
- Unreal plugin skeleton with layer lifecycle and message dispatch
- local HTML HUD example
- JSON message protocol
- future-ready renderer interface for CEF, WebView, Ultralight-style backends, or custom renderers

## Repository Layout

```text
packages/glassline-runtime/      Browser-side TypeScript runtime
plugins/unreal/GlasslineUI/      Unreal Engine plugin skeleton
examples/racing-hud/             Minimal HTML/CSS/JS racing HUD
docs/                            Architecture and roadmap
```

## First Principles

- UI layers are explicit: HUD, app, modal, debug, loading screen.
- Game-to-UI communication is event/stream based.
- UI-to-game communication is command/RPC based.
- Rendering backend is replaceable.
- No engine gameplay code should depend on a specific web framework.
- Authoring should feel like web development; shipping should feel like game middleware.

## Current Status

Pre-alpha scaffold. The runtime and Unreal plugin are intentionally small so the public repo starts clean.

Verified locally:

- `npm run typecheck`
- `npm run build`
- Unreal 5.8 Preview `RunUAT BuildPlugin -TargetPlatforms=Win64`
