const puppeteer = require('puppeteer')

async function generateFacturaPDF(factura) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
    ],
  })

  const page = await browser.newPage()

  const fmt = (n) => Number(n).toLocaleString('es-ES', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }) + ' €'

  const fecha = factura.fecha
    ? new Date(factura.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

  const estadoColor = {
    Pagada:   '#276749',
    Pendiente:'#C05621',
    Emitida:  '#2B6CB0',
  }[factura.estado] || '#4A5568'

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Georgia', serif;
      color: #1A202C;
      background: #fff;
      padding: 48px;
      font-size: 14px;
      line-height: 1.6;
    }

    /* Cabecera */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 48px;
      padding-bottom: 24px;
      border-bottom: 2px solid #C8A035;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #C8A035;
      letter-spacing: 1px;
    }
    .logo-sub {
      font-size: 11px;
      color: #718096;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .factura-num {
      text-align: right;
    }
    .factura-num .num {
      font-size: 22px;
      font-weight: 700;
      color: #C8A035;
      font-family: monospace;
    }
    .factura-num .estado {
      display: inline-block;
      margin-top: 6px;
      padding: 3px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: ${estadoColor};
      background: ${estadoColor}22;
      border: 1px solid ${estadoColor}44;
    }

    /* Info */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 40px;
    }
    .info-block h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #718096;
      margin-bottom: 8px;
    }
    .info-block p {
      color: #1A202C;
      font-size: 14px;
    }
    .info-block .value {
      font-size: 16px;
      font-weight: 600;
    }

    /* Concepto */
    .concepto-box {
      background: #F7FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 20px 24px;
      margin-bottom: 32px;
    }
    .concepto-box h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #718096;
      margin-bottom: 8px;
    }
    .concepto-box p {
      font-size: 15px;
      color: #2D3748;
      line-height: 1.7;
    }

    /* Tabla importes */
    .importes {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
    }
    .importes thead tr {
      background: #2D3748;
      color: #fff;
    }
    .importes thead th {
      padding: 12px 16px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .importes thead th:last-child { text-align: right; }
    .importes tbody tr {
      border-bottom: 1px solid #E2E8F0;
    }
    .importes tbody td {
      padding: 14px 16px;
      font-size: 14px;
      color: #2D3748;
    }
    .importes tbody td:last-child { text-align: right; }
    .importes tfoot tr.total {
      background: #FFFBEB;
      border-top: 2px solid #C8A035;
    }
    .importes tfoot td {
      padding: 14px 16px;
      font-size: 16px;
      font-weight: 700;
      color: #C8A035;
    }
    .importes tfoot td:last-child { text-align: right; }

    /* Footer */
    .footer {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer p {
      font-size: 11px;
      color: #A0AEC0;
    }
    .footer .gold { color: #C8A035; font-weight: 600; }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="logo">⚖ LexDesk Pro</div>
      <div class="logo-sub">Despacho Jurídico</div>
    </div>
    <div class="factura-num">
      <div class="num">${factura.numero}</div>
      <div><span class="estado">${factura.estado}</span></div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-block">
      <h3>Cliente</h3>
      <p class="value">${factura.cliente_nombre || '—'}</p>
    </div>
    <div class="info-block">
      <h3>Fecha de emisión</h3>
      <p class="value">${fecha}</p>
    </div>
  </div>

  <div class="concepto-box">
    <h3>Concepto</h3>
    <p>${factura.concepto || '—'}</p>
  </div>

  <table class="importes">
    <thead>
      <tr>
        <th>Descripción</th>
        <th style="text-align:right">Importe</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Base imponible</td>
        <td>${fmt(factura.base)}</td>
      </tr>
      <tr>
        <td>IVA (21%)</td>
        <td>${fmt(factura.iva)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="total">
        <td>TOTAL</td>
        <td>${fmt(factura.total)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <p>Generado por <span class="gold">LexDesk Pro</span> · Sistema de Gestión Legal Integral</p>
    <p>${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>

</body>
</html>`

  await page.setContent(html, { waitUntil: 'networkidle0' })

  const pdf = await page.pdf({
    format:            'A4',
    printBackground:   true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  })

  await browser.close()
  return pdf
}

module.exports = { generateFacturaPDF }