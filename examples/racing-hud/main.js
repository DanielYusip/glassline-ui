const canvas = document.querySelector("#hudCanvas");
const ctx = canvas.getContext("2d");

const TAU = Math.PI * 2;
const tach = {
  startDeg: 140,
  endDeg: 400,
  maxRpm: 8000,
  redlineRpm: 6800,
};

let target = {
  speedKmh: 86,
  rpm: 5200,
  gear: 3,
  fuel: 0.78,
  throttle: 0.52,
  brake: 0.1,
  abs: false,
  tcs: true,
  headlights: true,
  turnLeft: false,
  turnRight: false,
  pitLimiter: false,
};

let shown = { ...target };
let start = performance.now();

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function degToRad(degrees) {
  return (degrees - 90) * Math.PI / 180;
}

function pointAt(cx, cy, radius, degrees) {
  const angle = degToRad(degrees);
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
}

function drawSegmentedArc(cx, cy, radius, startDeg, endDeg, width, colorFor, alpha = 1) {
  const steps = Math.max(4, Math.ceil(Math.abs(endDeg - startDeg) / 2.2));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineWidth = width;
  ctx.lineCap = "butt";

  for (let i = 0; i < steps; i += 1) {
    const a0 = startDeg + (endDeg - startDeg) * (i / steps);
    const a1 = startDeg + (endDeg - startDeg) * ((i + 0.72) / steps);
    const p0 = pointAt(cx, cy, radius, a0);
    const p1 = pointAt(cx, cy, radius, a1);
    ctx.strokeStyle = typeof colorFor === "function" ? colorFor(i / steps, a0) : colorFor;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawSmoothArc(cx, cy, radius, startDeg, endDeg, width, color, cap = "round") {
  ctx.save();
  ctx.lineWidth = width;
  ctx.lineCap = cap;
  ctx.strokeStyle = color;
  ctx.beginPath();

  const steps = Math.max(8, Math.ceil(Math.abs(endDeg - startDeg) / 5));
  for (let i = 0; i <= steps; i += 1) {
    const p = pointAt(cx, cy, radius, startDeg + (endDeg - startDeg) * (i / steps));
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }

  ctx.stroke();
  ctx.restore();
}

function text(value, x, y, options = {}) {
  const {
    size = 24,
    weight = 700,
    color = "#f7f8fb",
    align = "center",
    baseline = "middle",
    family = "Inter, ui-sans-serif, system-ui, sans-serif",
    alpha = 1,
  } = options;

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.fillText(String(value), x, y);
  ctx.restore();
}

function drawCapsule(x, y, width, height, color, alpha = 1) {
  const radius = height / 2;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
  ctx.restore();
}

function drawTicks(cx, cy, radius) {
  const span = tach.endDeg - tach.startDeg;
  const majorTicks = tach.maxRpm / 1000;
  const minorTicks = majorTicks * 4;

  for (let i = 0; i <= minorTicks; i += 1) {
    const isMajor = i % 4 === 0;
    const deg = tach.startDeg + span * (i / minorTicks);
    const outer = pointAt(cx, cy, radius + 1, deg);
    const inner = pointAt(cx, cy, radius - (isMajor ? 19 : 11), deg);
    ctx.save();
    ctx.strokeStyle = isMajor ? "rgb(232 238 246 / 72%)" : "rgb(222 230 240 / 34%)";
    ctx.lineWidth = isMajor ? 2.1 : 1.1;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(inner.x, inner.y);
    ctx.lineTo(outer.x, outer.y);
    ctx.stroke();
    ctx.restore();
  }

  for (let rpm = 0; rpm <= tach.maxRpm; rpm += 1000) {
    const deg = tach.startDeg + span * (rpm / tach.maxRpm);
    const p = pointAt(cx, cy, radius - 39, deg);
    const alpha = rpm >= tach.redlineRpm ? 0.9 : 0.72;
    const color = rpm >= tach.redlineRpm ? "#ff4b51" : "#dce5ef";
    text(rpm / 1000, p.x, p.y, { size: 16, weight: 650, color, alpha });
  }
}

function drawAssist(label, x, y, active, color) {
  drawCapsule(x - 20, y - 12, 40, 24, active ? color : "rgb(255 255 255 / 8%)", active ? 0.95 : 0.65);
  text(label, x, y + 0.5, {
    size: 12,
    weight: 800,
    color: active ? "#050608" : "rgb(235 241 248 / 62%)",
  });
}

function drawIndicator(cx, cy, elapsed) {
  const blink = Math.sin(elapsed * 8) > 0;
  text("<", cx - 76, cy - 28, {
    size: 23,
    weight: 850,
    color: target.turnLeft && blink ? "#fff629" : "rgb(221 232 244 / 62%)",
  });
  text(">", cx + 76, cy - 28, {
    size: 23,
    weight: 850,
    color: target.turnRight && blink ? "#fff629" : "rgb(221 232 244 / 62%)",
  });
  text("PWR", cx - 72, cy + 42, { size: 15, weight: 720, color: "rgb(236 242 249 / 72%)" });
  text("ABS", cx + 74, cy + 42, { size: 15, weight: 720, color: shown.abs ? "#7fd8ff" : "rgb(236 242 249 / 56%)" });
  text("TCS", cx - 72, cy + 76, { size: 15, weight: 720, color: shown.tcs ? "#8dff70" : "rgb(236 242 249 / 48%)" });
  text("brk", cx + 74, cy + 76, { size: 15, weight: 720, color: shown.brake > 0.08 ? "#ff6166" : "rgb(236 242 249 / 56%)" });
}

function drawFuel(cx, cy) {
  const width = 92;
  const height = 9;
  const x = cx - width / 2;
  const y = cy + 116;
  drawCapsule(x, y, width, height, "rgb(255 255 255 / 18%)", 1);
  drawCapsule(x, y, width * clamp(shown.fuel), height, "#f7f8fb", 1);
}

function drawGauge(elapsed) {
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2 + 5;
  const outerRadius = 244;
  const rpmRadius = 220;
  const innerRadius = 148;
  const progress = clamp(shown.rpm / tach.maxRpm);
  const redlineStart = tach.startDeg + (tach.endDeg - tach.startDeg) * (tach.redlineRpm / tach.maxRpm);
  const activeEnd = tach.startDeg + (tach.endDeg - tach.startDeg) * progress;

  ctx.clearRect(0, 0, width, height);

  const disk = ctx.createRadialGradient(cx - 58, cy - 86, 18, cx, cy, outerRadius);
  disk.addColorStop(0, "rgb(72 79 88 / 88%)");
  disk.addColorStop(0.42, "rgb(30 34 41 / 91%)");
  disk.addColorStop(0.72, "rgb(17 20 26 / 78%)");
  disk.addColorStop(1, "rgb(9 11 15 / 0%)");
  ctx.fillStyle = disk;
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "rgb(12 15 20 / 84%)";
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, TAU);
  ctx.fill();

  drawSmoothArc(cx, cy, rpmRadius, tach.startDeg, tach.endDeg, 20, "rgb(142 157 179 / 38%)", "butt");
  drawSegmentedArc(cx, cy, rpmRadius, redlineStart, tach.endDeg, 22, () => "rgb(238 34 46 / 78%)", 1);
  drawSegmentedArc(cx, cy, rpmRadius, tach.startDeg, activeEnd, 22, (_local, degrees) => {
    const rpmRatio = (degrees - tach.startDeg) / (tach.endDeg - tach.startDeg);
    if (rpmRatio > tach.redlineRpm / tach.maxRpm) return "rgb(255 48 56 / 94%)";
    if (rpmRatio > 0.74) return "rgb(255 190 40 / 92%)";
    return "rgb(247 249 252 / 96%)";
  });

  drawSmoothArc(cx, cy, 188, tach.startDeg + 9, tach.endDeg - 9, 3, "rgb(214 225 240 / 26%)", "round");
  drawTicks(cx, cy, 185);

  drawSmoothArc(cx, cy, 207, 52, -14, 10, "rgb(255 255 255 / 12%)", "round");
  drawSmoothArc(cx, cy, 207, 52, 52 + (-14 - 52) * clamp(shown.throttle), 10, "#00e48a", "round");
  drawSmoothArc(cx, cy, 207, 130, 194, 10, "rgb(255 255 255 / 12%)", "round");
  drawSmoothArc(cx, cy, 207, 130, 130 + (194 - 130) * clamp(shown.brake), 10, "#ff4d55", "round");

  drawIndicator(cx, cy, elapsed);

  text(Math.round(Math.abs(shown.speedKmh)), cx, cy - 54, {
    size: 54,
    weight: 620,
    color: "#fbfcff",
  });
  text("KM/H", cx, cy - 17, { size: 14, weight: 700, color: "rgb(227 234 243 / 72%)" });

  drawCapsule(cx - 43, cy + 11, 86, 86, "rgb(255 255 255 / 7%)", 1);
  ctx.save();
  ctx.strokeStyle = "rgb(255 255 255 / 14%)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(cx - 43, cy + 11, 86, 86, 43);
  ctx.stroke();
  ctx.restore();
  text(formatGear(shown.gear), cx, cy + 54, { size: 62, weight: 780, color: "#ffffff" });

  text(`${Math.round(shown.rpm)} RPM`, cx, cy + 105, { size: 17, weight: 700, color: "rgb(246 249 253 / 82%)" });
  drawFuel(cx, cy);

  if (target.pitLimiter) {
    drawAssist("LIM", cx, cy + 141, true, "#fff200");
  }
}

function formatGear(value) {
  const gear = Math.round(value ?? 0);
  if (gear === 0) return "N";
  if (gear < 0) return "R";
  return String(gear);
}

function normalizeFrame(frame) {
  return {
    speedKmh: Number(frame.speedKmh ?? frame.speed ?? 0),
    rpm: Number(frame.rpm ?? frame.engineRpm ?? 0),
    gear: Number(frame.gear ?? 0),
    fuel: Number(frame.fuel ?? frame.fuelFraction ?? 1),
    throttle: Number(frame.throttle ?? frame.gas ?? frame.inputThrottle ?? 0),
    brake: Number(frame.brake ?? frame.inputBrake ?? 0),
    abs: Boolean(frame.abs ?? frame.absActive ?? false),
    tcs: Boolean(frame.tcs ?? frame.tractionControl ?? false),
    headlights: Boolean(frame.headlights ?? false),
    turnLeft: Boolean(frame.turnLeft ?? false),
    turnRight: Boolean(frame.turnRight ?? false),
    pitLimiter: Boolean(frame.pitLimiter ?? false),
  };
}

function setFrame(frame) {
  target = { ...target, ...normalizeFrame(frame) };
}

window.Glassline?.receive?.({
  type: "telemetry.vehicle",
  payload: target,
});

window.glassline?.on?.("telemetry.vehicle", setFrame);

function animate(now) {
  const elapsed = (now - start) / 1000;

  if (!window.glassline) {
    const wave = (Math.sin(elapsed * 0.9) + 1) * 0.5;
    const pulse = (Math.sin(elapsed * 1.8) + 1) * 0.5;
    target = {
      ...target,
      speedKmh: 72 + wave * 86,
      rpm: 2200 + pulse * 5300,
      gear: Math.max(1, Math.min(6, Math.floor(1 + wave * 6))),
      throttle: 0.18 + wave * 0.72,
      brake: Math.max(0, Math.sin(elapsed * 0.7 - 1.8)) * 0.62,
      fuel: 0.73,
      abs: Math.sin(elapsed * 2.6) > 0.86,
      tcs: true,
      turnLeft: false,
      turnRight: Math.sin(elapsed * 0.5) > 0.82,
      pitLimiter: false,
    };
  }

  const t = 0.12;
  for (const key of ["speedKmh", "rpm", "gear", "fuel", "throttle", "brake"]) {
    shown[key] = lerp(Number(shown[key] ?? 0), Number(target[key] ?? 0), t);
  }
  for (const key of ["abs", "tcs", "headlights", "turnLeft", "turnRight", "pitLimiter"]) {
    shown[key] = target[key];
  }

  drawGauge(elapsed);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
