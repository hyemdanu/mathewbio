import { useState, Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'
import './App.css'
import mathewImg from './assets/mathew1.jpg'
import mathew2Img from './assets/mathew2.jpg'
import mathew3Img from './assets/mathew3.png'
import mathew4Img from './assets/mathew4.jpg'
import mathew5Img from './assets/mathew5.jpg'
import mathew6Img from './assets/mathew6.jpg'
import backgroundImg from './assets/background.png'

// Realistic Laptop - loads GLB model
function CodingIcon() {
  const groupRef = useRef()
  const { scene } = useGLTF('/models/ASUS Laptop.glb')

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003
    }
  })

  return (
    <group ref={groupRef} scale={2.2} rotation={[0.3, 0, 0]} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  )
}

// Realistic French Horn - loads GLB model
function MusicIcon() {
  const groupRef = useRef()
  const { scene } = useGLTF('/models/frenchhorn.glb')

  // Fix materials - set brass/gold color for metallic parts
  scene.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#D4A84B'),
        metalness: 0.7,
        roughness: 0.4,
      })
    }
  })

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003
    }
  })

  return (
    <group ref={groupRef} scale={1.3} rotation={[0.3, 0, 0]} position={[0, -0.8, 0]}>
      <primitive object={scene} />
    </group>
  )
}

// Realistic Dumbbell - loads GLB model
function FitnessIcon() {
  const groupRef = useRef()
  const { scene } = useGLTF('/models/dumbell.glb')

  // Center the model geometry
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    scene.position.sub(center)
  }, [scene])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003
    }
  })

  return (
    <group ref={groupRef} scale={0.3} rotation={[0.3, 0, 0]} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  )
}

// Scroll animation hook
function useScrollAnimation(threshold = 0.2) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const currentRef = ref.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold }
    )

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold])

  return [ref, isVisible]
}

// DVD-style bouncing image component
function BouncingImage({ src, size, initialX, initialY, speedX, speedY }) {
  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const velocity = useRef({ x: speedX, y: speedY })

  useEffect(() => {
    const animate = () => {
      setPosition(prev => {
        const container = document.querySelector('.floating-shapes')
        if (!container) return prev

        const containerWidth = container.offsetWidth
        const containerHeight = container.offsetHeight

        let newX = prev.x + velocity.current.x
        let newY = prev.y + velocity.current.y

        // Bounce off right/left walls
        if (newX + size > containerWidth || newX < 0) {
          velocity.current.x *= -1
          newX = newX < 0 ? 0 : containerWidth - size
        }

        // Bounce off bottom/top walls
        if (newY + size > containerHeight || newY < 0) {
          velocity.current.y *= -1
          newY = newY < 0 ? 0 : containerHeight - size
        }

        return { x: newX, y: newY }
      })
    }

    const intervalId = setInterval(animate, 16) // ~60fps
    return () => clearInterval(intervalId)
  }, [size])

  return (
    <img
      src={src}
      alt=""
      className="floating-img"
      style={{
        width: size,
        left: position.x,
        top: position.y,
      }}
    />
  )
}

// Banner with animated image component
function BannerWithImage({ backgroundImg, mathewImg }) {
  const [ref, isVisible] = useScrollAnimation(0.3)

  return (
    <div className="banner" style={{ backgroundImage: `url(${backgroundImg})` }} ref={ref}>
      <div className="banner-gradient"></div>
      <img
        src={mathewImg}
        alt="Mathew"
        className={`jumping-image ${isVisible ? 'slide-in-right' : 'slide-out-right'}`}
      />
    </div>
  )
}

// Animated hobby row component
function AnimatedHobbyRow({ children, reverse }) {
  const [ref, isVisible] = useScrollAnimation(0.15)

  return (
    <div
      ref={ref}
      className={`hobby-row ${reverse ? 'reverse' : ''} ${isVisible ? 'slide-in' : 'slide-out'}`}
    >
      {children}
    </div>
  )
}

