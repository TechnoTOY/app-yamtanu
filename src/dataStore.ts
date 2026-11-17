import { 
  BambooHivePreform, 
  InstalledHive, 
  HiveInspection, 
  Harvest, 
  HarvestCampaign,
  ExtractionLog, 
  StoredHoneyTank, 
  BottlingBatch, 
  FinishedProduct, 
  SalesOrder, 
  SalesProforma,
  OrderPaymentRecord,
  DeliveryNote, 
  ClientReturn, 
  Expense, 
  JuiceBatch, 
  TeaBatch, 
  HotelRoom, 
  HotelBooking,
  ConferenceHall,
  ConferenceBooking,
  ClientAccountProfile,
  AuthorizedUser,
  PosSession,
  SyscohadaAccount,
  SyscohadaJournalEntry,
  CashReconciliationRecord,
  RawMaterialStockItem,
  StockMovement,
  BeekeeperOwner,
  Apiary,
  TrackedHive,
  HiveOccupationHistory,
  HiveJournalEvent,
  HarvestCampaignRecord,
  PhysicalBucket,
  BucketSubLot,
  HiveHarvestRecord,
  HarvestCorrection,
  MiellerieTransformationStep,
  BottledJar
} from './types';

// Helper to load or set default state in localStorage
function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  const stored = localStorage.getItem(`bamboumiel_${key}`);
  if (stored) {
    try {
      return JSON.parse(stored) as T;
    } catch (e) {
      console.error(`Failed to parse local storage key: ${key}`, e);
    }
  }
  return defaultValue;
}

function setLocalStorageItem<T>(key: string, value: T): void {
  localStorage.setItem(`bamboumiel_${key}`, JSON.stringify(value));
}

// Initial Data representing Benin contexts
export const defaultPreforms: BambooHivePreform[] = [
  { id: 'PREF-001', createdAt: '2026-05-10', bambooQtyUsed: 12, status: 'complete', artisanName: 'Sébastien Houessou', centerName: 'Atelier Central de Ouidah' },
  { id: 'PREF-002', createdAt: '2026-05-12', bambooQtyUsed: 14, status: 'complete', artisanName: 'Albertine Sagbo', centerName: 'Coopérative Féminine de Pahou' },
  { id: 'PREF-003', createdAt: '2026-05-15', bambooQtyUsed: 11, status: 'complete', artisanName: 'Jean Koundé', centerName: 'Atelier Nord Parakou' },
  { id: 'PREF-004', createdAt: '2026-06-01', bambooQtyUsed: 15, status: 'complete', artisanName: 'Sébastien Houessou', centerName: 'Atelier Central de Ouidah' },
  { id: 'PREF-005', createdAt: '2026-06-18', bambooQtyUsed: 13, status: 'en_cours', artisanName: 'Mamadou Diallo', centerName: 'Coopérative Féminine de Pahou' },
  { id: 'PREF-006', createdAt: '2026-06-21', bambooQtyUsed: 14, status: 'en_cours', artisanName: 'Alix Mbome', centerName: 'Atelier du Lac Grand-Popo' }
];

export const defaultCampaigns: HarvestCampaign[] = [
  { id: 'CAMP-001', name: 'Grande Miellée de Brousse 2026', startDate: '2026-04-01', endDate: '2026-06-30', status: 'active', description: 'Campagne principale de récolte de miel de bambou et fleurs sauvages.' },
  { id: 'CAMP-002', name: 'Petite Récolte d\'Automne 2025', startDate: '2025-09-01', endDate: '2025-10-31', status: 'terminee', description: 'Campagne secondaire après la saison des pluies.' }
];

export const defaultHives: InstalledHive[] = [
  { id: 'HIVE-001', preformId: 'PREF-001', code: 'R-BAM-01', locationName: 'Rucher de Parakou', gpsCoordinates: '9.3372, 2.6303', installedAt: '2026-05-15', status: 'actif', beekeeperName: 'Salamatou Gnon', commune: 'Parakou', village: 'Kpébié', hiveCount: 5, hiveNumbers: 'BAM-PK-01, BAM-PK-02, BAM-PK-03, BAM-PK-04, BAM-PK-05' },
  { id: 'HIVE-002', preformId: 'PREF-002', code: 'R-BAM-02', locationName: 'Foresterie Grand-Popo', gpsCoordinates: '6.2801, 1.8364', installedAt: '2026-05-18', status: 'actif', beekeeperName: 'Gaspard Codjia', commune: 'Grand-Popo', village: 'Avlo', hiveCount: 3, hiveNumbers: 'BAM-GP-01, BAM-GP-02, BAM-GP-03' },
  { id: 'HIVE-003', preformId: 'PREF-003', code: 'R-BAM-03', locationName: 'Rucher Clarière Sud', gpsCoordinates: '6.3703, 2.4411', installedAt: '2026-05-20', status: 'actif', beekeeperName: 'Félicienne Dossou', commune: 'Ouidah', village: 'Pahou', hiveCount: 4, hiveNumbers: 'BAM-OU-01, BAM-OU-02, BAM-OU-03, BAM-OU-04' },
  { id: 'HIVE-004', preformId: 'PREF-004', code: 'R-BAM-04', locationName: 'Rucher de Parakou', gpsCoordinates: '9.3375, 2.6310', installedAt: '2026-06-05', status: 'actif', beekeeperName: 'Salamatou Gnon', commune: 'Parakou', village: 'Kpébié', hiveCount: 2, hiveNumbers: 'BAM-PK-06, BAM-PK-07' }
];

export const defaultInspections: HiveInspection[] = [
  { id: 'INSP-001', hiveId: 'HIVE-001', date: '2026-05-28', populationHealth: 'excellent', queenPresent: true, parasitesDetected: false, humidityLevelPercent: 18.2, honeyEstimateKg: 8.5, notes: 'Forte activité, operculation commencée dans les hausses de bambou.', inspectedBy: 'Salamatou Gnon', broodPresence: 'oui', queenCells: false, activityLevel: 'tres_actif' },
  { id: 'INSP-002', hiveId: 'HIVE-002', date: '2026-05-30', populationHealth: 'normal', queenPresent: true, parasitesDetected: false, humidityLevelPercent: 19.1, honeyEstimateKg: 6.2, notes: 'Bonne dynamique, couvain sain.', inspectedBy: 'Gaspard Codjia', broodPresence: 'oui', queenCells: false, activityLevel: 'moyen' },
  { id: 'INSP-003', hiveId: 'HIVE-001', date: '2026-06-12', populationHealth: 'excellent', queenPresent: true, parasitesDetected: false, humidityLevelPercent: 17.5, honeyEstimateKg: 12.0, notes: 'Ruche prête à la récolte. Operculée à 90%.', inspectedBy: 'Salamatou Gnon', broodPresence: 'oui', queenCells: true, activityLevel: 'tres_actif' },
  { id: 'INSP-004', hiveId: 'HIVE-003', date: '2026-06-14', populationHealth: 'normal', queenPresent: true, parasitesDetected: false, humidityLevelPercent: 18.9, honeyEstimateKg: 5.0, notes: 'Ruche près des bungalows, activité récurrente qui ravit les touristes.', inspectedBy: 'Félicienne Dossou', broodPresence: 'oui', queenCells: false, activityLevel: 'moyen' }
];

export const defaultHarvests: Harvest[] = [
  { id: 'HARV-001', hiveId: 'HIVE-001', campaignId: 'CAMP-001', date: '2026-06-14', quantityKg: 14.2, moisturePercent: 17.2, honeyColor: 'ambre_clair', qualityGrade: 'AA', status: 'extrait', harvestedBy: 'Salamatou Gnon', weatherConditions: 'Ensoleillé', batchReference: 'LOT-HARV-BAM-01' },
  { id: 'HARV-002', hiveId: 'HIVE-002', campaignId: 'CAMP-001', date: '2026-06-15', quantityKg: 11.5, moisturePercent: 18.0, honeyColor: 'ambre', qualityGrade: 'A', status: 'extrait', harvestedBy: 'Gaspard Codjia', weatherConditions: 'Nuageux', batchReference: 'LOT-HARV-BAM-02' }
];

export const defaultBeekeepers: BeekeeperOwner[] = [
  {
    id: 'BKP-001',
    memberNumber: 'YAM-PRO-000001',
    fullName: 'Salamatou Gnon',
    phone: '+229 97 12 34 56',
    commune: 'Parakou',
    village: 'Kpébié',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    joinDate: '2024-02-15',
    status: 'actif',
    cinOrIdCard: 'CIP-BJ-19880214-9921',
    validationStatus: 'valide',
    validatedBy: 'DG SARKI Yantannou',
    validationDate: '2024-02-16',
    notes: 'Pionnière de l’apiculture moderne à Kpébié. Référente technique locale.'
  },
  {
    id: 'BKP-002',
    memberNumber: 'YAM-PRO-000002',
    fullName: 'Gaspard Codjia',
    phone: '+229 95 23 45 67',
    commune: 'Grand-Popo',
    village: 'Avlo',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    joinDate: '2024-05-10',
    status: 'actif',
    cinOrIdCard: 'CIP-BJ-19790620-3341',
    validationStatus: 'valide',
    validatedBy: 'DG SARKI Yantannou',
    validationDate: '2024-05-11',
    notes: 'Apiculteur expérimenté en zone côtière et mangrove.'
  },
  {
    id: 'BKP-003',
    memberNumber: 'YAM-PRO-000003',
    fullName: 'Félicienne Dossou',
    phone: '+229 96 34 56 78',
    commune: 'Ouidah',
    village: 'Pahou',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    joinDate: '2024-09-01',
    status: 'actif',
    cinOrIdCard: 'CIP-BJ-19851104-5582',
    validationStatus: 'valide',
    validatedBy: 'DG SARKI Yantannou',
    validationDate: '2024-09-02',
    notes: 'Responsable du groupement apicole féminin de Pahou.'
  },
  {
    id: 'BKP-004',
    memberNumber: 'YAM-PRO-000004',
    fullName: 'Bio Soumanou',
    phone: '+229 94 45 67 89',
    commune: 'Tchaourou',
    village: 'Kessounou',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    joinDate: '2025-01-20',
    status: 'actif',
    cinOrIdCard: 'CIP-BJ-19910312-8812',
    validationStatus: 'valide',
    validatedBy: 'DG SARKI Yantannou',
    validationDate: '2025-01-22',
    notes: 'Ruchers de savane arborée mellifère et anacardiers.'
  },
  {
    id: 'BKP-005',
    memberNumber: 'YAM-PRO-000005',
    fullName: 'Kpèdétin Ahissou',
    phone: '+229 97 56 78 90',
    commune: 'Abomey-Calavi',
    village: 'Zinvié',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    joinDate: '2025-04-12',
    status: 'actif',
    cinOrIdCard: 'CIP-BJ-19940825-4421',
    validationStatus: 'valide',
    validatedBy: 'DG SARKI Yantannou',
    validationDate: '2025-04-13',
    notes: 'Apicultrice formatrice en ruches écolo-artisanales en bambou.'
  }
];

export const defaultApiaries: Apiary[] = [
  {
    id: 'API-001',
    apiaryNumber: 'YAM-RCR-000001',
    name: 'Rucher Pilote de Kpébié',
    ownerId: 'BKP-001',
    ownerName: 'Salamatou Gnon',
    gpsCoordinates: '9.3372, 2.6303',
    village: 'Kpébié',
    commune: 'Parakou',
    installationDate: '2024-03-01',
    accessConditions: 'Piste carrossable 4x4 jusqu’au bosquet d’anacardiers, ombrage naturel permanent.',
    vegetationType: 'Savane arborée, néré, karité et anacardiers en floraison abondante.',
    status: 'actif',
    photos: []
  },
  {
    id: 'API-002',
    apiaryNumber: 'YAM-RCR-000002',
    name: 'Rucher Foresterie Avlo',
    ownerId: 'BKP-002',
    ownerName: 'Gaspard Codjia',
    gpsCoordinates: '6.2801, 1.8364',
    village: 'Avlo',
    commune: 'Grand-Popo',
    installationDate: '2024-06-15',
    accessConditions: 'Sentier piétonnier sécurisé à 150m de la lagune côtière. Accès aisé à pied.',
    vegetationType: 'Mangrove, palétuviers, fleurs sauvages littorales.',
    status: 'actif',
    photos: []
  },
  {
    id: 'API-003',
    apiaryNumber: 'YAM-RCR-000003',
    name: 'Rucher Clairière Sud Pahou',
    ownerId: 'BKP-003',
    ownerName: 'Félicienne Dossou',
    gpsCoordinates: '6.3703, 2.4411',
    village: 'Pahou',
    commune: 'Ouidah',
    installationDate: '2024-10-05',
    accessConditions: 'Voie latéritique praticable en toutes saisons par mototricycle et pick-up.',
    vegetationType: 'Bambouseraies, acacias mellifères et flore sous-bois.',
    status: 'actif',
    photos: []
  }
];

export const defaultTrackedHives: TrackedHive[] = [
  {
    id: 'THIVE-001',
    hiveNumber: 'YAM/26/001',
    apiaryId: 'API-001',
    apiaryNumber: 'YAM-RCR-000001',
    apiaryName: 'Rucher Pilote de Kpébié',
    ownerId: 'BKP-001',
    ownerName: 'Salamatou Gnon',
    category: 'ecolo_artisanale',
    installationDate: '2024-03-05',
    colonizationStatus: 'occupee',
    lastColonizedDate: '2024-04-10',
    colonyStrength: 'forte',
    status: 'active',
    history: [
      { id: 'H-01', date: '2024-03-05', event: 'installation', details: 'Installation sur support anti-fourmis à Kpébié', author: 'Salamatou Gnon' },
      { id: 'H-02', date: '2024-04-10', event: 'colonisation', details: 'Essaimage naturel capté avec succès', author: 'Salamatou Gnon' }
    ]
  },
  {
    id: 'THIVE-002',
    hiveNumber: 'YAM/26/002',
    apiaryId: 'API-001',
    apiaryNumber: 'YAM-RCR-000001',
    apiaryName: 'Rucher Pilote de Kpébié',
    ownerId: 'BKP-001',
    ownerName: 'Salamatou Gnon',
    category: 'ciment_barrettes_superieures',
    installationDate: '2024-03-05',
    colonizationStatus: 'recolonisee',
    lastColonizedDate: '2025-01-15',
    lastDepartureDate: '2024-11-20',
    colonyStrength: 'forte',
    status: 'active',
    history: [
      { id: 'H-03', date: '2024-03-05', event: 'installation', details: 'Ruche en ciment allégé à barrettes supérieures', author: 'Salamatou Gnon' },
      { id: 'H-04', date: '2024-04-18', event: 'colonisation', details: 'Premier essaim installé', author: 'Salamatou Gnon' },
      { id: 'H-05', date: '2024-11-20', event: 'depart', details: 'Départ essaim suite à sécheresse', author: 'Salamatou Gnon' },
      { id: 'H-06', date: '2025-01-15', event: 'recolonisation', details: 'Recolonisation vigoureuse spontanée', author: 'Salamatou Gnon' }
    ]
  },
  {
    id: 'THIVE-003',
    hiveNumber: 'YAM/26/003',
    apiaryId: 'API-001',
    apiaryNumber: 'YAM-RCR-000001',
    apiaryName: 'Rucher Pilote de Kpébié',
    ownerId: 'BKP-001',
    ownerName: 'Salamatou Gnon',
    category: 'ecolo_artisanale',
    installationDate: '2024-03-08',
    colonizationStatus: 'vide',
    lastDepartureDate: '2025-08-10',
    colonyStrength: 'faible',
    status: 'active',
    history: [
      { id: 'H-07', date: '2024-03-08', event: 'installation', details: 'Ruche tressée bambou installée', author: 'Salamatou Gnon' },
      { id: 'H-08', date: '2025-08-10', event: 'depart', details: 'Ruche nettoyée, en attente de nouvel essaim', author: 'Salamatou Gnon' }
    ]
  },
  {
    id: 'THIVE-004',
    hiveNumber: 'YAM/26/004',
    apiaryId: 'API-002',
    apiaryNumber: 'YAM-RCR-000002',
    apiaryName: 'Rucher Foresterie Avlo',
    ownerId: 'BKP-002',
    ownerName: 'Gaspard Codjia',
    category: 'ecolo_artisanale',
    installationDate: '2024-06-20',
    colonizationStatus: 'occupee',
    lastColonizedDate: '2024-07-15',
    colonyStrength: 'forte',
    status: 'active',
    history: [
      { id: 'H-09', date: '2024-06-20', event: 'installation', details: 'Installation sous couvert ombragé', author: 'Gaspard Codjia' },
      { id: 'H-10', date: '2024-07-15', event: 'colonisation', details: 'Colonie très active', author: 'Gaspard Codjia' }
    ]
  },
  {
    id: 'THIVE-005',
    hiveNumber: 'YAM/26/005',
    apiaryId: 'API-003',
    apiaryNumber: 'YAM-RCR-000003',
    apiaryName: 'Rucher Clairière Sud Pahou',
    ownerId: 'BKP-003',
    ownerName: 'Félicienne Dossou',
    category: 'ecolo_artisanale',
    installationDate: '2024-10-10',
    colonizationStatus: 'occupee',
    lastColonizedDate: '2024-11-05',
    colonyStrength: 'moyenne',
    status: 'active',
    history: [
      { id: 'H-11', date: '2024-10-10', event: 'installation', details: 'Installation en bordure de bambouseraie', author: 'Félicienne Dossou' },
      { id: 'H-12', date: '2024-11-05', event: 'colonisation', details: 'Arrivée d’un essaim primaire', author: 'Félicienne Dossou' }
    ]
  }
];

export const defaultJournalEvents: HiveJournalEvent[] = [
  {
    id: 'JEV-001',
    hiveId: 'THIVE-001',
    hiveNumber: 'YAM/26/001',
    apiaryId: 'API-001',
    apiaryName: 'Rucher Pilote de Kpébié',
    date: '2026-05-15',
    eventType: 'visite',
    colonyStatus: 'occupee',
    colonyHealth: 'vigoureuse',
    queenPresent: true,
    broodStatus: 'abondant',
    parasitesOrProblems: 'Aucun parasite décelé. Planche d’envol très active.',
    actionsDone: 'Contrôle des barrettes, nettoyage du plancher grillagé, vérification des coupelles anti-fourmis.',
    operatorName: 'Salamatou Gnon',
    nextAction: 'Pose de hausse d’égouttage avant miellée',
    nextActionDate: '2026-05-30',
    notes: 'Excellente réserve de pollen et miel operculé naissant.'
  },
  {
    id: 'JEV-002',
    hiveId: 'THIVE-002',
    hiveNumber: 'YAM/26/002',
    apiaryId: 'API-001',
    apiaryName: 'Rucher Pilote de Kpébié',
    date: '2026-05-20',
    eventType: 'intervention_sanitaire',
    colonyStatus: 'occupee',
    colonyHealth: 'normale',
    queenPresent: true,
    broodStatus: 'moyen',
    parasitesOrProblems: 'Quelques débuts de fausse teigne sur une barrette latérale vide.',
    actionsDone: 'Retrait et désinfection de la barrette, application de cendre de bois au sol, resserrage de la colonie.',
    operatorName: 'Salamatou Gnon',
    nextAction: 'Recontrôle de salubrité sous 10 jours',
    nextActionDate: '2026-06-01',
    notes: 'Colonie stabilisée rapidement.'
  },
  {
    id: 'JEV-003',
    hiveId: 'THIVE-004',
    hiveNumber: 'YAM/26/004',
    apiaryId: 'API-002',
    apiaryName: 'Rucher Foresterie Avlo',
    date: '2026-06-02',
    eventType: 'visite',
    colonyStatus: 'occupee',
    colonyHealth: 'vigoureuse',
    queenPresent: true,
    broodStatus: 'abondant',
    parasitesOrProblems: 'Aucun. Miel operculé à 85%.',
    actionsDone: 'Évaluation des réserves de miel mûr pour la récolte.',
    operatorName: 'Gaspard Codjia',
    nextAction: 'Récolte programmée pour la campagne 1',
    nextActionDate: '2026-06-15',
    notes: 'Très forte odeur florale de mangrove.'
  }
];

export const defaultTraceCampaigns: HarvestCampaignRecord[] = [
  {
    id: 'TCAM-001',
    campaignNumber: 'YAM-CAM-2026-01',
    year: 2026,
    campaignType: 1,
    name: 'Campagne Principale de Printemps 2026',
    plannedStartDate: '2026-05-01',
    plannedEndDate: '2026-06-30',
    actualStartDate: '2026-05-10',
    targetedApiaries: ['API-001', 'API-002', 'API-003'],
    responsibles: 'DG SARKI Yantannou & Équipe Technique Yamtãanu',
    status: 'ouverte',
    totalTargetKg: 650,
    totalCollectedKg: 36.5,
    notes: 'Grande miellée annuelle après floraison majeure des anacardiers et karités.'
  },
  {
    id: 'TCAM-002',
    campaignNumber: 'YAM-CAM-2025-02',
    year: 2025,
    campaignType: 2,
    name: 'Petite Campagne d’Automne 2025',
    plannedStartDate: '2025-10-01',
    plannedEndDate: '2025-11-30',
    actualStartDate: '2025-10-05',
    actualEndDate: '2025-11-28',
    targetedApiaries: ['API-001', 'API-002'],
    responsibles: 'Direction Technique Yamtãanu',
    status: 'cloturee',
    totalTargetKg: 350,
    totalCollectedKg: 382.4,
    notes: 'Campagne post-hivernage clôturée avec d’excellents résultats sanitaires.'
  }
];

export const defaultPhysicalBuckets: PhysicalBucket[] = [
  { bucketNumber: 'YAM-SEA-000001', tareWeightKg: 1.25, material: 'plastique_alimentaire_pehd', capacityLiters: 20, status: 'rempli', currentSubLotId: 'SLOT-001', totalUsesCount: 4 },
  { bucketNumber: 'YAM-SEA-000002', tareWeightKg: 1.25, material: 'plastique_alimentaire_pehd', capacityLiters: 20, status: 'rempli', currentSubLotId: 'SLOT-002', totalUsesCount: 3 },
  { bucketNumber: 'YAM-SEA-000003', tareWeightKg: 1.20, material: 'plastique_alimentaire_pehd', capacityLiters: 20, status: 'rempli', currentSubLotId: 'SLOT-003', totalUsesCount: 5 },
  { bucketNumber: 'YAM-SEA-000004', tareWeightKg: 1.22, material: 'plastique_alimentaire_pehd', capacityLiters: 20, status: 'disponible', totalUsesCount: 2 },
  { bucketNumber: 'YAM-SEA-000005', tareWeightKg: 1.30, material: 'plastique_alimentaire_pehd', capacityLiters: 20, status: 'disponible', totalUsesCount: 6 },
  { bucketNumber: 'YAM-SEA-000006', tareWeightKg: 1.25, material: 'plastique_alimentaire_pehd', capacityLiters: 20, status: 'disponible', totalUsesCount: 1 }
];

