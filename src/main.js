import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';
import SplitType from 'split-type';
// import { SplitText } from "gsap/SplitText"; // Not available in browser

// === HELLO SCROLLTRIGGER CONSTANTS ===
const HELLO_SECTION = '.intro';
const HELLO_TEXT = '.intro h1';
const HELLO_LETTER = '.hello-letter';
const SCROLL_DOWN_TEXT = '.scroll-down-text';
const SCROLL_DOWN_ARROWS = '.scroll-down-arrows';
const HELLO_START = 'top top';
const HELLO_END = '+=400%'; // ~2s for hello, 1.5s for scroll down
const LETTERS_PROGRESS = 0.7; // 0-70% for hello letters
const SCROLL_DOWN_PROGRESS = 0.7; // 70-100% for scroll down

// === HELLO ANIMATION PROMISE ===
function runHelloAnimation() {
  return new Promise((resolve) => {
    const helloLetters = Array.from(document.querySelectorAll('.hello-letter'));
    let finished = false;
    function setHelloLetters(progress) {
      const total = helloLetters.length;
      for (let i = 0; i < total; i++) {
        const letterProgress = Math.max(0, Math.min(1, progress * (total + 0.5) - i));
        if (letterProgress > 0.5) {
          helloLetters[i].classList.add('visible');
        } else {
          helloLetters[i].classList.remove('visible');
        }
      }
    }
    let scrollListener;
    function onIntroScroll() {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight * 0.2;
      const progress = Math.min(scrollY / maxScroll, 1);
      setHelloLetters(progress);
      if (progress >= 1 && !finished) {
        finished = true;
        window.removeEventListener('scroll', scrollListener);
        resolve();
      }
    }
    scrollListener = onIntroScroll;
    window.addEventListener('scroll', scrollListener);
    // Failsafe: auto-complete after 6s
    setTimeout(() => {
      if (!finished) {
        setHelloLetters(1);
        window.removeEventListener('scroll', scrollListener);
        resolve();
      }
    }, 6000);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  window.__triggerButtonShown = false;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  
  CustomEase.create("hop", ".8, 0, .3, 1");

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const header1Split = new SplitType(".header-1 h1", {
    type: "chars",
    charsClass: "char",
  });
  const titleSplits = new SplitType(".tooltip .title h2", {
    type: "lines",
    linesClass: "line",
  });
  const descriptionSplits = new SplitType(".tooltip .description p", {
    type: "lines",
    linesClass: "line",
  });

  header1Split.chars.forEach(
    (char) => (char.innerHTML = `<span>${char.innerHTML}</span>`)
  );
  [...titleSplits.lines, ...descriptionSplits.lines].forEach(
    (line) => (line.innerHTML = `<span>${line.innerHTML}</span>`)
  );

  // Final Animation Text Splitting
  const finalIntroSplit = new SplitType(".final-animation .intro-title h1", {
    type: "words, chars",
    charsClass: "char",
  });
  const finalOutroSplit = new SplitType(".final-animation .outro-title h1", {
    type: "chars",
    charsClass: "char",
  });
  const finalCardSplit = new SplitType(".final-animation .card h1", {
    type: "words, chars",
    charsClass: "char",
  });

  // Apply span wrappers for final animation
  finalIntroSplit.chars.forEach((char, index) => {
    char.innerHTML = `<span>${char.innerHTML}</span>`;
    if (index === 0) char.classList.add("first-char");
  });
  finalOutroSplit.chars.forEach((char) => {
    char.innerHTML = `<span>${char.innerHTML}</span>`;
  });
  finalCardSplit.chars.forEach((char) => {
    char.innerHTML = `<span>${char.innerHTML}</span>`;
  });

  const animOptions = { duration: 1, ease: "power3.out", stagger: 0.025 };
  const tooltipSelectors = [
    {
      trigger: 0.65,
      elements: [
        ".tooltip:nth-child(1) .icon ion-icon",
        ".tooltip:nth-child(1) .title .line > span",
        ".tooltip:nth-child(1) .description .line > span",
      ],
    },
    {
      trigger: 0.85,
      elements: [
        ".tooltip:nth-child(2) .icon ion-icon",
        ".tooltip:nth-child(2) .title .line > span",
        ".tooltip:nth-child(2) .description .line > span",
      ],
    },
  ];

  ScrollTrigger.create({
    trigger: ".product-overview",
    start: "75% bottom",
    onEnter: () =>
      gsap.to(".header-1 h1 .char > span", {
        y: "0%",
        duration: 1,
        ease: "power3.out",
        stagger: 0.025,
      }),
    onLeaveBack: () =>
      gsap.to(".header-1 h1 .char > span", {
        y: "100%",
        duration: 1,
        ease: "power3.out",
        stagger: 0.025,
      }),
  });

  // Show trigger button after tooltip animations complete (Y: 100% reached)i
  ScrollTrigger.create({
    trigger: ".product-overview",
    start: "top top",
    end: "bottom bottom",
    scrub: false,
    onUpdate: (self) => {
      const progress = self.progress;
      // Show button after tooltip animations complete (around 0.85 progress)
      // This ensures all Y: 100% animations are done
      if (
        progress >= 0.985 &&
        !document.querySelector('.trigger-section.visible') &&
        !window.__triggerButtonShown
      ) {
        window.__triggerButtonShown = true;
        showTriggerButton();
      }
    }
  });

  let model,
    currentRotation = 0,
    modelSize;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.LinearEncoding;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1.0;
  document.querySelector(".model-container").appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
  mainLight.position.set(1, 2, 3);
  mainLight.castShadow = true;
  mainLight.shadow.bias = -0.001;
  mainLight.shadow.mapSize.width = 1024;
  mainLight.shadow.mapSize.height = 1024;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
  fillLight.position.set(-2, 0, -2);
  scene.add(fillLight);

  function setupModel() {
    if (!model || !modelSize) return;

    const isMobile = window.innerWidth < 1000;
    const isSmallScreen = window.innerWidth < 768;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    // Adjust model scale based on screen size
    const scale = isSmallScreen ? 0.6 : isMobile ? 0.8 : 1;
    model.scale.setScalar(scale);

    // Center the model properly for all screen sizes
    let xPos;
    if (isSmallScreen) {
      xPos = 0; // Center on small screens (768px or less)
    } else if (isMobile) {
      xPos = center.x + modelSize.x * 0.5;
    } else {
      xPos = -center.x - modelSize.x * 0.4;
    }

    // Adjust camera distance based on screen size
    const cameraDistance = isSmallScreen ? 2.5 : isMobile ? 2 : 1.25;
    camera.position.set(
      0,
      0,
      Math.max(modelSize.x, modelSize.y, modelSize.z) * cameraDistance * scale
    );
    camera.lookAt(0, 0, 0);
  }

  new GLTFLoader().load("/apple_iphone_13_pro_max.glb", (gltf) => {
    model = gltf.scene;

    model.traverse((node) => {
      if (node.isMesh && node.material) {
        Object.assign(node.material, {
          metalness: 0.05,
          roughness: 0.9,
        });
      }
    });

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    modelSize = size;

    scene.add(model);
    setupModel();
    setupModelControls(model);
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    setupModel();
  });

  // --- HELLO SECTION SCROLLTRIGGER ---
  gsap.set(HELLO_LETTER, { opacity: 0, filter: 'blur(16px)', y: 40, scale: 0.95 });

  const helloLetters = gsap.utils.toArray(HELLO_LETTER);

  ScrollTrigger.create({
    trigger: HELLO_SECTION,
    start: HELLO_START,
    end: HELLO_END,
    pin: true,
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;
      const total = helloLetters.length;
      const letterProgress = Math.min(progress / LETTERS_PROGRESS, 1);
      helloLetters.forEach((letter, i) => {
        const appearAt = i / total;
        const reveal = gsap.utils.clamp(0, 1, (letterProgress - appearAt) * total);
        gsap.to(letter, {
          opacity: reveal,
          filter: `blur(${16 * (1 - reveal)}px)`,
          y: 40 * (1 - reveal),
          scale: 0.95 + 0.05 * reveal,
          duration: 0.1,
          overwrite: 'auto',
        });
      });
    },
    onLeave: () => {
      gsap.set(helloLetters, { opacity: 1, filter: 'blur(0)', y: 0, scale: 1 });
    },
    onLeaveBack: () => {
      gsap.set(helloLetters, { opacity: 0, filter: 'blur(16px)', y: 40, scale: 0.95 });
    },
  });

  // --- PRODUCT OVERVIEW SECTION SCROLLTRIGGER ---
  ScrollTrigger.create({
    trigger: ".product-overview",
    start: "top top",
    end: `+=${window.innerHeight * 10}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    onUpdate: ({ progress }) => {
      // All product overview animations (3D, text, tab, etc) go here
      // Example: tab change at 0.5 progress
      // if (progress > 0.5) { ... }
      const headerProgress = Math.max(0, Math.min(1, (progress - 0.05) / 0.3));
      gsap.to(".header-1", {
        xPercent:
          progress < 0.05 ? 0 : progress > 0.35 ? -100 : -100 * headerProgress,
      });

      const maskSize =
        progress < 0.2
          ? 0
          : progress > 0.3
          ? 100
          : 100 * ((progress - 0.2) / 0.1);
      gsap.to(".circular-mask", {
        clipPath: `circle(${maskSize}% at 50% 50%)`,
      });

      const header2Progress = (progress - 0.15) / 0.35;
      const header2XPercent =
        progress < 0.15
          ? 100
          : progress > 0.5
          ? -200
          : 100 - 300 * header2Progress;
      gsap.to(".header-2", { xPercent: header2XPercent });

      const scaleX =
        progress < 0.45
          ? 0
          : progress > 0.65
          ? 100
          : 100 * ((progress - 0.45) / 0.2);
      gsap.to(".tooltip .divider", { scaleX: `${scaleX}%`, ...animOptions });

      tooltipSelectors.forEach(({ trigger, elements }) => {
        gsap.to(elements, {
          y: progress >= trigger ? "0%" : "125%",
          ...animOptions,
        });
      });

      // Fade out model when tooltips/lines appear (only on smaller screens)
      const modelContainer = document.querySelector('.model-container');
      if (modelContainer && window.innerWidth < 768) {
        if (progress >= 0.65) {
          modelContainer.classList.add('model-fade-out');
        } else {
          modelContainer.classList.remove('model-fade-out');
        }
      }

      if (model && progress >= 0.05) {
        const rotationProgress = (progress - 0.05) / 0.95;
        const targetRotation = Math.PI * 3 * 4 * rotationProgress;
        const rotationDiff = targetRotation - currentRotation;
        if (Math.abs(rotationDiff) > 0.001) {
          model.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationDiff);
          currentRotation = targetRotation;
        }
      }
    },
  });

  // 2. Run HELLO animation, then unlock scroll and show prompt
  runHelloAnimation().then(() => {
    ScrollLock.unlock();
    showScrollPrompt();
  });

  // 3. Example: Lock scroll for another section (replace '.product-overview' and animation logic as needed)
  setupSectionScrollLock('.product-overview', () => {
    // Return a Promise that resolves when the section's animation is done
    return new Promise((resolve) => {
      // Example: Simulate animation duration
      setTimeout(resolve, 2000);
      // You can replace this with your actual animation logic and resolve when done
    });
  });

  // Show trigger button
  function showTriggerButton() {
    const triggerSection = document.querySelector('.trigger-section');
    if (triggerSection) {
      gsap.to(triggerSection, {
        opacity: 1,
        visibility: 'visible',
        filter: 'blur(0px)',
        duration: 1.2,
        ease: "power2.out",
        onComplete: () => {
          triggerSection.classList.add('visible');
        }
      });
      
      // Add click event listener to button
      const triggerBtn = document.querySelector('.trigger-btn');
      if (triggerBtn) {
        triggerBtn.addEventListener('click', triggerFinalAnimation);
      }
    }
  }

  // Final Animation - Show section and start animation
  function enableFinalAnimation() {
    const finalAnimation = document.querySelector('.final-animation');
    if (finalAnimation) {
      finalAnimation.classList.add('active');
      // Start the animation immediately
      startFinalAnimationSequence();
    }
  }



  function triggerFinalAnimation() {
    // Hide the trigger section
    const triggerSection = document.querySelector('.trigger-section');
    if (triggerSection) {
      gsap.to(triggerSection, {
        opacity: 0,
        scale: 0.8,
        filter: 'blur(10px)',
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          triggerSection.style.display = 'none';
        }
      });
    }
    
    // Create blur/fade animation for all elements
    const blurTl = gsap.timeline();
    
    // Blur and fade out all main elements with scale effects
    blurTl.to(".model-container", {
      filter: "blur(20px)",
      opacity: 0,
      scale: 0.95,
      duration: 1.5,
      ease: "power2.inOut"
    })
    .to(".header-1", {
      filter: "blur(15px)",
      opacity: 0,
      scale: 0.98,
      duration: 1.5,
      ease: "power2.inOut"
    }, 0)
    .to(".header-2", {
      filter: "blur(15px)",
      opacity: 0,
      scale: 0.98,
      duration: 1.5,
      ease: "power2.inOut"
    }, 0)
    .to(".tooltips", {
      filter: "blur(15px)",
      opacity: 0,
      scale: 0.95,
      duration: 1.5,
      ease: "power2.inOut"
    }, 0)
    .to(".circular-mask", {
      filter: "blur(15px)",
      opacity: 0,
      scale: 0.98,
      duration: 1.5,
      ease: "power2.inOut"
    }, 0)
    .to(".navbar", {
      filter: "blur(10px)",
      opacity: 0,
      scale: 0.95,
      duration: 1.5,
      ease: "power2.inOut"
    }, 0)
    .to(".intro", {
      filter: "blur(15px)",
      opacity: 0,
      scale: 0.95,
      duration: 1.5,
      ease: "power2.inOut"
    }, 0)
    .to(".product-overview", {
      filter: "blur(15px)",
      opacity: 0,
      scale: 0.95,
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => {
        // Start the final animation after blur animation completes
        enableFinalAnimation();
      }
    }, 0);
  }

  function startFinalAnimationSequence() {
    // Initialize the final animation timeline
    const finalTl = gsap.timeline({ defaults: { ease: "hop" } });
    const finalTags = gsap.utils.toArray(".final-animation .tag");
    const isMobile = window.innerWidth <= 1000;

    // Set initial states
    gsap.set(
      [
        ".final-animation .split-overlay .intro-title .first-char span",
        ".final-animation .split-overlay .outro-title .char span",
      ],
      { y: "0%" }
    );

    gsap.set(".final-animation .split-overlay .intro-title .first-char", {
      x: isMobile ? "7.5rem" : "18rem",
      y: isMobile ? "-1rem" : "-2.75rem",
      fontWeight: "900",
      scale: 0.75,
    });

    gsap.set(".final-animation .split-overlay .outro-title .char", {
      x: isMobile ? "-3rem" : "-8rem",
      fontSize: isMobile ? "6rem" : "14rem",
      fontWeight: "500",
      opacity: 1, // Start with full opacity
    });

    // Animate tags
    finalTags.forEach((tag, index) => {
      finalTl.to(
        tag.querySelectorAll("p .word"),
        {
          y: "0%",
          duration: 1,
        },
        0.5 + index * 0.1
      );
    });

    // Main animation sequence
    finalTl.to(
      ".final-animation .preloader .intro-title .char span",
      {
        y: "0%",
        duration: 1,
        stagger: 0.05,
      },
      0.5
    )
    // Animate out ALBILOGISTICS letters earlier, before the middle bar appears
    .to(
      ".final-animation .preloader .intro-title .char:not(.first-char) span",
      {
        y: "100%",
        duration: 1,
        stagger: 0.05,
      },
      1.2 // Start this earlier in the timeline
    )
    .to(
      ".final-animation .preloader .outro-title .char span",
      {
        y: "0%",
        duration: 0.75,
        stagger: 0.075,
      },
      1.7 // Start this a bit after the letters start animating out
    )
    // Animate A (first-char) to center and scale up, 10 to move to the side and shrink
    .to(
      ".final-animation .preloader .intro-title .first-char",
      {
        x: isMobile ? "0rem" : "0rem", // Center A
        y: isMobile ? "0rem" : "0rem",
        scale: 1.3, // Scale A up
        fontWeight: "900",
        duration: 1,
      },
      3.5
    )
    .to(
      ".final-animation .preloader .outro-title .char",
      {
        x: isMobile ? "9rem" : "21.25rem", // Move 10 to the side
        scale: 0.7, // Shrink 10
        fontWeight: "500",
        duration: 1,
      },
      3.5
    )
    // Move A to the right and fade out outro-title elements
    .to(
      ".final-animation .preloader .intro-title .first-char",
      {
        x: isMobile ? "12rem" : "28rem", // Move A further to the right
        y: isMobile ? "-1rem" : "-2.75rem",
        fontWeight: "900",
        scale: 0.75,
        duration: 1.2,
      },
      4.5
    )
    .to(
      ".final-animation .split-overlay .intro-title .first-char",
      {
        x: isMobile ? "12rem" : "28rem", // Move A further to the right in split-overlay too
        y: isMobile ? "-1rem" : "-2.75rem",
        fontWeight: "900",
        scale: 0.75,
        duration: 1.2,
      },
      4.5
    )
    // Fade out the "10" much later in the timeline
    .to(
      ".final-animation .preloader .outro-title .char",
      {
        opacity: 0, // Fade out the outro-title (no movement)
        duration: 1.2,
      },
      7.5 // Moved to 7.5 seconds (much later)
    )
    // Also fade out the split-overlay outro-title
    .to(
      ".final-animation .split-overlay .outro-title .char",
      {
        opacity: 0, // Fade out the split-overlay outro-title
        duration: 1.2,
      },
      7.5 // Moved to 7.5 seconds (much later)
    )
    // Fade out the "A" character after the "10" starts fading
    .to(
      ".final-animation .preloader .intro-title .first-char",
      {
        opacity: 0, // Fade out the A character
        duration: 1.2,
      },
      8.5 // Start fading out A 1 second after the 10 starts fading
    )
    .to(
      ".final-animation .split-overlay .intro-title .first-char",
      {
        opacity: 0, // Fade out the A character in split-overlay too
        duration: 1.2,
      },
      8.5 // Start fading out A 1 second after the 10 starts fading
    )
    .to(
      ".final-animation .preloader .outro-title .char",
      {
        x: isMobile ? "-3rem" : "-8rem",
        fontSize: isMobile ? "6rem" : "14rem",
        fontWeight: "500",
        duration: 0.75,
        onComplete: () => {
          gsap.set(".final-animation .preloader", {
            clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
          });
          gsap.set(".final-animation .split-overlay", {
            clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
          });
        },
      },
      5.7
    )
    .to(
      ".final-animation .container",
      {
        clipPath: "polygon(0% 48%, 100% 48%, 100% 52%, 0% 52%)",
        duration: 1,
      },
      5
    );

    // Animate tags out
    finalTags.forEach((tag, index) => {
      finalTl.to(
        tag.querySelectorAll("p .word"),
        {
          y: "100%",
          duration: 0.75,
        },
        5.5 + index * 0.1
      );
    });

    // Final reveal
    finalTl.to(
      [".final-animation .preloader", ".final-animation .split-overlay"],
      {
        y: (i) => (i === 0 ? "-50%" : "50%"),
        duration: 1,
      },
      6
    )
    .to(
      ".final-animation .container",
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1,
      },
      6
    )
    .to(
      ".final-animation .container .card",
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 0.75,
      },
      6.25
    )
    .to(
      ".final-animation .container .card h1 .char span",
      {
        y: "0%",
        duration: 0.75,
        stagger: 0.05,
      },
      6.5
    );
  }

});

document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('authcard-root');
  const signInForm = document.getElementById('authcard-signin-form');
  const signUpForm = document.getElementById('authcard-signup-form');
  const overlay = document.getElementById('authcard-overlay');
  const overlayBtn = document.getElementById('authcard-overlay-btn');
  const toSignUpBtn = document.getElementById('authcard-to-signup');
  const toSignInBtn = document.getElementById('authcard-to-signin');
  const overlayTitle = document.getElementById('authcard-overlay-title');
  const overlayDesc = document.getElementById('authcard-overlay-desc');

  function fadeToSignUp() {
    gsap.to(signInForm, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        signInForm.classList.remove('active');
        signUpForm.classList.add('active');
        gsap.fromTo(signUpForm, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        overlayTitle.textContent = 'Hello, Friend!';
        overlayDesc.textContent = 'Enter your personal details and start your journey with us';
        overlayBtn.textContent = 'Sign In';
        overlayBtn.setAttribute('aria-label', 'Sign In');
      }
    });
  }

  function fadeToSignIn() {
    gsap.to(signUpForm, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        signUpForm.classList.remove('active');
        signInForm.classList.add('active');
        gsap.fromTo(signInForm, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        overlay.classList.remove('hide'); // Show overlay when showing signin
        overlayTitle.textContent = 'Welcome Back!';
        overlayDesc.textContent = 'To keep connected with us please login with your personal info';
        overlayBtn.textContent = 'Sign Up';
        overlayBtn.setAttribute('aria-label', 'Sign Up');
      }
    });
  }

  // Set initial state
  signInForm.classList.add('active');
  signUpForm.classList.remove('active');
  gsap.set(signInForm, { opacity: 1 });
  gsap.set(signUpForm, { opacity: 0 });
  // Always set overlay to sign-in state on load
  overlay.classList.remove('hide');
  overlayTitle.textContent = 'Welcome Back!';
  overlayDesc.textContent = 'To keep connected with us please login with your personal info';
  overlayBtn.textContent = 'Sign Up';
  overlayBtn.setAttribute('aria-label', 'Sign Up');

  if (toSignUpBtn) toSignUpBtn.addEventListener('click', fadeToSignUp);
  if (toSignInBtn) toSignInBtn.addEventListener('click', fadeToSignIn);
  if (overlayBtn) overlayBtn.addEventListener('click', function() {
    if (signUpForm.classList.contains('active')) {
      fadeToSignIn();
    } else {
      fadeToSignUp();
    }
  });
});


// === 3D Model Controls ===
function setupModelControls(model) {
  // Position the model perfectly centered
  model.position.set(0, 0, 0);
  
  // Note: Scale is now handled responsively in setupModel() function
  // based on screen size to ensure proper sizing on all devices
}
// === OUTRO BACKGROUND FADE/BLUR ON SCROLL AND TEXT TRANSITION (GSAP ScrollTrigger) ===
(function setupOutroBgFadeAndTextGSAP() {
  const outro = document.querySelector('.outro');
  const bgImage = document.querySelector('.bg-fade-image');
  const firstText = document.querySelector('.outro-text.first');
  const secondText = document.querySelector('.outro-text.second');
  const firstWords = firstText ? Array.from(firstText.querySelectorAll('span')) : [];
  const secondWords = secondText ? Array.from(secondText.querySelectorAll('span')) : [];
  if (!outro || !bgImage || !firstText || !secondText) return;

  // Helper to animate words word-by-word
  function animateWords(words, active, delay = 0, stagger = 80) {
    words.forEach((word, i) => {
      setTimeout(() => {
        if (active) {
          word.style.opacity = '1';
          word.style.filter = 'blur(0px)';
        } else {
          word.style.opacity = '0';
          word.style.filter = 'blur(16px)';
        }
      }, delay + i * stagger);
    });
  }

  // State to avoid repeated animations
  let lastState = null;

  // Use GSAP ScrollTrigger for the outro section
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.create({
    trigger: outro,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;
      // 1. Background image: start fade/blur after 40% progress
      const opacity = Math.max(0, Math.min(1, (progress - 0.4) / 0.5));
      const blur = 30 - 30 * opacity;
      bgImage.style.opacity = opacity;
      bgImage.style.filter = `blur(${blur}px)`;

      // 2. Text transitions
      // - 0.0 to 0.45: show first text, hide second
      // - 0.45 to 0.55: transition (blur out first, blur in second)
      // - 0.55+: show second text, hide first
      if (progress < 0.45) {
        if (lastState !== 'first') {
          firstText.classList.add('active');
          firstText.classList.remove('inactive');
          secondText.classList.remove('active');
          secondText.classList.add('inactive');
          animateWords(firstWords, true);
          animateWords(secondWords, false);
          lastState = 'first';
        }
      } else if (progress >= 0.45 && progress < 0.55) {
        if (lastState !== 'transition') {
          // Blur out first, blur in second, word by word
          firstText.classList.remove('active');
          firstText.classList.add('inactive');
          secondText.classList.remove('inactive');
          secondText.classList.add('active');
          animateWords(firstWords, false, 0, 80);
          animateWords(secondWords, true, 300, 120);
          lastState = 'transition';
        }
      } else {
        if (lastState !== 'second') {
          firstText.classList.remove('active');
          firstText.classList.add('inactive');
          secondText.classList.add('active');
          secondText.classList.remove('inactive');
          animateWords(firstWords, false);
          animateWords(secondWords, true);
          lastState = 'second';
        }
      }
    }
  });
})();

// === OUTRO: SHARP TO BLUR, THEN WORD-BY-WORD TEXT ===
(function setupOutroSharpToBlurThenText() {
  const outro = document.querySelector('.outro');
  const firstText = document.querySelector('.outro-text.first');
  const secondText = document.querySelector('.outro-text.second');
  const bgImage = document.querySelector('.bg-fade-image');
  if (!outro || !firstText || !secondText || !bgImage) return;
  const firstWords = Array.from(firstText.querySelectorAll('span'));
  const numWords = firstWords.length;

  function onScroll() {
    const rect = outro.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    if (rect.top > 0) {
      // Outro not yet in view: sharp bg, hide text
      bgImage.style.filter = 'blur(0px)';
      firstWords.forEach(word => {
        word.style.opacity = '0';
        word.style.filter = 'blur(16px)';
      });
      firstText.classList.add('active');
      firstText.classList.remove('inactive');
      secondText.classList.remove('active');
      secondText.classList.add('inactive');
      return;
    }
    const sectionHeight = rect.height;
    const scrolled = Math.min(windowHeight, windowHeight - rect.top);
    const progress = Math.max(0, Math.min(1, scrolled / (sectionHeight + windowHeight)));
    // 0-0.5: blur from 0px to 22px, text hidden
    // 0.5-1: blur stays at 22px, text animates in word by word
    if (progress < 0.5) {
      const blur = 22 * (progress / 0.5); // 0 to 22px
      bgImage.style.filter = `blur(${blur}px)`;
      firstWords.forEach(word => {
        word.style.opacity = '0';
        word.style.filter = 'blur(16px)';
      });
      firstText.classList.add('active');
      firstText.classList.remove('inactive');
      secondText.classList.remove('active');
      secondText.classList.add('inactive');
    } else {
      bgImage.style.filter = 'blur(22px)';
      // Animate words in based on progress from 0.5 to 1
      const textProgress = (progress - 0.5) / 0.5; // 0 to 1
      const wordStep = 1 / numWords;
      firstWords.forEach((word, i) => {
        if (textProgress >= (i + 1) * wordStep) {
          word.style.opacity = '1';
          word.style.filter = 'blur(0px)';
        } else {
          word.style.opacity = '0';
          word.style.filter = 'blur(16px)';
        }
      });
      firstText.classList.add('active');
      firstText.classList.remove('inactive');
      secondText.classList.remove('active');
      secondText.classList.add('inactive');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();


// Auth form handling
const handleLogin = async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (response.ok) {
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Show success message
      showNotification('Login successful! Redirecting to dashboard...', 'success');
      
      // Redirect to admin dashboard
      setTimeout(() => {
        window.location.href = 'http://localhost:3000/dashboard';
      }, 1500);
    } else {
      showNotification(data.error || 'Login failed. Please check your credentials.', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification('Login failed. Please check your connection and try again.', 'error');
  }
};

const handleRegister = async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');
  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const phone = formData.get('phone');
  const storeName = formData.get('storeName');
  const storeAddress = formData.get('storeAddress');
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
        fullName: `${firstName} ${lastName}`,
        phone,
        company: storeName,
        address: storeAddress,
        country: 'VE' // Default to Venezuela
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.user.isApproved) {
        showNotification('Registration successful! Redirecting to dashboard...', 'success');
        setTimeout(() => {
          window.location.href = 'http://localhost:3000/dashboard';
        }, 1500);
      } else {
        showNotification('Registration successful! Your account is pending approval.', 'success');
      }
    } else {
      showNotification(data.error || 'Registration failed. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showNotification('Registration failed. Please check your connection and try again.', 'error');
  }
};

// Notification system
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
    type === 'success' ? 'bg-green-500 text-white' : 
    type === 'error' ? 'bg-red-500 text-white' : 
    'bg-blue-500 text-white'
  }`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 4000);
};

// Add event listeners to auth forms
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('authcard-signin-form');
  const registerForm = document.getElementById('authcard-signup-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Auth toggle functionality
  const toSignupBtn = document.getElementById('authcard-to-signup');
  const toSigninBtn = document.getElementById('authcard-to-signin');
  const overlayBtn = document.getElementById('authcard-overlay-btn');
  
  if (toSignupBtn) {
    toSignupBtn.addEventListener('click', () => {
      document.getElementById('authcard-root').classList.add('authcard-root--signup');
    });
  }
  
  if (toSigninBtn) {
    toSigninBtn.addEventListener('click', () => {
      document.getElementById('authcard-root').classList.remove('authcard-root--signup');
    });
  }
  
  if (overlayBtn) {
    overlayBtn.addEventListener('click', () => {
      document.getElementById('authcard-root').classList.add('authcard-root--signup');
    });
  }
  
  // Account dropdown functionality
  window.toggleAccountDropdown = () => {
    const dropdown = document.getElementById('account-dropdown');
    dropdown.classList.toggle('active');
  };
  
  window.openAuth = (mode) => {
    const authRoot = document.getElementById('authcard-root');
    if (mode === 'register') {
      authRoot.classList.add('authcard-root--signup');
    } else {
      authRoot.classList.remove('authcard-root--signup');
    }
    authRoot.classList.add('active');
    document.getElementById('scroll-lock-overlay').classList.add('active');
  };
  
  // Close auth modal when clicking outside
  document.addEventListener('click', (e) => {
    const authRoot = document.getElementById('authcard-root');
    const overlay = document.getElementById('scroll-lock-overlay');
    
    if (e.target === overlay) {
      authRoot.classList.remove('active');
      overlay.classList.remove('active');
    }
  });
});

