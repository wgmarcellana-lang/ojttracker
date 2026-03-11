const apiForms = document.querySelectorAll('[data-api-form]');

const renderFormErrors = (form, errors = []) => {
  const errorList = form.querySelector('[data-form-errors]');
  if (!errorList) {
    if (errors.length) {
      window.alert(errors.join('\n'));
    }
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

const buildRequestBody = (form) => {
  const formData = new FormData(form);
  const payload = {};

  formData.forEach((value, key) => {
    payload[key] = value;
  });

  return payload;
};

const connectApiForm = (form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    renderFormErrors(form, []);

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const response = await fetch(form.dataset.apiAction, {
        method: form.dataset.apiMethod || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(buildRequestBody(form))
      });

      const result = await response.json().catch(() => ({
        success: false,
        details: 'Unexpected API response.'
      }));

      if (!response.ok) {
        renderFormErrors(form, result.errors || [result.details || 'Request failed.']);
        return;
      }

      const redirectPath = result.redirectPath || form.dataset.successRedirect;
      if (redirectPath) {
        window.location.assign(redirectPath);
        return;
      }

      if (result.details) {
        window.alert(result.details);
      }
    } catch (error) {
      renderFormErrors(form, ['Unable to reach the API. Please try again.']);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
};

apiForms.forEach(connectApiForm);
