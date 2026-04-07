CREATE TABLE IF NOT EXISTS facturas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero     VARCHAR(30) UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  concepto   TEXT,
  base       NUMERIC(12,2),
  iva        NUMERIC(12,2),
  total      NUMERIC(12,2),
  estado     VARCHAR(30) DEFAULT 'Emitida',
  fecha      DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
