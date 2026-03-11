const logoutForm = document.querySelector('#logout-form');

const connectLogoutForm = async (event) => {
  event.preventDefault();

  try {
    const response = await fetch('/auth/logout', {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    });

    const result = await response.json().catch(() => ({
      success: false,
      details: 'Unexpected API response.'
    }));

    if (!response.ok) {
      window.alert(result.details || 'Logout failed.');
      return;
    }

    window.location.assign('/auth/login');
  } catch (error) {
    window.alert('Unable to reach the logout API. Please try again.');
  }
};

if (logoutForm) {
  logoutForm.addEventListener('submit', connectLogoutForm);
}
