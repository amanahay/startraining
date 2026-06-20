import { api } from './api.js';

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null || value === '') element.removeAttribute(key);
    else element.setAttribute(key, String(value));
  }
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function upsertJsonLd(schema) {
  if (!schema) return;
  let element = document.head.querySelector('script[data-dynamic-seo="jsonld"]');
  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.dataset.dynamicSeo = 'jsonld';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(schema).replace(/</g, '\\u003c');
}

function removeDynamicHead(scope) {
  document.head.querySelectorAll(`[data-dynamic-head="${scope}"]`).forEach((element) => element.remove());
}

function appendHeadHtml(html, scope) {
  removeDynamicHead(scope);
  const template = document.createElement('template');
  template.innerHTML = String(html || '').trim();
  for (const node of Array.from(template.content.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) continue;
    let next = node;
    if (node.tagName === 'SCRIPT') {
      next = document.createElement('script');
      for (const attribute of node.attributes) next.setAttribute(attribute.name, attribute.value);
      next.textContent = node.textContent;
    }
    next.dataset.dynamicHead = scope;
    document.head.appendChild(next);
  }
}

function upsertAnalytics(seo) {
  removeDynamicHead('analytics');
  if (seo.google_analytics_snippet) {
    appendHeadHtml(seo.google_analytics_snippet, 'analytics');
    return;
  }
  const gaId = String(seo.google_analytics_id || '').trim();
  if (gaId) {
    const loader = document.createElement('script');
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    loader.dataset.dynamicHead = 'analytics';
    const config = document.createElement('script');
    config.dataset.dynamicHead = 'analytics';
    config.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId.replace(/'/g, "\\'")}');`;
    document.head.append(loader, config);
  }
  const gtmId = String(seo.google_tag_manager_id || '').trim();
  if (gtmId) {
    const gtm = document.createElement('script');
    gtm.dataset.dynamicHead = 'analytics';
    gtm.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f)})(window,document,'script','dataLayer','${gtmId.replace(/'/g, "\\'")}');`;
    document.head.appendChild(gtm);
  }
}

export async function updateRouteSeo(path) {
  try {
    const seo = await api(`/public/seo?path=${encodeURIComponent(path || '/')}`);
    document.title = seo.title || 'STAR Training & Consulting';
    upsertMeta('meta[name="description"]', { name: 'description', content: seo.description || '' });
    upsertMeta('meta[name="keywords"]', { name: 'keywords', content: seo.keywords || '' });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: seo.robots || 'index, follow' });
    upsertLink('canonical', seo.canonical || window.location.href);
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: seo.type || 'website' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: seo.title || '' });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: seo.description || '' });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: seo.canonical || window.location.href });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: seo.image || '' });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: seo.title || '' });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: seo.description || '' });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: seo.image || '' });
    upsertMeta('meta[name="google-site-verification"]', { name: 'google-site-verification', content: seo.verification?.google || '' });
    upsertMeta('meta[name="msvalidate.01"]', { name: 'msvalidate.01', content: seo.verification?.bing || '' });
    upsertMeta('meta[name="yandex-verification"]', { name: 'yandex-verification', content: seo.verification?.yandex || '' });
    upsertJsonLd(seo.schema);
    upsertAnalytics(seo);
    if (seo.custom_head_html) appendHeadHtml(seo.custom_head_html, 'custom');
    else removeDynamicHead('custom');
  } catch (error) {
    console.warn('SEO update skipped:', error.message);
  }
}
