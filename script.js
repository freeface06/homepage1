document.addEventListener('DOMContentLoaded', () => {

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  /* ==========================================================================
     1. Header & Navigation Controller
     ========================================================================== */
  const header = document.getElementById('main-header');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  // Change header appearance on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile navigation hamburger toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking navigation link
    const navLinks = navMenu.querySelectorAll('.nav-link, .btn');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }


  /* ==========================================================================
     2. Staggered Scroll Entrance Animations (IntersectionObserver)
     ========================================================================== */
  const fadeUpElements = document.querySelectorAll('.fade-up-init');

  if ('IntersectionObserver' in window) {
    // Determine triggers depending on device size to prevent hidden content bugs on mobile
    const isMobile = window.innerWidth < 768;
    const observerOptions = {
      root: null, // viewport
      rootMargin: isMobile ? '150px 0px' : '50px 0px', // Pre-trigger on mobile to prevent white screen bugs
      threshold: isMobile ? 0.01 : 0.05 // trigger when elements are barely visible
    };

    const entranceObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-up-visible');
          // Once animated, stop observing this element
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    fadeUpElements.forEach(el => {
      entranceObserver.observe(el);
    });

    // Mobile fallback scroll listener to ensure elements are NEVER invisible due to layout height calculation bugs
    if (isMobile) {
      const mobileScrollFallback = () => {
        let allVisible = true;
        fadeUpElements.forEach(el => {
          if (!el.classList.contains('fade-up-visible')) {
            allVisible = false;
            const rect = el.getBoundingClientRect();
            // If the element is within the viewport + 200px threshold
            if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
              el.classList.add('fade-up-visible');
            }
          }
        });
        if (allVisible) {
          window.removeEventListener('scroll', mobileScrollFallback);
          window.removeEventListener('resize', mobileScrollFallback);
        }
      };
      window.addEventListener('scroll', mobileScrollFallback);
      window.addEventListener('resize', mobileScrollFallback);
      // Run once initially with delay to allow initial layout computation
      setTimeout(mobileScrollFallback, 300);
    }
  } else {
    // Fallback: immediately visible if observer not supported
    fadeUpElements.forEach(el => el.classList.add('fade-up-visible'));
  }


  /* ==========================================================================
     3. Interactive Multi-Step Survey & Waitlist & Dynamic Funnel Controller
     ========================================================================== */
  const onboardingForm = document.getElementById('onboarding-form');
  const funnelTitle = document.getElementById('funnel-title');
  const funnelDesc = document.getElementById('funnel-desc');
  const progressContainer = document.getElementById('funnel-progress-container');
  const progressBar = document.getElementById('funnel-progress');
  const prevBtn = onboardingForm ? onboardingForm.querySelector('.prev-step') : null;
  const nextBtn = onboardingForm ? onboardingForm.querySelector('.next-step') : null;
  const submitBtn = onboardingForm ? onboardingForm.querySelector('.submit-waitlist') : null;
  const funnelComplete = document.getElementById('funnel-complete');
  const statsBlock = document.getElementById('funnel-stats-block');
  const statsUsers = document.getElementById('stats-users');
  const toast = document.getElementById('toast-message');

  // Input Field Controls
  const userRoleInput = document.getElementById('user-role');
  const phoneGroup = document.getElementById('phone-group');
  const userPhoneInput = document.getElementById('user-phone');

  // Helper to toggle role-specific waitlist fields
  function updateRoleFields(role) {
    if (userRoleInput) {
      if (role === 'artist') {
        userRoleInput.value = 'artist';
      } else {
        userRoleInput.value = 'audience';
      }
    }
  }

  // Privacy Policy Modal Controllers
  const privacyModal = document.getElementById('privacy-modal');
  const openPrivacyLink = document.getElementById('open-privacy-modal');
  const closePrivacyBtn = document.getElementById('close-privacy-modal');
  const agreePrivacyBtn = document.getElementById('btn-modal-agree');
  const privacyCheck = document.getElementById('privacy-check');

  if (openPrivacyLink && privacyModal) {
    openPrivacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      privacyModal.classList.add('show');
    });
  }

  const closeModal = () => {
    if (privacyModal) privacyModal.classList.remove('show');
  };

  if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', closeModal);
  if (agreePrivacyBtn && privacyCheck) {
    agreePrivacyBtn.addEventListener('click', () => {
      privacyCheck.checked = true;
      closeModal();
    });
  }

  // Close modal when clicking outside content
  if (privacyModal) {
    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal) {
        closeModal();
      }
    });
  }

  // Initial stats state loading
  let userCount = 852;
  if (statsUsers) {
    statsUsers.innerHTML = `${userCount}<span>+</span>`;
  }

  // Dynamic Funnel Step Navigation Paths
  const paths = {
    role: ['step-role'],
    fan: ['step-role', 'step-fan-q1', 'step-fan-q2', 'step-fan-q3', 'step-fan-q4', 'step-waitlist'],
    artist_yes: ['step-role', 'step-art-q1', 'step-art-q1-2', 'step-art-q2', 'step-art-q3', 'step-art-q4', 'step-waitlist'],
    artist_no: ['step-role', 'step-art-q1', 'step-art-q2', 'step-art-q3', 'step-art-q4', 'step-waitlist']
  };

  let currentPath = paths.role;
  let currentIndex = 0;

  function getActiveStepId() {
    return currentPath[currentIndex];
  }

  // Helper to update path based on selections
  function updatePathFromSelections() {
    const roleEl = document.getElementById('step-role');
    if (!roleEl) return;
    const checkedRole = roleEl.querySelector('input[name="role_choice"]:checked');
    if (!checkedRole) {
      currentPath = paths.role;
      return;
    }

    if (checkedRole.value === 'fan') {
      currentPath = paths.fan;
      updateRoleFields('fan');
    } else if (checkedRole.value === 'artist') {
      updateRoleFields('artist');
      const q1El = document.getElementById('step-art-q1');
      const checkedQ1 = q1El ? q1El.querySelector('input[name="art_q1"]:checked') : null;
      if (checkedQ1 && checkedQ1.value === 'yes') {
        currentPath = paths.artist_yes;
      } else {
        currentPath = paths.artist_no;
      }
    }
  }

  function updateFunnelUI() {
    if (!onboardingForm) return;
    const activeStepId = getActiveStepId();
    
    // Show/Hide steps
    const steps = onboardingForm.querySelectorAll('.funnel-step');
    steps.forEach(step => {
      step.style.display = 'none';
      step.classList.remove('active');
      if (step.id === activeStepId) {
        step.style.display = 'block';
        step.classList.add('active');
      }
    });

    // Update Progress Bar
    const totalSteps = currentPath === paths.role ? 6 : currentPath.length;
    const progressPercent = ((currentIndex + 1) / totalSteps) * 100;
    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
    }

    // Update Header Text & Navigation Buttons
    if (activeStepId === 'step-waitlist') {
      if (funnelTitle) funnelTitle.textContent = '멜위드 사전 예약 모집';
      if (funnelDesc) funnelDesc.textContent = '베타 테스트 오픈 / 오픈 베타시 입력하신 연락처로 안내 문자를 발송해 드립니다.';
      
      if (prevBtn) prevBtn.style.display = 'inline-block';
      if (nextBtn) nextBtn.style.display = 'none';
      if (submitBtn) submitBtn.style.display = 'inline-block';
    } else {
      if (funnelTitle) funnelTitle.textContent = '멜위드 사전 수요 조사';
      if (funnelDesc) funnelDesc.textContent = '더 좋은 로컬 문화 매칭 서비스를 만들기 위한 3초 퀵 사전 설문입니다.';
      
      if (prevBtn) prevBtn.style.display = currentIndex === 0 ? 'none' : 'inline-block';
      if (nextBtn) nextBtn.style.display = 'inline-block';
      if (submitBtn) submitBtn.style.display = 'none';
    }

    // Re-bind double cursor ring interaction for dynamically revealed option elements
    setTimeout(bindCursorHovers, 50);
  }

  // Handle focus & click in inline-text-input to auto-check parent radio
  document.querySelectorAll('.inline-text-input').forEach(input => {
    input.addEventListener('click', (e) => {
      e.stopPropagation();
      const radio = input.closest('.option-btn').querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
    input.addEventListener('focus', () => {
      const radio = input.closest('.option-btn').querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Next Step validation and routing
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const activeStepEl = document.getElementById(getActiveStepId());
      if (!activeStepEl) return;
      const checkedOption = activeStepEl.querySelector('input[type="radio"]:checked');
      
      if (!checkedOption) {
        alert('설문 답변을 하나 선택해 주세요!');
        return;
      }

      // Custom text input validation
      const parentLabel = checkedOption.closest('.option-btn');
      const textInput = parentLabel ? parentLabel.querySelector('.inline-text-input') : null;
      if (textInput && !textInput.value.trim()) {
        alert('직접 입력 란을 작성해 주세요!');
        textInput.focus();
        return;
      }

      // Recalculate path before progressing
      updatePathFromSelections();

      if (currentIndex < currentPath.length - 1) {
        currentIndex++;
        updateFunnelUI();
      }
    });
  }

  // Prev Step routing
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        // Recalculate path to maintain correct back navigation
        updatePathFromSelections();
        updateFunnelUI();
      }
    });
  }

  // Helper to extract choice value or custom text
  function getStepAnswer(stepId) {
    const stepEl = document.getElementById(stepId);
    if (!stepEl) return null;
    const checked = stepEl.querySelector('input[type="radio"]:checked');
    if (!checked) return null;

    const parentLabel = checked.closest('.option-btn');
    const textInput = parentLabel ? parentLabel.querySelector('.inline-text-input') : null;
    if (textInput) {
      const labelSpan = parentLabel.querySelector('span');
      const labelText = labelSpan ? labelSpan.textContent.replace('✏️', '').trim() : '기타';
      return `${labelText} (${textInput.value.trim()})`;
    }
    return checked.value;
  }

  // Phone input formatting (010-0000-0000 mask format)
  if (userPhoneInput) {
    userPhoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/[^0-9]/g, '');
      let formattedValue = '';
      
      if (value.length > 11) {
        value = value.substring(0, 11);
      }

      if (value.length <= 3) {
        formattedValue = value;
      } else if (value.length <= 7) {
        formattedValue = `${value.substring(0, 3)}-${value.substring(3)}`;
      } else {
        formattedValue = `${value.substring(0, 3)}-${value.substring(3, 7)}-${value.substring(7)}`;
      }
      
      e.target.value = formattedValue;
    });
  }

  // Form Submit Handler
  if (onboardingForm) {
    onboardingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const roleEl = document.getElementById('step-role');
      const checkedRole = roleEl ? roleEl.querySelector('input[name="role_choice"]:checked')?.value : null;
      
      let surveyData = {};

      if (checkedRole === 'fan') {
        surveyData = {
          role: 'fan',
          q1: getStepAnswer('step-fan-q1'),
          q2: getStepAnswer('step-fan-q2'),
          q3: getStepAnswer('step-fan-q3'),
          q4: getStepAnswer('step-fan-q4')
        };
      } else {
        surveyData = {
          role: 'artist',
          q1: getStepAnswer('step-art-q1'),
          q1_2: getStepAnswer('step-art-q1-2') || 'N/A (경험없음)',
          q2: getStepAnswer('step-art-q2'),
          q3: getStepAnswer('step-art-q3'),
          q4: getStepAnswer('step-art-q4')
        };
      }

      // Waitlist details
      const phone = userPhoneInput ? userPhoneInput.value : '';

      if (!phone || phone.length < 12) {
        alert('올바른 휴대폰 번호를 입력해 주세요.');
        return;
      }
      if (privacyCheck && !privacyCheck.checked) {
        alert('개인정보 수집 및 이용에 동의해야 신청 가능합니다.');
        return;
      }

      // Show processing feedback on button
      if (submitBtn) {
        submitBtn.setAttribute('disabled', 'true');
        submitBtn.textContent = '신청 처리 중...';
      }

      setTimeout(() => {
        // Save consolidated data to localStorage
        const onboardingData = JSON.parse(localStorage.getItem('melwith_onboarding') || '[]');
        onboardingData.push({
          survey: surveyData,
          waitlist: { role: checkedRole, phone },
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('melwith_onboarding', JSON.stringify(onboardingData));

        // Show custom toast message
        if (toast) {
          toast.textContent = `축하합니다! 사전 예약이 완료되었습니다. ✦`;
          toast.classList.add('show');
          
          setTimeout(() => {
            toast.classList.remove('show');
          }, 3000);
        }
        
        // Auto increment simulation count
        userCount += 1;
        if (statsUsers) {
          statsUsers.innerHTML = `${userCount}<span>+</span>`;
        }

        // Transition to success screen
        onboardingForm.style.display = 'none';
        if (progressContainer) progressContainer.style.display = 'none';
        if (funnelTitle) funnelTitle.style.display = 'none';
        if (funnelDesc) funnelDesc.style.display = 'none';
        if (funnelComplete) funnelComplete.style.display = 'block';
      }, 1000);
    });
  }

  // Restart Funnel
  const restartBtn = document.getElementById('btn-funnel-restart');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      if (onboardingForm) onboardingForm.reset();
      currentPath = paths.role;
      currentIndex = 0;
      
      // Toggle visual panels back
      if (onboardingForm) onboardingForm.style.display = 'block';
      if (progressContainer) progressContainer.style.display = 'block';
      if (funnelTitle) funnelTitle.style.display = 'block';
      if (funnelDesc) funnelDesc.style.display = 'block';
      if (funnelComplete) funnelComplete.style.display = 'none';
      
      if (submitBtn) {
        submitBtn.removeAttribute('disabled');
        submitBtn.textContent = '사전 예약 완료하기 ✦';
      }

      updateFunnelUI();
    });
  }


  /* ==========================================================================
     4. Teaser Video Controller Interaction
     ========================================================================== */
  const videoPlayerCard = document.getElementById('video-player-card');
  const videoOverlayInner = document.getElementById('video-overlay-inner');
  const videoPlaceholder = document.getElementById('video-iframe-placeholder');

  if (videoPlayerCard && videoOverlayInner && videoPlaceholder) {
    videoPlayerCard.addEventListener('click', () => {
      // Smoothly hide overlay description
      videoOverlayInner.style.opacity = '0';
      videoOverlayInner.style.pointerEvents = 'none';

      // Show mock loader/video content
      videoPlaceholder.style.display = 'block';
      
      setTimeout(() => {
        videoOverlayInner.style.display = 'none';
      }, 300);
    });
  }

  /* ==========================================================================
     5. Custom Cursor Tracker (Double-ring Elastic Tracker)
     ========================================================================== */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  
  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;
  
  // Track raw mouse position
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Instantly update inner dot position
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });
  
  // Animate elastic outer ring with linear interpolation (lerp)
  function animateCursorRing() {
    // 0.15 is the interpolation factor (gives elastic/spring lag)
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    
    if (cursorRing) {
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
    }
    
    requestAnimationFrame(animateCursorRing);
  }
  animateCursorRing();
  
  // Handle hovering cursor scale states on interactive items
  function bindCursorHovers() {
    const hoverTargets = document.querySelectorAll('a, button, input, select, textarea, .option-btn, .video-mockup');
    hoverTargets.forEach(target => {
      // Remove any existing duplicate listeners to be safe
      target.removeEventListener('mouseenter', addCursorHoverClass);
      target.removeEventListener('mouseleave', removeCursorHoverClass);
      
      target.addEventListener('mouseenter', addCursorHoverClass);
      target.addEventListener('mouseleave', removeCursorHoverClass);
    });
  }
  
  function addCursorHoverClass() {
    document.body.classList.add('cursor-hovering');
  }
  
  function removeCursorHoverClass() {
    document.body.classList.remove('cursor-hovering');
  }
  
  bindCursorHovers();
  
  // Re-bind cursor hovers when DOM state changes inside the survey
  const surveyActionButtons = document.querySelectorAll('.option-btn, .btn, .btn-back');
  surveyActionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Wait a tick for survey step DOM changes
      setTimeout(bindCursorHovers, 50);
    });
  });


  /* ==========================================================================
     6. Hero Slogan Text Slider (Cycle keywords with Dynamic Width Auto-resizer)
     ========================================================================== */
  const heroSliderText = document.getElementById('hero-slider-text');
  const sliderContainer = document.querySelector('.slider-container');
  const slogans = [
    "웨이팅 없는 독립전시를",
    "1km 안의 버스킹을",
    "손쉬운 팁(Tip) 후원을",
    "로컬 예술 소통을"
  ];
  let sloganIndex = 0;

  // Sync rotating live mock card data
  const cardData = [
    {
      status: "전시 진행 중",
      title: "빛의 잔상: 서재혁 개인전",
      loc: "성수 갤러리 밸리",
      badges: ["독립전시", "미디어 아트"],
      bg: "images/gallery.png",
      pulseColor: "#8408E9"
    },
    {
      status: "공연 진행 중",
      title: "아이유의 새봄공연",
      loc: "홍대 놀이터 버스킹 Zone",
      badges: ["인디 음악", "보컬"],
      bg: "images/busking.png",
      pulseColor: "#FF2E93"
    },
    {
      status: "공연 예정",
      title: "첼리스트 김도원의 라이브 클래식",
      loc: "신촌 스타광장 야외무대",
      badges: ["클래식", "첼로"],
      bg: "images/cello.png",
      pulseColor: "#4F46E5"
    },
    {
      status: "원데이 클래스",
      title: "도예가 정민우의 핸즈온 워크숍",
      loc: "대학로 예술광장 아뜰리에",
      badges: ["도예", "원데이 클래스"],
      bg: "images/workshop.png",
      pulseColor: "#10B981"
    }
  ];

  const heroLiveCard = document.getElementById('hero-live-card');
  const cardMedia = document.getElementById('hero-card-media');
  const cardStatus = document.getElementById('hero-card-status');
  const cardTitle = document.getElementById('hero-card-title');
  const cardLoc = document.getElementById('hero-card-loc');
  const cardBadges = document.getElementById('hero-card-badges');
  const cardPulse = document.getElementById('hero-card-pulse');
  
  function adjustSliderWidth(text) {
    if (!sliderContainer) return;
    
    // Create temporary off-screen element to measure exact text pixel width
    const tester = document.createElement('span');
    const styles = window.getComputedStyle(sliderContainer);
    
    tester.style.fontFamily = styles.fontFamily;
    tester.style.fontSize = styles.fontSize;
    tester.style.fontWeight = styles.fontWeight;
    tester.style.letterSpacing = styles.letterSpacing;
    tester.style.position = 'absolute';
    tester.style.visibility = 'hidden';
    tester.style.whiteSpace = 'nowrap';
    tester.textContent = text;
    
    document.body.appendChild(tester);
    const rect = tester.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    document.body.removeChild(tester);
    
    // Set width on container smoothly (commented out to keep surrounding text fixed as requested)
    // sliderContainer.style.width = `${width + 12}px`;
  }
  
  function rotateSlogans() {
    if (!heroSliderText) return;
    
    // Slide out current text
    heroSliderText.style.opacity = '0';
    heroSliderText.style.transform = 'translateY(-100%)';
    
    // Gently slide down and fade out the live card
    if (heroLiveCard) {
      heroLiveCard.style.opacity = '0.3';
      heroLiveCard.style.transform = 'translateY(12px) scale(0.98)';
    }
    
    setTimeout(() => {
      // Switch content index
      sloganIndex = (sloganIndex + 1) % slogans.length;
      heroSliderText.textContent = slogans[sloganIndex];
      
      // Update Card Content with new data
      const data = cardData[sloganIndex];
      if (cardMedia) cardMedia.style.backgroundImage = `url('${data.bg}')`;
      if (cardStatus) cardStatus.textContent = data.status;
      if (cardTitle) cardTitle.textContent = data.title;
      if (cardLoc) cardLoc.innerHTML = `<i data-lucide="map-pin"></i> ${data.loc}`;
      
      if (cardBadges) {
        cardBadges.innerHTML = data.badges.map(b => `<span class="live-genre-badge">${b}</span>`).join('');
      }
      
      if (cardPulse && data.pulseColor) {
        cardPulse.style.backgroundColor = data.pulseColor;
      }
      
      // Re-trigger Lucide to parse the newly created dynamic map-pin icon
      if (window.lucide) {
        window.lucide.createIcons();
      }
      
      // Snap text to bottom for entrance
      heroSliderText.style.transform = 'translateY(100%)';
      
      // Trigger reflow/repaint to apply transform instantly
      heroSliderText.offsetHeight;
      
      // Slide up and fade in text
      heroSliderText.style.opacity = '1';
      heroSliderText.style.transform = 'translateY(0)';
      
      // Gently slide up and fade in the live card
      if (heroLiveCard) {
        heroLiveCard.style.opacity = '1';
        heroLiveCard.style.transform = 'translateY(0px) scale(1)';
      }
    }, 600); // matches slide out transition duration
  }
  
  // Set initial style overrides & measure initial width
  if (heroSliderText) {
    heroSliderText.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease';
    
    // Rotate slogans periodically
    setInterval(rotateSlogans, 3500);
  }


  /* ==========================================================================
     7. Dynamic Stats Counter (Scroll-triggered animation)
     ========================================================================== */
  const countElements = document.querySelectorAll('.count-num');
  
  if ('IntersectionObserver' in window) {
    const statsObserverOptions = {
      root: null,
      threshold: 0.2 // Trigger when 20% visible
    };
    
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const targetNum = parseInt(entry.target.getAttribute('data-count'), 10);
          animateValue(entry.target, 0, targetNum, 2000); // animate over 2 seconds
          observer.unobserve(entry.target);
        }
      });
    }, statsObserverOptions);
    
    countElements.forEach(el => statsObserver.observe(el));
  } else {
    // Fallback: immediately show target numbers if observer not supported
    countElements.forEach(el => {
      el.textContent = el.getAttribute('data-count');
    });
  }
  
  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);
      obj.innerHTML = Math.floor(easeProgress * (end - start) + start).toLocaleString();
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.innerHTML = end.toLocaleString();
      }
    };
    window.requestAnimationFrame(step);
  }


  /* ==========================================================================
     8. High-Performance Interactive Connection Network (HTML5 Canvas Background)
     ========================================================================== */
  const canvas = document.getElementById('network-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId = null;
    
    // Mouse coords for network attraction
    let netMouse = { x: null, y: null, radius: 150 };
    
    window.addEventListener('mousemove', (e) => {
      netMouse.x = e.clientX;
      netMouse.y = e.clientY;
    });
    
    window.addEventListener('mouseleave', () => {
      netMouse.x = null;
      netMouse.y = null;
    });
    
    // Determine screen parameters
    let isMobile = window.innerWidth < 768;
    let particleCount = isMobile ? 22 : 75;
    let maxDistance = isMobile ? 80 : 125;
    
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      isMobile = window.innerWidth < 768;
      particleCount = isMobile ? 22 : 75;
      maxDistance = isMobile ? 80 : 125;
      initParticles();
    }
    
    class Particle {
      constructor(x, y, isTemporary = false) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * (isTemporary ? 2.5 : 0.6);
        this.vy = (Math.random() - 0.5) * (isTemporary ? 2.5 : 0.6);
        this.baseSize = Math.random() * 2 + 1;
        this.size = this.baseSize;
        this.color = Math.random() > 0.5 ? 'rgba(167, 139, 250, ' : 'rgba(99, 102, 241, ';
        this.alpha = isTemporary ? 1.0 : Math.random() * 0.4 + 0.2;
        this.isTemporary = isTemporary;
        this.life = isTemporary ? 80 : null; // frames
      }
      
      update() {
        // Drifting motion
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off screen boundaries
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        
        // Mouse gravity pull (only for permanent particles on desktop)
        if (!this.isTemporary && netMouse.x !== null && !isMobile) {
          const dx = netMouse.x - this.x;
          const dy = netMouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < netMouse.radius) {
            const force = (netMouse.radius - dist) / netMouse.radius;
            // Gently pull toward mouse
            this.x += (dx / dist) * force * 0.8;
            this.y += (dy / dist) * force * 0.8;
            this.size = this.baseSize * (1 + force * 0.6);
          } else {
            this.size = this.baseSize;
          }
        }
        
        // Handle life cycles for temporary click particles
        if (this.isTemporary) {
          this.life--;
          this.alpha = Math.max(0, this.life / 80);
        }
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.shadowBlur = this.isTemporary ? 8 : 0;
        ctx.shadowColor = 'rgba(167, 139, 250, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }
    
    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }
    
    // Spawn temporary neon elements on screen click
    window.addEventListener('click', (e) => {
      // Spawn small burst of network nodes
      const count = isMobile ? 4 : 8;
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(e.clientX, e.clientY, true));
      }
    });
    
    function drawLines() {
      // connecting lines (disable on mobile for high-performance fluid scroll)
      if (isMobile) return;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < maxDistance) {
            // Line alpha fades as distance gets larger
            const alpha = (1 - dist / maxDistance) * 0.12 * Math.min(p1.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    }
    
    function animateNetwork() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach((p, idx) => {
        p.update();
        p.draw();
        
        // Remove temporary particles when dead
        if (p.isTemporary && p.life <= 0) {
          particles.splice(idx, 1);
        }
      });
      
      drawLines();
      
      animationFrameId = requestAnimationFrame(animateNetwork);
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateNetwork();
  }


  /* ==========================================================================
     9. Vercel-Style Spotlight Cursor Tracking for Sapphire Cards
     ========================================================================== */
  const cards = document.querySelectorAll('.survey-card, .feature-card, .upcoming-card, .stat-card, .live-mock-card');
  
  cards.forEach(card => {
    // Add marker class for easy CSS targeting
    card.classList.add('spotlight-card');
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // relative cursor x
      const y = e.clientY - rect.top;  // relative cursor y
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });


  /* ==========================================================================
     10. Premium Custom Dialog Modal (Alert & Confirm Glassmorphism)
     ========================================================================== */
  function createMelwithModal(type, message, resolveFn = null) {
    // Remove existing custom modal if any
    const existing = document.getElementById('melwith-custom-modal');
    if (existing) {
      existing.remove();
    }

    // Create modal elements dynamically
    const backdrop = document.createElement('div');
    backdrop.id = 'melwith-custom-modal';
    backdrop.className = 'melwith-modal-backdrop';

    const isConfirm = (type === 'confirm');
    
    // Choose neon icons
    const iconHTML = isConfirm
      ? `<div class="melwith-modal-icon type-confirm">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
         </div>`
      : `<div class="melwith-modal-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
         </div>`;

    const titleText = isConfirm ? '확인이 필요합니다 ✦' : '안내 ✦';
    const actionsHTML = isConfirm
      ? `<button class="melwith-modal-btn melwith-modal-btn-cancel" id="melwith-modal-cancel">취소</button>
         <button class="melwith-modal-btn melwith-modal-btn-confirm" id="melwith-modal-confirm">확인</button>`
      : `<button class="melwith-modal-btn melwith-modal-btn-confirm" id="melwith-modal-confirm">확인</button>`;

    backdrop.innerHTML = `
      <div class="melwith-modal-card">
        ${iconHTML}
        <h3 class="melwith-modal-title">${titleText}</h3>
        <p class="melwith-modal-message">${message}</p>
        <div class="melwith-modal-actions">
          ${actionsHTML}
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Apply show class on next frame for fade/zoom animation
    requestAnimationFrame(() => {
      backdrop.classList.add('show');
    });

    // Sync Custom Mouse Cursor effects
    if (typeof bindCursorHovers === 'function') {
      setTimeout(bindCursorHovers, 50);
    } else {
      const btns = backdrop.querySelectorAll('.melwith-modal-btn');
      btns.forEach(btn => {
        btn.addEventListener('mouseenter', () => document.body.classList.add('cursor-hovering'));
        btn.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hovering'));
      });
    }

    function closeModal(value) {
      backdrop.classList.remove('show');
      document.body.classList.remove('cursor-hovering');
      
      setTimeout(() => {
        backdrop.remove();
        if (resolveFn) {
          resolveFn(value);
        }
      }, 400);
    }

    const confirmBtn = backdrop.querySelector('#melwith-modal-confirm');
    const cancelBtn = backdrop.querySelector('#melwith-modal-cancel');

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        closeModal(true);
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        closeModal(false);
      });
    }

    // Backdrop click behavior
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(false);
      }
    });
  }

  // Override global window.alert & window.confirm
  window.alert = function(message) {
    createMelwithModal('alert', message);
  };

  window.confirm = function(message) {
    return new Promise((resolve) => {
      createMelwithModal('confirm', message, resolve);
    });
  };

});

