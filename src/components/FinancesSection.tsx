import React, { useState, useMemo } from 'react';
import { BambouMielStore } from '../dataStore';
import { 
  SyscohadaAccount, 
  SyscohadaJournalEntry, 
  JournalEntryLine, 
  CashReconciliationRecord,
  Expense 
} from '../types';
import { 
  BookOpen, 
  FileSpreadsheet, 
  Scale, 
  TrendingUp, 
  Landmark, 
  Users, 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  DollarSign, 
  PieChart, 
  Layers, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  Sparkles,
  Building2,
  Lock,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface AccountStatItem {
  code: string;
  label: string;
  accountClass: number;
  type: string;
  sector?: string;
  debitTotal: number;
  creditTotal: number;
  balance: number;
}

interface FinancesSectionProps {
  store: BambouMielStore;
  onRefresh: () => void;
  onBackToDashboard?: () => void;
  onNavigateToConfig?: (listType: 'locations' | 'artisans' | 'juiceFlavors' | 'teaBlends' | 'clients' | 'carriers' | 'products') => void;
}

export default function FinancesSection({ store, onRefresh, onBackToDashboard, onNavigateToConfig }: FinancesSectionProps) {
  // Navigation Tabs for SYSCOHADA Accounting
  const [activeTab, setActiveTab] = useState<
    'plan' | 'journal' | 'grand_livre' | 'balance' | 'resultat_sig' | 'tresorerie' | 'balance_agee' | 'depenses'
  >('resultat_sig');

  // Sector filtering across analytics
  const [selectedSector, setSelectedSector] = useState<'all' | 'miel' | 'jus' | 'the' | 'hotel' | 'conference' | 'general'>('all');
  
  // Date filtering
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Search in accounts and journals
  const [searchAccountQuery, setSearchAccountQuery] = useState('');
  const [selectedAccountClass, setSelectedAccountClass] = useState<number | 'all'>('all');
  const [selectedJournalFilter, setSelectedJournalFilter] = useState<'all' | 'Ventes' | 'Achats' | 'Caisse' | 'Banque' | 'OD'>('all');
  const [selectedAccountForLedger, setSelectedAccountForLedger] = useState<string>('all');

  // Manual Journal Entry Form Modal State
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [entryJournal, setEntryJournal] = useState<'Ventes' | 'Achats' | 'Caisse' | 'Banque' | 'OD'>('OD');
  const [entryPieceRef, setEntryPieceRef] = useState('');
  const [entryLabel, setEntryLabel] = useState('');
  const [entryLines, setEntryLines] = useState<JournalEntryLine[]>([
    { accountCode: '6011', accountLabel: 'Achats Bambou & Matériel Apicole', debit: 0, credit: 0, sector: 'miel' },
    { accountCode: '5711', accountLabel: 'Caisse Principale (Espèces Siège)', debit: 0, credit: 0, sector: 'general' }
  ]);

  // New Account Modal State
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccCode, setNewAccCode] = useState('');
  const [newAccLabel, setNewAccLabel] = useState('');
  const [newAccClass, setNewAccClass] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(6);
  const [newAccType, setNewAccType] = useState<'actif' | 'passif' | 'charge' | 'produit' | 'tresorerie'>('charge');
  const [newAccSector, setNewAccSector] = useState<'miel' | 'jus' | 'the' | 'hotel' | 'conference' | 'general'>('general');
  const [newAccDesc, setNewAccDesc] = useState('');

  // Cash Reconciliation Modal State
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [reconcileAccCode, setReconcileAccCode] = useState<'5711' | '5712' | '5713' | '5714' | '5211'>('5711');
  const [reconcileCountedBalance, setReconcileCountedBalance] = useState<string>('');
  const [reconcileJustification, setReconcileJustification] = useState('');

  // New Expense Modal State
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<Expense['category']>('Bambou & Matériel');
  const [expDivision, setExpDivision] = useState<Expense['division']>('miel');
  const [expPaymentMethod, setExpPaymentMethod] = useState<'especes' | 'momo' | 'banque'>('especes');

  // --- Date Formatting Helper ---
  const formatDateToFR = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const clean = dateStr.split('T')[0];
      const parts = clean.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch (e) {}
    return dateStr;
  };

  // --- Dynamic Journal Entries Calculation & Synthesis ---
  const allJournalEntries = useMemo(() => {
    return store.journalEntries || [];
  }, [store.journalEntries]);

  // Filtered Journal Entries
  const filteredJournalEntries = useMemo(() => {
    return allJournalEntries.filter(entry => {
      const matchJournal = selectedJournalFilter === 'all' || entry.journal === selectedJournalFilter;
      const matchStart = !startDate || entry.date >= startDate;
      const matchEnd = !endDate || entry.date <= endDate;
      return matchJournal && matchStart && matchEnd;
    });
  }, [allJournalEntries, selectedJournalFilter, startDate, endDate]);

  // --- Global Accounting Balance & Accounts Aggregator ---
  const accountStatsMap = useMemo<Map<string, AccountStatItem>>(() => {
    const map = new Map<string, AccountStatItem>();

    // Initialize with all SYSCOHADA accounts
    store.syscohadaAccounts.forEach(acc => {
      map.set(acc.code, {
        code: acc.code,
        label: acc.label,
        accountClass: acc.accountClass,
        type: acc.type,
        sector: acc.sector,
        debitTotal: 0,
        creditTotal: 0,
        balance: 0
      });
    });

    // Sum all movements from journal entries
    allJournalEntries.forEach(entry => {
      entry.lines.forEach(line => {
        let accStat = map.get(line.accountCode);
        if (!accStat) {
          accStat = {
            code: line.accountCode,
            label: line.accountLabel,
            accountClass: parseInt(line.accountCode[0], 10) || 4,
            type: 'general',
            sector: line.sector,
            debitTotal: 0,
            creditTotal: 0,
            balance: 0
          };
          map.set(line.accountCode, accStat);
        }
        accStat.debitTotal += line.debit;
        accStat.creditTotal += line.credit;
        accStat.balance = accStat.debitTotal - accStat.creditTotal;
      });
    });

    return map;
  }, [store.syscohadaAccounts, allJournalEntries]);

  const accountStatsList = useMemo<AccountStatItem[]>(() => {
    return Array.from(accountStatsMap.values());
  }, [accountStatsMap]);

  // Grand Totals for Balance Verification
  const totalDebitsAll = useMemo(() => {
    let sum = 0;
    accountStatsMap.forEach(stat => { sum += stat.debitTotal; });
    return sum;
  }, [accountStatsMap]);

  const totalCreditsAll = useMemo(() => {
    let sum = 0;
    accountStatsMap.forEach(stat => { sum += stat.creditTotal; });
    return sum;
  }, [accountStatsMap]);

  const isAccountingBalanced = Math.abs(totalDebitsAll - totalCreditsAll) < 1;

  // --- Sectoral Revenues & Expenses Synthesis (SIG) ---
  const sectorFinancials = useMemo(() => {
    const sectors = [
      { id: 'miel', name: 'Miellerie & Apiculture', icon: '🍯', codeProduct: '7011', codeCharge: '6011' },
      { id: 'jus', name: 'Atelier Jus & Nectars', icon: '🍹', codeProduct: '7012', codeCharge: '6012' },
      { id: 'the', name: 'Atelier Thés & Tisanes', icon: '🌿', codeProduct: '7013', codeCharge: '6013' },
      { id: 'hotel', name: 'Éco-Lodge & Bungalows', icon: '🏨', codeProduct: '7061', codeCharge: '624' },
      { id: 'conference', name: 'Salles de Conférence & Séminaires', icon: '🏛️', codeProduct: '7062', codeCharge: '624' }
    ];

    // Compute from actual orders, bookings, conference bookings and expenses
    return sectors.map(sec => {
      let revenue = 0;
      let directCosts = 0;
      let orderCount = 0;

      // 1. Orders revenue
      store.orders.forEach(o => {
        if (o.status !== 'retourne') {
          o.items.forEach(it => {
            const p = store.products.find(prod => prod.id === it.productId);
            if (p && p.category === sec.id) {
              revenue += it.price * it.quantity;
              orderCount++;
            }
          });
        }
      });

      // 2. Hotel bookings
      if (sec.id === 'hotel') {
        store.bookings.forEach(b => {
          if (b.status === 'en_cours' || b.status === 'termine') {
            revenue += b.totalBilled;
            orderCount++;
          }
        });
      }

      // 3. Conference bookings
      if (sec.id === 'conference') {
        store.conferenceBookings.forEach(cb => {
          if (cb.status === 'confirme' || cb.status === 'en_cours' || cb.status === 'termine') {
            revenue += cb.totalBilled;
            orderCount++;
          }
        });
      }

      // 4. Expenses for this sector
      store.expenses.forEach(e => {
        if (e.division === sec.id) {
          directCosts += e.amount;
        }
      });

      const grossMargin = revenue - directCosts;
      const marginRate = revenue > 0 ? ((grossMargin / revenue) * 100).toFixed(1) : '0';

      return {
        ...sec,
        revenue,
        directCosts,
        grossMargin,
        marginRate,
        orderCount
      };
    });
  }, [store.orders, store.bookings, store.conferenceBookings, store.expenses, store.products]);

  // Overall Financial Totals
  const totalTurnover = useMemo(() => {
    return sectorFinancials.reduce((sum, s) => sum + s.revenue, 0);
  }, [sectorFinancials]);

  const totalExpenses = useMemo(() => {
    return store.expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [store.expenses]);

  const netProfit = totalTurnover - totalExpenses;

  // --- Treasury Accounts Status & Balances ---
  const treasuryAccounts = useMemo(() => {
    const list = [
      { code: '5711', name: 'Caisse Principale (Espèces Siège)', type: 'especes', icon: '💵' },
      { code: '5712', name: 'Caisse POS Comptoir (Boutique)', type: 'especes', icon: '🛒' },
      { code: '5713', name: 'Trésorerie Mobile Money - MTN MoMo', type: 'momo', icon: '📱' },
      { code: '5714', name: 'Trésorerie Mobile Money - Moov Money', type: 'momo', icon: '📲' },
      { code: '5211', name: 'Banque (Compte courant BOA / Ecobank)', type: 'banque', icon: '🏦' }
    ];

    return list.map(t => {
      const stat = accountStatsMap.get(t.code);
      const debit = stat ? stat.debitTotal : 0;
      const credit = stat ? stat.creditTotal : 0;
      const balance = debit - credit;
      const latestReconciliation = store.reconciliations.find(r => r.accountCode === t.code);

      return {
        ...t,
        debit,
        credit,
        balance,
        latestReconciliation
      };
    });
  }, [accountStatsMap, store.reconciliations]);

  const totalLiquidAssets = useMemo(() => {
    return treasuryAccounts.reduce((sum, t) => sum + t.balance, 0);
  }, [treasuryAccounts]);

  // --- Client Receivables & Aged Balance (Compte 411) ---
  const clientAccountsData = useMemo(() => {
    const clientsMap = new Map<string, {
      name: string;
      totalBilled: number;
      totalPaid: number;
      dueAmount: number;
      orderCount: number;
      lastDate: string;
      ageCategory: '0-30j' | '31-60j' | '+60j';
    }>();

    store.orders.forEach(o => {
      if (o.status !== 'retourne' && o.clientName) {
        const cName = o.clientName.trim();
        let c = clientsMap.get(cName);
        if (!c) {
          c = {
            name: cName,
            totalBilled: 0,
            totalPaid: 0,
            dueAmount: 0,
            orderCount: 0,
            lastDate: o.date,
            ageCategory: '0-30j'
          };
          clientsMap.set(cName, c);
        }
        c.totalBilled += o.totalAmount;
        c.totalPaid += (o.paidAmount ?? o.totalAmount);
        c.dueAmount = c.totalBilled - c.totalPaid;
        c.orderCount++;
        if (o.date > c.lastDate) c.lastDate = o.date;
      }
    });

    return Array.from(clientsMap.values());
  }, [store.orders]);

  const totalReceivables = useMemo(() => {
    return clientAccountsData.reduce((sum, c) => sum + Math.max(0, c.dueAmount), 0);
  }, [clientAccountsData]);

  // --- Ledger Movements for Selected Account ---
  const selectedLedgerMovements = useMemo(() => {
    if (selectedAccountForLedger === 'all') {
      return allJournalEntries.flatMap(entry => 
        entry.lines.map(line => ({
          entryId: entry.id,
          date: entry.date,
          journal: entry.journal,
          pieceRef: entry.pieceRef,
          label: entry.label,
          accountCode: line.accountCode,
          accountLabel: line.accountLabel,
          debit: line.debit,
          credit: line.credit,
          sector: line.sector
        }))
      ).sort((a, b) => b.date.localeCompare(a.date));
    }

    let runningBalance = 0;
    const movements: {
      entryId: string;
      date: string;
      journal: string;
      pieceRef: string;
      label: string;
      accountCode: string;
      accountLabel: string;
      debit: number;
      credit: number;
      runningBalance: number;
      sector?: string;
    }[] = [];

    // Sort chronologically to calculate running balance
    const sortedEntries = [...allJournalEntries].sort((a, b) => a.date.localeCompare(b.date));
    sortedEntries.forEach(entry => {
      entry.lines.forEach(line => {
        if (line.accountCode === selectedAccountForLedger) {
          runningBalance += (line.debit - line.credit);
          movements.push({
            entryId: entry.id,
            date: entry.date,
            journal: entry.journal,
            pieceRef: entry.pieceRef,
            label: entry.label,
            accountCode: line.accountCode,
            accountLabel: line.accountLabel,
            debit: line.debit,
            credit: line.credit,
            runningBalance,
            sector: line.sector
          });
        }
      });
    });

    return movements.reverse();
  }, [allJournalEntries, selectedAccountForLedger]);

  // --- Handlers: Add Journal Entry ---
  const handleAddEntryLine = () => {
    setEntryLines(prev => [
      ...prev,
      { accountCode: '4111', accountLabel: 'Clients - Ventes & Distributeurs', debit: 0, credit: 0, sector: 'general' }
    ]);
  };

  const handleUpdateEntryLine = (index: number, field: keyof JournalEntryLine, value: any) => {
    setEntryLines(prev => {
      const updated = [...prev];
      if (field === 'accountCode') {
        const found = store.syscohadaAccounts.find(a => a.code === value);
        updated[index] = {
          ...updated[index],
          accountCode: value,
          accountLabel: found ? found.label : updated[index].accountLabel
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleRemoveEntryLine = (index: number) => {
    if (entryLines.length <= 2) {
      alert('Une écriture comptable doit comporter au moins 2 lignes (Partie Double).');
      return;
    }
    setEntryLines(prev => prev.filter((_, i) => i !== index));
  };

  const modalTotalDebit = useMemo(() => entryLines.reduce((s, l) => s + (Number(l.debit) || 0), 0), [entryLines]);
  const modalTotalCredit = useMemo(() => entryLines.reduce((s, l) => s + (Number(l.credit) || 0), 0), [entryLines]);
  const isModalBalanced = modalTotalDebit > 0 && modalTotalDebit === modalTotalCredit;

  const handleSaveJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isModalBalanced) {
      alert('Erreur : L\'écriture comptable n\'est pas équilibrée (Total Débit doit être égal au Total Crédit).');
      return;
    }
    if (!entryLabel.trim()) {
      alert('Veuillez renseigner un libellé pour cette écriture.');
      return;
    }

    store.addJournalEntry({
      date: entryDate,
      journal: entryJournal,
      pieceRef: entryPieceRef.trim() || `OD-${Date.now().toString().slice(-4)}`,
      label: entryLabel.trim(),
      lines: entryLines.map(l => ({
        accountCode: l.accountCode,
        accountLabel: l.accountLabel,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        sector: l.sector
      })),
      totalDebit: modalTotalDebit,
      totalCredit: modalTotalCredit,
      validated: true,
      source: 'manual'
    });

    setShowAddEntryModal(false);
    setEntryLabel('');
    setEntryPieceRef('');
    setEntryLines([
      { accountCode: '6011', accountLabel: 'Achats Bambou & Matériel Apicole', debit: 0, credit: 0, sector: 'miel' },
      { accountCode: '5711', accountLabel: 'Caisse Principale (Espèces Siège)', debit: 0, credit: 0, sector: 'general' }
    ]);
    onRefresh();
  };

  // --- Handlers: Add Custom SYSCOHADA Account ---
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccCode.trim() || !newAccLabel.trim()) {
      alert('Veuillez renseigner le numéro et le libellé du compte.');
      return;
    }

    const success = store.addSyscohadaAccount({
      code: newAccCode.trim(),
      label: newAccLabel.trim(),
      accountClass: newAccClass,
      type: newAccType,
      sector: newAccSector,
      description: newAccDesc.trim()
    });

    if (!success) {
      alert('Ce numéro de compte existe déjà dans le plan comptable.');
      return;
    }

    setShowAddAccountModal(false);
    setNewAccCode('');
    setNewAccLabel('');
    setNewAccDesc('');
    onRefresh();
  };

  // --- Handlers: Cash Reconciliation ---
  const handleSaveReconciliation = (e: React.FormEvent) => {
    e.preventDefault();
    const counted = parseFloat(reconcileCountedBalance);
    if (isNaN(counted)) {
      alert('Veuillez saisir un montant réel constaté valide.');
      return;
    }

    const targetAccount = treasuryAccounts.find(t => t.code === reconcileAccCode);
    const theoretical = targetAccount ? targetAccount.balance : 0;
    const diff = counted - theoretical;
    const currentUserName = localStorage.getItem('yamtaanu_current_user_name') || 'Administrateur Comptable';

    store.addReconciliation({
      date: new Date().toISOString().split('T')[0],
      accountCode: reconcileAccCode,
      accountName: targetAccount ? targetAccount.name : 'Trésorerie',
      theoreticalBalance: theoretical,
      countedRealBalance: counted,
      difference: diff,
      justification: reconcileJustification.trim(),
      verifiedBy: currentUserName
    });

    setShowReconcileModal(false);
    setReconcileCountedBalance('');
    setReconcileJustification('');
    onRefresh();
  };

  // --- Handlers: Add Expense ---
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Veuillez saisir un montant de dépense valide.');
      return;
    }

    store.addExpense({
      date: expDate,
      description: expDesc.trim() || 'Achat / Frais d\'exploitation',
      amount: amountNum,
      category: expCategory,
      division: expDivision
    });

    // Post corresponding SYSCOHADA entry
    const chargeAccCode = expDivision === 'miel' ? '6011' : (expDivision === 'jus' ? '6012' : (expDivision === 'the' ? '6013' : '624'));
    const chargeAcc = store.syscohadaAccounts.find(a => a.code === chargeAccCode);
    const treasAccCode = expPaymentMethod === 'momo' ? '5713' : (expPaymentMethod === 'banque' ? '5211' : '5711');
    const treasAcc = store.syscohadaAccounts.find(a => a.code === treasAccCode);

    store.addJournalEntry({
      date: expDate,
      journal: expPaymentMethod === 'banque' ? 'Banque' : (expPaymentMethod === 'momo' ? 'Caisse' : 'Achats'),
      pieceRef: `DEP-${Date.now().toString().slice(-4)}`,
      label: `Dépense : ${expDesc || expCategory} (${expDivision.toUpperCase()})`,
      lines: [
        {
          accountCode: chargeAccCode,
          accountLabel: chargeAcc ? chargeAcc.label : 'Charges d\'exploitation',
          debit: amountNum,
          credit: 0,
          sector: expDivision
        },
        {
          accountCode: treasAccCode,
          accountLabel: treasAcc ? treasAcc.label : 'Trésorerie',
          debit: 0,
          credit: amountNum,
          sector: 'general'
        }
      ],
      totalDebit: amountNum,
      totalCredit: amountNum,
      validated: true,
      source: 'auto_expense'
    });

    setShowAddExpenseModal(false);
    setExpDesc('');
    setExpAmount('');
    onRefresh();
  };

  // --- Printable Official Financial Statements Generator ---
  const downloadOfficialBalanceHTML = () => {
    const logoUrl = `${window.location.origin}/assets/aistudio/image_467966f7.png`;
    const rows = accountStatsList
      .filter((a: AccountStatItem) => a.debitTotal > 0 || a.creditTotal > 0)
      .sort((a: AccountStatItem, b: AccountStatItem) => a.code.localeCompare(b.code))
      .map((acc: AccountStatItem) => `
        <tr>
          <td style="font-weight: bold; font-family: monospace;">${acc.code}</td>
          <td>${acc.label}</td>
          <td style="text-align: right;">${acc.debitTotal.toLocaleString()} FCFA</td>
          <td style="text-align: right;">${acc.creditTotal.toLocaleString()} FCFA</td>
          <td style="text-align: right; color: #166534; font-weight: ${acc.balance > 0 ? 'bold' : 'normal'}">${acc.balance > 0 ? acc.balance.toLocaleString() + ' FCFA' : '-'}</td>
          <td style="text-align: right; color: #991b1b; font-weight: ${acc.balance < 0 ? 'bold' : 'normal'}">${acc.balance < 0 ? Math.abs(acc.balance).toLocaleString() + ' FCFA' : '-'}</td>
        </tr>
      `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>BALANCE GÉNÉRALE DES COMPTES - SYSCOHADA</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #111827; max-width: 1000px; margin: 0 auto; background: #fff; }
          .header { border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 22px; font-weight: bold; color: #065f46; margin: 0; }
          .subtitle { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background: #f0fdf4; border: 1px solid #d1fae5; padding: 10px; color: #065f46; text-align: left; }
          td { border: 1px solid #e5e7eb; padding: 8px 10px; }
          .total-row { background: #ecfdf5; font-weight: bold; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">BALANCE GÉNÉRALE DES COMPTES</h1>
            <div class="subtitle">BambouMiel - Les Triangles • Normes SYSCOHADA / UEMOA</div>
            <div style="font-size: 12px; color: #4b5563; margin-top: 5px;">Date d'édition : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</div>
          </div>
          <img src="${logoUrl}" style="height: 60px; border-radius: 8px;" alt="Logo" />
        </div>

        <table>
          <thead>
            <tr>
              <th>Compte</th>
              <th>Intitulé du Compte</th>
              <th style="text-align: right;">Total Débit</th>
              <th style="text-align: right;">Total Crédit</th>
              <th style="text-align: right;">Solde Débiteur</th>
              <th style="text-align: right;">Solde Créditeur</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="total-row">
              <td colspan="2" style="text-align: right;">TOTAUX GÉNÉRAUX :</td>
              <td style="text-align: right;">${totalDebitsAll.toLocaleString()} FCFA</td>
              <td style="text-align: right;">${totalCreditsAll.toLocaleString()} FCFA</td>
              <td style="text-align: right; color: #166534;">${totalDebitsAll.toLocaleString()} FCFA</td>
              <td style="text-align: right; color: #991b1b;">${totalCreditsAll.toLocaleString()} FCFA</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
          <div><strong>Contrôle d'Équilibre :</strong> ${isAccountingBalanced ? '✅ Parfaitement Équilibré (Débit = Crédit)' : '⚠️ Écart Détecté'}</div>
          <div style="text-align: center;">
            <div><strong>Direction Générale / Validation :</strong></div>
            <img src="${window.location.origin}/assets/aistudio/image_8866b669.png" style="height: 75px; margin-top: 6px; mix-blend-mode: multiply;" alt="Cachet Officiel Les Triangles & Signature Le Directeur" />
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Balance_Generale_SYSCOHADA_${new Date().toISOString().split('T')[0]}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 rounded-3xl text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Système Comptable Professionnel SYSCOHADA / UEMOA</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span>📊 Comptabilité & Finance Générale</span>
            </h1>
            <p className="text-xs md:text-sm text-emerald-200/80 max-w-2xl">
              Tenue rigoureuse des journaux auxiliaires, Grand Livre, Balance générale à 6 colonnes, Compte de résultat analytique par secteur et pointage de trésorerie en partie double.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddEntryModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Écriture OD / Journal</span>
            </button>
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Saisir Dépense</span>
            </button>
            <button
              onClick={downloadOfficialBalanceHTML}
              className="px-3.5 py-2.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              title="Exporter la Balance générale en HTML/PDF imprimable"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Export Balance</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
            <span>Chiffre d'Affaires Brut (Cl. 7)</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {totalTurnover.toLocaleString()} <span className="text-xs font-normal text-gray-500">FCFA</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Miel, Jus, Thé, Lodge & Conférence</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
            <span>Charges d'Exploitation (Cl. 6)</span>
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {totalExpenses.toLocaleString()} <span className="text-xs font-normal text-gray-500">FCFA</span>
          </div>
          <div className="text-[11px] text-gray-500 font-medium">
            Matières, salaires, logistique, entretien
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
            <span>Résultat Net d'Exploitation</span>
            <span className={`p-1.5 rounded-lg ${netProfit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {netProfit.toLocaleString()} <span className="text-xs font-normal text-gray-500">FCFA</span>
          </div>
          <div className="text-[11px] text-gray-500 font-medium">
            Rentabilité nette : {totalTurnover > 0 ? ((netProfit / totalTurnover) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
            <span>Disponibilités Trésorerie (Cl. 5)</span>
            <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
              <Landmark className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-teal-800">
            {totalLiquidAssets.toLocaleString()} <span className="text-xs font-normal text-gray-500">FCFA</span>
          </div>
          <div className="text-[11px] text-teal-600 font-medium flex items-center justify-between">
            <span>Caisse + MoMo + Banque</span>
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
              {isAccountingBalanced ? 'Équilibré D=C' : 'Écart'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-200">
        {[
          { id: 'resultat_sig', label: 'Compte Résultat & SIG', icon: TrendingUp },
          { id: 'journal', label: 'Journaux & Écritures', icon: BookOpen },
          { id: 'grand_livre', label: 'Grand Livre', icon: Layers },
          { id: 'balance', label: 'Balance Générale (6 Col.)', icon: Scale },
          { id: 'tresorerie', label: 'Trésorerie & Pointage', icon: Landmark },
          { id: 'balance_agee', label: 'Créances & Tiers (411/401)', icon: Users },
          { id: 'depenses', label: 'Dépenses & Charges', icon: Receipt },
          { id: 'plan', label: 'Plan Comptable SYSCOHADA', icon: Tag }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-300/50'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: COMPTE DE RÉSULTAT & SOLDES INTERMÉDIAIRES DE GESTION (SIG) */}
      {activeTab === 'resultat_sig' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-600" />
                  <span>Compte de Résultat Analytique & Soldes Intermédiaires de Gestion (SIG)</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Ventilation par secteur d'activité : Chiffre d'affaires, consommations intermédiaires, marge brute et contribution au résultat net.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Filtrer Secteur :</span>
                <select
                  value={selectedSector}
                  onChange={e => setSelectedSector(e.target.value as any)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Tous les secteurs réunis</option>
                  <option value="miel">🍯 Miellerie & Apiculture</option>
                  <option value="jus">🍹 Atelier Jus & Nectars</option>
                  <option value="the">🌿 Atelier Thés & Tisanes</option>
                  <option value="hotel">🏨 Éco-Lodge & Hébergements</option>
                  <option value="conference">🏛️ Salles de Conférence & Séminaires</option>
                </select>
              </div>
            </div>

            {/* Sector Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sectorFinancials
                .filter(sec => selectedSector === 'all' || sec.id === selectedSector)
                .map(sec => (
                  <div key={sec.id} className="p-5 rounded-2xl border border-gray-150 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{sec.icon}</span>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{sec.name}</div>
                          <div className="text-[10px] text-gray-500 font-mono">Compte SYSCOHADA : {sec.codeProduct}</div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${parseFloat(sec.marginRate) > 50 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        Marge : {sec.marginRate}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Chiffre d'Affaires</span>
                        <span className="font-bold text-gray-900">{sec.revenue.toLocaleString()} FCFA</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Coûts Directs / Matières</span>
                        <span className="font-bold text-gray-600">{sec.directCosts.toLocaleString()} FCFA</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-600">Marge Brute Sectorielle :</span>
                      <span className="font-black text-emerald-700">{sec.grossMargin.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Official SYSCOHADA SIG Synthesis Table */}
            <div className="mt-6 border border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 text-xs font-bold text-gray-700 flex justify-between items-center">
                <span>Tableau des Soldes Intermédiaires de Gestion (Normes SYSCOHADA)</span>
                <span className="text-[11px] font-normal text-gray-500">Unité monétaire : Franc CFA</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100/75 text-gray-600 uppercase font-semibold text-[10px] border-b border-gray-200">
                    <tr>
                      <th className="p-3">Rubrique Comptable SYSCOHADA</th>
                      <th className="p-3">Comptes Liés</th>
                      <th className="p-3 text-right">Montant (FCFA)</th>
                      <th className="p-3 text-right">% Chiffre d'Affaires</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="bg-white hover:bg-gray-50 font-bold">
                      <td className="p-3 text-gray-900">1. CHIFFRE D'AFFAIRES (Ventes de Produits & Prestations)</td>
                      <td className="p-3 text-gray-500 font-mono">7011, 7012, 7013, 7061, 7062, 707</td>
                      <td className="p-3 text-right text-emerald-700">{totalTurnover.toLocaleString()}</td>
                      <td className="p-3 text-right">100.0 %</td>
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td className="p-3 text-gray-700 pl-6">- Achats de matières premières & intrants consommés</td>
                      <td className="p-3 text-gray-500 font-mono">6011, 6012, 6013, 6022</td>
                      <td className="p-3 text-right text-red-600">
                        {store.expenses.filter(e => e.division !== 'general' && e.category.includes('Matériel') || e.category.includes('Ingrédients') || e.category.includes('Fruits')).reduce((s, e) => s + e.amount, 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-gray-500">
                        {totalTurnover > 0 ? ((store.expenses.filter(e => e.division !== 'general').reduce((s, e) => s + e.amount, 0) / totalTurnover) * 100).toFixed(1) : 0} %
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/40 font-bold">
                      <td className="p-3 text-emerald-900">= 2. MARGE COMMERCIALE BRUTE</td>
                      <td className="p-3 text-emerald-700 font-mono">Solde 1 - Achats</td>
                      <td className="p-3 text-right text-emerald-800 font-black">
                        {(totalTurnover - store.expenses.filter(e => e.division !== 'general').reduce((s, e) => s + e.amount, 0)).toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-emerald-800">
                        {totalTurnover > 0 ? (((totalTurnover - store.expenses.filter(e => e.division !== 'general').reduce((s, e) => s + e.amount, 0)) / totalTurnover) * 100).toFixed(1) : 0} %
                      </td>
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td className="p-3 text-gray-700 pl-6">- Services extérieurs & transports (Fret bus, télécom, entretien)</td>
                      <td className="p-3 text-gray-500 font-mono">612, 624, 628</td>
                      <td className="p-3 text-right text-red-600">
                        {store.expenses.filter(e => e.category.includes('Transport') || e.category.includes('Maintenance') || e.category.includes('Divers')).reduce((s, e) => s + e.amount, 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-gray-500">-</td>
                    </tr>
                    <tr className="bg-teal-50/40 font-bold">
                      <td className="p-3 text-teal-900">= 3. VALEUR AJOUTÉE (VA)</td>
                      <td className="p-3 text-teal-700 font-mono">Marge Brute - Services</td>
                      <td className="p-3 text-right text-teal-900 font-black">
                        {(totalTurnover - store.expenses.filter(e => !e.category.includes('Salaires')).reduce((s, e) => s + e.amount, 0)).toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-teal-900">
                        {totalTurnover > 0 ? (((totalTurnover - store.expenses.filter(e => !e.category.includes('Salaires')).reduce((s, e) => s + e.amount, 0)) / totalTurnover) * 100).toFixed(1) : 0} %
                      </td>
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td className="p-3 text-gray-700 pl-6">- Charges de personnel (Salaires & Rémunérations apiculteurs/vanniers)</td>
                      <td className="p-3 text-gray-500 font-mono">661</td>
                      <td className="p-3 text-right text-red-600">
                        {store.expenses.filter(e => e.category === 'Salaires').reduce((s, e) => s + e.amount, 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-gray-500">-</td>
                    </tr>
                    <tr className="bg-emerald-100/70 font-black text-sm text-gray-900">
                      <td className="p-3">= 4. RÉSULTAT NET D'EXPLOITATION</td>
                      <td className="p-3 text-emerald-800 font-mono">Total Produits (Cl.7) - Total Charges (Cl.6)</td>
                      <td className="p-3 text-right text-emerald-800 text-base">{netProfit.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right text-emerald-800">{totalTurnover > 0 ? ((netProfit / totalTurnover) * 100).toFixed(1) : 0} %</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JOURNAUX AUXILIAIRES & ÉCRITURES COMPTABLES */}
      {activeTab === 'journal' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>Journaux Auxiliaires & Écritures Comptables (Partie Double)</span>
              </h2>
              <p className="text-xs text-gray-500">
                Saisie chronologique et consultation des écritures équilibrées Débit = Crédit selon les normes SYSCOHADA.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedJournalFilter}
                onChange={e => setSelectedJournalFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700"
              >
                <option value="all">Tous les journaux</option>
                <option value="Ventes">Journal des Ventes (VT)</option>
                <option value="Achats">Journal des Achats (AC)</option>
                <option value="Caisse">Journal de Caisse (CA)</option>
                <option value="Banque">Journal de Banque (BQ)</option>
                <option value="OD">Opérations Diverses (OD)</option>
              </select>

              <button
                onClick={() => setShowAddEntryModal(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter Écriture</span>
              </button>
            </div>
          </div>

          {/* Journal Entries List */}
          <div className="space-y-4">
            {filteredJournalEntries.length === 0 ? (
              <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                Aucune écriture comptable trouvée pour ce journal ou cette période.
              </div>
            ) : (
              filteredJournalEntries.map(entry => (
                <div key={entry.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        entry.journal === 'Ventes' ? 'bg-emerald-100 text-emerald-800' :
                        entry.journal === 'Achats' ? 'bg-amber-100 text-amber-800' :
                        entry.journal === 'Caisse' ? 'bg-teal-100 text-teal-800' :
                        entry.journal === 'Banque' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {entry.journal}
                      </span>
                      <span className="font-bold text-gray-900">{formatDateToFR(entry.date)}</span>
                      <span className="text-gray-400">•</span>
                      <span className="font-mono text-gray-600 font-semibold">{entry.pieceRef}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-gray-700 font-medium">{entry.label}</span>
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        Total : {entry.totalDebit.toLocaleString()} FCFA
                      </span>
                      {entry.source === 'manual' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Voulez-vous supprimer cette écriture comptable manuelle ?')) {
                              store.deleteJournalEntry(entry.id);
                              onRefresh();
                            }
                          }}
                          className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                          title="Supprimer écriture"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-100/50 text-gray-500 uppercase text-[9px] border-b border-gray-100">
                        <tr>
                          <th className="p-2.5 pl-4">Compte OHADA</th>
                          <th className="p-2.5">Intitulé</th>
                          <th className="p-2.5">Secteur</th>
                          <th className="p-2.5 text-right">Débit (FCFA)</th>
                          <th className="p-2.5 text-right pr-4">Crédit (FCFA)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {entry.lines.map((line, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="p-2.5 pl-4 font-mono font-bold text-gray-800">{line.accountCode}</td>
                            <td className="p-2.5 text-gray-700">{line.accountLabel}</td>
                            <td className="p-2.5 text-gray-500 text-[11px] capitalize">{line.sector || 'général'}</td>
                            <td className="p-2.5 text-right font-mono font-semibold text-gray-900">
                              {line.debit > 0 ? line.debit.toLocaleString() : '-'}
                            </td>
                            <td className="p-2.5 text-right pr-4 font-mono font-semibold text-gray-900">
                              {line.credit > 0 ? line.credit.toLocaleString() : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GRAND LIVRE GÉNÉRAL & ANALYTIQUE */}
      {activeTab === 'grand_livre' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>Grand Livre Général des Comptes</span>
              </h2>
              <p className="text-xs text-gray-500">
                Suivi chronologique des mouvements et calcul du solde progressif compte par compte.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Sélectionner un Compte :</span>
              <select
                value={selectedAccountForLedger}
                onChange={e => setSelectedAccountForLedger(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 max-w-xs"
              >
                <option value="all">Tous les comptes (Vue globale)</option>
                {store.syscohadaAccounts.map(acc => (
                  <option key={acc.code} value={acc.code}>
                    {acc.code} - {acc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 text-gray-600 uppercase text-[10px] border-b border-gray-200">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Journal</th>
                    <th className="p-3">N° Pièce</th>
                    <th className="p-3">Compte</th>
                    <th className="p-3">Libellé de l'opération</th>
                    <th className="p-3 text-right">Débit (FCFA)</th>
                    <th className="p-3 text-right">Crédit (FCFA)</th>
                    {selectedAccountForLedger !== 'all' && (
                      <th className="p-3 text-right pr-4">Solde Progressif</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedLedgerMovements.map((mov, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-gray-600">{formatDateToFR(mov.date)}</td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold">
                          {mov.journal}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-gray-700 font-semibold">{mov.pieceRef}</td>
                      <td className="p-3 font-mono font-bold text-gray-900">{mov.accountCode}</td>
                      <td className="p-3 text-gray-800">{mov.label}</td>
                      <td className="p-3 text-right font-mono font-bold text-gray-900">
                        {mov.debit > 0 ? mov.debit.toLocaleString() : '-'}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-gray-900">
                        {mov.credit > 0 ? mov.credit.toLocaleString() : '-'}
                      </td>
                      {selectedAccountForLedger !== 'all' && (
                        <td className={`p-3 text-right pr-4 font-mono font-bold ${
                          (mov as any).runningBalance >= 0 ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {Math.abs((mov as any).runningBalance).toLocaleString()} {(mov as any).runningBalance >= 0 ? '(D)' : '(C)'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BALANCE GÉNÉRALE DES COMPTES (6 COLONNES) */}
      {activeTab === 'balance' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                <span>Balance Générale des Comptes (Normes SYSCOHADA)</span>
              </h2>
              <p className="text-xs text-gray-500">
                Synthèse des mouvements Débit / Crédit et calcul des soldes de clôture pour l'ensemble des comptes de la Classe 1 à 7.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={downloadOfficialBalanceHTML}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer / Export A4</span>
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-emerald-950 text-emerald-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-3" rowSpan={2}>N° Compte</th>
                    <th className="p-3" rowSpan={2}>Intitulé du Compte</th>
                    <th className="p-3 text-center border-l border-emerald-800" colSpan={2}>Mouvements de la Période</th>
                    <th className="p-3 text-center border-l border-emerald-800" colSpan={2}>Soldes de Clôture</th>
                  </tr>
                  <tr className="border-t border-emerald-800 text-[9px]">
                    <th className="p-2 text-right border-l border-emerald-800">Débit (FCFA)</th>
                    <th className="p-2 text-right">Crédit (FCFA)</th>
                    <th className="p-2 text-right border-l border-emerald-800">Solde Débiteur</th>
                    <th className="p-2 text-right">Solde Créditeur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accountStatsList
                    .filter((acc: AccountStatItem) => acc.debitTotal > 0 || acc.creditTotal > 0)
                    .sort((a: AccountStatItem, b: AccountStatItem) => a.code.localeCompare(b.code))
                    .map((acc: AccountStatItem) => (
                      <tr key={acc.code} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-bold text-gray-900">{acc.code}</td>
                        <td className="p-3 text-gray-800 font-medium">{acc.label}</td>
                        <td className="p-3 text-right font-mono font-semibold text-gray-700 border-l border-gray-100">
                          {acc.debitTotal > 0 ? acc.debitTotal.toLocaleString() : '-'}
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-gray-700">
                          {acc.creditTotal > 0 ? acc.creditTotal.toLocaleString() : '-'}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700 border-l border-gray-100">
                          {acc.balance > 0 ? acc.balance.toLocaleString() : '-'}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-red-700">
                          {acc.balance < 0 ? Math.abs(acc.balance).toLocaleString() : '-'}
                        </td>
                      </tr>
                    ))}

                  {/* Totals Row */}
                  <tr className="bg-emerald-50 text-emerald-950 font-black text-xs border-t-2 border-emerald-600">
                    <td className="p-3" colSpan={2}>
                      TOTAUX GÉNÉRAUX & VÉRIFICATION D'ÉQUILIBRE :
                    </td>
                    <td className="p-3 text-right font-mono border-l border-emerald-200">
                      {totalDebitsAll.toLocaleString()} FCFA
                    </td>
                    <td className="p-3 text-right font-mono">
                      {totalCreditsAll.toLocaleString()} FCFA
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-800 border-l border-emerald-200">
                      {totalDebitsAll.toLocaleString()} FCFA
                    </td>
                    <td className="p-3 text-right font-mono text-red-800">
                      {totalCreditsAll.toLocaleString()} FCFA
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
            isAccountingBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {isAccountingBalanced ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Conformité Comptable Validée : Total Débit ({totalDebitsAll.toLocaleString()} FCFA) = Total Crédit ({totalCreditsAll.toLocaleString()} FCFA).</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Déséquilibre Détecté : Écart de {Math.abs(totalDebitsAll - totalCreditsAll).toLocaleString()} FCFA.</span>
                </>
              )}
            </div>
            <span className="text-[11px] font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-current">
              SYSCOHADA OK
            </span>
          </div>
        </div>
      )}

      {/* TAB 5: TRÉSORERIE & RAPPROCHEMENT / POINTAGE */}
      {activeTab === 'tresorerie' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-teal-600" />
                <span>Rapprochement de Trésorerie & Pointage des Comptes (Classe 5)</span>
              </h2>
              <p className="text-xs text-gray-500">
                Contrôle quotidien et périodique des liquidités : Caisse centrale, tiroir POS, MTN MoMo, Moov Money et Banque.
              </p>
            </div>

            <button
              onClick={() => setShowReconcileModal(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Pointage / Rapprochement</span>
            </button>
          </div>

          {/* Treasury Accounts Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {treasuryAccounts.map(account => (
              <div key={account.code} className="p-5 rounded-2xl border border-gray-200 bg-slate-50/60 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{account.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{account.name}</div>
                      <div className="text-[11px] font-mono text-gray-500">Compte : {account.code}</div>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-bold uppercase">
                    {account.type}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 space-y-1">
                  <div className="text-[11px] text-gray-500">Solde Comptable Théorique :</div>
                  <div className="text-xl font-black text-teal-900">
                    {account.balance.toLocaleString()} <span className="text-xs font-normal text-gray-500">FCFA</span>
                  </div>
                </div>

                {account.latestReconciliation && (
                  <div className="pt-2 border-t border-gray-200 text-[11px] text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Dernier Pointage :</span>
                      <span className="font-bold">{formatDateToFR(account.latestReconciliation.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Écart Constaté :</span>
                      <span className={`font-bold ${account.latestReconciliation.difference === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {account.latestReconciliation.difference.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Historical Reconciliations List */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Historique des Procès-Verbaux de Rapprochement & Pointage</span>
            </h3>

            {store.reconciliations.length === 0 ? (
              <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs">
                Aucun procès-verbal de rapprochement enregistré pour le moment.
              </div>
            ) : (
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 text-gray-600 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Compte</th>
                      <th className="p-3 text-right">Solde Théorique</th>
                      <th className="p-3 text-right">Solde Réel Compté</th>
                      <th className="p-3 text-right">Écart</th>
                      <th className="p-3">Justification & Notes</th>
                      <th className="p-3">Vérifié Par</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {store.reconciliations.map(rec => (
                      <tr key={rec.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono">{formatDateToFR(rec.date)}</td>
                        <td className="p-3 font-bold text-gray-900">{rec.accountName}</td>
                        <td className="p-3 text-right font-mono">{rec.theoreticalBalance.toLocaleString()} FCFA</td>
                        <td className="p-3 text-right font-mono font-bold text-gray-900">{rec.countedRealBalance.toLocaleString()} FCFA</td>
                        <td className={`p-3 text-right font-mono font-bold ${rec.difference === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {rec.difference > 0 ? `+${rec.difference.toLocaleString()}` : rec.difference.toLocaleString()} FCFA
                        </td>
                        <td className="p-3 text-gray-600">{rec.justification || 'Conforme'}</td>
                        <td className="p-3 text-gray-500 text-[11px]">{rec.verifiedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: BALANCE ÂGÉE & SUIVI DES TIERS (COMPTE 411 CLIENTS / 401 FOURNISSEURS) */}
      {activeTab === 'balance_agee' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Balance Âgée & Suivi des Créances Clients (Compte 411)</span>
              </h2>
              <p className="text-xs text-gray-500">
                Suivi du risque crédit, retards d'échéance et gestion du recouvrement des distributeurs.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-gray-500 block">Total Créances Clients Dues :</span>
              <span className="text-xl font-black text-indigo-900">{totalReceivables.toLocaleString()} FCFA</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Client / Distributeur</th>
                  <th className="p-3 text-right">Facturé Total</th>
                  <th className="p-3 text-right">Règlement Reçu</th>
                  <th className="p-3 text-right">Reste Dû (Créance)</th>
                  <th className="p-3">Dernière Vente</th>
                  <th className="p-3 text-center">Statut Risque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientAccountsData.map((client, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-900">{client.name}</td>
                    <td className="p-3 text-right font-mono">{client.totalBilled.toLocaleString()} FCFA</td>
                    <td className="p-3 text-right font-mono text-emerald-700">{client.totalPaid.toLocaleString()} FCFA</td>
                    <td className={`p-3 text-right font-mono font-bold ${client.dueAmount > 0 ? 'text-amber-700' : 'text-gray-400'}`}>
                      {client.dueAmount > 0 ? client.dueAmount.toLocaleString() + ' FCFA' : 'Soldé (0 F)'}
                    </td>
                    <td className="p-3 font-mono text-gray-600">{formatDateToFR(client.lastDate)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        client.dueAmount === 0 ? 'bg-emerald-100 text-emerald-800' :
                        client.dueAmount < 100000 ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {client.dueAmount === 0 ? 'À jour' : (client.dueAmount < 100000 ? 'Encours Modéré' : 'Créance Élevée')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: DÉPENSES & CHARGES D'EXPLOITATION */}
      {activeTab === 'depenses' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <span>Journal des Dépenses & Charges d'Exploitation (Classe 6)</span>
              </h2>
              <p className="text-xs text-gray-500">
                Enregistrement des achats d'intrants, emballages, fret, maintenance et salaires avec affectation analytique.
              </p>
            </div>

            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Saisir Nouvelle Dépense</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Division / Secteur</th>
                  <th className="p-3">Description de la charge</th>
                  <th className="p-3 text-right">Montant (FCFA)</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {store.expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono">{formatDateToFR(exp.date)}</td>
                    <td className="p-3 font-medium text-gray-900">{exp.category}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[10px] font-bold uppercase">
                        {exp.division}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700">{exp.description}</td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900">{exp.amount.toLocaleString()} FCFA</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm('Voulez-vous supprimer cette dépense ?')) {
                            store.deleteExpense(exp.id);
                            onRefresh();
                          }
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                        title="Supprimer la dépense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: PLAN COMPTABLE SYSCOHADA */}
      {activeTab === 'plan' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                <span>Plan Comptable Général SYSCOHADA / UEMOA</span>
              </h2>
              <p className="text-xs text-gray-500">
                Nomenclature officielle des comptes avec affectation sectorielle pour BambouMiel.
              </p>
            </div>

            <button
              onClick={() => setShowAddAccountModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un Sous-Compte</span>
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par N° de compte ou intitulé..."
                value={searchAccountQuery}
                onChange={e => setSearchAccountQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1">
              {[
                { label: 'Tous', val: 'all' },
                { label: 'Cl. 1 Capitaux', val: 1 },
                { label: 'Cl. 2 Immo', val: 2 },
                { label: 'Cl. 3 Stocks', val: 3 },
                { label: 'Cl. 4 Tiers', val: 4 },
                { label: 'Cl. 5 Trésorerie', val: 5 },
                { label: 'Cl. 6 Charges', val: 6 },
                { label: 'Cl. 7 Produits', val: 7 }
              ].map(cl => (
                <button
                  key={cl.label}
                  onClick={() => setSelectedAccountClass(cl.val as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    selectedAccountClass === cl.val
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-[10px]">
                <tr>
                  <th className="p-3">N° Compte</th>
                  <th className="p-3">Intitulé</th>
                  <th className="p-3">Classe</th>
                  <th className="p-3">Nature</th>
                  <th className="p-3">Secteur</th>
                  <th className="p-3">Description & Rôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {store.syscohadaAccounts
                  .filter(acc => {
                    const matchQ = !searchAccountQuery || 
                      acc.code.includes(searchAccountQuery) || 
                      acc.label.toLowerCase().includes(searchAccountQuery.toLowerCase());
                    const matchCl = selectedAccountClass === 'all' || acc.accountClass === selectedAccountClass;
                    return matchQ && matchCl;
                  })
                  .map(acc => (
                    <tr key={acc.code} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold text-gray-900">{acc.code}</td>
                      <td className="p-3 font-semibold text-gray-800">{acc.label}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold">
                          Classe {acc.accountClass}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          acc.type === 'produit' ? 'bg-emerald-100 text-emerald-800' :
                          acc.type === 'charge' ? 'bg-amber-100 text-amber-800' :
                          acc.type === 'tresorerie' ? 'bg-teal-100 text-teal-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {acc.type}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500 capitalize">{acc.sector || 'général'}</td>
                      <td className="p-3 text-gray-500 text-[11px]">{acc.description || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD MANUAL JOURNAL ENTRY (PARTIE DOUBLE) */}
      {showAddEntryModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Saisie d'Écriture Comptable (Partie Double)</span>
                </h3>
                <p className="text-xs text-slate-400">Équilibre strict Débit = Crédit requis</p>
              </div>
              <button onClick={() => setShowAddEntryModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveJournalEntry} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Date Écriture :</label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Journal Auxiliaire :</label>
                  <select
                    value={entryJournal}
                    onChange={e => setEntryJournal(e.target.value as any)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  >
                    <option value="OD">Opérations Diverses (OD)</option>
                    <option value="Ventes">Journal des Ventes (VT)</option>
                    <option value="Achats">Journal des Achats (AC)</option>
                    <option value="Caisse">Journal de Caisse (CA)</option>
                    <option value="Banque">Journal de Banque (BQ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">N° Pièce / Réf :</label>
                  <input
                    type="text"
                    placeholder="ex: FACT-2026-088"
                    value={entryPieceRef}
                    onChange={e => setEntryPieceRef(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Libellé de l'opération :</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Dotation matériel apicole, Virement interne..."
                  value={entryLabel}
                  onChange={e => setEntryLabel(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Lignes d'imputation comptable :</span>
                  <button
                    type="button"
                    onClick={handleAddEntryLine}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter Ligne</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {entryLines.map((line, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-5">
                        <select
                          value={line.accountCode}
                          onChange={e => handleUpdateEntryLine(idx, 'accountCode', e.target.value)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                        >
                          {store.syscohadaAccounts.map(a => (
                            <option key={a.code} value={a.code}>{a.code} - {a.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="number"
                          placeholder="Débit"
                          value={line.debit || ''}
                          onChange={e => handleUpdateEntryLine(idx, 'debit', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-right"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="number"
                          placeholder="Crédit"
                          value={line.credit || ''}
                          onChange={e => handleUpdateEntryLine(idx, 'credit', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-right"
                        />
                      </div>
                      <div className="sm:col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveEntryLine(idx)}
                          className="text-gray-400 hover:text-red-500 cursor-pointer p-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equilibrium check footer */}
              <div className={`p-3 rounded-2xl border flex justify-between items-center font-bold ${
                isModalBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                <div>
                  <span>Total Débit : {modalTotalDebit.toLocaleString()} FCFA</span>
                  <span className="mx-2">•</span>
                  <span>Total Crédit : {modalTotalCredit.toLocaleString()} FCFA</span>
                </div>
                <div>
                  {isModalBalanced ? '✅ Équilibré' : `⚠️ Écart : ${Math.abs(modalTotalDebit - modalTotalCredit).toLocaleString()} FCFA`}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddEntryModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!isModalBalanced}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    isModalBalanced
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Valider l'Écriture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD SYSCOHADA CUSTOM ACCOUNT */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span>Nouveau Compte SYSCOHADA</span>
              </h3>
              <button onClick={() => setShowAddAccountModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">N° de Compte :</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: 6015, 7063..."
                    value={newAccCode}
                    onChange={e => setNewAccCode(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Classe :</label>
                  <select
                    value={newAccClass}
                    onChange={e => setNewAccClass(parseInt(e.target.value, 10) as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  >
                    <option value={1}>Classe 1 - Capitaux</option>
                    <option value={2}>Classe 2 - Immobilisations</option>
                    <option value={3}>Classe 3 - Stocks</option>
                    <option value={4}>Classe 4 - Tiers</option>
                    <option value={5}>Classe 5 - Trésorerie</option>
                    <option value={6}>Classe 6 - Charges</option>
                    <option value={7}>Classe 7 - Produits</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Intitulé Officiel :</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Achats de semences et plants bio"
                  value={newAccLabel}
                  onChange={e => setNewAccLabel(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Nature :</label>
                  <select
                    value={newAccType}
                    onChange={e => setNewAccType(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="charge">Charge (Classe 6)</option>
                    <option value="produit">Produit (Classe 7)</option>
                    <option value="actif">Actif (Classe 2,3,4,5)</option>
                    <option value="passif">Passif (Classe 1,4)</option>
                    <option value="tresorerie">Trésorerie (Classe 5)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Secteur Associé :</label>
                  <select
                    value={newAccSector}
                    onChange={e => setNewAccSector(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="general">Général / Siège</option>
                    <option value="miel">🍯 Miellerie</option>
                    <option value="jus">🍹 Jus</option>
                    <option value="the">🌿 Thé</option>
                    <option value="hotel">🏨 Éco-Lodge</option>
                    <option value="conference">🏛️ Conférence</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Description / Notes :</label>
                <textarea
                  rows={2}
                  placeholder="Préciser l'usage de ce compte..."
                  value={newAccDesc}
                  onChange={e => setNewAccDesc(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Créer le Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CASH RECONCILIATION MODAL */}
      {showReconcileModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Landmark className="w-4 h-4 text-teal-400" />
                <span>Procès-Verbal de Pointage Trésorerie</span>
              </h3>
              <button onClick={() => setShowReconcileModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveReconciliation} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Compte de Trésorerie à pointer :</label>
                <select
                  value={reconcileAccCode}
                  onChange={e => setReconcileAccCode(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                >
                  <option value="5711">5711 - Caisse Principale (Espèces Siège)</option>
                  <option value="5712">5712 - Caisse POS Comptoir (Boutique)</option>
                  <option value="5713">5713 - MTN Mobile Money</option>
                  <option value="5714">5714 - Moov Money</option>
                  <option value="5211">5211 - Banque (Compte courant BOA / Ecobank)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Solde Réel Constaté / Compté (FCFA) :</label>
                <input
                  type="number"
                  required
                  placeholder="Montant physique ou relevé"
                  value={reconcileCountedBalance}
                  onChange={e => setReconcileCountedBalance(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-base text-teal-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Justification ou Observations :</label>
                <textarea
                  rows={2}
                  placeholder="ex: Contrôle physique du tiroir-caisse, relevé bancaire arrêté au jour..."
                  value={reconcileJustification}
                  onChange={e => setReconcileJustification(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowReconcileModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Enregistrer le Pointage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>Enregistrer une Dépense d'Exploitation</span>
              </h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Date :</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={e => setExpDate(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Montant (FCFA) :</label>
                  <input
                    type="number"
                    required
                    placeholder="ex: 25000"
                    value={expAmount}
                    onChange={e => setExpAmount(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Description de la dépense :</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Achat 50 pots verre 500g, Entretien sono..."
                  value={expDesc}
                  onChange={e => setExpDesc(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Catégorie :</label>
                  <select
                    value={expCategory}
                    onChange={e => setExpCategory(e.target.value as any)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  >
                    <option value="Bambou & Matériel">Bambou & Matériel</option>
                    <option value="Transport & Ruches">Transport & Ruches</option>
                    <option value="Apiculture & Suivi">Apiculture & Suivi</option>
                    <option value="Extraction & Miellerie">Extraction & Miellerie</option>
                    <option value="Pots & Étiquettes">Pots & Étiquettes</option>
                    <option value="Fruits & Ingrédients Jus">Fruits & Ingrédients Jus</option>
                    <option value="Feuilles & Arômes Thé">Feuilles & Arômes Thé</option>
                    <option value="Maintenance Hôtel">Maintenance Hôtel</option>
                    <option value="Équipements & Conférence">Équipements & Conférence</option>
                    <option value="Salaires">Salaires</option>
                    <option value="Divers">Divers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Division / Secteur :</label>
                  <select
                    value={expDivision}
                    onChange={e => setExpDivision(e.target.value as any)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  >
                    <option value="miel">🍯 Miellerie</option>
                    <option value="jus">🍹 Jus</option>
                    <option value="the">🌿 Thé</option>
                    <option value="hotel">🏨 Éco-Lodge</option>
                    <option value="conference">🏛️ Conférence</option>
                    <option value="general">🏢 Général / Siège</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Mode de Paiement (Décaissement) :</label>
                <select
                  value={expPaymentMethod}
                  onChange={e => setExpPaymentMethod(e.target.value as any)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                >
                  <option value="especes">Espèces (Caisse Siège 5711)</option>
                  <option value="momo">Mobile Money (MTN MoMo 5713)</option>
                  <option value="banque">Virement Bancaire (Banque 5211)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Enregistrer & Imputer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
