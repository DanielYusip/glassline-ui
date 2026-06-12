const speed = document.querySelector("#speed");
const rpm = document.querySelector("#rpm");
const gear = document.querySelector("#gear");
const fuel = document.querySelector("#fuel");

function setFrame(frame) {
  speed.textContent = Math.round(Math.abs(frame.speedKmh ?? 0));
  rpm.textContent = Math.round(frame.rpm ?? frame.engineRpm ?? 0);
  gear.textContent = frame.gear === 0 ? "N" : frame.gear < 0 ? "R" : String(frame.gear ?? "N");
  fuel.style.width = `${Math.max(0, Math.min(1, frame.fuel ?? frame.fuelFraction ?? 1)) * 100}%`;
}

window.Glassline?.receive?.({
  type: "telemetry.vehicle",
  payload: {
    speedKmh: 0,
    rpm: 750,
    gear: 0,
    fuel: 0.78,
  },
});

window.glassline?.on?.("telemetry.vehicle", setFrame);

if (!window.glassline) {
  let t = 0;
  setInterval(() => {
    t += 0.025;
    setFrame({
      speedKmh: Math.abs(Math.sin(t)) * 183,
      rpm: 750 + Math.abs(Math.sin(t * 1.8)) * 6500,
      gear: Math.floor(Math.abs(Math.sin(t * 0.55)) * 5),
      fuel: 0.78 - Math.min(t * 0.003, 0.6),
    });
  }, 33);
}