export const defaultBucketSubLots: BucketSubLot[] = [
  {
    id: 'SLOT-001',
    subLotNumber: 'YAM-SLOT-000001',
    physicalBucketNumber: 'YAM-SEA-000001',
    harvestId: 'REC-001',
    campaignId: 'TCAM-001',
    campaignNumber: 'YAM-CAM-2026-01',
    hiveId: 'THIVE-001',
    hiveNumber: 'YAM/26/001',
    apiaryName: 'Rucher Pilote de Kpébié',
    ownerName: 'Salamatou Gnon',
    fillDate: '2026-06-12',
    grossWeightKg: 16.05,
    tareWeightKg: 1.25,
    netWeightKg: 14.80,
    weighedMaterial: 'gateaux_de_miel',
    destination: 'miellerie_centrale',
    harvestOperator: 'Salamatou Gnon & Jean Orou',
    observations: 'Rayons très mûrs operculés à 95%, miel doré d’anacardier.',
    receptionStatus: 'recu_miellerie',
    departureDate: '2026-06-12',
    receptionDate: '2026-06-12',
    receptionOperator: 'Jean Orou (Resp. Miellerie)',
    washingDone: true,
    disinfectionDone: true,
    dryingDone: true,
    receptionWeightKg: 16.05,
    weightDeltaKg: 0,
    corrections: []
  },
  {
    id: 'SLOT-002',
    subLotNumber: 'YAM-SLOT-000002',
    physicalBucketNumber: 'YAM-SEA-000002',
    harvestId: 'REC-001',
    campaignId: 'TCAM-001',
    campaignNumber: 'YAM-CAM-2026-01',
    hiveId: 'THIVE-001',
    hiveNumber: 'YAM/26/001',
    apiaryName: 'Rucher Pilote de Kpébié',
    ownerName: 'Salamatou Gnon',
    fillDate: '2026-06-12',
    grossWeightKg: 9.45,
    tareWeightKg: 1.25,
    netWeightKg: 8.20,
    weighedMaterial: 'gateaux_de_miel',
    destination: 'miellerie_centrale',
    harvestOperator: 'Salamatou Gnon & Jean Orou',
    observations: 'Deuxième seau issu de la même ruche YAM/26/001. Séparation stricte maintenue.',
    receptionStatus: 'recu_miellerie',
    departureDate: '2026-06-12',
    receptionDate: '2026-06-12',
    receptionOperator: 'Jean Orou (Resp. Miellerie)',
    washingDone: true,
    disinfectionDone: true,
    dryingDone: true,
    receptionWeightKg: 9.45,
    weightDeltaKg: 0,
    corrections: []
  },
  {
    id: 'SLOT-003',
    subLotNumber: 'YAM-SLOT-000003',
    physicalBucketNumber: 'YAM-SEA-000003',
    harvestId: 'REC-002',
    campaignId: 'TCAM-001',
    campaignNumber: 'YAM-CAM-2026-01',
    hiveId: 'THIVE-004',
    hiveNumber: 'YAM/26/004',
    apiaryName: 'Rucher Foresterie Avlo',
    ownerName: 'Gaspard Codjia',
    fillDate: '2026-06-15',
    grossWeightKg: 14.70,
    tareWeightKg: 1.20,
    netWeightKg: 13.50,
    weighedMaterial: 'gateaux_de_miel',
    destination: 'miellerie_centrale',
    harvestOperator: 'Gaspard Codjia',
    observations: 'Miel de mangrove très aromatique, densité exceptionnelle.',
    receptionStatus: 'recu_miellerie',
    departureDate: '2026-06-15',
    receptionDate: '2026-06-16',
    receptionOperator: 'Jean Orou (Resp. Miellerie)',
    washingDone: true,
    disinfectionDone: true,
    dryingDone: true,
    receptionWeightKg: 14.70,
    weightDeltaKg: 0,
    corrections: []
  }
];

export const defaultHiveHarvests: HiveHarvestRecord[] = [
  {
    id: 'REC-001',
    harvestNumber: 'YAM-REC-000001',
    campaignId: 'TCAM-001',
    campaignNumber: 'YAM-CAM-2026-01',
    hiveId: 'THIVE-001',
    hiveNumber: 'YAM/26/001',
    apiaryId: 'API-001',
    apiaryName: 'Rucher Pilote de Kpébié',
    ownerId: 'BKP-001',
    ownerName: 'Salamatou Gnon',
    date: '2026-06-12',
    harvestOperator: 'Salamatou Gnon & Jean Orou',
    subLotIds: ['SLOT-001', 'SLOT-002'],
    totalNetWeightKg: 23.00,
    weatherConditions: 'Temps chaud, ensoleillé, hygrométrie faible',
    notes: 'Récolte complète de 8 barrettes operculées. Deux seaux remplis sans aucun mélange.',
    corrections: []
  },
  {
    id: 'REC-002',
    harvestNumber: 'YAM-REC-000002',
    campaignId: 'TCAM-001',
    campaignNumber: 'YAM-CAM-2026-01',
    hiveId: 'THIVE-004',
    hiveNumber: 'YAM/26/004',
    apiaryId: 'API-002',
    apiaryName: 'Rucher Foresterie Avlo',
    ownerId: 'BKP-002',
    ownerName: 'Gaspard Codjia',
    date: '2026-06-15',
    harvestOperator: 'Gaspard Codjia',
    subLotIds: ['SLOT-003'],
    totalNetWeightKg: 13.50,
    weatherConditions: 'Brise littorale ensoleillée',
    notes: 'Miel ambré clair caractéristique de l’Avlo.',
    corrections: []
  }
];

export const defaultTransformationSteps: MiellerieTransformationStep[] = [
  {
    id: 'TRF-001',
    subLotId: 'SLOT-001',
    subLotNumber: 'YAM-SLOT-000001',
    hiveNumber: 'YAM/26/001',
    ownerName: 'Salamatou Gnon',
    apiaryName: 'Rucher Pilote de Kpébié',
    campaignNumber: 'YAM-CAM-2026-01',
    stepDate: '2026-06-13',
    startTime: '08:30',
    endTime: '12:00',
    operatorName: 'Jean Orou (Resp. Miellerie)',
    equipmentUsed: 'Couteau à désoperculer inox, égouttoir inox double tamis Yamtãanu, maturateur décantation',
    inputWeightKg: 14.80,
    waxWeightKg: 1.20,
    foamWeightKg: 0.45,
    outputHoneyKg: 13.15,
    discardedKg: 0.00,
    moisturePercent: 17.2,
    purityGrade: 'Conforme Yamtãanu',
    foamProcessDetails: 'Égouttage gravitaire lent à température ambiante avec formation naturelle de mousse superficielle écumée à la louche inox.',
    status: 'termine',
    controlValidated: true,
    validatedBy: 'DG SARKI Yantannou',
    validationDate: '2026-06-14',
    notes: 'Humidité parfaite à 17.2% (<18% exigé). Mousse préservée pour valorisation artisanale.'
  }
];

export const defaultBottledJars: BottledJar[] = [
  {
    jarCode: 'YAM-BOC-2026-00001',
    lotNumber: 'LOT-2026-06-BAM-01',
    subLotNumber: 'YAM-SLOT-000001',
    hiveNumber: 'YAM/26/001',
    apiaryName: 'Rucher Pilote de Kpébié',
    village: 'Kpébié (Parakou)',
    ownerName: 'Salamatou Gnon',
    campaignNumber: 'YAM-CAM-2026-01',
    harvestDate: '2026-06-12',
    bottlingDate: '2026-06-15',
    jarFormat: '500g',
    netWeightG: 500,
    moisturePercent: 17.2,
    qrUrl: '',
    status: 'en_stock',
    notes: 'Bocal verre hexagonal hermétique scellé'
  },
  {
    jarCode: 'YAM-BOC-2026-00002',
    lotNumber: 'LOT-2026-06-BAM-01',
    subLotNumber: 'YAM-SLOT-000001',
    hiveNumber: 'YAM/26/001',
    apiaryName: 'Rucher Pilote de Kpébié',
    village: 'Kpébié (Parakou)',
    ownerName: 'Salamatou Gnon',
    campaignNumber: 'YAM-CAM-2026-01',
    harvestDate: '2026-06-12',
    bottlingDate: '2026-06-15',
    jarFormat: '500g',
    netWeightG: 500,
    moisturePercent: 17.2,
    qrUrl: '',
    status: 'en_stock',
    notes: 'Bocal verre hexagonal hermétique scellé'
  },
  {
    jarCode: 'YAM-BOC-2026-00003',
    lotNumber: 'LOT-2026-06-BAM-01',
    subLotNumber: 'YAM-SLOT-000001',
    hiveNumber: 'YAM/26/001',
    apiaryName: 'Rucher Pilote de Kpébié',
    village: 'Kpébié (Parakou)',
    ownerName: 'Salamatou Gnon',
    campaignNumber: 'YAM-CAM-2026-01',
    harvestDate: '2026-06-12',
    bottlingDate: '2026-06-15',
    jarFormat: '250g',
    netWeightG: 250,
    moisturePercent: 17.2,
    qrUrl: '',
    status: 'en_stock',
    notes: 'Format dégustation 250g'
  }
];

export const defaultTanks: StoredHoneyTank[] = [
  { id: 'TANK-01', name: 'Cuve Égouttage Primaire (Inox A)', capacityKg: 200, currentWeightKg: 135.5 },
  { id: 'TANK-02', name: 'Cuve Décantation Bio (Boutique)', capacityKg: 100, currentWeightKg: 42.0 },
  { id: 'TANK-03', name: 'Cuve de Réserve (Miel de Forêt)', capacityKg: 300, currentWeightKg: 0 }
];

export const defaultExtractions: ExtractionLog[] = [
  { id: 'EXTR-001', harvestIds: ['HARV-001', 'HARV-002'], extractionDate: '2026-06-16', extractedWeightKg: 23.8, wasteWeightKg: 1.9, tankId: 'TANK-01', method: 'degouttage' }
];

export const defaultBottling: BottlingBatch[] = [
  { id: 'LOT-001', tankId: 'TANK-01', bottlingDate: '2026-06-18', jarSizeG: 500, quantity: 40, batchNumber: 'LOT-20260618-500G-01', expirationDate: '2028-06-18', labelTemplate: 'Miel de Forêt de Bambou - Brut Égoutté - Yamtaanu' }
];

export const defaultProducts: FinishedProduct[] = [
  // Miel
  { id: 'PROD-MIEL-250', name: 'Miel de Forêt (Pot 250g)', category: 'miel', variant: '250g - Brut Égoutté', price: 3500, stock: 75, batchNumber: 'LOT-20260618-500G-01' },
  { id: 'PROD-MIEL-500', name: 'Miel de Forêt (Pot 500g)', category: 'miel', variant: '500g - Brut Égoutté', price: 6000, stock: 40, batchNumber: 'LOT-20260618-500G-01' },
  { id: 'PROD-MIEL-1000', name: 'Miel de Forêt (Pot 1kg)', category: 'miel', variant: '1kg - Brut Égoutté', price: 10000, stock: 15, batchNumber: 'LOT-20260618-500G-01' },
  // Jus
  { id: 'PROD-JUS-GIA-1', name: 'Jus Gingembre-Ananas Bio (1L)', category: 'jus', variant: '1L - Frais', price: 1500, stock: 60 },
  { id: 'PROD-JUS-GIA-250', name: 'Jus Gingembre-Ananas Extrapress (250ml)', category: 'jus', variant: '250ml - Snacking', price: 500, stock: 120 },
  { id: 'PROD-JUS-HIB-1', name: 'Nectar de Hibiscus-Baobab (1L)', category: 'jus', variant: '1L - Premium', price: 1800, stock: 45 },
  // Thés
  { id: 'PROD-THE-MOR', name: 'Thé Vert Moringa (Etui 50g)', category: 'the', variant: 'Infusettes 50g', price: 2500, stock: 90 },
  { id: 'PROD-THE-CIT', name: 'Tisane Citronnelle Sauvage', category: 'the', variant: 'Vrac 50g', price: 2000, stock: 110 },
  // Conférences & Location Salles
  { id: 'PROD-CONF-FORF-J', name: 'Location Grande Salle Polyvalente (Journée)', category: 'conference', variant: '1 Journée - 150 Places', price: 120000, stock: 30 },
  { id: 'PROD-CONF-FORF-DJ', name: 'Location Espace Séminaire Bio (Demi-Journée)', category: 'conference', variant: 'Demi-Journée - 50 Places', price: 40000, stock: 30 },
  { id: 'PROD-CONF-PAUSE-CAF', name: 'Forfait Pause-Café Bio & Miels (par pers.)', category: 'conference', variant: 'Miel, thé, jus & viennoiseries', price: 2500, stock: 200 },
  { id: 'PROD-CONF-SONO-PRO', name: 'Pack Vidéoprojection HD & Sonorisation HF', category: 'conference', variant: 'Vidéoprojecteur 4K + 4 micros', price: 25000, stock: 10 }
];

export const defaultProformas: SalesProforma[] = [
  {
    id: 'PRO-2026-001',
    date: '2026-06-20',
    validUntil: '2026-07-20',
    clientName: 'Casino Supermarchés Bénin',
    clientPhone: '+229 21 31 12 12',
    clientEmail: 'achat@casino-benin.bj',
    clientAddress: 'Bvd de la Marina, Cotonou',
    clientIfu: '3201910293841',
    items: [
      { productId: 'PROD-MIEL-500', variantName: '500g - Brut Égoutté', quantity: 50, price: 5500, discountPercent: 8 },
      { productId: 'PROD-JUS-GIA-1', variantName: '1L - Frais', quantity: 60, price: 1400, discountPercent: 5 },
      { productId: 'PROD-THE-MOR', variantName: 'Infusettes 50g', quantity: 40, price: 2300, discountPercent: 8 }
    ],
    totalAmount: 429300,
    discountPercent: 7,
    discountAmount: 32300,
    paymentTerms: 'credit_30j',
    deliveryTerms: 'Livraison franco de port à Cotonou par transporteur.',
    status: 'envoye',
    notes: 'Tarif préférentiel négocié pour référencement rayon bio.',
    createdBy: 'Direction Commerciale Yamtaanu',
    createdAt: '2026-06-20T10:00:00.000Z'
  },
  {
    id: 'PRO-2026-002',
    date: '2026-06-22',
    validUntil: '2026-07-07',
    clientName: 'Grand Bazar Abomey-Calavi',
    clientPhone: '+229 64 88 55 22',
    clientEmail: 'contact@bazarcalavi.bj',
    clientAddress: 'Carrefour IITA, Abomey-Calavi',
    clientIfu: '2201809182390',
    items: [
      { productId: 'PROD-MIEL-250', variantName: '250g - Brut Égoutté', quantity: 24, price: 3500 },
      { productId: 'PROD-THE-CIT', variantName: 'Vrac 50g', quantity: 30, price: 2000 }
    ],
    totalAmount: 144000,
    paymentTerms: 'credit_15j',
    deliveryTerms: 'Acheminement par bus régional avec retrait gare Calavi.',
    status: 'brouillon',
    notes: 'Devis pour réapprovisionnement boutique vacances.',
    createdBy: 'Agent Commercial',
    createdAt: '2026-06-22T08:30:00.000Z'
  }
];

export const defaultOrders: SalesOrder[] = [
  { 
    id: 'CMD-101', 
    date: '2026-06-19', 
    dueDate: '2026-06-19',
    clientName: 'Boutique Cotonou Premium', 
    clientPhone: '+229 97 00 11 22',
    clientAddress: 'Bvd St Michel, Haie Vive, Cotonou',
    clientIfu: '3201800998811',
    items: [
      { productId: 'PROD-MIEL-500', variantName: '500g - Brut Égoutté', quantity: 15, price: 6000 }, 
      { productId: 'PROD-THE-MOR', variantName: 'Infusettes 50g', quantity: 10, price: 2500 }
    ], 
    totalAmount: 115000, 
    paidAmount: 115000, 
    remainingBalance: 0,
    isCreditSale: false,
    paymentStatus: 'paye',
    status: 'livre', 
    paymentMethod: 'virement',
    source: 'facturation_b2b',
    deliveryNoteCreated: true,
    payments: [
      {
        id: 'PAY-101-1',
        orderId: 'CMD-101',
        date: '2026-06-19',
        amount: 115000,
        paymentMethod: 'virement',
        referenceDoc: 'VIR-BOA-9921',
        receivedBy: 'Comptable Principal',
        notes: 'Paiement intégral reçu par virement bancaire'
      }
    ]
  },
  { 
    id: 'CMD-102', 
    date: '2026-06-20', 
    dueDate: '2026-07-05',
    clientName: 'Hôtel de la Plage Ouidah', 
    clientPhone: '+229 95 33 44 55',
    clientAddress: 'Route des Pêches, Ouidah',
    clientIfu: '1201700445522',
    items: [
      { productId: 'PROD-JUS-GIA-1', variantName: '1L - Frais', quantity: 20, price: 1500 }, 
      { productId: 'PROD-MIEL-250', variantName: '250g - Brut Égoutté', quantity: 30, price: 3500 }
    ], 
    totalAmount: 135000, 
    paidAmount: 65000, 
    remainingBalance: 70000,
    isCreditSale: true,
    paymentStatus: 'partiel',
    status: 'en_attente', 
    paymentMethod: 'credit',
    source: 'facturation_b2b',
    deliveryNoteCreated: false,
    payments: [
      {
        id: 'PAY-102-1',
        orderId: 'CMD-102',
        date: '2026-06-20',
        amount: 65000,
        paymentMethod: 'momo',
        momoProvider: 'MTN MoMo',
        momoRef: 'MOMO-882910',
        receivedBy: 'Caisse Yamtaanu',
        notes: 'Acompte versé à la commande via MTN Mobile Money'
      }
    ]
  },
  {
    id: 'CMD-103',
    date: '2026-06-21',
    dueDate: '2026-07-06',
    clientName: 'Supermarché du Pont Parakou',
    clientPhone: '+229 90 22 88 99',
    clientAddress: 'Avenue du Pont, Parakou',
    clientIfu: '4201900112233',
    items: [
      { productId: 'PROD-MIEL-500', variantName: '500g - Brut Égoutté', quantity: 20, price: 6000 },
      { productId: 'PROD-JUS-HIB-1', variantName: '1L - Premium', quantity: 25, price: 1800 }
    ],
    totalAmount: 165000,
    paidAmount: 0,
    remainingBalance: 165000,
    isCreditSale: true,
    paymentStatus: 'a_credit',
    status: 'en_attente',
    paymentMethod: 'credit',
    source: 'facturation_b2b',
    deliveryNoteCreated: false,
    notes: 'Livraison prévue lundi, règlement accordé à 15 jours.'
  }
];

export const defaultClientProfiles: ClientAccountProfile[] = [
  { 
    id: 'CLI-001',
    clientName: 'Boutique Cotonou Premium', 
    companyName: 'Boutique Cotonou Premium SARL',
    ifuNumber: '3201800998811',
    phone: '+229 97 00 11 22', 
    whatsapp: '+229 97 00 11 22',
    email: 'contact@cotonoupremium.bj', 
    address: 'Bvd St Michel, Haie Vive', 
    city: 'Cotonou',
    creditLimit: 500000, 
    paymentTermDays: 30,
    category: 'boutique',
    status: 'fidele',
    notes: 'Boutique de luxe à la Haie Vive, paiements réguliers par virement.' 
  },
  { 
    id: 'CLI-002',
    clientName: 'Hôtel de la Plage Ouidah', 
    companyName: 'Complexe Hôtelier de la Plage SA',
    ifuNumber: '1201700445522',
    phone: '+229 95 33 44 55', 
    whatsapp: '+229 95 33 44 55',
    email: 'reception@hotelplageouidah.bj', 
    address: 'Route des Pêches', 
    city: 'Ouidah',
    creditLimit: 800000, 
    paymentTermDays: 15,
    category: 'hotel',
    status: 'actif',
    notes: 'Grand hôtel au bord de plage à Ouidah, commande régulière de miels frais & jus.' 
  },
  { 
    id: 'CLI-003',
    clientName: 'Supermarché du Pont Parakou', 
    companyName: 'Supermarché du Pont ETS',
    ifuNumber: '4201900112233',
    phone: '+229 90 22 88 99', 
    whatsapp: '+229 90 22 88 99',
    email: 'pontparakou@superbenin.com', 
    address: 'Avenue du Pont', 
    city: 'Parakou',
    creditLimit: 400000, 
    paymentTermDays: 15,
    category: 'supermarche',
    status: 'actif',
    notes: 'Supermarché partenaire du Nord Bénin, règlements à J+15.' 
  },
  { 
    id: 'CLI-004',
    clientName: 'Casino Supermarchés Bénin', 
    companyName: 'Groupe Distribution Bénin SAS',
    ifuNumber: '3201910293841',
    phone: '+229 21 31 12 12', 
    email: 'achat@casino-benin.bj', 
    address: 'Bvd de la Marina', 
    city: 'Cotonou',
    creditLimit: 1500000, 
    paymentTermDays: 30,
    category: 'supermarche',
    status: 'prospect',
    notes: 'Grande centrale d\'achat, règlements généralement à J+30 après livraison.' 
  },
  { 
    id: 'CLI-005',
    clientName: 'Grand Bazar Abomey-Calavi', 
    companyName: 'Grand Bazar Calavi SARL',
    ifuNumber: '2201809182390',
    phone: '+229 64 88 55 22', 
    whatsapp: '+229 64 88 55 22',
    email: 'contact@bazarcalavi.bj', 
    address: 'Carrefour IITA', 
    city: 'Abomey-Calavi',
    creditLimit: 300000, 
    paymentTermDays: 15,
    category: 'boutique',
    status: 'actif',
    notes: 'Épicerie fine à Calavi, forte demande sur les thés glacés.' 
  }
];

export const defaultDeliveryNotes: DeliveryNote[] = [
  { id: 'BL-101', orderId: 'CMD-101', date: '2026-06-20', recipientName: 'Boutique Cotonou Premium', recipientAddress: 'Haie Vive, Cotonou, Bénin', carrierName: 'Benin Transport Express', trackingNumber: 'TRK-981822', status: 'livre' }
];

