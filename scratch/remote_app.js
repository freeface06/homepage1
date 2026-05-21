/* app.js - Melwith Landing Page Interactivity */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Header scroll effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Interactive Phone Mockup Map Pin simulation
  const pins = document.querySelectorAll('.map-pin');
  const cardArtist = document.getElementById('card-artist');
  const cardDesc = document.getElementById('card-desc');
  const mapCard = document.getElementById('map-card');

  // Pin data map
  const pinData = {
    'pin-1': {
      artist: '아이유의 새봄공연',
      location: '홍대 놀이터 버스킹 Zone • 공연 중',
      badge: 'ON-AIR',
      color: '#FF007A'
    },
    'pin-2': {
      artist: '극단 청춘 - 거리극',
      location: '혜화 대학로 마로니에 공원 • 18:30 예정',
      badge: '18:30 시작',
      color: '#00F0FF'
    },
    'pin-3': {
      artist: '신진 작가 3인 야외 미술전',
      location: '성수 연무장길 스트리트 코너 • 오늘 전시',
      badge: 'OPEN ART',
      color: '#7B2CBF'
    }
  };

  function updateMockupCard(pinId) {
    const data = pinData[pinId];
    if (!data) return;

    // Apply fading animation effect to mockup card
    mapCard.style.opacity = '0';
    mapCard.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      cardArtist.textContent = data.artist;
      cardDesc.textContent = data.location;
      
      // Update badge text and background
      const badge = mapCard.querySelector('.overlay-badge');
      badge.textContent = data.badge;
      badge.style.background = data.color;
      
      mapCard.style.opacity = '1';
      mapCard.style.transform = 'translateY(0)';
    }, 200);
  }

  pins.forEach(pin => {
    pin.addEventListener('click', (e) => {
      // Find exact pin id class
      let pinId = '';
      if (pin.classList.contains('pin-1')) pinId = 'pin-1';
      if (pin.classList.contains('pin-2')) pinId = 'pin-2';
      if (pin.classList.contains('pin-3')) pinId = 'pin-3';

      updateMockupCard(pinId);
      
      // Reset scale of all pins, amplify clicked pin
      pins.forEach(p => p.style.transform = 'rotate(-45deg) scale(1)');
      pin.style.transform = 'rotate(-45deg) scale(1.2)';
    });
  });

  // Auto-rotating pins to make the screen look alive
  let currentPinIdx = 1;
  setInterval(() => {
    const nextPinClass = `.pin-${currentPinIdx}`;
    const targetPin = document.querySelector(nextPinClass);
    if (targetPin) {
      targetPin.click();
    }
    currentPinIdx = currentPinIdx === 3 ? 1 : currentPinIdx + 1;
  }, 4000); // changes target pin card information every 4 seconds

  // 3. Onboarding Funnel (Survey -> Waitlist) Controller
  const onboardingForm = document.getElementById('onboarding-form');
  const funnelTitle = document.getElementById('funnel-title');
  const funnelDesc = document.getElementById('funnel-desc');
  const progressContainer = document.getElementById('funnel-progress-container');
  const progressBar = document.getElementById('funnel-progress');
  const prevBtn = onboardingForm.querySelector('.prev-step');
  const nextBtn = onboardingForm.querySelector('.next-step');
  const submitBtn = onboardingForm.querySelector('.submit-waitlist');
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
    if (role === 'artist') {
      userRoleInput.value = 'artist';
    } else {
      userRoleInput.value = 'audience';
    }
  }

  // Privacy Policy Modal Controllers
  const privacyModal = document.getElementById('privacy-modal');
  const openPrivacyLink = document.getElementById('open-privacy-modal');
  const closePrivacyBtn = document.getElementById('close-privacy-modal');
  const agreePrivacyBtn = document.getElementById('btn-modal-agree');
  const privacyCheck = document.getElementById('privacy-check');

  openPrivacyLink.addEventListener('click', (e) => {
    e.preventDefault();
    privacyModal.classList.add('show');
  });

  const closeModal = () => {
    privacyModal.classList.remove('show');
  };

  closePrivacyBtn.addEventListener('click', closeModal);
  agreePrivacyBtn.addEventListener('click', () => {
    privacyCheck.checked = true;
    closeModal();
  });

  // Close modal when clicking outside content
  privacyModal.addEventListener('click', (e) => {
    if (e.target === privacyModal) {
      closeModal();
    }
  });

  // Legal Policies Modal & Tabs Controllers
  const legalModal = document.getElementById('legal-modal');
  const openTermsLink = document.getElementById('open-terms-link');
  const openPrivacyLinkLegal = document.getElementById('open-privacy-link');
  const openCopyrightLink = document.getElementById('open-copyright-link');
  const closeLegalBtn = document.getElementById('close-legal-modal');
  const closeLegalBottomBtn = document.getElementById('btn-legal-close');
  const tabButtons = legalModal.querySelectorAll('.tab-btn');
  const tabPanes = legalModal.querySelectorAll('.tab-pane');

  const openLegalModal = (tabId) => {
    // Switch to active tab first
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabPanes.forEach(pane => {
      if (pane.id === tabId) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    legalModal.classList.add('show');
  };

  const closeLegalModal = () => {
    legalModal.classList.remove('show');
  };

  if (openTermsLink) {
    openTermsLink.addEventListener('click', (e) => {
      e.preventDefault();
      openLegalModal('legal-terms');
    });
  }

  if (openPrivacyLinkLegal) {
    openPrivacyLinkLegal.addEventListener('click', (e) => {
      e.preventDefault();
      openLegalModal('legal-privacy');
    });
  }

  if (openCopyrightLink) {
    openCopyrightLink.addEventListener('click', (e) => {
      e.preventDefault();
      openLegalModal('legal-copyright');
    });
  }

  if (closeLegalBtn) {
    closeLegalBtn.addEventListener('click', closeLegalModal);
  }

  if (closeLegalBottomBtn) {
    closeLegalBottomBtn.addEventListener('click', closeLegalModal);
  }

  legalModal.addEventListener('click', (e) => {
    if (e.target === legalModal) {
      closeLegalModal();
    }
  });

  // Tab switching inside modal
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      button.classList.add('active');
      const targetPane = document.getElementById(targetTab);
      if (targetPane) {
        targetPane.classList.add('active');
        // Scroll modal body to top when switching tabs
        const modalBody = legalModal.querySelector('.modal-body');
        if (modalBody) {
          modalBody.scrollTop = 0;
        }
      }
    });
  });

  // Initial stats state loading
  let userCount = 852;
  statsUsers.innerHTML = `${userCount}<span>+</span>`;

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
    progressBar.style.width = `${progressPercent}%`;

    // Update Header Text & Navigation Buttons
    if (activeStepId === 'step-waitlist') {
      funnelTitle.textContent = '멜위드 사전 예약 모집';
      funnelDesc.textContent = '베타 테스트 오픈 / 오픈 베타시 입력하신 연락처로 안내 문자를 발송해 드립니다.';
      
      prevBtn.style.display = 'inline-block';
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'inline-block';
    } else {
      funnelTitle.textContent = '멜위드 사전 수요 조사';
      funnelDesc.textContent = '더 좋은 로컬 문화 매칭 서비스를 만들기 위한 3초 퀵 사전 설문입니다.';
      
      prevBtn.style.display = currentIndex === 0 ? 'none' : 'inline-block';
      nextBtn.style.display = 'inline-block';
      submitBtn.style.display = 'none';
    }
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
  nextBtn.addEventListener('click', () => {
    const activeStepEl = document.getElementById(getActiveStepId());
    const checkedOption = activeStepEl.querySelector('input[type="radio"]:checked');
    
    if (!checkedOption) {
      alert('설문 답변을 하나 선택해 주세요!');
      return;
    }

    // Custom text input validation
    const parentLabel = checkedOption.closest('.option-btn');
    const textInput = parentLabel.querySelector('.inline-text-input');
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

  // Prev Step routing
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      // Recalculate path to maintain correct back navigation
      updatePathFromSelections();
      updateFunnelUI();
    }
  });

  // Helper to extract choice value or custom text
  function getStepAnswer(stepId) {
    const stepEl = document.getElementById(stepId);
    if (!stepEl) return null;
    const checked = stepEl.querySelector('input[type="radio"]:checked');
    if (!checked) return null;

    const parentLabel = checked.closest('.option-btn');
    const textInput = parentLabel.querySelector('.inline-text-input');
    if (textInput) {
      const labelSpan = parentLabel.querySelector('span');
      const labelText = labelSpan ? labelSpan.textContent.replace('✏️', '').trim() : '기타';
      return `${labelText} (${textInput.value.trim()})`;
    }
    return checked.value;
  }

  // Form Submit Handler
  onboardingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const roleEl = document.getElementById('step-role');
    const checkedRole = roleEl.querySelector('input[name="role_choice"]:checked')?.value;
    
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
    const phone = userPhoneInput.value;

    if (!phone) return;
    if (!privacyCheck.checked) {
      alert('개인정보 수집 및 이용에 동의해야 신청 가능합니다.');
      return;
    }

    // Save consolidated data
    const onboardingData = JSON.parse(localStorage.getItem('melwith_onboarding') || '[]');
    onboardingData.push({
      survey: surveyData,
      waitlist: { role: checkedRole, phone },
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('melwith_onboarding', JSON.stringify(onboardingData));

    // Show custom toast message
    toast.textContent = `축하합니다! 사전 예약이 완료되었습니다. ✦`;
    toast.classList.add('show');
    
    // Auto increment simulation count
    userCount += 1;
    statsUsers.innerHTML = `${userCount}<span>+</span>`;

    // Transition to success screen
    onboardingForm.style.display = 'none';
    progressContainer.style.display = 'none';
    funnelTitle.style.display = 'none';
    funnelDesc.style.display = 'none';
    funnelComplete.style.display = 'block';

    // Auto-remove toast message
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  });

  // Restart Funnel
  document.getElementById('btn-funnel-restart').addEventListener('click', () => {
    onboardingForm.reset();
    currentPath = paths.role;
    currentIndex = 0;
    
    // Toggle visual panels back
    onboardingForm.style.display = 'block';
    progressContainer.style.display = 'block';
    funnelTitle.style.display = 'block';
    funnelDesc.style.display = 'block';
    funnelComplete.style.display = 'none';

    updateFunnelUI();
  });

  // 4. Smooth scrolling for internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70, // header gap offset
          behavior: 'smooth'
        });
      }
    });
  });

});
