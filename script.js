// ── Safe AI Response Bank ─────────────────────────────
// These give contextual, helpful answers when input is clean.
// ── State ─────────────────────────────────────────────

// console.log("OPENAI KEY:", process.env.OPENAI_API_KEY ? "YES" : "NO");


let isDanger = false;
let currentScore = 12;
let targetScore = 12;
let animFrame = null;

// ── Gauge Animation ───────────────────────────────────
// Circumference for r=48: 2π×48 ≈ 301.59
const CIRC = 301.59;

function scoreToOffset(score) {
    return CIRC - (score / 100) * CIRC;
}

function setGaugeImmediate(score, danger, warn) {
    const fill = document.getElementById('gauge-fill');
    const scoreEl = document.getElementById('gauge-score');
    const labelEl = document.getElementById('gauge-label');
    const statusEl = document.getElementById('gauge-status');
    const levelTag = document.getElementById('gauge-level-tag');
    const alertBan = document.getElementById('alert-banner');
    const execBtn = document.getElementById('exec-btn');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');

    // clamp score
    score = Math.max(0, Math.min(100, score));

    // update gauge ring
    const offset = CIRC - (score / 100) * CIRC;
    fill.style.strokeDashoffset = offset;

    // update score text
    scoreEl.textContent = Math.round(score);

    // reset classes
    fill.classList.remove('warn', 'danger');
    scoreEl.classList.remove('warn', 'danger');
    statusEl.classList.remove('warn', 'danger');
    statusDot.classList.remove('danger');
    execBtn.classList.remove('danger');
    alertBan.classList.remove('show');

    document.body.classList.remove('danger-mode');

    // SAFE
    if (score < 40) {
        labelEl.textContent = "SAFE ZONE";
        statusEl.textContent = "● MINIMAL THREAT";
        levelTag.textContent = "SAFE";

        fill.style.stroke = "#00FFC2";
        statusDot.style.background = "#00FFC2";
    }

    // WARN
    else if (score < 75) {
        fill.classList.add('warn');
        scoreEl.classList.add('warn');
        statusEl.classList.add('warn');

        labelEl.textContent = "CAUTION ZONE";
        statusEl.textContent = "● SUSPICIOUS INPUT";
        levelTag.textContent = "WARN";

        fill.style.stroke = "#FFB347";
        statusDot.style.background = "#FFB347";
    }

    // DANGER
    else {
        fill.classList.add('danger');
        scoreEl.classList.add('danger');
        statusEl.classList.add('danger');

        labelEl.textContent = "DANGER ZONE";
        statusEl.textContent = "● THREAT DETECTED";
        levelTag.textContent = "DANGER";

        fill.style.stroke = "#FF4B5C";
        statusDot.classList.add('danger');
        execBtn.classList.add('danger');

        alertBan.classList.add('show');
        document.body.classList.add('danger-mode');
    }
}

// Smooth animated counter for gauge score
function animateGauge(from, to, danger, warn) {
    if (animFrame) cancelAnimationFrame(animFrame);
    const duration = 600;
    const start = performance.now();

    function step(now) {
        const elapsed = now - start;
        const t = Math.min(elapsed / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const current = from + (to - from) * eased;
        setGaugeImmediate(current, danger, warn);
        if (t < 1) animFrame = requestAnimationFrame(step);
    }
    animFrame = requestAnimationFrame(step);
}

// ── Real-time Input Scanning (live gauge on keyup) ─────
document.getElementById('chat-input').addEventListener('input', function () {
    const text = this.value.toLowerCase();

    let score = 0;

    // weighted detection
    const rules = [
        { pattern: /ignore (all )?(previous|instructions)/i, weight: 35 },
        { pattern: /jailbreak|dev mode|developer mode/i, weight: 50 },
        { pattern: /system prompt|override/i, weight: 45 },
        { pattern: /pretend to be|act as if/i, weight: 25 },
        { pattern: /unrestricted|no restrictions/i, weight: 40 },
        { pattern: /roleplay as|new persona/i, weight: 20 }
    ];

    rules.forEach(r => {
        if (r.pattern.test(text)) {
            score += r.weight;
        }
    });

    // clamp score
    score = Math.min(100, score);

    // decide state
    const danger = score >= 70;
    const warn = score >= 40 && score < 70;

    animateGauge(currentScore, score, danger, warn);
    isDanger = danger;
});

// ── Send Message ──────────────────────────────────────
async function sendMessage() {
    const inputEl = document.getElementById('chat-input');

    if (!inputEl) return;

    const message = inputEl.value?.trim();

    if (!message) return;

    console.log("SENDING:", message);

    // ✅ THIS WAS MISSING (THIS IS WHY MESSAGE IS NOT VISIBLE)
    appendMessage('user', message);

    inputEl.value = '';

    try {
        const isFirewallEnabled = document.getElementById('firewall-toggle')?.checked !== false;

        const res = await fetch("http://localhost:3000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, enableFirewall: isFirewallEnabled })
        });

        if (!res.ok) {
            console.error("Backend error:", res.status, res.statusText);
            const text = await res.text();
            console.error("Response body:", text);
            appendMessage('ai', "Error connecting to the server.", true);
            return;
        }

        const data = await res.json();

        console.log("RESPONSE:", data);

        // If the prompt was sanitized, show the refinement message!
        if (data.sanitized) {
            appendMessage('ai', `⚠️ Prompt refined to: "${data.sanitizedPrompt}"`, false);
            const fwVal = document.getElementById('h-firewall');
            if (fwVal) fwVal.textContent = "50%";
        } else if (data.blocked) {
            const fwVal = document.getElementById('h-firewall');
            if (fwVal) fwVal.textContent = "0%";
        } else {
            const fwVal = document.getElementById('h-firewall');
            if (fwVal) fwVal.textContent = "100%";
        }

        // optional: show AI reply too
        appendMessage('ai', data.reply || "No response", data.blocked);
    } catch (err) {
        console.error("Fetch error:", err);
        appendMessage('ai', "Error connecting to the server.", true);
    }
}

