import React, { useState } from 'react';
import { BambouMielStore } from '../../../dataStore';
import { BucketSubLot, MiellerieTransformationStep, BottledJar } from '../../../types';
import { 
  Droplet, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Scale, 
  QrCode, 
  Eye, 
  ShieldCheck, 
  Package, 
  Calendar, 
  Clock, 
  User, 
  X,
  Layers,
  Award
} from 'lucide-react';

interface MiellerieTabProps {
  store: BambouMielStore;
  onRefresh: () => void;
  onOpenConsumerTrace: (jar: BottledJar) => void;
  onOpenLabelGenerator?: (jar: BottledJar) => void;
}

export default function MiellerieTab({ store, onRefresh, onOpenConsumerTrace, onOpenLabelGenerator }: MiellerieTabProps) {
  const [activeStep, setActiveStep] = useState<'reception' | 'transformation' | 'conditioning' | 'jars'>('reception');
  
  // Modals state
  const [receptionSubLot, setReceptionSubLot] = useState<BucketSubLot | null>(null);
  const [showTransformationModal, setShowTransformationModal] = useState(false);
  const [showConditioningModal, setShowConditioningModal] = useState(false);

  // Form: Miellerie reception
  const [receptionDate, setReceptionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [receptionOperator, setReceptionOperator] = useState('Jean Orou (Resp. Miellerie)');
  const [washingDone, setWashingDone] = useState(true);
  const [disinfectionDone, setDisinfectionDone] = useState(true);
  const [dryingDone, setDryingDone] = useState(true);
  const [receptionWeightKg, setReceptionWeightKg] = useState('16.05');

  // Form: Transformation
  const [selectedSubLotId, setSelectedSubLotId] = useState(store.bucketSubLots[0]?.id || '');
  const [transOperator, setTransOperator] = useState('Jean Orou & Équipe Miellerie');
  const [equipmentUsed, setEquipmentUsed] = useState('Bacs inox désoperculation, égouttoir inox double tamis Yamtãanu, maturateur décantation');
  const [inputWeight, setInputWeight] = useState('14.80');
  const [waxWeight, setWaxWeight] = useState('1.20');
  const [foamWeight, setFoamWeight] = useState('0.45');
  const [outputHoney, setOutputHoney] = useState('13.15');
  const [moisturePercent, setMoisturePercent] = useState('17.2');
  const [foamDetails, setFoamDetails] = useState('Égouttage lent à température ambiante avec formation naturelle de mousse superficielle écumée.');

  // Form: Bottling
  const [bottlingSubLotId, setBottlingSubLotId] = useState(store.bucketSubLots[0]?.id || '');
  const [jarFormat, setJarFormat] = useState<'250g' | '500g' | '1000g'>('500g');
  const [jarQuantity, setJarQuantity] = useState('20');
  const [lotNumber, setLotNumber] = useState(() => `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-BAM-01`);
  const [bottlingDate, setBottlingDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleExecuteReception = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receptionSubLot) return;

    store.recordMiellerieReception(receptionSubLot.id, {
      receptionDate,
      receptionOperator,
      washingDone,
      disinfectionDone,
      dryingDone,
      receptionWeightKg: Number(receptionWeightKg) || receptionSubLot.grossWeightKg,
      destinationStatus: 'recu_miellerie'
    });

    setReceptionSubLot(null);
    onRefresh();
  };

  const handleExecuteTransformation = (e: React.FormEvent) => {
    e.preventDefault();
    const subLot = store.bucketSubLots.find(s => s.id === selectedSubLotId);
    if (!subLot) return;

    store.recordTransformationStep({
      subLotId: subLot.id,
      subLotNumber: subLot.subLotNumber,
      hiveNumber: subLot.hiveNumber,
      ownerName: subLot.ownerName,
      apiaryName: subLot.apiaryName,
      campaignNumber: subLot.campaignNumber,
      stepDate: new Date().toISOString().split('T')[0],
      startTime: '08:30',
      endTime: '12:00',
      operatorName: transOperator,
      equipmentUsed,
      inputWeightKg: Number(inputWeight) || subLot.netWeightKg,
      waxWeightKg: Number(waxWeight) || 0,
      foamWeightKg: Number(foamWeight) || 0,
      outputHoneyKg: Number(outputHoney) || 0,
      discardedKg: 0,
      moisturePercent: Number(moisturePercent) || 17.2,
      purityGrade: 'Conforme Yamtãanu',
      foamProcessDetails: foamDetails,
      status: 'termine',
      controlValidated: true,
      validatedBy: 'DG SARKI Yantannou',
      validationDate: new Date().toISOString().split('T')[0]
    });

    setShowTransformationModal(false);
    onRefresh();
  };

  const handleExecuteBottling = (e: React.FormEvent) => {
    e.preventDefault();
    store.generateBottledJars({
      subLotId: bottlingSubLotId,
      lotNumber,
      bottlingDate,
      jarFormat,
      quantity: Number(jarQuantity) || 1,
      moisturePercent: 17.2,
      notes: 'Bocal verre scellé certifié Yamtãanu'
    });

    setShowConditioningModal(false);
    setActiveStep('jars');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            PROLONGEMENT FILIÈRE • MIELLERIE & CONDITIONNEMENT
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {store.bottledJars.length} bocaux étiquetés QR
          </span>
        </div>
        <h2 className="text-lg font-bold text-white mt-1">
          Réception, Procédé « Égoutté avec mousse », Conditionnement & QR
        </h2>
        <p className="text-xs text-slate-400">
          Traçabilité stricte maintenue par sous-lot et ruche d'origine. Chaque étape documente qui a travaillé, quel équipement, et le code QR permanent pour la table du consommateur.
        </p>
      </div>

      {/* Steps Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setActiveStep('reception')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            activeStep === 'reception'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <span>1. Réception Seaux</span>
        </button>

        <button
          onClick={() => setActiveStep('transformation')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            activeStep === 'transformation'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <span>2. « Égoutté avec mousse »</span>
        </button>

        <button
          onClick={() => setActiveStep('conditioning')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            activeStep === 'conditioning'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <span>3. Conditionnement</span>
        </button>

        <button
          onClick={() => setActiveStep('jars')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            activeStep === 'jars'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <span>4. Bocaux & QR Client ({store.bottledJars.length})</span>
        </button>
      </div>

      {/* STEP 1 : RÉCEPTION & PROTOCOLE HYGIÈNE */}
      {activeStep === 'reception' && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center justify-between">
            <div>
              <strong>Protocole d'arrivée à la miellerie :</strong> Contrôle intégrité du scellé, pesée de contrôle, lavage extérieur du seau, désinfection et séchage avant introduction en salle blanche d'égouttage.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {store.bucketSubLots.map(slot => (
              <div 
                key={slot.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-400 font-bold">{slot.subLotNumber}</span>
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    slot.receptionStatus === 'recu_miellerie' || slot.receptionStatus === 'termine'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {slot.receptionStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1 text-slate-300">
                  <p>Seau physique : <strong className="font-mono text-white">{slot.physicalBucketNumber}</strong></p>
                  <p>Ruche d'origine : <strong className="font-mono text-white">{slot.hiveNumber}</strong></p>
                  <p>Apiculteur : {slot.ownerName}</p>
                  <p>Poids net rucher : <strong className="text-emerald-400">{slot.netWeightKg} kg</strong></p>
                </div>

                {/* Hygiene checklist results */}
                <div className="p-2.5 bg-slate-800/80 rounded-xl space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Lavage extérieur :</span>
                    <span className={slot.washingDone ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {slot.washingDone ? '✓ Effectué' : 'En attente'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Désinfection seau :</span>
                    <span className={slot.disinfectionDone ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {slot.disinfectionDone ? '✓ Validée' : 'En attente'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Séchage :</span>
                    <span className={slot.dryingDone ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {slot.dryingDone ? '✓ Terminé' : 'En attente'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setReceptionSubLot(slot);
                    setReceptionWeightKg(String(slot.grossWeightKg));
                  }}
                  className="w-full py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500 hover:to-amber-600 text-amber-300 hover:text-slate-950 font-bold rounded-xl border border-amber-500/30 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Enregistrer / Valider Réception</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 : TRANSFORMATION « ÉGOUTTÉ AVEC MOUSSE » */}
      {activeStep === 'transformation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Lots en Traitement Traditionnel Sans Chauffage
            </h3>
            <button
              onClick={() => setShowTransformationModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Consigner un Égouttage</span>
            </button>
          </div>

          <div className="space-y-3">
            {store.transformationSteps.map(step => (
              <div 
                key={step.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                      {step.subLotNumber}
                    </span>
                    <span className="text-xs font-bold text-white">
                      Ruche {step.hiveNumber} • {step.apiaryName} ({step.ownerName})
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full w-fit">
                    ✓ Procédé Validé : Humidité {step.moisturePercent}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">MATIÈRE ENTRÉE</span>
                    <strong className="text-white font-mono text-sm">{step.inputWeightKg} kg</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">CIRE OPERCULES</span>
                    <strong className="text-amber-400 font-mono text-sm">{step.waxWeightKg} kg</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">MOUSSE ÉCUMÉE</span>
                    <strong className="text-amber-300 font-mono text-sm">{step.foamWeightKg} kg</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">MIEL NET ÉGOUTTÉ</span>
                    <strong className="text-emerald-400 font-mono text-sm">{step.outputHoneyKg} kg</strong>
                  </div>
                </div>

                <p className="text-slate-300">
                  <strong className="text-slate-400">Équipements & Méthode :</strong> {step.equipmentUsed}. {step.foamProcessDetails}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                  <span>Opérateur : {step.operatorName}</span>
                  <span>Validation : {step.validatedBy} ({step.validationDate})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 : CONDITIONNEMENT */}
      {activeStep === 'conditioning' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Mise en Bocaux & Génération des Numéros Individuels
              </h3>
              <p className="text-xs text-slate-400">
                Chaque bocal reçoit son numéro unique <code>YAM-BOC-2026-00001</code> relié à sa ruche d'origine et son code QR.
              </p>
            </div>

            <button
              onClick={() => setShowConditioningModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Conditionner un Lot</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-400 font-semibold block">Format 250g Dégustation</span>
              <p className="text-lg font-bold text-white">
                {store.bottledJars.filter(j => j.jarFormat === '250g').length} bocaux produits
              </p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-400 font-semibold block">Format 500g Standard</span>
              <p className="text-lg font-bold text-white">
                {store.bottledJars.filter(j => j.jarFormat === '500g').length} bocaux produits
              </p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-400 font-semibold block">Format 1000g Familial</span>
              <p className="text-lg font-bold text-white">
                {store.bottledJars.filter(j => j.jarFormat === '1000g').length} bocaux produits
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4 : JARS & QR CLIENT VIEW */}
      {activeStep === 'jars' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Bocaux Individuels & QR Codes Consommateurs ({store.bottledJars.length})
              </h3>
              <p className="text-xs text-slate-400">
                Cliquez sur <strong>« Fiche Client (Scan QR) »</strong> pour visualiser la page publique consultable par le client sur sa table.
              </p>
            </div>

            <button
              onClick={() => setShowConditioningModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Conditionnement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {store.bottledJars.map(jar => (
              <div 
                key={jar.jarCode}
                className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all group shadow-sm"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                      {jar.jarCode}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-white bg-slate-800 px-2 py-0.5 rounded">
                      Format {jar.jarFormat}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-300">
                    <p className="text-white font-bold">Miel Pur Brut Égoutté Yamtãanu</p>
                    <p className="text-slate-400">Ruche d'origine : <strong className="text-amber-400 font-mono">{jar.hiveNumber}</strong></p>
                    <p className="text-slate-400">Terroir : {jar.village} ({jar.apiaryName})</p>
                    <p className="text-slate-400">Date récolte : {jar.harvestDate} • Mis en pot : {jar.bottlingDate}</p>
                    <p className="text-slate-400 font-mono text-[11px]">Lot : {jar.lotNumber}</p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    onClick={() => onOpenConsumerTrace(jar)}
                    className="flex-1 w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Ouvrir la page de traçabilité consultable par le client"
                  >
                    <QrCode className="w-3.5 h-3.5 text-slate-950" />
                    <span>Fiche Client (QR)</span>
                  </button>

                  {onOpenLabelGenerator && (
                    <button
                      onClick={() => onOpenLabelGenerator(jar)}
                      className="w-full sm:w-auto px-3 py-2 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 font-bold rounded-xl transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Générer ou importer une étiquette avec ce QR Code"
                    >
                      <span>🏷️ Étiquette &amp; QR</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Reception */}
      {receptionSubLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Réception & Lavage du Seau</h3>
              </div>
              <button onClick={() => setReceptionSubLot(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteReception} className="space-y-4 text-xs">
              <p className="text-slate-300">
                Sous-lot : <strong className="text-amber-400 font-mono">{receptionSubLot.subLotNumber}</strong> • Ruche : <strong>{receptionSubLot.hiveNumber}</strong>
              </p>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Pesée de contrôle à l'arrivée (kg brut)</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={receptionWeightKg}
                  onChange={e => setReceptionWeightKg(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="space-y-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={washingDone}
                    onChange={e => setWashingDone(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Lavage extérieur du seau à l'eau potable</span>
                </label>

                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={disinfectionDone}
                    onChange={e => setDisinfectionDone(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Désinfection extérieure alimentaire</span>
                </label>

                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dryingDone}
                    onChange={e => setDryingDone(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Séchage complet avant salle blanche</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReceptionSubLot(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-bold shadow-md transition"
                >
                  Valider la réception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Transformation */}
      {showTransformationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Consigner un Égouttage avec Mousse</h3>
              </div>
              <button onClick={() => setShowTransformationModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransformation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Sous-lot / Seau à traiter *</label>
                <select
                  value={selectedSubLotId}
                  onChange={e => {
                    setSelectedSubLotId(e.target.value);
                    const s = store.bucketSubLots.find(x => x.id === e.target.value);
                    if (s) {
                      setInputWeight(String(s.netWeightKg));
                      setOutputHoney(String(Math.max(0, Math.round((s.netWeightKg - 1.5) * 10) / 10)));
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {store.bucketSubLots.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.subLotNumber} • Ruche {s.hiveNumber} ({s.netWeightKg} kg net - {s.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Matière entrée (kg) *</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={inputWeight}
                    onChange={e => setInputWeight(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Miel égoutté net (kg) *</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={outputHoney}
                    onChange={e => setOutputHoney(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Cire d'opercules (kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={waxWeight}
                    onChange={e => setWaxWeight(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Mousse séparée (kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={foamWeight}
                    onChange={e => setFoamWeight(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Humidité contrôlée (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={moisturePercent}
                    onChange={e => setMoisturePercent(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Équipements utilisés</label>
                <input
                  type="text"
                  value={equipmentUsed}
                  onChange={e => setEquipmentUsed(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransformationModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-bold shadow-md transition"
                >
                  Valider la transformation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Conditioning */}
      {showConditioningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Conditionner en Bocaux avec QR</h3>
              </div>
              <button onClick={() => setShowConditioningModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteBottling} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Sous-lot d'origine *</label>
                <select
                  value={bottlingSubLotId}
                  onChange={e => setBottlingSubLotId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {store.bucketSubLots.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.subLotNumber} • Ruche {s.hiveNumber} ({s.apiaryName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Format de bocal *</label>
                  <select
                    value={jarFormat}
                    onChange={e => setJarFormat(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="250g">Pot 250g (Dégustation)</option>
                    <option value="500g">Pot 500g (Standard)</option>
                    <option value="1000g">Pot 1000g (Familial 1kg)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nombre d'unités à créer *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={jarQuantity}
                    onChange={e => setJarQuantity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Code Lot Global</label>
                <input
                  type="text"
                  value={lotNumber}
                  onChange={e => setLotNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Date de conditionnement</label>
                <input
                  type="date"
                  value={bottlingDate}
                  onChange={e => setBottlingDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConditioningModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-bold shadow-md transition"
                >
                  Générer les bocaux QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
