import bcrypt from 'bcryptjs';
import { db, migrate, row, rows, run } from './db.js';
import * as seed from './seed-data.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function seedDatabase() {
  migrate();
  if (process.env.SITE_URL) {
    run(`INSERT INTO settings (key, value, group_name) VALUES ('site_url', ?, 'general')
      ON CONFLICT(key) DO UPDATE SET value=excluded.value, group_name='general', updated_at=CURRENT_TIMESTAMP`, [JSON.stringify(process.env.SITE_URL)]);
  }
  for (const [key, value] of Object.entries(seed.settings)) {
    run(`INSERT INTO settings (key, value, group_name) VALUES (?, ?, ?)
      ON CONFLICT(key) DO NOTHING`, [key, JSON.stringify(value), key.startsWith('seo_') ? 'seo' : 'general']);
  }
  run(`UPDATE settings SET value=?, updated_at=CURRENT_TIMESTAMP WHERE key='font_display' AND value IN ('"Playfair Display"', '"Inter"')`, [JSON.stringify('Manrope')]);
  run(`UPDATE settings SET value=?, updated_at=CURRENT_TIMESTAMP WHERE key='font_body' AND value IN ('"Playfair Display"', '"Inter"')`, [JSON.stringify('Manrope')]);
  run(`UPDATE settings SET value=?, updated_at=CURRENT_TIMESTAMP WHERE key='logo_url' AND value IN ('""', 'null')`, [JSON.stringify('/Master-Logo-Star-1-2048x1011.png')]);
  run(`UPDATE settings SET value=?, updated_at=CURRENT_TIMESTAMP WHERE key='favicon_url' AND value IN ('""', 'null', '"/favicon-32x32.png"', '"/favicon-96x96.png"')`, [JSON.stringify('/favicon.svg')]);
  run("UPDATE navigation SET url='/testimonials' WHERE label='Testimoni' AND url='/#testimoni'");
  if (!row("SELECT value FROM settings WHERE key='system_ui_refresh_20260619'")) {
    const whiteSections = new Set(['clients', 'programs', 'trainers', 'galleries', 'posts', 'faqs']);
    for (const section of rows('SELECT section_key, config_json FROM sections')) {
      let config = {};
      try { config = JSON.parse(section.config_json || '{}'); } catch {}
      const style = { ...(config.style || {}) };
      if (whiteSections.has(section.section_key)) {
        Object.assign(style, { background_color: '#ffffff', aurora_enabled: 0, glow_enabled: 0 });
      }
      if (section.section_key === 'cta') {
        Object.assign(style, { background_color: '#ffffff', aurora_enabled: 1, glow_enabled: 1, glow_color: '#f43f5e' });
      }
      run('UPDATE sections SET config_json=?, updated_at=CURRENT_TIMESTAMP WHERE section_key=?', [
        JSON.stringify({ ...config, style }),
        section.section_key
      ]);
    }
    run("INSERT INTO settings (key,value,group_name) VALUES ('system_ui_refresh_20260619','\"1\"','system')");
  }
  if (!row("SELECT value FROM settings WHERE key='system_section_no_dividers_20260619'")) {
    for (const section of rows('SELECT section_key, config_json FROM sections')) {
      let config = {};
      try { config = JSON.parse(section.config_json || '{}'); } catch {}
      const style = { ...(config.style || {}), divider_type: '' };
      const nextConfig = {
        ...config,
        ...(section.section_key === 'clients' ? { display_mode: 'masonry', scroll_height: 240 } : {}),
        style
      };
      run('UPDATE sections SET config_json=?, updated_at=CURRENT_TIMESTAMP WHERE section_key=?', [
        JSON.stringify(nextConfig),
        section.section_key
      ]);
    }
    run("INSERT INTO settings (key,value,group_name) VALUES ('system_section_no_dividers_20260619','\"1\"','system')");
  }
  if (!row("SELECT value FROM settings WHERE key='system_section_curve_dividers_20260619'")) {
    for (const section of rows('SELECT section_key, config_json FROM sections')) {
      let config = {};
      try { config = JSON.parse(section.config_json || '{}'); } catch {}
      const style = { ...(config.style || {}), divider_type: config.style?.divider_type || 'curve' };
      run('UPDATE sections SET config_json=?, updated_at=CURRENT_TIMESTAMP WHERE section_key=?', [
        JSON.stringify({ ...config, style }),
        section.section_key
      ]);
    }
    run("INSERT INTO settings (key,value,group_name) VALUES ('system_section_curve_dividers_20260619','\"1\"','system')");
  }
  if (!row("SELECT value FROM settings WHERE key='system_section_curve_dividers_all_20260619'")) {
    for (const section of rows('SELECT section_key, config_json FROM sections')) {
      let config = {};
      try { config = JSON.parse(section.config_json || '{}'); } catch {}
      const style = { ...(config.style || {}), divider_type: 'curve' };
      run('UPDATE sections SET config_json=?, updated_at=CURRENT_TIMESTAMP WHERE section_key=?', [
        JSON.stringify({ ...config, style }),
        section.section_key
      ]);
    }
    run("INSERT INTO settings (key,value,group_name) VALUES ('system_section_curve_dividers_all_20260619','\"1\"','system')");
  }
  if (!row("SELECT value FROM settings WHERE key='system_scroll_perf_20260619'")) {
    for (const section of rows('SELECT section_key, config_json FROM sections')) {
      let config = {};
      try { config = JSON.parse(section.config_json || '{}'); } catch {}
      const style = { ...(config.style || {}) };
      style.particle_count = section.section_key === 'hero' ? Math.min(Number(style.particle_count || 12), 12) : 0;
      if (section.section_key !== 'hero') style.particles_enabled = 0;
      style.parallax_enabled = 0;
      run('UPDATE sections SET config_json=?, updated_at=CURRENT_TIMESTAMP WHERE section_key=?', [
        JSON.stringify({ ...config, style }),
        section.section_key
      ]);
    }
    run("INSERT INTO settings (key,value,group_name) VALUES ('system_scroll_perf_20260619','\"1\"','system')");
  }
  if (row('SELECT COUNT(*) count FROM confirmation_contacts').count === 0) {
    const statement = db.prepare('INSERT INTO confirmation_contacts (name,whatsapp,role,sort_order) VALUES (?,?,?,?)');
    seed.confirmationContacts.forEach((item) => statement.run(...item));
  }
  if (row('SELECT COUNT(*) count FROM about_pages').count === 0) {
    const fields = Object.keys(seed.aboutPage);
    run(`INSERT INTO about_pages (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`, fields.map((field) => seed.aboutPage[field]));
  }
  if (row('SELECT COUNT(*) count FROM about_values').count === 0) {
    const statement = db.prepare('INSERT INTO about_values (title,description,icon,sort_order) VALUES (?,?,?,?)');
    seed.aboutValues.forEach((item) => statement.run(...item));
  }
  if (row('SELECT COUNT(*) count FROM about_advantages').count === 0) {
    const statement = db.prepare('INSERT INTO about_advantages (title,description,icon,sort_order) VALUES (?,?,?,?)');
    seed.aboutAdvantages.forEach((item) => statement.run(...item));
  }
  if (row('SELECT COUNT(*) count FROM service_pages').count === 0) {
    const fields = Object.keys(seed.servicePage);
    run(`INSERT INTO service_pages (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`, fields.map((field) => seed.servicePage[field]));
  }
  if (row('SELECT COUNT(*) count FROM service_items').count === 0) {
    const statement = db.prepare('INSERT INTO service_items (title,description,icon,image_url,button_label,button_url,sort_order) VALUES (?,?,?,?,?,?,?)');
    seed.serviceItems.forEach((item) => statement.run(...item));
  }
  if (row('SELECT COUNT(*) count FROM program_pages').count === 0) {
    const fields = Object.keys(seed.programPage);
    run(`INSERT INTO program_pages (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`, fields.map((field) => seed.programPage[field]));
  }
  if (row('SELECT COUNT(*) count FROM social_proofs').count === 0 && row('SELECT COUNT(*) count FROM programs').count > 0) {
    const statement = db.prepare(`INSERT INTO social_proofs
      (customer_name,action_text,program_id,program_title,message_text,occurred_at,display_seconds,sort_order)
      VALUES (?,?,?,?,?,?,?,?)`);
    for (const item of seed.socialProofs) {
      const program = row('SELECT id,title FROM programs WHERE slug=?', [item[2]]);
      statement.run(item[0], item[1], program?.id || null, program?.title || item[2], item[3], `datetime('now','${item[4]}')`, item[5], item[6]);
    }
    run("UPDATE social_proofs SET occurred_at=datetime('now','-2 hours') WHERE sort_order=10");
    run("UPDATE social_proofs SET occurred_at=datetime('now','-6 hours') WHERE sort_order=20");
    run("UPDATE social_proofs SET occurred_at=datetime('now','-1 day') WHERE sort_order=30");
    run("UPDATE social_proofs SET occurred_at=datetime('now','-2 days') WHERE sort_order=40");
    run("UPDATE social_proofs SET occurred_at=datetime('now','-3 days') WHERE sort_order=50");
  }
  if (!row("SELECT id FROM navigation WHERE url='/services' OR label='Layanan'")) {
    run("INSERT INTO navigation (label,url,sort_order) VALUES ('Layanan','/services',35)");
  }
  if (row("SELECT value FROM settings WHERE key='system_seed_version'")) {
    return { seeded: false };
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@startraining.info';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  db.exec('BEGIN');
  try {
    if (!row('SELECT id FROM users WHERE email = ?', [adminEmail])) {
      run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [
        'Super Administrator', adminEmail, bcrypt.hashSync(adminPassword, 12), 'SuperAdmin'
      ]);
    }

    for (const item of seed.sections) {
      run(`INSERT INTO sections (section_key,name,eyebrow,title,subtitle,content,config_json,is_visible,sort_order)
        VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(section_key) DO NOTHING`,
      [...item.slice(0, 6), JSON.stringify(item[6]), item[7], item[8]]);
    }

    const seedIfEmpty = (table, sql, data, map = (x) => x) => {
      if (row(`SELECT COUNT(*) count FROM ${table}`).count === 0) {
        const statement = db.prepare(sql);
        data.forEach((item) => statement.run(...map(item)));
      }
    };

    seedIfEmpty('stats', 'INSERT INTO stats (label,value,prefix,suffix,icon,sort_order) VALUES (?,?,?,?,?,?)', seed.stats);
    seedIfEmpty('programs', `INSERT INTO programs
      (title,slug,category,badge,description,content,icon,emoji,price_regular,price_discount,voucher_code,voucher_discount,youtube_url,hero_featured,is_featured,sort_order)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, seed.programs);
    seedIfEmpty('trainers', 'INSERT INTO trainers (name,role,bio,certifications,sort_order) VALUES (?,?,?,?,?)', seed.trainers, (x) => [x[0], x[1], x[2], JSON.stringify(x[3]), x[4]]);
    seedIfEmpty('features', 'INSERT INTO features (title,description,icon,sort_order) VALUES (?,?,?,?)', seed.features);
    seedIfEmpty('testimonials', 'INSERT INTO testimonials (name,organization,quote,rating,sort_order) VALUES (?,?,?,?,?)', seed.testimonials);
    seedIfEmpty('faqs', 'INSERT INTO faqs (question,answer,sort_order) VALUES (?,?,?)', seed.faqs);
    seedIfEmpty('posts', 'INSERT INTO posts (title,slug,category,excerpt,content,published_at,sort_order) VALUES (?,?,?,?,?,?,?)', seed.posts);
    seedIfEmpty('galleries', 'INSERT INTO galleries (title,slug,description,cover_url,event_date,location,sort_order) VALUES (?,?,?,?,?,?,?)', seed.galleries);
    seedIfEmpty('clients', 'INSERT INTO clients (name,logo_url,sort_order) VALUES (?,?,?)', seed.clients);
    seedIfEmpty('partners', 'INSERT INTO partners (title,description,icon,button_label,button_url,sort_order) VALUES (?,?,?,?,?,?)', seed.partners);
    seedIfEmpty('about_pages', `INSERT INTO about_pages (${Object.keys(seed.aboutPage).join(',')}) VALUES (${Object.keys(seed.aboutPage).map(() => '?').join(',')})`, [seed.aboutPage], (item) => Object.keys(seed.aboutPage).map((field) => item[field]));
    seedIfEmpty('about_values', 'INSERT INTO about_values (title,description,icon,sort_order) VALUES (?,?,?,?)', seed.aboutValues);
    seedIfEmpty('about_advantages', 'INSERT INTO about_advantages (title,description,icon,sort_order) VALUES (?,?,?,?)', seed.aboutAdvantages);
    seedIfEmpty('service_pages', `INSERT INTO service_pages (${Object.keys(seed.servicePage).join(',')}) VALUES (${Object.keys(seed.servicePage).map(() => '?').join(',')})`, [seed.servicePage], (item) => Object.keys(seed.servicePage).map((field) => item[field]));
    seedIfEmpty('service_items', 'INSERT INTO service_items (title,description,icon,image_url,button_label,button_url,sort_order) VALUES (?,?,?,?,?,?,?)', seed.serviceItems);
    seedIfEmpty('program_pages', `INSERT INTO program_pages (${Object.keys(seed.programPage).join(',')}) VALUES (${Object.keys(seed.programPage).map(() => '?').join(',')})`, [seed.programPage], (item) => Object.keys(seed.programPage).map((field) => item[field]));
    if (row('SELECT COUNT(*) count FROM social_proofs').count === 0) {
      const socialStatement = db.prepare(`INSERT INTO social_proofs
        (customer_name,action_text,program_id,program_title,message_text,occurred_at,display_seconds,sort_order)
        VALUES (?,?,?,?,?,?,?,?)`);
      for (const item of seed.socialProofs) {
        const program = row('SELECT id,title FROM programs WHERE slug=?', [item[2]]);
        socialStatement.run(item[0], item[1], program?.id || null, program?.title || item[2], item[3], new Date().toISOString(), item[5], item[6]);
      }
      run("UPDATE social_proofs SET occurred_at=datetime('now','-2 hours') WHERE sort_order=10");
      run("UPDATE social_proofs SET occurred_at=datetime('now','-6 hours') WHERE sort_order=20");
      run("UPDATE social_proofs SET occurred_at=datetime('now','-1 day') WHERE sort_order=30");
      run("UPDATE social_proofs SET occurred_at=datetime('now','-2 days') WHERE sort_order=40");
      run("UPDATE social_proofs SET occurred_at=datetime('now','-3 days') WHERE sort_order=50");
    }
    seedIfEmpty('navigation', 'INSERT INTO navigation (label,url,sort_order) VALUES (?,?,?)', seed.navigation);
    seedIfEmpty('payment_accounts', 'INSERT INTO payment_accounts (bank_name,account_number,account_name,branch_name,instructions,sort_order) VALUES (?,?,?,?,?,?)', seed.paymentAccounts);
    seedIfEmpty('confirmation_contacts', 'INSERT INTO confirmation_contacts (name,whatsapp,role,sort_order) VALUES (?,?,?,?)', seed.confirmationContacts);

    run("INSERT INTO settings (key,value,group_name) VALUES ('system_seed_version','\"1\"','system')");
    db.exec('COMMIT');
    console.log(`Database ready. SuperAdmin: ${adminEmail}`);
    console.log('Change the default password immediately after first login.');
    return { seeded: true, adminEmail };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) seedDatabase();