// ── DOM Helpers ───────────────────────────────────────
function appendMessage(role, content, danger = false) {
    const msgs = document.getElementById('messages');
    const typingEl = document.getElementById('typing-indicator');

    if (!msgs) {
        console.error("❌ messages container not found in HTML");
        return;
    }

    const row = document.createElement('div');
    row.className = `msg ${role}`;

    const avatar = document.createElement('div');
    avatar.className = role === 'user' ? 'msg-avatar user-av' : 'msg-avatar';
    avatar.textContent = role === 'user' ? 'ME' : 'AG';

    const bubble = document.createElement('div');
    bubble.className = danger ? 'msg-bubble danger-msg' : 'msg-bubble';
    bubble.textContent = content; // IMPORTANT FIX

    row.appendChild(avatar);
    row.appendChild(bubble);

    if (typingEl && typingEl.parentNode === msgs) {
        msgs.insertBefore(row, typingEl);
    } else {
        msgs.appendChild(row);
    }
}

function addLogEntry(text, threat) {
    const log = document.getElementById('threat-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';

    const now = new Date();
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const label = threat
        ? `Blocked: "${text.slice(0, 22)}${text.length > 22 ? '…' : ''}"`
        : `Cleared: "${text.slice(0, 22)}${text.length > 22 ? '…' : ''}"`;

    entry.innerHTML = `
        <div class="log-dot ${threat ? 'threat' : 'safe'}"></div>
        <span>${label}</span>
        <span class="log-time">${time}</span>
    `;

    log.prepend(entry);

    // Keep max 8 entries
    while (log.children.length > 8) {
        log.removeChild(log.lastChild);
    }
}

// ── Enter key to send ─────────────────────────────────
document.getElementById('chat-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendMessage();
});

// ── Health Bars Animation ─────────────────────────────
function buildHealthBars() {
    const container = document.getElementById('health-bars');
    container.innerHTML = '';
    for (let i = 0; i < 20; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar-col';
        bar.style.height = Math.floor(Math.random() * 80 + 10) + '%';
        container.appendChild(bar);
    }
}
buildHealthBars();

setInterval(() => {
    const bars = document.querySelectorAll('.bar-col');
    const dangerMode = document.body.classList.contains('danger-mode');
    bars.forEach(bar => {
        const h = dangerMode
            ? Math.floor(Math.random() * 60 + 40)
            : Math.floor(Math.random() * 70 + 10);
        bar.style.height = h + '%';
        bar.className = dangerMode ? 'bar-col danger' : 'bar-col';
    });
}, 450);

// ── BPM counter ───────────────────────────────────────
setInterval(() => {
    const dangerMode = document.body.classList.contains('danger-mode');
    const bpm = dangerMode
        ? Math.floor(Math.random() * 30 + 95)
        : Math.floor(Math.random() * 10 + 64);
    const el = document.getElementById('health-ping');
    el.textContent = bpm + ' BPM';
    el.style.color = dangerMode ? 'var(--red)' : 'var(--green)';
}, 1200);

// ── Scan Rate ─────────────────────────────────────────
setInterval(() => {
    const ms = (Math.random() * 1.5 + 0.5).toFixed(1);
    document.getElementById('h-scan').textContent = ms + 'ms';
}, 2000);

// ── Uptime clock ──────────────────────────────────────
let uptimeSeconds = 0;
setInterval(() => {
    uptimeSeconds++;
    const h = String(Math.floor(uptimeSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((uptimeSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(uptimeSeconds % 60).padStart(2, '0');
}, 1000);

(function drawPulse() {
    const canvas = document.getElementById('pulse-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.parentElement.clientWidth || 250;
    const H = 36;
    canvas.width = W;
    canvas.height = H;

    const points = Array.from({ length: W }, () => H / 2);
    let x = 0;

    function animate() {
        const dangerMode = document.body.classList.contains('danger-mode');
        const color = dangerMode ? '#FF4B5C' : '#00FFC2';
        const amplitude = dangerMode ? H * 0.45 : H * 0.3;
        const freq = dangerMode ? 0.25 : 0.15;

        // Shift points left
        points.shift();
        const newY = H / 2 + amplitude * Math.sin(x * freq) * (0.6 + 0.4 * Math.random());
        points.push(newY);
        x += 1;

        ctx.clearRect(0, 0, W, H);
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = dangerMode ? 6 : 4;
        ctx.shadowColor = color;
        ctx.moveTo(0, points[0]);
        points.forEach((py, px) => ctx.lineTo(px, py));
        ctx.stroke();

        requestAnimationFrame(animate);
    }
    animate();
})();
