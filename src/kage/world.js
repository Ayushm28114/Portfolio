/*
 * Kage-inspired night temple world.
 * ----------------------------------------------------------------------------
 * An original, procedurally-built Three.js scene: a moonlit mountain temple
 * with a vermilion moon, torii gate, stone lanterns, pagoda, rain, drifting
 * leaves, embers, fireflies and layered fog. The camera glides along one
 * continuous path driven by page scroll, with pointer parallax layered on top.
 *
 * Composition notes follow the public build brief of MengTo/kage (fixed
 * full-viewport canvas, scroll-driven camera, restrained bloom, film grain,
 * vignette, warm shoji light vs cold moonlight). Every mesh, texture and
 * motion curve below is written from scratch — no third-party code or art.
 */

import * as THREE from 'three'

/* ------------------------------------------------------------------ */
/* Palette: near-black, blue-charcoal, warm amber, bone, vermilion     */
/* ------------------------------------------------------------------ */
const PAL = {
  sky: 0x0b1120,
  fog: 0x111a2e,
  ridgeFar: 0x0c1424,
  ridgeMid: 0x101a2e,
  ridgeNear: 0x141f36,
  temple: 0x0b0e15,
  roof: 0x06080d,
  vermilion: 0xb8361b,
  moon: 0xff4b26,
  moonHot: 0xff7a4d,
  amber: 0xffb35c,
  amberDeep: 0xd97b2b,
  bone: 0xd9cfb8,
  pine: 0x0a120e,
  maple: 0x5c2115,
  ground: 0x06090f,
  path: 0x0b101a,
}

/* Deterministic RNG so the scene is identical on every load. */
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* Soft radial sprite texture, drawn once on a canvas. */
function makeGlowTexture(size = 128, inner = 'rgba(255,255,255,1)', mid = 'rgba(255,255,255,0.28)') {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, inner)
  g.addColorStop(0.35, mid)
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function makeStreakTexture() {
  const c = document.createElement('canvas')
  c.width = 8
  c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 64)
  g.addColorStop(0, 'rgba(255,255,255,0)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.9)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(2, 0, 4, 64)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/* ------------------------------------------------------------------ */
/* Scene construction                                                  */
/* ------------------------------------------------------------------ */

function buildSky(scene, rand, glowTex) {
  // Stars — small points on a dome, no attenuation so they stay pin-sharp.
  const starCount = 700
  const pos = new Float32Array(starCount * 3)
  const col = new Float32Array(starCount * 3)
  const c = new THREE.Color()
  for (let i = 0; i < starCount; i++) {
    const theta = rand() * Math.PI * 2
    const phi = rand() * Math.PI * 0.48 // upper sky only
    const r = 220
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    pos[i * 3 + 1] = r * Math.cos(phi) * 0.9 + 8
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    const warm = rand()
    c.setHSL(0.08 + warm * 0.5, 0.25, 0.55 + rand() * 0.35)
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  const m = new THREE.PointsMaterial({
    size: 1.6,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    fog: false,
    depthWrite: false,
  })
  scene.add(new THREE.Points(g, m))

  // Vermilion moon + layered glow. fog:false so the haze never swallows it.
  const moonGroup = new THREE.Group()
  const moon = new THREE.Mesh(
    new THREE.CircleGeometry(9, 48),
    new THREE.MeshBasicMaterial({ color: PAL.moon, fog: false })
  )
  moonGroup.add(moon)
  const hotCore = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: PAL.moonHot,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })
  )
  hotCore.scale.setScalar(22)
  moonGroup.add(hotCore)
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: PAL.moon,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })
  )
  halo.scale.setScalar(64)
  moonGroup.add(halo)
  moonGroup.position.set(-46, 40, -170)
  scene.add(moonGroup)
  return { halo, hotCore }
}

