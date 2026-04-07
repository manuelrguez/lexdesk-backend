CREATE TABLE IF NOT EXISTS documentos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          VARCHAR(255) NOT NULL,
  tipo            VARCHAR(100),
  s3_key          VARCHAR(500),
  tamanyo_kb      INTEGER,
  procedimiento_id UUID REFERENCES procedimientos(id),
  cliente_id      UUID REFERENCES clientes(id),
  user_id         UUID REFERENCES users(id),
  ia_metadata     JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
