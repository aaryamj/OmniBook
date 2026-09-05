import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Department {
    id: number;
    name: string;
    description: string;
    active: boolean;
}

export default function DepartmentsConfig() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });

    useEffect(() => {
        fetchDepartments();
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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/v1/admin/departments', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowForm(false);
            setFormData({ name: '', description: '', isActive: true });
            fetchDepartments();
        } catch (error) {
            console.error("Failed to save department", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this department?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/v1/admin/departments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDepartments();
        } catch (error) {
            console.error("Failed to delete department", error);
        }
    };

    return (
        <>
            <div className="p-6 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
                <div className="flex gap-8">
                    <div className="flex flex-col">
                        <span className="font-label-md text-[10px] uppercase text-outline">Total Departments</span>
                        <span className="font-mono-data text-mono-data font-bold">{departments.length} Active</span>
                    </div>
                </div>
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary text-on-primary rounded font-label-md font-bold text-sm shadow flex items-center gap-2 hover:bg-primary/90 transition-all">
                        <span className="material-symbols-outlined text-sm">add</span>
                        New Department
                    </button>
                )}
            </div>

            <div className="p-8">
                {showForm && (
                    <form onSubmit={handleSave} className="mb-8 p-6 border border-outline-variant rounded-xl bg-surface-bright shadow-sm relative">
                        <div className="absolute top-4 right-4">
                            <button type="button" onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-error transition-colors material-symbols-outlined">close</button>
                        </div>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="w-1.5 h-6 bg-secondary rounded-full"></span>
                            <h3 className="font-headline-md text-headline-md">Create Department</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="flex flex-col gap-2">
                                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Department Name</label>
                                <input 
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full p-3 border border-outline-variant rounded bg-background focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none font-body-md text-body-md transition-all" 
                                    type="text" 
                                    placeholder="e.g. Cardiology" 
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Status</label>
                                <select 
                                    value={formData.isActive ? 'true' : 'false'}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                                    className="w-full p-3 border border-outline-variant rounded bg-background focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none font-body-md text-body-md transition-all"
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                            <div className="col-span-2 flex flex-col gap-2">
                                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Description</label>
                                <textarea 
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full p-3 border border-outline-variant rounded bg-background focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none font-body-md text-body-md transition-all h-24 resize-none" 
                                    placeholder="Brief description of the department's role and functions..." 
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-outline-variant text-on-surface rounded font-label-md text-sm hover:bg-surface-container-low transition-all">Cancel</button>
                            <button type="submit" className="px-5 py-2.5 bg-secondary text-on-secondary rounded font-bold font-label-md text-sm shadow hover:brightness-110 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">save</span> Save Department
                            </button>
                        </div>
                    </form>
                )}

                <div className="grid grid-cols-2 gap-6">
                    {loading ? (
                        <div className="col-span-2 text-center p-8 text-on-surface-variant animate-pulse">Loading departments...</div>
                    ) : departments.length === 0 ? (
                        <div className="col-span-2 text-center p-12 border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
                            <span className="material-symbols-outlined text-4xl text-outline mb-2">domain_disabled</span>
                            <h3 className="font-headline-sm text-on-surface mb-1">No Departments Found</h3>
                            <p className="font-body-md text-on-surface-variant mb-4">You haven't defined any structural departments for your clinic yet.</p>
                            {!showForm && (
                                <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-secondary text-on-secondary rounded font-label-md font-bold text-sm shadow hover:brightness-110 transition-all">
                                    Create First Department
                                </button>
                            )}
                        </div>
                    ) : (
                        departments.map(dept => (
                            <div key={dept.id} className="p-5 border border-outline-variant rounded-xl bg-surface-container-lowest hover:border-secondary/50 transition-colors group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary"></div>
                                <div className="flex justify-between items-start mb-2 pl-2">
                                    <h4 className="font-headline-md text-lg text-primary">{dept.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${dept.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {dept.active ? 'Active' : 'Inactive'}
                                        </span>
                                        <button onClick={() => handleDelete(dept.id)} className="text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100">
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <p className="font-body-md text-sm text-on-surface-variant pl-2 line-clamp-2">{dept.description}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
