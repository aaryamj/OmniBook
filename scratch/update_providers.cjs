const fs = require('fs');
const path = 'd:/Final Year Project/fyp-frontend/src/pages/adminPage/ManageProviders.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes("import axios from")) {
    content = content.replace("import React", "import axios from 'axios';\nimport React");
}

const newSubmitLogic = `
    const handleDrawerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!drawerForm.tier) {
            alert('Please select an access tier.');
            return;
        }
        setIsProvisioning(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:8080/api/v1/admin/providers/invite',
                {
                    email: drawerForm.email,
                    name: drawerForm.name,
                    specialization: drawerForm.specialization,
                    tier: drawerForm.tier
                },
                {
                    headers: { Authorization: \`Bearer \${token}\` }
                }
            );

            if (response.status === 200) {
                // Keep the simulation for the UI update so it immediately shows up in the matrix
                const newId = 'p' + (providers.length + 1) + Math.floor(Math.random() * 1000);
                const newProvider: any = {
                    id: newId,
                    name: drawerForm.name,
                    role: drawerForm.specialization,
                    tier: drawerForm.tier,
                    utilization: 0,
                    utilLabel: 'Onboarding',
                    utilColor: 'text-on-surface-variant',
                    stripe: '$0.00',
                    esewa: 'Rs. 0',
                    imageBg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpoR1sz2z7Q1zg_iKjkzYfdsquaQrZmdTb97jaP_bVMs9sjTRdIEO_oXDcdWa0JYrmKBDLi1T8flYy0zc4Ck9td-lYTG_X3GAgZ3xmB7Dzh3k_HMgKMWVqDBe0CSGDMlV4g71UEOw_U7bmBLwBmfqGEbold6o01VBsfNymzr8ZjKs15F-NPmCWd8KqfYeE5v6NILeVgckg7Wbei66kGSEblG1irPqdyevV_gQsmn-mSiij_bPQtYc0JEdUEAhmkS1FL-PGSBHqKl8',
                    imageAvatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzI9P7k4Z-Q3fW-iO404l-tC6M5D1E1z4E9Q&s', // generic placeholder
                    isLive: false,
                    hasHeatmap: false,
                    status: 'Pending Activation'
                };
                setProviders([newProvider, ...providers]);
                setIsProvisioning(false);
                setIsDrawerOpen(false);
                
                // Show toast
                setToastMsg(\`Invitation successfully dispatched to \${drawerForm.email}\`);
                setTimeout(() => setToastMsg(''), 4000);
                
                // Reset form
                setDrawerForm({ name: '', email: '', specialization: '', licenseNumber: '', tier: '' });
                setDrawerStep(1);
            }
        } catch (error: any) {
            setIsProvisioning(false);
            console.error('Failed to invite provider', error);
            alert('Failed to send invitation: ' + (error.response?.data?.message || error.message));
        }
    };
`;

content = content.replace(/const handleDrawerSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?\}, 1500\);\n    \};/, newSubmitLogic.trim());
fs.writeFileSync(path, content);
console.log('ManageProviders.tsx updated with axios call');
