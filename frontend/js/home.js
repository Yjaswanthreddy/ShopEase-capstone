(function () {
  let page = 1;
  const limit = 8;
  let loading = false;
  let done = false;

  function showAlert(msg, type) {
    const a = document.getElementById('alert');
    if (!a) return;
    a.innerHTML = msg
      ? '<div class="alert alert-' +
        (type || 'error') +
        '">' +
        msg +
        '</div>'
      : '';
  }

  function card(p) {
    const stock =
      p.stock_quantity > 0
        ? '<span class="stock-ok">In stock</span>'
        : '<span class="stock-low">Out of stock</span>';
    return (
      '<article class="card">' +
      '<a href="/Product.html?id=' +
      p.id +
      '"><img class="card-img" src="' +
      (p.thumb_url || '/assets/placeholder.svg') +
      '" alt=""/></a>' +
      '<div class="card-body">' +
      '<span class="brand">' +
      (p.brand || '') +
      '</span>' +
      '<h3><a href="/Product.html?id=' +
      p.id +
      '">' +
      (p.name || '') +
      '</a></h3>' +
      '<div class="rating">★ ' +
      Number(p.rating_avg || 0).toFixed(1) +
      '</div>' +
      '<div class="price">$' +
      Number(p.price).toFixed(2) +
      '</div>' +
      stock +
      '<div class="card-actions">' +
      '<a class="btn btn-primary" href="/Product.html?id=' +
      p.id +
      '">Details</a>' +
      '</div></div></article>'
    );
  }

  async function loadMeta() {
    const [cats, brands] = await Promise.all([
      ShopEase.api('/products/meta/categories'),
      ShopEase.api('/products/meta/brands'),
    ]);
    const cs = document.getElementById('f-category');
    cats.data.forEach((c) => {
      const o = document.createElement('option');
      o.value = c.id;
      o.textContent = c.name;
      cs.appendChild(o);
    });
    const bs = document.getElementById('f-brand');
    brands.brands.forEach((b) => {
      const o = document.createElement('option');
      o.value = b;
      o.textContent = b;
      bs.appendChild(o);
    });
  }

  function queryParams() {
    const q = new URLSearchParams();
    const search = new URLSearchParams(location.search).get('q');
    if (search) q.set('search', search);
    const c = document.getElementById('f-category').value;
    if (c) q.set('categoryId', c);
    const b = document.getElementById('f-brand').value;
    if (b) q.set('brand', b);
    const min = document.getElementById('f-min').value;
    if (min) q.set('minPrice', min);
    const max = document.getElementById('f-max').value;
    if (max) q.set('maxPrice', max);
    const r = document.getElementById('f-rating').value;
    if (r) q.set('minRating', r);
    const st = document.getElementById('f-stock').value;
    if (st) q.set('inStock', st);
    q.set('sort', document.getElementById('f-sort').value);
    q.set('page', String(page));
    q.set('limit', String(limit));
    return q;
  }

  async function load(reset) {
    if (loading || done) return;
    loading = true;
    document.getElementById('loading').style.display = 'block';
    if (reset) {
      page = 1;
      done = false;
      document.getElementById('product-grid').innerHTML = '';
    }
    try {
      const q = queryParams();
      const res = await ShopEase.api('/products?' + q.toString());
      const grid = document.getElementById('product-grid');
      res.data.forEach((p) => {
        grid.insertAdjacentHTML('beforeend', card(p));
      });
      if (res.data.length < limit) done = true;
      document.getElementById('btn-more').style.display = done ? 'none' : 'inline-flex';
      showAlert('');
    } catch (e) {
      showAlert(e.message || 'Failed to load products');
    } finally {
      loading = false;
      document.getElementById('loading').style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await loadMeta();
    } catch (e) {
      showAlert(e.message || 'Failed meta');
    }
    document.getElementById('btn-apply').addEventListener('click', () => load(true));
    document.getElementById('btn-more').addEventListener('click', () => {
      page++;
      load(false);
    });
    load(true);
  });
})();