// Marquee component with consistent speed
function Marquee({ images }) {
  const trackRef = useRef(null)
  const [duration, setDuration] = useState(20)

  useEffect(() => {
    const calculateDuration = () => {
      if (trackRef.current) {
        const trackWidth = trackRef.current.scrollWidth
        // Pixels per second - adjust this value to change speed
        const speed = 100
        const calculatedDuration = trackWidth / speed
        setDuration(calculatedDuration)
      }
    }

    // Wait for images to load before calculating
    const imgs = trackRef.current?.querySelectorAll('img') || []
    let loadedCount = 0
    const totalImages = imgs.length

    const onImageLoad = () => {
      loadedCount++
      if (loadedCount >= totalImages) {
        calculateDuration()
      }
    }

    imgs.forEach(img => {
      if (img.complete) {
        loadedCount++
      } else {
        img.addEventListener('load', onImageLoad)
      }
    })

    if (loadedCount >= totalImages) {
      calculateDuration()
    }

    window.addEventListener('resize', calculateDuration)
    return () => {
      window.removeEventListener('resize', calculateDuration)
      imgs.forEach(img => img.removeEventListener('load', onImageLoad))
    }
  }, [])

  const animationStyle = { animationDuration: `${duration}s` }

  return (
    <div className="gallery-marquee">
      <div className="marquee-track" ref={trackRef} style={animationStyle}>
        {images.map((src, i) => (
          <img key={i} src={src} alt="Mathew" className="gallery-img" loading="eager" />
        ))}
      </div>
      <div className="marquee-track" aria-hidden="true" style={animationStyle}>
        {images.map((src, i) => (
          <img key={i} src={src} alt="" className="gallery-img" loading="eager" />
        ))}
      </div>
    </div>
  )
}

