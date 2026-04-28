/* ─────────────────────────────────────────────────
   Fayad Kaffoura Portfolio — main.js
   Three.js particle field + scroll animations
───────────────────────────────────────────────── */

// ── Custom Cursor ────────────────────────────────
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let ringX = 0, ringY = 0, dotX = 0, dotY = 0;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dotX = mouseX;
  dotY = mouseY;
  cursorDot.style.left = dotX + 'px';
  cursorDot.style.top  = dotY + 'px';
});

function animateCursor() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// ── Navbar scroll state ───────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

// ── Project card mouse gradient ───────────────────
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});

// ── Scroll reveal ─────────────────────────────────
const revealElements = document.querySelectorAll(
  '.section-header, .about-grid, .skills-wrapper, .projects-grid, .contact-content, footer'
);
revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach(el => revealObserver.observe(el));

// ── Skill bars ────────────────────────────────────
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const items = entry.target.querySelectorAll('.skill-item');
      items.forEach((item, i) => {
        const level = item.dataset.level || 75;
        const fill  = item.querySelector('.skill-fill');
        setTimeout(() => {
          fill.style.width = level + '%';
        }, i * 100);
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skills-wrapper').forEach(el => skillObserver.observe(el));

// ── Three.js Particle Field ───────────────────────
(function initThree() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 60;

  // ── Particle system ──────────────────────────────
  const PARTICLE_COUNT = 2200;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors    = new Float32Array(PARTICLE_COUNT * 3);
  const sizes     = new Float32Array(PARTICLE_COUNT);
  const velocities = [];

  const palette = [
    new THREE.Color('#a78bfa'),
    new THREE.Color('#7c3aed'),
    new THREE.Color('#38bdf8'),
    new THREE.Color('#e2e8f0'),
    new THREE.Color('#64748b'),
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const spread = 140;
    positions[i3]     = (Math.random() - 0.5) * spread;
    positions[i3 + 1] = (Math.random() - 0.5) * spread;
    positions[i3 + 2] = (Math.random() - 0.5) * spread;

    velocities.push({
      x: (Math.random() - 0.5) * 0.004,
      y: (Math.random() - 0.5) * 0.004,
      z: (Math.random() - 0.5) * 0.003,
    });

    const color = palette[Math.floor(Math.random() * palette.length)];
    colors[i3]     = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = Math.random() * 1.8 + 0.3;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float dist = length(mvPosition.xyz);
        vAlpha = smoothstep(80.0, 20.0, dist) * 0.85;
        gl_PointSize = size * (280.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // ── Connection lines ─────────────────────────────
  const LINE_MAX_DIST = 14;
  const linePositions = [];
  const lineColors    = [];

  function buildLines() {
    linePositions.length = 0;
    lineColors.length    = 0;
    const pos = geometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = pos[i*3]   - pos[j*3];
        const dy = pos[i*3+1] - pos[j*3+1];
        const dz = pos[i*3+2] - pos[j*3+2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < LINE_MAX_DIST) {
          const alpha = (1 - dist / LINE_MAX_DIST) * 0.3;
          linePositions.push(pos[i*3], pos[i*3+1], pos[i*3+2]);
          linePositions.push(pos[j*3], pos[j*3+1], pos[j*3+2]);
          lineColors.push(0.66, 0.55, 0.98, alpha);
          lineColors.push(0.66, 0.55, 0.98, alpha);
        }
        if (linePositions.length > 60000) break;
      }
      if (linePositions.length > 60000) break;
    }
  }

  const lineGeo = new THREE.BufferGeometry();
  const linePosBuf   = new THREE.BufferAttribute(new Float32Array(60000), 3);
  const lineColorBuf = new THREE.BufferAttribute(new Float32Array(80000), 4);
  lineGeo.setAttribute('position', linePosBuf);
  lineGeo.setAttribute('color', lineColorBuf);

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    opacity: 0.6,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  // ── Mouse influence ──────────────────────────────
  let normMouseX = 0, normMouseY = 0;
  document.addEventListener('mousemove', (e) => {
    normMouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    normMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Resize ───────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Animate ──────────────────────────────────────
  let frame = 0;
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t    = clock.getElapsedTime();
    frame++;

    const pos = geometry.attributes.position.array;

    // Move particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3]     += velocities[i].x;
      pos[i3 + 1] += velocities[i].y;
      pos[i3 + 2] += velocities[i].z;

      // Boundary wrap
      const lim = 70;
      if (pos[i3]     > lim) pos[i3]     = -lim;
      if (pos[i3]     < -lim) pos[i3]    = lim;
      if (pos[i3 + 1] > lim) pos[i3+1]  = -lim;
      if (pos[i3 + 1] < -lim) pos[i3+1] = lim;
      if (pos[i3 + 2] > lim) pos[i3+2]  = -lim;
      if (pos[i3 + 2] < -lim) pos[i3+2] = lim;
    }
    geometry.attributes.position.needsUpdate = true;

    // Rebuild lines every 4 frames (performance)
    if (frame % 4 === 0) {
      buildLines();
      const lp = linePosBuf.array;
      const lc = lineColorBuf.array;
      for (let i = 0; i < linePositions.length; i++) lp[i] = linePositions[i];
      for (let i = 0; i < lineColors.length; i++)    lc[i] = lineColors[i];
      lineGeo.setDrawRange(0, linePositions.length / 3);
      linePosBuf.needsUpdate   = true;
      lineColorBuf.needsUpdate = true;
    }

    // Scroll-based camera movement
    const scrollY = window.scrollY;
    camera.position.y = -scrollY * 0.015;

    // Mouse parallax on camera
    camera.position.x += (normMouseX * 8 - camera.position.x) * 0.02;
    camera.rotation.y  = normMouseX * 0.04;
    camera.rotation.x  = -normMouseY * 0.04;

    // Gentle particle rotation
    particles.rotation.y = t * 0.012;
    lines.rotation.y     = t * 0.012;

    renderer.render(scene, camera);
  }

  animate();
})();