export const defaultRawMaterials: RawMaterialStockItem[] = [
  // Secteur Miel & Apiculture
  { id: 'INT-MIEL-001', name: 'Tiges de Bambou de brousse (Vannerie ruches)', category: 'matiere_premiere', sector: 'miel', unit: 'tiges', currentStock: 180, minAlertStock: 40, unitCost: 300, supplier: 'Coopérative Forestière Komiguéa', location: 'Hangar Vannerie', lastRestockedDate: '2026-05-10' },
  { id: 'INT-MIEL-002', name: 'Pots en verre 500g hexagonaux', category: 'emballage', sector: 'miel', unit: 'pots', currentStock: 240, minAlertStock: 50, unitCost: 450, supplier: 'Verrerie d\'Afrique Cotonou', location: 'Magasin Conditionnement', lastRestockedDate: '2026-06-01' },
  { id: 'INT-MIEL-003', name: 'Pots en verre 250g avec couvercle', category: 'emballage', sector: 'miel', unit: 'pots', currentStock: 320, minAlertStock: 80, unitCost: 350, supplier: 'Verrerie d\'Afrique Cotonou', location: 'Magasin Conditionnement', lastRestockedDate: '2026-06-01' },
  { id: 'INT-MIEL-004', name: 'Pots en verre 1kg pour miel brut', category: 'emballage', sector: 'miel', unit: 'pots', currentStock: 95, minAlertStock: 30, unitCost: 650, supplier: 'Verrerie d\'Afrique Cotonou', location: 'Magasin Conditionnement', lastRestockedDate: '2026-05-20' },
  { id: 'INT-MIEL-005', name: 'Feuilles de cire d\'abeille gaufrée', category: 'equipement_ruche', sector: 'miel', unit: 'feuilles', currentStock: 65, minAlertStock: 20, unitCost: 800, supplier: 'Atelier Apicole Komiguéa', location: 'Réserve Apiculture', lastRestockedDate: '2026-05-15' },
  { id: 'INT-MIEL-006', name: 'Capsules dorées & scellés d\'inviolabilité QR', category: 'emballage', sector: 'miel', unit: 'unités', currentStock: 600, minAlertStock: 100, unitCost: 60, supplier: 'Conditionnement Ouest', location: 'Magasin Conditionnement', lastRestockedDate: '2026-06-05' },

  // Secteur Jus & Nectars
  { id: 'INT-JUS-001', name: 'Bouteilles en verre 1L sérigraphiées', category: 'emballage', sector: 'jus', unit: 'bouteilles', currentStock: 150, minAlertStock: 40, unitCost: 350, supplier: 'Verrerie du Golfe', location: 'Atelier Jus', lastRestockedDate: '2026-06-08' },
  { id: 'INT-JUS-002', name: 'Bouteilles en verre 250ml Snacking', category: 'emballage', sector: 'jus', unit: 'bouteilles', currentStock: 280, minAlertStock: 60, unitCost: 180, supplier: 'Verrerie du Golfe', location: 'Atelier Jus', lastRestockedDate: '2026-06-08' },
  { id: 'INT-JUS-003', name: 'Ananas pain de sucre frais bio d\'Allada', category: 'matiere_premiere', sector: 'jus', unit: 'kg', currentStock: 85, minAlertStock: 30, unitCost: 400, supplier: 'Producteurs Allada', location: 'Chambre Froide', lastRestockedDate: '2026-06-19' },
  { id: 'INT-JUS-004', name: 'Gingembre frais lavé & trié', category: 'matiere_premiere', sector: 'jus', unit: 'kg', currentStock: 45, minAlertStock: 15, unitCost: 900, supplier: 'Ferme Bio Dassa', location: 'Réserve Fruits', lastRestockedDate: '2026-06-18' },
  { id: 'INT-JUS-005', name: 'Fleurs d\'Hibiscus séchées (Bissap rouge)', category: 'matiere_premiere', sector: 'jus', unit: 'kg', currentStock: 35, minAlertStock: 10, unitCost: 1500, supplier: 'Coopérative Parakou', location: 'Atelier Jus', lastRestockedDate: '2026-06-15' },

  // Secteur Thés & Infusions
  { id: 'INT-THE-001', name: 'Sachets Kraft biodégradables 50g à fenêtre', category: 'emballage', sector: 'the', unit: 'sachets', currentStock: 350, minAlertStock: 80, unitCost: 120, supplier: 'EcoPack Bénin', location: 'Atelier Thés', lastRestockedDate: '2026-06-02' },
  { id: 'INT-THE-002', name: 'Feuilles de Moringa séchées & broyées', category: 'matiere_premiere', sector: 'the', unit: 'kg', currentStock: 28, minAlertStock: 10, unitCost: 3000, supplier: 'Ferme Agro-écologique', location: 'Atelier Thés', lastRestockedDate: '2026-06-03' },
  { id: 'INT-THE-003', name: 'Citronnelle sauvage coupée & déshydratée', category: 'matiere_premiere', sector: 'the', unit: 'kg', currentStock: 20, minAlertStock: 5, unitCost: 2000, supplier: 'Récolte Forêt Komiguéa', location: 'Atelier Thés', lastRestockedDate: '2026-06-12' },

  // Secteur Éco-Lodge & Hôtellerie
  { id: 'INT-HOT-001', name: 'Savons artisanaux au miel & beurre de karité', category: 'consommable', sector: 'hotel', unit: 'unités', currentStock: 140, minAlertStock: 30, unitCost: 400, supplier: 'Savonnerie Artisanale Komiguéa', location: 'Lingerie Hôtel', lastRestockedDate: '2026-06-10' },
  { id: 'INT-HOT-002', name: 'Sets de draps & taies en coton bio béninois', category: 'fourniture', sector: 'hotel', unit: 'sets', currentStock: 25, minAlertStock: 10, unitCost: 12000, supplier: 'Textiles du Bénin', location: 'Lingerie Hôtel', lastRestockedDate: '2026-05-01' },
  { id: 'INT-HOT-003', name: 'Produits d\'entretien biodégradables (bidons 5L)', category: 'consommable', sector: 'hotel', unit: 'bidons', currentStock: 12, minAlertStock: 4, unitCost: 5000, supplier: 'EcoPro Bénin', location: 'Local Entretien', lastRestockedDate: '2026-06-05' },

  // Secteur Salles de Conférence & Séminaires
  { id: 'INT-CONF-001', name: 'Blocs-notes Yamtaanu en papier recyclé', category: 'fourniture', sector: 'conference', unit: 'unités', currentStock: 220, minAlertStock: 50, unitCost: 450, supplier: 'Imprimerie Moderne Cotonou', location: 'Réserve Conférences', lastRestockedDate: '2026-06-01' },
  { id: 'INT-CONF-002', name: 'Stylos écologiques en bambou naturel gravé', category: 'fourniture', sector: 'conference', unit: 'unités', currentStock: 310, minAlertStock: 60, unitCost: 300, supplier: 'Atelier Vannerie Yamtaanu', location: 'Réserve Conférences', lastRestockedDate: '2026-06-01' },
  { id: 'INT-CONF-003', name: 'Gobelets lavables en fibre de bambou', category: 'equipement_ruche', sector: 'conference', unit: 'unités', currentStock: 180, minAlertStock: 40, unitCost: 800, supplier: 'Atelier Vannerie Yamtaanu', location: 'Office Traiteur', lastRestockedDate: '2026-05-15' },
  { id: 'INT-CONF-004', name: 'Pochettes séminaires & badges personnalisables', category: 'fourniture', sector: 'conference', unit: 'unités', currentStock: 160, minAlertStock: 40, unitCost: 250, supplier: 'Papeterie Centrale', location: 'Réserve Conférences', lastRestockedDate: '2026-06-10' }
];

export const defaultStockMovements: StockMovement[] = [
  {
    id: 'MVT-001',
    date: '2026-06-18',
    time: '14:30',
    itemType: 'produit_fini',
    itemId: 'PROD-MIEL-500',
    itemName: 'Miel de Forêt (Pot 500g)',
    sector: 'miel',
    movementType: 'entree_production',
    quantity: 40,
    unit: 'pots',
    unitCost: 3200,
    totalCost: 128000,
    referenceDoc: 'LOT-20260618-500G-01',
    operator: 'Responsable Miellerie',
    notes: 'Conditionnement du lot issu de la cuve Inox A.'
  },
  {
    id: 'MVT-002',
    date: '2026-06-18',
    time: '14:35',
    itemType: 'intrant',
    itemId: 'INT-MIEL-002',
    itemName: 'Pots en verre 500g hexagonaux',
    sector: 'miel',
    movementType: 'sortie_consommation',
    quantity: 40,
    unit: 'pots',
    unitCost: 450,
    totalCost: 18000,
    referenceDoc: 'LOT-20260618-500G-01',
    operator: 'Responsable Miellerie',
    notes: 'Consommation emballages pour mise en pot.'
  },
  {
    id: 'MVT-003',
    date: '2026-06-19',
    time: '10:00',
    itemType: 'produit_fini',
    itemId: 'PROD-MIEL-500',
    itemName: 'Miel de Forêt (Pot 500g)',
    sector: 'miel',
    movementType: 'sortie_vente',
    quantity: 15,
    unit: 'pots',
    referenceDoc: 'CMD-101 (BL-101)',
    operator: 'Service Commercial',
    notes: 'Livraison Boutique Cotonou Premium.'
  },
  {
    id: 'MVT-004',
    date: '2026-06-21',
    time: '09:15',
    itemType: 'produit_fini',
    itemId: 'PROD-MIEL-500',
    itemName: 'Miel de Forêt (Pot 500g)',
    sector: 'miel',
    movementType: 'sortie_perte_casse',
    quantity: 1,
    unit: 'pots',
    unitCost: 3200,
    totalCost: 3200,
    referenceDoc: 'RET-001 / RMA-01',
    operator: 'Contrôle Qualité',
    notes: 'Pot fêlé durant le transit transport - mis au rebut suite retour client.'
  },
  {
    id: 'MVT-005',
    date: '2026-06-21',
    time: '11:00',
    itemType: 'produit_fini',
    itemId: 'PROD-JUS-HIB-1',
    itemName: 'Nectar de Hibiscus-Baobab (1L)',
    sector: 'jus',
    movementType: 'entree_production',
    quantity: 45,
    unit: 'bouteilles',
    unitCost: 950,
    totalCost: 42750,
    referenceDoc: 'JUS-BAT-002',
    operator: 'Responsable Atelier Jus',
    notes: 'Pasteurisation et embouteillage 45 bouteilles 1L.'
  },
  {
    id: 'MVT-006',
    date: '2026-06-22',
    time: '09:00',
    itemType: 'produit_fini',
    itemId: 'PROD-THE-CIT',
    itemName: 'Tisane Citronnelle Sauvage',
    sector: 'the',
    movementType: 'entree_production',
    quantity: 110,
    unit: 'sachets',
    unitCost: 850,
    totalCost: 93500,
    referenceDoc: 'THE-BAT-002',
    operator: 'Opérateur Tisanes',
    notes: 'Conditionnement 110 sachets kraft 50g.'
  },
  {
    id: 'MVT-007',
    date: '2026-06-22',
    time: '15:20',
    itemType: 'produit_fini',
    itemId: 'PROD-MIEL-250',
    itemName: 'Miel de Forêt (Pot 250g)',
    sector: 'miel',
    movementType: 'sortie_vente',
    quantity: 2,
    unit: 'pots',
    referenceDoc: 'CMD-POS-1001',
    operator: 'Caissier Comptoir',
    notes: 'Vente directe au comptoir de la boutique.'
  }
];

export const defaultReturns: ClientReturn[] = [
  {
    id: 'RET-001',
    orderId: 'CMD-101',
    clientName: 'Boutique Cotonou Premium',
    date: '2026-06-21',
    reason: 'Casse durant le transit par le transporteur (pot fêlé)',
    itemsReturned: [
      {
        productId: 'PROD-MIEL-500',
        variantName: 'Miel de Forêt (Pot 500g)',
        quantity: 1,
        unitPrice: 6000,
        action: 'rebut_perte'
      }
    ],
    refundAmount: 6000,
    refundMethod: 'avoir',
    creditNoteRef: 'AV-2026-001',
    status: 'traite',
    handledBy: 'Service Qualité & Logistique',
    notes: 'Avoir déduit de la facture suivante du client.'
  }
];

export const defaultExpenses: Expense[] = [
  { id: 'EXP-101', date: '2026-05-10', description: 'Achat de 50 tiges de bambou de brousse à Parakou', amount: 15000, category: 'Bambou & Matériel', division: 'miel' },
  { id: 'EXP-102', date: '2026-05-18', description: 'Frais transport pour distribution de ruches à Grand-Popo', amount: 8000, category: 'Transport & Ruches', division: 'miel' },
  { id: 'EXP-103', date: '2026-06-14', description: 'Achat de bouteilles en verre pour jus frais', amount: 25000, category: 'Fruits & Ingrédients Jus', division: 'jus' },
  { id: 'EXP-104', date: '2026-06-15', description: 'Maintenance et nettoyage des écolodges Ouidah', amount: 35000, category: 'Maintenance Hôtel', division: 'hotel' },
  { id: 'EXP-106', date: '2026-06-17', description: 'Révision vidéoprojecteur 4K & câblage sono salle de conférence', amount: 20000, category: 'Équipements & Conférence', division: 'conference' },
  { id: 'EXP-105', date: '2026-06-20', description: 'Salaires des vannières et apiculteurs de brousse', amount: 300000, category: 'Salaires', division: 'general' }
];

export const defaultJuiceBatches: JuiceBatch[] = [
  { id: 'JUS-BAT-001', date: '2026-06-10', flavor: 'Gingembre-Ananas Bio', volumeLiters: 100, ingredientsSourced: 'Ananas doux d\'Allada & gingembre frais béninois', bottledQty250ml: 120, bottledQty1L: 60, isCompleted: true },
  { id: 'JUS-BAT-002', date: '2026-06-21', flavor: 'Nectar Infusion Hibiscus-Baobab', volumeLiters: 50, ingredientsSourced: 'Fleurs d\'hibiscus de Parakou & pulpe de pain de singe', bottledQty250ml: 0, bottledQty1L: 45, isCompleted: true }
];

export const defaultTeaBatches: TeaBatch[] = [
  { id: 'THE-BAT-001', date: '2026-06-05', blendName: 'Thé Vert Moringa', quantityKg: 15, ingredientsSourced: 'Feuilles de moringa de notre ferme à Ouidah & thé vert bio', packagedQty50g: 90, isCompleted: true },
  { id: 'THE-BAT-002', date: '2026-06-22', blendName: 'Tisane Citronnelle Sauvage', quantityKg: 8, ingredientsSourced: 'Citronnelle fraîche coupée', packagedQty50g: 110, isCompleted: true }
];

export const defaultPosSessions: PosSession[] = [
  {
    id: 'POS-SES-001',
    openedAt: '2026-06-22T08:00:00.000Z',
    cashierName: 'Administrateur Principal',
    initialCash: 50000,
    totalCashSales: 18500,
    totalMomoSales: 12000,
    totalCardSales: 0,
    totalCreditSales: 0,
    totalSalesCount: 4,
    totalRevenue: 30500,
    status: 'ouvert'
  }
];

export const defaultRooms: HotelRoom[] = [
  { id: 'ROOM-101', number: 'Bungalow Bougainvillier - Eco-lodge', type: 'Ecolodge Bambou', pricePerNight: 45000, status: 'occupe' },
  { id: 'ROOM-102', number: 'Jasmin - Cabane Lacustre', type: 'Chambre Jasmin', pricePerNight: 30000, status: 'disponible' },
  { id: 'ROOM-103', number: 'Flamboyant - Lodge Forêt', type: 'Ecolodge Bambou', pricePerNight: 45000, status: 'disponible' },
  { id: 'ROOM-104', number: 'Premium Penthouse Miel', type: 'Chambre Premium Miel', pricePerNight: 65000, status: 'occupe' },
  { id: 'ROOM-105', number: 'Orchidée - Standard Palmier', type: 'Chambre Jasmin', pricePerNight: 30000, status: 'en_nettoyage' }
];

export const defaultBookings: HotelBooking[] = [
  { id: 'BKG-001', roomId: 'ROOM-101', roomNumber: 'Bungalow Bougainvillier - Eco-lodge', guestName: 'Alice Johnson', guestEmail: 'alice@gmail.com', checkIn: '2026-06-20', checkOut: '2026-06-25', status: 'en_cours', extrasBilled: 12000, totalBilled: 237000 },
  { id: 'BKG-002', roomId: 'ROOM-104', roomNumber: 'Premium Penthouse Miel', guestName: 'Famille Amoussou', guestEmail: 'info@amoussou.bj', checkIn: '2026-06-21', checkOut: '2026-06-24', status: 'en_cours', extrasBilled: 15000, totalBilled: 210000 },
  { id: 'BKG-003', roomId: 'ROOM-102', roomNumber: 'Jasmin - Cabane Lacustre', guestName: 'Sébastien Alby', guestEmail: 'seb@gmail.com', checkIn: '2026-06-25', checkOut: '2026-06-28', status: 'confirme', extrasBilled: 0, totalBilled: 90000 }
];

export const defaultConferenceHalls: ConferenceHall[] = [
  {
    id: 'HALL-001',
    name: 'Grande Salle Polyvalente Yamtaanu',
    capacity: 150,
    hourlyRate: 20000,
    dailyRate: 120000,
    halfDayRate: 70000,
    amenities: [
      'Vidéoprojecteur HD 4K & Grand Écran',
      'Sonorisation Pro & 4 Micros HF',
      'Wifi Fibre Optique',
      'Climatisation Intégrale',
      'Paperboard & Kit Animateur',
      'Vue Panoramique sur la Forêt'
    ],
    status: 'disponible',
    description: 'Salle modulable haut de gamme idéales pour séminaires, assemblées générales, colloques et cérémonies.'
  },
  {
    id: 'HALL-002',
    name: 'Espace Séminaire Bio & Apiculture',
    capacity: 50,
    hourlyRate: 12000,
    dailyRate: 65000,
    halfDayRate: 40000,
    amenities: [
      'Écran Interactif 75 Pouces',
      'Sonorisation Intégrée & Micro Filaire',
      'Wifi Haut Débit',
      'Climatisation & Ventilation Bio',
      'Tables Modulables',
      'Pause-café aux miels bio incluse'
    ],
    status: 'disponible',
    description: 'Espace de travail chaleureux et lumineux, adapté pour les ateliers de formation et réunions d\'équipe.'
  },
  {
    id: 'HALL-003',
    name: 'Salon VIP Nectar & Conseil',
    capacity: 15,
    hourlyRate: 8000,
    dailyRate: 40000,
    halfDayRate: 25000,
    amenities: [
      'Grande Table de Réunion Bois Massif',
      'Système Visioconférence HD',
      'Climatisation Silencieuse',
      'Service Tisanes & Jus Frais',
      'Confidentialité Totale'
    ],
    status: 'disponible',
    description: 'Salon exécutif pour conseils d\'administration, négociation de contrats ou réunions restreintes.'
  }
];

export const defaultConferenceBookings: ConferenceBooking[] = [
  {
    id: 'CONF-001',
    hallId: 'HALL-001',
    hallName: 'Grande Salle Polyvalente Yamtaanu',
    organizerName: 'M. Jean-Baptiste Houndé',
    organizerEntity: 'ONG Bio Bénin & Développement',
    phone: '+229 97 12 34 56',
    email: 'contact@biobenin.org',
    eventTitle: 'Forum National de l\'Apiculture Durable',
    eventType: 'Conference',
    startDate: '2026-06-22',
    endDate: '2026-06-23',
    timeSlot: '08:30 - 17:00 (Journée Entière)',
    participantsCount: 110,
    selectedServices: [
      { name: 'Pause-café Miels & Thés Yamtaanu (110 pers.)', price: 55000 },
      { name: 'Buffet Déjeuner Nectar Bio (110 pers.)', price: 165000 }
    ],
    hallPrice: 240000,
    extrasBilled: 220000,
    totalBilled: 460000,
    status: 'en_cours',
    notes: 'Disposition en théâtre. Prévoir assistance technique pour la visio.',
    createdAt: '2026-06-15'
  },
  {
    id: 'CONF-002',
    hallId: 'HALL-002',
    hallName: 'Espace Séminaire Bio & Apiculture',
    organizerName: 'Dr. Chantal Lawson',
    organizerEntity: 'Coopérative Agro-Alimentaire de Ouidah',
    phone: '+229 95 88 77 66',
    email: 'c.lawson@coopouidah.bj',
    eventTitle: 'Atelier de Traçabilité et Normes Qualité Miel',
    eventType: 'Atelier',
    startDate: '2026-06-28',
    endDate: '2026-06-28',
    timeSlot: '09:00 - 13:00 (Demi-Journée)',
    participantsCount: 35,
    selectedServices: [
      { name: 'Pause-café Dégustation Miels Sauvages', price: 17500 }
    ],
    hallPrice: 40000,
    extrasBilled: 17500,
    totalBilled: 57500,
    status: 'confirme',
    notes: 'Disposition en U. Matériel de prise de note fourni.',
    createdAt: '2026-06-18'
  }
];


export const defaultAuthorizedUsers: AuthorizedUser[] = [
  {
    id: 'USR-001',
    name: 'Administrateur Principal',
    emailOrLogin: 'admin',
    role: 'Administrateur Principal',
    accessCode: 'yamtaanu',
    active: true,
    department: 'Général',
    addedAt: '2026-01-01'
  },
  {
    id: 'USR-002',
    name: 'Jean Orou (Resp. Miellerie)',
    emailOrLogin: 'jean.miellerie',
    role: 'Administrateur',
    accessCode: '8492',
    active: true,
    department: 'Miellerie & Ruchers',
    addedAt: '2026-03-15'
  },
  {
    id: 'USR-003',
    name: 'Sarah Bio (Atelier Jus & Thés)',
    emailOrLogin: 'sarah.atelier',
    role: 'Employé',
    accessCode: '3310',
    active: true,
    department: 'Atelier Jus & Thés',
    addedAt: '2026-04-10'
  },
  {
    id: 'USR-004',
    name: 'Réception Éco-Lodge',
    emailOrLogin: 'reception.lodge',
    role: 'Opérateur',
    accessCode: '1020',
    active: true,
    department: 'Éco-Lodge',
    addedAt: '2026-05-01'
  }
];

export const defaultSyscohadaAccounts: SyscohadaAccount[] = [
  // CLASSE 1 : COMPTES DE CAPITAUX
  { code: '101', label: 'Capital social & Dotation initiale', accountClass: 1, type: 'passif', sector: 'general', description: 'Fonds propres et apports initiaux des fondateurs' },
  { code: '162', label: 'Emprunts et dettes financières', accountClass: 1, type: 'passif', sector: 'general', description: 'Prêts bancaires et dettes à moyen/long terme' },
  
  // CLASSE 2 : IMMOBILISATIONS
  { code: '215', label: 'Matériel Apicole, Pressoirs & Équipements', accountClass: 2, type: 'actif', sector: 'miel', description: 'Ruches, extracteurs inox, pressoirs de jus, séchoirs de thé' },
  { code: '218', label: 'Mobilier & Aménagements (Bungalows & Salles)', accountClass: 2, type: 'actif', sector: 'hotel', description: 'Lits, sonorisation, vidéoprojecteurs HD, climatisation' },
  { code: '281', label: 'Amortissements des immobilisations', accountClass: 2, type: 'actif', sector: 'general', description: 'Cumul des dépréciations d\'équipements' },

  // CLASSE 3 : STOCKS
  { code: '311', label: 'Stocks de matières premières & intrants', accountClass: 3, type: 'actif', sector: 'general', description: 'Bambous, cire, fruits frais, herbes séchées' },
  { code: '335', label: 'Stocks d\'emballages (Pots, Bouteilles, Sachets)', accountClass: 3, type: 'actif', sector: 'general', description: 'Pots verre 250g/500g/1kg, bouteilles 250ml/1L' },
  { code: '371', label: 'Stocks de produits finis commercialisables', accountClass: 3, type: 'actif', sector: 'general', description: 'Pots de miel prêts, jus conditionnés, thés ensachés' },

  // CLASSE 4 : TIERS (CLIENTS, FOURNISSEURS, PERSONNEL, ÉTAT)
  { code: '4011', label: 'Fournisseurs d\'exploitation', accountClass: 4, type: 'passif', sector: 'general', description: 'Fournisseurs de matières premières et prestataires' },
  { code: '4111', label: 'Clients - Ventes & Distributeurs', accountClass: 4, type: 'actif', sector: 'general', description: 'Créances sur ventes de produits et prestations' },
  { code: '421', label: 'Personnel - Salaires & Avances', accountClass: 4, type: 'passif', sector: 'general', description: 'Rémunérations dues aux apiculteurs, vanniers et serveurs' },
  { code: '431', label: 'Sécurité Sociale (CNSS) & Organismes', accountClass: 4, type: 'passif', sector: 'general', description: 'Cotisations sociales' },
  { code: '442', label: 'État - Impôts, Taxes & IFU', accountClass: 4, type: 'passif', sector: 'general', description: 'Retenues fiscales et acomptes' },

  // CLASSE 5 : TRÉSORERIE & DISPONIBILITÉS
  { code: '5211', label: 'Banque (Compte courant BOA / Ecobank)', accountClass: 5, type: 'tresorerie', sector: 'general', description: 'Compte bancaire d\'exploitation' },
  { code: '5711', label: 'Caisse Principale (Espèces Siège)', accountClass: 5, type: 'tresorerie', sector: 'general', description: 'Liquidités physiques du coffre central' },
  { code: '5712', label: 'Caisse POS Comptoir (Boutique de vente)', accountClass: 5, type: 'tresorerie', sector: 'general', description: 'Tiroir-caisse de la caisse tactile enregistreuse' },
  { code: '5713', label: 'Trésorerie Mobile Money - MTN MoMo', accountClass: 5, type: 'tresorerie', sector: 'general', description: 'Compte marchand MTN Mobile Money' },
  { code: '5714', label: 'Trésorerie Mobile Money - Moov Money', accountClass: 5, type: 'tresorerie', sector: 'general', description: 'Compte marchand Moov Money' },
  { code: '585', label: 'Virements internes de fonds (Transferts Caisse/Banque/Momo)', accountClass: 5, type: 'tresorerie', sector: 'general', description: 'Compte pivot de réconciliation' },

  // CLASSE 6 : CHARGES D\'EXPLOITATION
  { code: '6011', label: 'Achats Bambou & Matériel Apicole', accountClass: 6, type: 'charge', sector: 'miel', description: 'Matières premières ruchers' },
  { code: '6012', label: 'Achats Fruits Frais (Pressoir Jus)', accountClass: 6, type: 'charge', sector: 'jus', description: 'Ananas, mangues, gingembre, hibiscus' },
  { code: '6013', label: 'Achats Feuilles & Plantes (Atelier Thés)', accountClass: 6, type: 'charge', sector: 'the', description: 'Moringa, citronnelle, menthe sauvage' },
  { code: '6022', label: 'Achats Pots Verre, Bouteilles & Étiquettes', accountClass: 6, type: 'charge', sector: 'general', description: 'Conditionnements et traçabilité' },
  { code: '612', label: 'Transports de marchandises & Fret Bus', accountClass: 6, type: 'charge', sector: 'general', description: 'Expéditions par bus régionaux et livraisons' },
  { code: '624', label: 'Maintenance Bungalows Éco-Lodge & Salles', accountClass: 6, type: 'charge', sector: 'hotel', description: 'Entretien hébergements, climatisation, sono' },
  { code: '628', label: 'Frais de Télécommunications & Connexion', accountClass: 6, type: 'charge', sector: 'general', description: 'Forfaits internet et communication' },
  { code: '661', label: 'Rémunérations & Salaires du personnel', accountClass: 6, type: 'charge', sector: 'general', description: 'Apiculteurs, techniciens jus, gérance' },
  { code: '681', label: 'Dotations aux amortissements d\'exploitation', accountClass: 6, type: 'charge', sector: 'general', description: 'Amortissement annuel des installations' },

  // CLASSE 7 : PRODUITS & VENTES (PAR SECTEUR D\'ACTIVITÉ)
  { code: '7011', label: 'Ventes de Miel de Bambou & Produits Ruche', accountClass: 7, type: 'produit', sector: 'miel', description: 'Pots 250g, 500g, 1kg et miel brut' },
  { code: '7012', label: 'Ventes de Jus de Fruits & Nectars Naturels', accountClass: 7, type: 'produit', sector: 'jus', description: 'Bouteilles 250ml et 1L' },
  { code: '7013', label: 'Ventes de Thés & Infusions de Brousse', accountClass: 7, type: 'produit', sector: 'the', description: 'Sachets Moringa, Citronnelle, Hibiscus' },
  { code: '7061', label: 'Prestations Hébergement Éco-Lodge', accountClass: 7, type: 'produit', sector: 'hotel', description: 'Nuitées en bungalows de brousse' },
  { code: '7062', label: 'Prestations Salles de Conférence & Séminaires', accountClass: 7, type: 'produit', sector: 'conference', description: 'Locations de salles, forfaits séminaires, sono' },
  { code: '707', label: 'Ventes Directes Boutique & Dégustations', accountClass: 7, type: 'produit', sector: 'general', description: 'Ventes comptoir et visites touristiques' }
];