// Icon canvas component with enhanced lighting for realistic materials
function IconCanvas({ children }) {
  return (
    <div className="icon-canvas-wrapper">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50, near: 0.1, far: 1000 }}
        style={{ background: 'transparent', overflow: 'visible' }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Ambient for base illumination */}
        <ambientLight intensity={0.2} />

        {/* Main key light - warm */}
        <directionalLight
          position={[5, 8, 5]}
          intensity={0.5}
          color="#fff5e6"
        />

        {/* Fill light - cool */}
        <directionalLight
          position={[-5, 5, 5]}
          intensity={0.3}
          color="#e6f0ff"
        />

        <Suspense fallback={null}>
          {children}
          <Environment preset="sunset" environmentIntensity={0.3} />
        </Suspense>
      </Canvas>
    </div>
  )
}

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Preload critical images
    const imagesToLoad = [backgroundImg, mathewImg, mathew2Img]
    let loadedCount = 0

    const checkAllLoaded = () => {
      loadedCount++
      if (loadedCount >= imagesToLoad.length) {
        // Add small delay for smoother transition
        setTimeout(() => setIsLoading(false), 500)
      }
    }

    imagesToLoad.forEach(src => {
      const img = new Image()
      img.onload = checkAllLoaded
      img.onerror = checkAllLoaded
      img.src = src
    })

    // Fallback timeout in case images take too long
    const timeout = setTimeout(() => setIsLoading(false), 5000)
    return () => clearTimeout(timeout)
  }, [])

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bio-page">
      {/* Profile Header */}
      <div className="profile-header">
        <BannerWithImage backgroundImg={backgroundImg} mathewImg={mathewImg} />

        {/* Name Section */}
        <div className="name-section">
          <div className="name-content">
            <div className="profile-circle">
              <img src={mathew2Img} alt="Mathew" className="profile-img" />
            </div>
            <div className="name-text">
              <h1 className="large-name">Matthew Anselmi</h1>
              <p className="name-subtitle">The talent of the talented</p>
            </div>
          </div>
          <div className="floating-shapes">
            <BouncingImage src={mathew3Img} size={100} initialX={50} initialY={30} speedX={1.5} speedY={1.2} />
            <BouncingImage src={mathew3Img} size={80} initialX={1200} initialY={350} speedX={-1.5} speedY={1.5} />
            <BouncingImage src={mathew3Img} size={90} initialX={400} initialY={450} speedX={1.5} speedY={-1.3} />
            <BouncingImage src={mathew3Img} size={70} initialX={900} initialY={50} speedX={-1.5} speedY={-1.5} />
            <BouncingImage src={mathew3Img} size={85} initialX={1500} initialY={200} speedX={1.4} speedY={1.5} />
            <BouncingImage src={mathew3Img} size={75} initialX={200} initialY={400} speedX={-1.5} speedY={1.4} />
            <BouncingImage src={mathew3Img} size={95} initialX={1100} initialY={100} speedX={1.5} speedY={-1.5} />
            <BouncingImage src={mathew3Img} size={65} initialX={600} initialY={500} speedX={-1.4} speedY={-1.4} />
            <BouncingImage src={mathew3Img} size={72} initialX={1400} initialY={420} speedX={1.3} speedY={1.5} />
            <BouncingImage src={mathew3Img} size={88} initialX={300} initialY={150} speedX={-1.5} speedY={-1.2} />
            <BouncingImage src={mathew3Img} size={68} initialX={800} initialY={300} speedX={1.5} speedY={1.4} />
            <BouncingImage src={mathew3Img} size={92} initialX={1300} initialY={80} speedX={-1.4} speedY={1.5} />
            <BouncingImage src={mathew3Img} size={78} initialX={100} initialY={250} speedX={1.5} speedY={-1.5} />
            <BouncingImage src={mathew3Img} size={82} initialX={1000} initialY={480} speedX={-1.3} speedY={-1.5} />
            <BouncingImage src={mathew3Img} size={66} initialX={500} initialY={60} speedX={1.5} speedY={1.3} />
            <BouncingImage src={mathew3Img} size={98} initialX={1600} initialY={350} speedX={-1.5} speedY={1.5} />
            <BouncingImage src={mathew3Img} size={74} initialX={700} initialY={200} speedX={1.4} speedY={-1.4} />
            <BouncingImage src={mathew3Img} size={86} initialX={150} initialY={520} speedX={-1.5} speedY={-1.3} />
            <BouncingImage src={mathew3Img} size={70} initialX={1250} initialY={280} speedX={1.5} speedY={1.5} />
            <BouncingImage src={mathew3Img} size={94} initialX={450} initialY={380} speedX={-1.4} speedY={1.4} />
            <BouncingImage src={mathew3Img} size={76} initialX={950} initialY={130} speedX={1.3} speedY={-1.5} />
            <BouncingImage src={mathew3Img} size={84} initialX={1550} initialY={500} speedX={-1.5} speedY={-1.4} />
            <BouncingImage src={mathew3Img} size={62} initialX={650} initialY={420} speedX={1.5} speedY={1.2} />
          </div>
        </div>
      </div>

      {/* Hobbies Section - Alternating Left/Right */}
      <section className="hobbies-section">
        {/* Coding - Icon Left, Text Right */}
        <AnimatedHobbyRow reverse={false}>
          <div className="hobby-icon-side">
            <IconCanvas><CodingIcon /></IconCanvas>
          </div>
          <div className="hobby-text-side">
            <h2 className="hobby-title">Computer Science Student</h2>
            <p className="hobby-description">
              Junior year Computer Science student at Sacramento State University.
              Professional transformers researcher and nightowl coder. The most talented
              of the talended coders in CSC 138. Can out-code all AI models in his sleep.
            </p>
          </div>
        </AnimatedHobbyRow>

        {/* Music - Text Left, Icon Right */}
        <AnimatedHobbyRow reverse={true}>
          <div className="hobby-icon-side">
            <IconCanvas><MusicIcon /></IconCanvas>
          </div>
          <div className="hobby-text-side">
            <h2 className="hobby-title">Wind Ensemble</h2>
            <p className="hobby-description">
              Proud member of Sacramento State's Wind Ensemble, playing the french horn.
              The most talented of the talented in the ensemble where none can compare.
              Played the instrument for years where nobody is at the same level. Can create
              a masterpiece faster than kids saying six-seven.
            </p>
          </div>
        </AnimatedHobbyRow>

        {/* Fitness - Icon Left, Text Right */}
        <AnimatedHobbyRow reverse={false}>
          <div className="hobby-icon-side">
            <IconCanvas><FitnessIcon /></IconCanvas>
          </div>
          <div className="hobby-text-side">
            <h2 className="hobby-title">Fitness Chad</h2>
            <p className="hobby-description">
              Athletic and strong. The most talented of the talented in all sports,
              being able to dunk on LeBron James for breakfast. Most athletic rock climber
              in all of Sacramento State University. Lifts your PR with a finger.
            </p>
          </div>
        </AnimatedHobbyRow>
      </section>

      {/* Gallery Section - Scrolling Images */}
      <section className="gallery-section">
        <div className="gallery-banner top"></div>
        <Marquee images={[mathew2Img, mathew4Img, mathew5Img, mathew6Img]} />
        <div className="gallery-banner bottom cta-banner">
          <span className="cta-text">Click here to see more</span>
          <span className="cta-arrow">↓</span>
        </div>
        <div className="gallery-banner bottom brand-banner">
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer" className="gallery-banner-text">
            <span className="brand-text">OnlyMatthews</span>
          </a>
        </div>
      </section>
    </div>
  )
}

export default App
