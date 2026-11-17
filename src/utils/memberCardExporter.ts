import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import yamtaanuLogo from '../assets/images/yamtaanu_logo_1783692830472.jpg';

export interface MemberCardExportData {
  fullName: string;
  roleTitle: string;
  memberNumber: string;
  phone: string;
  address: string;
  country: string;
  validationDateLabel: string;
  photoUrl?: string;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawFlatTopHexagon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  halfW: number,
  halfH: number
) {
  ctx.beginPath();
  ctx.moveTo(cx - halfW * 0.5, cy - halfH);
  ctx.lineTo(cx + halfW * 0.5, cy - halfH);
  ctx.lineTo(cx + halfW, cy);
  ctx.lineTo(cx + halfW * 0.5, cy + halfH);
  ctx.lineTo(cx - halfW * 0.5, cy + halfH);
  ctx.lineTo(cx - halfW, cy);
  ctx.closePath();
}

function drawContainedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.naturalWidth / (img.naturalHeight || 1);
  const boxRatio = w / h;
  let drawW = w;
  let drawH = h;
  let drawX = x;
  let drawY = y;

  if (imgRatio > boxRatio) {
    drawW = w;
    drawH = w / imgRatio;
    drawY = y + (h - drawH) / 2;
  } else {
    drawH = h;
    drawW = h * imgRatio;
    drawX = x + (w - drawW) / 2;
  }
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

function drawCoveredImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.naturalWidth / (img.naturalHeight || 1);
  const boxRatio = w / h;
  let drawW = w;
  let drawH = h;
  let drawX = x;
  let drawY = y;

  if (imgRatio > boxRatio) {
    drawH = h;
    drawW = h * imgRatio;
    drawX = x - (drawW - w) / 2;
  } else {
    drawW = w;
    drawH = w / imgRatio;
    drawY = y - (drawH - h) / 2;
  }
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && ctx.measureText(truncated + '…').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated.trim() + '…';
}

export function buildMemberCardFileName(fullName: string, memberNumber: string, ext: 'png' | 'pdf'): string {
  const cleanName = (fullName || 'Membre')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const cleanId = (memberNumber || 'YAM').replace(/[^a-zA-Z0-9-]+/g, '');
  return `Carte_Membre_${cleanName}_${cleanId}.${ext}`;
}