export const defaultJournalEntries: SyscohadaJournalEntry[] = [
  {
    id: 'ECR-2026-001',
    date: '2026-06-20',
    journal: 'Ventes',
    pieceRef: 'CMD-101',
    label: 'Facturation Boutique Cotonou Premium - Miel & Jus',
    lines: [
      { accountCode: '4111', accountLabel: 'Clients - Ventes & Distributeurs', debit: 204000, credit: 0, sector: 'general' },
      { accountCode: '7011', accountLabel: 'Ventes de Miel de Bambou & Produits Ruche', debit: 0, credit: 150000, sector: 'miel' },
      { accountCode: '7012', accountLabel: 'Ventes de Jus de Fruits & Nectars Naturels', debit: 0, credit: 54000, sector: 'jus' }
    ],
    totalDebit: 204000,
    totalCredit: 204000,
    validated: true,
    source: 'auto_order',
    createdAt: '2026-06-20T10:00:00.000Z'
  },
  {
    id: 'ECR-2026-002',
    date: '2026-06-20',
    journal: 'Banque',
    pieceRef: 'VIR-BQ-084',
    label: 'Règlement Virement - Boutique Cotonou (Acompte CMD-101)',
    lines: [
      { accountCode: '5211', accountLabel: 'Banque (Compte courant BOA / Ecobank)', debit: 204000, credit: 0, sector: 'general' },
      { accountCode: '4111', accountLabel: 'Clients - Ventes & Distributeurs', debit: 0, credit: 204000, sector: 'general' }
    ],
    totalDebit: 204000,
    totalCredit: 204000,
    validated: true,
    source: 'auto_order',
    createdAt: '2026-06-20T11:30:00.000Z'
  },
  {
    id: 'ECR-2026-003',
    date: '2026-06-21',
    journal: 'Ventes',
    pieceRef: 'CONF-BKG-001',
    label: 'Prestation Conférence - ONG Agro-Durable Bénin',
    lines: [
      { accountCode: '4111', accountLabel: 'Clients - Ventes & Distributeurs', debit: 275000, credit: 0, sector: 'conference' },
      { accountCode: '7062', accountLabel: 'Prestations Salles de Conférence & Séminaires', debit: 0, credit: 275000, sector: 'conference' }
    ],
    totalDebit: 275000,
    totalCredit: 275000,
    validated: true,
    source: 'auto_booking',
    createdAt: '2026-06-21T09:00:00.000Z'
  },
  {
    id: 'ECR-2026-004',
    date: '2026-06-21',
    journal: 'Caisse',
    pieceRef: 'REC-CONF-001',
    label: 'Encaissement Espèces Acompte Séminaire ONG',
    lines: [
      { accountCode: '5711', accountLabel: 'Caisse Principale (Espèces Siège)', debit: 200000, credit: 0, sector: 'conference' },
      { accountCode: '4111', accountLabel: 'Clients - Ventes & Distributeurs', debit: 0, credit: 200000, sector: 'conference' }
    ],
    totalDebit: 200000,
    totalCredit: 200000,
    validated: true,
    source: 'auto_booking',
    createdAt: '2026-06-21T09:15:00.000Z'
  },
  {
    id: 'ECR-2026-005',
    date: '2026-06-22',
    journal: 'Caisse',
    pieceRef: 'POS-SES-001-CLOT',
    label: 'Ventes Caisse POS Comptoir - Espèces & Mobile Money',
    lines: [
      { accountCode: '5712', accountLabel: 'Caisse POS Comptoir (Boutique de vente)', debit: 18500, credit: 0, sector: 'general' },
      { accountCode: '5713', accountLabel: 'Trésorerie Mobile Money - MTN MoMo', debit: 12000, credit: 0, sector: 'general' },
      { accountCode: '7011', accountLabel: 'Ventes de Miel de Bambou & Produits Ruche', debit: 0, credit: 15500, sector: 'miel' },
      { accountCode: '7012', accountLabel: 'Ventes de Jus de Fruits & Nectars Naturels', debit: 0, credit: 15000, sector: 'jus' }
    ],
    totalDebit: 30500,
    totalCredit: 30500,
    validated: true,
    source: 'auto_pos',
    createdAt: '2026-06-22T17:00:00.000Z'
  },
  {
    id: 'ECR-2026-006',
    date: '2026-06-18',
    journal: 'Achats',
    pieceRef: 'EXP-101',
    label: 'Achat Bambous géants pour tressage ruches',
    lines: [
      { accountCode: '6011', accountLabel: 'Achats Bambou & Matériel Apicole', debit: 45000, credit: 0, sector: 'miel' },
      { accountCode: '5711', accountLabel: 'Caisse Principale (Espèces Siège)', debit: 0, credit: 45000, sector: 'general' }
    ],
    totalDebit: 45000,
    totalCredit: 45000,
    validated: true,
    source: 'auto_expense',
    createdAt: '2026-06-18T14:00:00.000Z'
  }
];

export const defaultReconciliations: CashReconciliationRecord[] = [
  {
    id: 'REC-001',
    date: '2026-06-22',
    accountCode: '5712',
    accountName: 'Caisse POS Comptoir (Boutique de vente)',
    theoreticalBalance: 68500,
    countedRealBalance: 68500,
    difference: 0,
    justification: 'Clôture de session POS parfaite, aucun écart.',
    verifiedBy: 'Administrateur Principal'
  },
  {
    id: 'REC-002',
    date: '2026-06-22',
    accountCode: '5713',
    accountName: 'Trésorerie Mobile Money - MTN MoMo',
    theoreticalBalance: 12000,
    countedRealBalance: 12000,
    difference: 0,
    justification: 'Solde relevé marchand MTN MoMo conforme aux transactions POS.',
    verifiedBy: 'Administrateur Principal'
  }
];

// Complete Data Store containing state variables & modification functions
export class BambouMielStore {
  users: AuthorizedUser[];
  preforms: BambooHivePreform[];
  hives: InstalledHive[];
  inspections: HiveInspection[];
  harvests: Harvest[];
  campaigns: HarvestCampaign[];
  extractions: ExtractionLog[];
  tanks: StoredHoneyTank[];
  bottlings: BottlingBatch[];
  products: FinishedProduct[];
  orders: SalesOrder[];
  proformas: SalesProforma[];
  deliveryNotes: DeliveryNote[];
  returns: ClientReturn[];
  expenses: Expense[];
  juiceBatches: JuiceBatch[];
  teaBatches: TeaBatch[];
  rooms: HotelRoom[];
  bookings: HotelBooking[];
  conferenceHalls: ConferenceHall[];
  conferenceBookings: ConferenceBooking[];
  clientProfiles: ClientAccountProfile[];
  posSessions: PosSession[];
  syscohadaAccounts: SyscohadaAccount[];
  journalEntries: SyscohadaJournalEntry[];
  reconciliations: CashReconciliationRecord[];
  rawMaterials: RawMaterialStockItem[];
  stockMovements: StockMovement[];

  // Traçabilité intégrale LES TRIANGLES – Yamtãanu
  beekeepers: BeekeeperOwner[];
  apiaries: Apiary[];
  trackedHives: TrackedHive[];
  journalEvents: HiveJournalEvent[];
  traceCampaigns: HarvestCampaignRecord[];
  physicalBuckets: PhysicalBucket[];
  bucketSubLots: BucketSubLot[];
  hiveHarvests: HiveHarvestRecord[];
  transformationSteps: MiellerieTransformationStep[];
  bottledJars: BottledJar[];

  // Customizable Dropdown Choices & Parameters
  locations: string[];
  artisans: string[];
  juiceFlavors: string[];
  teaBlends: string[];
  clients: string[];
  carriers: string[];
  tankWarningThresholdPct: number;
  tankColorTheme: string; // e.g., 'bg-amber-400' or 'bg-amber-500' or 'bg-emerald-500'

  constructor() {
    this.users = getLocalStorageItem('users', defaultAuthorizedUsers);
    this.preforms = getLocalStorageItem('preforms', defaultPreforms);
    this.hives = getLocalStorageItem('hives', defaultHives);
    this.inspections = getLocalStorageItem('inspections', defaultInspections);
    this.harvests = getLocalStorageItem('harvests', defaultHarvests);
    this.campaigns = getLocalStorageItem('campaigns', defaultCampaigns);
    this.extractions = getLocalStorageItem('extractions', defaultExtractions);
    this.tanks = getLocalStorageItem('tanks', defaultTanks);
    this.bottlings = getLocalStorageItem('bottlings', defaultBottling);
    this.products = getLocalStorageItem('products', defaultProducts);
    this.orders = getLocalStorageItem('orders', defaultOrders);
    this.proformas = getLocalStorageItem('proformas', defaultProformas);
    this.deliveryNotes = getLocalStorageItem('deliveryNotes', defaultDeliveryNotes);
    this.returns = getLocalStorageItem('returns', defaultReturns);
    this.expenses = getLocalStorageItem('expenses', defaultExpenses);
    this.juiceBatches = getLocalStorageItem('juiceBatches', defaultJuiceBatches);
    this.teaBatches = getLocalStorageItem('teaBatches', defaultTeaBatches);
    this.rooms = getLocalStorageItem('rooms', defaultRooms);
    this.bookings = getLocalStorageItem('bookings', defaultBookings);
    this.conferenceHalls = getLocalStorageItem('conferenceHalls', defaultConferenceHalls);
    this.conferenceBookings = getLocalStorageItem('conferenceBookings', defaultConferenceBookings);
    this.clientProfiles = getLocalStorageItem('clientProfiles', defaultClientProfiles);
    this.posSessions = getLocalStorageItem('posSessions', defaultPosSessions);
    this.syscohadaAccounts = getLocalStorageItem('syscohadaAccounts', defaultSyscohadaAccounts);
    this.journalEntries = getLocalStorageItem('journalEntries', defaultJournalEntries);
    this.reconciliations = getLocalStorageItem('reconciliations', defaultReconciliations);
    this.rawMaterials = getLocalStorageItem('rawMaterials', defaultRawMaterials);
    this.stockMovements = getLocalStorageItem('stockMovements', defaultStockMovements);

    // Initializing Traceability LES TRIANGLES - Yamtãanu
    this.beekeepers = getLocalStorageItem('beekeepers', defaultBeekeepers);
    this.apiaries = getLocalStorageItem('apiaries', defaultApiaries);
    this.trackedHives = getLocalStorageItem('trackedHives', defaultTrackedHives);
    this.journalEvents = getLocalStorageItem('journalEvents', defaultJournalEvents);
    this.traceCampaigns = getLocalStorageItem('traceCampaigns', defaultTraceCampaigns);
    this.physicalBuckets = getLocalStorageItem('physicalBuckets', defaultPhysicalBuckets);
    this.bucketSubLots = getLocalStorageItem('bucketSubLots', defaultBucketSubLots);
    this.hiveHarvests = getLocalStorageItem('hiveHarvests', defaultHiveHarvests);
    this.transformationSteps = getLocalStorageItem('transformationSteps', defaultTransformationSteps);
    this.bottledJars = getLocalStorageItem('bottledJars', defaultBottledJars);

    // Initializing custom choices loaded from local storage
    this.locations = getLocalStorageItem('locations', [
      'Rucher de Parakou',
      'Foresterie Grand-Popo',
      'Rucher Clarière Sud',
      'Rucher de Ouidah',
      'Plateau Abomey-Calavi',
      'Rucher Colline Est',
      'Savanah Djougou'
    ]);
    this.artisans = getLocalStorageItem('artisans', [
      'Sébastien Houessou',
      'Albertine Sagbo',
      'Jean Koundé',
      'Mamadou Diallo',
      'Alix Mbome',
      'Mathieu Tokpo'
    ]);
    this.juiceFlavors = getLocalStorageItem('juiceFlavors', [
      'Gingembre-Ananas Bio',
      'Nectar Infusion Hibiscus-Baobab',
      'Mangue-Passion Sauvage',
      'Cocktail Goyave-Passion',
      'Pur Jus de Tamarin du Bénin'
    ]);
    this.teaBlends = getLocalStorageItem('teaBlends', [
      'Thé Vert Moringa',
      'Tisane Citronnelle Sauvage',
      'Thé Impérial au Miel',
      'Infusion Hibiscus Relax',
      'Tisane de Kinkeliba'
    ]);
    this.clients = getLocalStorageItem('clients', [
      'Boutique Cotonou Premium',
      'Hôtel de la Plage Ouidah',
      'Supermarché du Pont Parakou',
      'Casino Supermarchés',
      'Grand Bazar Abomey-Calavi'
    ]);
    this.carriers = getLocalStorageItem('carriers', [
      'Benin Transport Express',
      'EcoNavette Logistique',
      'Fret Routier Brousse coop',
      'Chauffeur Privé Ecolodge'
    ]);
    this.tankWarningThresholdPct = getLocalStorageItem('tankWarningThresholdPct', 25);
    this.tankColorTheme = getLocalStorageItem('tankColorTheme', 'bg-amber-400');

    // Asynchronously synchronize authorized users with server for cross-device support (phones, tablets, PC)
    this.syncUsersWithServer();
  }

  saveAll() {
    setLocalStorageItem('users', this.users);
    setLocalStorageItem('preforms', this.preforms);
    setLocalStorageItem('hives', this.hives);
    setLocalStorageItem('inspections', this.inspections);
    setLocalStorageItem('harvests', this.harvests);
    setLocalStorageItem('campaigns', this.campaigns);
    setLocalStorageItem('extractions', this.extractions);
    setLocalStorageItem('tanks', this.tanks);
    setLocalStorageItem('bottlings', this.bottlings);
    setLocalStorageItem('products', this.products);
    setLocalStorageItem('orders', this.orders);
    setLocalStorageItem('proformas', this.proformas);
    setLocalStorageItem('deliveryNotes', this.deliveryNotes);
    setLocalStorageItem('returns', this.returns);
    setLocalStorageItem('expenses', this.expenses);
    setLocalStorageItem('juiceBatches', this.juiceBatches);
    setLocalStorageItem('teaBatches', this.teaBatches);
    setLocalStorageItem('rooms', this.rooms);
    setLocalStorageItem('bookings', this.bookings);
    setLocalStorageItem('conferenceHalls', this.conferenceHalls);
    setLocalStorageItem('conferenceBookings', this.conferenceBookings);
    setLocalStorageItem('clientProfiles', this.clientProfiles);
    setLocalStorageItem('posSessions', this.posSessions);
    setLocalStorageItem('syscohadaAccounts', this.syscohadaAccounts);
    setLocalStorageItem('journalEntries', this.journalEntries);
    setLocalStorageItem('reconciliations', this.reconciliations);
    setLocalStorageItem('rawMaterials', this.rawMaterials);
    setLocalStorageItem('stockMovements', this.stockMovements);

    // Save Traceability LES TRIANGLES - Yamtãanu
    setLocalStorageItem('beekeepers', this.beekeepers);
    setLocalStorageItem('apiaries', this.apiaries);
    setLocalStorageItem('trackedHives', this.trackedHives);
    setLocalStorageItem('journalEvents', this.journalEvents);
    setLocalStorageItem('traceCampaigns', this.traceCampaigns);
    setLocalStorageItem('physicalBuckets', this.physicalBuckets);
    setLocalStorageItem('bucketSubLots', this.bucketSubLots);
    setLocalStorageItem('hiveHarvests', this.hiveHarvests);
    setLocalStorageItem('transformationSteps', this.transformationSteps);
    setLocalStorageItem('bottledJars', this.bottledJars);

    // Save custom settings
    setLocalStorageItem('locations', this.locations);
    setLocalStorageItem('artisans', this.artisans);
    setLocalStorageItem('juiceFlavors', this.juiceFlavors);
    setLocalStorageItem('teaBlends', this.teaBlends);
    setLocalStorageItem('clients', this.clients);
    setLocalStorageItem('carriers', this.carriers);
    setLocalStorageItem('tankWarningThresholdPct', this.tankWarningThresholdPct);
    setLocalStorageItem('tankColorTheme', this.tankColorTheme);
  }

  // --- Methods to mutate customized dropdown choices ---
  addCustomChoice(type: 'locations' | 'artisans' | 'juiceFlavors' | 'teaBlends' | 'clients' | 'carriers', value: string) {
    const trimmed = value.trim();
    if (!trimmed) return false;
    
    let list: string[] = [];
    if (type === 'locations') list = this.locations;
    else if (type === 'artisans') list = this.artisans;
    else if (type === 'juiceFlavors') list = this.juiceFlavors;
    else if (type === 'teaBlends') list = this.teaBlends;
    else if (type === 'clients') list = this.clients;
    else if (type === 'carriers') list = this.carriers;

    if (!list.includes(trimmed)) {
      list.push(trimmed);
      this.saveAll();
      return true;
    }
    return false;
  }

  removeCustomChoice(type: 'locations' | 'artisans' | 'juiceFlavors' | 'teaBlends' | 'clients' | 'carriers', value: string) {
    if (type === 'locations') this.locations = this.locations.filter(x => x !== value);
    else if (type === 'artisans') this.artisans = this.artisans.filter(x => x !== value);
    else if (type === 'juiceFlavors') this.juiceFlavors = this.juiceFlavors.filter(x => x !== value);
    else if (type === 'teaBlends') this.teaBlends = this.teaBlends.filter(x => x !== value);
    else if (type === 'clients') this.clients = this.clients.filter(x => x !== value);
    else if (type === 'carriers') this.carriers = this.carriers.filter(x => x !== value);

    this.saveAll();
    return true;
  }

  updateCustomChoice(type: 'locations' | 'artisans' | 'juiceFlavors' | 'teaBlends' | 'clients' | 'carriers', oldValue: string, newValue: string) {
    const trimmedNew = newValue.trim();
    if (!trimmedNew || oldValue === trimmedNew) return false;

    // Check if new value already exists
    let list: string[] = [];
    if (type === 'locations') list = this.locations;
    else if (type === 'artisans') list = this.artisans;
    else if (type === 'juiceFlavors') list = this.juiceFlavors;
    else if (type === 'teaBlends') list = this.teaBlends;
    else if (type === 'clients') list = this.clients;
    else if (type === 'carriers') list = this.carriers;

    if (list.includes(trimmedNew)) {
      return false; // Already exists
    }

    // Update value in list
    const idx = list.indexOf(oldValue);
    if (idx !== -1) {
      list[idx] = trimmedNew;
    }

    // Propagate changes to other entities
    if (type === 'locations') {
      this.hives.forEach(h => {
        if (h.locationName === oldValue) h.locationName = trimmedNew;
      });
    } else if (type === 'artisans') {
      this.preforms.forEach(p => {
        if (p.artisanName === oldValue) p.artisanName = trimmedNew;
      });
    } else if (type === 'juiceFlavors') {
      this.juiceBatches.forEach(b => {
        if (b.flavor === oldValue) b.flavor = trimmedNew;
      });
    } else if (type === 'teaBlends') {
      this.teaBatches.forEach(b => {
        if (b.blendName === oldValue) b.blendName = trimmedNew;
      });
    } else if (type === 'clients') {
      this.clientProfiles.forEach(cp => {
        if (cp.clientName === oldValue) cp.clientName = trimmedNew;
      });
      this.orders.forEach(o => {
        if (o.clientName === oldValue) o.clientName = trimmedNew;
      });
    } else if (type === 'carriers') {
      this.deliveryNotes.forEach(dn => {
        if (dn.carrierName === oldValue) dn.carrierName = trimmedNew;
      });
    }

    this.saveAll();
    return true;
  }

  // --- Dynamic Honey Tank management ---
  addNewTank(name: string, capacityKg: number) {
    const nextNum = this.tanks.length + 1;
    const id = `TANK-${String(nextNum).padStart(2, '0')}`;
    const newTank: StoredHoneyTank = {
      id,
      name: name.trim() || `Cuve Égouttage ${nextNum}`,
      capacityKg: Number(capacityKg) || 100,
      currentWeightKg: 0
    };
    this.tanks.push(newTank);
    this.saveAll();
    return newTank;
  }

  updateTankProperties(id: string, name: string, capacityKg: number) {
    const t = this.tanks.find(tank => tank.id === id);
    if (t) {
      t.name = name.trim();
      t.capacityKg = Number(capacityKg);
      this.saveAll();
      return true;
    }
    return false;
  }

  deleteTank(id: string) {
    const t = this.tanks.find(tank => tank.id === id);
    if (t && t.currentWeightKg > 0) {
      throw new Error("Impossible de supprimer une cuve qui contient encore du miel égoutté. Videz la cuve au préalable.");
    }
    this.tanks = this.tanks.filter(tank => tank.id !== id);
    this.saveAll();
    return true;
  }

  // --- Add functions ---
  addPreform(item: Omit<BambooHivePreform, 'id'>) {
    const newItem = { ...item, id: `PREF-${String(this.preforms.length + 1).padStart(3, '0')}` };
    this.preforms.push(newItem);
    this.saveAll();
    return newItem;
  }

  addHive(item: Omit<InstalledHive, 'id' | 'code'>) {
    const code = `R-BAM-${String(this.hives.length + 1).padStart(2, '0')}`;
    const id = `HIVE-${String(this.hives.length + 1).padStart(3, '0')}`;
    const newItem = { ...item, id, code };
    this.hives.push(newItem);
    this.saveAll();
    return newItem;
  }

  addInspection(item: Omit<HiveInspection, 'id'>) {
    const newItem = { ...item, id: `INSP-${String(this.inspections.length + 1).padStart(3, '0')}` };
    this.inspections.push(newItem);
    this.saveAll();
    return newItem;
  }