/* Layered mountain-ridge silhouettes: jagged strips, hazed by fog. */
function buildRidges(scene, rand) {
  const layers = [
    { z: -150, y: -4, w: 560, h: 66, color: PAL.ridgeFar, seed: 11 },
    { z: -110, y: -5, w: 480, h: 52, color: PAL.ridgeMid, seed: 47 },
    { z: -78, y: -6, w: 400, h: 38, color: PAL.ridgeNear, seed: 83 },
  ]
  for (const L of layers) {
    const r = mulberry32(L.seed)
    const seg = 96
    const geo = new THREE.PlaneGeometry(L.w, L.h, seg, 1)
    const p = geo.attributes.position
    // Ridgeline from layered sine noise; bottom edge stays flat.
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      if (p.getY(i) > 0) {
        const n =
          Math.sin(x * 0.021 + r() * 0.0 + L.seed) * 0.55 +
          Math.sin(x * 0.047 + L.seed * 1.7) * 0.3 +
          Math.sin(x * 0.11 + L.seed * 3.1) * 0.15
        p.setY(i, L.h * 0.5 * (0.45 + 0.55 * (0.5 + 0.5 * n)) - L.h * 0.12)
      } else {
        p.setY(i, -L.h * 0.5)
      }
    }
    geo.computeVertexNormals()
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: L.color, fog: true })
    )
    mesh.position.set(0, L.y + L.h * 0.32, L.z)
    scene.add(mesh)
  }
}

function buildGround(scene) {
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(260, 48),
    new THREE.MeshStandardMaterial({ color: PAL.ground, roughness: 1, metalness: 0 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.02
  scene.add(ground)

  // Stone path implied by lantern light.
  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(5.5, 70),
    new THREE.MeshStandardMaterial({ color: PAL.path, roughness: 1 })
  )
  path.rotation.x = -Math.PI / 2
  path.position.set(0, 0.01, -18)
  scene.add(path)
}

function pyramidRoof(w, h, d, color) {
  const geo = new THREE.ConeGeometry(1, 1, 4, 1)
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color, roughness: 0.95 })
  )
  mesh.scale.set(w * 0.72, h, d * 0.72)
  mesh.rotation.y = Math.PI / 4
  return mesh
}

function buildTemple(scene, glowTex) {
  const group = new THREE.Group()
  const bodyMat = new THREE.MeshStandardMaterial({ color: PAL.temple, roughness: 0.9 })

  // Main hall: body + two roof tiers.
  const hall = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(17, 5.5, 10), bodyMat)
  body.position.y = 2.75
  hall.add(body)
  const eave = pyramidRoof(24, 2.6, 15, PAL.roof)
  eave.position.y = 6.6
  hall.add(eave)
  const upper = new THREE.Mesh(new THREE.BoxGeometry(11, 3.4, 7), bodyMat)
  upper.position.y = 8.6
  hall.add(upper)
  const roofTop = pyramidRoof(15, 2.8, 10.5, PAL.roof)
  roofTop.position.y = 11.6
  hall.add(roofTop)

  // Warm shoji windows — the only warm light source on the hall.
  const winMat = new THREE.MeshBasicMaterial({ color: PAL.amber })
  for (let i = -2; i <= 2; i++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.2), winMat)
    win.position.set(i * 2.9, 2.9, 5.02)
    hall.add(win)
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: PAL.amberDeep,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
    glow.scale.setScalar(4.5)
    glow.position.set(i * 2.9, 2.9, 5.4)
    hall.add(glow)
  }
  group.add(hall)

  // Pagoda silhouette in the distance.
  const pagoda = new THREE.Group()
  let py = 0
  const tiers = [
    [7, 3.2],
    [5.6, 2.8],
    [4.2, 2.5],
  ]
  for (const [w, h] of tiers) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), bodyMat)
    box.position.y = py + h / 2
    pagoda.add(box)
    const roof = pyramidRoof(w * 1.7, 1.6, w * 1.7, PAL.roof)
    roof.position.y = py + h + 0.7
    pagoda.add(roof)
    py += h + 1.15
  }
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.4, 8), bodyMat)
  spire.position.y = py + 1.6
  pagoda.add(spire)
  pagoda.position.set(-30, 0, -74)
  group.add(pagoda)

  group.position.set(9, 0, -58)
  group.rotation.y = -0.12
  scene.add(group)

  // Warm spill light in front of the hall.
  const shoji = new THREE.PointLight(PAL.amber, 88, 50, 2)
  shoji.position.set(9, 4, -50)
  scene.add(shoji)
  return { shoji }
}