export async function renderMemberCardToDataUrl(data: MemberCardExportData): Promise<string> {
  const W = 1586;
  const H = 1000;
  const headerH = 142;
  const footerH = 92;
  const bodyY = headerH;
  const bodyH = H - headerH - footerH;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Impossible d\'initialiser le rendu graphique.');

  // Load images & QR in parallel
  const verificationUrl = `https://yamtaanu.bj/membre?id=${data.memberNumber}`;
  const [qrDataUrl, trianglesImg, yamtaanuImg, stampImg, photoImg] = await Promise.all([
    QRCode.toDataURL(verificationUrl, {
      width: 280,
      margin: 1,
      color: { dark: '#171956', light: '#ffffff' }
    }),
    loadImage('/assets/aistudio/image_467966f7.png'),
    loadImage(yamtaanuLogo),
    loadImage('/assets/aistudio/image_8866b669.png'),
    data.photoUrl ? loadImage(data.photoUrl) : Promise.resolve(null)
  ]);
  const qrImg = await loadImage(qrDataUrl);

  // Outer card background base
  ctx.fillStyle = '#171956';
  ctx.fillRect(0, 0, W, H);

  // 1. GOLDEN BODY GRADIENT
  const goldGrad = ctx.createLinearGradient(0, bodyY, W, bodyY + bodyH);
  goldGrad.addColorStop(0, '#ffe066');
  goldGrad.addColorStop(0.55, '#fbbf24');
  goldGrad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, bodyY, W, bodyH);

  // 2. HONEYCOMB HEXAGONAL MESH OVERLAY
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, bodyY, W, bodyH);
  ctx.clip();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.36)';
  ctx.lineWidth = 2.6;
  const hexR = 46;
  const hexW = hexR * 2;
  const hexH = Math.sqrt(3) * hexR;
  const stepX = hexR * 1.5;

  for (let col = -1; col <= Math.ceil(W / stepX) + 1; col++) {
    const cx = col * stepX;
    const offsetY = (col % 2 !== 0 ? hexH / 2 : 0);
    for (let row = -1; row <= Math.ceil(bodyH / hexH) + 2; row++) {
      const cy = bodyY + row * hexH + offsetY;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = cx + (hexW / 2) * Math.cos(angle);
        const py = cy + (hexW / 2) * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();

  // 3. TOP NAVY BAR
  ctx.fillStyle = '#171956';
  ctx.fillRect(0, 0, W, headerH);

  // Left logo: Evolved Les Triangles inside dark gold-bordered frame
  drawRoundedRect(ctx, 42, 22, 184, 98, 14);
  ctx.fillStyle = '#09090b';
  ctx.fill();
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (trianglesImg) {
    drawContainedImage(ctx, trianglesImg, 48, 26, 172, 90);
  }

  // Right logo: Yamtãanu
  drawRoundedRect(ctx, W - 226, 22, 184, 98, 14);
  ctx.fillStyle = '#171956';
  ctx.fill();
  if (yamtaanuImg) {
    drawContainedImage(ctx, yamtaanuImg, W - 220, 24, 172, 94);
  }

  // Center Header Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 40px Inter, system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Carte de membre de la marque Yamtãanu', W / 2, headerH / 2 + 2);

  // 4. LEFT COLUMN: HEXAGONAL PHOTO FRAME + VERIFICATION QR
  const leftColCenterX = 212;
  const hexCenterY = bodyY + 235;
  const outerHalfW = 148;
  const outerHalfH = 132;

  // Drop shadow behind hex photo
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.30)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 8;
  drawFlatTopHexagon(ctx, leftColCenterX, hexCenterY, outerHalfW, outerHalfH);
  ctx.fillStyle = '#171956';
  ctx.fill();
  ctx.restore();

  // Inner white hex & photo clipped cleanly
  const innerHalfW = outerHalfW - 10;
  const innerHalfH = outerHalfH - 10;
  ctx.save();
  drawFlatTopHexagon(ctx, leftColCenterX, hexCenterY, innerHalfW, innerHalfH);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.clip();

  if (photoImg) {
    drawCoveredImage(
      ctx,
      photoImg,
      leftColCenterX - innerHalfW,
      hexCenterY - innerHalfH,
      innerHalfW * 2,
      innerHalfH * 2
    );
  } else {
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(
      leftColCenterX - innerHalfW,
      hexCenterY - innerHalfH,
      innerHalfW * 2,
      innerHalfH * 2
    );
    // Clean user silhouette placeholder
    ctx.fillStyle = 'rgba(23, 25, 86, 0.45)';
    ctx.beginPath();
    ctx.arc(leftColCenterX, hexCenterY - 26, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(leftColCenterX, hexCenterY + 62, 62, Math.PI, 0);
    ctx.fill();
    ctx.font = '800 20px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PHOTO', leftColCenterX, hexCenterY + 92);
  }
  ctx.restore();

  // Mini Verification QR Box
  const qrBoxW = 160;
  const qrBoxH = 186;
  const qrBoxX = leftColCenterX - qrBoxW / 2;
  const qrBoxY = hexCenterY + outerHalfH + 34;

  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 16);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(23, 25, 86, 0.30)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  if (qrImg) {
    ctx.drawImage(qrImg, qrBoxX + 14, qrBoxY + 12, 132, 132);
  }
  ctx.fillStyle = '#171956';
  ctx.font = '900 16px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VÉRIF. MEMBRE', leftColCenterX, qrBoxY + 165);

  // 5. RIGHT COLUMN: TRANSLUCENT FROSTED DETAILS PANEL
  const panelX = 402;
  const panelY = bodyY + 46;
  const panelW = W - panelX - 46;
  const panelH = bodyH - 92;

  drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 28);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.62)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Panel Top Row: Member Name + Customizable Role Badge
  const padX = 44;
  const contentLeft = panelX + padX;
  const contentRight = panelX + panelW - padX;
  const roleLabel = (data.roleTitle || 'Apiculteur').trim();

  ctx.font = '800 28px Inter, system-ui, sans-serif';
  const badgeTextW = ctx.measureText(roleLabel).width;
  const badgePadX = 28;
  const badgeW = Math.min(400, badgeTextW + badgePadX * 2);
  const badgeH = 54;
  const badgeX = contentRight - badgeW;
  const badgeY = panelY + 34;

  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 14);
  ctx.fillStyle = '#171956';
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(truncateText(ctx, roleLabel, badgeW - 24), badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);

  // Full Name (auto-fit if long)
  const nameMaxW = badgeX - contentLeft - 24;
  const upperName = (data.fullName || 'MEMBRE YAMTÃANU').toUpperCase();
  let nameFontSize = 46;
  ctx.font = `900 ${nameFontSize}px Inter, system-ui, sans-serif`;
  while (ctx.measureText(upperName).width > nameMaxW && nameFontSize > 30) {
    nameFontSize -= 2;
    ctx.font = `900 ${nameFontSize}px Inter, system-ui, sans-serif`;
  }
  ctx.fillStyle = '#171956';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(truncateText(ctx, upperName, nameMaxW), contentLeft, badgeY + badgeH / 2 + 2);

  // Divider line under Name & Role
  const dividerY = panelY + 112;
  ctx.strokeStyle = 'rgba(23, 25, 86, 0.16)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(contentLeft, dividerY);
  ctx.lineTo(contentRight, dividerY);
  ctx.stroke();

  // Key-Value Info Rows (NO expiration date)
  const rows: Array<{ label: string; value: string; mono?: boolean; permanentTag?: boolean }> = [
    { label: 'Matricule', value: data.memberNumber || 'YAM-PRO-000001', mono: true },
    { label: 'Téléphone', value: data.phone || 'Non renseigné' },
    { label: 'Adresse', value: data.address || 'Komiguéa, Parakou' },
    { label: 'Pays', value: (data.country || 'Bénin').trim() },
    { label: 'Validée le', value: data.validationDateLabel, permanentTag: true }
  ];

  const labelX = contentLeft;
  const valueX = contentLeft + 250;
  const maxValWidth = contentRight - valueX - 245; // keep clearance for stamp on lower lines
  const startRowY = dividerY + 62;
  const rowStepY = 82;

  rows.forEach((row, idx) => {
    const ry = startRowY + idx * rowStepY;

    ctx.fillStyle = '#171956';
    ctx.font = '700 30px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(row.label, labelX, ry);

    ctx.fillStyle = '#0f172a';
    ctx.font = row.mono
      ? '800 30px ui-monospace, SFMono-Regular, Menlo, monospace'
      : '600 30px Inter, system-ui, sans-serif';

    const valMax = idx >= 3 ? maxValWidth : contentRight - valueX - 10;
    if (row.permanentTag) {
      const dateW = ctx.measureText(row.value).width;
      ctx.fillText(row.value, valueX, ry);
      ctx.fillStyle = 'rgba(23, 25, 86, 0.82)';
      ctx.font = '700 24px Inter, system-ui, sans-serif';
      ctx.fillText('• Carte Permanente', valueX + dateW + 18, ry);
    } else {
      ctx.fillText(truncateText(ctx, row.value, valMax), valueX, ry);
    }
  });

  // 6. OFFICIAL DIRECTOR STAMP & SIGNATURE (Multiply blend over golden honeycomb)
  if (stampImg) {
    const stampH = 215;
    const stampW = (stampImg.naturalWidth / (stampImg.naturalHeight || 1)) * stampH;
    const stampX = panelX + panelW - stampW - 24;
    const stampY = panelY + panelH - stampH - 18;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(stampImg, stampX, stampY, stampW, stampH);
    ctx.restore();
  }

  // 7. BOTTOM NAVY LEGAL FOOTER BAND
  const footerY = H - footerH;
  ctx.fillStyle = '#171956';
  ctx.fillRect(0, footerY, W, footerH);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 26px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    'N°RCCM RB/PKO/16 A 2662  •  IFU 32008004912  •  Tél : +229 01 65613939 / 01 96285520',
    W / 2,
    footerY + footerH / 2 + 1
  );

  return canvas.toDataURL('image/png', 1.0);
}

export async function downloadMemberCardPng(data: MemberCardExportData): Promise<void> {
  const dataUrl = await renderMemberCardToDataUrl(data);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = buildMemberCardFileName(data.fullName, data.memberNumber, 'png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadMemberCardPdf(data: MemberCardExportData): Promise<void> {
  const dataUrl = await renderMemberCardToDataUrl(data);
  // Format CR80 officiel haute précision (85.6 mm x 54 mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [85.6, 54]
  });
  doc.addImage(dataUrl, 'PNG', 0, 0, 85.6, 54, undefined, 'FAST');
  doc.save(buildMemberCardFileName(data.fullName, data.memberNumber, 'pdf'));
}
