import * as THREE from 'three';

export function initHeroEarth(canvas, frame) {
  if (!canvas || !frame) return undefined;
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (error) {
    console.warn('The Earth scene could not start; showing the static satellite texture instead.', error);
  }

  if (!renderer) return undefined;

  if (renderer) {
    let disposed = false;
    let animationFrame = 0;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 7.5);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    scene.add(new THREE.AmbientLight(0xffffff, 1.05));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(-3.5, 3.2, 5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xc7e4ff, 13, 12);
    rimLight.position.set(3.4, 0.2, -3.2);
    scene.add(rimLight);
    const colorLight = new THREE.PointLight(0xff5ca8, 5, 10);
    colorLight.position.set(-3, -2.5, 2.5);
    scene.add(colorLight);

    const earth = new THREE.Group();
    earth.rotation.y = Math.PI * 0.93;
    scene.add(earth);

    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: new THREE.Color(0x7fa6c9),
      shininess: 14
    });
    const globe = new THREE.Mesh(new THREE.SphereGeometry(1.19, 96, 64), earthMaterial);
    earth.add(globe);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.235, 80, 56),
      new THREE.MeshBasicMaterial({
        color: 0x52baff,
        transparent: true,
        opacity: 0.16,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    earth.add(atmosphere);

    new THREE.TextureLoader().load(
      new URL('../images/earth-blue-marble.jpg', import.meta.url).href,
      texture => {
        if (disposed) { texture.dispose(); return; }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        earthMaterial.map = texture;
        earthMaterial.needsUpdate = true;
        frame.classList.add('earth-ready');
      },
      undefined,
      error => console.error('Could not load the NASA Earth texture.', error)
    );

    const orbitSystem = new THREE.Group();
    scene.add(orbitSystem);

    const flareCanvas = document.createElement('canvas');
    flareCanvas.width = 128;
    flareCanvas.height = 128;
    const flareContext = flareCanvas.getContext('2d');
    const flareGlow = flareContext.createRadialGradient(64, 64, 1, 64, 64, 62);
    flareGlow.addColorStop(0, 'rgba(255,255,255,1)');
    flareGlow.addColorStop(0.09, 'rgba(255,255,255,.92)');
    flareGlow.addColorStop(0.28, 'rgba(255,245,220,.48)');
    flareGlow.addColorStop(1, 'rgba(255,255,255,0)');
    flareContext.fillStyle = flareGlow;
    flareContext.fillRect(0, 0, 128, 128);
    flareContext.fillStyle = 'rgba(255,255,255,.92)';
    flareContext.beginPath();
    flareContext.moveTo(64, 8); flareContext.quadraticCurveTo(71, 57, 120, 64);
    flareContext.quadraticCurveTo(71, 71, 64, 120); flareContext.quadraticCurveTo(57, 71, 8, 64);
    flareContext.quadraticCurveTo(57, 57, 64, 8); flareContext.fill();
    const flareTexture = new THREE.CanvasTexture(flareCanvas);
    flareTexture.colorSpace = THREE.SRGBColorSpace;

    const ringSpecs = [
      { inner: 1.30, outer: 1.52, color: 0xa855f7, glow: 0x52209b, tilt: [-0.82, 0.13, -0.24], speed: 2.2 },
      { inner: 1.55, outer: 1.77, color: 0x22d3ee, glow: 0x087f9d, tilt: [0.72, -0.28, 0.52], speed: -1.75 },
      { inner: 1.80, outer: 2.00, color: 0xfb7185, glow: 0xa52b53, tilt: [1.2, 0.42, 0.88], speed: 2.55 }
    ];

    const sparkles = [];
    const ringGroups = ringSpecs.map(({ inner, outer, color, glow, tilt, speed }, ringIndex) => {
      const orientation = new THREE.Group();
      orientation.rotation.set(...tilt);
      orientation.userData.precession = speed * 0.22;
      orientation.userData.wobble = speed * 0.055;
      orbitSystem.add(orientation);

      const spin = new THREE.Group();
      spin.userData.speed = speed;
      orientation.add(spin);

      const bandShape = new THREE.Shape();
      bandShape.absarc(0, 0, outer, 0, Math.PI * 2, false);
      const bandHole = new THREE.Path();
      bandHole.absarc(0, 0, inner, 0, Math.PI * 2, true);
      bandShape.holes.push(bandHole);
      const bandDepth = 0.07;
      const bandGeometry = new THREE.ExtrudeGeometry(bandShape, {
        depth: bandDepth,
        bevelEnabled: true,
        bevelSegments: 4,
        bevelSize: 0.012,
        bevelThickness: 0.016,
        curveSegments: 256,
        steps: 1
      });
      bandGeometry.translate(0, 0, -bandDepth / 2);
      const ringMaterial = new THREE.MeshPhongMaterial({
        color,
        specular: 0xffffff,
        shininess: 220,
        emissive: glow,
        emissiveIntensity: 0.16
      });
      const ring = new THREE.Mesh(bandGeometry, ringMaterial);
      spin.add(ring);

      const polishedEdge = new THREE.MeshPhongMaterial({ color: 0xf3e9ff, specular: 0xffffff, shininess: 250 });
      [inner, outer].forEach(edgeRadius => {
        const edge = new THREE.Mesh(new THREE.TorusGeometry(edgeRadius, 0.012, 10, 320), polishedEdge);
        edge.position.z = bandDepth * 0.54;
        spin.add(edge);
      });

      for (let i = 0; i < 2; i += 1) {
        const flareMaterial = new THREE.SpriteMaterial({
          map: flareTexture,
          color: ringIndex === 1 ? 0xffffff : 0xf3dcff,
          transparent: true,
          opacity: 0.96,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const flare = new THREE.Sprite(flareMaterial);
        const angle = ringIndex * 1.2 + i * Math.PI;
        const radius = (inner + outer) / 2;
        flare.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, bandDepth * 0.78);
        flare.scale.set(0.2, 0.2, 1);
        flare.userData.phase = angle + ringIndex;
        spin.add(flare);
        sparkles.push(flare);
      }

      return { spin, orientation };
    });

    const starPositions = [];
    for (let i = 0; i < 150; i += 1) {
      const theta = Math.random() * Math.PI * 2;
      const y = Math.random() * 2 - 1;
      const radius = 2.15 + Math.random() * 1.8;
      const horizontal = Math.sqrt(1 - y * y);
      starPositions.push(Math.cos(theta) * horizontal * radius, y * radius, Math.sin(theta) * horizontal * radius);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0xd6d3ff, size: 0.018, transparent: true, opacity: 0.75, sizeAttenuation: true })
    );
    scene.add(stars);

    const resize = () => {
      const { width, height } = frame.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width / height < 0.9 ? 8.1 : 7.5;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(frame);
    resize();

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = new THREE.Clock();
    const draw = () => {
      const delta = Math.min(clock.getDelta(), 0.04);
      if (!reducedMotion && !document.hidden) {
        earth.rotation.y += delta * 0.12;
        ringGroups.forEach(({ spin, orientation }) => {
          spin.rotation.z += delta * spin.userData.speed;
          orientation.rotation.y += delta * orientation.userData.precession;
          orientation.rotation.x += delta * orientation.userData.wobble;
        });
        sparkles.forEach(sparkle => {
          const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 8 + sparkle.userData.phase);
          const size = 0.11 + pulse * 0.15;
          sparkle.scale.set(size, size, 1);
          sparkle.material.opacity = 0.4 + pulse * 0.6;
        });
        stars.rotation.y += delta * 0.009;
      }
      renderer.render(scene, camera);
      if (!reducedMotion) animationFrame = window.requestAnimationFrame(draw);
    };
    draw();
    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      scene.traverse(object => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach(material => material.dispose());
        else object.material?.dispose();
      });
      earthMaterial.map?.dispose();
      flareTexture.dispose();
      renderer.dispose();
    };
  }
}
