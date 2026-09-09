import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDepartmentTerms, useOrganizationTerms } from '../../../utils/organizationTerms';

interface Department {
    id: number;
    name: string;
    code?: string;
    headName?: string;
    description: string;
    active: boolean;
    isActive?: boolean;
    approvedProviders?: string[];
}

interface Provider {
    id: string;
    name: string;
    email: string;
    primarySpecialty: string;
    status: string;
}

export default function DepartmentsConfig() {
    const navigate = useNavigate();
    const orgTerms = useOrganizationTerms();
    const deptTerms = useDepartmentTerms();

    const [departments, setDepartments] = useState<Department[]>([]);
    const [allProviders, setAllProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [deleteModalId, setDeleteModalId] = useState<number | null>(null);

    const formRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        isActive: true
    });

    useEffect(() => {
        fetchDepartments();
        fetchProviders();
    }, []);

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/v1/admin/departments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch departments", error);
            setLoading(false);
        }
    };

    const fetchProviders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await axios.get('http://localhost:8080/api/v1/admin/providers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (Array.isArray(response.data)) {
                setAllProviders(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch providers", error);
        }
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({
            name: '',
            code: '',
            description: '',
            isActive: true
        });
        setShowForm(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    };

    const handleOpenEdit = (dept: Department) => {
        setEditingId(dept.id);
        setFormData({
            name: dept.name,
            code: dept.code || '',
            description: dept.description || '',
            isActive: dept.active !== false && dept.isActive !== false
        });
        setShowForm(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    };

    const handleApplyPreset = (preset: { name: string; code: string; description: string }) => {
        setFormData({
            name: preset.name,
            code: preset.code,
            description: preset.description,
            isActive: true
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');
        setStatusMessage('');

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const payload = {
                name: formData.name,
                code: formData.code,
                headName: '', // Left empty initially as instructors will be invited and approved dynamically
                description: formData.description,
                isActive: formData.isActive !== false,
                active: formData.isActive !== false
            };

            if (editingId) {
                await axios.put(`http://localhost:8080/api/v1/admin/departments/${editingId}`, payload, { headers });
                setStatusMessage(`${formData.name} updated successfully!`);
            } else {
                await axios.post('http://localhost:8080/api/v1/admin/departments', payload, { headers });
                setStatusMessage(`${formData.name} created successfully!`);
            }

            setSaveStatus('success');
            setTimeout(() => {
                setShowForm(false);
                setEditingId(null);
                setSaveStatus('idle');
                setStatusMessage('');
            }, 1200);

            fetchDepartments();
            fetchProviders();
        } catch (error: any) {
            console.error("Failed to save department", error);
            setSaveStatus('error');
            setStatusMessage(error.response?.data?.message || 'Failed to save department. Please try again.');
        }
    };

    const confirmDelete = async () => {
        if (!deleteModalId) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/v1/admin/departments/${deleteModalId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeleteModalId(null);
            fetchDepartments();
        } catch (error) {
            console.error("Failed to delete department", error);
        }
    };

    // Helper to get approved instructors for a given department name / code
    const getApprovedInstructorsFor = (deptName: string, deptCode?: string) => {
        if (!deptName) return [];
        const cleanName = deptName.trim().toLowerCase();
        const cleanCode = deptCode ? deptCode.trim().toLowerCase() : '';

        return allProviders.filter(p => {
            if (p.status !== 'ACTIVE') return false;
            if (!p.primarySpecialty) return false;
            const cleanSpec = p.primarySpecialty.trim().toLowerCase();
            return cleanSpec === cleanName || (cleanCode && cleanSpec === cleanCode);
        });
    };

    // Current form's instructors
    const formApprovedInstructors = getApprovedInstructorsFor(formData.name, formData.code);

    const activeCount = departments.filter(d => d.active).length;

    return (
        <div className="flex flex-col">
            {/* Top Bar / Counter */}
            <div className="p-6 bg-surface-container-low border-b border-outline-variant flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <span className="font-label-md text-[10px] uppercase text-outline tracking-wider font-semibold">
                            {deptTerms.totalCountLabel}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono-data text-xl font-bold text-primary">
                                {departments.length}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-700 font-bold rounded-full border border-green-500/20">
                                {activeCount} Active
                            </span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-outline-variant hidden sm:block"></div>
                    <div className="hidden sm:flex flex-col">
                        <span className="font-label-md text-[10px] uppercase text-outline tracking-wider font-semibold">Organization Type</span>
                        <span className="text-xs font-bold text-secondary uppercase tracking-tight mt-0.5">
                            {orgTerms.facilityLabel} Environment
                        </span>
                    </div>
                </div>

                {!showForm && (
                    <button 
                        onClick={handleOpenCreate} 
                        className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-label-md font-bold text-sm shadow-md flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        {deptTerms.createButtonLabel}
                    </button>
                )}
            </div>

            <div className="p-6 sm:p-8">
                {/* Dynamic Department Creation / Edit Form */}
                {showForm && (
                    <div ref={formRef} className="mb-10 p-6 sm:p-8 border-2 border-primary/20 rounded-2xl bg-surface-bright shadow-lg relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Close button */}
                        <div className="absolute top-5 right-5">
                            <button 
                                type="button" 
                                onClick={() => { setShowForm(false); setEditingId(null); }} 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors cursor-pointer"
                                aria-label="Close"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        {/* Heading */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-sm">
                                <span className="material-symbols-outlined text-[22px]">{deptTerms.icon}</span>
                            </div>
                            <div>
                                <h3 className="font-headline-md text-xl font-bold text-primary tracking-tight">
                                    {editingId ? deptTerms.editModalTitle : deptTerms.createModalTitle}
                                </h3>
                                <p className="text-xs text-on-surface-variant mt-0.5">
                                    Create and configure the division. Instructors invited for this {deptTerms.badgeLabel.toLowerCase()} will appear here automatically upon approval.
                                </p>
                            </div>
                        </div>

                        {/* Quick Presets / Suggestions */}
                        {!editingId && deptTerms.presets.length > 0 && (
                            <div className="mb-6 p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/60">
                                <div className="flex items-center justify-between gap-2 mb-2.5">
                                    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-secondary">auto_fix_high</span>
                                        Recommended Presets for {orgTerms.facilityLabel}:
                                    </span>
                                    <span className="text-[10px] text-on-surface-variant italic">Click to auto-fill</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {deptTerms.presets.map((preset, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleApplyPreset(preset)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                                                formData.name === preset.name
                                                    ? 'bg-primary text-on-primary border-primary shadow-sm scale-102'
                                                    : 'bg-surface-container-lowest text-on-surface border-outline-variant hover:border-primary hover:bg-primary/5 hover:text-primary'
                                            }`}
                                        >
                                            <span className="font-mono text-[10px] opacity-75 font-bold">[{preset.code}]</span>
                                            <span>{preset.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Form Body */}
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Department Name */}
                                <div className="md:col-span-6 flex flex-col gap-1.5">
                                    <label className="font-label-md text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                        {deptTerms.nameLabel} <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full p-3 border border-outline-variant rounded-xl bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-body-md text-sm transition-all shadow-sm" 
                                        type="text" 
                                        placeholder={deptTerms.namePlaceholder} 
                                    />
                                </div>

                                {/* Code / Acronym */}
                                <div className="md:col-span-3 flex flex-col gap-1.5">
                                    <label className="font-label-md text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                        {deptTerms.codeLabel}
                                    </label>
                                    <input 
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                        className="w-full p-3 border border-outline-variant rounded-xl bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm uppercase transition-all shadow-sm" 
                                        type="text" 
                                        placeholder={deptTerms.codePlaceholder} 
                                        maxLength={10}
                                    />
                                </div>

                                {/* Status */}
                                <div className="md:col-span-3 flex flex-col gap-1.5">
                                    <label className="font-label-md text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                        Operational Status
                                    </label>
                                    <select 
                                        value={formData.isActive ? 'true' : 'false'}
                                        onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                                        className="w-full p-3 border border-outline-variant rounded-xl bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-body-md text-sm transition-all shadow-sm"
                                    >
                                        <option value="true">Active & In Service</option>
                                        <option value="false">Inactive / Suspended</option>
                                    </select>
                                </div>

                                {/* Dynamic Approved Instructors in Read-Only Mode */}
                                <div className="md:col-span-12 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <label className="font-label-md text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[17px] text-primary">groups</span>
                                            {deptTerms.headLabel} / Assigned {orgTerms.providerPlural}
                                        </label>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant">
                                            Read Only • Auto Synced
                                        </span>
                                    </div>

                                    {formApprovedInstructors.length === 0 ? (
                                        <div className="w-full p-4 rounded-xl border border-dashed border-outline-variant bg-surface-container-low/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-on-surface-variant">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant">
                                                    <span className="material-symbols-outlined text-[20px]">person_off</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-on-surface">
                                                        No {orgTerms.providerPlural.toLowerCase()} approved for this department yet.
                                                    </p>
                                                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                                                        After you invite {orgTerms.providerPlural.toLowerCase()} for <span className="font-semibold text-primary">"{formData.name || 'this department'}"</span> and approve them in {orgTerms.providersNavLabel}, they will automatically appear here in read-only mode.
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => navigate('/admin/providers')}
                                                className="text-[11px] font-bold text-secondary hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                                            >
                                                <span>Invite {orgTerms.providerSingular}</span>
                                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-low/70 flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[16px] text-green-600">verified</span>
                                                    Approved {orgTerms.providerPlural} ({formApprovedInstructors.length})
                                                </span>
                                                <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                                                    {formApprovedInstructors.length} Active in Department
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2.5">
                                                {formApprovedInstructors.map((instructor) => (
                                                    <div key={instructor.id} className="px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant text-xs font-semibold text-on-surface flex items-center gap-2.5 shadow-sm">
                                                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">
                                                            {instructor.name ? instructor.name[0].toUpperCase() : 'I'}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="leading-tight text-on-surface font-bold">{instructor.name}</span>
                                                            <span className="text-[10px] text-on-surface-variant font-normal">{instructor.email}</span>
                                                        </div>
                                                        <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200 ml-1">
                                                            Approved
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="md:col-span-12 flex flex-col gap-1.5">
                                    <label className="font-label-md text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                        {deptTerms.descLabel} <span className="text-red-500">*</span>
                                    </label>
                                    <textarea 
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full p-3.5 border border-outline-variant rounded-xl bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-body-md text-sm transition-all h-28 resize-none shadow-sm" 
                                        placeholder={deptTerms.descPlaceholder} 
                                    />
                                </div>
                            </div>

                            {/* Status notification */}
                            {statusMessage && (
                                <div className={`p-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                                    saveStatus === 'success' 
                                        ? 'bg-green-50 text-green-800 border border-green-200' 
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                }`}>
                                    <span className="material-symbols-outlined text-[20px]">
                                        {saveStatus === 'success' ? 'check_circle' : 'error'}
                                    </span>
                                    <span>{statusMessage}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => { setShowForm(false); setEditingId(null); }} 
                                    className="px-5 py-2.5 border border-outline-variant text-on-surface rounded-xl font-label-md text-sm font-bold hover:bg-surface-container-low transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saveStatus === 'saving'}
                                    className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold font-label-md text-sm shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        {saveStatus === 'saving' ? 'hourglass_top' : 'save'}
                                    </span>
                                    {saveStatus === 'saving' ? 'Saving...' : editingId ? `Update ${deptTerms.badgeLabel}` : deptTerms.saveButtonLabel}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Departments Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-16 text-on-surface-variant flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <span className="text-sm font-mono-data">Loading {deptTerms.entityTitle.toLowerCase()}...</span>
                        </div>
                    ) : departments.length === 0 ? (
                        <div className="col-span-full text-center py-16 px-6 border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-on-surface-variant/70 mb-4 border border-outline-variant/60 shadow-inner">
                                <span className="material-symbols-outlined text-4xl">{deptTerms.icon}</span>
                            </div>
                            <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-1.5">
                                {deptTerms.emptyTitle}
                            </h3>
                            <p className="font-body-md text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
                                {deptTerms.emptyDescription}
                            </p>
                            {!showForm && (
                                <button 
                                    onClick={handleOpenCreate} 
                                    className="px-6 py-3 bg-primary text-on-primary rounded-xl font-label-md font-bold text-sm shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    {deptTerms.createButtonLabel}
                                </button>
                            )}
                        </div>
                    ) : (
                        departments.map(dept => {
                            // Find approved instructors for this card
                            const approvedList = dept.approvedProviders && dept.approvedProviders.length > 0 
                                ? dept.approvedProviders 
                                : getApprovedInstructorsFor(dept.name, dept.code).map(p => p.name);

                            return (
                                <div 
                                    key={dept.id} 
                                    className="p-6 border border-outline-variant rounded-2xl bg-surface-container-lowest hover:border-primary/40 hover:shadow-md transition-all group relative flex flex-col justify-between overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                                    
                                    <div>
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-3 pl-2">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-headline-md text-lg font-bold text-primary tracking-tight">
                                                        {dept.name}
                                                    </h4>
                                                    {dept.code && (
                                                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                                            {dept.code}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mt-0.5">
                                                    {deptTerms.badgeLabel}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                                                    (dept.active !== false && dept.isActive !== false)
                                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                    {(dept.active !== false && dept.isActive !== false) ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Approved Instructors / Providers Section */}
                                        <div className="pl-2 mb-3">
                                            {approvedList.length > 0 ? (
                                                <div className="flex flex-col gap-1.5 bg-surface-container-low/50 p-2.5 rounded-xl border border-outline-variant/60">
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px] text-green-600">verified</span>
                                                        Approved {orgTerms.providerPlural} ({approvedList.length}):
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {approvedList.map((instName, idx) => (
                                                            <span key={idx} className="text-[11px] font-semibold px-2 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/70 text-on-surface flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[12px] text-secondary">person</span>
                                                                {instName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/80 bg-surface-container-low/30 px-2.5 py-1.5 rounded-lg border border-dashed border-outline-variant/50">
                                                    <span className="material-symbols-outlined text-[15px] text-outline">person_outline</span>
                                                    <span className="text-[11px]">No {orgTerms.providerPlural.toLowerCase()} approved yet</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className="font-body-md text-xs text-on-surface-variant pl-2 line-clamp-3 leading-relaxed">
                                            {dept.description}
                                        </p>
                                    </div>

                                    {/* Footer / Actions */}
                                    <div className="mt-5 pt-3 pl-2 border-t border-outline-variant/50 flex items-center justify-between">
                                        <span className="text-[11px] text-outline font-mono">
                                            ID: DEP-{String(dept.id).padStart(3, '0')}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleOpenEdit(dept)} 
                                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                                title="Edit Department"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button 
                                                onClick={() => setDeleteModalId(dept.id)} 
                                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                                                title="Delete Department"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant">
                        <div className="flex items-center gap-3 text-error mb-4">
                            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">warning</span>
                            </div>
                            <h3 className="font-headline-md text-lg font-bold">Confirm Deletion</h3>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                            Are you sure you want to delete this {deptTerms.badgeLabel.toLowerCase()}? Any {orgTerms.providerPlural.toLowerCase()} or {orgTerms.servicePlural.toLowerCase()} currently tagged to this division will need to be reassigned.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setDeleteModalId(null)}
                                className="px-4 py-2 border border-outline-variant rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                onClick={confirmDelete}
                                className="px-5 py-2 bg-error text-on-error rounded-xl text-sm font-bold shadow hover:brightness-110 transition-all cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
