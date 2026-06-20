import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dataDir = path.join(root, 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, 'startc.sqlite'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'SuperAdmin',
      is_active INTEGER NOT NULL DEFAULT 1,
      auth_version INTEGER NOT NULL DEFAULT 1,
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      group_name TEXT NOT NULL DEFAULT 'general',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      eyebrow TEXT,
      title TEXT,
      subtitle TEXT,
      content TEXT,
      config_json TEXT NOT NULL DEFAULT '{}',
      is_visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      badge TEXT,
      description TEXT,
      content TEXT,
      icon TEXT,
      emoji TEXT,
      image_url TEXT,
      flyer_pdf_url TEXT,
      cta_url TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trainers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      bio TEXT,
      certifications TEXT NOT NULL DEFAULT '[]',
      image_url TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS galleries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      cover_url TEXT,
      event_date TEXT,
      location TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gallery_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gallery_id INTEGER NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      alt_text TEXT,
      caption TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT,
      excerpt TEXT,
      content TEXT,
      featured_image TEXT,
      meta_title TEXT,
      meta_description TEXT,
      keywords TEXT,
      canonical_url TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      is_featured INTEGER NOT NULL DEFAULT 0,
      published_at TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      organization TEXT,
      quote TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      avatar_url TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo_url TEXT,
      website_url TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      button_label TEXT,
      button_url TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS about_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE DEFAULT 'about',
      hero_eyebrow TEXT,
      hero_title TEXT NOT NULL,
      hero_subtitle TEXT,
      hero_image_url TEXT,
      intro_eyebrow TEXT,
      intro_title TEXT,
      intro_content TEXT,
      values_eyebrow TEXT,
      values_title TEXT,
      values_subtitle TEXT,
      advantages_eyebrow TEXT,
      advantages_title TEXT,
      advantages_subtitle TEXT,
      cta_title TEXT,
      cta_subtitle TEXT,
      cta_button_label TEXT,
      cta_button_url TEXT,
      meta_title TEXT,
      meta_description TEXT,
      meta_keywords TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS about_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS about_advantages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS service_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE DEFAULT 'services',
      hero_eyebrow TEXT,
      hero_title TEXT NOT NULL,
      hero_subtitle TEXT,
      hero_image_url TEXT,
      intro_eyebrow TEXT,
      intro_title TEXT,
      intro_content TEXT,
      services_eyebrow TEXT,
      services_title TEXT,
      services_subtitle TEXT,
      programs_eyebrow TEXT,
      programs_title TEXT,
      programs_subtitle TEXT,
      cta_title TEXT,
      cta_subtitle TEXT,
      cta_button_label TEXT,
      cta_button_url TEXT,
      meta_title TEXT,
      meta_description TEXT,
      meta_keywords TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS service_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      image_url TEXT,
      button_label TEXT,
      button_url TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS program_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE DEFAULT 'programs',
      hero_eyebrow TEXT,
      hero_title TEXT NOT NULL,
      hero_subtitle TEXT,
      list_eyebrow TEXT,
      list_title TEXT,
      list_subtitle TEXT,
      meta_title TEXT,
      meta_description TEXT,
      meta_keywords TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS social_proofs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      action_text TEXT NOT NULL DEFAULT 'telah membeli paket layanan pelatihan',
      program_id INTEGER REFERENCES programs(id) ON DELETE SET NULL,
      program_title TEXT,
      message_text TEXT,
      occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      display_seconds INTEGER NOT NULL DEFAULT 4,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      value REAL NOT NULL DEFAULT 0,
      prefix TEXT,
      suffix TEXT,
      icon TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS navigation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT 'header',
      target TEXT NOT NULL DEFAULT '_self',
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      company TEXT,
      position TEXT,
      program TEXT,
      participants TEXT,
      timeline TEXT,
      message TEXT,
      ref_code TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bank_name TEXT NOT NULL,
      account_number TEXT NOT NULL,
      account_name TEXT NOT NULL,
      branch_name TEXT,
      instructions TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS confirmation_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      role TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS program_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT NOT NULL UNIQUE,
      program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
      program_title TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      email TEXT,
      company TEXT,
      position TEXT,
      company_address TEXT,
      training_date TEXT,
      participant_names TEXT,
      participants INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      base_amount REAL NOT NULL DEFAULT 0,
      voucher_code TEXT,
      voucher_discount REAL NOT NULL DEFAULT 0,
      unique_code INTEGER NOT NULL DEFAULT 0,
      total_transfer REAL NOT NULL DEFAULT 0,
      payment_account_id INTEGER REFERENCES payment_accounts(id) ON DELETE SET NULL,
      payment_bank_name TEXT,
      payment_account_number TEXT,
      payment_account_name TEXT,
      confirmation_contact_id INTEGER REFERENCES confirmation_contacts(id) ON DELETE SET NULL,
      confirmation_contact_name TEXT,
      confirmation_contact_whatsapp TEXT,
      proof_source_url TEXT,
      proof_webp_url TEXT,
      proof_source_size INTEGER NOT NULL DEFAULT 0,
      proof_webp_size INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      ref_code TEXT,
      ip_address TEXT,
      user_agent TEXT,
      admin_notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity TEXT,
      entity_id TEXT,
      detail TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_name TEXT NOT NULL,
      media_type TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      source_url TEXT NOT NULL,
      optimized_url TEXT,
      source_size INTEGER NOT NULL DEFAULT 0,
      optimized_size INTEGER,
      width INTEGER,
      height INTEGER,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const postColumns = rows("PRAGMA table_info('posts')").map((column) => column.name);
  if (!postColumns.includes('sort_order')) {
    db.exec('ALTER TABLE posts ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0');
  }
  const programColumns = rows("PRAGMA table_info('programs')").map((column) => column.name);
  if (!programColumns.includes('flyer_pdf_url')) {
    db.exec('ALTER TABLE programs ADD COLUMN flyer_pdf_url TEXT');
  }
  if (!programColumns.includes('price_regular')) {
    db.exec('ALTER TABLE programs ADD COLUMN price_regular REAL NOT NULL DEFAULT 0');
  }
  if (!programColumns.includes('price_discount')) {
    db.exec('ALTER TABLE programs ADD COLUMN price_discount REAL NOT NULL DEFAULT 0');
  }
  if (!programColumns.includes('voucher_code')) {
    db.exec('ALTER TABLE programs ADD COLUMN voucher_code TEXT');
  }
  if (!programColumns.includes('voucher_discount')) {
    db.exec('ALTER TABLE programs ADD COLUMN voucher_discount REAL NOT NULL DEFAULT 0');
  }
  if (!programColumns.includes('youtube_url')) {
    db.exec('ALTER TABLE programs ADD COLUMN youtube_url TEXT');
  }
  if (!programColumns.includes('hero_featured')) {
    db.exec('ALTER TABLE programs ADD COLUMN hero_featured INTEGER NOT NULL DEFAULT 0');
  }
  if (!programColumns.includes('enable_order_form')) {
    db.exec('ALTER TABLE programs ADD COLUMN enable_order_form INTEGER NOT NULL DEFAULT 1');
  }
  if (!programColumns.includes('enable_whatsapp_cta')) {
    db.exec('ALTER TABLE programs ADD COLUMN enable_whatsapp_cta INTEGER NOT NULL DEFAULT 1');
  }
  const userColumns = rows("PRAGMA table_info('users')").map((column) => column.name);
  if (!userColumns.includes('auth_version')) {
    db.exec('ALTER TABLE users ADD COLUMN auth_version INTEGER NOT NULL DEFAULT 1');
  }
  const orderColumns = rows("PRAGMA table_info('program_orders')").map((column) => column.name);
  const addOrderColumn = (name, definition) => {
    if (!orderColumns.includes(name)) db.exec(`ALTER TABLE program_orders ADD COLUMN ${name} ${definition}`);
  };
  addOrderColumn('position', 'TEXT');
  addOrderColumn('company_address', 'TEXT');
  addOrderColumn('training_date', 'TEXT');
  addOrderColumn('participant_names', 'TEXT');
  addOrderColumn('confirmation_contact_id', 'INTEGER REFERENCES confirmation_contacts(id) ON DELETE SET NULL');
  addOrderColumn('confirmation_contact_name', 'TEXT');
  addOrderColumn('confirmation_contact_whatsapp', 'TEXT');
}

export function rows(sql, params = []) {
  return db.prepare(sql).all(...params);
}

export function row(sql, params = []) {
  return db.prepare(sql).get(...params);
}

export function run(sql, params = []) {
  return db.prepare(sql).run(...params);
}

export function settingsObject() {
  return Object.fromEntries(rows('SELECT key, value FROM settings').map((item) => {
    try {
      return [item.key, JSON.parse(item.value)];
    } catch {
      return [item.key, item.value];
    }
  }));
}

migrate();
