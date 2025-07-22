import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    storeName: '',
    storeAddress: ''
  });

  // Refs for animations
  const introRef = useRef(null);
  const productOverviewRef = useRef(null);
  const finalAnimationRef = useRef(null);

  useEffect(() => {
    // Initialize animations
    initializeAnimations();
    
    // Add scroll event listeners
    const handleScroll = () => {
      handleScrollAnimations();
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const initializeAnimations = () => {
    // Animate HELLO letters
    const helloLetters = document.querySelectorAll('.hello-letter');
    helloLetters.forEach((letter, index) => {
      setTimeout(() => {
        letter.classList.add('visible');
      }, index * 200);
    });

    // Initialize scroll animations
    handleScrollAnimations();
  };

  const handleScrollAnimations = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    // Product overview animations
    if (productOverviewRef.current) {
      const rect = productOverviewRef.current.getBoundingClientRect();
      if (rect.top < windowHeight * 0.8) {
        productOverviewRef.current.classList.add('active');
      }
    }

    // Final animation trigger
    if (finalAnimationRef.current) {
      const rect = finalAnimationRef.current.getBoundingClientRect();
      if (rect.top < windowHeight * 0.5) {
        finalAnimationRef.current.classList.add('active');
      }
    }
  };

  const toggleAccountDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthVisible(true);
    setIsDropdownOpen(false);
  };

  const closeAuth = () => {
    setIsAuthVisible(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>ALBI</h2>
          </div>
          <div className="nav-actions">
            <div className="nav-account">
              <button className="nav-account-btn" onClick={toggleAccountDropdown}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
              <div className={`account-dropdown ${isDropdownOpen ? 'active' : ''}`}>
                <button className="dropdown-item" onClick={() => openAuth('login')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10,17 15,12 10,7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  Login
                </button>
                <button className="dropdown-item" onClick={() => openAuth('register')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  Register
                </button>
              </div>
            </div>
            <div className="nav-bag">
              <img src="/bag.svg" alt="Bag" />
            </div>
          </div>
        </div>
      </nav>

      {/* Scroll lock overlay */}
      <div id="scroll-lock-overlay"></div>

      {/* Intro Section */}
      <section className="intro" ref={introRef}>
        <div className="intro-content">
          <h1>
            <span className="hello-letter">H</span>
            <span className="hello-letter">E</span>
            <span className="hello-letter">L</span>
            <span className="hello-letter">L</span>
            <span className="hello-letter">O</span>
          </h1>
        </div>
        <div className="scroll-down-text">Scroll Down</div>
        <div className="scroll-down-arrows">
          <span className="arrow">&#8595;</span>
          <span className="arrow">&#8595;</span>
          <span className="arrow">&#8595;</span>
        </div>
      </section>

      {/* Product Overview Section */}
      <section className="product-overview" ref={productOverviewRef}>
        <div className="header-1"><h1>El secreto de tu competencia</h1></div>
        <div className="header-2"><h1>ALBI</h1></div>

        <div className="circular-mask"></div>

        <div className="tooltips">
          <div className="tooltip">
            <div className="divider"></div>
            <div className="title">
              <h2>Calidad</h2>
            </div>
            <div className="description">
              <p>
                Nuestra misión es ofrecerte productos de alta calidad que cumplan con los más altos estándares de la industria.
              </p>
            </div>
          </div>
          <div className="tooltip">
            <div className="divider"></div>
            <div className="title">
              <h2>Variedad</h2>
            </div>
            <div className="description">
              <p>
                Nos esforzamos por ofrecer una amplia gama de productos que se adapten a tus necesidades y preferencias.
              </p>
            </div>
          </div>
        </div>

        <div className="model-container"></div>
        
        {/* Trigger Section */}
        <div className="trigger-section">
          <div className="trigger-text">Listo para explorar?</div>
          <button className="trigger-btn" onClick={() => openAuth('register')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Final Animation Section */}
      <section className="final-animation" ref={finalAnimationRef}>
        <div className="preloader">
          <div className="intro-title">
            <h1>+ CALIDAD</h1>
          </div>
          <div className="outro-title">
            <h1>ALBI</h1>
          </div>
        </div>

        <div className="split-overlay">
          <div className="intro-title">
            <h1>ALBILOGISTICS</h1>
          </div>
          <div className="outro-title">
            <h1>ALBI</h1>
          </div>
        </div>

        <div className="tags-overlay">
          <div className="tag tag-1"><p>Not just a store</p></div>
          <div className="tag tag-2"><p>~ 2025</p></div>
          <div className="tag tag-3"><p>Albi studios</p></div>
        </div>

        <div className="container">
          <div className="hero-img"><img src="/hero-img.jpg" alt="" /></div>
          <div className={`authcard-root ${isAuthVisible ? 'active' : ''}`} id="authcard-root">
            <div className="authcard-split authcard-split--left" id="authcard-left">
              <form className="authcard-form authcard-form--signin" onSubmit={handleLogin} style={{ display: authMode === 'login' ? 'block' : 'none' }}>
                <h2 className="authcard-title">Sign In</h2>
                <div className="authcard-fields">
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Email" 
                    required 
                    autoComplete="username"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <input 
                    type="password" 
                    name="password"
                    placeholder="Password" 
                    required 
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                <button type="submit" className="authcard-btn" aria-label="Sign In">Sign In</button>
                <div className="authcard-switch">
                  <span>Don't have an account?</span>
                  <button type="button" className="authcard-link" onClick={switchAuthMode}>Sign Up</button>
                </div>
              </form>
              <form className="authcard-form authcard-form--signup" onSubmit={handleRegister} style={{ display: authMode === 'register' ? 'block' : 'none' }}>
                <h2 className="authcard-title">Sign Up</h2>
                <div className="authcard-fields">
                  <div className="authcard-row">
                    <input 
                      type="text" 
                      name="firstName"
                      placeholder="Nombre" 
                      required 
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                    <input 
                      type="text" 
                      name="lastName"
                      placeholder="Apellido" 
                      required 
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Email" 
                    required 
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <input 
                    type="password" 
                    name="password"
                    placeholder="Contraseña" 
                    required 
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <input 
                    type="tel" 
                    name="phone"
                    placeholder="Número de teléfono" 
                    required 
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  <input 
                    type="text" 
                    name="storeName"
                    placeholder="Nombre del local" 
                    required 
                    autoComplete="organization"
                    value={formData.storeName}
                    onChange={handleInputChange}
                  />
                  <input 
                    type="text" 
                    name="storeAddress"
                    placeholder="Dirección del local" 
                    required 
                    autoComplete="street-address"
                    value={formData.storeAddress}
                    onChange={handleInputChange}
                  />
                </div>
                <button type="submit" className="authcard-btn" aria-label="Sign Up">Sign Up</button>
                <div className="authcard-switch">
                  <span>¿Ya tienes una cuenta?</span>
                  <button type="button" className="authcard-link" onClick={switchAuthMode}>Sign In</button>
                </div>
              </form>
            </div>
            <div className="authcard-split authcard-split--right" id="authcard-right">
              <div className="authcard-overlay" id="authcard-overlay">
                <div className="authcard-overlay-img" id="authcard-overlay-img" style={{backgroundImage: "url('/hero-img.jpg')"}}></div>
                <div className="authcard-overlay-content" id="authcard-overlay-content">
                  <h2 className="authcard-overlay-title" id="authcard-overlay-title">Hello, Friend!</h2>
                  <p className="authcard-overlay-desc" id="authcard-overlay-desc">Enter your personal details and start your journey with us</p>
                  <button type="button" className="authcard-overlay-btn" id="authcard-overlay-btn" onClick={() => setAuthMode('register')}>Sign Up</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 