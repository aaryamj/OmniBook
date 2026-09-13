import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ProviderTopNavigation from './components/ProviderTopNavigation';
import ProviderSidebar from './components/ProviderSidebar';
import { useOrganizationTerms } from '../../utils/organizationTerms';
import { applyTheme } from '../../utils/themeUtils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar 
} from 'recharts';

interface TrendDataPoint {
  name: string;
  mrr: number;
  appointments: number;
}

interface ServiceVolumeDTO {
  name: string;
  volume: number;
  revenue: number;
}

interface AnalyticsTransactionDTO {
  id: string;
  patient: string;
  service: string;
  amount: number;
  amountFormatted: string;
  status: string; // "Confirmed", "Pending", "Cancelled"
  paymentMethod?: string;
  appointmentStatus?: string;
  date: string;
  rawDate?: string;
}

interface ProviderAnalyticsData {
  totalRevenue: number;
  formattedRevenue: string;
  revenueChangePct: number;
  totalAppointments: number;
  appointmentsChangePct: number;
  noShowRate: number;
  noShowRateChangePct: number;
  trends: TrendDataPoint[];
  topServices: ServiceVolumeDTO[];
  transactions: AnalyticsTransactionDTO[];
}

const RevenueAnalyticsPage: React.FC = () => {
  const terms = useOrganizationTerms();
  const navigate = useNavigate();

  const [dateFilter, setDateFilter] = useState('Last 30 Days');
  const [searchQuery, setSearchQuery] = useState('');
  const [analyticsData, setAnalyticsData] = useState<ProviderAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [showTrendMenu, setShowTrendMenu] = useState(false);
  const [trendChartType, setTrendChartType] = useState<'area' | 'bar'>('area');

  const [showServiceMenu, setShowServiceMenu] = useState(false);
  const [serviceSortOrder, setServiceSortOrder] = useState<'desc' | 'asc'>('desc');

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const dateMenuRef = useRef<HTMLDivElement>(null);
  const trendMenuRef = useRef<HTMLDivElement>(null);
  const serviceMenuRef = useRef<HTMLDivElement>(null);

  const orgName = localStorage.getItem('organizationName') || terms.facilityLabel || 'OmniBook Portal';
  const tenantRoleName = localStorage.getItem('tenantRoleName');
  const permissionsJson = localStorage.getItem('permissionsJson');

  const hasAnalyticsRead = React.useMemo(() => {
    if (!permissionsJson) return true;
    try {
      const p = JSON.parse(permissionsJson);
      if (p.analytics && p.analytics.read === false) return false;
    } catch (e) {}
    return true;
  }, [permissionsJson]);

  // Theme & branding sync
  useEffect(() => {
    const cachedColor = localStorage.getItem('primaryAccentColor');
    if (cachedColor) {
      applyTheme(cachedColor);
    }
  }, []);

  // Authentication & Permission check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = (localStorage.getItem('role') || '').toLowerCase();
    const isProvider = role === 'service_provider' || role === 'provider' || role === 'role_provider';
    
    if (!token || !isProvider) {
      navigate('/login');
      return;
    }

    if (!hasAnalyticsRead) {
      navigate('/provider-dashboard');
    }
  }, [navigate, hasAnalyticsRead]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateMenuRef.current && !dateMenuRef.current.contains(event.target as Node)) {
        setShowDateMenu(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (trendMenuRef.current && !trendMenuRef.current.contains(event.target as Node)) {
        setShowTrendMenu(false);
      }
      if (serviceMenuRef.current && !serviceMenuRef.current.contains(event.target as Node)) {
        setShowServiceMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch real analytics data
  const fetchAnalytics = async (range: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/v1/provider/analytics?range=${encodeURIComponent(range)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      } else {
        console.error('Failed to load analytics data, status:', res.status);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(dateFilter);
  }, [dateFilter]);

  // Sorted Top Services
  const sortedServices = React.useMemo(() => {
    if (!analyticsData?.topServices) return [];
    return [...analyticsData.topServices].sort((a, b) => 
      serviceSortOrder === 'desc' ? b.volume - a.volume : a.volume - b.volume
    );
  }, [analyticsData?.topServices, serviceSortOrder]);

  // Filtered Transactions for table
  const allTransactions = analyticsData?.transactions || [];
  const filteredTransactions = allTransactions.filter(txn => {
    const q = searchQuery.toLowerCase();
    return (
      txn.patient.toLowerCase().includes(q) ||
      txn.id.toLowerCase().includes(q) ||
      txn.service.toLowerCase().includes(q) ||
      txn.status.toLowerCase().includes(q) ||
      (txn.amountFormatted && txn.amountFormatted.includes(q))
    );
  });

  const displayedTransactions = showAllHistory ? filteredTransactions : filteredTransactions.slice(0, 8);

  // Dynamic PDF Export
  const handleExportPDF = () => {
    setShowExportMenu(false);
    if (!analyticsData) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Brand Top Bar
      doc.setFillColor(26, 86, 219); // Primary Accent
      doc.rect(0, 0, pageWidth, 8, 'F');

      // Title & Header Info
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(21, 28, 39);
      doc.text(orgName, 14, 22);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 86, 219);
      doc.text('FINANCIAL & ANALYTICS STATEMENT', 14, 29);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(115, 118, 134);
      doc.text(`Report Period: ${dateFilter} | Generated on: ${new Date().toLocaleString()}`, 14, 35);
      doc.text(`Organization Model: ${terms.facilityLabel || 'Multi-Service Provider'}`, 14, 40);

      doc.setDrawColor(226, 232, 248);
      doc.line(14, 44, pageWidth - 14, 44);

      // Section 1: Executive KPI Summary
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(21, 28, 39);
      doc.text('1. Executive Performance Summary', 14, 52);

      const kpiBody = [
        [
          'Total Revenue',
          analyticsData.formattedRevenue || 'रू 0',
          `${analyticsData.revenueChangePct >= 0 ? '+' : ''}${analyticsData.revenueChangePct}% vs previous period`
        ],
        [
          `Total ${terms.appointmentPlural || 'Appointments'}`,
          analyticsData.totalAppointments.toLocaleString(),
          `${analyticsData.appointmentsChangePct >= 0 ? '+' : ''}${analyticsData.appointmentsChangePct}% vs previous period`
        ],
        [
          'No-Show / Cancellation Rate',
          `${analyticsData.noShowRate.toFixed(1)}%`,
          `${analyticsData.noShowRateChangePct <= 0 ? `${analyticsData.noShowRateChangePct}% Improved` : `+${analyticsData.noShowRateChangePct}% Increased`}`
        ]
      ];

      autoTable(doc, {
        startY: 56,
        theme: 'striped',
        head: [['Metric', 'Current Period Total', 'Performance / Benchmark']],
        body: kpiBody,
        headStyles: { fillColor: [26, 86, 219], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 65 },
          1: { fontStyle: 'bold', textColor: [0, 84, 56], cellWidth: 50 },
          2: { textColor: [83, 96, 108] }
        }
      });

      // Section 2: Top Services Breakdown
      let nextY = (doc as any).lastAutoTable.finalY + 12;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(21, 28, 39);
      doc.text(`2. Top ${terms.serviceSingular}s by Volume`, 14, nextY);

      const serviceTableBody = (analyticsData.topServices || []).slice(0, 6).map((s, idx) => [
        `#${idx + 1}`,
        s.name,
        s.volume.toString(),
        `रू ${(Math.round(s.revenue) || 0).toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: nextY + 4,
        theme: 'grid',
        head: [['Rank', `${terms.serviceSingular} Name`, `${terms.appointmentPlural} Volume`, 'Revenue Contribution']],
        body: serviceTableBody.length > 0 ? serviceTableBody : [['-', 'No service data for period', '0', 'रू 0']],
        headStyles: { fillColor: [240, 243, 255], textColor: [0, 63, 177], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3.5 },
        columnStyles: {
          0: { cellWidth: 18, fontStyle: 'bold' },
          1: { fontStyle: 'bold' },
          2: { cellWidth: 40 },
          3: { cellWidth: 45, textColor: [0, 84, 56], fontStyle: 'bold' }
        }
      });

      // Section 3: Recent Transaction Log
      nextY = (doc as any).lastAutoTable.finalY + 12;
      
      // If table would start too close to page bottom, add a new page
      if (nextY > 230) {
        doc.addPage();
        nextY = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(21, 28, 39);
      doc.text('3. Transaction & Settlement Audit Log', 14, nextY);

      const transactionRows = (analyticsData.transactions || []).map(t => [
        t.id,
        t.patient,
        t.service,
        `रू ${t.amountFormatted}`,
        t.status,
        t.date
      ]);

      autoTable(doc, {
        startY: nextY + 4,
        theme: 'striped',
        head: [['Txn ID', terms.customerSingular, terms.serviceSingular, 'Amount (NPR)', 'Status', 'Date']],
        body: transactionRows.length > 0 ? transactionRows : [['-', 'No transactions recorded', '-', 'रू 0', '-', '-']],
        headStyles: { fillColor: [26, 86, 219], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8.5, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 32 },
          1: { fontStyle: 'bold' },
          3: { fontStyle: 'bold', textColor: [0, 84, 56], cellWidth: 30 },
          4: { cellWidth: 26 },
          5: { cellWidth: 30 }
        }
      });

      // Footer
      const totalPages = (doc.internal as any).getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(140, 140, 140);
        doc.text(
          `Page ${i} of ${totalPages} • Generated by OmniBook Platform • Confidential`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        );
      }

      const fileName = `Financial_Statement_${orgName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateFilter.replace(/ /g, '_')}.pdf`;
      doc.save(fileName);

      setNotification({ message: 'Financial PDF statement exported successfully!', type: 'success' });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error('Error generating PDF report:', err);
      setNotification({ message: 'Failed to generate PDF report. Please try again.', type: 'error' });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Dynamic CSV Export
  const handleExportCSV = () => {
    setShowExportMenu(false);
    if (!analyticsData) return;

    try {
      const headers = ['Transaction ID', terms.customerSingular, terms.serviceSingular, 'Amount (NPR)', 'Payment Status', 'Booking Status', 'Date'];
      const rows = (analyticsData.transactions || []).map(t => [
        t.id,
        `"${t.patient.replace(/"/g, '""')}"`,
        `"${t.service.replace(/"/g, '""')}"`,
        `"${t.amountFormatted}"`,
        t.status,
        `"${t.appointmentStatus || ''}"`,
        `"${t.date}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `Revenue_Report_${orgName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateFilter.replace(/ /g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotification({ message: 'CSV Report exported successfully!', type: 'success' });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error('Error generating CSV report:', err);
      setNotification({ message: 'Failed to generate CSV report.', type: 'error' });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="tenant-theme bg-[#F3F4F6] text-[#151c27] font-sans min-h-screen flex overflow-x-hidden">
      <ProviderTopNavigation />

      {/* SideNavBar */}
      <ProviderSidebar />

      {/* Main Content Area */}
      <main className="pt-24 pb-8 md:ml-64 px-4 md:px-10 flex-1 md:w-[calc(100%-256px)] overflow-y-auto">
        
        {!hasAnalyticsRead ? (
          <div className="py-20 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 shadow-sm border border-amber-500/20">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <h2 className="text-2xl font-bold text-[#151c27] mb-2">Access Restricted</h2>
            <p className="text-sm text-[#53606c] mb-6 leading-relaxed">
              Your assigned role <span className="font-bold text-primary">"{tenantRoleName || 'Staff'}"</span> does not have read permissions for financial revenue and analytics. Please contact your organization administrator if you require access.
            </p>
            <button 
              onClick={() => navigate('/provider-dashboard')}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-all shadow-sm cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Notification Toast */}
            {notification && (
              <div className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all transform animate-bounce ${
                notification.type === 'success' 
                  ? 'bg-[#e8fbf3] text-[#005438] border-[#6ffbbe]' 
                  : notification.type === 'error'
                  ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffb4ab]'
                  : 'bg-[#eef2ff] text-primary border-primary/30'
              }`}>
                <span className="material-symbols-outlined text-[20px]">
                  {notification.type === 'success' ? 'check_circle' : notification.type === 'error' ? 'error' : 'info'}
                </span>
                <span>{notification.message}</span>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-[32px] font-bold text-primary tracking-tight">Analytics Overview</h1>
              {loading && (
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              )}
            </div>
            <p className="text-sm font-medium text-[#53606c] mt-1">
              Real-time revenue performance, {terms.appointmentSingular.toLowerCase()} volume, and settlement trends for <span className="font-semibold text-primary">{orgName}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            {/* Date Range Dropdown */}
            <div className="relative flex-1 sm:flex-initial" ref={dateMenuRef}>
              <button
                type="button"
                onClick={() => setShowDateMenu(!showDateMenu)}
                className="w-full sm:w-auto h-10 px-3.5 bg-white text-primary border border-[#c3c5d7] rounded-xl flex items-center justify-between sm:justify-start gap-2 hover:bg-[#f9f9ff] transition-all shadow-sm font-semibold text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer whitespace-nowrap active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px] text-primary shrink-0 leading-none">calendar_today</span>
                <span className="text-[#151c27]">{dateFilter}</span>
                <span className={`material-symbols-outlined text-[18px] text-primary shrink-0 leading-none transition-transform duration-200 ${showDateMenu ? 'rotate-180' : ''}`}>arrow_drop_down</span>
              </button>

              {showDateMenu && (
                <div className="absolute left-0 sm:right-0 sm:left-auto top-12 w-48 bg-white border border-[#c3c5d7] shadow-xl rounded-xl z-30 py-1.5 animate-fadeIn">
                  <div className="px-3.5 py-1.5 border-b border-[#e2e8f8] mb-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#53606c]">Select Timeframe</p>
                  </div>
                  {['Today', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year', 'All Time'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setDateFilter(opt);
                        setShowDateMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                        dateFilter === opt 
                          ? 'bg-primary/10 text-primary font-bold' 
                          : 'text-[#151c27] hover:bg-[#f0f3ff] font-medium'
                      }`}
                    >
                      <span>{opt}</span>
                      {dateFilter === opt && (
                        <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export Report with Dropdown Menu */}
            <div className="relative flex-1 sm:flex-initial" ref={exportMenuRef}>
              <button 
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)} 
                className="w-full sm:w-auto h-10 bg-primary text-on-primary px-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-sm font-semibold text-sm whitespace-nowrap cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] shrink-0 leading-none">download</span>
                <span className="whitespace-nowrap">Export Report</span>
                <span className={`material-symbols-outlined text-[16px] shrink-0 leading-none transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`}>arrow_drop_down</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-11 w-56 bg-white border border-[#c3c5d7] shadow-xl rounded-xl z-20 py-2 animate-fadeIn">
                  <div className="px-3.5 py-1.5 border-b border-[#e2e8f8] mb-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#53606c]">Choose Format</p>
                  </div>
                  <button 
                    onClick={handleExportPDF}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#f0f3ff] text-sm font-semibold text-[#151c27] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">picture_as_pdf</span>
                    <div>
                      <p className="leading-none">PDF Statement</p>
                      <p className="text-[11px] font-normal text-[#53606c] mt-0.5">Executive branded statement</p>
                    </div>
                  </button>
                  <button 
                    onClick={handleExportCSV}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#f0f3ff] text-sm font-semibold text-[#151c27] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[#005438] text-[20px]">table_view</span>
                    <div>
                      <p className="leading-none">CSV Spreadsheet</p>
                      <p className="text-[11px] font-normal text-[#53606c] mt-0.5">Raw transaction data</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Total Revenue */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                (analyticsData?.revenueChangePct ?? 0) >= 0 
                  ? 'text-[#005438] bg-[#6ffbbe]/30' 
                  : 'text-[#ba1a1a] bg-[#ffdad6]/50'
              }`}>
                {(analyticsData?.revenueChangePct ?? 0) >= 0 ? '+' : ''}
                {analyticsData ? analyticsData.revenueChangePct : 0}%
              </span>
            </div>
            <p className="text-[#53606c] font-medium text-sm">Total Revenue</p>
            <h3 className="text-2xl font-bold text-[#151c27] mt-1">
              {analyticsData ? analyticsData.formattedRevenue : 'रू 0'}
            </h3>
            <p className="text-xs text-[#737686] mt-2 italic">in {dateFilter}</p>
          </div>

          {/* Appointments */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                (analyticsData?.appointmentsChangePct ?? 0) >= 0 
                  ? 'text-[#005438] bg-[#6ffbbe]/30' 
                  : 'text-[#ba1a1a] bg-[#ffdad6]/50'
              }`}>
                {(analyticsData?.appointmentsChangePct ?? 0) >= 0 ? '+' : ''}
                {analyticsData ? analyticsData.appointmentsChangePct : 0}%
              </span>
            </div>
            <p className="text-[#53606c] font-medium text-sm">{terms.appointmentPlural || 'Appointments'}</p>
            <h3 className="text-2xl font-bold text-[#151c27] mt-1">
              {analyticsData ? analyticsData.totalAppointments.toLocaleString() : '0'}
            </h3>
            <p className="text-xs text-[#737686] mt-2 italic">in {dateFilter}</p>
          </div>

          {/* No-Show Rate */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-[#ffdad6]/50 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ba1a1a]" style={{ fontVariationSettings: "'FILL' 1" }}>event_busy</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                (analyticsData?.noShowRateChangePct ?? 0) <= 0 
                  ? 'text-[#005438] bg-[#6ffbbe]/30' 
                  : 'text-[#ba1a1a] bg-[#ffdad6]/50'
              }`}>
                {(analyticsData?.noShowRateChangePct ?? 0) <= 0 
                  ? `${analyticsData ? analyticsData.noShowRateChangePct : 0}% Improved` 
                  : `+${analyticsData ? analyticsData.noShowRateChangePct : 0}% Increased`}
              </span>
            </div>
            <p className="text-[#53606c] font-medium text-sm">No-Show / Cancel Rate</p>
            <h3 className="text-2xl font-bold text-[#151c27] mt-1">
              {analyticsData ? `${analyticsData.noShowRate.toFixed(1)}%` : '0.0%'}
            </h3>
            <p className="text-xs text-[#737686] mt-2 italic">in {dateFilter}</p>
          </div>
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Appointment Trends Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-bold text-lg text-[#151c27]">{terms.appointmentSingular} Trends</h4>
                <p className="text-xs text-[#53606c] mt-0.5">Revenue & booking volume distribution</p>
              </div>
              <div className="relative" ref={trendMenuRef}>
                <button 
                  onClick={() => setShowTrendMenu(!showTrendMenu)}
                  className="w-8 h-8 rounded-lg hover:bg-[#f0f3ff] flex items-center justify-center transition-colors cursor-pointer"
                  title="Chart Display Settings"
                >
                  <span className="material-symbols-outlined text-[#53606c]">more_vert</span>
                </button>
                {showTrendMenu && (
                  <div className="absolute right-0 top-10 w-44 bg-white border border-[#c3c5d7] shadow-lg rounded-xl z-10 py-2">
                    <button 
                      onClick={() => { setTrendChartType('area'); setShowTrendMenu(false); }} 
                      className={`w-full text-left px-4 py-2 hover:bg-[#f0f3ff] text-sm font-medium flex items-center gap-2 cursor-pointer ${
                        trendChartType === 'area' ? 'text-primary font-bold' : 'text-[#3b4854]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">show_chart</span>
                      Area Chart
                    </button>
                    <button 
                      onClick={() => { setTrendChartType('bar'); setShowTrendMenu(false); }} 
                      className={`w-full text-left px-4 py-2 hover:bg-[#f0f3ff] text-sm font-medium flex items-center gap-2 cursor-pointer ${
                        trendChartType === 'bar' ? 'text-primary font-bold' : 'text-[#3b4854]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                      Bar Chart
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-h-[300px] w-full">
              {analyticsData?.trends && analyticsData.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {trendChartType === 'area' ? (
                    <AreaChart data={analyticsData.trends} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary, #1a56db)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--color-primary, #1a56db)" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f8" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#53606c', fontSize: 12}} dy={10} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#53606c', fontSize: 12}} 
                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`} 
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px -4px rgb(0 0 0 / 0.15)' }}
                        formatter={(value: any, name: any) => [
                          name === 'appointments' ? `${value} ${terms.appointmentPlural.toLowerCase()}` : `रू ${(Number(value) || 0).toLocaleString()}`,
                          name === 'appointments' ? terms.appointmentPlural : 'Revenue'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="mrr" 
                        name="Revenue"
                        stroke="var(--color-primary, #1a56db)" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={analyticsData.trends} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f8" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#53606c', fontSize: 12}} dy={10} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#53606c', fontSize: 12}} 
                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`} 
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px -4px rgb(0 0 0 / 0.15)' }}
                        cursor={{fill: '#f0f3ff'}}
                        formatter={(value: any) => [`रू ${(Number(value) || 0).toLocaleString()}`, 'Revenue']}
                      />
                      <Bar dataKey="mrr" fill="var(--color-primary, #1a56db)" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#737686] py-12">
                  <span className="material-symbols-outlined text-4xl mb-2 text-primary/40">query_stats</span>
                  <p className="text-sm font-medium">No booking trends recorded for {dateFilter}</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Services Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-bold text-lg text-[#151c27]">Top {terms.serviceSingular}s by Volume</h4>
                <p className="text-xs text-[#53606c] mt-0.5">Most requested offerings by customer count</p>
              </div>
              <div className="relative" ref={serviceMenuRef}>
                <button 
                  onClick={() => setShowServiceMenu(!showServiceMenu)}
                  className="w-8 h-8 rounded-lg hover:bg-[#f0f3ff] flex items-center justify-center transition-colors cursor-pointer"
                  title="Sort Services"
                >
                  <span className="material-symbols-outlined text-[#53606c]">filter_list</span>
                </button>
                {showServiceMenu && (
                  <div className="absolute right-0 top-10 w-48 bg-white border border-[#c3c5d7] shadow-lg rounded-xl z-10 py-2">
                    <button 
                      onClick={() => { setServiceSortOrder('desc'); setShowServiceMenu(false); }} 
                      className={`w-full text-left px-4 py-2 hover:bg-[#f0f3ff] text-sm font-medium flex items-center justify-between cursor-pointer ${
                        serviceSortOrder === 'desc' ? 'text-primary font-bold' : 'text-[#3b4854]'
                      }`}
                    >
                      <span>Sort Highest Volume</span>
                      {serviceSortOrder === 'desc' && <span className="material-symbols-outlined text-[16px]">check</span>}
                    </button>
                    <button 
                      onClick={() => { setServiceSortOrder('asc'); setShowServiceMenu(false); }} 
                      className={`w-full text-left px-4 py-2 hover:bg-[#f0f3ff] text-sm font-medium flex items-center justify-between cursor-pointer ${
                        serviceSortOrder === 'asc' ? 'text-primary font-bold' : 'text-[#3b4854]'
                      }`}
                    >
                      <span>Sort Lowest Volume</span>
                      {serviceSortOrder === 'asc' && <span className="material-symbols-outlined text-[16px]">check</span>}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-[300px] w-full">
              {sortedServices.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedServices} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f8" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#53606c', fontSize: 12}} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#151c27', fontSize: 12, fontWeight: 500}} 
                      width={120} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px -4px rgb(0 0 0 / 0.15)' }}
                      cursor={{fill: '#f0f3ff'}}
                      formatter={(value: any) => [`${value} bookings`, 'Volume']}
                    />
                    <Bar dataKey="volume" fill="var(--color-primary, #003fb1)" radius={[0, 6, 6, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#737686] py-12">
                  <span className="material-symbols-outlined text-4xl mb-2 text-primary/40">category</span>
                  <p className="text-sm font-medium">No service records for {dateFilter}</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Detailed Table Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <div>
              <h4 className="font-bold text-lg text-[#151c27]">Recent Transaction Log</h4>
              <p className="text-xs text-[#53606c] mt-0.5">Real-time payment settlements and appointment logs</p>
            </div>
            
            {/* Dynamic Search Filter */}
            <div className="relative max-w-xs w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#53606c] text-[20px]">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 border border-[#c3c5d7] rounded-full text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white" 
                placeholder={`Search ${terms.customerSingular.toLowerCase()}, ${terms.serviceSingular.toLowerCase()}, txn...`} 
                type="text"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#151c27] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[650px] text-left border-collapse">
              <thead>
                <tr className="border-b border-[#c3c5d7]/50">
                  <th className="pb-3 px-4 text-xs font-bold text-[#53606c] uppercase tracking-wider">Transaction ID</th>
                  <th className="pb-3 px-4 text-xs font-bold text-[#53606c] uppercase tracking-wider">{terms.customerSingular}</th>
                  <th className="pb-3 px-4 text-xs font-bold text-[#53606c] uppercase tracking-wider">{terms.serviceSingular}</th>
                  <th className="pb-3 px-4 text-xs font-bold text-[#53606c] uppercase tracking-wider">Amount</th>
                  <th className="pb-3 px-4 text-xs font-bold text-[#53606c] uppercase tracking-wider">Status</th>
                  <th className="pb-3 px-4 text-xs font-bold text-[#53606c] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c5d7]/20">
                {displayedTransactions.length > 0 ? (
                  displayedTransactions.map((txn, index) => (
                    <tr key={txn.id + index} className={index % 2 === 0 ? 'bg-[#f0f3ff]/30 hover:bg-[#f0f3ff]/60 transition-colors' : 'hover:bg-[#f0f3ff]/40 transition-colors'}>
                      <td className="py-4 px-4 font-mono text-xs font-semibold text-[#3b4854]">{txn.id}</td>
                      <td className="py-4 px-4 font-bold text-[#151c27]">{txn.patient}</td>
                      <td className="py-4 px-4 text-sm text-[#53606c]">{txn.service}</td>
                      <td className="py-4 px-4 font-bold text-primary">रू {txn.amountFormatted}</td>
                      <td className="py-4 px-4">
                        {txn.status === 'Confirmed' ? (
                          <span className="bg-[#6ffbbe]/30 text-[#005438] px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#005438]"></span>
                            Confirmed
                          </span>
                        ) : txn.status === 'Cancelled' ? (
                          <span className="bg-[#ffdad6]/50 text-[#ba1a1a] px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                            Cancelled
                          </span>
                        ) : (
                          <span className="bg-[#dce2f3] text-[#3b4854] px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3b4854]"></span>
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-[#737686]">{txn.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-[#53606c]">
                      <span className="material-symbols-outlined text-3xl mb-1 text-primary/30">search_off</span>
                      <p className="font-medium mt-1">
                        {searchQuery ? `No transactions found matching "${searchQuery}"` : `No transactions found for ${dateFilter}`}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length > 8 && (
            <div className="mt-6 flex justify-center">
              <button 
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="text-primary font-bold text-sm hover:underline flex items-center gap-2 cursor-pointer"
              >
                <span>{showAllHistory ? 'Show Less' : `View Full History (${filteredTransactions.length} records)`}</span>
                <span className="material-symbols-outlined text-[18px]">
                  {showAllHistory ? 'expand_less' : 'arrow_forward'}
                </span>
              </button>
            </div>
          )}
        </div>
        </>
        )}

      </main>
    </div>
  );
};

export default RevenueAnalyticsPage;
