(function () {
  const API = window.location.origin + '/api';

  function getToken() {
    return localStorage.getItem('shopease_token');
  }

  function setToken(t) {
    if (t) localStorage.setItem('shopease_token', t);
    else localStorage.removeItem('shopease_token');
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('shopease_user') || 'null');
    } catch {
      return null;
    }
  }

  function setUser(u) {
    if (u) localStorage.setItem('shopease_user', JSON.stringify(u));
    else localStorage.removeItem('shopease_user');
  }

  async function api(path, options = {}) {
    const headers = Object.assign(
      { 'Content-Type': 'application/json' },
      options.headers || {}
    );
    const token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch(API + path, Object.assign({}, options, { headers }));
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }
    if (!res.ok) {
      const err = new Error((data && data.error) || res.statusText || 'Request failed');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  window.ShopEase = Object.assign(window.ShopEase || {}, {
    API,
    api,
    getToken,
    setToken,
    getUser,
    setUser,
  });
})();
