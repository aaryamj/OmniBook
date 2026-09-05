const fs = require('fs');
const path = 'd:/Final Year Project/fyp-frontend/src/pages/acceptInvite/AcceptInvite.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace Email Field
content = content.replace(
  /<label className=\"font-sans text-sm font-semibold text-on-surface\">Administrator Email<\/label>[\s\S]*?<div className=\"relative group\">[\s\S]*?<input[\s\S]*?className=\"w-full bg-surface-container-low text-on-surface-variant border border-outline-variant text-base pl-4 pr-10 py-3 rounded-lg outline-none cursor-not-allowed\"[\s\S]*?type=\"email\"[\s\S]*?value=\{adminEmail \|\| 'Loading\.\.\.'\}[\s\S]*?readOnly[\s\S]*?\/>[\s\S]*?<span className=\"material-symbols-outlined absolute right-4 top-1\/2 -translate-y-1\/2 text-outline-variant text-sm\">lock<\/span>[\s\S]*?<\/div>/g,
  `<label className=\"block text-[14px] font-medium text-[#151c27]\">Administrator Email</label>
                                <div className=\"relative group\">
                                    <span className=\"material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors\">
                                        mail
                                    </span>
                                    <input 
                                        className=\"w-full pl-12 pr-4 py-3 bg-gray-100 border border-[#c3c5d7] rounded-xl text-[16px] text-gray-500 cursor-not-allowed outline-none\"
                                        type=\"email\" 
                                        value={adminEmail || 'Loading...'}
                                        readOnly
                                    />
                                </div>`
);

// Replace Full Name Field
content = content.replace(
  /<label className=\"font-sans text-sm font-semibold text-on-surface\">Administrator Full Name<\/label>[\s\S]*?<div className=\"relative group\">[\s\S]*?<input[\s\S]*?className=\{[^}]+\}[\s\S]*?placeholder=\"e\.g\., Dr\. Jane Smith\"[\s\S]*?type=\"text\"[\s\S]*?value=\{formData\.fullName\}[\s\S]*?onChange=\{\(e\) => setFormData\(\{\.\.\.formData, fullName: e\.target\.value\}\)\}[\s\S]*?required[\s\S]*?\/>[\s\S]*?<span className=\"material-symbols-outlined absolute right-4 top-1\/2 -translate-y-1\/2 text-outline-variant text-sm\">person<\/span>[\s\S]*?<\/div>[\s\S]*?\{errors\.fullName && <p className=\"text-error text-xs mt-1\">\{errors\.fullName\}<\/p>\}/g,
  `<label className=\"block text-[14px] font-medium text-[#151c27]\">Administrator Full Name</label>
                                <div className=\"relative group\">
                                    <span className=\"material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors\">
                                        person
                                    </span>
                                    <input 
                                        className={\`w-full pl-12 pr-4 py-3 bg-white border \${errors.fullName ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all\`}
                                        placeholder=\"e.g., Dr. Jane Smith\" 
                                        type=\"text\" 
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        required
                                    />
                                </div>
                                {errors.fullName && <p className=\"text-red-500 text-xs mt-1\">{errors.fullName}</p>}`
);

