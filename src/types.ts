export interface AuthorizedUser {
  id: string;
  name: string; // Nom & Prénom de l'utilisateur
  emailOrLogin: string; // Identifiant unique de connexion (ex: admin, jean.m, sarah)
  phone?: string; // Numéro de téléphone pour connexion mobile ou partage WhatsApp
  role: 'Administrateur Principal' | 'Administrateur' | 'Employé' | 'Opérateur';
  accessCode: string; // Code PIN ou mot de passe individuel (ex: 8492, yamtaanu)
  active: boolean; // Statut : true = autorisé à utiliser l'app, false = accès révoqué/bloqué
  department: 'Général' | 'Miellerie & Ruchers' | 'Atelier Jus & Thés' | 'Éco-Lodge' | 'Conférences & Événements' | 'Comptabilité';
  addedAt: string;
}

export interface BambooHivePreform {
  id: string;
  createdAt: string;
  bambooQtyUsed: number;
  status: 'en_cours' | 'complete';
  artisanName: string;
  centerName?: string; // Centre de fabrication de la ruche
}

export interface InstalledHive {
  id: string;
  preformId: string;
  code: string;
  locationName: string;
  gpsCoordinates: string; // e.g., "4.312, 11.502"
  installedAt: string;
  status: 'actif' | 'inactif' | 'abandonne';
  beekeeperName?: string; // Nom de l'apiculteur responsable
  hiveCount?: number;     // Nombre de ruches tressées rattachées au site
  hiveNumbers?: string;   // Leurs numéros d'identification spécifiques (ex: R-01, R-02...)
  commune?: string;       // Commune d'implantation
  village?: string;       // Village d'implantation
}

export interface HiveInspection {
  id: string;
  hiveId: string;
  date: string;
  populationHealth: 'excellent' | 'normal' | 'faible';
  queenPresent: boolean;
  parasitesDetected: boolean;
  humidityLevelPercent: number;
  honeyEstimateKg: number;
  notes: string;
  inspectedBy?: string;      // Nom du contrôleur / apiculteur
  broodPresence?: 'oui' | 'non'; // Présence ou non de couvain sain au nid
  queenCells?: boolean;      // Présence de cellules royales d'essaimage
  activityLevel?: 'tres_actif' | 'moyen' | 'faible'; // Activité planche d'envol
}

export interface HarvestCampaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'terminee';
  description?: string;
}

export interface Harvest {
  id: string;
  hiveId: string;
  campaignId?: string; // Campagne de récolte liée
  date: string;
  quantityKg: number;
  moisturePercent: number;
  honeyColor: 'extra_blanc' | 'blanc' | 'ambre_clair' | 'ambre' | 'sombre';
  qualityGrade: 'AA' | 'A' | 'B';
  status: 'brut' | 'recu_miellerie' | 'extrait';
  harvestedBy?: string;       // Nom de l'apiculteur récoltant
  weatherConditions?: string; // Météo (ex: Ensoleillé, Humide...)
  batchReference?: string;    // Référence traçabilité de lot récolte brute
}

export interface ExtractionLog {
  id: string;
  harvestIds: string[];
  extractionDate: string;
  extractedWeightKg: number;
  wasteWeightKg: number;
  tankId: string;
  method: 'pressurage' | 'centrifugation' | 'degouttage';
}

export interface StoredHoneyTank {
  id: string;
  name: string;
  capacityKg: number;
  currentWeightKg: number;
}

export interface BottlingBatch {
  id: string;
  tankId: string;
  bottlingDate: string;
  jarSizeG: 250 | 500 | 1000;
  quantity: number;
  batchNumber: string; // Traceability code: e.g. LOT-20260622-01
  expirationDate: string;
  labelTemplate: string;
}

