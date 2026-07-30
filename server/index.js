import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import sanitizeHtml from 'sanitize-html';
import sharp from 'sharp';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, migrate, row, rows, run, settingsObject } from './db.js';
import { seedDatabase } from './seed.js';
import { sectionConfigDefaults } from './seed-data.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const app = express();
const port = Number(process.env.PORT || 3100);
const jwtSecret = process.env.JWT_SECRET || 'development-only-change-this-secret-before-production';
const recoveryPin = String(process.env.SUPERADMIN_RECOVERY_PIN || '');
const recoveryEmail = String(process.env.ADMIN_EMAIL || 'admin@startraining.info').trim().toLowerCase();
const isProduction = process.env.NODE_ENV === 'production';
const allowedHosts = new Set(String(process.env.HOST_ALLOWLIST || 'startraining.sepji.net,localhost,127.0.0.1').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean));
const recoveryAttempts = new Map();

app.set('trust proxy', 1);
app.use((req, res, next) => {
  const host = String(req.hostname || req.get('host') || '').split(':')[0].toLowerCase();
  if (!host || !allowedHosts.has(host)) {
    return res.status(403).send('Host tidak diizinkan.');
  }
  next();
});
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(root, 'uploads'), { maxAge: '7d' }));

const uploadDir = path.join(root, 'uploads');
const sourceDir = path.join(uploadDir, 'source');
const optimizedDir = path.join(uploadDir, 'webp');
const documentDir = path.join(uploadDir, 'documents');
const proofSourceDir = path.join(uploadDir, 'proofs', 'source');
const proofWebpDir = path.join(uploadDir, 'proofs', 'webp');
[uploadDir, sourceDir, optimizedDir, documentDir, proofSourceDir, proofWebpDir].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, done) => done(null, [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff', 'image/svg+xml', 'application/pdf'
  ].includes(file.mimetype))
});

migrate();
seedDatabase();

const tableDefinitions = {
  programs: ['title', 'slug', 'category', 'badge', 'description', 'content', 'icon', 'emoji', 'image_url', 'flyer_pdf_url', 'cta_url', 'price_regular', 'price_discount', 'voucher_code', 'voucher_discount', 'youtube_url', 'enable_order_form', 'enable_whatsapp_cta', 'hero_featured', 'is_featured', 'is_published', 'sort_order'],
  trainers: ['name', 'role', 'bio', 'certifications', 'image_url', 'is_published', 'sort_order'],
  galleries: ['title', 'slug', 'description', 'cover_url', 'event_date', 'location', 'is_published', 'sort_order'],
  gallery_images: ['gallery_id', 'image_url', 'alt_text', 'caption', 'sort_order'],
  posts: ['title', 'slug', 'category', 'excerpt', 'content', 'featured_image', 'meta_title', 'meta_description', 'keywords', 'canonical_url', 'is_published', 'is_featured', 'published_at', 'sort_order'],
  testimonials: ['name', 'organization', 'quote', 'rating', 'avatar_url', 'is_published', 'sort_order'],
  faqs: ['question', 'answer', 'is_published', 'sort_order'],
  clients: ['name', 'logo_url', 'website_url', 'is_published', 'sort_order'],
  features: ['title', 'description', 'icon', 'is_published', 'sort_order'],
  partners: ['title', 'description', 'icon', 'button_label', 'button_url', 'is_published', 'sort_order'],
  stats: ['label', 'value', 'prefix', 'suffix', 'icon', 'is_published', 'sort_order'],
  navigation: ['label', 'url', 'location', 'target', 'is_published', 'sort_order'],
  leads: ['name', 'whatsapp', 'company', 'position', 'program', 'participants', 'timeline', 'message', 'ref_code', 'status', 'notes'],
  payment_accounts: ['bank_name', 'account_number', 'account_name', 'branch_name', 'instructions', 'is_published', 'sort_order'],
  confirmation_contacts: ['name', 'whatsapp', 'role', 'is_published', 'sort_order'],
  about_pages: ['slug', 'hero_eyebrow', 'hero_title', 'hero_subtitle', 'hero_image_url', 'intro_eyebrow', 'intro_title', 'intro_content', 'values_eyebrow', 'values_title', 'values_subtitle', 'advantages_eyebrow', 'advantages_title', 'advantages_subtitle', 'cta_title', 'cta_subtitle', 'cta_button_label', 'cta_button_url', 'meta_title', 'meta_description', 'meta_keywords', 'is_published'],
  about_values: ['title', 'description', 'icon', 'is_published', 'sort_order'],
  about_advantages: ['title', 'description', 'icon', 'is_published', 'sort_order'],
  service_pages: ['slug', 'hero_eyebrow', 'hero_title', 'hero_subtitle', 'hero_image_url', 'intro_eyebrow', 'intro_title', 'intro_content', 'services_eyebrow', 'services_title', 'services_subtitle', 'programs_eyebrow', 'programs_title', 'programs_subtitle', 'cta_title', 'cta_subtitle', 'cta_button_label', 'cta_button_url', 'meta_title', 'meta_description', 'meta_keywords', 'is_published'],
  service_items: ['title', 'description', 'icon', 'image_url', 'button_label', 'button_url', 'is_published', 'sort_order'],
  program_pages: ['slug', 'hero_eyebrow', 'hero_title', 'hero_subtitle', 'list_eyebrow', 'list_title', 'list_subtitle', 'meta_title', 'meta_description', 'meta_keywords', 'is_published'],
  consultation_pages: ['slug', 'eyebrow', 'title', 'subtitle', 'form_title', 'form_description', 'name_label', 'whatsapp_label', 'company_label', 'message_label', 'submit_label', 'background_color', 'label_color', 'title_color', 'description_color', 'button_background_color', 'button_text_color', 'button_border_color', 'label_font', 'title_font', 'description_font', 'button_font', 'label_size', 'title_size', 'description_size', 'button_size', 'meta_title', 'meta_description', 'meta_keywords', 'is_published'],
  client_pages: ['slug', 'eyebrow', 'title', 'subtitle', 'meta_title', 'meta_description', 'meta_keywords', 'is_published'],
  events: ['title', 'slug', 'description', 'content', 'image_url', 'location', 'starts_at', 'ends_at', 'timezone', 'reservation_enabled', 'reservation_label', 'is_featured', 'is_published', 'sort_order'],
  event_pages: ['slug', 'eyebrow', 'title', 'subtitle', 'meta_title', 'meta_description', 'meta_keywords', 'is_published'],
  proposal_pages: ['slug', 'eyebrow', 'title', 'subtitle', 'package_eyebrow', 'package_title', 'package_subtitle', 'contact_title', 'contact_subtitle', 'meta_title', 'meta_description', 'meta_keywords', 'is_published'],
  proposals: ['institution_name', 'contact_name', 'contact_whatsapp', 'title', 'slug', 'hero_title', 'hero_subtitle', 'intro_content', 'valid_until', 'is_published'],
  proposal_packages: ['title', 'description', 'price_label', 'features', 'button_label', 'is_featured', 'is_published', 'sort_order'],
  social_proofs: ['customer_name', 'action_text', 'program_id', 'program_title', 'message_text', 'occurred_at', 'display_seconds', 'is_published', 'sort_order'],
  program_orders: ['status', 'admin_notes']
};

const integerFields = new Set(['is_featured', 'hero_featured', 'enable_order_form', 'enable_whatsapp_cta', 'is_published', 'sort_order', 'rating', 'gallery_id', 'program_id', 'participants', 'payment_account_id', 'confirmation_contact_id', 'unique_code', 'display_seconds']);
const numericFields = new Set(['price_regular', 'price_discount', 'voucher_discount']);
const htmlFields = new Set(['content', 'intro_content']);
const allowedHtml = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption', 'h1', 'h2']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    a: ['href', 'name', 'target', 'rel']
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel']
};

