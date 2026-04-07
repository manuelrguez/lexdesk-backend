-- Seed: datos de demostración (del prototipo)
INSERT INTO users (name, email, password, role, color, short) VALUES
  ('María García',      'maria@lexdesk.es',   '$2b$10$DEMO_HASH', 'Abogada Senior', '#C8A035', 'MG'),
  ('Carlos Rodríguez',  'carlos@lexdesk.es',  '$2b$10$DEMO_HASH', 'Abogado',        '#3A80C2', 'CR'),
  ('Ana Martínez',      'ana@lexdesk.es',     '$2b$10$DEMO_HASH', 'Procuradora',    '#7A62D2', 'AM')
ON CONFLICT DO NOTHING;