export interface FinishedProduct {
  id: string;
  name: string;
  category: 'miel' | 'jus' | 'the' | 'hotel' | 'conference' | 'autre';
  variant: string; // e.g., "Miel d'Acacia 500g", "Jus de Gingembre-Ananas 1L", "Thé vert Citronnelle", "Location Grande Salle"
  price: number;
  stock: number;
  minAlertStock?: number; // Seuil minimum d'alerte
  unitCost?: number; // Coût unitaire de production / achat pour valorisation
  location?: string; // Emplacement de stockage
  batchNumber?: string;
  description?: string;
}

export interface RawMaterialStockItem {
  id: string;
  name: string;
  category: 'emballage' | 'matiere_premiere' | 'consommable' | 'equipement_ruche' | 'fourniture';
  sector: 'miel' | 'jus' | 'the' | 'hotel' | 'conference' | 'general';
  unit: string; // e.g. "pots", "bouteilles", "tiges", "kg", "sachets", "litres", "paquets", "unités"
  currentStock: number;
  minAlertStock: number;
  unitCost: number; // Coût d'achat unitaire en FCFA
  supplier: string;
  location: string;
  lastRestockedDate?: string;
  notes?: string;
}

export interface StockMovement {
  id: string;
  date: string;
  time?: string;
  itemType: 'produit_fini' | 'intrant';
  itemId: string;
  itemName: string;
  sector: 'miel' | 'jus' | 'the' | 'hotel' | 'conference' | 'general' | 'autre';
  movementType: 
    | 'entree_achat' 
    | 'entree_production' 
    | 'entree_retour_client' 
    | 'sortie_vente' 
    | 'sortie_consommation' 
    | 'sortie_perte_casse' 
    | 'ajustement_inventaire';
  quantity: number; // Toujours positif, le sens est donné par le type
  unit?: string;
  unitCost?: number;
  totalCost?: number;
  referenceDoc?: string; // N° Commande, N° BL, N° Lot production, N° RMA, etc.
  operator: string;
  notes?: string;
}

export interface OrderPaymentRecord {
  id: string;
  orderId: string;
  date: string;
  amount: number;
  paymentMethod: 'especes' | 'momo' | 'carte' | 'virement' | 'cheque';
  momoProvider?: 'MTN MoMo' | 'Moov Money' | 'Wave' | 'Celtiis Cash' | 'Autre';
  momoRef?: string;
  referenceDoc?: string;
  receivedBy: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  variantName: string;
  quantity: number;
  price: number;
  unitCost?: number;
  discountPercent?: number;
}

export interface SalesOrder {
  id: string;
  date: string;
  dueDate?: string; // Date d'échéance si vente à crédit
  clientName: string;
  clientId?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientIfu?: string;
  items: OrderItem[];
  totalAmount: number;
  paidAmount?: number; // Montant réglé par le client (acompte ou total)
  remainingBalance?: number; // Solde restant dû
  isCreditSale?: boolean; // Vente à crédit ou au comptant
  paymentStatus?: 'paye' | 'partiel' | 'a_credit' | 'en_retard' | 'annule' | 'non_paye' | 'partiellement_paye';
  status: 'en_attente' | 'livre' | 'reste_a_livrer' | 'retourne';
  deliveryNoteCreated: boolean;
  discountPercent?: number; // Réduction distributeur %
  discountAmount?: number;  // Montant de réduction appliqué
  paymentMethod?: 'especes' | 'momo' | 'carte' | 'virement' | 'cheque' | 'credit' | 'autre';
  momoProvider?: 'MTN MoMo' | 'Moov Money' | 'Wave' | 'Celtiis Cash' | 'Autre';
  momoRef?: string;
  carrierName?: string;
  carrierContact?: string;
  carrierTrackingNum?: string;
  amountReceived?: number;
  changeReturned?: number;
  source?: 'comptoir_pos' | 'facturation_b2b' | 'hotel' | 'conference' | 'commercial';
  cashierName?: string;
  time?: string;
  notes?: string;
  proformaRef?: string; // Si issue d'un devis/proforma converti
  payments?: OrderPaymentRecord[]; // Historique des règlements
}