function safeValue(field, value) {
  if (value === undefined) return undefined;
  if (integerFields.has(field)) return Number(value || 0);
  if (numericFields.has(field)) return Number(value || 0);
  if (field === 'value') return Number(value || 0);
  if (field === 'certifications') {
    if (Array.isArray(value)) return JSON.stringify(value);
    try {
      return JSON.stringify(JSON.parse(value || '[]'));
    } catch {
      return JSON.stringify(String(value || '').split(',').map((x) => x.trim()).filter(Boolean));
    }
  }
  if (field === 'features') {
    if (Array.isArray(value)) return JSON.stringify(value);
    try { return JSON.stringify(JSON.parse(value || '[]')); } catch {
      return JSON.stringify(String(value || '').split('\n').map((item) => item.trim()).filter(Boolean));
    }
  }
  if (htmlFields.has(field)) return sanitizeHtml(String(value || ''), allowedHtml);
  return String(value ?? '').trim();
}

function slugify(value) {
  return String(value || '')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function issueToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email, ver: user.auth_version || 1 }, jwtSecret, { expiresIn: '8h' });
}

function auth(req, res, next) {
  try {
    const token = req.cookies.startc_admin;
    if (!token) return res.status(401).json({ message: 'Sesi login diperlukan.' });
    const payload = jwt.verify(token, jwtSecret);
    const user = row('SELECT id,name,email,role,is_active,auth_version FROM users WHERE id = ?', [payload.sub]);
    if (!user?.is_active || user.role !== 'SuperAdmin' || Number(payload.ver || 1) !== Number(user.auth_version || 1)) throw new Error('Unauthorized');
    req.user = user;
    next();
  } catch {
    res.clearCookie('startc_admin');
    res.status(401).json({ message: 'Sesi telah berakhir. Silakan login kembali.' });
  }
}

function audit(req, action, entity = '', entityId = '', detail = '') {
  run('INSERT INTO audit_logs (user_id,action,entity,entity_id,detail,ip_address) VALUES (?,?,?,?,?,?)', [
    req.user?.id || null, action, entity, String(entityId || ''), String(detail || ''), String(req.ip || '')
  ]);
}

app.get('/api/health', (req, res) => res.json({ ok: true, database: 'sqlite', time: new Date().toISOString() }));

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = row('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Email atau password tidak sesuai.' });
  }
  const token = issueToken(user);
  res.cookie('startc_admin', token, {
    httpOnly: true, secure: isProduction, sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000, path: '/'
  });
  run('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
  req.user = user;
  audit(req, 'login', 'users', user.id);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post('/api/auth/logout', auth, (req, res) => {
  audit(req, 'logout', 'users', req.user.id);
  res.clearCookie('startc_admin', { path: '/' });
  res.json({ ok: true });
});

app.get('/api/auth/me', auth, (req, res) => res.json({ user: req.user }));

app.put('/api/auth/profile', auth, async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!name || !email) return res.status(400).json({ message: 'Nama dan email wajib diisi.' });
  run('UPDATE users SET name=?,email=?,updated_at=CURRENT_TIMESTAMP WHERE id=?', [name, email, req.user.id]);
  audit(req, 'update', 'profile', req.user.id);
  res.json({ ok: true });
});

app.put('/api/auth/password', auth, async (req, res) => {
  const current = String(req.body.current_password || '');
  const next = String(req.body.new_password || '');
  const user = row('SELECT * FROM users WHERE id=?', [req.user.id]);
  if (!(await bcrypt.compare(current, user.password_hash))) return res.status(400).json({ message: 'Password saat ini salah.' });
  if (next.length < 10) return res.status(400).json({ message: 'Password baru minimal 10 karakter.' });
  run('UPDATE users SET password_hash=?,auth_version=auth_version+1,updated_at=CURRENT_TIMESTAMP WHERE id=?', [await bcrypt.hash(next, 12), req.user.id]);
  audit(req, 'password_change', 'users', req.user.id);
  res.clearCookie('startc_admin', { path: '/' });
  res.json({ ok: true });
});

function constantTimeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) {
    crypto.timingSafeEqual(a, Buffer.alloc(a.length));
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

app.post('/api/auth/recover-superadmin', async (req, res) => {
  const key = String(req.socket.remoteAddress || req.ip || 'unknown');
  const now = Date.now();
  const state = recoveryAttempts.get(key) || { failures: [], lockedUntil: 0 };
  state.failures = state.failures.filter((time) => now - time < 15 * 60 * 1000);
  if (state.lockedUntil > now) {
    const minutes = Math.ceil((state.lockedUntil - now) / 60000);
    return res.status(429).json({ message: `Terlalu banyak percobaan. Coba lagi dalam ${minutes} menit.` });
  }

  const email = String(req.body.email || '').trim().toLowerCase();
  const pin = String(req.body.pin || '').trim();
  const password = String(req.body.new_password || '');
  const confirmation = String(req.body.confirm_password || '');
  const validPin = recoveryPin.length >= 6 && constantTimeEqual(pin, recoveryPin);

  if (email !== recoveryEmail || !validPin) {
    state.failures.push(now);
    if (state.failures.length >= 5) state.lockedUntil = now + 15 * 60 * 1000;
    recoveryAttempts.set(key, state);
    return res.status(401).json({ message: 'Email atau PIN pemulihan tidak valid.' });
  }
  if (password.length < 10) return res.status(400).json({ message: 'Password baru minimal 10 karakter.' });
  if (password !== confirmation) return res.status(400).json({ message: 'Konfirmasi password tidak sama.' });
  const user = row("SELECT id FROM users WHERE email=? AND role='SuperAdmin'", [recoveryEmail]);
  if (!user) return res.status(404).json({ message: 'Akun SuperAdmin tidak ditemukan.' });

  run('UPDATE users SET password_hash=?,auth_version=auth_version+1,updated_at=CURRENT_TIMESTAMP WHERE id=?', [
    await bcrypt.hash(password, 12), user.id
  ]);
  recoveryAttempts.delete(key);
  audit(req, 'pin_password_recovery', 'users', user.id);
  res.clearCookie('startc_admin', { path: '/' });
  res.json({ message: 'Password SuperAdmin berhasil diganti. Semua sesi lama telah dinonaktifkan.' });
});

function published(table, extra = '') {
  const order = table === 'posts' ? 'COALESCE(published_at,created_at) DESC' : 'sort_order ASC, id ASC';
  return rows(`SELECT * FROM ${table} WHERE is_published=1 ${extra} ORDER BY ${order}`);
}

function paginatedPublished(table, req, order = 'sort_order ASC, id ASC') {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(24, Math.max(1, Number(req.query.limit || 9)));
  const offset = (page - 1) * limit;
  const total = Number(row(`SELECT COUNT(*) count FROM ${table} WHERE is_published=1`).count);
  return {
    items: rows(`SELECT * FROM ${table} WHERE is_published=1 ORDER BY ${order} LIMIT ? OFFSET ?`, [limit, offset]),
    pagination: { page, limit, total, has_more: offset + limit < total }
  };
}

function defaultSectionStyle(sectionKey, sortOrder = 0) {
  const even = Number(sortOrder || 0) % 20 === 0;
  const whiteSections = new Set(['clients', 'programs', 'trainers', 'galleries', 'posts', 'faqs']);
  return {
    aurora_enabled: 1,
    aurora_gradient: even
      ? 'linear-gradient(135deg,#fff8ee 0%,#edf8ff 38%,#fff0f7 70%,#fff9df 100%)'
      : 'linear-gradient(135deg,#f7fbff 0%,#fff5f7 42%,#fffbe6 100%)',
    glow_enabled: 1,
    glow_color: sectionKey === 'hero' ? '#ff6b6b' : '#38bdf8',
    particles_enabled: sectionKey === 'hero' ? 1 : 0,
    particle_color: 'rgba(255,255,255,.92)',
    particle_count: sectionKey === 'hero' ? 12 : 0,
    divider_type: 'curve',
    divider_position: 'bottom',
    divider_color: '#ffffff',
    divider_height_desktop: 42,
    divider_height_mobile: 24,
    ...(whiteSections.has(sectionKey) ? { background_color: '#ffffff', aurora_enabled: 0, glow_enabled: 0 } : {}),
    ...(sectionKey === 'cta' ? { background_color: '#ffffff', aurora_enabled: 1, glow_enabled: 1, glow_color: '#f43f5e' } : {})
  };
}

function sectionConfig(item) {
  const config = JSON.parse(item.config_json || '{}');
  return {
    ...(sectionConfigDefaults[item.section_key] || {}),
    ...config,
    style: {
      ...defaultSectionStyle(item.section_key, item.sort_order),
      ...(config.style || {})
    }
  };
}

app.get('/api/public/bootstrap', (req, res) => {
  const sections = rows('SELECT * FROM sections WHERE is_visible=1 ORDER BY sort_order,id').map((item) => ({
    ...item, config: sectionConfig(item)
  }));
  const galleries = published('galleries').slice(0, 6).map((gallery) => ({
    ...gallery,
    images: rows('SELECT * FROM gallery_images WHERE gallery_id=? ORDER BY sort_order,id LIMIT 8', [gallery.id])
  }));
  res.json({
    settings: settingsObject(),
    sections,
    content: {
      navigation: published('navigation'),
      stats: published('stats'),
      clients: published('clients'),
      events: published('events').filter((x) => x.is_featured).sort((a,b) => a.sort_order - b.sort_order),
      programs: published('programs'),
      features: published('features'),
      trainers: published('trainers').map((x) => ({ ...x, certifications: JSON.parse(x.certifications || '[]') })),
      galleries,
      testimonials: published('testimonials').slice(0, 3),
      posts: published('posts').slice(0, 6),
      partners: published('partners'),
      faqs: published('faqs'),
      social_proofs: rows(`SELECT sp.*, COALESCE(NULLIF(sp.program_title,''), p.title) resolved_program_title
        FROM social_proofs sp
        LEFT JOIN programs p ON p.id=sp.program_id
        WHERE sp.is_published=1
        ORDER BY sp.sort_order ASC, sp.id ASC`)
    }
  });
});

app.get('/api/public/posts', (req, res) => res.json(published('posts')));
app.get('/api/public/posts/:slug', (req, res) => {
  const item = row('SELECT * FROM posts WHERE slug=? AND is_published=1', [req.params.slug]);
  if (!item) return res.status(404).json({ message: 'Artikel tidak ditemukan.' });
  res.json(item);
});
app.get('/api/public/programs', (req, res) => {
  if (req.query.page || req.query.limit || req.query.category) {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(24, Math.max(1, Number(req.query.limit || 6)));
    const offset = (page - 1) * limit;
    const category = String(req.query.category || '').trim();
    const where = category && category !== 'all' ? 'WHERE is_published=1 AND category=?' : 'WHERE is_published=1';
    const params = category && category !== 'all' ? [category] : [];
    const total = Number(row(`SELECT COUNT(*) count FROM programs ${where}`, params).count);
    const items = rows(`SELECT * FROM programs ${where} ORDER BY datetime(COALESCE(created_at,updated_at)) DESC, id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    return res.json({ items, pagination: { page, limit, total, has_more: offset + limit < total } });
  }
  res.json(rows('SELECT * FROM programs WHERE is_published=1 ORDER BY datetime(COALESCE(created_at,updated_at)) DESC, id DESC'));
});
app.get('/api/public/programs-page', (req, res) => {
  const page = row("SELECT * FROM program_pages WHERE slug='programs' AND is_published=1");
  if (!page) return res.status(404).json({ message: 'Halaman program belum tersedia.' });
  res.json({ page });
});
app.get('/api/public/programs/:slug', (req, res) => {
  const item = row('SELECT * FROM programs WHERE slug=? AND is_published=1', [req.params.slug]);
  if (!item) return res.status(404).json({ message: 'Program tidak ditemukan.' });
  const related = rows('SELECT id,title,slug,category,badge,description,image_url,price_regular,price_discount,is_featured,sort_order FROM programs WHERE is_published=1 AND slug<>? ORDER BY is_featured DESC, sort_order ASC, id ASC LIMIT 3', [req.params.slug]);
  const payment_accounts = rows('SELECT id,bank_name,account_number,account_name,branch_name,instructions FROM payment_accounts WHERE is_published=1 ORDER BY sort_order,id');
  const confirmation_contacts = rows('SELECT id,name,whatsapp,role FROM confirmation_contacts WHERE is_published=1 ORDER BY sort_order,id');
  res.json({ ...item, related, payment_accounts, confirmation_contacts });
});
app.get('/api/public/galleries', (req, res) => res.json(paginatedPublished('galleries', req)));
app.get('/api/public/galleries/:slug', (req, res) => {
  const item = row('SELECT * FROM galleries WHERE slug=? AND is_published=1', [req.params.slug]);
  if (!item) return res.status(404).json({ message: 'Galeri tidak ditemukan.' });
  item.images = rows('SELECT * FROM gallery_images WHERE gallery_id=? ORDER BY sort_order,id', [item.id]);
  res.json(item);
});
app.get('/api/public/testimonials', (req, res) => res.json(paginatedPublished('testimonials', req)));
app.get('/api/public/about', (req, res) => {
  const page = row("SELECT * FROM about_pages WHERE slug='about' AND is_published=1");
  if (!page) return res.status(404).json({ message: 'Halaman tentang belum tersedia.' });
  res.json({
    page,
    values: published('about_values'),
    advantages: published('about_advantages'),
    stats: published('stats')
  });
});
app.get('/api/public/services', (req, res) => {
  const page = row("SELECT * FROM service_pages WHERE slug='services' AND is_published=1");
  if (!page) return res.status(404).json({ message: 'Halaman layanan belum tersedia.' });
  res.json({
    page,
    services: published('service_items')
  });
});
app.get('/api/public/request-konsultasi', (req, res) => {
  const page = row("SELECT * FROM consultation_pages WHERE slug='request-konsultasi' AND is_published=1");
  if (!page) return res.status(404).json({ message: 'Halaman konsultasi belum tersedia.' });
  res.json({ page, programs: published('programs') });
});
app.get('/api/public/clients-page', (req, res) => { const page = row("SELECT * FROM client_pages WHERE slug='klien' AND is_published=1"); if (!page) return res.status(404).json({ message: 'Halaman klien belum tersedia.' }); const result = paginatedPublished('clients', req, 'sort_order ASC, id DESC'); res.json({ page, clients: result.items, pagination: result.pagination }); });
app.get('/api/public/events-page', (req,res) => { const page=row("SELECT * FROM event_pages WHERE slug='event' AND is_published=1"); if(!page)return res.status(404).json({message:'Halaman event belum tersedia.'}); res.json({page,events:published('events').sort((a,b)=>new Date(b.starts_at)-new Date(a.starts_at))}); });
app.get('/api/public/events/:slug', (req,res) => { const event=row('SELECT * FROM events WHERE slug=? AND is_published=1',[req.params.slug]); if(!event)return res.status(404).json({message:'Event tidak ditemukan.'}); res.json(event); });
app.get('/api/public/proposals/:slug', (req, res) => {
  const proposal = row('SELECT * FROM proposals WHERE slug=? AND is_published=1', [req.params.slug]);
  const page = row("SELECT * FROM proposal_pages WHERE slug='proposal' AND is_published=1");
  if (!proposal || !page) return res.status(404).json({ message: 'Proposal tidak ditemukan atau belum tayang.' });
  const packages = published('proposal_packages').map((item) => ({ ...item, features: JSON.parse(item.features || '[]') }));
  res.json({ proposal, page, packages, settings: settingsObject() });
});

app.post('/api/public/leads', (req, res) => {
  const name = String(req.body.name || '').trim();
  const whatsapp = String(req.body.whatsapp || '').trim();
  if (name.length < 2 || whatsapp.length < 8) return res.status(400).json({ message: 'Nama dan nomor WhatsApp yang valid wajib diisi.' });
  const fields = tableDefinitions.leads.slice(0, 9);
  const values = fields.map((field) => safeValue(field, req.body[field] ?? ''));
  run(`INSERT INTO leads (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`, values);
  res.status(201).json({ message: 'Request konsultasi berhasil dikirim.' });
});

async function saveTransferProof(file, orderCode) {
  if (!file) return {};
  if (!file.mimetype.startsWith('image/')) throw new Error('Bukti transfer harus berupa gambar.');
  const base = `${safeFileBase(orderCode)}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
  const sourceFilename = `${base}${extension}`;
  const webpFilename = `${base}.webp`;
  fs.writeFileSync(path.join(proofSourceDir, sourceFilename), file.buffer);
  await sharp(file.buffer, { animated: false })
    .rotate()
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 72, alphaQuality: 82, effort: 6 })
    .toFile(path.join(proofWebpDir, webpFilename));
  const webpPath = path.join(proofWebpDir, webpFilename);
  return {
    proof_source_url: `/uploads/proofs/source/${sourceFilename}`,
    proof_webp_url: `/uploads/proofs/webp/${webpFilename}`,
    proof_source_size: file.size,
    proof_webp_size: fs.statSync(webpPath).size
  };
}

app.post('/api/public/program-orders', upload.single('proof'), async (req, res) => {
  try {
    const program = row('SELECT * FROM programs WHERE id=? AND is_published=1', [req.body.program_id]);
    if (!program) return res.status(404).json({ message: 'Program tidak ditemukan.' });
    if (Number(program.enable_order_form ?? 1) === 0) return res.status(400).json({ message: 'Formulir pendaftaran program ini sedang dinonaktifkan.' });

    const customerName = String(req.body.customer_name || '').trim();
    const whatsappNumber = String(req.body.whatsapp || '').trim();
    const participants = Math.max(1, Number(req.body.participants || 1));
    if (customerName.length < 2 || whatsappNumber.length < 8) return res.status(400).json({ message: 'Nama dan nomor WhatsApp wajib diisi.' });

    const account = req.body.payment_account_id
      ? row('SELECT * FROM payment_accounts WHERE id=? AND is_published=1', [req.body.payment_account_id])
      : row('SELECT * FROM payment_accounts WHERE is_published=1 ORDER BY sort_order,id LIMIT 1');
    if (!account) return res.status(400).json({ message: 'Rekening pembayaran belum tersedia.' });

    const confirmationContact = req.body.confirmation_contact_id
      ? row('SELECT * FROM confirmation_contacts WHERE id=? AND is_published=1', [req.body.confirmation_contact_id])
      : row('SELECT * FROM confirmation_contacts WHERE is_published=1 ORDER BY sort_order,id LIMIT 1');

    const baseAmount = Number(program.price_discount || program.price_regular || 0);
    const voucherCode = String(req.body.voucher_code || '').trim();
    const voucherDiscount = voucherCode && program.voucher_code && voucherCode.toLowerCase() === String(program.voucher_code).toLowerCase()
      ? Number(program.voucher_discount || 0)
      : 0;
    const uniqueCode = Number(crypto.randomInt(101, 998));
    const totalTransfer = Math.max(0, (baseAmount * participants) - voucherDiscount + uniqueCode);
    const orderCode = `STC-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const proof = await saveTransferProof(req.file, orderCode);

    run(`INSERT INTO program_orders
      (order_code,program_id,program_title,customer_name,whatsapp,email,company,position,company_address,training_date,participant_names,participants,notes,base_amount,voucher_code,voucher_discount,unique_code,total_transfer,payment_account_id,payment_bank_name,payment_account_number,payment_account_name,confirmation_contact_id,confirmation_contact_name,confirmation_contact_whatsapp,proof_source_url,proof_webp_url,proof_source_size,proof_webp_size,ref_code,ip_address,user_agent)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
      orderCode, program.id, program.title, customerName, whatsappNumber, String(req.body.email || '').trim(), String(req.body.company || '').trim(),
      String(req.body.position || '').trim(), String(req.body.company_address || '').trim(), String(req.body.training_date || '').trim(), String(req.body.participant_names || '').trim(),
      participants, String(req.body.notes || '').trim(), baseAmount, voucherCode, voucherDiscount, uniqueCode, totalTransfer,
      account.id, account.bank_name, account.account_number, account.account_name,
      confirmationContact?.id || null, confirmationContact?.name || '', confirmationContact?.whatsapp || '',
      proof.proof_source_url || '', proof.proof_webp_url || '', proof.proof_source_size || 0, proof.proof_webp_size || 0,
      String(req.body.ref_code || '').trim(), String(req.ip || ''), String(req.get('user-agent') || '')
    ]);

    res.status(201).json({
      message: 'Pendaftaran program berhasil dibuat.',
      order: {
        order_code: orderCode,
        program_title: program.title,
        total_transfer: totalTransfer,
        unique_code: uniqueCode,
        payment_account: {
          bank_name: account.bank_name,
          account_number: account.account_number,
          account_name: account.account_name
        },
        confirmation_contact: confirmationContact ? {
          name: confirmationContact.name,
          whatsapp: confirmationContact.whatsapp,
          role: confirmationContact.role
        } : null,
        proof_webp_url: proof.proof_webp_url || ''
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const sseClients = new Set();

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

function broadcastCmsChange(entity = 'content') {
  const payload = `data: ${JSON.stringify({ type: 'CMS_UPDATED', entity, timestamp: Date.now() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

app.get('/api/admin/dashboard', auth, (req, res) => {
  const counts = {};
  for (const table of ['posts', 'galleries', 'programs', 'trainers', 'leads', 'program_orders']) {
    counts[table] = row(`SELECT COUNT(*) count FROM ${table}`).count;
  }
  counts.new_leads = row(`SELECT COUNT(*) count FROM leads WHERE status='new'`).count;
  counts.pending_orders = row(`SELECT COUNT(*) count FROM program_orders WHERE status='pending'`).count;
  res.json({
    counts,
    recent_leads: rows('SELECT * FROM leads ORDER BY created_at DESC LIMIT 5'),
    recent_logs: rows('SELECT a.*,u.name user_name FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.created_at DESC LIMIT 10')
  });
});

app.get('/api/admin/settings', auth, (req, res) => res.json(settingsObject()));
app.put('/api/admin/settings', auth, (req, res) => {
  const statement = db.prepare(`INSERT INTO settings (key,value,group_name,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value,group_name=excluded.group_name,updated_at=CURRENT_TIMESTAMP`);
  db.exec('BEGIN');
  try {
    for (const [key, value] of Object.entries(req.body || {})) {
      if (!/^[a-z0-9_]+$/i.test(key)) continue;
      const group = key.startsWith('seo_') || key.includes('verification') || key.includes('analytics') ? 'seo' :
        key.includes('color') || key.includes('font') || key.includes('logo') ? 'appearance' : 'general';
      statement.run(key, JSON.stringify(value ?? ''), group);
    }
    db.exec('COMMIT');
    audit(req, 'update', 'settings', 'all');
    broadcastCmsChange('settings');
    res.json({ ok: true });
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
});

app.get('/api/admin/sections', auth, (req, res) => {
  res.json(rows('SELECT * FROM sections ORDER BY sort_order,id').map((item) => ({
    ...item, config: sectionConfig(item)
  })));
});
app.put('/api/admin/sections/:id', auth, (req, res) => {
  const existing = row('SELECT * FROM sections WHERE id=?', [req.params.id]);
  if (!existing) return res.status(404).json({ message: 'Section tidak ditemukan.' });
  const fields = ['name', 'eyebrow', 'title', 'subtitle', 'content', 'is_visible', 'sort_order'];
  const values = fields.map((field) => safeValue(field, req.body[field] ?? existing[field]));
  const config = JSON.stringify(req.body.config || JSON.parse(existing.config_json || '{}'));
  run(`UPDATE sections SET ${fields.map((x) => `${x}=?`).join(',')},config_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [...values, config, req.params.id]);
  audit(req, 'update', 'sections', req.params.id);
  broadcastCmsChange('sections');
  res.json({ ok: true });
});

const bulkDefinitions = {
  testimonials: {
    required: ['name', 'quote'],
    fields: tableDefinitions.testimonials
  },
  posts: {
    required: ['title', 'content'],
    fields: tableDefinitions.posts
  },
  stats: {
    required: ['label'],
    fields: tableDefinitions.stats
  },
  proposals: {
    required: ['institution_name'],
    fields: tableDefinitions.proposals
  },
  proposal_packages: {
    required: ['title'],
    fields: tableDefinitions.proposal_packages
  },
  clients: {
    required: ['name'],
    fields: tableDefinitions.clients
  }
};

app.post('/api/admin/bulk/:table', auth, (req, res) => {
  const table = req.params.table;
  const definition = bulkDefinitions[table];
  const items = Array.isArray(req.body) ? req.body : req.body?.items;
  if (!definition || !Array.isArray(items)) return res.status(400).json({ message: 'Format bulk JSON tidak valid.' });
  if (!items.length || items.length > 200) return res.status(400).json({ message: 'Bulk import harus berisi 1 sampai 200 item.' });
  db.exec('BEGIN');
  try {
    let inserted = 0;
    const proposalSlugs = table === 'proposals' ? new Set(rows('SELECT slug FROM proposals').map((item) => item.slug)) : null;
    items.forEach((raw, index) => {
      const payload = { ...raw };
      for (const field of definition.required) {
        if (!String(payload[field] || '').trim()) throw new Error(`Item ${index + 1}: ${field} wajib diisi.`);
      }
      if (table === 'posts' && !payload.slug) payload.slug = slugify(payload.title);
      if (table === 'proposals' && !payload.slug) {
        const base = slugify(payload.institution_name) || 'proposal';
        let slug = base; let suffix = 2;
        while (proposalSlugs.has(slug)) slug = `${base}-${suffix++}`;
        payload.slug = slug;
      }
      if (table === 'proposals') {
        if (proposalSlugs.has(payload.slug)) throw new Error(`Item ${index + 1}: slug proposal "${payload.slug}" sudah digunakan.`);
        proposalSlugs.add(payload.slug);
      }
      if (table === 'posts' && !payload.published_at) payload.published_at = new Date().toISOString().slice(0, 10);
      if (payload.is_published === undefined) payload.is_published = 1;
      if (table === 'testimonials' && payload.rating === undefined) payload.rating = 5;
      const fields = definition.fields.filter((field) => payload[field] !== undefined);
      run(`INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`,
        fields.map((field) => safeValue(field, payload[field])));
      inserted += 1;
    });
    db.exec('COMMIT');
    audit(req, 'bulk_create', table, inserted);
    res.status(201).json({ message: `${inserted} data berhasil diimpor.`, inserted });
  } catch (error) {
    db.exec('ROLLBACK');
    res.status(400).json({ message: String(error.message).includes('UNIQUE') ? 'Ada slug artikel yang duplikat.' : error.message });
  }
});

app.get('/api/admin/:table', auth, (req, res, next) => {
  const table = req.params.table;
  if (!tableDefinitions[table]) return next();
  // Not every CMS table has sort_order (for example page setting tables).
  // Resolve its columns first so an old/new migration can never break the admin list.
  const columns = new Set(rows(`PRAGMA table_info(${table})`).map((column) => column.name));
  const order = ['leads', 'program_orders'].includes(table) && columns.has('created_at') ? 'created_at DESC, id DESC' :
    columns.has('sort_order') ? 'sort_order ASC, id DESC' : 'id ASC';
  res.json(rows(`SELECT * FROM ${table} ORDER BY ${order}`));
});

app.post('/api/admin/:table', auth, (req, res, next) => {
  const table = req.params.table;
  const allowed = tableDefinitions[table];
  if (!allowed || table === 'leads' || table === 'program_orders' || table === 'about_pages' || table === 'service_pages' || table === 'program_pages' || table === 'consultation_pages' || table === 'proposal_pages') return next();
  const payload = { ...req.body };
  if (allowed.includes('slug') && !payload.slug) payload.slug = slugify(payload.title);
  const fields = allowed.filter((field) => payload[field] !== undefined);
  if (!fields.length) return res.status(400).json({ message: 'Tidak ada data untuk disimpan.' });
  try {
    const result = run(`INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`,
      fields.map((field) => safeValue(field, payload[field])));
    audit(req, 'create', table, result.lastInsertRowid);
    broadcastCmsChange(table);
    res.status(201).json({ id: Number(result.lastInsertRowid) });
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) return res.status(409).json({ message: 'Slug/data unik sudah digunakan.' });
    throw error;
  }
});

app.put('/api/admin/:table/:id', auth, (req, res, next) => {
  const table = req.params.table;
  const allowed = tableDefinitions[table];
  if (!allowed) return next();
  const fields = allowed.filter((field) => req.body[field] !== undefined);
  if (!fields.length) return res.status(400).json({ message: 'Tidak ada perubahan.' });
  try {
    run(`UPDATE ${table} SET ${fields.map((field) => `${field}=?`).join(',')},updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [...fields.map((field) => safeValue(field, req.body[field])), req.params.id]);
    audit(req, 'update', table, req.params.id);
    broadcastCmsChange(table);
    res.json({ ok: true });
  } catch (error) {
    if (String(error.message).includes('no such column: updated_at')) {
      run(`UPDATE ${table} SET ${fields.map((field) => `${field}=?`).join(',')} WHERE id=?`,
        [...fields.map((field) => safeValue(field, req.body[field])), req.params.id]);
      broadcastCmsChange(table);
      return res.json({ ok: true });
    }
    if (String(error.message).includes('UNIQUE')) return res.status(409).json({ message: 'Slug/data unik sudah digunakan.' });
    throw error;
  }
});

app.delete('/api/admin/:table/:id', auth, (req, res, next) => {
  const table = req.params.table;
  if (!tableDefinitions[table] || table === 'leads' || table === 'program_orders' || table === 'about_pages' || table === 'service_pages' || table === 'program_pages' || table === 'consultation_pages' || table === 'proposal_pages') return next();
  if (table === 'gallery_images' || table === 'galleries') {
    const images = table === 'gallery_images'
      ? rows('SELECT image_url FROM gallery_images WHERE id=?', [req.params.id])
      : rows('SELECT image_url FROM gallery_images WHERE gallery_id=?', [req.params.id]);
    for (const image of images) deletePhysicalMediaByUrl(image.image_url);
  }
  run(`DELETE FROM ${table} WHERE id=?`, [req.params.id]);
  audit(req, 'delete', table, req.params.id);
  broadcastCmsChange(table);
  res.json({ ok: true });
});

function safeFileBase(name) {
  return path.basename(name, path.extname(name))
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'file';
}

function deletePhysicalMediaByUrl(url) {
  if (!url || !String(url).startsWith('/uploads/')) return;
  const media = row('SELECT * FROM media_files WHERE source_url=? OR optimized_url=?', [url, url]);
  if (!media) {
    const resolved = path.resolve(root, `.${url}`);
    if (resolved.startsWith(path.resolve(uploadDir)) && fs.existsSync(resolved)) fs.rmSync(resolved, { force: true });
    return;
  }
  for (const mediaUrl of [media.source_url, media.optimized_url].filter(Boolean)) {
    const resolved = path.resolve(root, `.${mediaUrl}`);
    if (resolved.startsWith(path.resolve(uploadDir)) && fs.existsSync(resolved)) fs.rmSync(resolved, { force: true });
  }
  run('DELETE FROM media_files WHERE id=?', [media.id]);
}

function mediaSummary() {
  const summary = row(`SELECT COUNT(*) file_count,
    COALESCE(SUM(source_size),0) source_size,
    COALESCE(SUM(optimized_size),0) optimized_size
    FROM media_files`);
  const diskUsage = (directory) => fs.readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
    if (entry.name === '.gitkeep') return total;
    const itemPath = path.join(directory, entry.name);
    return total + (entry.isDirectory() ? diskUsage(itemPath) : fs.statSync(itemPath).size);
  }, 0);
  return {
    ...summary,
    total_size: diskUsage(uploadDir),
    saved_size: Math.max(0, Number(summary.source_size || 0) - Number(summary.optimized_size || 0))
  };
}

app.get('/api/admin/media', auth, (req, res) => {
  res.json({
    summary: mediaSummary(),
    files: rows('SELECT * FROM media_files ORDER BY created_at DESC,id DESC')
  });
});

app.delete('/api/admin/media/:id', auth, (req, res) => {
  const media = row('SELECT * FROM media_files WHERE id=?', [req.params.id]);
  if (!media) return res.status(404).json({ message: 'Media tidak ditemukan.' });
  deletePhysicalMediaByUrl(media.source_url || media.optimized_url);
  audit(req, 'delete', 'media', req.params.id, media.original_name);
  res.json({ ok: true });
});

app.post('/api/admin/upload', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'File gambar tidak valid.' });
  const token = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}`;
  const base = `${safeFileBase(req.file.originalname)}-${token}`;
  const extension = path.extname(req.file.originalname).toLowerCase() || (req.file.mimetype === 'application/pdf' ? '.pdf' : '.bin');

  if (req.file.mimetype === 'application/pdf') {
    const filename = `${base}.pdf`;
    fs.writeFileSync(path.join(documentDir, filename), req.file.buffer);
    const sourceUrl = `/uploads/documents/${filename}`;
    const result = run(`INSERT INTO media_files
      (original_name,media_type,mime_type,source_url,source_size,created_by)
      VALUES (?,?,?,?,?,?)`, [req.file.originalname, 'document', req.file.mimetype, sourceUrl, req.file.size, req.user.id]);
    audit(req, 'upload', 'media', result.lastInsertRowid, req.file.originalname);
    return res.status(201).json({
      id: Number(result.lastInsertRowid), url: sourceUrl, source_url: sourceUrl,
      optimized_url: null, name: req.file.originalname, type: 'document', source_size: req.file.size
    });
  }

  const sourceFilename = `${base}${extension}`;
  const optimizedFilename = `${base}.webp`;
  fs.writeFileSync(path.join(sourceDir, sourceFilename), req.file.buffer);

  const image = sharp(req.file.buffer, { animated: false }).rotate();
  const metadata = await image.metadata();
  await image
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, alphaQuality: 90, smartSubsample: true, effort: 6 })
    .toFile(path.join(optimizedDir, optimizedFilename));

  const optimizedPath = path.join(optimizedDir, optimizedFilename);
  const optimizedSize = fs.statSync(optimizedPath).size;
  const sourceUrl = `/uploads/source/${sourceFilename}`;
  const optimizedUrl = `/uploads/webp/${optimizedFilename}`;
  const result = run(`INSERT INTO media_files
    (original_name,media_type,mime_type,source_url,optimized_url,source_size,optimized_size,width,height,created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?)`, [
    req.file.originalname, 'image', req.file.mimetype, sourceUrl, optimizedUrl,
    req.file.size, optimizedSize, metadata.width || null, metadata.height || null, req.user.id
  ]);
  audit(req, 'upload', 'media', result.lastInsertRowid, req.file.originalname);
  res.status(201).json({
    id: Number(result.lastInsertRowid), url: optimizedUrl, source_url: sourceUrl,
    optimized_url: optimizedUrl, name: req.file.originalname, type: 'image',
    source_size: req.file.size, optimized_size: optimizedSize,
    width: metadata.width, height: metadata.height
  });
});

function absoluteUrl(req, value = '') {
  if (/^https?:\/\//.test(value)) return value;
  const settings = settingsObject();
  return `${settings.site_url || `${req.protocol}://${req.get('host')}`}${value.startsWith('/') ? value : `/${value}`}`;
}

function verificationContent(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const match = raw.match(/content=["']([^"']+)["']/i);
  return match?.[1] || raw;
}

function analyticsHead(settings) {
  const snippet = String(settings.google_analytics_snippet || '').trim();
  if (snippet) return snippet;
  const analyticsId = String(settings.google_analytics_id || '').trim();
  const tagManagerId = String(settings.google_tag_manager_id || '').trim();
  const chunks = [];
  if (analyticsId) {
    chunks.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${analyticsId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${analyticsId}');</script>`);
  }
  if (tagManagerId) {
    chunks.push(`<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f)})(window,document,'script','dataLayer','${tagManagerId}');</script>`);
  }
  return chunks.join('\n');
}

app.get('/robots.txt', (req, res) => {
  const settings = settingsObject();
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nDisallow: /superadmin\nSitemap: ${settings.site_url || `${req.protocol}://${req.get('host')}`}/sitemap.xml\n`);
});

app.get('/manifest.webmanifest', (req, res) => {
  const settings = settingsObject();
  const icon = absoluteUrl(req, settings.favicon_url || settings.logo_url || settings.seo_og_image || '');
  res.type('application/manifest+json').send({
    name: settings.site_name,
    short_name: settings.site_short_name,
    description: settings.site_tagline,
    start_url: '/',
    display: 'standalone',
    background_color: settings.dark_color || '#1A1A2E',
    theme_color: settings.primary_color || '#8B0000',
    lang: 'id',
    icons: icon ? [
      { src: icon, sizes: '192x192', purpose: 'any' },
      { src: icon, sizes: '512x512', purpose: 'any maskable' }
    ] : []
  });
});

app.get('/sitemap.xml', (req, res) => {
  const settings = settingsObject();
  const base = String(settings.site_url || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const urls = [
    ['', new Date().toISOString(), '1.0'],
    ['/about', new Date().toISOString(), '0.8'],
    ['/services', new Date().toISOString(), '0.8'],
    ['/programs', new Date().toISOString(), '0.8'],
    ['/blog', new Date().toISOString(), '0.8'],
    ['/gallery', new Date().toISOString(), '0.8'],
    ['/testimonials', new Date().toISOString(), '0.8'],
    ['/request-konsultasi', new Date().toISOString(), '0.9'], ['/klien', new Date().toISOString(), '0.8'], ['/event', new Date().toISOString(), '0.8'],
    ['/penawaran', new Date().toISOString(), '0.7'],
    ...published('programs').map((x) => [`/program/${x.slug}`, x.updated_at || x.created_at, '0.8']),
    ...published('posts').map((x) => [`/blog/${x.slug}`, x.updated_at || x.published_at, '0.7']),
    ...published('galleries').map((x) => [`/gallery/${x.slug}`, x.updated_at || x.created_at, '0.7']),
    ...published('events').map((x) => [`/event/${x.slug}`, x.updated_at || x.created_at, '0.8']),
    ...published('proposals').map((x) => [`/proposal/${x.slug}`, x.updated_at || x.created_at, '0.5'])
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([url, date, priority]) =>
    `  <url><loc>${base}${url}</loc><lastmod>${new Date(date).toISOString()}</lastmod><priority>${priority}</priority></url>`).join('\n')}\n</urlset>`;
  res.type('application/xml').send(xml);
});

const distDir = path.join(root, 'dist');
if (fs.existsSync(distDir)) app.use(express.static(distDir, { index: false, maxAge: isProduction ? '1d' : 0 }));

function routeSeo(req, pathName = req.path) {
  const settings = settingsObject();
  const base = String(settings.site_url || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  let title = settings.seo_title || settings.site_name;
  let description = settings.seo_description || settings.site_tagline;
  let keywords = settings.seo_keywords || '';
  let image = settings.seo_og_image || settings.logo_url;
  let type = 'website';
  const postMatch = pathName.match(/^\/blog\/([^/]+)$/);
  const programMatch = pathName.match(/^\/program\/([^/]+)$/);
  const galleryMatch = pathName.match(/^\/gallery\/([^/]+)$/);
  const proposalMatch = pathName.match(/^\/proposal\/([^/]+)$/);
  if (proposalMatch) {
    const proposal = row('SELECT * FROM proposals WHERE slug=? AND is_published=1', [proposalMatch[1]]);
    const page = row("SELECT * FROM proposal_pages WHERE slug='proposal' AND is_published=1");
    if (proposal) {
      title = proposal.title || `Proposal untuk ${proposal.institution_name} | ${settings.site_short_name || settings.site_name}`;
      description = proposal.hero_subtitle || page?.meta_description || description;
      keywords = page?.meta_keywords || keywords;
    }
  } else if (programMatch) {
    const program = row('SELECT * FROM programs WHERE slug=? AND is_published=1', [programMatch[1]]);
    if (program) {
      title = `${program.title} | ${settings.site_short_name || settings.site_name}`;
      description = program.description || settings.seo_description || settings.site_tagline;
      image = program.image_url || image;
      type = 'product';
    }
  } else if (postMatch) {
    const post = row('SELECT * FROM posts WHERE slug=? AND is_published=1', [postMatch[1]]);
    if (post) {
      title = post.meta_title || `${post.title} | ${settings.site_short_name || settings.site_name}`;
      description = post.meta_description || post.excerpt;
      image = post.featured_image || image;
      type = 'article';
    }
  } else if (galleryMatch) {
    const gallery = row('SELECT * FROM galleries WHERE slug=? AND is_published=1', [galleryMatch[1]]);
    if (gallery) {
      title = `${gallery.title} | Galeri ${settings.site_short_name || ''}`;
      description = gallery.description;
      image = gallery.cover_url || image;
    }
  } else if (pathName === '/about') {
    const about = row("SELECT * FROM about_pages WHERE slug='about' AND is_published=1");
    if (about) {
      title = about.meta_title || `${about.hero_title} | ${settings.site_short_name || settings.site_name}`;
      description = about.meta_description || about.hero_subtitle || description;
      keywords = about.meta_keywords || keywords;
      image = about.hero_image_url || image;
    }
  } else if (pathName === '/services') {
    const servicePage = row("SELECT * FROM service_pages WHERE slug='services' AND is_published=1");
    if (servicePage) {
      title = servicePage.meta_title || `${servicePage.hero_title} | ${settings.site_short_name || settings.site_name}`;
      description = servicePage.meta_description || servicePage.hero_subtitle || description;
      keywords = servicePage.meta_keywords || keywords;
      image = servicePage.hero_image_url || image;
    }
  } else if (pathName === '/programs') {
    const programPage = row("SELECT * FROM program_pages WHERE slug='programs' AND is_published=1");
    if (programPage) {
      title = programPage.meta_title || `${programPage.hero_title} | ${settings.site_short_name || settings.site_name}`;
      description = programPage.meta_description || programPage.hero_subtitle || description;
      keywords = programPage.meta_keywords || keywords;
    }
  } else if (pathName === '/request-konsultasi') {
    const consultation = row("SELECT * FROM consultation_pages WHERE slug='request-konsultasi' AND is_published=1");
    if (consultation) {
      title = consultation.meta_title || `${consultation.title} | ${settings.site_short_name || settings.site_name}`;
      description = consultation.meta_description || consultation.subtitle || description;
      keywords = consultation.meta_keywords || keywords;
    }
  } else if (pathName === '/klien') {
    const page = row("SELECT * FROM client_pages WHERE slug='klien' AND is_published=1");
    if (page) { title = page.meta_title || page.title; description = page.meta_description || page.subtitle || description; keywords = page.meta_keywords || keywords; }
  } else if (pathName === '/blog') {
    title = `Blog & Insight | ${settings.site_short_name || settings.site_name}`;
    description = 'Artikel, panduan, dan insight terbaru tentang pengembangan SDM, leadership, outbound, dan sertifikasi.';
  } else if (pathName === '/gallery') {
    title = `Galeri Kegiatan | ${settings.site_short_name || settings.site_name}`;
    description = 'Dokumentasi kegiatan pelatihan dan pengembangan SDM bersama STAR Training.';
  } else if (pathName === '/testimonials') {
    title = `Testimoni Klien & Peserta | ${settings.site_short_name || settings.site_name}`;
    description = 'Testimoni dan pengalaman peserta program pelatihan STAR Training & Consulting.';
  } else if (pathName === '/penawaran') {
    title = 'Penawaran Website Dynamic CMS Lengkap | Harga Bisa Nego';
    description = 'Website Vue.js dan Node.js siap pakai dengan CMS, blog, galeri, testimoni, SEO, media WebP, SuperAdmin, hosting, dan dukungan. Harga bisa nego via WhatsApp.';
  }
  return { settings, base, title, description, keywords, image: absoluteUrl(req, image || ''), type, canonical: `${base}${pathName}` };
}

function structuredData(req, seo) {
  const sectionLinks = rows('SELECT section_key,name,title,config_json,sort_order FROM sections WHERE is_visible=1 ORDER BY sort_order,id')
    .map((section) => {
      const config = JSON.parse(section.config_json || '{}');
      if (config.sitelink_enabled === 0) return null;
      const anchor = { stats: 'tentang', programs: 'program', galleries: 'gallery', testimonials: 'testimoni', posts: 'artikel', partners: 'partnership', contact: 'kontak' }[section.section_key] || section.section_key;
      const sectionName = section.section_key === 'stats' ? 'Tentang Kami' : (config.sitelink_label || section.title || section.name);
      const url = section.section_key === 'galleries' ? `${seo.base}/gallery` :
        section.section_key === 'testimonials' ? `${seo.base}/testimonials` :
        section.section_key === 'posts' ? `${seo.base}/blog` : `${seo.base}/#${anchor}`;
      return { '@type': 'SiteNavigationElement', name: sectionName, url };
    }).filter(Boolean);
  const publicTestimonials = published('testimonials').slice(0, 10);
  const publicFaqs = published('faqs');
  const currentPath = new URL(seo.canonical).pathname;
  const programMatch = currentPath.match(/^\/program\/([^/]+)$/);
  const pageProgram = programMatch ? row('SELECT * FROM programs WHERE slug=? AND is_published=1', [programMatch[1]]) : null;
  const aboutPage = currentPath === '/about' ? row("SELECT * FROM about_pages WHERE slug='about' AND is_published=1") : null;
  const servicePage = currentPath === '/services' ? row("SELECT * FROM service_pages WHERE slug='services' AND is_published=1") : null;
  const consultationPage = currentPath === '/request-konsultasi' ? row("SELECT * FROM consultation_pages WHERE slug='request-konsultasi' AND is_published=1") : null;
  const clientPage = currentPath === '/klien' ? row("SELECT * FROM client_pages WHERE slug='klien' AND is_published=1") : null;
  const proposalMatch = currentPath.match(/^\/proposal\/([^/]+)$/);
  const proposal = proposalMatch ? row('SELECT * FROM proposals WHERE slug=? AND is_published=1', [proposalMatch[1]]) : null;
  const proposalPackages = proposal ? published('proposal_packages').map((item) => ({ ...item, features: JSON.parse(item.features || '[]') })) : [];
  const ratingValue = publicTestimonials.length
    ? publicTestimonials.reduce((sum, item) => sum + Number(item.rating || 5), 0) / publicTestimonials.length
    : null;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'LocalBusiness'],
        '@id': `${seo.base}/#organization`,
        name: seo.settings.site_name,
        url: seo.base,
        logo: seo.image,
        email: seo.settings.email,
        telephone: seo.settings.phone,
        address: { '@type': 'PostalAddress', streetAddress: seo.settings.address, addressCountry: 'ID' },
        sameAs: [seo.settings.instagram_url, seo.settings.linkedin_url, seo.settings.youtube_url, seo.settings.facebook_url].filter(Boolean),
        ...(ratingValue ? {
          aggregateRating: { '@type': 'AggregateRating', ratingValue: ratingValue.toFixed(1), reviewCount: publicTestimonials.length, bestRating: 5 },
          review: publicTestimonials.slice(0, 5).map((item) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: item.name },
            reviewBody: item.quote,
            reviewRating: { '@type': 'Rating', ratingValue: item.rating, bestRating: 5 }
          }))
        } : {})
      },
      { '@type': 'WebSite', '@id': `${seo.base}/#website`, url: seo.base, name: seo.settings.site_name, publisher: { '@id': `${seo.base}/#organization` }, inLanguage: 'id-ID' },
      { '@type': 'WebPage', '@id': `${seo.canonical}#webpage`, url: seo.canonical, name: seo.title, description: seo.description, isPartOf: { '@id': `${seo.base}/#website` }, about: { '@id': `${seo.base}/#organization` }, inLanguage: 'id-ID' },
      ...sectionLinks,
      { '@type': 'ItemList', name: 'Bagian utama landing page', itemListElement: sectionLinks.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: item.url })) },
      ...(aboutPage ? [{
        '@type': 'AboutPage',
        '@id': `${seo.canonical}#aboutpage`,
        url: seo.canonical,
        name: seo.title,
        description: seo.description,
        mainEntity: { '@id': `${seo.base}/#organization` },
        inLanguage: 'id-ID'
      }] : []),
      ...(servicePage ? [{
        '@type': 'Service',
        '@id': `${seo.canonical}#services`,
        name: servicePage.hero_title,
        description: servicePage.meta_description || servicePage.hero_subtitle,
        provider: { '@id': `${seo.base}/#organization` },
        areaServed: 'Indonesia',
        url: seo.canonical
      }] : []),
      ...(consultationPage ? [{
        '@type': 'ContactPage', '@id': `${seo.canonical}#contactpage`, url: seo.canonical, name: seo.title,
        description: seo.description, mainEntity: { '@type': 'ContactPoint', contactType: 'customer support', telephone: seo.settings.phone, email: seo.settings.email, availableLanguage: ['id'] }
      }, {
        '@type': 'SiteNavigationElement', name: consultationPage.title, url: `${seo.base}/request-konsultasi`
      }] : []),
      ...(clientPage ? [{ '@type': 'CollectionPage', '@id': `${seo.canonical}#clientpage`, url: seo.canonical, name: seo.title, description: seo.description, about: { '@id': `${seo.base}/#organization` } }, { '@type': 'SiteNavigationElement', name: clientPage.title, url: `${seo.base}/klien` }] : []),
      ...(proposal ? [{
        '@type': 'WebPage', '@id': `${seo.canonical}#proposal`, url: seo.canonical, name: seo.title, description: seo.description,
        audience: { '@type': 'Organization', name: proposal.institution_name },
        mainEntity: { '@type': 'OfferCatalog', name: 'Pilihan paket penawaran', itemListElement: proposalPackages.map((item) => ({ '@type': 'Offer', name: item.title, description: item.description, priceSpecification: item.price_label })) }
      }] : []),
      ...(publicFaqs.length ? [{
        '@type': 'FAQPage',
        '@id': `${seo.base}/#faq`,
        mainEntity: publicFaqs.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } }))
      }] : []),
      ...(currentPath === '/penawaran' ? [{
        '@type': 'SoftwareApplication',
        name: 'Dynamic Company Profile CMS',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: seo.description,
        offers: [
          { '@type': 'Offer', name: 'Hosting Sendiri 1 Tahun', price: '4500000', priceCurrency: 'IDR', availability: 'https://schema.org/InStock', url: seo.canonical },
          { '@type': 'Offer', name: 'Numpang Hosting 1 Tahun', price: '5500000', priceCurrency: 'IDR', availability: 'https://schema.org/InStock', url: seo.canonical }
        ]
      }] : []),
      ...(pageProgram ? [{
        '@type': 'Course',
        name: pageProgram.title,
        description: pageProgram.description,
        image: absoluteUrl(req, pageProgram.image_url || seo.image),
        provider: { '@id': `${seo.base}/#organization` },
        url: seo.canonical,
        offers: {
          '@type': 'Offer',
          price: Number(pageProgram.price_discount || pageProgram.price_regular || 0),
          priceCurrency: 'IDR',
          availability: 'https://schema.org/InStock',
          url: seo.canonical
        }
      }] : [])
    ]
  };
}

