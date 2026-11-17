import { jsPDF } from 'jspdf';
import { BambouMielStore } from '../dataStore';

function pdfSafeText(value: unknown): string {
  if (value === null || value === undefined) return '-';
  const raw = String(value);
  return raw
    .replace(/[ãÃ]/g, (m) => (m === 'Ã' ? 'A' : 'a'))
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/’|‘/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–|—/g, '-')
    .replace(/•/g, '-')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || '-';
}

function formatMoney(val?: number): string {
  const num = Number(val || 0);
  return `${Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
}

async function loadOfficialStampDataUrl(): Promise<string | null> {
  try {
    const res = await fetch('/assets/aistudio/image_8866b669.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

interface TableColumn {
  header: string;
  width: number;
  align?: 'left' | 'right' | 'center';
}

export async function generateAllDataReportPdf(store: BambouMielStore): Promise<void> {
  const stampDataUrl = await loadOfficialStampDataUrl();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186mm
  let cursorY = margin;

  const nowStr = new Date().toLocaleString('fr-FR');
  const todayFile = new Date().toISOString().split('T')[0];

  const drawRunningHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `LES TRIANGLES - YAMTAANU | Dossier Papier Complet des Données ERP (${nowStr})`,
      margin,
      10
    );
    doc.setDrawColor(215, 215, 215);
    doc.setLineWidth(0.25);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  const ensureSpace = (needed: number) => {
    if (cursorY + needed > pageHeight - 16) {
      doc.addPage();
      drawRunningHeader();
      cursorY = 17;
      return true;
    }
    return false;
  };

  const drawSectionBanner = (num: number, title: string, subtitle: string) => {
    ensureSpace(16);
    cursorY += 2;
    doc.setFillColor(16, 48, 29); // #10301d
    doc.roundedRect(margin, cursorY, contentWidth, 9.5, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text(pdfSafeText(`${num}. ${title}`), margin + 3, cursorY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(251, 191, 36);
    doc.text(pdfSafeText(subtitle), margin + 3, cursorY + 8);
    cursorY += 12;
  };

  const drawTable = (columns: TableColumn[], rows: string[][], emptyMsg = 'Aucune donnée enregistrée.') => {
    if (rows.length === 0) {
      ensureSpace(9);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, cursorY, contentWidth, 7, 'FD');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(pdfSafeText(emptyMsg), margin + 3, cursorY + 4.6);
      cursorY += 10;
      return;
    }

    const drawHeaderRow = () => {
      doc.setFillColor(23, 25, 86); // #171956
      doc.rect(margin, cursorY, contentWidth, 6.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);

      let x = margin;
      columns.forEach((col) => {
        const text = pdfSafeText(col.header);
        if (col.align === 'right') {
          doc.text(text, x + col.width - 1.5, cursorY + 4.3, { align: 'right' });
        } else if (col.align === 'center') {
          doc.text(text, x + col.width / 2, cursorY + 4.3, { align: 'center' });
        } else {
          doc.text(text, x + 1.5, cursorY + 4.3);
        }
        x += col.width;
      });
      cursorY += 6.5;
    };

    ensureSpace(14);
    drawHeaderRow();

    rows.forEach((row, rIdx) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);

      // Compute wrapped lines for every cell
      const cellLines = columns.map((col, cIdx) => {
        const val = pdfSafeText(row[cIdx] ?? '-');
        return doc.splitTextToSize(val, Math.max(8, col.width - 3)) as string[];
      });
      const maxLines = Math.max(1, ...cellLines.map((l) => l.length));
      const rowHeight = Math.max(5.5, maxLines * 3.1 + 2.2);

      if (cursorY + rowHeight > pageHeight - 16) {
        doc.addPage();
        drawRunningHeader();
        cursorY = 17;
        drawHeaderRow();
      }

      // Striped row background
      if (rIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, cursorY, contentWidth, rowHeight, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.18);
      doc.rect(margin, cursorY, contentWidth, rowHeight, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(30, 41, 59);

      let x = margin;
      columns.forEach((col, cIdx) => {
        const lines = cellLines[cIdx];
        lines.forEach((line, lIdx) => {
          const ly = cursorY + 3.6 + lIdx * 3.1;
          if (col.align === 'right') {
            doc.text(line, x + col.width - 1.5, ly, { align: 'right' });
          } else if (col.align === 'center') {
            doc.text(line, x + col.width / 2, ly, { align: 'center' });
          } else {
            doc.text(line, x + 1.5, ly);
          }
        });
        x += col.width;
      });

      cursorY += rowHeight;
    });

    cursorY += 4;
  };

  // ==================== PAGE 1 : COUVERTURE & SYNTHESE ====================
  doc.setFillColor(16, 48, 29);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 40, pageWidth, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(251, 191, 36);
  doc.text('ETS LES TRIANGLES AGROBUSINESS - MARQUE YAMTAANU', margin, 13);

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('DOSSIER PAPIER COMPLET DES DONNEES ERP', margin, 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(
    pdfSafeText(`Edition integrale imprimable generee le ${nowStr} | Komiguea, Parakou - Benin`),
    margin,
    30
  );
  doc.text(
    'RCCM: RB/PKO/16 A 2662 | IFU: 32008004912 | Tel: +229 01 65613939 / 01 96285520',
    margin,
    36
  );

  cursorY = 50;

  // Financial & Operational KPI Summary Cards
  const totalSales = store.orders.reduce((s, o) => s + (o.status !== 'retourne' ? o.totalAmount : 0), 0);
  const totalHotel = store.bookings.reduce((s, b) => (b.status === 'en_cours' || b.status === 'termine' ? s + b.totalBilled : s), 0);
  const totalConf = store.conferenceBookings.reduce((s, c) => (c.status === 'en_cours' || c.status === 'termine' ? s + c.totalBilled : s), 0);
  const totalRevenue = totalSales + totalHotel + totalConf;
  const totalExpenses = store.expenses.reduce((s, e) => s + e.amount, 0);
  const netResult = totalRevenue - totalExpenses;

  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cursorY, contentWidth, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(120, 53, 15);
  doc.text('SYNTHESE FINANCIERE & ACTIVITE GLOBALE', margin + 4, cursorY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Chiffre brut agrege : ${formatMoney(totalRevenue)}`, margin + 4, cursorY + 13);
  doc.text(`Total depenses saisies : ${formatMoney(totalExpenses)}`, margin + 70, cursorY + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(`Resultat net estime : ${formatMoney(netResult)}`, margin + 132, cursorY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    `Membres: ${store.beekeepers.length} | Ruchers: ${store.apiaries.length} | Ruches suivies: ${store.trackedHives.length} | Bocaux QR: ${store.bottledJars.length} | Factures/Cmd: ${store.orders.length}`,
    margin + 4,
    cursorY + 21
  );

  cursorY += 32;

  // Quick Index of Contents on Cover Page
  drawTable(
    [
      { header: 'Compartiment / Registre ERP', width: 120 },
      { header: 'Nombre d\'enregistrements', width: 66, align: 'right' }
    ],
    [
      ['1. Proprietaires de ruches & Membres Yamtaanu', `${store.beekeepers.length} membres`],
      ['2. Ruchers & Ruches uniques suivies', `${store.apiaries.length} ruchers / ${store.trackedHives.length} ruches`],
      ['3. Journal des interventions & visites apicoles', `${store.journalEvents.length} fiches`],
      ['4. Campagnes, recoltes & seaux (sous-lots)', `${store.traceCampaigns.length} campagnes / ${store.bucketSubLots.length} sous-lots`],
      ['5. Miellerie (egouttage mousse) & Bocaux QR', `${store.transformationSteps.length} lots / ${store.bottledJars.length} bocaux`],
      ['6. Atelier Jus Naturels & Thes', `${store.juiceBatches.length} lots jus / ${store.teaBatches.length} lots thes`],
      ['7. Eco-Lodge & Salles de Conference', `${store.bookings.length} sejours / ${store.conferenceBookings.length} evenements`],
      ['8. Clients, Devis Proforma, Factures & Livraisons', `${store.clientProfiles.length} clients / ${store.proformas.length} proformas / ${store.orders.length} factures`],
      ['9. Stocks Produits Finis, Intrants & Mouvements', `${store.products.length} produits / ${store.rawMaterials.length} intrants / ${store.stockMovements.length} mouv.`],
      ['10. Depenses & Ecritures Comptables SYSCOHADA', `${store.expenses.length} depenses / ${store.journalEntries.length} ecritures`]
    ]
  );

  // ==================== SECTION 1 : MEMBRES APICULTEURS ====================
  drawSectionBanner(1, 'PROPRIETAIRES DE RUCHES & MEMBRES', `${store.beekeepers.length} membre(s) enregistre(s)`);
  drawTable(
    [
      { header: 'Matricule', width: 29 },
      { header: 'Nom & Prenom', width: 42 },
      { header: 'Fonction', width: 32 },
      { header: 'Telephone', width: 28 },
      { header: 'Localite', width: 35 },
      { header: 'Statut', width: 20, align: 'center' }
    ],
    store.beekeepers.map((b) => [
      b.memberNumber,
      b.fullName,
      b.roleTitle || 'Apiculteur',
      b.phone || '-',
      [b.village, b.commune].filter(Boolean).join(', '),
      b.status
    ])
  );

  // ==================== SECTION 2 : RUCHERS & RUCHES ====================
  drawSectionBanner(2, 'RUCHERS & RUCHES SUIVIES', `${store.apiaries.length} rucher(s) • ${store.trackedHives.length} ruche(s)`);
  drawTable(
    [
      { header: 'N° Rucher', width: 28 },
      { header: 'Nom du Rucher', width: 42 },
      { header: 'Proprietaire', width: 38 },
      { header: 'Localite', width: 34 },
      { header: 'Coordonnees GPS', width: 26 },
      { header: 'Statut', width: 18, align: 'center' }
    ],
    store.apiaries.map((a) => [
      a.apiaryNumber,
      a.name,
      a.ownerName,
      [a.village, a.commune].filter(Boolean).join(', '),
      a.gpsCoordinates || '-',
      a.status
    ])
  );

  drawTable(
    [
      { header: 'N° Ruche', width: 24 },
      { header: 'Rucher & GPS', width: 42 },
      { header: 'Proprietaire', width: 32 },
      { header: 'Type & Origine', width: 40 },
      { header: 'Colonisation', width: 26, align: 'center' },
      { header: 'Statut', width: 22, align: 'center' }
    ],
    store.trackedHives.map((h) => {
      const apiaryGps = store.apiaries.find((a) => a.id === h.apiaryId)?.gpsCoordinates;
      const gps = h.gpsCoordinates || apiaryGps || '-';
      const typeLabel = h.category === 'ecolo_artisanale' ? 'Ecolo Art.' : 'Ciment Bar.';
      const originLabel = h.coupledWithHive
        ? `${h.originMode || 'couplage'} (${h.coupledWithHive})`
        : h.originMode || 'standard';
      return [
        h.hiveNumber,
        `${h.apiaryName} | GPS: ${gps}`,
        h.ownerName,
        `${typeLabel} - ${originLabel}`,
        h.colonizationStatus,
        h.status
      ];
    })
  );

  // ==================== SECTION 3 : JOURNAL INTERVENTIONS ====================
  drawSectionBanner(3, 'JOURNAL DE SUIVI & INTERVENTIONS APICOLES', `${store.journalEvents.length} intervention(s)`);
  drawTable(
    [
      { header: 'Date', width: 20 },
      { header: 'Ruche / Rucher', width: 35 },
      { header: 'Type / Couplage', width: 30 },
      { header: 'Sante / Reine', width: 27 },
      { header: 'Actions realisees', width: 50 },
      { header: 'Operateur', width: 24 }
    ],
    store.journalEvents.map((ev) => [
      ev.date,
      `${ev.hiveNumber} (${ev.apiaryName})`,
      ev.coupledHiveNumber ? `${ev.eventType} -> ${ev.coupledHiveNumber}` : ev.eventType,
      `${ev.colonyHealth}${ev.queenPresent ? ' / Reine OK' : ''}`,
      ev.actionsDone || ev.notes || '-',
      ev.operatorName
    ])
  );

  // ==================== SECTION 4 : CAMPAGNES & RECOLTES SEAUX ====================
  drawSectionBanner(4, 'CAMPAGNES, RECOLTES & SEAUX (SOUS-LOTS)', `${store.traceCampaigns.length} campagne(s) • ${store.bucketSubLots.length} sous-lot(s)`);
  drawTable(
    [
      { header: 'Sous-Lot', width: 28 },
      { header: 'Seau', width: 24 },
      { header: 'Ruche / Proprietaire', width: 44 },
      { header: 'Date', width: 21 },
      { header: 'Poids Net', width: 21, align: 'right' },
      { header: 'Destination', width: 26 },
      { header: 'Reception', width: 22, align: 'center' }
    ],
    store.bucketSubLots.map((s) => [
      s.subLotNumber,
      s.physicalBucketNumber,
      `${s.hiveNumber} (${s.ownerName})`,
      s.fillDate,
      `${s.netWeightKg.toFixed(2)} kg`,
      s.destination,
      s.receptionStatus
    ])
  );

  // ==================== SECTION 5 : MIELLERIE & BOCAUX QR ====================
  drawSectionBanner(5, 'MIELLERIE (EGOUTTAGE AVEC MOUSSE) & BOCAUX QR', `${store.transformationSteps.length} transformation(s) • ${store.bottledJars.length} bocal(aux)`);
  drawTable(
    [
      { header: 'Sous-Lot / Ruche', width: 38 },
      { header: 'Date', width: 21 },
      { header: 'Entree', width: 20, align: 'right' },
      { header: 'Miel Net', width: 20, align: 'right' },
      { header: 'Cire / Mousse', width: 26, align: 'right' },
      { header: 'Humidite', width: 18, align: 'right' },
      { header: 'Qualite / Statut', width: 43 }
    ],
    store.transformationSteps.map((t) => [
      `${t.subLotNumber} (${t.hiveNumber})`,
      t.stepDate,
      `${t.inputWeightKg} kg`,
      `${t.outputHoneyKg} kg`,
      `${t.waxWeightKg} / ${t.foamWeightKg} kg`,
      `${t.moisturePercent}%`,
      `${t.purityGrade} (${t.status})`
    ])
  );

  drawTable(
    [
      { header: 'Code Bocal QR', width: 34 },
      { header: 'N° Lot', width: 32 },
      { header: 'Ruche / Village', width: 44 },
      { header: 'Mise en pot', width: 22 },
      { header: 'Format', width: 16, align: 'center' },
      { header: 'Hum.', width: 14, align: 'right' },
      { header: 'Statut', width: 24, align: 'center' }
    ],
    store.bottledJars.map((j) => [
      j.jarCode,
      j.lotNumber,
      `${j.hiveNumber} - ${j.village}`,
      j.bottlingDate,
      j.jarFormat,
      `${j.moisturePercent}%`,
      j.status
    ])
  );

  // ==================== SECTION 6 : ATELIER JUS & THES ====================
  drawSectionBanner(6, 'ATELIER JUS NATURELS & THES', `${store.juiceBatches.length} lots jus • ${store.teaBatches.length} lots thes`);
  drawTable(
    [
      { header: 'Date', width: 22 },
      { header: 'Gamme / Saveur', width: 54 },
      { header: 'Volume / Poids', width: 28, align: 'right' },
      { header: 'Conditionnement', width: 52 },
      { header: 'Statut', width: 30, align: 'center' }
    ],
    [
      ...store.juiceBatches.map((jb) => [
        jb.date,
        `JUS : ${jb.flavor}`,
        `${jb.volumeLiters} L`,
        `${jb.bottledQty250ml}x250ml / ${jb.bottledQty1L}x1L`,
        jb.isCompleted ? 'Termine' : 'En cours'
      ]),
      ...store.teaBatches.map((tb) => [
        tb.date,
        `THE : ${tb.blendName}`,
        `${tb.quantityKg} kg`,
        `${tb.packagedQty50g} sachets 50g`,
        tb.isCompleted ? 'Termine' : 'En cours'
      ])
    ]
  );

  // ==================== SECTION 7 : ECO-LODGE & CONFERENCES ====================
  drawSectionBanner(7, 'ECO-LODGE & SALLES DE CONFERENCE', `${store.bookings.length} reservation(s) hebergement • ${store.conferenceBookings.length} evenement(s)`);
  drawTable(
    [
      { header: 'Type', width: 24 },
      { header: 'Client / Organisateur', width: 46 },
      { header: 'Chambre / Salle', width: 38 },
      { header: 'Periode', width: 34 },
      { header: 'Total Facture', width: 26, align: 'right' },
      { header: 'Statut', width: 18, align: 'center' }
    ],
    [
      ...store.bookings.map((b) => [
        'Eco-Lodge',
        b.guestName,
        b.roomNumber,
        `${b.checkIn} -> ${b.checkOut}`,
        formatMoney(b.totalBilled),
        b.status
      ]),
      ...store.conferenceBookings.map((cb) => [
        'Conference',
        `${cb.organizerName} (${cb.organizerEntity})`,
        cb.hallName,
        `${cb.startDate} -> ${cb.endDate}`,
        formatMoney(cb.totalBilled),
        cb.status
      ])
    ]
  );

  // ==================== SECTION 8 : CLIENTS, PROFORMAS & FACTURES ====================
  drawSectionBanner(8, 'CLIENTS, PROFORMAS & FACTURES / COMMANDES', `${store.clientProfiles.length} client(s) • ${store.orders.length} commande(s)`);
  drawTable(
    [
      { header: 'Client / Raison Sociale', width: 48 },
      { header: 'Telephone', width: 28 },
      { header: 'Ville / Adresse', width: 42 },
      { header: 'IFU', width: 26 },
      { header: 'Plafond Credit', width: 24, align: 'right' },
      { header: 'Statut', width: 18, align: 'center' }
    ],
    store.clientProfiles.map((c) => [
      c.companyName ? `${c.clientName} (${c.companyName})` : c.clientName,
      c.phone || '-',
      [c.city, c.address].filter(Boolean).join(', ') || '-',
      c.ifuNumber || '-',
      formatMoney(c.creditLimit),
      c.status || 'actif'
    ])
  );

  drawTable(
    [
      { header: 'N° Facture / Proforma', width: 30 },
      { header: 'Date', width: 21 },
      { header: 'Client', width: 42 },
      { header: 'Articles', width: 38 },
      { header: 'Montant Total', width: 27, align: 'right' },
      { header: 'Paiement / Statut', width: 28, align: 'center' }
    ],
    [
      ...store.proformas.map((p) => [
        `PROFORMA ${p.id}`,
        p.date,
        p.clientName,
        p.items.map((i) => `${i.quantity}x ${i.variantName}`).join(', '),
        formatMoney(p.totalAmount),
        p.status
      ]),
      ...store.orders.map((o) => [
        o.id,
        o.date,
        o.clientName,
        o.items.map((i) => `${i.quantity}x ${i.variantName}`).join(', '),
        formatMoney(o.totalAmount),
        `${o.paymentStatus || 'paye'} / ${o.status}`
      ])
    ]
  );

  // ==================== SECTION 9 : STOCKS & MOUVEMENTS ====================
  drawSectionBanner(9, 'STOCKS PRODUITS FINIS & INTRANTS', `${store.products.length} produit(s) finis • ${store.rawMaterials.length} intrant(s)`);
  drawTable(
    [
      { header: 'Article / Designation', width: 60 },
      { header: 'Categorie / Secteur', width: 34 },
      { header: 'Stock Actuel', width: 26, align: 'right' },
      { header: 'Prix / Cout Unit.', width: 30, align: 'right' },
      { header: 'Emplacement / Notes', width: 36 }
    ],
    [
      ...store.products.map((p) => [
        `${p.name} (${p.variant})`,
        `Produit (${p.category})`,
        `${p.stock} u.`,
        formatMoney(p.price),
        p.location || p.batchNumber || '-'
      ]),
      ...store.rawMaterials.map((m) => [
        m.name,
        `Intrant (${m.sector})`,
        `${m.currentStock} ${m.unit}`,
        formatMoney(m.unitCost),
        `${m.location} | ${m.supplier}`
      ])
    ]
  );

  // ==================== SECTION 10 : DEPENSES & COMPTABILITE SYSCOHADA ====================
  drawSectionBanner(10, 'DEPENSES & ECRITURES COMPTABLES SYSCOHADA', `${store.expenses.length} depense(s) • ${store.journalEntries.length} ecriture(s)`);
  drawTable(
    [
      { header: 'Date', width: 22 },
      { header: 'Libelle Depense', width: 72 },
      { header: 'Categorie', width: 40 },
      { header: 'Division', width: 22, align: 'center' },
      { header: 'Montant', width: 30, align: 'right' }
    ],
    store.expenses.map((e) => [
      e.date,
      e.description,
      e.category,
      e.division,
      formatMoney(e.amount)
    ])
  );

  drawTable(
    [
      { header: 'Date / Piece', width: 34 },
      { header: 'Journal', width: 18, align: 'center' },
      { header: 'Libelle Ecriture', width: 66 },
      { header: 'Total Debit', width: 34, align: 'right' },
      { header: 'Total Credit', width: 34, align: 'right' }
    ],
    store.journalEntries.map((je) => [
      `${je.date} | ${je.pieceRef}`,
      je.journal,
      je.label,
      formatMoney(je.totalDebit),
      formatMoney(je.totalCredit)
    ])
  );

  // ==================== VALIDATION & CACHET OFFICIEL ====================
  ensureSpace(45);
  cursorY += 4;
  doc.setDrawColor(23, 25, 86);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, cursorY, contentWidth, 36, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(23, 25, 86);
  doc.text('ATTESTATION D\'EXTRACTION & ARCHIVE PAPIER OFFICIELLE', margin + 4, cursorY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(
    pdfSafeText(`Document certifie conforme aux donnees saisies dans l'ERP Yamtaanu au ${nowStr}.`),
    margin + 4,
    cursorY + 14
  );
  doc.text('Archive destinée à la direction generale et au controle interne.', margin + 4, cursorY + 20);

  if (stampDataUrl) {
    try {
      doc.addImage(stampDataUrl, 'PNG', pageWidth - margin - 52, cursorY + 2, 48, 32);
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.text('Le Directeur - SARKI Yantannou', pageWidth - margin - 55, cursorY + 20);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.text('Le Directeur - SARKI Yantannou', pageWidth - margin - 55, cursorY + 20);
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(215, 215, 215);
    doc.setLineWidth(0.25);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(
      'Ets LES TRIANGLES AGROBUSINESS • Marque Yamtaanu • Archive papier officielle',
      margin,
      pageHeight - 7
    );
    const pageLabel = `Page ${p} / ${totalPages}`;
    doc.text(pageLabel, pageWidth - margin - doc.getTextWidth(pageLabel), pageHeight - 7);
  }

  doc.save(`Dossier_Papier_Complet_Yamtaanu_${todayFile}.pdf`);
}
