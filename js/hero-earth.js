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
    renderer.toneMappingExposure = 1.34;

    scene.add(new THREE.AmbientLight(0xffffff, 1.55));
    scene.add(new THREE.HemisphereLight(0xd9f3ff, 0x74516f, 1.05));
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.1);
    keyLight.position.set(-3.5, 3.2, 5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xc7e4ff, 15, 12);
    rimLight.position.set(3.4, 0.2, -3.2);
    scene.add(rimLight);
    const colorLight = new THREE.PointLight(0xff5ca8, 4.5, 10);
    colorLight.position.set(-3, -2.5, 2.5);
    scene.add(colorLight);

    const earth = new THREE.Group();
    earth.rotation.y = 0.08;
    scene.add(earth);

    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: new THREE.Color(0xe6f7ff),
      shininess: 34,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.26
    });
    const globe = new THREE.Mesh(new THREE.SphereGeometry(1.19, 96, 64), earthMaterial);
    earth.add(globe);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.235, 80, 56),
      new THREE.MeshBasicMaterial({
        color: 0x73dcff,
        transparent: true,
        opacity: 0.17,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    earth.add(atmosphere);

    new THREE.TextureLoader().load(
      new URL('../images/nasa-blue-marble-color.jpg', import.meta.url).href,
      texture => {
        if (disposed) { texture.dispose(); return; }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        earthMaterial.map = texture;
        earthMaterial.emissiveMap = texture;
        earthMaterial.emissiveIntensity = 0.3;
        earthMaterial.needsUpdate = true;
        frame.classList.add('earth-ready');
      },
      undefined,
      error => console.error('Could not load the NASA Blue Marble Earth texture.', error)
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
      { inner: 1.30, outer: 1.52, color: 0xd96bff, glow: 0x9d35ff, tilt: [-0.82, 0.13, -0.24], speed: 2.2 },
      { inner: 1.55, outer: 1.77, color: 0x49f4ff, glow: 0x09bfe8, tilt: [0.72, -0.28, 0.52], speed: -1.75 },
      { inner: 1.80, outer: 2.00, color: 0xff8299, glow: 0xe83f72, tilt: [1.2, 0.42, 0.88], speed: 2.55 }
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
      const ringMaterial = new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.14,
        roughness: 0.13,
        clearcoat: 1,
        clearcoatRoughness: 0.045,
        iridescence: 0.72,
        iridescenceIOR: 1.42,
        iridescenceThicknessRange: [220, 560],
        sheen: 0.48,
        sheenColor: new THREE.Color(color),
        emissive: glow,
        emissiveIntensity: 0.62
      });
      const ring = new THREE.Mesh(bandGeometry, ringMaterial);
      spin.add(ring);

      const polishedEdge = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.18, roughness: 0.055, clearcoat: 1, clearcoatRoughness: 0.025, emissive: color, emissiveIntensity: 0.24 });
      const haloEdge = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false });
      [inner, outer].forEach(edgeRadius => {
        const edge = new THREE.Mesh(new THREE.TorusGeometry(edgeRadius, 0.012, 10, 320), polishedEdge);
        edge.position.z = bandDepth * 0.56;
        spin.add(edge);
        const halo = new THREE.Mesh(new THREE.TorusGeometry(edgeRadius, 0.035, 8, 320), haloEdge);
        halo.position.z = bandDepth * 0.46;
        spin.add(halo);
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
        earth.rotation.y += delta * 0.22;
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
