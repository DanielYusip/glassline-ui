# CEF Backend Plan

The prototype Unreal plugin currently uses `UWebBrowser` to validate layers and messaging. A real Gameface-class path needs an offscreen renderer backend.

## Proposed Backend

`IGlasslineRendererBackend`

- `Initialize(descriptor)`
- `LoadUrl(url)`
- `SendMessage(message)`
- `Resize(size)`
- `Tick(deltaTime)`
- `GetTexture()`
- `Shutdown()`

## CEF Offscreen Responsibilities

- Own one CEF browser per Glassline layer.
- Use windowless rendering.
- Copy dirty paint rectangles into an Unreal texture.
- Preserve alpha for transparent HUDs.
- Route keyboard, mouse, text, wheel, and gamepad input.
- Inject the Glassline runtime before page scripts execute.
- Expose `glassline://` URL resolution for packaged content.
- Surface JavaScript console messages and command payloads to Unreal.

## Unreal Constraints

UE 5.8 ships CEF 128 under `Engine/Source/ThirdParty/CEF3`. The production backend should avoid copying CEF binaries into this repo and should link through Unreal's third-party module where possible.

## First Native Renderer Task

Create `FGlasslineCefRendererBackend` behind `IGlasslineRendererBackend` and prove:

1. load a local HTML file
2. receive offscreen paint callbacks
3. upload pixels to a transient `UTexture2D`
4. draw that texture in a Slate widget
5. deliver one JS command from page to Unreal
