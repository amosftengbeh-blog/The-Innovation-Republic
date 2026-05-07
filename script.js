const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

const setMenuState = (open) => {
  navMenu.classList.toggle('active', open);
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
};

navToggle.addEventListener('click', () => {
  const open = !navMenu.classList.contains('active');
  setMenuState(open);
});

const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    setMenuState(false);
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 720) {
    setMenuState(false);
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setMenuState(false);
  }
});

const apiRequest = async (url, payload) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({ message: 'Server error' }));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

const portalLoginForm = document.querySelector('#portal-login-form');
if (portalLoginForm) {
  const loginMessage = document.querySelector('#loginMessage');

  const previewFields = {
    username: document.querySelector('#previewUsername'),
    name: document.querySelector('#previewName'),
    organization: document.querySelector('#previewOrganization'),
    interest: document.querySelector('#previewInterest'),
    goals: document.querySelector('#previewGoals'),
    phone: document.querySelector('#previewPhone'),
    country: document.querySelector('#previewCountry')
  };

  const updatePreview = () => {
    previewFields.username.textContent = portalLoginForm.querySelector('#login-username').value.trim() || 'Not entered yet';
    previewFields.name.textContent = portalLoginForm.querySelector('#visitor-name').value.trim() || 'Not entered yet';
    previewFields.organization.textContent = portalLoginForm.querySelector('#visitor-organization').value.trim() || 'Not entered yet';
    previewFields.interest.textContent = portalLoginForm.querySelector('#visitor-interest').value || 'Not entered yet';
    previewFields.goals.textContent = portalLoginForm.querySelector('#visitor-goals').value.trim() || 'Not entered yet';
    previewFields.phone.textContent = portalLoginForm.querySelector('#visitor-phone').value.trim() || 'Not entered yet';
    previewFields.country.textContent = portalLoginForm.querySelector('#visitor-country').value.trim() || 'Not entered yet';
  };

  ['login-username', 'visitor-name', 'visitor-organization', 'visitor-interest', 'visitor-goals', 'visitor-phone', 'visitor-country'].forEach((id) => {
    const field = portalLoginForm.querySelector(`#${id}`);
    if (field) {
      field.addEventListener('input', updatePreview);
    }
  });

  updatePreview();

  portalLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = portalLoginForm.querySelector('#login-username').value.trim();
    const password = portalLoginForm.querySelector('#login-password').value;
    const visitorName = portalLoginForm.querySelector('#visitor-name').value.trim();
    const visitorOrganization = portalLoginForm.querySelector('#visitor-organization').value.trim();
    const visitorInterest = portalLoginForm.querySelector('#visitor-interest').value;
    const visitorGoals = portalLoginForm.querySelector('#visitor-goals').value.trim();
    const visitorPhone = portalLoginForm.querySelector('#visitor-phone').value.trim();
    const visitorCountry = portalLoginForm.querySelector('#visitor-country').value.trim();

    if (!username || !password) {
      loginMessage.textContent = 'Please enter the visitor username and password provided by the Innovation Republic team.';
      loginMessage.className = 'login-result error';
      return;
    }

    try {
      await apiRequest('/api/login', {
        username,
        password,
        name: visitorName,
        organization: visitorOrganization,
        interest: visitorInterest,
        goals: visitorGoals,
        phone: visitorPhone,
        country: visitorCountry
      });

      loginMessage.textContent = 'Login successful! Your visitor details have been recorded for portal access.';
      loginMessage.className = 'login-result success';

      const loginSuccessCard = document.querySelector('#loginSuccessCard');
      if (loginSuccessCard) {
        loginSuccessCard.querySelector('#summaryName').textContent = visitorName;
        loginSuccessCard.querySelector('#summaryOrganization').textContent = visitorOrganization;
        loginSuccessCard.querySelector('#summaryInterest').textContent = visitorInterest;
        loginSuccessCard.querySelector('#summaryGoals').textContent = visitorGoals;
        loginSuccessCard.querySelector('#summaryPhone').textContent = visitorPhone || 'Not provided';
        loginSuccessCard.querySelector('#summaryCountry').textContent = visitorCountry;
        loginSuccessCard.classList.remove('hidden');
      }

      portalLoginForm.querySelector('button').textContent = 'Submitted';
      portalLoginForm.querySelector('button').disabled = true;
      portalLoginForm.querySelectorAll('input, select, textarea').forEach((input) => {
        input.disabled = true;
      });
    } catch (error) {
      loginMessage.textContent = error.message;
      loginMessage.className = 'login-result error';
    }
  });
}

const contactForm = document.querySelector('#contactForm');
if (contactForm) {
  const contactMessage = document.querySelector('#contactMessage');

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.querySelector('#contactName').value.trim();
    const email = document.querySelector('#contactEmail').value.trim();
    const message = document.querySelector('#contactMessageField').value.trim();

    if (!name || !email || !message) {
      contactMessage.textContent = 'Please fill in your name, email, and message.';
      contactMessage.className = 'form-result error';
      return;
    }

    try {
      await apiRequest('/api/contact', { name, email, message });
      contactMessage.textContent = 'Thank you! Your message has been received.';
      contactMessage.className = 'form-result success';
      contactForm.reset();
    } catch (error) {
      contactMessage.textContent = error.message;
      contactMessage.className = 'form-result error';
    }
  });
}

const newsletterForm = document.querySelector('#newsletterForm');
if (newsletterForm) {
  const newsletterMessage = document.querySelector('#newsletterMessage');

  newsletterForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.querySelector('#newsletterEmail').value.trim();
    const interest = document.querySelector('#newsletterInterest').value;

    if (!email || !interest) {
      newsletterMessage.textContent = 'Please provide your email and select an interest area.';
      newsletterMessage.className = 'form-result error';
      return;
    }

    try {
      await apiRequest('/api/newsletter', { email, interest });
      newsletterMessage.textContent = 'You have been signed up for updates.';
      newsletterMessage.className = 'form-result success';
      newsletterForm.reset();
    } catch (error) {
      newsletterMessage.textContent = error.message;
      newsletterMessage.className = 'form-result error';
    }
  });
}