function buildTorii(scene) {
  const g = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color: PAL.vermilion, roughness: 0.75 })
  const pillarGeo = new THREE.CylinderGeometry(0.5, 0.62, 7.4, 12)
  for (const x of [-3.4, 3.4]) {
    const p = new THREE.Mesh(pillarGeo, mat)
    p.position.set(x, 3.7, 0)
    g.add(p)
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.85, 1.15), mat)
  lintel.position.y = 7.6
  g.add(lintel)
  const lintel2 = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.5, 0.8), mat)
  lintel2.position.y = 6.2
  g.add(lintel2)
  const cap = new THREE.Mesh(new THREE.BoxGeometry(11, 0.28, 1.5), mat)
  cap.position.y = 8.15
  g.add(cap)
  g.position.set(-7, 0, -30)
  g.rotation.y = 0.1
  scene.add(g)
}

function buildStairs(scene) {
  const mat = new THREE.MeshStandardMaterial({ color: 0x0d1119, roughness: 1 })
  for (let i = 0; i < 14; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(6.5 - i * 0.12, 0.5, 1.6), mat)
    step.position.set(2.5, 0.25 + i * 0.42, -24 - i * 1.7)
    scene.add(step)
  }
}

/* Stone lantern (tōrō). Returns the firebox anchor for light/glow attach. */
function buildLantern(glowTex) {
  const g = new THREE.Group()
  const stone = new THREE.MeshStandardMaterial({ color: 0x151a24, roughness: 1 })
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.5, 1.3), stone)
  base.position.y = 0.25
  g.add(base)
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 1.7, 10), stone)
  pillar.position.y = 1.35
  g.add(pillar)
  const firebox = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.72, 0.95), stone)
  firebox.position.y = 2.55
  g.add(firebox)
  const winMat = new THREE.MeshBasicMaterial({ color: PAL.amber })
  for (let s = 0; s < 4; s++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.4), winMat)
    const a = (s / 4) * Math.PI * 2
    win.position.set(Math.sin(a) * 0.49, 2.55, Math.cos(a) * 0.49)
    win.rotation.y = a
    g.add(win)
  }
  const cap = pyramidRoof(1.7, 0.55, 1.7, stone.color.getHex())
  cap.position.y = 3.15
  g.add(cap)

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: PAL.amber,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  )
  glow.scale.setScalar(5)
  glow.position.y = 2.55
  g.add(glow)
  return { group: g, glow, flameY: 2.55 }
}

function buildLanterns(scene, glowTex, rand) {
  const lanterns = []
  const spots = [
    [-4.2, -9], [4.4, -13], [-4.6, -18], [4.8, -23], [-4.2, -29], [4.4, -35],
  ]
  spots.forEach(([x, z], i) => {
    const { group, glow } = buildLantern(glowTex)
    group.position.set(x, 0, z)
    scene.add(group)
    let light = null
    if (i < 3) {
      light = new THREE.PointLight(PAL.amber, 40, 22, 2)
      light.position.set(x, 2.8, z)
      scene.add(light)
    }
    lanterns.push({
      glow,
      light,
      baseIntensity: light ? 26 : 0,
      phase: rand() * Math.PI * 2,
      x,
      z,
    })
  })
  return lanterns
}

