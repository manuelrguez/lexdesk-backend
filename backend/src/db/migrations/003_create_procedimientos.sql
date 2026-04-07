CREATE TABLE IF NOT EXISTS procedimientos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero      VARCHAR(50) NOT NULL,
  tipo        VARCHAR(100),
  juzgado     TEXT,
  estado      VARCHAR(50) DEFAULT 'En curso',
  proxima_act DATE,
  cliente_id  UUID REFERENCES clientes(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
