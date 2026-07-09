/**
 * Portfolio3D - Professional Interactive 3D Scene
 * Uses Three.js for WebGL rendering with floating abstract geometry,
 * interactive particle systems, and scroll-driven animations.
 */
(function () {
  'use strict';

  // ===== Configuration =====
  const CONFIG = {
    particleCount: 150,
    geometryCount: 8,
    ringCount: 4,
    ambientIntensity: 0.5,
    dirLightIntensity: 1.2,
    scrollFactor: 0.15,
    mouseInfluence: 0.08,
    rotationSpeed: 0.15,
    floatAmplitude: 0.3,
  };

  /**
   * Portfolio3D class - manages the entire 3D scene
   */
  class Portfolio3D {
    constructor() {
      this.container = null;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.scrollY = 0;
      this.targetScrollY = 0;
      this.objects = [];
      this.particles = null;
      this.rings = [];
      this.clock = new THREE.Clock();
      this.startTime = performance.now();
      this.isDestroyed = false;
      this.rafId = null;
    }

    /**
     * Initialize the 3D scene and attach to DOM container
     * @param {HTMLElement|string} container - Container element or selector
     */
    init(container) {
      if (typeof container === 'string') {
        container = document.querySelector(container);
      }
      if (!container) {
        console.error('[Portfolio3D] Container not found');
        return;
      }
      this.container = container;

      // Create Scene
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.0008);

      // Create Camera
      const aspect = window.innerWidth / window.innerHeight;
      this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 2000);
      this.camera.position.set(0, 0, 12);

      // Create Renderer
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.2;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;

      // Style canvas
      const canvas = this.renderer.domElement;
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = '-1';
      canvas.style.pointerEvents = 'none';

      container.appendChild(canvas);

      // Build scene
      this._createLights();
      this._createParticles();
      this._createGeometries();
      this._createRings();

      // Event listeners
      this._bindEvents();

      // Start loop
      this._animate();
    }

    // ===== Private: Lights =====
    _createLights() {
      const ambient = new THREE.AmbientLight(0x404080, CONFIG.ambientIntensity);
      this.scene.add(ambient);

      const dirLight = new THREE.DirectionalLight(0xa78bfa, CONFIG.dirLightIntensity);
      dirLight.position.set(5, 10, 7);
      dirLight.castShadow = true;
      this.scene.add(dirLight);

      const fillLight = new THREE.DirectionalLight(0x6366f1, 0.6);
      fillLight.position.set(-5, -3, -5);
      this.scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0x3b82f6, 0.4);
      rimLight.position.set(0, -8, 5);
      this.scene.add(rimLight);

      // Hemisphere light for natural color variation
      const hemiLight = new THREE.HemisphereLight(0xa78bfa, 0x0a0a1a, 0.4);
      this.scene.add(hemiLight);

      // Store for animation
      this.dirLight = dirLight;
    }

    // ===== Private: 3D Particles Galaxy =====
    _createParticles() {
      const count = CONFIG.particleCount;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const velocities = [];
      const spawnPositions = [];

      const colorPalette = [
        new THREE.Color(0xa78bfa), // purple
        new THREE.Color(0x6366f1), // indigo
        new THREE.Color(0x3b82f6), // blue
        new THREE.Color(0x8b5cf6), // violet
        new THREE.Color(0xec4899), // pink accent
      ];

      for (let i = 0; i < count; i++) {
        // Distribute in a sphere with some randomness
        const radius = 8 + Math.random() * 6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta) * 0.6; // flatten vertically
        const z = radius * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        spawnPositions.push({ x, y, z });

        const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;

        sizes[i] = 0.05 + Math.random() * 0.15;

        velocities.push({
          x: (Math.random() - 0.5) * 0.002,
          y: (Math.random() - 0.5) * 0.002,
          z: (Math.random() - 0.5) * 0.002,
          phase: Math.random() * Math.PI * 2,
          speed: 0.2 + Math.random() * 0.5,
        });
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      // Custom particle texture
      const canvas2d = document.createElement('canvas');
      canvas2d.width = 64;
      canvas2d.height = 64;
      const ctx = canvas2d.getContext('2d');
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      const texture = new THREE.CanvasTexture(canvas2d);

      const material = new THREE.PointsMaterial({
        size: 0.25,
        map: texture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.8,
        vertexColors: true,
        sizeAttenuation: true,
      });

      this.particles = new THREE.Points(geometry, material);
      this.particleVelocities = velocities;
      this.particleSpawnPositions = spawnPositions;
      this.scene.add(this.particles);
    }

    // ===== Private: Floating Abstract Geometries =====
    _createGeometries() {
      const geometryTypes = [
        { create: () => new THREE.IcosahedronGeometry(0.6, 0), color: 0xa78bfa },
        { create: () => new THREE.OctahedronGeometry(0.55, 0), color: 0x6366f1 },
        { create: () => new THREE.TorusKnotGeometry(0.45, 0.18, 64, 8, 2, 3), color: 0x3b82f6 },
        { create: () => new THREE.DodecahedronGeometry(0.5, 0), color: 0x8b5cf6 },
        { create: () => new THREE.TetrahedronGeometry(0.6, 0), color: 0xec4899 },
        { create: () => new THREE.TorusGeometry(0.5, 0.2, 16, 32), color: 0x06b6d4 },
        { create: () => new THREE.IcosahedronGeometry(0.4, 1), color: 0xf59e0b },
        { create: () => new THREE.BoxGeometry(0.7, 0.7, 0.7), color: 0x10b981 },
      ];

      const count = Math.min(CONFIG.geometryCount, geometryTypes.length);

      // Shared material cache for performance
      const materialCache = new Map();

      for (let i = 0; i < count; i++) {
        const config = geometryTypes[i];
        const geometry = config.create();

        // Reuse materials with same color
        let material = materialCache.get(config.color);
        if (!material) {
          const color = new THREE.Color(config.color);
          material = new THREE.MeshPhysicalMaterial({
            color: color,
            metalness: 0.1,
            roughness: 0.3,
            clearcoat: 0.4,
            clearcoatRoughness: 0.3,
            transparent: true,
            opacity: 0.5 + Math.random() * 0.3,
            envMapIntensity: 1.0,
            emissive: color,
            emissiveIntensity: 0.05,
          });
          materialCache.set(config.color, material);
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Position in 3D space around the scene
        const angle = (i / count) * Math.PI * 2;
        const radius = 3.5 + Math.random() * 2.5;
        const yOffset = (Math.random() - 0.5) * 4;

        mesh.position.set(
          Math.cos(angle) * radius,
          yOffset,
          Math.sin(angle) * radius - 2
        );

        // Random scale variation
        const scale = 0.7 + Math.random() * 0.8;
        mesh.scale.set(scale, scale, scale);

        // Store animation params
        mesh.userData = {
          basePos: mesh.position.clone(),
          rotSpeed: {
            x: (Math.random() - 0.5) * CONFIG.rotationSpeed,
            y: (Math.random() - 0.5) * CONFIG.rotationSpeed,
            z: (Math.random() - 0.5) * CONFIG.rotationSpeed,
          },
          floatOffset: Math.random() * Math.PI * 2,
          floatSpeed: 0.3 + Math.random() * 0.5,
          floatAmp: CONFIG.floatAmplitude * (0.5 + Math.random() * 0.5),
          phase: angle,
          orbitSpeed: 0.05 + Math.random() * 0.05,
          orbitRadius: radius,
          yOffset: yOffset,
        };

        this.scene.add(mesh);
        this.objects.push(mesh);
      }
    }

    // ===== Private: Orbital Rings =====
    _createRings() {
      const ringColors = [0xa78bfa, 0x6366f1, 0x3b82f6, 0x8b5cf6];
      const count = CONFIG.ringCount;

      for (let i = 0; i < count; i++) {
        const radius = 2.5 + i * 1.2;
        const geometry = new THREE.RingGeometry(radius - 0.02, radius, 64);
        const material = new THREE.MeshBasicMaterial({
          color: ringColors[i % ringColors.length],
          transparent: true,
          opacity: 0.06 + (i * 0.02),
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const ring = new THREE.Mesh(geometry, material);

        // Rotate rings in different orientations
        ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        ring.rotation.y = Math.random() * Math.PI;
        ring.position.y = (Math.random() - 0.5) * 2;

        ring.userData = {
          rotSpeedX: (Math.random() - 0.5) * 0.1,
          rotSpeedY: (Math.random() - 0.5) * 0.1,
          rotSpeedZ: (Math.random() - 0.5) * 0.1,
          floatOffset: Math.random() * Math.PI * 2,
          floatSpeed: 0.2 + Math.random() * 0.3,
          floatAmp: 0.3 + Math.random() * 0.3,
          baseY: ring.position.y,
        };

        this.scene.add(ring);
        this.rings.push(ring);
      }
    }

    // ===== Private: Event Binding =====
    _bindEvents() {
      this._onResize = this._handleResize.bind(this);
      this._onMouse = this._handleMouse.bind(this);
      this._onScroll = this._handleScroll.bind(this);

      window.addEventListener('resize', this._onResize, { passive: true });
      window.addEventListener('mousemove', this._onMouse, { passive: true });
      window.addEventListener('touchmove', this._onMouse, { passive: true });
      window.addEventListener('scroll', this._onScroll, { passive: true });
    }

    _handleResize() {
      if (!this.camera || !this.renderer || this.isDestroyed) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }

    _handleMouse(e) {
      const x = e.clientX ?? (e.touches?.[0]?.clientX ?? 0);
      const y = e.clientY ?? (e.touches?.[0]?.clientY ?? 0);
      this.mouse.targetX = (x / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(y / window.innerHeight) * 2 + 1;
    }

    _handleScroll() {
      this.targetScrollY = window.scrollY;
    }

    // ===== Private: Animation Loop =====
    _animate() {
      if (this.isDestroyed) return;

      this.rafId = requestAnimationFrame(this._animate.bind(this));

      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // Smooth mouse interpolation
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

      // Smooth scroll
      this.scrollY += (this.targetScrollY - this.scrollY) * 0.05;

      // ---- Update Camera ----
      const scrollOffset = this.scrollY * CONFIG.scrollFactor;
      this.camera.position.x += (this.mouse.x * 0.3 - this.camera.position.x) * 0.02;
      this.camera.position.y = 1.5 - scrollOffset * 0.02;
      this.camera.lookAt(0, 0 - scrollOffset * 0.01, 0);

      // ---- Update Light ----
      if (this.dirLight) {
        this.dirLight.position.x = 5 + Math.sin(elapsed * 0.2) * 3;
        this.dirLight.position.z = 7 + Math.cos(elapsed * 0.15) * 3;
      }

      // ---- Update Floating Geometries ----
      const mouseInfluence = CONFIG.mouseInfluence;
      for (const obj of this.objects) {
        const ud = obj.userData;

        // Orbit animation
        const orbitAngle = ud.phase + elapsed * ud.orbitSpeed;
        obj.position.x = Math.cos(orbitAngle) * ud.orbitRadius + this.mouse.x * mouseInfluence;
        obj.position.z = Math.sin(orbitAngle) * ud.orbitRadius + this.mouse.y * mouseInfluence;

        // Float animation
        obj.position.y = ud.yOffset +
          Math.sin(elapsed * ud.floatSpeed + ud.floatOffset) * ud.floatAmp +
          this.mouse.y * mouseInfluence * 0.5;

        // Rotation
        obj.rotation.x += ud.rotSpeed.x * delta * 30;
        obj.rotation.y += ud.rotSpeed.y * delta * 30;
        obj.rotation.z += ud.rotSpeed.z * delta * 30;
      }

      // ---- Update Rings ----
      for (const ring of this.rings) {
        const ud = ring.userData;
        ring.rotation.x += ud.rotSpeedX * delta * 30;
        ring.rotation.y += ud.rotSpeedY * delta * 30;
        ring.rotation.z += ud.rotSpeedZ * delta * 30;
        ring.position.y = ud.baseY +
          Math.sin(elapsed * ud.floatSpeed + ud.floatOffset) * ud.floatAmp;
      }

      // ---- Update Particles ----
      if (this.particles) {
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length / 3; i++) {
          const vel = this.particleVelocities[i];
          const spawn = this.particleSpawnPositions[i];

          // Orbital drift with gentle wave
          const waveX = Math.sin(elapsed * vel.speed + vel.phase) * 0.3;
          const waveY = Math.cos(elapsed * vel.speed * 0.7 + vel.phase) * 0.3;
          const waveZ = Math.sin(elapsed * vel.speed * 0.5 + vel.phase * 1.3) * 0.3;

          positions[i * 3] = spawn.x + waveX + this.mouse.x * 0.2;
          positions[i * 3 + 1] = spawn.y + waveY - this.scrollY * 0.01;
          positions[i * 3 + 2] = spawn.z + waveZ + this.mouse.y * 0.2;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;

        // Slowly rotate entire particle system
        this.particles.rotation.y = elapsed * 0.01;
        this.particles.rotation.x = Math.sin(elapsed * 0.005) * 0.05;
      }

      // ---- Render ----
      this.renderer.render(this.scene, this.camera);
    }

    // ===== Public: Theme Update =====
    /**
     * Update scene background/fog for theme changes
     * @param {string} theme - 'dark' or 'light'
     */
    updateTheme(theme) {
      if (!this.scene) return;
      
      const isLight = theme === 'light';

      if (isLight) {
        this.scene.fog = new THREE.FogExp2(0xf8f9fa, 0.0005);
        this.renderer.toneMappingExposure = 1.0;
      } else {
        this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.0008);
        this.renderer.toneMappingExposure = 1.2;
      }

      // Define color palettes
      const darkPalette = [
        new THREE.Color(0xa78bfa), // light purple
        new THREE.Color(0x6366f1), // indigo
        new THREE.Color(0x3b82f6), // blue
        new THREE.Color(0x8b5cf6), // violet
        new THREE.Color(0xec4899), // pink
      ];
      
      const lightPalette = [
        new THREE.Color(0x6b21a8), // deep purple
        new THREE.Color(0x3730a3), // deep indigo
        new THREE.Color(0x1d4ed8), // deep blue
        new THREE.Color(0x5b21b6), // deep violet
        new THREE.Color(0xbe185d), // deep pink
      ];
      
      const palette = isLight ? lightPalette : darkPalette;

      // Update Particles
      if (this.particles) {
        const colors = this.particles.geometry.attributes.color.array;
        for (let i = 0; i < CONFIG.particleCount; i++) {
          const col = palette[Math.floor(Math.random() * palette.length)];
          colors[i * 3] = col.r;
          colors[i * 3 + 1] = col.g;
          colors[i * 3 + 2] = col.b;
        }
        this.particles.geometry.attributes.color.needsUpdate = true;
        
        // Additive blending washes out against white backgrounds.
        this.particles.material.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
        this.particles.material.opacity = isLight ? 0.7 : 0.8;
      }

      // Update Floating Geometries
      if (this.objects) {
        this.objects.forEach((obj, i) => {
          const col = palette[i % palette.length];
          obj.material.color.copy(col);
          obj.material.emissive.copy(col);
          obj.material.emissiveIntensity = isLight ? 0 : 0.05; // Remove glow in light mode to preserve deep colors
          obj.material.opacity = isLight ? 0.8 : 0.5 + Math.random() * 0.3;
        });
      }

      // Update Rings
      if (this.rings) {
        this.rings.forEach((ring, i) => {
          const col = palette[i % palette.length];
          ring.material.color.copy(col);
          ring.material.opacity = isLight ? 0.25 : 0.15;
          ring.material.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
        });
      }
    }

    // ===== Public: Destroy =====
    destroy() {
      this.isDestroyed = true;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }

      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouse);
      window.removeEventListener('touchmove', this._onMouse);
      window.removeEventListener('scroll', this._onScroll);

      // Dispose objects
      this.objects.forEach((obj) => {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      });
      this.rings.forEach((ring) => {
        ring.geometry.dispose();
        ring.material.dispose();
      });
      if (this.particles) {
        this.particles.geometry.dispose();
        this.particles.material.dispose();
      }

      if (this.renderer) {
        this.renderer.dispose();
        if (this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
      }

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.objects = [];
      this.rings = [];
      this.particles = null;
    }
  }

  // ===== Export globally =====
  window.Portfolio3D = Portfolio3D;
})();