function buildTrees(scene, rand) {
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x0a0d12, roughness: 1 })
  const pineMat = new THREE.MeshStandardMaterial({ color: PAL.pine, roughness: 1 })
  const mapleMat = new THREE.MeshStandardMaterial({ color: PAL.maple, roughness: 1 })

  function pine(x, z, s) {
    const g = new THREE.Group()
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * s, 0.3 * s, 2.4 * s, 7), trunkMat)
    trunk.position.y = 1.2 * s
    g.add(trunk)
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry((2.6 - i * 0.7) * s, 2.4 * s, 8), pineMat)
      cone.position.y = (2.6 + i * 1.5) * s
      g.add(cone)
    }
    g.position.set(x, 0, z)
    g.rotation.y = rand() * Math.PI * 2
    scene.add(g)
  }

  function maple(x, z, s) {
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2 * s, 1), mapleMat)
    blob.position.set(x, 2.6 * s, z)
    blob.scale.y = 0.8
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * s, 0.28 * s, 2.6 * s, 7), trunkMat)
    trunk.position.set(x, 1.3 * s, z)
    scene.add(blob, trunk)
  }

  for (let i = 0; i < 34; i++) {
    const side = i % 2 === 0 ? -1 : 1
    const x = side * (11 + rand() * 30)
    const z = -8 - rand() * 72
    pine(x, z, 0.8 + rand() * 1.1)
  }
  const mapleSpots = [[-14, -34], [13, -44], [-20, -52], [18, -20], [-12, -62]]
  for (const [x, z] of mapleSpots) maple(x, z, 0.9 + rand() * 0.5)
}

/* ------------------------------------------------------------------ */
/* Atmosphere: rain, leaves, embers, fireflies, mist                    */
/* ------------------------------------------------------------------ */

function buildRain(scene, count) {
  const pos = new Float32Array(count * 6)
  const drops = []
  for (let i = 0; i < count; i++) {
    drops.push({
      x: (Math.random() - 0.5) * 90,
      y: Math.random() * 32,
      z: 12 - Math.random() * 80,
      speed: 24 + Math.random() * 10,
    })
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.LineBasicMaterial({
    color: 0x8fa8cc,
    transparent: true,
    opacity: 0.26,
  })
  const lines = new THREE.LineSegments(geo, mat)
  lines.frustumCulled = false
  scene.add(lines)
  return {
    update(dt) {
      const p = geo.attributes.position.array
      for (let i = 0; i < count; i++) {
        const d = drops[i]
        d.y -= d.speed * dt
        d.x += 1.6 * dt // wind slant
        if (d.y < 0) {
          d.y = 30 + Math.random() * 4
          d.x = (Math.random() - 0.5) * 90
          d.z = 12 - Math.random() * 80
        }
        const o = i * 6
        p[o] = d.x
        p[o + 1] = d.y
        p[o + 2] = d.z
        p[o + 3] = d.x - 0.12
        p[o + 4] = d.y + 0.85
        p[o + 5] = d.z
      }
      geo.attributes.position.needsUpdate = true
    },
  }
}

function buildLeaves(scene, rand, count) {
  const geo = new THREE.PlaneGeometry(0.3, 0.22)
  const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true, opacity: 0.95 })
  const mesh = new THREE.InstancedMesh(geo, mat, count)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  mesh.frustumCulled = false
  const dummy = new THREE.Object3D()
  const colors = [PAL.vermilion, 0xd88f2e, PAL.bone, 0x8c2f16].map((h) => new THREE.Color(h))
  const leaves = []
  for (let i = 0; i < count; i++) {
    leaves.push({
      x: (rand() - 0.5) * 70,
      y: rand() * 22,
      z: 8 - rand() * 70,
      fall: 0.7 + rand() * 1.1,
      sway: 0.6 + rand() * 1.4,
      phase: rand() * Math.PI * 2,
      spin: (rand() - 0.5) * 3,
      rot: rand() * Math.PI * 2,
    })
    mesh.setColorAt(i, colors[i % colors.length])
  }
  mesh.instanceColor.needsUpdate = true
  scene.add(mesh)
  return {
    update(dt, t) {
      for (let i = 0; i < count; i++) {
        const l = leaves[i]
        l.y -= l.fall * dt
        l.rot += l.spin * dt
        if (l.y < 0) {
          l.y = 20 + rand() * 4
          l.x = (rand() - 0.5) * 70
          l.z = 8 - rand() * 70
        }
        dummy.position.set(
          l.x + Math.sin(t * l.sway + l.phase) * 1.6,
          l.y,
          l.z + Math.cos(t * l.sway * 0.7 + l.phase) * 0.8
        )
        dummy.rotation.set(l.rot, l.rot * 0.7, l.phase)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    },
  }
}

