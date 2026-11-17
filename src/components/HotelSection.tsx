import React, { useState } from 'react';
import { BambouMielStore } from '../dataStore';
import { HotelRoom, HotelBooking, ConferenceHall, ConferenceBooking } from '../types';
import { 
  Building2, 
  Plus, 
  Home, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Sparkles, 
  DollarSign, 
  FileText, 
  GlassWater, 
  ChevronRight,
  UserPlus,
  Users,
  Presentation,
  Calendar,
  Monitor,
  Mic,
  Wifi,
  Coffee,
  Printer,
  Check,
  Building,
  Utensils,
  Maximize2
} from 'lucide-react';

interface HotelSectionProps {
  store: BambouMielStore;
  onRefresh: () => void;
}

export default function HotelSection({ store, onRefresh }: HotelSectionProps) {
  const [activeTab, setActiveTab] = useState<'rooms' | 'conference' | 'bookings'>('rooms');
  
  const formatDateToFR = (dateStr: string) => {
    if (!dateStr) return '';
    const cleanStr = dateStr.trim();

    // 1. Slash-separated formats (e.g. 12/05/2026, 12/5/26, 2/5/2026)
    if (cleanStr.includes('/')) {
      const parts = cleanStr.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        let year = parts[2];
        if (year.length === 2) {
          year = `20${year}`;
        }
        return `${day}/${month}/${year}`;
      }
    }

    // 2. Dash-separated formats (e.g. 2026-05-12, 12-05-2026)
    if (cleanStr.includes('-')) {
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD -> DD/MM/YYYY
          const year = parts[0];
          const month = parts[1].padStart(2, '0');
          const day = parts[2].padStart(2, '0');
          return `${day}/${month}/${year}`;
        } else {
          // Assume DD-MM-YYYY -> DD/MM/YYYY
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          let year = parts[2];
          if (year.length === 2) {
            year = `20${year}`;
          }
          return `${day}/${month}/${year}`;
        }
      }
    }

    // Fallback try-catch using native Date with strict check
    try {
      const d = new Date(cleanStr);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (e) {}

    return dateStr;
  };

  // Selected booking for detailed ledger actions
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedConfBookingId, setSelectedConfBookingId] = useState<string | null>(null);

  // Form states: New Hotel Room Booking
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [roomId, setRoomId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Form states: Add Extra/Boutique charge for room
  const [extraAmount, setExtraAmount] = useState('');
  const [extraDesc, setExtraDesc] = useState('Miel de Forêt (Pot 500g)');
  const [customExtraDesc, setCustomExtraDesc] = useState('');

  // Form states: New Conference Booking
  const [showNewConfBooking, setShowNewConfBooking] = useState(false);
  const [confHallId, setConfHallId] = useState('');
  const [confEventTitle, setConfEventTitle] = useState('');
  const [confEventType, setConfEventType] = useState<'Seminaire' | 'Atelier' | 'Reunion' | 'Conference' | 'Formation' | 'Autre'>('Seminaire');
  const [confOrganizerName, setConfOrganizerName] = useState('');
  const [confOrganizerEntity, setConfOrganizerEntity] = useState('');
  const [confPhone, setConfPhone] = useState('');
  const [confEmail, setConfEmail] = useState('');
  const [confStartDate, setConfStartDate] = useState('');
  const [confEndDate, setConfEndDate] = useState('');
  const [confTimeSlot, setConfTimeSlot] = useState('08:30 - 17:00 (Journée Entière)');
  const [confParticipantsCount, setConfParticipantsCount] = useState<number | string>(30);
  const [confCoffeeBreak, setConfCoffeeBreak] = useState(true);
  const [confLunchBuffet, setConfLunchBuffet] = useState(false);
  const [confNotes, setConfNotes] = useState('');

  // Form states: New Hall Creation
  const [showNewHallModal, setShowNewHallModal] = useState(false);
  const [newHallName, setNewHallName] = useState('');
  const [newHallCapacity, setNewHallCapacity] = useState('60');
  const [newHallHourlyRate, setNewHallHourlyRate] = useState('15000');
  const [newHallDailyRate, setNewHallDailyRate] = useState('80000');
  const [newHallHalfDayRate, setNewHallHalfDayRate] = useState('50000');
  const [newHallAmenities, setNewHallAmenities] = useState('Vidéoprojecteur HD, Sonorisation pro & micros, Wifi haut débit, Climatisation, Paperboard');
  const [newHallDesc, setNewHallDesc] = useState('');

  // Extra service addition for Conference Booking
  const [confExtraDesc, setConfExtraDesc] = useState('');
  const [confExtraPrice, setConfExtraPrice] = useState('');

  // Handlers for Hotel Rooms
  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !roomId || !checkIn || !checkOut) return alert('Veuillez compléter tous les champs.');
    
    const room = store.rooms.find(r => r.id === roomId);
    if (!room) return;

    store.addBooking({
      roomId,
      roomNumber: room.number,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      status: 'en_cours',
      extrasBilled: 0
    });

    setGuestName('');
    setGuestEmail('');
    setRoomId('');
    setCheckIn('');
    setCheckOut('');
    setShowNewBooking(false);
    onRefresh();
  };

  const handleAddExtra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !extraAmount) return;

    const finalDesc = extraDesc === 'Autre' ? customExtraDesc : extraDesc;

    store.addExtrasToBooking(selectedBookingId, parseFloat(extraAmount));
    setExtraAmount('');
    setCustomExtraDesc('');
    setExtraDesc('Miel de Forêt (Pot 500g)');
    alert(`Prestation "${finalDesc}" facturée en chambre !`);
    onRefresh();
  };

  const handleCheckout = (bId: string) => {
    if (confirm('Confirmer le check-out du voyageur ? La facture finale sera archivée et la chambre passera en état "en nettoyage".')) {
      store.completeBooking(bId);
      setSelectedBookingId(null);
      onRefresh();
    }
  };

  const handleCleanRoom = (rId: string) => {
    const r = store.rooms.find(room => room.id === rId);
    if (r) {
      r.status = 'disponible';
      store.saveAll();
      onRefresh();
    }
  };

  // Handlers for Conference Room Bookings
  const handleCreateConferenceBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confHallId || !confEventTitle || !confOrganizerName || !confStartDate || !confEndDate) {
      return alert('Veuillez remplir les informations obligatoires de l\'événement.');
    }

    const hall = store.conferenceHalls.find(h => h.id === confHallId);
    if (!hall) return;

    // Calculate duration in days
    const days = Math.max(1, Math.round((new Date(confEndDate).getTime() - new Date(confStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const hallPrice = confTimeSlot.includes('Demi-Journée') 
      ? hall.halfDayRate * days 
      : hall.dailyRate * days;

    const parts = Number(confParticipantsCount) || 20;
    const services: { name: string; price: number }[] = [];

    if (confCoffeeBreak) {
      const price = parts * 500; // 500 FCFA/pers pour pause-café miels/thés
      services.push({ name: `Pause-café Miels & Thés Yamtaanu (${parts} pers.)`, price });
    }

    if (confLunchBuffet) {
      const price = parts * 1500; // 1500 FCFA/pers buffet Nectar
      services.push({ name: `Buffet Déjeuner Nectar Bio (${parts} pers.)`, price });
    }

    const extrasTotal = services.reduce((sum, s) => sum + s.price, 0);
    const totalBilled = hallPrice + extrasTotal;

    store.addConferenceBooking({
      hallId: hall.id,
      hallName: hall.name,
      organizerName: confOrganizerName,
      organizerEntity: confOrganizerEntity || 'Entreprise / Organisme',
      phone: confPhone,
      email: confEmail,
      eventTitle: confEventTitle,
      eventType: confEventType,
      startDate: confStartDate,
      endDate: confEndDate,
      timeSlot: confTimeSlot,
      participantsCount: parts,
      selectedServices: services,
      hallPrice,
      extrasBilled: extrasTotal,
      totalBilled,
      status: 'en_cours',
      notes: confNotes
    });

    // Reset form
    setConfEventTitle('');
    setConfOrganizerName('');
    setConfOrganizerEntity('');
    setConfPhone('');
    setConfEmail('');
    setConfStartDate('');
    setConfEndDate('');
    setConfNotes('');
    setShowNewConfBooking(false);
    onRefresh();
  };

  const handleAddConferenceExtra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConfBookingId || !confExtraDesc || !confExtraPrice) return;

    store.addExtrasToConferenceBooking(selectedConfBookingId, parseFloat(confExtraPrice), confExtraDesc);
    setConfExtraDesc('');
    setConfExtraPrice('');
    alert(`Service "${confExtraDesc}" ajouté à la réservation de la salle !`);
    onRefresh();
  };

  const handleCompleteConfBooking = (id: string) => {
    if (confirm('Confirmer la clôture de l\'événement en salle de conférence ?')) {
      store.completeConferenceBooking(id);
      setSelectedConfBookingId(null);
      onRefresh();
    }
  };

  const handleCancelConfBooking = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation de salle de conférence ?')) {
      store.cancelConferenceBooking(id);
      setSelectedConfBookingId(null);
      onRefresh();
    }
  };

  // Handler for creating new Conference Hall
  const handleCreateConferenceHall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHallName || !newHallCapacity || !newHallDailyRate) return alert('Veuillez compléter le nom, la capacité et le tarif.');

    const amenitiesList = newHallAmenities.split(',').map(s => s.trim()).filter(Boolean);

    store.addConferenceHall({
      name: newHallName,
      capacity: parseInt(newHallCapacity, 10),
      hourlyRate: parseFloat(newHallHourlyRate),
      dailyRate: parseFloat(newHallDailyRate),
      halfDayRate: parseFloat(newHallHalfDayRate),
      amenities: amenitiesList.length > 0 ? amenitiesList : ['Vidéoprojecteur HD', 'Wifi', 'Climatisation', 'Paperboard'],
      status: 'disponible',
      description: newHallDesc
    });

    setNewHallName('');
    setNewHallDesc('');
    setShowNewHallModal(false);
    onRefresh();
  };

  const activeBooking = store.bookings.find(b => b.id === selectedBookingId);
  const activeConfBooking = store.conferenceBookings.find(b => b.id === selectedConfBookingId);

  // Quick metrics
  const totalOccupiedRooms = store.rooms.filter(r => r.status === 'occupe').length;
  const activeConferenceEvents = store.conferenceBookings.filter(cb => cb.status === 'en_cours' || cb.status === 'confirme').length;
  const totalRoomRevenue = store.bookings.reduce((sum, b) => b.status === 'en_cours' || b.status === 'termine' ? sum + b.totalBilled : sum, 0);
  const totalConfRevenue = store.conferenceBookings.reduce((sum, cb) => cb.status === 'en_cours' || cb.status === 'termine' ? sum + cb.totalBilled : sum, 0);

  return (
    <div className="space-y-6">
      {/* Hotel & Conference Main Header */}
      <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-brand-green-100/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="w-6.5 h-6.5 text-brand-green-700 animate-pulse" />
          <div>
            <h2 className="text-xl font-semibold font-display text-gray-900 leading-tight flex items-center gap-2">
              <span>L'Éco-Lodge &amp; Centre de Conférences Yamtaanu</span>
            </h2>
            <p className="text-xs text-gray-500">Hébergement touristique apicole &amp; Location de Salles de Séminaires, Colloques et Événements</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'rooms' 
                ? 'bg-brand-green-700 text-white shadow-xs' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" /> Bungalows &amp; Lodges ({store.rooms.length})
            </div>
          </button>

          <button
            onClick={() => setActiveTab('conference')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'conference' 
                ? 'bg-brand-green-700 text-white shadow-xs' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Presentation className="w-3.5 h-3.5 text-amber-400" /> Salles de Conférence ({store.conferenceHalls.length})
            </div>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'bookings' 
                ? 'bg-brand-green-700 text-white shadow-xs' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Planning &amp; Factures Globale
            </div>
          </button>
        </div>
      </div>

      {/* QUICK STATS BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Bungalows Occupés</span>
            <strong className="text-lg font-mono font-bold text-gray-900">{totalOccupiedRooms} / {store.rooms.length}</strong>
          </div>
          <Home className="w-5 h-5 text-indigo-600" />
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Événements Conférence</span>
            <strong className="text-lg font-mono font-bold text-gray-900">{activeConferenceEvents} en cours</strong>
          </div>
          <Presentation className="w-5 h-5 text-amber-600" />
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">CA Nuitées Ecolodge</span>
            <strong className="text-sm font-mono font-bold text-emerald-800">{totalRoomRevenue.toLocaleString()} FCFA</strong>
          </div>
          <DollarSign className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">CA Salles Conférence</span>
            <strong className="text-sm font-mono font-bold text-brand-green-800">{totalConfRevenue.toLocaleString()} FCFA</strong>
          </div>
          <Sparkles className="w-5 h-5 text-brand-gold-550" />
        </div>
      </div>

      {/* TAB 1: BUNGALOWS & ROOMS */}
      {activeTab === 'rooms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Cards Board */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-brand-green-100/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-semibold text-gray-900 text-base">Statut en Temps Réel des lodges</h3>
              <button
                onClick={() => setShowNewBooking(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-gold-500 hover:bg-brand-gold-600 text-brand-green-900 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" /> Check-in Bungalow
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {store.rooms.map(room => {
                const activeBkg = store.bookings.find(b => b.roomId === room.id && b.status === 'en_cours');
                
                return (
                  <div 
                    key={room.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      room.status === 'occupe'
                        ? 'bg-slate-50 border-gray-200 shadow-xs'
                        : room.status === 'en_nettoyage'
                        ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                        : 'bg-emerald-50/20 border-emerald-250 shadow-xs hover:border-brand-green-600'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">{room.type}</span>
                        <h4 className="text-base font-bold font-display text-gray-900 mt-0.5">{room.number}</h4>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        room.status === 'occupe' 
                          ? 'bg-slate-200 text-gray-800' 
                          : room.status === 'en_nettoyage' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {room.status === 'occupe' ? 'Occupé' : room.status === 'en_nettoyage' ? 'Ménage Requis' : 'Disponible'}
                      </span>
                    </div>

                    {/* Room card description */}
                    <div className="mt-4 pt-3 border-t border-gray-150/50 text-xs">
                      {room.status === 'occupe' && activeBkg ? (
                        <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100">
                          <div>
                            <p className="font-bold text-gray-800 font-sans">{activeBkg.guestName}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Sortie: {formatDateToFR(activeBkg.checkOut)}</p>
                          </div>
                          <button
                            onClick={() => setSelectedBookingId(activeBkg.id)}
                            className="px-2 py-1 bg-brand-green-50 text-[10px] text-brand-green-800 font-bold rounded hover:bg-brand-green-100"
                          >
                            Facture &amp; Extras
                          </button>
                        </div>
                      ) : room.status === 'en_nettoyage' ? (
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-amber-700 font-medium">Chambre en attente de nettoyage</span>
                          <button
                            onClick={() => handleCleanRoom(room.id)}
                            className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold hover:bg-amber-600"
                          >
                            Fin ménage
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-[11px] text-emerald-700">
                          <span>Tarif nuitée: <strong>{room.pricePerNight.toLocaleString()} FCFA</strong></span>
                          <button
                            onClick={() => {
                              setRoomId(room.id);
                              setShowNewBooking(true);
                            }}
                            className="text-[10px] font-bold underline"
                          >
                            Réserver maintenant
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guest Extras/Billing Ledger column */}
          <div className="lg:col-span-1">
            {activeBooking ? (
              <div className="bg-white p-5 rounded-2xl border border-brand-green-100/30 space-y-5 animate-in fade-in duration-200">
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">Facturation Cabane</span>
                    <h3 className="font-display font-semibold text-gray-900 text-base">{activeBooking.roomNumber}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedBookingId(null)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Fermer
                  </button>
                </div>

                <div className="space-y-3 font-sans text-xs text-gray-700">
                  <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 space-y-1">
                    <p className="flex justify-between"><span className="text-gray-400">Nom Voyageur:</span> <strong className="text-gray-900">{activeBooking.guestName}</strong></p>
                    <p className="flex justify-between"><span className="text-gray-400">Email :</span> <span className="text-gray-900 font-mono text-[11px]">{activeBooking.guestEmail}</span></p>
                    <p className="flex justify-between"><span className="text-gray-400">Dates :</span> <span className="text-gray-900">{formatDateToFR(activeBooking.checkIn)} → {formatDateToFR(activeBooking.checkOut)}</span></p>
                  </div>

                  <div className="p-3 bg-brand-gold-100/40 rounded-lg border border-brand-gold-500/20 space-y-2">
                    <span className="text-[10px] font-bold text-brand-gold-600 uppercase tracking-widest block">Ledger de consommation</span>
                    
                    <div className="space-y-1 text-xs text-gray-800 border-b border-dashed border-brand-gold-500/20 pb-2">
                      <p className="flex justify-between"><span>Séjour éco-lodge hôtellerie:</span> <span>{(activeBooking.totalBilled - activeBooking.extrasBilled).toLocaleString()} FCFA</span></p>
                      <p className="flex justify-between"><span>Extras (Boutique miel/thé/cocktails):</span> <span>{activeBooking.extrasBilled.toLocaleString()} FCFA</span></p>
                    </div>

                    <p className="flex justify-between font-display text-sm font-bold text-brand-green-900 pt-1">
                      <span>Total à régler:</span>
                      <span className="font-mono">{activeBooking.totalBilled.toLocaleString()} FCFA</span>
                    </p>
                  </div>
                </div>

                {/* Form to append direct Extra/Boutique charge */}
                <form onSubmit={handleAddExtra} className="bg-slate-50/50 p-4 rounded-xl border border-gray-150 space-y-3">
                  <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1">
                    <GlassWater className="w-3.5 h-3.5 text-brand-green-600" /> Ajouter un Extra en chambre
                  </span>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-semibold">Prestation / Article</label>
                    <select
                      value={extraDesc}
                      onChange={e => {
                        setExtraDesc(e.target.value);
                        if (e.target.value.includes('500g')) setExtraAmount('6000');
                        else if (e.target.value.includes('Infusion')) setExtraAmount('2500');
                        else if (e.target.value.includes('Cocktail')) setExtraAmount('3000');
                        else if (e.target.value === 'Autre') setExtraAmount('');
                        else setExtraAmount('10000');
                      }}
                      className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1"
                    >
                      <option value="Miel sauvage de Forêt (Pot 500g)">Miel sauvage (Pot 500g) - 6 000 FCFA</option>
                      <option value="Infusion Thé Vert Moringa">Infusion Moringa - 2 500 FCFA</option>
                      <option value="Cocktail Miel-Gingembre frais">Cocktail du Verger - 3 000 FCFA</option>
                      <option value="Panier de fruits & jus d'accueil">Panier Dégustation - 10 000 FCFA</option>
                      <option value="Autre">Autre prestation (Saisir...)</option>
                    </select>
                  </div>

                  {extraDesc === 'Autre' && (
                    <div>
                      <label className="text-[9px] text-gray-500 uppercase font-semibold">Saisir le libellé</label>
                      <input
                        type="text"
                        value={customExtraDesc}
                        onChange={e => setCustomExtraDesc(e.target.value)}
                        placeholder="ex: Service VTT / Massage"
                        className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1 font-medium text-gray-800"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-semibold">Montant (FCFA)</label>
                    <input
                      type="number"
                      step="1"
                      value={extraAmount}
                      onChange={e => setExtraAmount(e.target.value)}
                      placeholder="ex: 6000"
                      className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-1.5 bg-brand-green-700 hover:bg-brand-green-800 text-white rounded text-[11px] font-semibold transition-transform cursor-pointer"
                  >
                    Facturer sur la cabane
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => handleCheckout(activeBooking.id)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Procéder au Check-out final
                </button>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-2xl border border-brand-green-100/30 text-center py-12 text-gray-400 italic">
                Sélectionnez une cabane occupée à gauche pour gérer sa consommation ou faire son check-out.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SALLES DE CONFÉRENCE & SÉMINAIRES */}
      {activeTab === 'conference' && (
        <div className="space-y-6">
          {/* Header & Actions Bar */}
          <div className="bg-white p-5 rounded-2xl border border-brand-green-100/30 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="font-display font-semibold text-gray-900 text-base flex items-center gap-2">
                <Presentation className="w-5 h-5 text-amber-600" />
                Salles de Conférence &amp; Espaces de Séminaires
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Salles équipées pour colloques, ateliers apicoles, réunions d'entreprises et événements</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowNewHallModal(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Nouvelle Salle
              </button>

              <button
                onClick={() => {
                  if (store.conferenceHalls.length === 0) return alert('Aucune salle enregistrée.');
                  setConfHallId(store.conferenceHalls[0].id);
                  setShowNewConfBooking(true);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-gold-500 hover:bg-brand-gold-600 text-slate-950 font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" /> Réserver une Salle
              </button>
            </div>
          </div>

          {/* Conference Halls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {store.conferenceHalls.map(hall => {
              const activeEventsForHall = store.conferenceBookings.filter(
                cb => cb.hallId === hall.id && (cb.status === 'en_cours' || cb.status === 'confirme')
              );

              return (
                <div 
                  key={hall.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        Capacité: {hall.capacity} Personnes
                      </span>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        hall.status === 'reserve' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {hall.status === 'reserve' ? 'Réservée' : 'Disponible'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold font-display text-gray-900 mt-2.5">{hall.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{hall.description || 'Espace polyvalent de conférence et séminaire.'}</p>

                    {/* Rates list */}
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 font-sans text-xs space-y-1">
                      <div className="flex justify-between text-gray-600">
                        <span>Tarif Journée entière :</span>
                        <strong className="text-brand-green-800 font-mono">{hall.dailyRate.toLocaleString()} FCFA</strong>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tarif Demi-journée :</span>
                        <strong className="text-gray-800 font-mono">{hall.halfDayRate.toLocaleString()} FCFA</strong>
                      </div>
                      <div className="flex justify-between text-gray-500 text-[11px]">
                        <span>Tarif horaire appoint :</span>
                        <span className="font-mono">{hall.hourlyRate.toLocaleString()} FCFA / h</span>
                      </div>
                    </div>

                    {/* Amenities pills */}
                    <div className="mt-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Équipements Inclus</span>
                      <div className="flex flex-wrap gap-1.5">
                        {hall.amenities.map((item, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 text-emerald-600" /> {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active Event Banner or Action */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {activeEventsForHall.length > 0 ? (
                      <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{activeEventsForHall.length} événement(s) programmé(s)</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-medium">Prête pour réservation</span>
                    )}

                    <button
                      onClick={() => {
                        setConfHallId(hall.id);
                        setShowNewConfBooking(true);
                      }}
                      className="px-3 py-1 bg-brand-green-700 hover:bg-brand-green-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Conference Bookings Ledger */}
          <div className="bg-white p-6 rounded-2xl border border-brand-green-100/30 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-semibold text-gray-900 text-base">Planning des Événements &amp; Réservations de Salles</h3>
                <p className="text-xs text-gray-500">Suivi des séminaires, collations, pauses-café miels/thés et facturation globale</p>
              </div>

              <span className="text-xs bg-amber-50 text-amber-800 px-3 py-1 rounded-xl font-bold border border-amber-200">
                {store.conferenceBookings.length} Réservation(s) totale(s)
              </span>
            </div>

            {store.conferenceBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-400 italic">
                Aucune réservation de salle pour le moment. Cliquez sur "Réserver une Salle" ci-dessus pour planifier un événement.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bookings List Table */}
                <div className="lg:col-span-2 overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="p-3">Réf / Événement</th>
                        <th className="p-3">Organisateur</th>
                        <th className="p-3">Salle</th>
                        <th className="p-3">Dates &amp; Horaire</th>
                        <th className="p-3">Effectif</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3 text-right">Montant Total</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans">
                      {store.conferenceBookings.map(cb => {
                        const isSelected = selectedConfBookingId === cb.id;
                        return (
                          <tr 
                            key={cb.id} 
                            className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                              isSelected ? 'bg-amber-50/60 font-medium' : ''
                            }`}
                            onClick={() => setSelectedConfBookingId(cb.id)}
                          >
                            <td className="p-3">
                              <span className="font-mono text-[10px] text-gray-400 block">{cb.id}</span>
                              <strong className="text-gray-900 font-bold block text-xs">{cb.eventTitle}</strong>
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold">{cb.eventType}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-gray-800 block font-semibold">{cb.organizerName}</span>
                              <span className="text-[10px] text-gray-400 block">{cb.organizerEntity}</span>
                              <span className="text-[10px] text-gray-500 font-mono">{cb.phone}</span>
                            </td>
                            <td className="p-3 font-medium text-gray-800">{cb.hallName}</td>
                            <td className="p-3">
                              <span className="block font-medium">{formatDateToFR(cb.startDate)} {cb.startDate !== cb.endDate ? `→ ${formatDateToFR(cb.endDate)}` : ''}</span>
                              <span className="text-[10px] text-gray-400">{cb.timeSlot}</span>
                            </td>
                            <td className="p-3 font-mono font-bold text-gray-800">{cb.participantsCount} pers.</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                cb.status === 'en_cours' ? 'bg-amber-100 text-amber-800' : 
                                cb.status === 'confirme' ? 'bg-emerald-100 text-emerald-800' :
                                cb.status === 'termine' ? 'bg-slate-200 text-slate-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {cb.status === 'en_cours' ? 'En Cours' : cb.status === 'confirme' ? 'Confirmé' : cb.status === 'termine' ? 'Terminé' : 'Annulé'}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-brand-green-800">{cb.totalBilled.toLocaleString()} FCFA</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedConfBookingId(cb.id);
                                }}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                              >
                                Détails
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Selected Event Detail & Billing Ledger */}
                <div className="lg:col-span-1">
                  {activeConfBooking ? (
                    <div className="bg-white p-5 rounded-2xl border border-brand-green-100/30 space-y-4 animate-in fade-in duration-150">
                      <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-amber-700 font-mono">{activeConfBooking.id}</span>
                          <h4 className="font-display font-bold text-gray-900 text-base">{activeConfBooking.eventTitle}</h4>
                        </div>
                        <button 
                          onClick={() => setSelectedConfBookingId(null)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          Fermer
                        </button>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                        <p className="flex justify-between"><span className="text-gray-400">Organisateur:</span> <strong className="text-gray-900">{activeConfBooking.organizerName}</strong></p>
                        <p className="flex justify-between"><span className="text-gray-400">Entité / Structure:</span> <span className="text-gray-800 font-semibold">{activeConfBooking.organizerEntity}</span></p>
                        <p className="flex justify-between"><span className="text-gray-400">Contact :</span> <span className="text-gray-800 font-mono">{activeConfBooking.phone}</span></p>
                        <p className="flex justify-between"><span className="text-gray-400">Période :</span> <span className="text-gray-800">{formatDateToFR(activeConfBooking.startDate)} → {formatDateToFR(activeConfBooking.endDate)}</span></p>
                        <p className="flex justify-between"><span className="text-gray-400">Horaires :</span> <span className="text-gray-800 font-semibold">{activeConfBooking.timeSlot}</span></p>
                        <p className="flex justify-between"><span className="text-gray-400">Effectif prévu:</span> <strong className="text-gray-900">{activeConfBooking.participantsCount} participants</strong></p>
                      </div>

                      {/* Services breakdown */}
                      <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2 text-xs">
                        <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">Détail des Prestations</span>
                        <div className="space-y-1 text-gray-800 border-b border-dashed border-amber-200 pb-2">
                          <p className="flex justify-between">
                            <span>Location Salle ({activeConfBooking.hallName}):</span>
                            <span className="font-mono">{activeConfBooking.hallPrice.toLocaleString()} FCFA</span>
                          </p>
                          {activeConfBooking.selectedServices?.map((srv, idx) => (
                            <p key={idx} className="flex justify-between text-[11px] text-gray-700">
                              <span>• {srv.name}:</span>
                              <span className="font-mono">{srv.price.toLocaleString()} FCFA</span>
                            </p>
                          ))}
                        </div>

                        <p className="flex justify-between font-display text-sm font-bold text-brand-green-900 pt-1">
                          <span>Facture Globale:</span>
                          <span className="font-mono text-base">{activeConfBooking.totalBilled.toLocaleString()} FCFA</span>
                        </p>
                      </div>

                      {/* Form to add an Extra Service to Conference Booking */}
                      <form onSubmit={handleAddConferenceExtra} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                        <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1">
                          <Utensils className="w-3.5 h-3.5 text-amber-600" /> Ajouter Prestation / Pause-café Suppl.
                        </span>
                        <div>
                          <input
                            type="text"
                            value={confExtraDesc}
                            onChange={e => setConfExtraDesc(e.target.value)}
                            placeholder="ex: Service Dîner de clôture / Matériel Vidéo"
                            className="w-full text-xs p-2 border border-gray-200 bg-white rounded-lg"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={confExtraPrice}
                            onChange={e => setConfExtraPrice(e.target.value)}
                            placeholder="Montant (FCFA)"
                            className="w-full text-xs p-2 border border-gray-200 bg-white rounded-lg"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Ajouter à la facture
                        </button>
                      </form>

                      {/* Management actions */}
                      <div className="flex gap-2 pt-2">
                        {activeConfBooking.status !== 'termine' && (
                          <button
                            onClick={() => handleCompleteConfBooking(activeConfBooking.id)}
                            className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Clôturer Événement
                          </button>
                        )}
                        {activeConfBooking.status !== 'annule' && (
                          <button
                            onClick={() => handleCancelConfBooking(activeConfBooking.id)}
                            className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-5 rounded-2xl border border-brand-green-100/30 text-center py-12 text-gray-400 italic">
                      Cliquez sur une réservation dans le tableau à gauche pour voir son détail, ajouter des prestations de pause-café ou clôturer le séminaire.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GLOBAL BOOKINGS LEDGER */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Lodges Bookings */}
          <div className="bg-white p-5 rounded-2xl border border-brand-green-100/30 overflow-hidden">
            <h3 className="font-display font-semibold text-gray-900 text-base mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-indigo-600" />
              Historique Complet des Séjours Écolodge
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Ref Booking</th>
                    <th className="p-3">Client Voyageur</th>
                    <th className="p-3">Bungalow</th>
                    <th className="p-3">Dates</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3">Consos Extras</th>
                    <th className="p-3 text-right">Facture Totale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {store.bookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-gray-900">{b.id}</td>
                      <td className="p-3">
                        <div>
                          <strong className="text-gray-800 block text-xs">{b.guestName}</strong>
                          <span className="text-[10px] text-gray-400 font-mono">{b.guestEmail}</span>
                        </div>
                      </td>
                      <td className="p-3">{b.roomNumber}</td>
                      <td className="p-3">{formatDateToFR(b.checkIn)} → {formatDateToFR(b.checkOut)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          b.status === 'en_cours' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {b.status === 'en_cours' ? 'En cours' : b.status === 'termine' ? 'Clôturé' : b.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{b.extrasBilled.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right font-mono font-bold text-gray-900">{b.totalBilled.toLocaleString()} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conference Hall Bookings */}
          <div className="bg-white p-5 rounded-2xl border border-brand-green-100/30 overflow-hidden">
            <h3 className="font-display font-semibold text-gray-900 text-base mb-4 flex items-center gap-2">
              <Presentation className="w-5 h-5 text-amber-600" />
              Historique Complet des Locations de Salles de Conférence
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Ref Événement</th>
                    <th className="p-3">Titre &amp; Type</th>
                    <th className="p-3">Organisateur</th>
                    <th className="p-3">Salle Louée</th>
                    <th className="p-3">Période</th>
                    <th className="p-3">Participants</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Montant Facturé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {store.conferenceBookings.map(cb => (
                    <tr key={cb.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-gray-900">{cb.id}</td>
                      <td className="p-3">
                        <strong className="text-gray-900 block text-xs">{cb.eventTitle}</strong>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold">{cb.eventType}</span>
                      </td>
                      <td className="p-3">
                        <strong className="text-gray-800 block text-xs">{cb.organizerName}</strong>
                        <span className="text-[10px] text-gray-400 block">{cb.organizerEntity}</span>
                      </td>
                      <td className="p-3 font-medium">{cb.hallName}</td>
                      <td className="p-3">{formatDateToFR(cb.startDate)} → {formatDateToFR(cb.endDate)}</td>
                      <td className="p-3 font-mono">{cb.participantsCount} pers.</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          cb.status === 'en_cours' ? 'bg-amber-100 text-amber-800' :
                          cb.status === 'confirme' ? 'bg-emerald-100 text-emerald-800' :
                          cb.status === 'termine' ? 'bg-slate-200 text-slate-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {cb.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-brand-green-800">{cb.totalBilled.toLocaleString()} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: NEW HOTEL ROOM CHECK IN */}
      {showNewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-brand-green-700 to-brand-green-800 px-6 py-4 text-white">
              <h3 className="font-display font-semibold text-lg">Check-in de Séjour / Immersion</h3>
              <p className="text-xs text-brand-green-100">Enregistrement initial du voyageur d'écolodge</p>
            </div>

            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom Complet du Voyageur</label>
                <input 
                  type="text" 
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="ex: Marie-Rose Dupuis" 
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-brand-green-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse Email</label>
                <input 
                  type="email" 
                  value={guestEmail}
                  onChange={e => setGuestEmail(e.target.value)}
                  placeholder="ex: dupuis@gmail.com" 
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-brand-green-600 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bungalow à attribuer</label>
                  <select
                    value={roomId}
                    onChange={e => setRoomId(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 bg-white rounded-xl focus:outline-hidden"
                    required
                  >
                    <option value="">-- Choisir cabane --</option>
                    {store.rooms.filter(r => r.status === 'disponible').map(r => (
                      <option key={r.id} value={r.id}>
                        {r.number} ({r.pricePerNight.toLocaleString()} FCFA / nuit)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end pb-1 text-[10px] text-amber-600 bg-amber-50 rounded-lg p-2 leading-tight">
                  Seuls les bungalows disponibles s'affichent ici.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Arrivée (Check-in)</label>
                  <input 
                    type="date" 
                    value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-brand-green-600 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Départ (Check-out)</label>
                  <input 
                    type="date" 
                    value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-brand-green-600 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowNewBooking(false)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 text-xs font-semibold text-white bg-brand-green-700 rounded-xl hover:bg-brand-green-800 transition-colors cursor-pointer"
                >
                  Valider le check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW CONFERENCE ROOM BOOKING */}
      {showNewConfBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 text-white shrink-0">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Presentation className="w-5 h-5 text-amber-200" />
                Réservation de Salle de Conférence
              </h3>
              <p className="text-xs text-amber-100">Planifier un séminaire, colloque ou atelier avec prestations</p>
            </div>

            <form onSubmit={handleCreateConferenceBooking} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sélectionner la Salle de Conférence</label>
                <select
                  value={confHallId}
                  onChange={e => setConfHallId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 bg-white rounded-xl focus:outline-hidden font-medium"
                  required
                >
                  {store.conferenceHalls.map(hall => (
                    <option key={hall.id} value={hall.id}>
                      {hall.name} ({hall.capacity} pers max) - {hall.dailyRate.toLocaleString()} FCFA/jour
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Titre de l'Événement</label>
                <input
                  type="text"
                  value={confEventTitle}
                  onChange={e => setConfEventTitle(e.target.value)}
                  placeholder="ex: Séminaire Annuel de l'Apiculture Durable"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-amber-600 focus:outline-hidden font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Type d'Événement</label>
                  <select
                    value={confEventType}
                    onChange={e => setConfEventType(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-gray-200 bg-white rounded-xl focus:outline-hidden"
                  >
                    <option value="Seminaire">Séminaire</option>
                    <option value="Atelier">Atelier de formation</option>
                    <option value="Conference">Conférence</option>
                    <option value="Reunion">Réunion d'entreprise</option>
                    <option value="Formation">Formation</option>
                    <option value="Autre">Autre rassemblement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Effectif prévu (Personnes)</label>
                  <input
                    type="number"
                    value={confParticipantsCount}
                    onChange={e => setConfParticipantsCount(e.target.value)}
                    placeholder="30"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nom du Responsable Organisateur</label>
                  <input
                    type="text"
                    value={confOrganizerName}
                    onChange={e => setConfOrganizerName(e.target.value)}
                    placeholder="ex: Dr. Chantal Lawson"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Structure / Entreprise / ONG</label>
                  <input
                    type="text"
                    value={confOrganizerEntity}
                    onChange={e => setConfOrganizerEntity(e.target.value)}
                    placeholder="ex: Coopérative Bio Bénin"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone Contact</label>
                  <input
                    type="tel"
                    value={confPhone}
                    onChange={e => setConfPhone(e.target.value)}
                    placeholder="+229 97 00 00 00"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse Email</label>
                  <input
                    type="email"
                    value={confEmail}
                    onChange={e => setConfEmail(e.target.value)}
                    placeholder="contact@organisation.bj"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date Début</label>
                  <input
                    type="date"
                    value={confStartDate}
                    onChange={e => setConfStartDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date Fin</label>
                  <input
                    type="date"
                    value={confEndDate}
                    onChange={e => setConfEndDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Format Horaires</label>
                <select
                  value={confTimeSlot}
                  onChange={e => setConfTimeSlot(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 bg-white rounded-xl focus:outline-hidden font-medium"
                >
                  <option value="08:30 - 17:00 (Journée Entière)">08:30 - 17:00 (Journée Entière)</option>
                  <option value="08:00 - 12:30 (Demi-Journée Matin)">08:00 - 12:30 (Demi-Journée Matin)</option>
                  <option value="14:00 - 18:30 (Demi-Journée Après-midi)">14:00 - 18:30 (Demi-Journée Après-midi)</option>
                  <option value="Soirée / Gala (18:00 - 23:00)">Soirée / Gala (18:00 - 23:00)</option>
                </select>
              </div>

              {/* Pre-packaged Extra Options */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <Coffee className="w-3.5 h-3.5 text-amber-700" /> Options Restauration &amp; Pauses Yamtaanu
                </span>

                <label className="flex items-center gap-2 text-xs text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confCoffeeBreak}
                    onChange={e => setConfCoffeeBreak(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Pause-café Miels &amp; Thés bio Yamtaanu (+ 500 FCFA / pers)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confLunchBuffet}
                    onChange={e => setConfLunchBuffet(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Buffet Déjeuner Nectar Bio (+ 1 500 FCFA / pers)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Remarques de disposition</label>
                <textarea
                  value={confNotes}
                  onChange={e => setConfNotes(e.target.value)}
                  placeholder="ex: Disposition des tables en U, besoin de 2 micros HF..."
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden h-16"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setShowNewConfBooking(false)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 text-xs font-bold text-slate-950 bg-brand-gold-500 hover:bg-brand-gold-600 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Enregistrer la Réservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: NEW CONFERENCE HALL CREATION */}
      {showNewHallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 text-white">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Ajouter une Nouvelle Salle de Conférence
              </h3>
              <p className="text-xs text-gray-300">Enregistrer un nouvel espace pour la location événementielle</p>
            </div>

            <form onSubmit={handleCreateConferenceHall} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom de la Salle</label>
                <input
                  type="text"
                  value={newHallName}
                  onChange={e => setNewHallName(e.target.value)}
                  placeholder="ex: Amphithéâtre Miel &amp; Innovation"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Capacité (Places)</label>
                  <input
                    type="number"
                    value={newHallCapacity}
                    onChange={e => setNewHallCapacity(e.target.value)}
                    placeholder="80"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tarif Journée (FCFA)</label>
                  <input
                    type="number"
                    value={newHallDailyRate}
                    onChange={e => setNewHallDailyRate(e.target.value)}
                    placeholder="90000"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tarif Demi-Journée (FCFA)</label>
                  <input
                    type="number"
                    value={newHallHalfDayRate}
                    onChange={e => setNewHallHalfDayRate(e.target.value)}
                    placeholder="55000"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tarif Horaire (FCFA)</label>
                  <input
                    type="number"
                    value={newHallHourlyRate}
                    onChange={e => setNewHallHourlyRate(e.target.value)}
                    placeholder="15000"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Équipements inclus (séparés par des virgules)</label>
                <input
                  type="text"
                  value={newHallAmenities}
                  onChange={e => setNewHallAmenities(e.target.value)}
                  placeholder="Vidéoprojecteur HD, Wifi, Sono, Climatisation"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description courte</label>
                <textarea
                  value={newHallDesc}
                  onChange={e => setNewHallDesc(e.target.value)}
                  placeholder="Espace climatisé lumineux idéal pour présentations..."
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden h-16"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowNewHallModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-xl transition-colors cursor-pointer"
                >
                  Créer la Salle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