// Replace Phone Field
content = content.replace(
  /<label className=\"font-sans text-sm font-semibold text-on-surface\">Administrator Phone<\/label>[\s\S]*?<div className=\"relative group\">[\s\S]*?<input[\s\S]*?className=\{[^}]+\}[\s\S]*?placeholder=\"e\.g\., \+977-9800000000\"[\s\S]*?type=\"tel\"[\s\S]*?value=\{formData\.phone\}[\s\S]*?onChange=\{\(e\) => setFormData\(\{\.\.\.formData, phone: e\.target\.value\}\)\}[\s\S]*?required[\s\S]*?\/>[\s\S]*?<span className=\"material-symbols-outlined absolute right-4 top-1\/2 -translate-y-1\/2 text-outline-variant text-sm\">phone<\/span>[\s\S]*?<\/div>[\s\S]*?\{errors\.phone && <p className=\"text-error text-xs mt-1\">\{errors\.phone\}<\/p>\}/g,
  `<label className=\"block text-[14px] font-medium text-[#151c27]\">Administrator Phone</label>
                                <div className=\"relative group\">
                                    <div className=\"absolute left-[1px] top-[1px] bottom-[1px] flex items-center border-r border-[#c3c5d7] pr-2 pl-3 bg-[#f9f9ff] rounded-l-[11px] pointer-events-auto\">
                                        <select className=\"bg-transparent border-none outline-none p-0 pr-4 text-[14px] text-[#434654] font-medium cursor-pointer appearance-none focus:ring-0\" style={{backgroundImage: "url(\\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23737686' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\\")", backgroundPosition: "right 0 center", backgroundRepeat: "no-repeat", backgroundSize: "1.2em 1.2em"}}>
                                            <option value=\"+1\">🇺🇸 +1</option>
                                            <option value=\"+44\">🇬🇧 +44</option>
                                            <option value=\"+91\">🇮🇳 +91</option>
                                            <option value=\"+61\">🇦🇺 +61</option>
                                            <option value=\"+977\">🇳🇵 +977</option>
                                        </select>
                                    </div>
                                    <input 
                                        className={\`w-full pl-[95px] pr-4 py-3 bg-white border \${errors.phone ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all\`}
                                        placeholder=\"0000000000\" 
                                        type=\"tel\" 
                                        maxLength={10}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/[^0-9]/g, '')})}
                                        required
                                    />
                                </div>
                                {errors.phone && <p className=\"text-red-500 text-xs mt-1\">{errors.phone}</p>}`
);

// Replace Password Field
content = content.replace(
  /<label className=\"font-sans text-sm font-semibold text-on-surface\">Create Master Password<\/label>[\s\S]*?<input[\s\S]*?className=\{[^}]+\}[\s\S]*?placeholder=\"••••••••••••\"[\s\S]*?type=\"password\"[\s\S]*?value=\{formData\.password\}[\s\S]*?onChange=\{\(e\) => setFormData\(\{\.\.\.formData, password: e\.target\.value\}\)\}[\s\S]*?required[\s\S]*?\/>[\s\S]*?\{errors\.password \? \([\s\S]*?<p className=\"text-error text-\[10px\] font-sans font-medium\">\{errors\.password\}<\/p>[\s\S]*?\) : \([\s\S]*?<p className=\"text-\[10px\] text-on-surface-variant font-sans text-sm font-medium\">Minimum 8 characters\.<\/p>[\s\S]*?\)\}/g,
  `<label className=\"block text-[14px] font-medium text-[#151c27]\">Create Master Password</label>
                                <div className=\"relative group\">
                                    <span className=\"material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors\">
                                        lock
                                    </span>
                                    <input 
                                        className={\`w-full pl-12 pr-4 py-3 bg-white border \${errors.password ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all\`}
                                        placeholder=\"••••••••••••\" 
                                        type=\"password\"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        required
                                    />
                                </div>
                                {errors.password ? (
                                    <p className=\"text-red-500 text-xs mt-1\">{errors.password}</p>
                                ) : (
                                    <p className=\"text-[#737686] text-xs mt-1\">Must be 6+ chars, start with a capital, and include a number and symbol.</p>
                                )}`
);

// Replace Confirm Password Field
content = content.replace(
  /<label className=\"font-sans text-sm font-semibold text-on-surface\">Confirm Password<\/label>[\s\S]*?<input[\s\S]*?className=\{[^}]+\}[\s\S]*?placeholder=\"••••••••••••\"[\s\S]*?type=\"password\"[\s\S]*?value=\{formData\.confirmPassword\}[\s\S]*?onChange=\{\(e\) => setFormData\(\{\.\.\.formData, confirmPassword: e\.target\.value\}\)\}[\s\S]*?required[\s\S]*?\/>[\s\S]*?\{errors\.confirmPassword && <p className=\"text-error text-\[10px\] font-sans font-medium\">\{errors\.confirmPassword\}<\/p>\}/g,
  `<label className=\"block text-[14px] font-medium text-[#151c27]\">Confirm Password</label>
                                <div className=\"relative group\">
                                    <span className=\"material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors\">
                                        lock
                                    </span>
                                    <input 
                                        className={\`w-full pl-12 pr-4 py-3 bg-white border \${errors.confirmPassword ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all\`}
                                        placeholder=\"••••••••••••\" 
                                        type=\"password\"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                        required
                                    />
                                </div>
                                {errors.confirmPassword && <p className=\"text-red-500 text-xs mt-1\">{errors.confirmPassword}</p>}`
);

fs.writeFileSync(path, content);
console.log('Fields replaced successfully');
