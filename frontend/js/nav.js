(function () {
  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        if (k === 'class') n.className = attrs[k];
        else if (k === 'html') n.innerHTML = attrs[k];
        else n.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach((c) => {
      if (typeof c === 'string') n.appendChild(document.createTextNode(c));
      else if (c) n.appendChild(c);
    });
    return n;
  }

  async function refreshCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge || !window.ShopEase.getToken()) return;
    try {
      const d = await window.ShopEase.api('/cart');
      badge.textContent = d.itemCount || 0;
    } catch {
      badge.textContent = '0';
    }
  }

  function mount(targetId) {
    const mountEl = document.getElementById(targetId);
    if (!mountEl) return;
    const user = window.ShopEase.getUser();
    const authed = !!window.ShopEase.getToken();

    const inner = el('div', { class: 'header-inner' });
    inner.appendChild(
      el('a', { class: 'logo', href: '/Home.html' }, [
        document.createTextNode('Shop'),
        el('span', {}, [document.createTextNode('Ease')]),
      ])
    );

    const form = el('form', { class: 'search-bar' });
    const input = el('input', {
      type: 'search',
      name: 'q',
      placeholder: 'Search products…',
      'aria-label': 'Search',
    });
    if (typeof window.__initialSearch === 'string') input.value = window.__initialSearch;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      window.location.href = '/Home.html?q=' + encodeURIComponent(q);
    });
    form.appendChild(input);
    form.appendChild(
      el('button', { type: 'submit' }, [document.createTextNode('Search')])
    );
    inner.appendChild(form);

    const nav = el('nav', { class: 'nav-links' });
    nav.appendChild(
      el('a', { href: '/Home.html' }, [document.createTextNode('Home')])
    );
    nav.appendChild(
      el('a', { href: '/Product.html' }, [document.createTextNode('Catalog')])
    );
    if (authed) {
      const cartLink = el('a', { href: '/Cart.html' }, [
        document.createTextNode('Cart'),
        el('span', { id: 'cart-badge', class: 'badge' }, [document.createTextNode('0')]),
      ]);
      nav.appendChild(cartLink);
      nav.appendChild(
        el('a', { href: '/Checkout.html' }, [document.createTextNode('Checkout')])
      );
      nav.appendChild(
        el('a', { href: '/Orders.html' }, [document.createTextNode('Orders')])
      );
      if (user && user.role === 'admin') {
        nav.appendChild(
          el('a', { href: '/admin/Dashboard.html' }, [document.createTextNode('Admin')])
        );
      }
      nav.appendChild(
        el(
          'button',
          {
            type: 'button',
            id: 'logout-btn',
          },
          [document.createTextNode('Logout (' + (user && user.name ? user.name : 'user') + ')')]
        )
      );
    } else {
      nav.appendChild(
        el('a', { href: '/Login.html' }, [document.createTextNode('Login')])
      );
      nav.appendChild(
        el('a', { href: '/Register.html' }, [document.createTextNode('Register')])
      );
    }
    inner.appendChild(nav);
    mountEl.appendChild(inner);

    const logout = document.getElementById('logout-btn');
    if (logout) {
      logout.addEventListener('click', () => {
        window.ShopEase.setToken(null);
        window.ShopEase.setUser(null);
        window.location.href = '/Home.html';
      });
    }
    refreshCartBadge();
  }

  document.addEventListener('DOMContentLoaded', () => mount('site-header'));
})();