export interface SalesProforma {
  id: string; // e.g. PRO-2026-001
  date: string;
  validUntil: string; // Date de validité de l'offre (ex: 30 jours)
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  clientIfu?: string;
  items: OrderItem[];
  totalAmount: number;
  discountPercent?: number;
  discountAmount?: number;
  paymentTerms: 'comptant' | 'credit_15j' | 'credit_30j' | 'acompte_50' | 'momo_a_la_livraison' | 'a_reception' | 'virement_avance' | 'autre';
  deliveryTerms?: string;
  status: 'brouillon' | 'envoye' | 'accepte' | 'converti_en_facture' | 'refuse' | 'expire';
  convertedOrderId?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface PosSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  cashierName: string;
  initialCash: number; // Fond de caisse initial
  totalCashSales: number;
  totalMomoSales: number;
  totalCardSales: number;
  totalCreditSales: number;
  totalSalesCount: number;
  totalRevenue: number;
  actualCashInDrawer?: number; // Montant compté à la fermeture
  cashDifference?: number; // Écart de caisse (réel - théorique)
  status: 'ouvert' | 'ferme';
  notes?: string;
}

export interface ClientAccountProfile {
  id?: string;
  clientName: string;
  companyName?: string; // Raison sociale
  ifuNumber?: string; // Numéro IFU officiel (Bénin)
  npiNumber?: string; // Numéro NPI
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string; // Parakou, Cotonou, Ouidah, etc.
  creditLimit: number; // Plafond de crédit en FCFA
  paymentTermDays?: number; // Délai de paiement habituel (ex: 15 ou 30 jours)
  category?: 'boutique' | 'hotel' | 'supermarche' | 'grossiste' | 'particulier' | 'entreprise_ong' | 'autre';
  status?: 'prospect' | 'actif' | 'fidele' | 'inactif' | 'douteux';
  notes: string;
  lastContactDate?: string;
  interactionLog?: string[];
  createdAt?: string;
}

export interface DeliveryNote {
  id: string;
  orderId: string;
  date: string;
  recipientName: string;
  recipientAddress: string;
  carrierName: string;
  trackingNumber: string;
  status: 'en_transit' | 'livre';
}

export interface ClientReturn {
  id: string;
  orderId: string;
  clientName?: string;
  date: string;
  reason: string; // e.g., 'Casse transport', 'Défaut d'étanchéité pot', 'Erreur de référence', 'Non conformité goût/lot'
  itemsReturned: {
    productId: string;
    variantName: string;
    quantity: number;
    unitPrice?: number;
    action?: 'remise_en_stock' | 'rebut_perte' | 'echange'; // Action physique sur le stock
  }[];
  refundAmount: number;
  refundMethod?: 'avoir' | 'especes' | 'momo' | 'virement' | 'echange_produit';
  creditNoteRef?: string; // Ex: AV-2026-001
  status: 'recu' | 'valide' | 'traite' | 'rejete';
  handledBy?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 
    | 'Bambou & Matériel'
    | 'Transport & Ruches'
    | 'Apiculture & Suivi'
    | 'Extraction & Miellerie'
    | 'Pots & Étiquettes'
    | 'Fruits & Ingrédients Jus'
    | 'Feuilles & Arômes Thé'
    | 'Maintenance Hôtel'
    | 'Équipements & Conférence'
    | 'Salaires'
    | 'Divers';
  division: 'miel' | 'jus' | 'the' | 'hotel' | 'conference' | 'general' | 'autre';
}

export interface JuiceBatch {
  id: string;
  date: string;
  flavor: string; // e.g. Gingembre-Ananas, Hibiscus-Baobab, Mangue-Passion
  volumeLiters: number;
  ingredientsSourced: string;
  bottledQty250ml: number;
  bottledQty1L: number;
  isCompleted: boolean;
}

export interface TeaBatch {
  id: string;
  date: string;
  blendName: string; // e.g. Thé Vert Moringa, Tisane Citronnelle Hibiscus
  quantityKg: number;
  ingredientsSourced: string;
  packagedQty50g: number;
  isCompleted: boolean;
}