  addHarvest(item: Omit<Harvest, 'id'>) {
    const newItem = { ...item, id: `HARV-${String(this.harvests.length + 1).padStart(3, '0')}` };
    this.harvests.push(newItem);
    this.saveAll();
    return newItem;
  }

  addCampaign(item: Omit<HarvestCampaign, 'id'>) {
    const newItem = { ...item, id: `CAMP-${String(this.campaigns.length + 1).padStart(3, '0')}` };
    this.campaigns.push(newItem);
    this.saveAll();
    return newItem;
  }

  addExtraction(item: Omit<ExtractionLog, 'id'>) {
    const newItem = { ...item, id: `EXTR-${String(this.extractions.length + 1).padStart(3, '0')}` };
    this.extractions.push(newItem);
    
    // Update harvest items statuses to 'extrait'
    item.harvestIds.forEach(hId => {
      const h = this.harvests.find(harv => harv.id === hId);
      if (h) h.status = 'extrait';
    });

    // Update weight of the target tank
    const t = this.tanks.find(tank => tank.id === item.tankId);
    if (t) {
      t.currentWeightKg += item.extractedWeightKg;
    }

    this.saveAll();
    return newItem;
  }

  addBottling(item: Omit<BottlingBatch, 'id'>) {
    const id = `LOT-10${this.bottlings.length + 1}`;
    const newItem = { ...item, id };
    this.bottlings.push(newItem);

    // Subtract honey from target tank
    const t = this.tanks.find(tank => tank.id === item.tankId);
    const honeyRequiredKg = (item.jarSizeG * item.quantity) / 1000;
    if (t) {
      t.currentWeightKg = Math.max(0, t.currentWeightKg - honeyRequiredKg);
    }

    // Add to finished product stock
    const prod = this.products.find(p => p.category === 'miel' && p.variant.includes(`${item.jarSizeG}g`));
    if (prod) {
      prod.stock += item.quantity;
      prod.batchNumber = item.batchNumber;

      this.recordStockMovement({
        date: item.bottlingDate,
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        itemType: 'produit_fini',
        itemId: prod.id,
        itemName: prod.name + ` (${prod.variant})`,
        sector: 'miel',
        movementType: 'entree_production',
        quantity: item.quantity,
        unit: 'pots',
        unitCost: prod.unitCost || (prod.price * 0.55),
        totalCost: item.quantity * (prod.unitCost || (prod.price * 0.55)),
        referenceDoc: item.batchNumber,
        operator: 'Responsable Miellerie',
        notes: `Conditionnement lot ${item.batchNumber} depuis cuve ${item.tankId}`
      });
    }

    // Deduct glass jars from raw materials if available
    const jarMaterial = this.rawMaterials.find(m => m.sector === 'miel' && m.category === 'emballage' && m.name.includes(`${item.jarSizeG}g`));
    if (jarMaterial) {
      jarMaterial.currentStock = Math.max(0, jarMaterial.currentStock - item.quantity);
      this.recordStockMovement({
        date: item.bottlingDate,
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        itemType: 'intrant',
        itemId: jarMaterial.id,
        itemName: jarMaterial.name,
        sector: 'miel',
        movementType: 'sortie_consommation',
        quantity: item.quantity,
        unit: jarMaterial.unit,
        unitCost: jarMaterial.unitCost,
        totalCost: item.quantity * jarMaterial.unitCost,
        referenceDoc: item.batchNumber,
        operator: 'Responsable Conditionnement',
        notes: `Consommation pots verre pour lot ${item.batchNumber}`
      });
    }

    this.saveAll();
    return newItem;
  }

  addOrder(item: Omit<SalesOrder, 'id' | 'deliveryNoteCreated'>) {
    const id = `CMD-${101 + this.orders.length}`;
    const paid = item.paidAmount !== undefined ? item.paidAmount : (item.isCreditSale ? 0 : item.totalAmount);
    const remaining = Math.max(0, item.totalAmount - paid);
    const isCredit = item.isCreditSale !== undefined ? item.isCreditSale : (remaining > 0);
    const paymentStatus = remaining === 0 ? 'paye' : (paid > 0 ? 'partiel' : 'a_credit');
    
    // Initial payment record if an amount was paid upfront
    const payments: OrderPaymentRecord[] = item.payments && item.payments.length > 0 ? item.payments : (
      paid > 0 ? [
        {
          id: `PAY-${id}-1`,
          orderId: id,
          date: item.date,
          amount: paid,
          paymentMethod: (item.paymentMethod === 'credit' || !item.paymentMethod) ? 'especes' : (item.paymentMethod as any),
          momoProvider: item.momoProvider,
          momoRef: item.momoRef,
          referenceDoc: id,
          receivedBy: item.cashierName || 'Caisse Yamtaanu',
          notes: paid < item.totalAmount ? 'Acompte initial versé à la commande' : 'Règlement intégral comptant'
        }
      ] : []
    );

    const newItem: SalesOrder = { 
      ...item, 
      id, 
      paidAmount: paid, 
      remainingBalance: remaining,
      isCreditSale: isCredit,
      paymentStatus: item.paymentStatus || paymentStatus,
      payments,
      deliveryNoteCreated: false 
    };
    this.orders = [...this.orders, newItem];

    // Subtract product stocks & log stock movements
    this.products = this.products.map(prod => {
      const orderItem = item.items.find(it => it.productId === prod.id);
      if (orderItem) {
        const updatedStock = Math.max(0, prod.stock - orderItem.quantity);
        this.recordStockMovement({
          date: item.date,
          time: item.time || new Date().toTimeString().split(' ')[0].slice(0, 5),
          itemType: 'produit_fini',
          itemId: prod.id,
          itemName: prod.name + (prod.variant ? ` (${prod.variant})` : ''),
          sector: prod.category === 'autre' ? 'general' : (prod.category as any),
          movementType: 'sortie_vente',
          quantity: orderItem.quantity,
          unit: 'unités',
          unitCost: prod.unitCost || (prod.price * 0.6),
          totalCost: orderItem.quantity * (prod.unitCost || (prod.price * 0.6)),
          referenceDoc: id,
          operator: item.cashierName || 'Service Commercial',
          notes: `Vente client : ${item.clientName} (${isCredit ? 'À Crédit' : 'Au Comptant'})`
        });
        return { ...prod, stock: updatedStock };
      }
      return prod;
    });

    // Auto-create or enrich client profile
    const existingProfileIdx = this.clientProfiles.findIndex(cp => cp.clientName.trim().toLowerCase() === item.clientName.trim().toLowerCase());
    if (existingProfileIdx >= 0) {
      const existing = this.clientProfiles[existingProfileIdx];
      this.clientProfiles[existingProfileIdx] = {
        ...existing,
        phone: item.clientPhone || existing.phone,
        address: item.clientAddress || existing.address,
        ifuNumber: item.clientIfu || existing.ifuNumber,
        lastContactDate: item.date
      };
    } else if (item.clientName.trim() !== 'Autre' && item.clientName.trim() !== 'Client Comptoir (Passage)') {
      this.clientProfiles = [
        ...this.clientProfiles,
        {
          id: `CLI-${String(this.clientProfiles.length + 1).padStart(3, '0')}`,
          clientName: item.clientName.trim(),
          phone: item.clientPhone || '',
          email: '',
          address: item.clientAddress || 'Bénin',
          ifuNumber: item.clientIfu || '',
          creditLimit: 300000,
          category: 'autre',
          status: 'actif',
          lastContactDate: item.date,
          notes: `Profil créé automatiquement lors de la commande ${id}.`
        }
      ];
      if (!this.clients.includes(item.clientName.trim())) {
        this.clients.push(item.clientName.trim());
      }
    }

    this.saveAll();
    return newItem;
  }

  updateOrder(id: string, updatedFields: Partial<Omit<SalesOrder, 'id' | 'deliveryNoteCreated'>>) {
    const existing = this.orders.find(o => o.id === id);
    if (!existing) return false;

    // 1. If items were changed, adjust product stocks
    if (updatedFields.items) {
      // Restore product stocks of the old order
      this.products = this.products.map(prod => {
        const orderItem = existing.items.find(it => it.productId === prod.id);
        if (orderItem) {
          return { ...prod, stock: prod.stock + orderItem.quantity };
        }
        return prod;
      });

      // Subtract product stocks of the new order
      this.products = this.products.map(prod => {
        const orderItem = updatedFields.items!.find(it => it.productId === prod.id);
        if (orderItem) {
          return { ...prod, stock: Math.max(0, prod.stock - orderItem.quantity) };
        }
        return prod;
      });
    }

    const totalAmt = updatedFields.totalAmount !== undefined ? updatedFields.totalAmount : existing.totalAmount;
    const paid = updatedFields.paidAmount !== undefined ? updatedFields.paidAmount : (existing.paidAmount || 0);
    const remaining = Math.max(0, totalAmt - paid);
    const isCredit = updatedFields.isCreditSale !== undefined ? updatedFields.isCreditSale : (remaining > 0);
    const paymentStatus = remaining === 0 ? 'paye' : (paid > 0 ? 'partiel' : 'a_credit');

    // 3. Update the order inside our list
    this.orders = this.orders.map(o => {
      if (o.id === id) {
        return {
          ...o,
          ...updatedFields,
          paidAmount: paid,
          remainingBalance: remaining,
          isCreditSale: isCredit,
          paymentStatus: updatedFields.paymentStatus || paymentStatus
        };
      }
      return o;
    });

    // Auto-enrich client profile if clientName is updated
    const targetClient = updatedFields.clientName || existing.clientName;
    if (targetClient) {
      const profileIdx = this.clientProfiles.findIndex(cp => cp.clientName.trim().toLowerCase() === targetClient.trim().toLowerCase());
      if (profileIdx >= 0) {
        const p = this.clientProfiles[profileIdx];
        this.clientProfiles[profileIdx] = {
          ...p,
          phone: updatedFields.clientPhone || p.phone,
          address: updatedFields.clientAddress || p.address,
          ifuNumber: updatedFields.clientIfu || p.ifuNumber,
          lastContactDate: updatedFields.date || p.lastContactDate
        };
      }
    }

    this.saveAll();
    return true;
  }

  recordOrderPayment(orderId: string, paymentData: {
    amount: number;
    paymentMethod: 'especes' | 'momo' | 'carte' | 'virement' | 'cheque';
    momoProvider?: 'MTN MoMo' | 'Moov Money' | 'Wave' | 'Celtiis Cash' | 'Autre';
    momoRef?: string;
    referenceDoc?: string;
    receivedBy: string;
    notes?: string;
    date?: string;
  }) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;

    const paymentAmount = Math.max(0, paymentData.amount);
    if (paymentAmount <= 0) return false;

    const paymentDate = paymentData.date || new Date().toISOString().split('T')[0];
    const payId = `PAY-${order.id}-${(order.payments?.length || 0) + 1}`;

    const newPaymentRecord: OrderPaymentRecord = {
      id: payId,
      orderId: order.id,
      date: paymentDate,
      amount: paymentAmount,
      paymentMethod: paymentData.paymentMethod,
      momoProvider: paymentData.momoProvider,
      momoRef: paymentData.momoRef,
      referenceDoc: paymentData.referenceDoc || order.id,
      receivedBy: paymentData.receivedBy || 'Caisse Yamtaanu',
      notes: paymentData.notes || `Règlement sur créance ${order.id}`
    };

    const currentPaid = (order.paidAmount || 0) + paymentAmount;
    const newRemaining = Math.max(0, order.totalAmount - currentPaid);
    const newStatus = newRemaining === 0 ? 'paye' : 'partiel';

    order.paidAmount = currentPaid;
    order.remainingBalance = newRemaining;
    order.paymentStatus = newStatus;
    order.payments = [...(order.payments || []), newPaymentRecord];

    // Log SYSCOHADA Journal Entry
    const treasuryAccount = paymentData.paymentMethod === 'momo' ? '5713' : 
      (paymentData.paymentMethod === 'virement' || paymentData.paymentMethod === 'cheque' ? '5211' : '5712');
    const treasuryLabel = paymentData.paymentMethod === 'momo' ? `Trésorerie Mobile Money (${paymentData.momoProvider || 'MTN MoMo'})` :
      (paymentData.paymentMethod === 'virement' || paymentData.paymentMethod === 'cheque' ? 'Banque (Compte courant)' : 'Caisse POS Comptoir');

    this.addJournalEntry({
      date: paymentDate,
      journal: paymentData.paymentMethod === 'virement' || paymentData.paymentMethod === 'cheque' ? 'Banque' : 'Caisse',
      pieceRef: `REG-${order.id}`,
      label: `Règlement créance client ${order.clientName} - Réf ${order.id}`,
      lines: [
        {
          accountCode: treasuryAccount,
          accountLabel: treasuryLabel,
          debit: paymentAmount,
          credit: 0,
          sector: 'general',
          note: paymentData.notes || `Encaissement sur créance ${order.id}`
        },
        {
          accountCode: '4111',
          accountLabel: 'Clients - Ventes & Distributeurs',
          debit: 0,
          credit: paymentAmount,
          sector: 'general',
          note: `Apurement créance ${order.clientName}`
        }
      ],
      totalDebit: paymentAmount,
      totalCredit: paymentAmount,
      validated: true,
      source: 'auto_order'
    });