app.get('/api/public/seo', (req, res) => {
  const pathName = String(req.query.path || '/').split('?')[0] || '/';
  const seo = routeSeo(req, pathName.startsWith('/') ? pathName : `/${pathName}`);
  res.json({
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    robots: ['/login', '/superadmin', '/admin'].includes(pathName) ? 'noindex, nofollow, noarchive' : (seo.settings.seo_robots || 'index, follow'),
    canonical: seo.canonical,
    image: seo.image,
    type: seo.type,
    schema: structuredData(req, seo),
    verification: {
      google: verificationContent(seo.settings.google_verification),
      bing: verificationContent(seo.settings.bing_verification),
      yandex: verificationContent(seo.settings.yandex_verification)
    },
    google_analytics_id: seo.settings.google_analytics_id || '',
    google_analytics_snippet: seo.settings.google_analytics_snippet || '',
    google_tag_manager_id: seo.settings.google_tag_manager_id || '',
    custom_head_html: seo.settings.custom_head_html || ''
  });
});

app.get('*path', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) return res.status(503).send('Frontend belum dibuild. Jalankan npm run build.');
  const seo = routeSeo(req);
  const schema = structuredData(req, seo);
  const escape = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const head = `
    <title>${escape(seo.title)}</title>
    <meta name="description" content="${escape(seo.description)}">
    <meta name="keywords" content="${escape(seo.keywords)}">
    <meta name="robots" content="${escape(['/login','/superadmin','/admin'].includes(req.path) ? 'noindex, nofollow, noarchive' : (seo.settings.seo_robots || 'index, follow'))}">
    <link rel="canonical" href="${escape(seo.canonical)}">
    <meta property="og:type" content="${seo.type}">
    <meta property="og:title" content="${escape(seo.title)}">
    <meta property="og:description" content="${escape(seo.description)}">
    <meta property="og:url" content="${escape(seo.canonical)}">
    <meta property="og:image" content="${escape(seo.image)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escape(seo.title)}">
    <meta name="twitter:description" content="${escape(seo.description)}">
    <meta name="twitter:image" content="${escape(seo.image)}">
    ${seo.settings.favicon_url || seo.settings.logo_url ? `<link rel="icon" href="${escape(absoluteUrl(req, seo.settings.favicon_url || seo.settings.logo_url))}">` : ''}
    ${seo.settings.google_verification ? `<meta name="google-site-verification" content="${escape(verificationContent(seo.settings.google_verification))}">` : ''}
    ${seo.settings.bing_verification ? `<meta name="msvalidate.01" content="${escape(verificationContent(seo.settings.bing_verification))}">` : ''}
    ${seo.settings.yandex_verification ? `<meta name="yandex-verification" content="${escape(verificationContent(seo.settings.yandex_verification))}">` : ''}
    <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
    ${analyticsHead(seo.settings)}
    ${seo.settings.custom_head_html || ''}
  `;
  const html = fs.readFileSync(indexPath, 'utf8')
    .replace('<!-- DYNAMIC_HEAD -->', head)
    .replace(/<!-- FALLBACK_HEAD_START -->[\s\S]*?<!-- FALLBACK_HEAD_END -->/, '');
  res.send(html);
});

app.use((error, req, res, next) => {
  console.error(error);
  if (error instanceof multer.MulterError) return res.status(400).json({ message: `Upload gagal: ${error.message}` });
  res.status(500).json({ message: isProduction ? 'Terjadi kesalahan pada server.' : error.message });
});

app.listen(port, () => {
  console.log(`STAR CMS running at http://localhost:${port}`);
});