export interface HotelRoom {
  id: string;
  number: string;
  type: 'Ecolodge Bambou' | 'Chambre Jasmin' | 'Chambre Premium Miel';
  pricePerNight: number;
  status: 'disponible' | 'occupe' | 'en_nettoyage';
}

export interface HotelBooking {
  id: string;
  roomId: string;
  roomNumber: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  status: 'confirme' | 'en_cours' | 'termine' | 'annule';
  extrasBilled: number; // Cocktail, honey, tea purchases added to hotel bill
  totalBilled: number;
}

export interface ConferenceHall {
  id: string;
  name: string;
  capacity: number; // e.g. 50, 120, 200 personnes
  hourlyRate: number;
  dailyRate: number;
  halfDayRate: number;
  amenities: string[]; // e.g. ['Vidéoprojecteur HD 4K', 'Sono & Micros sans fil', 'Wifi Haut Débit', 'Climatisation', 'Paperboard', 'Pause-café bio']
  status: 'disponible' | 'reserve' | 'maintenance';
  description?: string;
}

export interface ConferenceBooking {
  id: string;
  hallId: string;
  hallName: string;
  organizerName: string;
  organizerEntity: string; // Entreprise, ONG, Coopérative, Particulier
  phone: string;
  email: string;
  eventTitle: string;
  eventType: 'Seminaire' | 'Atelier' | 'Reunion' | 'Conference' | 'Formation' | 'Autre';
  startDate: string;
  endDate: string;
  timeSlot?: string; // e.g. "08:30 - 17:00" ou "Journée entière"
  participantsCount: number;
  selectedServices: {
    name: string;
    price: number;
  }[];
  hallPrice: number;
  extrasBilled: number;
  totalBilled: number;
  status: 'confirme' | 'en_cours' | 'termine' | 'annule';
  notes?: string;
  createdAt: string;
}

export interface SyscohadaAccount {
  code: string;
  label: string;
  accountClass: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  type: 'actif' | 'passif' | 'charge' | 'produit' | 'tresorerie';
  sector?: 'miel' | 'jus' | 'the' | 'hotel' | 'conference' | 'general' | 'autre';
  description?: string;
  isCustom?: boolean;
}

export interface JournalEntryLine {
  id?: string;
  accountCode: string;
  accountLabel: string;
  debit: number;
  credit: number;
  sector?: 'miel' | 'jus' | 'the' | 'hotel' | 'conference' | 'general' | 'autre';
  note?: string;
}

export interface SyscohadaJournalEntry {
  id: string;
  date: string;
  journal: 'Ventes' | 'Achats' | 'Caisse' | 'Banque' | 'OD';
  pieceRef: string; // Ex: 'FA-2026-001', 'POS-008', 'FAC-FOURN-22'
  label: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  validated: boolean;
  source: 'auto_pos' | 'auto_order' | 'auto_expense' | 'auto_booking' | 'manual';
  createdAt: string;
}

export interface CashReconciliationRecord {
  id: string;
  date: string;
  accountCode: '5711' | '5712' | '5713' | '5714' | '5211';
  accountName: string;
  theoreticalBalance: number;
  countedRealBalance: number;
  difference: number;
  justification?: string;
  verifiedBy: string;
}

// ============================================================================
// MODÈLES DE TRAÇABILITÉ INTÉGRALE : LES TRIANGLES – Yamtãanu
// « Producteurs, ruchers, récoltes, miellerie & QR consommateur »
// ============================================================================

export interface BeekeeperOwner {
  id: string;
  memberNumber: string; // Ex: 'YAM-PRO-000001'
  fullName: string;
  roleTitle?: string; // Fonction / titre du bénéficiaire sur la carte (ex: Apiculteur, Responsable Rucher, Partenaire...)
  phone: string;
  commune: string;
  village: string;
  photoUrl?: string;
  joinDate: string;
  status: 'actif' | 'inactif' | 'honoraire';
  cinOrIdCard?: string;
  validationStatus: 'valide' | 'en_attente';
  validatedBy?: string;
  validationDate?: string;
  notes?: string;
}