    this.saveAll();
    return true;
  }

  deleteOrder(id: string) {
    const existing = this.orders.find(o => o.id === id);
    if (!existing) return false;

    // 1. Restore product stocks of the order being deleted
    this.products = this.products.map(prod => {
      const orderItem = existing.items.find(it => it.productId === prod.id);
      if (orderItem) {
        return { ...prod, stock: prod.stock + orderItem.quantity };
      }
      return prod;
    });

    // 2. Remove from orders, deliveryNotes, returns
    this.orders = this.orders.filter(o => o.id !== id);
    this.deliveryNotes = this.deliveryNotes.filter(dn => dn.orderId !== id);
    this.returns = this.returns.filter(r => r.orderId !== id);

    this.saveAll();
    return true;
  }

  // --- PROFORMAS / QUOTES METHODS ---
  addProforma(item: Omit<SalesProforma, 'id' | 'createdAt'>) {
    const id = `PRO-${new Date().getFullYear()}-${String(this.proformas.length + 1).padStart(3, '0')}`;
    const newProforma: SalesProforma = {
      ...item,
      id,
      createdAt: new Date().toISOString()
    };
    this.proformas = [newProforma, ...this.proformas];

    // Ensure client profile exists
    if (item.clientName.trim() && item.clientName.trim() !== 'Autre') {
      const exists = this.clientProfiles.some(cp => cp.clientName.trim().toLowerCase() === item.clientName.trim().toLowerCase());
      if (!exists) {
        this.addOrUpdateClientProfile({
          clientName: item.clientName.trim(),
          phone: item.clientPhone || '',
          email: item.clientEmail || '',
          address: item.clientAddress || 'Bénin',
          ifuNumber: item.clientIfu || '',
          creditLimit: 300000,
          category: 'autre',
          status: 'prospect',
          notes: `Créé suite au devis proforma ${id}`
        });
      }
    }

    this.saveAll();
    return newProforma;
  }

  updateProforma(id: string, updatedFields: Partial<SalesProforma>) {
    const idx = this.proformas.findIndex(p => p.id === id);
    if (idx < 0) return false;
    this.proformas[idx] = {
      ...this.proformas[idx],
      ...updatedFields
    };
    this.saveAll();
    return true;
  }

  deleteProforma(id: string) {
    this.proformas = this.proformas.filter(p => p.id !== id);
    this.saveAll();
    return true;
  }

  convertProformaToOrder(proformaId: string, options?: {
    isCreditSale?: boolean;
    paidAmount?: number;
    paymentMethod?: 'especes' | 'momo' | 'carte' | 'virement' | 'cheque' | 'credit';
    dueDate?: string;
    notes?: string;
  }) {
    const proforma = this.proformas.find(p => p.id === proformaId);
    if (!proforma) return null;

    const isCredit = options?.isCreditSale !== undefined ? options.isCreditSale : (proforma.paymentTerms.startsWith('credit') || proforma.paymentTerms === 'acompte_50');
    const paid = options?.paidAmount !== undefined ? options.paidAmount : (isCredit ? 0 : proforma.totalAmount);
    
    // Calculate due date based on proforma terms if not supplied
    let defaultDueDate = new Date().toISOString().split('T')[0];
    if (proforma.paymentTerms === 'credit_15j') {
      const d = new Date();
      d.setDate(d.getDate() + 15);
      defaultDueDate = d.toISOString().split('T')[0];
    } else if (proforma.paymentTerms === 'credit_30j') {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      defaultDueDate = d.toISOString().split('T')[0];
    }

    const newOrder = this.addOrder({
      date: new Date().toISOString().split('T')[0],
      dueDate: options?.dueDate || defaultDueDate,
      clientName: proforma.clientName,
      clientPhone: proforma.clientPhone,
      clientAddress: proforma.clientAddress,
      clientIfu: proforma.clientIfu,
      items: proforma.items.map(it => ({
        productId: it.productId,
        variantName: it.variantName,
        quantity: it.quantity,
        price: it.price,
        discountPercent: it.discountPercent
      })),
      totalAmount: proforma.totalAmount,
      paidAmount: paid,
      discountPercent: proforma.discountPercent,
      discountAmount: proforma.discountAmount,
      isCreditSale: isCredit,
      paymentMethod: options?.paymentMethod || (isCredit ? 'credit' : 'virement'),
      source: 'facturation_b2b',
      status: 'en_attente',
      proformaRef: proforma.id,
      notes: options?.notes || `Généré depuis la facture proforma ${proforma.id}. ${proforma.notes || ''}`
    });

    // Update proforma status
    proforma.status = 'converti_en_facture';
    proforma.convertedOrderId = newOrder.id;

    this.saveAll();
    return newOrder;
  }

  // --- CLIENT SUMMARY & FINANCIALS ---
  getClientFinancialSummary(clientName: string) {
    const trimmed = clientName.trim().toLowerCase();
    const clientProfile = this.clientProfiles.find(cp => cp.clientName.trim().toLowerCase() === trimmed);
    const clientOrders = this.orders.filter(o => o.clientName.trim().toLowerCase() === trimmed && o.status !== 'retourne');
    
    const totalPurchased = clientOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalPaid = clientOrders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
    const currentDebt = clientOrders.reduce((sum, o) => sum + (o.remainingBalance || 0), 0);
    
    const today = new Date().toISOString().split('T')[0];
    const overdueDebt = clientOrders
      .filter(o => (o.remainingBalance || 0) > 0 && o.dueDate && o.dueDate < today)
      .reduce((sum, o) => sum + (o.remainingBalance || 0), 0);

    const creditLimit = clientProfile?.creditLimit || 300000;
    const availableCredit = Math.max(0, creditLimit - currentDebt);
    const creditOrdersCount = clientOrders.filter(o => (o.remainingBalance || 0) > 0).length;

    return {
      clientProfile,
      clientOrders,
      totalPurchased,
      totalPaid,
      currentDebt,
      overdueDebt,
      creditLimit,
      availableCredit,
      creditOrdersCount,
      orderCount: clientOrders.length
    };
  }

  deleteClientProfile(clientName: string) {
    const trimmed = clientName.trim().toLowerCase();
    this.clientProfiles = this.clientProfiles.filter(cp => cp.clientName.trim().toLowerCase() !== trimmed);
    this.clients = this.clients.filter(c => c.trim().toLowerCase() !== trimmed);
    this.saveAll();
    return true;
  }

  addOrUpdateClientProfile(profile: ClientAccountProfile) {
    const idx = this.clientProfiles.findIndex(cp => cp.clientName.trim() === profile.clientName.trim());
    if (idx >= 0) {
      this.clientProfiles[idx] = { ...profile };
    } else {
      this.clientProfiles.push({ ...profile });
    }
    if (!this.clients.includes(profile.clientName.trim())) {
      this.clients.push(profile.clientName.trim());
    }
    this.saveAll();
  }

  createDeliveryNote(orderId: string, carrierName: string, trackingNumber: string, recipientName: string, recipientAddress: string) {
    const id = `BL-${101 + this.deliveryNotes.length}`;
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.deliveryNoteCreated = true;
      order.status = 'livre'; // Update order status to delivered
    }
    const newNote: DeliveryNote = {
      id,
      orderId,
      date: new Date().toISOString().split('T')[0],
      recipientName,
      recipientAddress,
      carrierName,
      trackingNumber,
      status: 'en_transit'
    };
    this.deliveryNotes = [...this.deliveryNotes, newNote];
    this.saveAll();
    return newNote;
  }

  addReturn(item: Omit<ClientReturn, 'id'>) {
    const id = `RET-${String(this.returns.length + 1).padStart(3, '0')}`;
    const newItem: ClientReturn = { ...item, id };
    this.returns = [...this.returns, newItem];

    // Handle return on order state if needed
    const order = this.orders.find(o => o.id === item.orderId);
    if (order) {
      order.status = 'retourne';
    }

    // Return to inventory
    this.products = this.products.map(prod => {
      const retItem = item.itemsReturned.find(it => it.productId === prod.id);
      if (retItem) {
        return { ...prod, stock: prod.stock + retItem.quantity };
      }
      return prod;
    });

    this.saveAll();
    return newItem;
  }

  addProduct(item: Omit<FinishedProduct, 'id'>) {
    const id = `PROD-${String(Date.now()).slice(-6)}`;
    const newItem: FinishedProduct = { ...item, id };
    this.products = [...this.products, newItem];

    // Log initial stock movement if stock > 0
    if (newItem.stock > 0) {
      this.recordStockMovement({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        itemType: 'produit_fini',
        itemId: newItem.id,
        itemName: newItem.name + (newItem.variant ? ` (${newItem.variant})` : ''),
        sector: newItem.category,
        movementType: 'ajustement_inventaire',
        quantity: newItem.stock,
        unit: 'unités',
        unitCost: newItem.unitCost || (newItem.price * 0.6),
        totalCost: newItem.stock * (newItem.unitCost || (newItem.price * 0.6)),
        referenceDoc: 'Création produit',
        operator: 'Gestionnaire de Stock',
        notes: 'Initialisation du stock initial.'
      });
    }

    this.saveAll();
    return newItem;
  }

  updateProduct(id: string, updates: Partial<FinishedProduct>) {
    this.products = this.products.map(prod => {
      if (prod.id === id) {
        return { ...prod, ...updates };
      }
      return prod;
    });
    this.saveAll();
    return true;
  }

  updateProductPriceAndStock(id: string, price: number, stock: number) {
    const prev = this.products.find(p => p.id === id);
    const diff = prev ? stock - prev.stock : 0;

    this.products = this.products.map(prod => {
      if (prod.id === id) {
        return { ...prod, price: Number(price), stock: Number(stock) };
      }
      return prod;
    });

    if (diff !== 0 && prev) {
      this.recordStockMovement({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        itemType: 'produit_fini',
        itemId: id,
        itemName: prev.name + (prev.variant ? ` (${prev.variant})` : ''),
        sector: prev.category,
        movementType: 'ajustement_inventaire',
        quantity: Math.abs(diff),
        unit: 'unités',
        unitCost: prev.unitCost || (prev.price * 0.6),
        totalCost: Math.abs(diff) * (prev.unitCost || (prev.price * 0.6)),
        referenceDoc: 'Ajustement manuel inventaire',
        operator: 'Responsable Stock',
        notes: `Régularisation de stock : ${prev.stock} -> ${stock} (${diff > 0 ? '+' : ''}${diff})`
      });
    }

    this.saveAll();
    return true;
  }

  deleteProduct(id: string) {
    this.products = this.products.filter(prod => prod.id !== id);
    this.saveAll();
    return true;
  }

  // --- RAW MATERIALS (INTRANTS) MANAGEMENT ---
  addRawMaterial(item: Omit<RawMaterialStockItem, 'id'>) {
    const id = `INT-${String(item.sector).toUpperCase()}-${String(Date.now()).slice(-4)}`;
    const newItem: RawMaterialStockItem = { ...item, id };
    this.rawMaterials = [...this.rawMaterials, newItem];

    if (newItem.currentStock > 0) {
      this.recordStockMovement({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        itemType: 'intrant',
        itemId: newItem.id,
        itemName: newItem.name,
        sector: newItem.sector,
        movementType: 'entree_achat',
        quantity: newItem.currentStock,
        unit: newItem.unit,
        unitCost: newItem.unitCost,
        totalCost: newItem.currentStock * newItem.unitCost,
        referenceDoc: 'Création intrant',
        operator: 'Gestionnaire Intrants',
        notes: `Stock initial enregistré pour le fournisseur ${newItem.supplier}.`
      });
    }

    this.saveAll();
    return newItem;
  }

  updateRawMaterial(id: string, updates: Partial<RawMaterialStockItem>) {
    this.rawMaterials = this.rawMaterials.map(rm => {
      if (rm.id === id) {
        return { ...rm, ...updates };
      }
      return rm;
    });
    this.saveAll();
    return true;
  }

  deleteRawMaterial(id: string) {
    this.rawMaterials = this.rawMaterials.filter(rm => rm.id !== id);
    this.saveAll();
    return true;
  }

  // --- GENERAL STOCK MOVEMENTS & ADJUSTMENTS ---
  recordStockMovement(movement: Omit<StockMovement, 'id'>) {
    const id = `MVT-${String(this.stockMovements.length + 1).padStart(4, '0')}`;
    const newMovement: StockMovement = {
      ...movement,
      id,
      date: movement.date || new Date().toISOString().split('T')[0],
      time: movement.time || new Date().toTimeString().split(' ')[0].slice(0, 5)
    };
    this.stockMovements = [newMovement, ...this.stockMovements];
    this.saveAll();
    return newMovement;
  }

  adjustStock(
    itemType: 'produit_fini' | 'intrant',
    itemId: string,
    quantityChange: number, // Positive for entry, negative for exit
    reason: string,
    operator: string,
    unitCost?: number
  ) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

    if (itemType === 'produit_fini') {
      const prod = this.products.find(p => p.id === itemId);
      if (!prod) return false;
      const newStock = Math.max(0, prod.stock + quantityChange);
      prod.stock = newStock;
      
      const cost = unitCost || prod.unitCost || (prod.price * 0.6);
      this.recordStockMovement({
        date: dateStr,
        time: timeStr,
        itemType: 'produit_fini',
        itemId: prod.id,
        itemName: prod.name + (prod.variant ? ` (${prod.variant})` : ''),
        sector: prod.category,
        movementType: quantityChange >= 0 ? 'entree_achat' : 'sortie_perte_casse',
        quantity: Math.abs(quantityChange),
        unit: 'unités',
        unitCost: cost,
        totalCost: Math.abs(quantityChange) * cost,
        referenceDoc: 'Ajustement de stock',
        operator: operator || 'Gestionnaire de Stock',
        notes: reason || 'Mouvement de stock enregistré manuellement.'
      });
    } else {
      const mat = this.rawMaterials.find(m => m.id === itemId);
      if (!mat) return false;
      const newStock = Math.max(0, mat.currentStock + quantityChange);
      mat.currentStock = newStock;
      if (quantityChange > 0) {
        mat.lastRestockedDate = dateStr;
      }
      
      const cost = unitCost || mat.unitCost;
      this.recordStockMovement({
        date: dateStr,
        time: timeStr,
        itemType: 'intrant',
        itemId: mat.id,
        itemName: mat.name,
        sector: mat.sector,
        movementType: quantityChange >= 0 ? 'entree_achat' : 'sortie_consommation',
        quantity: Math.abs(quantityChange),
        unit: mat.unit,
        unitCost: cost,
        totalCost: Math.abs(quantityChange) * cost,
        referenceDoc: 'Ajustement intrants',
        operator: operator || 'Gestionnaire Intrants',
        notes: reason || 'Mouvement d\'intrant enregistré manuellement.'
      });
    }

    this.saveAll();
    return true;
  }

  // --- ENHANCED CLIENT RETURN & RMA PROCESSING ---
  processClientReturn(item: Omit<ClientReturn, 'id'>) {
    const id = `RET-${String(this.returns.length + 1).padStart(3, '0')}`;
    const creditRef = item.creditNoteRef || `AV-${new Date().getFullYear()}-${String(this.returns.length + 1).padStart(3, '0')}`;
    
    const newReturn: ClientReturn = {
      ...item,
      id,
      creditNoteRef: creditRef,
      status: item.status || 'valide'
    };

    this.returns = [newReturn, ...this.returns];

    // 1. Update the order status
    const order = this.orders.find(o => o.id === item.orderId);
    if (order) {
      order.status = 'retourne';
    }

    const dateStr = item.date || new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0].slice(0, 5);

    // 2. Process stock actions for each returned item
    item.itemsReturned.forEach(retItem => {
      const prod = this.products.find(p => p.id === retItem.productId);
      if (!prod) return;

      const action = retItem.action || 'remise_en_stock';

      if (action === 'remise_en_stock') {
        prod.stock += retItem.quantity;
        this.recordStockMovement({
          date: dateStr,
          time: timeStr,
          itemType: 'produit_fini',
          itemId: prod.id,
          itemName: prod.name + (prod.variant ? ` (${prod.variant})` : ''),
          sector: prod.category,
          movementType: 'entree_retour_client',
          quantity: retItem.quantity,
          unit: 'unités',
          unitCost: prod.unitCost || (prod.price * 0.6),
          totalCost: retItem.quantity * (prod.unitCost || (prod.price * 0.6)),
          referenceDoc: `${newReturn.id} (${item.orderId})`,
          operator: item.handledBy || 'Service Retours Clients',
          notes: `Réintégration en stock : ${item.reason}`
        });
      } else if (action === 'rebut_perte') {
        // Stock remains physically removed / damaged, log loss movement
        this.recordStockMovement({
          date: dateStr,
          time: timeStr,
          itemType: 'produit_fini',
          itemId: prod.id,
          itemName: prod.name + (prod.variant ? ` (${prod.variant})` : ''),
          sector: prod.category,
          movementType: 'sortie_perte_casse',
          quantity: retItem.quantity,
          unit: 'unités',
          unitCost: prod.unitCost || (prod.price * 0.6),
          totalCost: retItem.quantity * (prod.unitCost || (prod.price * 0.6)),
          referenceDoc: `${newReturn.id} (${item.orderId})`,
          operator: item.handledBy || 'Contrôle Qualité',
          notes: `Mise au rebut pour avarie/défaut : ${item.reason}`
        });
      }
    });

    // 3. Automated Accounting Entry for Client Return / Credit Note (SYSCOHADA)
    if (item.refundAmount > 0) {
      const entryId = `ECR-${new Date().getFullYear()}-RET-${String(this.journalEntries.length + 1).padStart(3, '0')}`;
      const lines = [
        {
          accountCode: '709', // RRR accordés (Rabais, Remises, Ristournes & Retours)
          accountLabel: 'Rabais, remises et ristournes accordés / Avoirs sur retours',
          debit: item.refundAmount,
          credit: 0,
          sector: 'general' as const,
          note: `Avoir ${creditRef} accordé à ${item.clientName || 'Client'} - Motif: ${item.reason}`
        },
        {
          accountCode: item.refundMethod === 'especes' ? '5712' : item.refundMethod === 'momo' ? '5713' : '4111',
          accountLabel: item.refundMethod === 'especes' 
            ? 'Caisse POS Comptoir (Remboursement espèces)' 
            : item.refundMethod === 'momo' 
              ? 'Trésorerie Mobile Money - MTN MoMo' 
              : 'Clients - Ventes & Distributeurs (Créance diminuée)',
          debit: 0,
          credit: item.refundAmount,
          sector: 'general' as const,
          note: `Règlement avoir / diminution créance ${creditRef}`
        }
      ];

      const journalEntry: SyscohadaJournalEntry = {
        id: entryId,
        date: dateStr,
        journal: item.refundMethod === 'especes' ? 'Caisse' : item.refundMethod === 'momo' ? 'Caisse' : 'Ventes',
        pieceRef: creditRef,
        label: `Avoir retour client ${creditRef} - ${item.clientName || item.orderId}`,
        lines,
        totalDebit: item.refundAmount,
        totalCredit: item.refundAmount,
        validated: true,
        source: 'auto_order',
        createdAt: new Date().toISOString()
      };

      this.journalEntries = [journalEntry, ...this.journalEntries];
    }

    this.saveAll();
    return newReturn;
  }

  addExpense(item: Omit<Expense, 'id'>) {
    const id = `EXP-${101 + this.expenses.length}`;
    const newItem = { ...item, id };
    this.expenses = [...this.expenses, newItem];
    this.saveAll();
    return newItem;
  }

  deleteExpense(id: string) {
    this.expenses = this.expenses.filter(e => e.id !== id);
    this.saveAll();
    return true;
  }

  addJuiceBatch(item: Omit<JuiceBatch, 'id' | 'isCompleted'>) {
    const id = `JUS-BAT-${String(this.juiceBatches.length + 1).padStart(3, '0')}`;
    const newItem: JuiceBatch = { ...item, id, isCompleted: true };
    this.juiceBatches = [...this.juiceBatches, newItem];

    const nowStr = new Date().toTimeString().split(' ')[0].slice(0, 5);

    // Add to finished products inventory (Jus)
    this.products = this.products.map(p => {
      if (p.id === 'PROD-JUS-GIA-1' && item.flavor.includes('Gingembre') && item.bottledQty1L > 0) {
        this.recordStockMovement({
          date: item.date,
          time: nowStr,
          itemType: 'produit_fini',
          itemId: p.id,
          itemName: p.name,
          sector: 'jus',
          movementType: 'entree_production',
          quantity: item.bottledQty1L,
          unit: 'bouteilles',
          unitCost: 800,
          totalCost: item.bottledQty1L * 800,
          referenceDoc: id,
          operator: 'Responsable Atelier Jus',
          notes: `Embouteillage 1L lot ${id} (${item.flavor})`
        });
        return { ...p, stock: p.stock + item.bottledQty1L };
      }
      if (p.id === 'PROD-JUS-GIA-250' && item.flavor.includes('Gingembre') && item.bottledQty250ml > 0) {
        this.recordStockMovement({
          date: item.date,
          time: nowStr,
          itemType: 'produit_fini',
          itemId: p.id,
          itemName: p.name,
          sector: 'jus',
          movementType: 'entree_production',
          quantity: item.bottledQty250ml,
          unit: 'bouteilles',
          unitCost: 250,
          totalCost: item.bottledQty250ml * 250,
          referenceDoc: id,
          operator: 'Responsable Atelier Jus',
          notes: `Embouteillage 250ml lot ${id} (${item.flavor})`
        });
        return { ...p, stock: p.stock + item.bottledQty250ml };
      }
      if (p.id === 'PROD-JUS-HIB-1' && item.flavor.includes('Hibiscus') && item.bottledQty1L > 0) {
        this.recordStockMovement({
          date: item.date,
          time: nowStr,
          itemType: 'produit_fini',
          itemId: p.id,
          itemName: p.name,
          sector: 'jus',
          movementType: 'entree_production',
          quantity: item.bottledQty1L,
          unit: 'bouteilles',
          unitCost: 950,
          totalCost: item.bottledQty1L * 950,
          referenceDoc: id,
          operator: 'Responsable Atelier Jus',
          notes: `Embouteillage 1L Hibiscus lot ${id}`
        });
        return { ...p, stock: p.stock + item.bottledQty1L };
      }
      return p;
    });

    this.saveAll();
    return newItem;
  }

  addTeaBatch(item: Omit<TeaBatch, 'id' | 'isCompleted'>) {
    const id = `THE-BAT-${String(this.teaBatches.length + 1).padStart(3, '0')}`;
    const newItem: TeaBatch = { ...item, id, isCompleted: true };
    this.teaBatches = [...this.teaBatches, newItem];

    const nowStr = new Date().toTimeString().split(' ')[0].slice(0, 5);

    // Add to finished products inventory (Thés)
    this.products = this.products.map(p => {
      if (p.id === 'PROD-THE-MOR' && item.blendName.includes('Moringa') && item.packagedQty50g > 0) {
        this.recordStockMovement({
          date: item.date,
          time: nowStr,
          itemType: 'produit_fini',
          itemId: p.id,
          itemName: p.name,
          sector: 'the',
          movementType: 'entree_production',
          quantity: item.packagedQty50g,
          unit: 'sachets',
          unitCost: 1100,
          totalCost: item.packagedQty50g * 1100,
          referenceDoc: id,
          operator: 'Opérateur Tisanes',
          notes: `Conditionnement lot thé ${id} (${item.blendName})`
        });
        return { ...p, stock: p.stock + item.packagedQty50g };
      }
      if (p.id === 'PROD-THE-CIT' && item.blendName.includes('Citronnelle') && item.packagedQty50g > 0) {
        this.recordStockMovement({
          date: item.date,
          time: nowStr,
          itemType: 'produit_fini',
          itemId: p.id,
          itemName: p.name,
          sector: 'the',
          movementType: 'entree_production',
          quantity: item.packagedQty50g,
          unit: 'sachets',
          unitCost: 850,
          totalCost: item.packagedQty50g * 850,
          referenceDoc: id,
          operator: 'Opérateur Tisanes',
          notes: `Conditionnement lot tisane ${id} (${item.blendName})`
        });
        return { ...p, stock: p.stock + item.packagedQty50g };
      }
      return p;
    });

    this.saveAll();
    return newItem;
  }

  addBooking(item: Omit<HotelBooking, 'id' | 'totalBilled'>) {
    const id = `BKG-${String(this.bookings.length + 1).padStart(3, '0')}`;
    const room = this.rooms.find(r => r.id === item.roomId);
    if (!room) return null;

    // Calculate room costs
    const nights = Math.max(1, Math.round((new Date(item.checkOut).getTime() - new Date(item.checkIn).getTime()) / (1000 * 60 * 60 * 24)));
    const roomCost = nights * room.pricePerNight;
    const totalBilled = roomCost + item.extrasBilled;

    // Change room status
    room.status = 'occupe';

    const newItem: HotelBooking = { ...item, id, totalBilled };
    this.bookings = [...this.bookings, newItem];
    this.saveAll();
    return newItem;
  }

  completeBooking(bookingId: string) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'termine';
      const room = this.rooms.find(r => r.id === booking.roomId);
      if (room) {
        room.status = 'en_nettoyage';
      }
      this.saveAll();
    }
  }

  addExtrasToBooking(bookingId: string, amount: number) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.extrasBilled += amount;
      booking.totalBilled += amount;
      this.saveAll();
    }
  }

  // --- Conference Rooms Methods ---
  addConferenceHall(item: Omit<ConferenceHall, 'id'>) {
    const id = `HALL-${String(this.conferenceHalls.length + 1).padStart(3, '0')}`;
    const newItem: ConferenceHall = { ...item, id };
    this.conferenceHalls = [...this.conferenceHalls, newItem];
    this.saveAll();
    return newItem;
  }

  addConferenceBooking(item: Omit<ConferenceBooking, 'id' | 'createdAt'>) {
    const id = `CONF-${String(this.conferenceBookings.length + 1).padStart(3, '0')}`;
    const newItem: ConferenceBooking = {
      ...item,
      id,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Update hall status if in progress
    const hall = this.conferenceHalls.find(h => h.id === item.hallId);
    if (hall && item.status === 'en_cours') {
      hall.status = 'reserve';
    }

    this.conferenceBookings = [...this.conferenceBookings, newItem];
    this.saveAll();
    return newItem;
  }

  completeConferenceBooking(bookingId: string) {
    const booking = this.conferenceBookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'termine';
      const hall = this.conferenceHalls.find(h => h.id === booking.hallId);
      if (hall) {
        hall.status = 'disponible';
      }
      this.saveAll();
    }
  }

  cancelConferenceBooking(bookingId: string) {
    const booking = this.conferenceBookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'annule';
      const hall = this.conferenceHalls.find(h => h.id === booking.hallId);
      if (hall) {
        hall.status = 'disponible';
      }
      this.saveAll();
    }
  }

  addExtrasToConferenceBooking(bookingId: string, amount: number, serviceName: string) {
    const booking = this.conferenceBookings.find(b => b.id === bookingId);
    if (booking) {
      booking.extrasBilled += amount;
      booking.totalBilled += amount;
      booking.selectedServices = [
        ...(booking.selectedServices || []),
        { name: serviceName, price: amount }
      ];
      this.saveAll();
    }
  }


  // --- Traceability lookup engine ---
  getTraceabilityHistory(lotNumber: string) {
    const bottling = this.bottlings.find(b => b.batchNumber === lotNumber);
    if (!bottling) return null;

    const tank = this.tanks.find(t => t.id === bottling.tankId);
    // Find extraction logs
    const extraction = this.extractions.find(e => e.tankId === bottling.tankId);
    const harvestsUsed = extraction 
      ? this.harvests.filter(h => extraction.harvestIds.includes(h.id)) 
      : [];
    
    const hivesLinked = harvestsUsed.map(h => this.hives.find(hive => hive.id === h.hiveId)).filter(Boolean) as InstalledHive[];
    const preformsLinked = hivesLinked.map(hive => this.preforms.find(pf => pf.id === hive.preformId)).filter(Boolean) as BambooHivePreform[];
    const inspectionsLinked = hivesLinked.reduce((acc, h) => {
      const hInsp = this.inspections.filter(i => i.hiveId === h.id);
      return [...acc, ...hInsp];
    }, [] as HiveInspection[]);

    return {
      bottling,
      tank,
      extraction,
      harvests: harvestsUsed,
      hives: hivesLinked,
      preforms: preformsLinked,
      inspections: inspectionsLinked
    };
  }

  clearAllUserData() {
    this.preforms = [];
    this.hives = [];
    this.inspections = [];
    this.harvests = [];
    this.campaigns = [];
    this.extractions = [];
    this.tanks = [
      { id: 'TANK-01', name: 'Cuve Égouttage A', capacityKg: 200, currentWeightKg: 0 },
      { id: 'TANK-02', name: 'Cuve Égouttage B', capacityKg: 100, currentWeightKg: 0 }
    ];
    this.bottlings = [];
    this.orders = [];
    this.deliveryNotes = [];
    this.returns = [];
    this.expenses = [];
    this.juiceBatches = [];
    this.teaBatches = [];
    this.bookings = [];
    this.conferenceBookings = [];
    
    // Set all product stocks to 0
    this.products.forEach(p => {
      p.stock = 0;
      p.batchNumber = undefined;
    });

    // Reset status of all hotel rooms and conference halls to available
    this.rooms.forEach(r => {
      r.status = 'disponible';
    });
    this.conferenceHalls.forEach(h => {
      h.status = 'disponible';
    });

    // Clear custom choice lists so they can start fresh
    this.locations = [];
    this.artisans = [];
    this.juiceFlavors = [];
    this.teaBlends = [];
    this.clients = [];
    this.carriers = [];
    this.clientProfiles = [];

    this.saveAll();
  }

  // --- Authorized Users Management Methods & Multi-Device Sync ---
  async syncUsersWithServer(): Promise<AuthorizedUser[]> {
    if (typeof window === 'undefined') return this.users;
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users) && data.users.length > 0) {
          const serverUsers: AuthorizedUser[] = data.users;
          // Merge: prioritize server users while retaining any locally created users not yet uploaded
          const mergedMap = new Map<string, AuthorizedUser>();
          serverUsers.forEach(u => mergedMap.set(u.id, u));
          this.users.forEach(localU => {
            if (!mergedMap.has(localU.id)) {
              // Also check by emailOrLogin
              const matchByLogin = serverUsers.find(
                su => su.emailOrLogin.trim().toLowerCase() === localU.emailOrLogin.trim().toLowerCase()
              );
              if (!matchByLogin) {
                mergedMap.set(localU.id, localU);
              }
            }
          });
          this.users = Array.from(mergedMap.values());
          setLocalStorageItem('users', this.users);
          return this.users;
        }
      }
    } catch (e) {
      // In offline mode or client-only fallback, continue with local storage
      console.warn('Backend sync unreachable, using local storage cache for users', e);
    }
    return this.users;
  }

  async persistUsersToServer(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: this.users })
      });
      return res.ok;
    } catch (e) {
      console.warn('Could not persist users to backend', e);
      return false;
    }
  }

  async fetchLatestUsers(): Promise<AuthorizedUser[]> {
    return this.syncUsersWithServer();
  }

  addAuthorizedUser(user: Omit<AuthorizedUser, 'id' | 'addedAt'>) {
    const id = `USR-${String(this.users.length + 1).padStart(3, '0')}`;
    const newUser: AuthorizedUser = {
      ...user,
      id,
      addedAt: new Date().toISOString().split('T')[0]
    };
    this.users = [...this.users, newUser];
    this.saveAll();
    this.persistUsersToServer();
    return newUser;
  }

  updateAuthorizedUser(id: string, updates: Partial<AuthorizedUser>) {
    this.users = this.users.map(u => u.id === id ? { ...u, ...updates } : u);
    this.saveAll();
    this.persistUsersToServer();
    return true;
  }

  toggleAuthorizedUserActive(id: string) {
    this.users = this.users.map(u => u.id === id ? { ...u, active: !u.active } : u);
    this.saveAll();
    this.persistUsersToServer();
    return true;
  }

  deleteAuthorizedUser(id: string) {
    // Ne pas permettre de supprimer le tout premier master user s'il est seul ou admin principal par défaut
    this.users = this.users.filter(u => u.id !== id);
    this.saveAll();
    this.persistUsersToServer();
    return true;
  }

  // --- POS / Point de Vente Management Methods ---
  getActivePosSession(): PosSession | undefined {
    return this.posSessions.find(s => s.status === 'ouvert');
  }

  openPosSession(cashierName: string, initialCash: number): PosSession {
    // Close any previous open session first
    this.posSessions = this.posSessions.map(s => s.status === 'ouvert' ? { ...s, status: 'ferme', closedAt: new Date().toISOString() } : s);
    
    const id = `POS-SES-${String(this.posSessions.length + 1).padStart(3, '0')}`;
    const newSession: PosSession = {
      id,
      openedAt: new Date().toISOString(),
      cashierName,
      initialCash,
      totalCashSales: 0,
      totalMomoSales: 0,
      totalCardSales: 0,
      totalCreditSales: 0,
      totalSalesCount: 0,
      totalRevenue: 0,
      status: 'ouvert'
    };
    this.posSessions = [newSession, ...this.posSessions];
    this.saveAll();
    return newSession;
  }

  closePosSession(sessionId: string, actualCashInDrawer: number, notes?: string): boolean {
    const session = this.posSessions.find(s => s.id === sessionId);
    if (!session) return false;

    const theoreticalCash = session.initialCash + session.totalCashSales;
    const diff = actualCashInDrawer - theoreticalCash;

    this.posSessions = this.posSessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          status: 'ferme',
          closedAt: new Date().toISOString(),
          actualCashInDrawer,
          cashDifference: diff,
          notes: notes || s.notes
        };
      }
      return s;
    });
    this.saveAll();
    return true;
  }

  recordPosSale(sale: {
    clientName: string;
    items: { productId: string; variantName: string; quantity: number; price: number }[];
    totalAmount: number;
    discountPercent?: number;
    discountAmount?: number;
    paymentMethod: 'especes' | 'momo' | 'carte' | 'virement' | 'cheque' | 'credit' | 'autre';
    momoProvider?: 'MTN MoMo' | 'Moov Money' | 'Wave' | 'Celtiis Cash' | 'Autre';
    momoRef?: string;
    amountReceived?: number;
    changeReturned?: number;
    cashierName?: string;
  }): SalesOrder {
    const id = `CMD-POS-${1000 + this.orders.length + 1}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

    const paid = sale.paymentMethod === 'credit' ? 0 : sale.totalAmount;

    const newOrder: SalesOrder = {
      id,
      date: dateStr,
      time: timeStr,
      clientName: sale.clientName || 'Client Comptoir (Passage)',
      items: sale.items,
      totalAmount: sale.totalAmount,
      paidAmount: paid,
      status: 'livre', // Immediatement remis au client
      deliveryNoteCreated: false,
      discountPercent: sale.discountPercent || 0,
      discountAmount: sale.discountAmount || 0,
      paymentMethod: sale.paymentMethod,
      momoProvider: sale.momoProvider,
      momoRef: sale.momoRef,
      amountReceived: sale.amountReceived,
      changeReturned: sale.changeReturned,
      source: 'comptoir_pos',
      cashierName: sale.cashierName || 'Caissier'
    };

    // 1. Subtract product stock and log stock movements
    this.products = this.products.map(prod => {
      const orderItem = sale.items.find(it => it.productId === prod.id);
      if (orderItem) {
        // Log movement
        this.recordStockMovement({
          date: dateStr,
          time: timeStr,
          itemType: 'produit_fini',
          itemId: prod.id,
          itemName: prod.name + (prod.variant ? ` (${prod.variant})` : ''),
          sector: prod.category,
          movementType: 'sortie_vente',
          quantity: orderItem.quantity,
          unit: 'unités',
          unitCost: prod.unitCost || (prod.price * 0.6),
          totalCost: orderItem.quantity * (prod.unitCost || (prod.price * 0.6)),
          referenceDoc: id,
          operator: sale.cashierName || 'Caisse POS',
          notes: `Vente comptoir POS à ${sale.clientName || 'Client Passage'}.`
        });
        return { ...prod, stock: Math.max(0, prod.stock - orderItem.quantity) };
      }
      return prod;
    });

    // 2. Add to orders
    this.orders = [newOrder, ...this.orders];

    // 3. Update active POS session
    const activeSession = this.getActivePosSession();
    if (activeSession) {
      this.posSessions = this.posSessions.map(s => {
        if (s.id === activeSession.id) {
          const cashInc = sale.paymentMethod === 'especes' ? sale.totalAmount : 0;
          const momoInc = sale.paymentMethod === 'momo' ? sale.totalAmount : 0;
          const cardInc = sale.paymentMethod === 'carte' ? sale.totalAmount : 0;
          const creditInc = sale.paymentMethod === 'credit' ? sale.totalAmount : 0;

          return {
            ...s,
            totalCashSales: s.totalCashSales + cashInc,
            totalMomoSales: s.totalMomoSales + momoInc,
            totalCardSales: s.totalCardSales + cardInc,
            totalCreditSales: s.totalCreditSales + creditInc,
            totalSalesCount: s.totalSalesCount + 1,
            totalRevenue: s.totalRevenue + (sale.paymentMethod !== 'credit' ? sale.totalAmount : 0)
          };
        }
        return s;
      });
    }

    // 4. Update client profile if not comptoir
    if (sale.clientName && sale.clientName !== 'Client Comptoir (Passage)' && sale.clientName.trim() !== '') {
      const profileExists = this.clientProfiles.some(cp => cp.clientName.trim().toLowerCase() === sale.clientName.trim().toLowerCase());
      if (!profileExists) {
        this.clientProfiles.push({
          clientName: sale.clientName.trim(),
          phone: '',
          email: '',
          address: 'Boutique Comptoir',
          creditLimit: 200000,
          notes: 'Client créé depuis la caisse tactile POS.'
        });
      }
    }

    // 5. Generate Accounting Entry in Journal Caisse/Ventes
    const isMomo = sale.paymentMethod === 'momo';
    const isCredit = sale.paymentMethod === 'credit';
    const isBank = sale.paymentMethod === 'carte' || sale.paymentMethod === 'virement' || sale.paymentMethod === 'cheque';
    const treasuryAccountCode = isMomo ? (sale.momoProvider === 'Moov Money' ? '5714' : '5713') : (isBank ? '5211' : (isCredit ? '4111' : '5712'));
    const treasuryAccountLabel = isMomo ? (sale.momoProvider === 'Moov Money' ? 'Trésorerie Mobile Money - Moov Money' : 'Trésorerie Mobile Money - MTN MoMo') : (isBank ? 'Banque (Compte courant BOA / Ecobank)' : (isCredit ? 'Clients - Ventes & Distributeurs' : 'Caisse POS Comptoir (Boutique de vente)'));

    // Separate revenue by product categories
    let mielAmount = 0;
    let jusAmount = 0;
    let theAmount = 0;
    let hotelAmount = 0;
    let confAmount = 0;
    let autreAmount = 0;

    sale.items.forEach(it => {
      const prod = this.products.find(p => p.id === it.productId);
      const cat = prod ? prod.category : 'autre';
      const lineTotal = it.price * it.quantity;
      if (cat === 'miel') mielAmount += lineTotal;
      else if (cat === 'jus') jusAmount += lineTotal;
      else if (cat === 'the') theAmount += lineTotal;
      else if (cat === 'hotel') hotelAmount += lineTotal;
      else if (cat === 'conference') confAmount += lineTotal;
      else autreAmount += lineTotal;
    });

    // Adjust for global discount if any
    const rawSum = mielAmount + jusAmount + theAmount + hotelAmount + confAmount + autreAmount;
    const ratio = rawSum > 0 ? (sale.totalAmount / rawSum) : 1;

    const creditLines: { accountCode: string; accountLabel: string; debit: number; credit: number; sector?: 'miel' | 'jus' | 'the' | 'hotel' | 'conference' | 'general' }[] = [];
    if (mielAmount > 0) {
      creditLines.push({ accountCode: '7011', accountLabel: 'Ventes de Miel de Bambou & Produits Ruche', debit: 0, credit: Math.round(mielAmount * ratio), sector: 'miel' });
    }
    if (jusAmount > 0) {
      creditLines.push({ accountCode: '7012', accountLabel: 'Ventes de Jus de Fruits & Nectars Naturels', debit: 0, credit: Math.round(jusAmount * ratio), sector: 'jus' });
    }
    if (theAmount > 0) {
      creditLines.push({ accountCode: '7013', accountLabel: 'Ventes de Thés & Infusions de Brousse', debit: 0, credit: Math.round(theAmount * ratio), sector: 'the' });
    }
    if (hotelAmount > 0) {
      creditLines.push({ accountCode: '7061', accountLabel: 'Prestations Hébergement Éco-Lodge', debit: 0, credit: Math.round(hotelAmount * ratio), sector: 'hotel' });
    }
    if (confAmount > 0) {
      creditLines.push({ accountCode: '7062', accountLabel: 'Prestations Salles de Conférence & Séminaires', debit: 0, credit: Math.round(confAmount * ratio), sector: 'conference' });
    }
    if (autreAmount > 0 || creditLines.length === 0) {
      const remainingCredit = sale.totalAmount - creditLines.reduce((s, l) => s + l.credit, 0);
      creditLines.push({ accountCode: '707', accountLabel: 'Ventes Directes Boutique & Dégustations', debit: 0, credit: Math.max(0, remainingCredit), sector: 'general' });
    }

    // Ensure total credits match totalDebit exactly
    const actualCreditTotal = creditLines.reduce((s, l) => s + l.credit, 0);
    if (actualCreditTotal !== sale.totalAmount && creditLines.length > 0) {
      creditLines[0].credit += (sale.totalAmount - actualCreditTotal);
    }

    const autoEntry: SyscohadaJournalEntry = {
      id: `ECR-POS-${Date.now().toString().slice(-6)}`,
      date: dateStr,
      journal: isBank ? 'Banque' : (isCredit ? 'Ventes' : 'Caisse'),
      pieceRef: id,
      label: `Vente Caisse POS #${id} - ${sale.clientName}`,
      lines: [
        {
          accountCode: treasuryAccountCode,
          accountLabel: treasuryAccountLabel,
          debit: sale.totalAmount,
          credit: 0,
          sector: 'general'
        },
        ...creditLines
      ],
      totalDebit: sale.totalAmount,
      totalCredit: sale.totalAmount,
      validated: true,
      source: 'auto_pos',
      createdAt: now.toISOString()
    };

    this.journalEntries = [autoEntry, ...this.journalEntries];

    this.saveAll();
    return newOrder;
  }

  // --- SYSCOHADA Professional Accounting Methods ---
  addJournalEntry(entry: Omit<SyscohadaJournalEntry, 'id' | 'createdAt'>): SyscohadaJournalEntry {
    const id = `ECR-${new Date().getFullYear()}-${String(this.journalEntries.length + 1).padStart(4, '0')}`;
    const newEntry: SyscohadaJournalEntry = {
      ...entry,
      id,
      createdAt: new Date().toISOString()
    };
    this.journalEntries = [newEntry, ...this.journalEntries];
    this.saveAll();
    return newEntry;
  }

  deleteJournalEntry(id: string): boolean {
    this.journalEntries = this.journalEntries.filter(e => e.id !== id);
    this.saveAll();
    return true;
  }

  addSyscohadaAccount(account: SyscohadaAccount): boolean {
    const exists = this.syscohadaAccounts.some(a => a.code === account.code);
    if (exists) return false;
    this.syscohadaAccounts = [...this.syscohadaAccounts, { ...account, isCustom: true }];
    this.saveAll();
    return true;
  }

  updateSyscohadaAccount(code: string, updates: Partial<SyscohadaAccount>): boolean {
    this.syscohadaAccounts = this.syscohadaAccounts.map(a => a.code === code ? { ...a, ...updates } : a);
    this.saveAll();
    return true;
  }

  deleteSyscohadaAccount(code: string): boolean {
    this.syscohadaAccounts = this.syscohadaAccounts.filter(a => a.code !== code);
    this.saveAll();
    return true;
  }

  addReconciliation(rec: Omit<CashReconciliationRecord, 'id'>): CashReconciliationRecord {
    const id = `REC-${Date.now().toString().slice(-5)}`;
    const newRec: CashReconciliationRecord = {
      ...rec,
      id
    };
    this.reconciliations = [newRec, ...this.reconciliations];
    this.saveAll();
    return newRec;
  }

  deleteReconciliation(id: string): boolean {
    this.reconciliations = this.reconciliations.filter(r => r.id !== id);
    this.saveAll();
    return true;
  }

  // ==========================================================================
  // MÉTHODES DE TRAÇABILITÉ INTÉGRALE : LES TRIANGLES – Yamtãanu
  // ==========================================================================

  // --- 1. Propriétaires de ruches (Apiculteurs) ---
  generateBeekeeperNumber(): string {
    const existingNums = this.beekeepers.map(b => {
      const match = b.memberNumber.match(/YAM-PRO-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums, 0) : 0;
    return `YAM-PRO-${String(maxNum + 1).padStart(6, '0')}`;
  }

  addBeekeeper(data: Omit<BeekeeperOwner, 'id' | 'memberNumber'> & { customMemberNumber?: string }): BeekeeperOwner {
    const id = `BKP-${Date.now().toString().slice(-6)}`;
    const memberNumber = data.customMemberNumber || this.generateBeekeeperNumber();
    const newBeekeeper: BeekeeperOwner = {
      id,
      memberNumber,
      fullName: data.fullName,
      roleTitle: data.roleTitle || 'Apiculteur',
      phone: data.phone,
      commune: data.commune,
      village: data.village,
      photoUrl: data.photoUrl,
      joinDate: data.joinDate,
      status: data.status || 'actif',
      cinOrIdCard: data.cinOrIdCard,
      validationStatus: data.validationStatus || 'valide',
      validatedBy: data.validatedBy || 'DG SARKI Yantannou',
      validationDate: data.validationDate || new Date().toISOString().split('T')[0],
      notes: data.notes
    };
    this.beekeepers = [newBeekeeper, ...this.beekeepers];
    this.saveAll();
    return newBeekeeper;
  }

  updateBeekeeper(id: string, updates: Partial<BeekeeperOwner>): boolean {
    this.beekeepers = this.beekeepers.map(b => b.id === id ? { ...b, ...updates } : b);
    this.saveAll();
    return true;
  }

  deleteBeekeeper(id: string): boolean {
    this.beekeepers = this.beekeepers.filter(b => b.id !== id);
    this.saveAll();
    return true;
  }

  // --- 2. Ruchers ---
  generateApiaryNumber(): string {
    const existingNums = this.apiaries.map(a => {
      const match = a.apiaryNumber.match(/YAM-RCR-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums, 0) : 0;
    return `YAM-RCR-${String(maxNum + 1).padStart(6, '0')}`;
  }

  addApiary(data: Omit<Apiary, 'id' | 'apiaryNumber'> & { customApiaryNumber?: string }): Apiary {
    const id = `API-${Date.now().toString().slice(-6)}`;
    const apiaryNumber = data.customApiaryNumber || this.generateApiaryNumber();
    const newApiary: Apiary = {
      id,
      apiaryNumber,
      name: data.name,
      ownerId: data.ownerId,
      ownerName: data.ownerName,
      gpsCoordinates: data.gpsCoordinates,
      village: data.village,
      commune: data.commune,
      installationDate: data.installationDate,
      accessConditions: data.accessConditions,
      vegetationType: data.vegetationType,
      status: data.status || 'actif',
      photos: data.photos || [],
      notes: data.notes
    };
    this.apiaries = [newApiary, ...this.apiaries];
    this.saveAll();
    return newApiary;
  }

  updateApiary(id: string, updates: Partial<Apiary>): boolean {
    this.apiaries = this.apiaries.map(a => a.id === id ? { ...a, ...updates } : a);
    this.saveAll();
    return true;
  }

  deleteApiary(id: string): boolean {
    this.apiaries = this.apiaries.filter(a => a.id !== id);
    this.saveAll();
    return true;
  }

  // --- 3. Ruches ---
  // Règle d'or : Le numéro d'une ruche ne contient ni celui du propriétaire ni du rucher
  // Format : YAM/26/001
  generateHiveNumber(yearStr = '26'): string {
    const regex = new RegExp(`^YAM\\/${yearStr}\\/(\\d+)$`);
    const existingSeq = this.trackedHives.map(h => {
      const match = h.hiveNumber.match(regex);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxSeq = existingSeq.length > 0 ? Math.max(...existingSeq, 0) : 0;
    return `YAM/${yearStr}/${String(maxSeq + 1).padStart(3, '0')}`;
  }

  addTrackedHive(data: Omit<TrackedHive, 'id' | 'hiveNumber' | 'history'> & { customHiveNumber?: string }): TrackedHive {
    const id = `THIVE-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5)}`;
    const hiveNumber = data.customHiveNumber?.trim() || this.generateHiveNumber();
    const matchedApiary = this.apiaries.find(a => a.id === data.apiaryId);
    const resolvedGps = data.gpsCoordinates?.trim() || matchedApiary?.gpsCoordinates;
    const modeLabel =
      data.originMode === 'piege_appatee'
        ? 'Ruche piège appâtée'
        : data.originMode === 'couplage'
        ? `Couplage${data.coupledWithHive ? ` avec ${data.coupledWithHive}` : ''}`
        : data.originMode === 'division'
        ? `Division${data.coupledWithHive ? ` depuis ${data.coupledWithHive}` : ''}`
        : data.originMode === 'transvasement'
        ? 'Transvasement colonie'
        : 'Essaim / Installation directe';

    const initialHistory: HiveOccupationHistory = {
      id: `HIST-${Date.now().toString().slice(-5)}-${Math.random().toString(36).slice(2, 5)}`,
      date: data.installationDate,
      event: data.originMode === 'couplage' ? 'couplage' : data.originMode === 'division' ? 'division' : 'installation',
      details: `Installation au rucher ${data.apiaryName} (${modeLabel} • ${data.category === 'ecolo_artisanale' ? 'Bambou écolo' : 'Ciment barrettes'})`,
      author: data.ownerName
    };

    const newHive: TrackedHive = {
      id,
      hiveNumber,
      apiaryId: data.apiaryId,
      apiaryNumber: data.apiaryNumber,
      apiaryName: data.apiaryName,
      ownerId: data.ownerId,
      ownerName: data.ownerName,
      gpsCoordinates: resolvedGps,
      originMode: data.originMode,
      coupledWithHive: data.coupledWithHive,
      category: data.category,
      installationDate: data.installationDate,
      colonizationStatus: data.colonizationStatus,
      lastColonizedDate: data.colonizationStatus !== 'vide' ? data.installationDate : undefined,
      colonyStrength: data.colonyStrength || 'forte',
      status: 'active',
      history: [initialHistory],
      notes: data.notes
    };

    this.trackedHives = [newHive, ...this.trackedHives];

    this.addHiveJournalEvent({
      hiveId: id,
      hiveNumber,
      apiaryId: data.apiaryId,
      apiaryName: data.apiaryName,
      date: data.installationDate,
      eventType: data.originMode === 'couplage' ? 'couplage' : data.originMode === 'division' ? 'division' : data.originMode === 'piege_appatee' ? 'appatage' : 'installation',
      coupledHiveNumber: data.coupledWithHive,
      colonyStatus: data.colonizationStatus,
      colonyHealth: data.colonyStrength === 'forte' ? 'vigoureuse' : 'normale',
      queenPresent: data.colonizationStatus !== 'vide',
      broodStatus: data.colonizationStatus !== 'vide' ? 'moyen' : 'absent',
      parasitesOrProblems: 'Aucun',
      actionsDone: `Installation de la ruche ${hiveNumber} (${modeLabel}) au rucher ${data.apiaryName}`,
      nextAction: data.colonizationStatus === 'vide' ? 'Vérifier prise d\'essaim sous 14 jours' : 'Visite de contrôle sous 21 jours',
      nextActionDate: new Date(Date.now() + (data.colonizationStatus === 'vide' ? 14 : 21) * 86400000).toISOString().split('T')[0],
      operatorName: data.ownerName,
      notes: data.notes
    });

    this.saveAll();
    return newHive;
  }

  addTrackedHivesBatch(
    data: Omit<TrackedHive, 'id' | 'hiveNumber' | 'history'> & {
      customPrefix?: string;
      customStartSeq?: number;
    },
    quantity: number
  ): TrackedHive[] {
    const safeQty = Math.max(1, Math.min(200, Math.floor(quantity || 1)));
    const created: TrackedHive[] = [];
    const newJournalEvents: HiveJournalEvent[] = [];
    const matchedApiary = this.apiaries.find(a => a.id === data.apiaryId);
    const resolvedGps = data.gpsCoordinates?.trim() || matchedApiary?.gpsCoordinates;
    const daysNext = data.colonizationStatus === 'vide' ? 14 : 21;
    const nextCheckDate = new Date(Date.now() + daysNext * 86400000).toISOString().split('T')[0];

    const modeLabel =
      data.originMode === 'piege_appatee'
        ? 'Ruche piège appâtée'
        : data.originMode === 'couplage'
        ? `Couplage${data.coupledWithHive ? ` avec ${data.coupledWithHive}` : ''}`
        : data.originMode === 'division'
        ? `Division${data.coupledWithHive ? ` depuis ${data.coupledWithHive}` : ''}`
        : data.originMode === 'transvasement'
        ? 'Transvasement'
        : 'Installation directe';

    const cleanPrefix = data.customPrefix?.trim();
    const startSeq = typeof data.customStartSeq === 'number' && data.customStartSeq > 0 ? data.customStartSeq : null;

    for (let i = 0; i < safeQty; i++) {
      const uidSuffix = `${i + 1}-${Math.random().toString(36).slice(2, 5)}`;
      const id = `THIVE-${Date.now().toString().slice(-6)}-${uidSuffix}`;
      const hiveNumber = cleanPrefix && startSeq !== null
        ? `${cleanPrefix}${String(startSeq + i).padStart(3, '0')}`
        : this.generateHiveNumber();

      const initialHistory: HiveOccupationHistory = {
        id: `HIST-${Date.now().toString().slice(-5)}-${uidSuffix}`,
        date: data.installationDate,
        event: data.originMode === 'couplage' ? 'couplage' : data.originMode === 'division' ? 'division' : 'installation',
        details: `Installation en lot au rucher ${data.apiaryName} (${modeLabel} • ${data.category === 'ecolo_artisanale' ? 'Bambou écolo' : 'Ciment barrettes'})`,
        author: data.ownerName
      };

      const newHive: TrackedHive = {
        id,
        hiveNumber,
        apiaryId: data.apiaryId,
        apiaryNumber: data.apiaryNumber,
        apiaryName: data.apiaryName,
        ownerId: data.ownerId,
        ownerName: data.ownerName,
        gpsCoordinates: resolvedGps,
        originMode: data.originMode,
        coupledWithHive: data.coupledWithHive,
        category: data.category,
        installationDate: data.installationDate,
        colonizationStatus: data.colonizationStatus,
        lastColonizedDate: data.colonizationStatus !== 'vide' ? data.installationDate : undefined,
        colonyStrength: data.colonyStrength || 'forte',
        status: 'active',
        history: [initialHistory],
        notes: data.notes
      };

      this.trackedHives = [newHive, ...this.trackedHives];
      created.push(newHive);

      newJournalEvents.push({
        id: `JEV-${Date.now().toString().slice(-6)}-${uidSuffix}`,
        hiveId: id,
        hiveNumber,
        apiaryId: data.apiaryId,
        apiaryName: data.apiaryName,
        date: data.installationDate,
        eventType: data.originMode === 'couplage' ? 'couplage' : data.originMode === 'division' ? 'division' : data.originMode === 'piege_appatee' ? 'appatage' : 'installation',
        coupledHiveNumber: data.coupledWithHive,
        colonyStatus: data.colonizationStatus,
        colonyHealth: data.colonyStrength === 'forte' ? 'vigoureuse' : 'normale',
        queenPresent: data.colonizationStatus !== 'vide',
        broodStatus: data.colonizationStatus !== 'vide' ? 'moyen' : 'absent',
        parasitesOrProblems: 'Aucun',
        actionsDone: `Installation de la ruche ${hiveNumber} (${modeLabel}) au rucher ${data.apiaryName}`,
        nextAction: data.colonizationStatus === 'vide' ? 'Contrôle prise d\'essaim (appâtage)' : 'Visite de contrôle sous 21 jours',
        nextActionDate: nextCheckDate,
        operatorName: data.ownerName,
        notes: data.notes
      });
    }

    this.journalEvents = [...newJournalEvents, ...this.journalEvents];
    this.saveAll();
    return created;
  }

  updateTrackedHive(id: string, updates: Partial<TrackedHive>): boolean {
    this.trackedHives = this.trackedHives.map(h => h.id === id ? { ...h, ...updates } : h);
    this.saveAll();
    return true;
  }

  moveTrackedHive(hiveId: string, targetApiary: Apiary, author: string, reason: string): boolean {
    const hive = this.trackedHives.find(h => h.id === hiveId);
    if (!hive) return false;

    const eventDate = new Date().toISOString().split('T')[0];
    const historyEvent: HiveOccupationHistory = {
      id: `HIST-${Date.now().toString().slice(-5)}`,
      date: eventDate,
      event: 'deplacement',
      details: `Déplacement depuis « ${hive.apiaryName} » vers « ${targetApiary.name} » (${targetApiary.village}). Motif: ${reason}`,
      author
    };

    this.trackedHives = this.trackedHives.map(h => {
      if (h.id === hiveId) {
        return {
          ...h,
          apiaryId: targetApiary.id,
          apiaryNumber: targetApiary.apiaryNumber,
          apiaryName: targetApiary.name,
          history: [historyEvent, ...h.history]
        };
      }
      return h;
    });

    this.addHiveJournalEvent({
      hiveId: hive.id,
      hiveNumber: hive.hiveNumber,
      apiaryId: targetApiary.id,
      apiaryName: targetApiary.name,
      date: eventDate,
      eventType: 'deplacement',
      colonyStatus: hive.colonizationStatus,
      colonyHealth: 'normale',
      queenPresent: hive.colonizationStatus !== 'vide',
      broodStatus: 'moyen',
      parasitesOrProblems: 'Aucun',
      actionsDone: `Transfert de la ruche vers le rucher ${targetApiary.name}. Motif: ${reason}`,
      nextAction: 'Contrôle acclimatation sous 7 jours',
      operatorName: author,
      notes: reason
    });

    this.saveAll();
    return true;
  }

  changeHiveOwner(hiveId: string, newOwner: BeekeeperOwner, author: string, reason: string): boolean {
    const hive = this.trackedHives.find(h => h.id === hiveId);
    if (!hive) return false;

    const eventDate = new Date().toISOString().split('T')[0];
    const historyEvent: HiveOccupationHistory = {
      id: `HIST-${Date.now().toString().slice(-5)}`,
      date: eventDate,
      event: 'changement_proprietaire',
      details: `Cession/Transfert de propriété depuis ${hive.ownerName} à ${newOwner.fullName} (${newOwner.memberNumber}). Motif: ${reason}`,
      author
    };

    this.trackedHives = this.trackedHives.map(h => {
      if (h.id === hiveId) {
        return {
          ...h,
          ownerId: newOwner.id,
          ownerName: newOwner.fullName,
          history: [historyEvent, ...h.history]
        };
      }
      return h;
    });

    this.saveAll();
    return true;
  }

  updateHiveColonization(
    hiveId: string, 
    newStatus: 'vide' | 'occupee' | 'recolonisee', 
    date: string, 
    author: string, 
    details: string,
    colonyStrength?: 'forte' | 'moyenne' | 'faible',
    customEventKind?: 'colonisation' | 'recolonisation' | 'depart' | 'appatage' | 'couplage' | 'division',
    coupledHiveNumber?: string
  ): boolean {
    const hive = this.trackedHives.find(h => h.id === hiveId);
    if (!hive) return false;

    const eventType: HiveOccupationHistory['event'] =
      customEventKind ||
      (newStatus === 'vide' ? 'depart' : (newStatus === 'recolonisee' ? 'recolonisation' : 'colonisation'));
    const fullDetails = coupledHiveNumber?.trim()
      ? `${details} (Ruche associée : ${coupledHiveNumber.trim()})`
      : details;

    const historyEvent: HiveOccupationHistory = {
      id: `HIST-${Date.now().toString().slice(-5)}-${Math.random().toString(36).slice(2, 5)}`,
      date,
      event: eventType,
      details: fullDetails,
      author
    };

    this.trackedHives = this.trackedHives.map(h => {
      if (h.id === hiveId) {
        return {
          ...h,
          colonizationStatus: newStatus,
          lastColonizedDate: newStatus !== 'vide' ? date : h.lastColonizedDate,
          lastDepartureDate: newStatus === 'vide' ? date : h.lastDepartureDate,
          colonyStrength: colonyStrength || h.colonyStrength,
          coupledWithHive: coupledHiveNumber?.trim() || h.coupledWithHive,
          originMode:
            eventType === 'couplage'
              ? 'couplage'
              : eventType === 'division'
              ? 'division'
              : eventType === 'appatage'
              ? 'piege_appatee'
              : h.originMode,
          history: [historyEvent, ...h.history]
        };
      }
      return h;
    });

    const mappedJournalEventType: HiveJournalEvent['eventType'] =
      eventType === 'depart'
        ? 'depart_essaim'
        : eventType;

    const journalEntry: HiveJournalEvent = {
      id: `JEV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5)}`,
      hiveId: hive.id,
      hiveNumber: hive.hiveNumber,
      apiaryId: hive.apiaryId,
      apiaryName: hive.apiaryName,
      date,
      eventType: mappedJournalEventType,
      coupledHiveNumber: coupledHiveNumber?.trim() || undefined,
      colonyStatus: newStatus,
      colonyHealth: newStatus === 'vide' ? 'sans_reine' : (colonyStrength === 'forte' ? 'vigoureuse' : colonyStrength === 'faible' ? 'affaiblie' : 'normale'),
      queenPresent: newStatus !== 'vide',
      broodStatus: newStatus === 'vide' ? 'absent' : 'moyen',
      parasitesOrProblems: 'Suivi dynamique colonie',
      actionsDone: fullDetails,
      nextAction: eventType === 'appatage' ? 'Contrôle colonisation sous 14 jours' : 'Visite de suivi sous 15 jours',
      operatorName: author
    };
    this.journalEvents = [journalEntry, ...this.journalEvents];

    this.saveAll();
    return true;
  }

  // --- 4. Journal d'événements & Suivi ---
  addHiveJournalEvent(event: Omit<HiveJournalEvent, 'id'>): HiveJournalEvent {
    const id = `JEV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5)}`;
    const newEvent: HiveJournalEvent = {
      ...event,
      id
    };
    this.journalEvents = [newEvent, ...this.journalEvents];

    // Mettre à jour l'état et l'historique de la ruche si précisé
    const historyMap: Partial<Record<HiveJournalEvent['eventType'], HiveOccupationHistory['event']>> = {
      appatage: 'appatage',
      colonisation: 'colonisation',
      recolonisation: 'recolonisation',
      couplage: 'couplage',
      division: 'division',
      depart_essaim: 'depart'
    };
    const mappedHistEvent = historyMap[event.eventType];

    this.trackedHives = this.trackedHives.map(h => {
      if (h.id === event.hiveId) {
        const nextHistory = mappedHistEvent
          ? [
              {
                id: `HIST-${Date.now().toString().slice(-5)}-${Math.random().toString(36).slice(2, 5)}`,
                date: event.date,
                event: mappedHistEvent,
                details: event.coupledHiveNumber
                  ? `${event.actionsDone} (Ruche associée : ${event.coupledHiveNumber})`
                  : event.actionsDone,
                author: event.operatorName
              },
              ...h.history
            ]
          : h.history;

        return {
          ...h,
          colonizationStatus: event.colonyStatus || h.colonizationStatus,
          lastColonizedDate: event.colonyStatus && event.colonyStatus !== 'vide' ? event.date : h.lastColonizedDate,
          lastDepartureDate: event.colonyStatus === 'vide' ? event.date : h.lastDepartureDate,
          coupledWithHive: event.coupledHiveNumber || h.coupledWithHive,
          colonyStrength: event.colonyHealth === 'vigoureuse' ? 'forte' : (event.colonyHealth === 'affaiblie' ? 'faible' : 'moyenne'),
          history: nextHistory
        };
      }
      return h;
    });

    this.saveAll();
    return newEvent;
  }

  addHiveJournalEventsBatch(
    hiveIds: string[],
    baseEvent: Omit<HiveJournalEvent, 'id' | 'hiveId' | 'hiveNumber' | 'apiaryId' | 'apiaryName'>
  ): HiveJournalEvent[] {
    const created: HiveJournalEvent[] = [];
    const targetSet = new Set(hiveIds);
    const hives = this.trackedHives.filter(h => targetSet.has(h.id));

    hives.forEach((hive, idx) => {
      const uid = `${idx + 1}-${Math.random().toString(36).slice(2, 5)}`;
      const ev: HiveJournalEvent = {
        ...baseEvent,
        id: `JEV-${Date.now().toString().slice(-6)}-${uid}`,
        hiveId: hive.id,
        hiveNumber: hive.hiveNumber,
        apiaryId: hive.apiaryId,
        apiaryName: hive.apiaryName
      };
      this.journalEvents = [ev, ...this.journalEvents];
      created.push(ev);
    });

    const historyMap: Partial<Record<HiveJournalEvent['eventType'], HiveOccupationHistory['event']>> = {
      appatage: 'appatage',
      colonisation: 'colonisation',
      recolonisation: 'recolonisation',
      couplage: 'couplage',
      division: 'division',
      depart_essaim: 'depart'
    };
    const mappedHistEvent = historyMap[baseEvent.eventType];

    this.trackedHives = this.trackedHives.map(h => {
      if (!targetSet.has(h.id)) return h;
      const nextHistory = mappedHistEvent
        ? [
            {
              id: `HIST-${Date.now().toString().slice(-5)}-${Math.random().toString(36).slice(2, 5)}`,
              date: baseEvent.date,
              event: mappedHistEvent,
              details: baseEvent.coupledHiveNumber
                ? `${baseEvent.actionsDone} (Ruche associée : ${baseEvent.coupledHiveNumber})`
                : baseEvent.actionsDone,
              author: baseEvent.operatorName
            },
            ...h.history
          ]
        : h.history;

      return {
        ...h,
        colonizationStatus: baseEvent.colonyStatus || h.colonizationStatus,
        lastColonizedDate: baseEvent.colonyStatus !== 'vide' ? baseEvent.date : h.lastColonizedDate,
        lastDepartureDate: baseEvent.colonyStatus === 'vide' ? baseEvent.date : h.lastDepartureDate,
        coupledWithHive: baseEvent.coupledHiveNumber || h.coupledWithHive,
        colonyStrength: baseEvent.colonyHealth === 'vigoureuse' ? 'forte' : (baseEvent.colonyHealth === 'affaiblie' ? 'faible' : 'moyenne'),
        history: nextHistory
      };
    });

    this.saveAll();
    return created;
  }

  deleteHiveJournalEvent(id: string): boolean {
    this.journalEvents = this.journalEvents.filter(e => e.id !== id);
    this.saveAll();
    return true;
  }

  // --- 5. Campagnes de récolte ---
  // Format : YAM-CAM-2026-01
  generateCampaignNumber(year: number, campaignType: 1 | 2): string {
    return `YAM-CAM-${year}-${String(campaignType).padStart(2, '0')}`;
  }

  addTraceCampaign(data: Omit<HarvestCampaignRecord, 'id' | 'campaignNumber'> & { customCampaignNumber?: string }): HarvestCampaignRecord {
    const id = `TCAM-${Date.now().toString().slice(-6)}`;
    const campaignNumber = data.customCampaignNumber || this.generateCampaignNumber(data.year, data.campaignType);
    const newCampaign: HarvestCampaignRecord = {
      ...data,
      id,
      campaignNumber,
      totalCollectedKg: data.totalCollectedKg || 0
    };
    this.traceCampaigns = [newCampaign, ...this.traceCampaigns];
    this.saveAll();
    return newCampaign;
  }

  updateTraceCampaign(id: string, updates: Partial<HarvestCampaignRecord>): boolean {
    this.traceCampaigns = this.traceCampaigns.map(c => c.id === id ? { ...c, ...updates } : c);
    this.saveAll();
    return true;
  }

  // --- 6. Seaux physiques & Récoltes ---
  // Numérotation seau : YAM-SEA-000001
  generateBucketNumber(): string {
    const existingSeq = this.physicalBuckets.map(b => {
      const match = b.bucketNumber.match(/YAM-SEA-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxSeq = existingSeq.length > 0 ? Math.max(...existingSeq, 0) : 0;
    return `YAM-SEA-${String(maxSeq + 1).padStart(6, '0')}`;
  }

  addPhysicalBucket(data: Omit<PhysicalBucket, 'bucketNumber' | 'totalUsesCount'> & { customBucketNumber?: string }): PhysicalBucket {
    const bucketNumber = data.customBucketNumber || this.generateBucketNumber();
    const newBucket: PhysicalBucket = {
      ...data,
      bucketNumber,
      totalUsesCount: 0
    };
    this.physicalBuckets = [...this.physicalBuckets, newBucket];
    this.saveAll();
    return newBucket;
  }

  // Numérotation récolte ruche : YAM-REC-000001
  generateHarvestNumber(): string {
    const existingSeq = this.hiveHarvests.map(h => {
      const match = h.harvestNumber.match(/YAM-REC-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxSeq = existingSeq.length > 0 ? Math.max(...existingSeq, 0) : 0;
    return `YAM-REC-${String(maxSeq + 1).padStart(6, '0')}`;
  }

  // Numérotation sous-lot : YAM-SLOT-000001
  generateSubLotNumber(): string {
    const existingSeq = this.bucketSubLots.map(s => {
      const match = s.subLotNumber.match(/YAM-SLOT-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxSeq = existingSeq.length > 0 ? Math.max(...existingSeq, 0) : 0;
    return `YAM-SLOT-${String(maxSeq + 1).padStart(6, '0')}`;
  }

  /**
   * Enregistre une récolte pour UNE SEULE ruche.
   * RÈGLE D'OR : Une récolte de ruche peut remplir 1 ou plusieurs seaux.
   * Mais un seau ne contient JAMAIS le miel de deux ruches !
   */
  recordHiveHarvest(params: {
    campaignId: string;
    hiveId: string;
    date: string;
    harvestOperator: string;
    weatherConditions?: string;
    notes?: string;
    buckets: {
      physicalBucketNumber: string;
      grossWeightKg: number;
      tareWeightKg: number;
      weighedMaterial: 'gateaux_de_miel' | 'miel_egoutte';
      destination: 'miellerie_centrale' | 'stockage_tampon' | 'egouttage_immediat';
      observations?: string;
    }[];
  }): { harvest: HiveHarvestRecord; subLots: BucketSubLot[] } {
    const hive = this.trackedHives.find(h => h.id === params.hiveId);
    if (!hive) throw new Error('Ruche introuvable');

    const campaign = this.traceCampaigns.find(c => c.id === params.campaignId);
    if (!campaign) throw new Error('Campagne introuvable');

    const harvestId = `REC-${Date.now().toString().slice(-6)}`;
    const harvestNumber = this.generateHarvestNumber();

    const createdSubLots: BucketSubLot[] = [];
    let totalNetWeight = 0;

    params.buckets.forEach(b => {
      const netWeightKg = Math.max(0, Math.round((b.grossWeightKg - b.tareWeightKg) * 100) / 100);
      totalNetWeight += netWeightKg;

      const subLotId = `SLOT-${Date.now().toString().slice(-6)}-${createdSubLots.length + 1}`;
      const subLotNumber = this.generateSubLotNumber();

      const newSubLot: BucketSubLot = {
        id: subLotId,
        subLotNumber,
        physicalBucketNumber: b.physicalBucketNumber,
        harvestId,
        campaignId: campaign.id,
        campaignNumber: campaign.campaignNumber,
        hiveId: hive.id,
        hiveNumber: hive.hiveNumber, // Strict 1-hive association!
        apiaryName: hive.apiaryName,
        ownerName: hive.ownerName,
        fillDate: params.date,
        grossWeightKg: b.grossWeightKg,
        tareWeightKg: b.tareWeightKg,
        netWeightKg,
        weighedMaterial: b.weighedMaterial,
        destination: b.destination,
        harvestOperator: params.harvestOperator,
        observations: b.observations,
        receptionStatus: 'au_rucher',
        corrections: []
      };

      createdSubLots.push(newSubLot);

      // Mettre à jour le statut du seau physique
      this.physicalBuckets = this.physicalBuckets.map(pb => {
        if (pb.bucketNumber === b.physicalBucketNumber) {
          return {
            ...pb,
            status: 'rempli',
            currentSubLotId: subLotId,
            totalUsesCount: pb.totalUsesCount + 1
          };
        }
        return pb;
      });
    });

    const newHarvest: HiveHarvestRecord = {
      id: harvestId,
      harvestNumber,
      campaignId: campaign.id,
      campaignNumber: campaign.campaignNumber,
      hiveId: hive.id,
      hiveNumber: hive.hiveNumber,
      apiaryId: hive.apiaryId,
      apiaryName: hive.apiaryName,
      ownerId: hive.ownerId,
      ownerName: hive.ownerName,
      date: params.date,
      harvestOperator: params.harvestOperator,
      subLotIds: createdSubLots.map(s => s.id),
      totalNetWeightKg: Math.round(totalNetWeight * 100) / 100,
      weatherConditions: params.weatherConditions,
      notes: params.notes,
      corrections: []
    };

    this.hiveHarvests = [newHarvest, ...this.hiveHarvests];
    this.bucketSubLots = [...createdSubLots, ...this.bucketSubLots];

    // Mettre à jour le total récolté de la campagne
    this.traceCampaigns = this.traceCampaigns.map(c => {
      if (c.id === campaign.id) {
        return {
          ...c,
          totalCollectedKg: Math.round(((c.totalCollectedKg || 0) + totalNetWeight) * 10) / 10
        };
      }
      return c;
    });

    // Journaliser l'événement de récolte sur la ruche
    this.addHiveJournalEvent({
      hiveId: hive.id,
      hiveNumber: hive.hiveNumber,
      apiaryId: hive.apiaryId,
      apiaryName: hive.apiaryName,
      date: params.date,
      eventType: 'recolte',
      colonyStatus: hive.colonizationStatus,
      colonyHealth: 'vigoureuse',
      queenPresent: true,
      broodStatus: 'moyen',
      parasitesOrProblems: 'Aucun',
      actionsDone: `Récolte de campagne ${campaign.campaignNumber} : ${Math.round(totalNetWeight * 100) / 100} kg net en ${createdSubLots.length} seau(x).`,
      nextAction: 'Visite de remise en ordre et contrôle couvain',
      nextActionDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      operatorName: params.harvestOperator,
      notes: params.notes
    });

    this.saveAll();
    return { harvest: newHarvest, subLots: createdSubLots };
  }

  // Règle d'or : Conservation de l'ancienne valeur, auteur, date et motif lors d'une correction
  correctBucketSubLot(
    subLotId: string, 
    field: 'grossWeightKg' | 'tareWeightKg' | 'weighedMaterial' | 'observations', 
    newValue: any, 
    author: string, 
    reason: string
  ): boolean {
    const subLot = this.bucketSubLots.find(s => s.id === subLotId);
    if (!subLot) return false;

    const oldValue = subLot[field];
    const correction: HarvestCorrection = {
      timestamp: new Date().toISOString(),
      author,
      field,
      oldValue: String(oldValue),
      newValue: String(newValue),
      reason
    };

    let updatedGross = subLot.grossWeightKg;
    let updatedTare = subLot.tareWeightKg;
    if (field === 'grossWeightKg') updatedGross = Number(newValue);
    if (field === 'tareWeightKg') updatedTare = Number(newValue);
    const updatedNet = Math.max(0, Math.round((updatedGross - updatedTare) * 100) / 100);

    this.bucketSubLots = this.bucketSubLots.map(s => {
      if (s.id === subLotId) {
        return {
          ...s,
          [field]: newValue,
          grossWeightKg: updatedGross,
          tareWeightKg: updatedTare,
          netWeightKg: updatedNet,
          corrections: [correction, ...s.corrections]
        };
      }
      return s;
    });

    // Mettre à jour le total de la récolte parente
    const harvest = this.hiveHarvests.find(h => h.id === subLot.harvestId);
    if (harvest) {
      const allSubLotsForHarvest = this.bucketSubLots.filter(s => s.harvestId === harvest.id);
      const newTotalNet = allSubLotsForHarvest.reduce((sum, s) => sum + s.netWeightKg, 0);
      this.hiveHarvests = this.hiveHarvests.map(h => {
        if (h.id === harvest.id) {
          return {
            ...h,
            totalNetWeightKg: Math.round(newTotalNet * 100) / 100,
            corrections: [correction, ...h.corrections]
          };
        }
        return h;
      });
    }

    this.saveAll();
    return true;
  }

  // --- 7. Collecte & Réception à la Miellerie ---
  recordMiellerieReception(subLotId: string, params: {
    departureDate?: string;
    receptionDate: string;
    receptionOperator: string;
    washingDone: boolean;
    disinfectionDone: boolean;
    dryingDone: boolean;
    receptionWeightKg: number;
    destinationStatus: 'recu_miellerie' | 'en_egouttage' | 'termine';
  }): boolean {
    const subLot = this.bucketSubLots.find(s => s.id === subLotId);
    if (!subLot) return false;

    const delta = Math.round((params.receptionWeightKg - subLot.grossWeightKg) * 100) / 100;

    this.bucketSubLots = this.bucketSubLots.map(s => {
      if (s.id === subLotId) {
        return {
          ...s,
          receptionStatus: params.destinationStatus,
          departureDate: params.departureDate || s.departureDate,
          receptionDate: params.receptionDate,
          receptionOperator: params.receptionOperator,
          washingDone: params.washingDone,
          disinfectionDone: params.disinfectionDone,
          dryingDone: params.dryingDone,
          receptionWeightKg: params.receptionWeightKg,
          weightDeltaKg: delta
        };
      }
      return s;
    });

    this.saveAll();
    return true;
  }

  // --- 8. Transformation & Égouttage avec mousse ---
  recordTransformationStep(data: Omit<MiellerieTransformationStep, 'id'>): MiellerieTransformationStep {
    const id = `TRF-${Date.now().toString().slice(-6)}`;
    const newStep: MiellerieTransformationStep = {
      ...data,
      id
    };
    this.transformationSteps = [newStep, ...this.transformationSteps];

    // Marquer le sous-lot comme en égouttage ou terminé
    this.bucketSubLots = this.bucketSubLots.map(s => {
      if (s.id === data.subLotId) {
        return {
          ...s,
          receptionStatus: data.status === 'termine' ? 'termine' : 'en_egouttage'
        };
      }
      return s;
    });

    this.saveAll();
    return newStep;
  }

  // --- 9. Conditionnement & Bocaux individuels QR ---
  generateJarCode(): string {
    const existingSeq = this.bottledJars.map(j => {
      const match = j.jarCode.match(/YAM-BOC-(\d+)-(\d+)/);
      return match ? parseInt(match[2], 10) : 0;
    });
    const maxSeq = existingSeq.length > 0 ? Math.max(...existingSeq, 0) : 0;
    const year = new Date().getFullYear();
    return `YAM-BOC-${year}-${String(maxSeq + 1).padStart(5, '0')}`;
  }

  generateBottledJars(params: {
    subLotId: string;
    lotNumber: string;
    bottlingDate: string;
    jarFormat: '250g' | '500g' | '1000g';
    quantity: number;
    moisturePercent: number;
    notes?: string;
  }): BottledJar[] {
    const subLot = this.bucketSubLots.find(s => s.id === params.subLotId);
    if (!subLot) throw new Error('Sous-lot introuvable');

    const netWeightG = params.jarFormat === '250g' ? 250 : (params.jarFormat === '500g' ? 500 : 1000);
    const createdJars: BottledJar[] = [];

    const existingSeq = this.bottledJars.map(j => {
      const match = j.jarCode.match(/YAM-BOC-(\d+)-(\d+)/);
      return match ? parseInt(match[2], 10) : 0;
    });
    let currentSeq = existingSeq.length > 0 ? Math.max(...existingSeq, 0) : 0;
    const year = new Date().getFullYear();

    for (let i = 0; i < params.quantity; i++) {
      currentSeq++;
      const jarCode = `YAM-BOC-${year}-${String(currentSeq).padStart(5, '0')}`;
      
      // Permanent link for customer QR scan
      const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://yamtaanu.bj';
      const qrParams = new URLSearchParams({
        t: '1',
        jar: jarCode,
        lot: params.lotNumber,
        slot: subLot.subLotNumber,
        ruche: subLot.hiveNumber,
        apiary: subLot.apiaryName,
        village: subLot.apiaryName.includes('Parakou') ? 'Kpébié (Parakou)' : (subLot.apiaryName.includes('Avlo') ? 'Avlo (Grand-Popo)' : 'Pahou (Ouidah)'),
        recolte: subLot.fillDate,
        cond: params.bottlingDate,
        hum: `${params.moisturePercent}%`,
        format: params.jarFormat
      });
      const qrUrl = `${baseUrl}?${qrParams.toString()}`;

      const newJar: BottledJar = {
        jarCode,
        lotNumber: params.lotNumber,
        subLotNumber: subLot.subLotNumber,
        hiveNumber: subLot.hiveNumber,
        apiaryName: subLot.apiaryName,
        village: subLot.apiaryName.includes('Parakou') ? 'Kpébié (Parakou)' : (subLot.apiaryName.includes('Avlo') ? 'Avlo (Grand-Popo)' : 'Pahou (Ouidah)'),
        ownerName: subLot.ownerName,
        campaignNumber: subLot.campaignNumber,
        harvestDate: subLot.fillDate,
        bottlingDate: params.bottlingDate,
        jarFormat: params.jarFormat,
        netWeightG,
        moisturePercent: params.moisturePercent,
        qrUrl,
        status: 'en_stock',
        notes: params.notes
      };

      createdJars.push(newJar);
    }

    this.bottledJars = [...createdJars, ...this.bottledJars];

    // Mettre à jour l'inventaire des produits finis
    const prodVariant = `${params.jarFormat} - Brut Égoutté`;
    this.products = this.products.map(p => {
      if (p.category === 'miel' && p.variant.startsWith(params.jarFormat)) {
        return {
          ...p,
          stock: p.stock + params.quantity,
          batchNumber: params.lotNumber
        };
      }
      return p;
    });

    this.saveAll();
    return createdJars;
  }
}

