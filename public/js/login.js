const loginForm = document.querySelector('#login-form');
const errorList = document.querySelector('#login-errors');

const renderErrors = (errors = []) => {
  if (!errorList) {
    return;
  }

  if (!errors.length) {
    errorList.replaceChildren();
    errorList.hidden = true;
    return;
  }

  const items = errors.map((error) => {
    const item = document.createElement('li');
    item.textContent = error;
    return item;
  });

  errorList.replaceChildren(...items);
  errorList.hidden = false;
};

const connectLoginForm = async (event) => {
  event.preventDefault();

  renderErrors([]);

  const submitButton = loginForm.querySelector('button[type="submit"]');
  const formData = new FormData(loginForm);
  const payload = {
    username: formData.get('username'),
    password: formData.get('password')
  };

  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({
      success: false,
      details: 'Unexpected API response.'
    }));

    if (!response.ok) {
      renderErrors(result.errors || [result.details || 'Login failed.']);
      return;
    }

    if (result.redirectPath) {
      window.location.assign(result.redirectPath);
    }
  } catch (error) {
    renderErrors(['Unable to reach the login API. Please try again.']);
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
};

if (loginForm) {
  loginForm.addEventListener('submit', connectLoginForm);
}