export interface Apiary {
  id: string;
  apiaryNumber: string; // Ex: 'YAM-RCR-000001'
  name: string;
  ownerId: string;
  ownerName: string;
  gpsCoordinates: string;
  village: string;
  commune: string;
  installationDate: string;
  accessConditions: string; // Ex: "Piste 4x4, accessible par tous temps", "Sentier piéton 200m"
  photos?: string[];
  vegetationType?: string; // Flore mellifère environnante
  status: 'actif' | 'en_repos' | 'abandonne';
  notes?: string;
}

export interface HiveOccupationHistory {
  id: string;
  date: string;
  event:
    | 'installation'
    | 'appatage'
    | 'colonisation'
    | 'couplage'
    | 'division'
    | 'depart'
    | 'recolonisation'
    | 'deplacement'
    | 'changement_proprietaire';
  details: string;
  author: string;
}

export interface TrackedHive {
  id: string;
  hiveNumber: string; // Format unique strict: 'YAM/26/001' - Ne contient ni propriétaire ni rucher
  apiaryId: string;
  apiaryNumber: string;
  apiaryName: string;
  ownerId: string;
  ownerName: string;
  gpsCoordinates?: string; // Géolocalisation héritée du rucher ou propre à la ruche
  originMode?: 'piege_appatee' | 'essaimage_naturel' | 'couplage' | 'division' | 'transvasement';
  coupledWithHive?: string; // N° de ruche couplée / mère en cas de couplage ou division
  category: 'ecolo_artisanale' | 'ciment_barrettes_superieures';
  installationDate: string;
  colonizationStatus: 'vide' | 'occupee' | 'recolonisee';
  lastColonizedDate?: string;
  lastDepartureDate?: string;
  colonyStrength?: 'forte' | 'moyenne' | 'faible';
  status: 'active' | 'inopérante' | 'déplacée';
  history: HiveOccupationHistory[];
  notes?: string;
}

export interface HiveJournalEvent {
  id: string;
  hiveId: string;
  hiveNumber: string;
  apiaryId: string;
  apiaryName: string;
  date: string;
  eventType:
    | 'visite'
    | 'installation'
    | 'appatage'
    | 'colonisation'
    | 'couplage'
    | 'division'
    | 'depart_essaim'
    | 'recolonisation'
    | 'intervention_sanitaire'
    | 'nourrissement'
    | 'recolte'
    | 'deplacement'
    | 'maintenance';
  coupledHiveNumber?: string; // N° de ruche associée lors d'un couplage ou d'une division
  colonyStatus: 'vide' | 'occupee' | 'recolonisee';
  colonyHealth: 'vigoureuse' | 'normale' | 'affaiblie' | 'reine_vue' | 'sans_reine';
  queenPresent: boolean;
  broodStatus: 'abondant' | 'moyen' | 'absent';
  parasitesOrProblems: string; // Ex: "Aucun parasite", "Fausse teigne écartée", "Attaque fourmis traitée"
  actionsDone: string; // Travaux réalisés
  photos?: string[];
  nextAction: string; // Prochaine action
  nextActionDate?: string;
  operatorName: string;
  notes?: string;
}

export interface HarvestCampaignRecord {
  id: string;
  campaignNumber: string; // Ex: 'YAM-CAM-2026-01' ou 'YAM-CAM-2026-02'
  year: number; // 2026
  campaignType: 1 | 2; // Campagne 1 ou Campagne 2
  name: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  targetedApiaries: string[]; // Noms ou IDs de ruchers
  responsibles: string;
  status: 'preparee' | 'ouverte' | 'cloturee';
  totalTargetKg?: number;
  totalCollectedKg?: number;
  notes?: string;
}

export interface HarvestCorrection {
  timestamp: string;
  author: string;
  field: string;
  oldValue: string | number;
  newValue: string | number;
  reason: string;
}