function buildEmbers(scene, glowTex, rand, lanterns, ambientCount, burstSlots) {
  const total = ambientCount + burstSlots
  const pos = new Float32Array(total * 3)
  const col = new Float32Array(total * 3)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  const mat = new THREE.PointsMaterial({
    size: 0.42,
    map: glowTex,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  scene.add(points)

  const c = new THREE.Color()
  const parts = []
  for (let i = 0; i < total; i++) {
    const ambient = i < ambientCount
    const L = lanterns[i % lanterns.length]
    parts.push({
      ambient,
      x: L.x + (rand() - 0.5) * 1.2,
      y: ambient ? rand() * 4.5 : -999,
      z: L.z + (rand() - 0.5) * 1.2,
      vx: 0,
      vy: 0.9 + rand() * 1.2,
      vz: 0,
      life: ambient ? 1 : 0,
      maxLife: 1,
      lantern: L,
    })
  }

  function burst(worldPos) {
    let spawned = 0
    for (let i = ambientCount; i < total && spawned < 26; i++) {
      const p = parts[i]
      if (p.life > 0) continue
      p.life = p.maxLife = 0.9 + rand() * 0.7
      p.x = worldPos.x
      p.y = worldPos.y
      p.z = worldPos.z
      const a = rand() * Math.PI * 2
      const sp = 1.5 + rand() * 3.5
      p.vx = Math.cos(a) * sp
      p.vy = 1.5 + rand() * 3
      p.vz = Math.sin(a) * sp - 1
      spawned++
    }
  }

  return {
    burst,
    update(dt, t) {
      const p = geo.attributes.position.array
      const cc = geo.attributes.color.array
      for (let i = 0; i < total; i++) {
        const e = parts[i]
        if (e.ambient) {
          e.y += e.vy * dt
          e.x += Math.sin(t * 2 + i) * 0.35 * dt
          if (e.y > 5.5) {
            const L = e.lantern
            e.x = L.x + (rand() - 0.5) * 1.2
            e.y = 2.2
            e.z = L.z + (rand() - 0.5) * 1.2
          }
          const flicker = 0.55 + 0.45 * Math.sin(t * 9 + i * 1.7)
          c.setHex(PAL.amber).multiplyScalar(flicker)
        } else {
          if (e.life > 0) {
            e.life -= dt
            e.x += e.vx * dt
            e.y += e.vy * dt
            e.z += e.vz * dt
            e.vy -= 1.2 * dt
            const k = Math.max(0, e.life / e.maxLife)
            c.setHex(0xffcf7a).multiplyScalar(k)
          } else {
            e.y = -999
            c.setHex(0x000000)
          }
        }
        p[i * 3] = e.x
        p[i * 3 + 1] = e.y
        p[i * 3 + 2] = e.z
        cc[i * 3] = c.r
        cc[i * 3 + 1] = c.g
        cc[i * 3 + 2] = c.b
      }
      geo.attributes.position.needsUpdate = true
      geo.attributes.color.needsUpdate = true
    },
  }
}

function buildFireflies(scene, glowTex, rand, count) {
  const pos = new Float32Array(count * 3)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.PointsMaterial({
    size: 0.5,
    map: glowTex,
    color: 0xcfe89a,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  scene.add(points)
  const flies = []
  for (let i = 0; i < count; i++) {
    flies.push({
      x: (rand() - 0.5) * 50,
      y: 1 + rand() * 5,
      z: -6 - rand() * 40,
      p1: rand() * Math.PI * 2,
      p2: rand() * Math.PI * 2,
      s: 0.3 + rand() * 0.5,
    })
  }
  return {
    update(dt, t) {
      const p = geo.attributes.position.array
      for (let i = 0; i < count; i++) {
        const f = flies[i]
        p[i * 3] = f.x + Math.sin(t * f.s + f.p1) * 3
        p[i * 3 + 1] = f.y + Math.sin(t * f.s * 1.3 + f.p2) * 1.2
        p[i * 3 + 2] = f.z + Math.cos(t * f.s * 0.6 + f.p1) * 2
      }
      geo.attributes.position.needsUpdate = true
      mat.opacity = 0.55 + 0.3 * Math.sin(t * 1.7)
    },
  }
}

function buildMist(scene, glowTex, rand, count) {
  const sprites = []
  for (let i = 0; i < count; i++) {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: 0x2a3a55,
        transparent: true,
        opacity: 0.05 + rand() * 0.05,
        depthWrite: false,
      })
    )
    const sc = 34 + rand() * 40
    s.scale.set(sc, sc * 0.45, 1)
    s.position.set((rand() - 0.5) * 90, 2 + rand() * 6, -20 - rand() * 60)
    scene.add(s)
    sprites.push({ s, speed: 0.25 + rand() * 0.4, baseX: s.position.x, phase: rand() * 9 })
  }
  return {
    update(dt, t) {
      for (const { s, speed, baseX, phase } of sprites) {
        s.position.x = baseX + Math.sin(t * speed + phase) * 9
      }
    },
  }
}

/* ------------------------------------------------------------------ */
/* Camera choreography — one continuous path, composed shots per view  */
/* ------------------------------------------------------------------ */

const SHOTS = [
  // Hero — wide vista: moon left, temple right, torii mid-ground.
  { pos: [0, 9.5, 27], look: [-6, 7, -70] },
  // About — down the lantern path.
  { pos: [2.5, 5.5, 13], look: [-2, 4.2, -42] },
  // Experience — torii framed.
  { pos: [-3.5, 4.6, 3], look: [-7, 5.2, -30] },
  // Projects — temple hall + stairs.
  { pos: [3.5, 6, -7], look: [9, 5.5, -58] },
  // Skills — pagoda + maples.
  { pos: [-9, 5.2, -15], look: [-29, 9, -74] },
  // Education — moon + ridgelines.
  { pos: [5, 7.5, -24], look: [-30, 22, -150] },
  // Contact — closing vista, moonrise.
  { pos: [0, 8.5, -32], look: [-42, 30, -170] },
  // Footer — afterlight.
  { pos: [0, 11, -38], look: [-46, 38, -170] },
]

/* ------------------------------------------------------------------ */
/* Public factory                                                      */
/* ------------------------------------------------------------------ */

export function createWorld({ mobile = false } = {}) {
  const rand = mulberry32(20260930)
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(PAL.sky)
  scene.fog = new THREE.FogExp2(PAL.fog, 0.011)

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 600)

  const glowTex = makeGlowTexture()
  const streakTex = makeStreakTexture()
  void streakTex

  // Base lighting: cold moonlight + faint blue ambience.
  scene.add(new THREE.HemisphereLight(0x3d4f70, 0x0a0c14, 0.9))
  const moonLight = new THREE.DirectionalLight(0x8fb0ff, 1.05)
  moonLight.position.set(-46, 40, -120)
  scene.add(moonLight)

  const moon = buildSky(scene, rand, glowTex)
  buildRidges(scene, rand)
  buildGround(scene)
  const temple = buildTemple(scene, glowTex)
  void temple
  buildTorii(scene)
  buildStairs(scene)
  const lanterns = buildLanterns(scene, glowTex, rand)
  buildTrees(scene, rand)

  const q = mobile ? 0.5 : 1
  const rain = buildRain(scene, Math.round(420 * q))
  const leaves = buildLeaves(scene, rand, Math.round(120 * q))
  const embers = buildEmbers(scene, glowTex, rand, lanterns, Math.round(130 * q), 240)
  const fireflies = buildFireflies(scene, glowTex, rand, Math.round(34 * q))
  const mist = buildMist(scene, glowTex, rand, Math.round(8 * q))

  const posCurve = new THREE.CatmullRomCurve3(
    SHOTS.map((s) => new THREE.Vector3(...s.pos)),
    false,
    'centripetal'
  )
  const lookCurve = new THREE.CatmullRomCurve3(
    SHOTS.map((s) => new THREE.Vector3(...s.look)),
    false,
    'centripetal'
  )

  const smooth = { t: 0, px: 0, py: 0 }
  const tmpPos = new THREE.Vector3()
  const tmpLook = new THREE.Vector3()
  const raycaster = new THREE.Raycaster()

  function damp(current, target, lambda, dt) {
    return current + (target - current) * (1 - Math.exp(-lambda * dt))
  }

  return {
    scene,
    camera,

    update(dt, t, view) {
      const { scrollT, px, py } = view
      smooth.t = damp(smooth.t, scrollT, 0.95, dt)
      smooth.px = damp(smooth.px, px, 3.2, dt)
      smooth.py = damp(smooth.py, py, 3.2, dt)

      posCurve.getPoint(THREE.MathUtils.clamp(smooth.t, 0, 1), tmpPos)
      lookCurve.getPoint(THREE.MathUtils.clamp(smooth.t, 0, 1), tmpLook)

      // Pointer parallax layered over the scroll path (+ idle drift).
      const driftX = Math.sin(t * 0.21) * 0.35
      const driftY = Math.cos(t * 0.17) * 0.22
      camera.position.set(
        tmpPos.x + smooth.px * 1.6 + driftX,
        tmpPos.y + smooth.py * -0.9 + driftY,
        tmpPos.z
      )
      camera.lookAt(tmpLook.x + smooth.px * 2.2, tmpLook.y + smooth.py * -1.1, tmpLook.z)

      // Living details.
      rain.update(dt)
      leaves.update(dt, t)
      embers.update(dt, t)
      fireflies.update(dt, t)
      mist.update(dt, t)
      for (const L of lanterns) {
        const flicker = 0.82 + 0.18 * Math.sin(t * 11 + L.phase) * Math.sin(t * 5.3 + L.phase * 2)
        L.glow.material.opacity = 0.42 + 0.22 * flicker
        if (L.light) L.light.intensity = L.baseIntensity * flicker
      }
      moon.halo.material.opacity = 0.3 + 0.05 * Math.sin(t * 0.6)
    },

    /** Render one static frame (reduced-motion path). */
    renderStatic(renderer, scrollT = 0.12) {
      posCurve.getPoint(scrollT, tmpPos)
      lookCurve.getPoint(scrollT, tmpLook)
      camera.position.copy(tmpPos)
      camera.lookAt(tmpLook)
      rain.update(0.016)
      leaves.update(0.016, 1.2)
      embers.update(0.016, 1.2)
      renderer.render(scene, camera)
    },

    /** Ember burst at a normalized click position. */
    burst(nx, ny) {
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera)
      const p = raycaster.ray.at(16, new THREE.Vector3())
      embers.burst(p)
    },

    setAspect(w, h) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },

    dispose() {
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          for (const m of mats) {
            if (m.map) m.map.dispose()
            m.dispose()
          }
        }
      })
      glowTex.dispose()
      streakTex.dispose()
    },
  }
}