export interface PhysicalBucket {
  bucketNumber: string; // Ex: 'YAM-SEA-000001'
  tareWeightKg: number; // Tare du seau (ex: 1.20 kg)
  material: 'plastique_alimentaire_pehd' | 'inox';
  capacityLiters: number;
  status: 'disponible' | 'au_rucher' | 'rempli' | 'a_nettoyer';
  currentSubLotId?: string;
  totalUsesCount: number;
}

export interface BucketSubLot {
  id: string;
  subLotNumber: string; // Ex: 'YAM-SLOT-000001'
  physicalBucketNumber: string; // Ex: 'YAM-SEA-000001'
  harvestId: string;
  campaignId: string;
  campaignNumber: string;
  hiveId: string;
  hiveNumber: string; // Règle stricte: ne contient JAMAIS le miel de deux ruches
  apiaryName: string;
  ownerName: string;
  fillDate: string;
  grossWeightKg: number; // Poids brut
  tareWeightKg: number; // Tare
  netWeightKg: number; // Poids net calculé
  weighedMaterial: 'gateaux_de_miel' | 'miel_egoutte';
  destination: 'miellerie_centrale' | 'stockage_tampon' | 'egouttage_immediat';
  harvestOperator: string;
  observations?: string;
  
  // Étape 6 : Collecte et réception miellerie
  receptionStatus: 'au_rucher' | 'en_transit' | 'recu_miellerie' | 'en_egouttage' | 'termine';
  departureDate?: string;
  receptionDate?: string;
  receptionOperator?: string;
  washingDone?: boolean;
  disinfectionDone?: boolean;
  dryingDone?: boolean;
  receptionWeightKg?: number;
  weightDeltaKg?: number;

  // Historique des corrections
  corrections: HarvestCorrection[];
}

export interface HiveHarvestRecord {
  id: string;
  harvestNumber: string; // Ex: 'YAM-REC-000001'
  campaignId: string;
  campaignNumber: string;
  hiveId: string;
  hiveNumber: string;
  apiaryId: string;
  apiaryName: string;
  ownerId: string;
  ownerName: string;
  date: string;
  harvestOperator: string;
  subLotIds: string[]; // 1 ruche peut remplir 1 ou plusieurs seaux
  totalNetWeightKg: number;
  weatherConditions?: string;
  notes?: string;
  corrections: HarvestCorrection[];
}

export interface MiellerieTransformationStep {
  id: string;
  subLotId: string; // Relié à son sous-lot et sa ruche d'origine
  subLotNumber: string;
  hiveNumber: string;
  ownerName: string;
  apiaryName: string;
  campaignNumber: string;
  stepDate: string;
  startTime?: string;
  endTime?: string;
  operatorName: string;
  equipmentUsed: string; // Bacs inox, filtres, maturateur
  inputWeightKg: number; // Quantité entrée
  waxWeightKg: number; // Cire opercules
  foamWeightKg: number; // Mousse naturelle séparée
  outputHoneyKg: number; // Miel net égoutté
  discardedKg: number; // Déchets/écarts
  moisturePercent: number; // Ex: 17.2%
  purityGrade: 'Conforme Yamtãanu' | 'Premium Extra' | 'Standard';
  foamProcessDetails: string; // Procédé « égoutté avec mousse »
  status: 'en_cours' | 'termine';
  controlValidated: boolean;
  validatedBy?: string;
  validationDate?: string;
  notes?: string;
}

export interface BottledJar {
  jarCode: string; // Ex: 'YAM-BOC-2026-00001' (identifiant unique par bocal)
  lotNumber: string; // Ex: 'LOT-2026-06-BAM-01'
  subLotNumber: string;
  hiveNumber: string;
  apiaryName: string;
  village: string;
  ownerName: string;
  campaignNumber: string;
  harvestDate: string;
  bottlingDate: string;
  jarFormat: '250g' | '500g' | '1000g';
  netWeightG: number;
  moisturePercent: number;
  qrUrl: string;
  status: 'en_stock' | 'vendu' | 'degustation';
  notes?: string;
}


