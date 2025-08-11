/* global __firebase_config, __app_id */
import React from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    setDoc,
    onSnapshot,
    query,
    writeBatch,
    getDocs
} from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'credential-vault-app';

// --- Global Styles Component for modern scrollbars ---
const GlobalStyles = () => (
    <style>{`
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: #1e293b; /* slate-800 */
      }
      ::-webkit-scrollbar-thumb {
        background-color: #475569; /* slate-600 */
        border-radius: 4px;
        border: 2px solid #1e293b; /* slate-800 */
      }
      ::-webkit-scrollbar-thumb:hover {
        background-color: #64748b; /* slate-500 */
      }
    `}</style>
);


// --- SVG Icons ---
const ProjectIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 text-slate-400"><path d="M20 12.5L14.5 18L9.5 13L4 18" /><path d="M20 6L14.5 11.5L9.5 6.5L4 11.5" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const CopyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>);
const EyeIcon = ({ off = false }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle>{off && <path d="m2 2 20 20"></path>}</svg>);
const SignOutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 text-slate-400"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 rounded-full text-slate-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>);

// --- Auth Screen Component ---
const AuthScreen = ({ auth }) => {
    const [isLogin, setIsLogin] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col justify-center items-center bg-slate-900 p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-sky-400 mb-2">Creds<span className="text-white">Vault</span></h1>
                    <p className="text-slate-400">Securely manage your credentials.</p>
                </div>
                <div className="bg-slate-800 p-8 rounded-xl shadow-2xl shadow-slate-950/50">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">{isLogin ? 'Sign In' : 'Create Account'}</h2>
                    {error && <p className="bg-red-500/20 text-red-400 text-sm p-3 rounded-md mb-4">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="email">Email</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="password">Password</label>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white transition-all" />
                        </div>
                        <button type="submit" className="w-full py-2.5 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-500 transition-colors">
                            {isLogin ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-slate-400 mt-6">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-sky-400 hover:text-sky-300">
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---
function App() {
    // Firebase state
    const [auth, setAuth] = React.useState(null);
    const [db, setDb] = React.useState(null);
    const [user, setUser] = React.useState(null);

    // App Data State
    const [projects, setProjects] = React.useState([]);
    const [environments, setEnvironments] = React.useState([]);
    const [roles, setRoles] = React.useState({});
    const [credentials, setCredentials] = React.useState({});
    const [allData, setAllData] = React.useState([]);

    // UI State
    const [activeProject, setActiveProject] = React.useState(null);
    const [activeEnv, setActiveEnv] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [showPassword, setShowPassword] = React.useState({});
    const [copied, setCopied] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    
    // Modal/Form State
    const [modal, setModal] = React.useState({ type: null, data: null, parentId: null });
    const [confirmDelete, setConfirmDelete] = React.useState(null);
    const [isModalPasswordVisible, setIsModalPasswordVisible] = React.useState(false);

    // --- Add Tailwind CSS script to ensure styling is applied ---
    React.useEffect(() => {
        const scriptId = 'tailwind-script';
        if (document.getElementById(scriptId)) return;
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://cdn.tailwindcss.com';
        document.head.appendChild(script);
    }, []);

    // --- Firebase Initialization and Auth ---
    React.useEffect(() => {
        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        setAuth(authInstance);
        setDb(dbInstance);

        onAuthStateChanged(authInstance, (user) => {
            if (!user) {
                setProjects([]);
                setEnvironments([]);
                setRoles({});
                setCredentials({});
                setAllData([]);
                setActiveProject(null);
                setActiveEnv(null);
            }
            setUser(user || null);
            setLoading(false);
        });
    }, []);

    const handleSignOut = async () => {
        if (auth) {
            await signOut(auth);
        }
    };

    // --- Data Fetching and Aggregation for Search ---
    React.useEffect(() => {
        if (!user || !db) return;
    
        const projectsPath = `artifacts/${appId}/users/${user.uid}/projects`;
        const unsubscribe = onSnapshot(query(collection(db, projectsPath)), async (projectsSnapshot) => {
            const projectsData = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(projectsData);
    
            if (projectsData.length > 0 && (!activeProject || !projectsData.find(p => p.id === activeProject.id))) {
                setActiveProject(projectsData[0]);
            } else if (projectsData.length === 0) {
                setActiveProject(null);
            }
    
            let aggregatedData = [];
            for (const project of projectsData) {
                aggregatedData.push({ ...project, type: 'Project' });
                const envsSnapshot = await getDocs(query(collection(db, `${projectsPath}/${project.id}/environments`)));
                for (const envDoc of envsSnapshot.docs) {
                    const envData = { id: envDoc.id, ...envDoc.data() };
                    aggregatedData.push({ ...envData, type: 'Environment', parent: project.name });
                    const rolesSnapshot = await getDocs(query(collection(db, `${envDoc.ref.path}/roles`)));
                    for (const roleDoc of rolesSnapshot.docs) {
                        const roleData = { id: roleDoc.id, ...roleDoc.data() };
                        aggregatedData.push({ ...roleData, type: 'Role', parent: `${project.name} / ${envData.name}` });
                        const credsSnapshot = await getDocs(query(collection(db, `${roleDoc.ref.path}/credentials`)));
                        for (const credDoc of credsSnapshot.docs) {
                            aggregatedData.push({ ...credDoc.data(), id: credDoc.id, type: 'Credential', parent: `${project.name} / ${envData.name} / ${roleData.name}` });
                        }
                    }
                }
            }
            setAllData(aggregatedData);
        });
    
        return () => unsubscribe();
    }, [user, db, activeProject]);

    React.useEffect(() => {
        if (!activeProject || !db || !user) {
            setEnvironments([]);
            setActiveEnv(null);
            return;
        }
        const path = `artifacts/${appId}/users/${user.uid}/projects/${activeProject.id}/environments`;
        const q = query(collection(db, path));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort environments alphabetically
            data.sort((a, b) => a.name.localeCompare(b.name));
            setEnvironments(data);
            if (data.length > 0 && (!activeEnv || !data.find(e => e.id === activeEnv.id))) {
                setActiveEnv(data[0]);
            } else if (data.length === 0) {
                setActiveEnv(null);
            }
        });
        return unsubscribe;
    }, [activeProject, user, db, activeEnv]);
    
    React.useEffect(() => {
        if (!activeEnv || !db || !user || !activeProject?.id) {
            setRoles({});
            return;
        }
        const path = `artifacts/${appId}/users/${user.uid}/projects/${activeProject.id}/environments/${activeEnv.id}/roles`;
        const q = query(collection(db, path));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRoles(prev => ({ ...prev, [activeEnv.id]: data }));
        });
        return unsubscribe;
    }, [activeEnv, user, db, activeProject?.id]);

    React.useEffect(() => {
        if (!roles[activeEnv?.id] || !activeProject?.id || !user || !db) return;
        roles[activeEnv.id].forEach(role => {
            const path = `artifacts/${appId}/users/${user.uid}/projects/${activeProject.id}/environments/${activeEnv.id}/roles/${role.id}/credentials`;
            const q = query(collection(db, path));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCredentials(prev => ({ ...prev, [role.id]: data }));
            });
            return unsubscribe;
        });
    }, [roles, activeEnv, user, db, activeProject?.id]);

    // --- Search Logic ---
    const filteredData = React.useMemo(() => {
        if (!searchTerm) return [];
        const lowercasedTerm = searchTerm.toLowerCase();
        return allData.filter(item => {
            if (item.name?.toLowerCase().includes(lowercasedTerm)) return true;
            if (item.username?.toLowerCase().includes(lowercasedTerm)) return true;
            if (item.parent?.toLowerCase().includes(lowercasedTerm)) return true;
            return false;
        });
    }, [searchTerm, allData]);

    // --- Helper Functions ---
    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(id);
            setTimeout(() => setCopied(null), 2000);
        }).catch(err => console.error('Failed to copy text: ', err));
    };

    const toggleShowPassword = (id) => setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));

    // --- CRUD Operations ---
    const handleAddOrUpdate = async (formData) => {
        if (!db || !user) return;
        const { type, data, parentId } = modal;
        let path, docData;

        switch (type) {
            case 'project': path = `artifacts/${appId}/users/${user.uid}/projects`; docData = { name: formData.name }; break;
            case 'env': path = `artifacts/${appId}/users/${user.uid}/projects/${activeProject.id}/environments`; docData = { name: formData.name, url: formData.url }; break;
            case 'role': path = `artifacts/${appId}/users/${user.uid}/projects/${activeProject.id}/environments/${activeEnv.id}/roles`; docData = { name: formData.name }; break;
            case 'cred': path = `artifacts/${appId}/users/${user.uid}/projects/${activeProject.id}/environments/${activeEnv.id}/roles/${parentId}/credentials`; docData = { username: formData.username, password: formData.password }; break;
            default: return;
        }

        try {
            if (data?.id) await setDoc(doc(db, path, data.id), docData);
            else await addDoc(collection(db, path), docData);
        } catch (error) { console.error(`Error saving ${type}:`, error); }
        setModal({ type: null, data: null, parentId: null });
        setIsModalPasswordVisible(false);
    };
    
    const handleDelete = async (type, item) => {
        if (!db || !user) return;
        const basePath = `artifacts/${appId}/users/${user.uid}/projects`;
        const batch = writeBatch(db);
    
        try {
            if (type === 'project') {
                const envsSnapshot = await getDocs(collection(db, `${basePath}/${item.id}/environments`));
                for (const envDoc of envsSnapshot.docs) {
                    const rolesSnapshot = await getDocs(collection(db, `${envDoc.ref.path}/roles`));
                    for (const roleDoc of rolesSnapshot.docs) {
                        const credsSnapshot = await getDocs(collection(db, `${roleDoc.ref.path}/credentials`));
                        credsSnapshot.forEach(credDoc => batch.delete(credDoc.ref));
                        batch.delete(roleDoc.ref);
                    }
                    batch.delete(envDoc.ref);
                }
                batch.delete(doc(db, `${basePath}/${item.id}`));
            } else if (type === 'env') {
                const envRef = doc(db, `${basePath}/${activeProject.id}/environments/${item.id}`);
                const rolesSnapshot = await getDocs(collection(db, `${envRef.path}/roles`));
                for (const roleDoc of rolesSnapshot.docs) {
                    const credsSnapshot = await getDocs(collection(db, `${roleDoc.ref.path}/credentials`));
                    credsSnapshot.forEach(credDoc => batch.delete(credDoc.ref));
                    batch.delete(roleDoc.ref);
                }
                batch.delete(envRef);
            } else if (type === 'role') {
                const roleRef = doc(db, `${basePath}/${activeProject.id}/environments/${activeEnv.id}/roles/${item.id}`);
                const credsSnapshot = await getDocs(collection(db, `${roleRef.path}/credentials`));
                credsSnapshot.forEach(credDoc => batch.delete(credDoc.ref));
                batch.delete(roleRef);
            } else if (type === 'cred') {
                const credRef = doc(db, `${basePath}/${activeProject.id}/environments/${activeEnv.id}/roles/${item.roleId}/credentials/${item.id}`);
                batch.delete(credRef);
            }
            await batch.commit();
        } catch (error) { console.error(`Error deleting ${type}:`, error); }
        setConfirmDelete(null);
    };

    // --- Render Functions ---
    const renderModal = () => {
        if (!modal.type) return null;
        const { type, data } = modal;
        const isEditing = !!data;
        let title = `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        if (isEditing) title = `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`;

        let fields;
        switch (type) {
            case 'project': case 'role': fields = [{ name: 'name', label: 'Name', type: 'text' }]; break;
            case 'env': fields = [{ name: 'name', label: 'Name', type: 'text' }, { name: 'url', label: 'URL (Optional)', type: 'text' }]; break;
            case 'cred': fields = [{ name: 'username', label: 'Username', type: 'text' }, { name: 'password', label: 'Password', type: 'password' }]; break;
            default: return null;
        }

        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity">
                <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-700">
                    <h2 className="text-xl font-bold mb-6 text-white">{title}</h2>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddOrUpdate(Object.fromEntries(new FormData(e.target))); }}>
                        {fields.map(field => {
                             if (type === 'cred' && field.name === 'password') {
                                return (
                                    <div key={field.name} className="mb-4">
                                        <label htmlFor={field.name} className="block text-sm font-medium text-slate-300 mb-1">{field.label}</label>
                                        <div className="relative">
                                            <input
                                                id={field.name}
                                                name={field.name}
                                                type={isModalPasswordVisible ? 'text' : 'password'}
                                                defaultValue={data?.[field.name] || ''}
                                                required
                                                autoComplete="new-password"
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setIsModalPasswordVisible(v => !v)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-sky-400"
                                            >
                                                <EyeIcon off={!isModalPasswordVisible} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <div key={field.name} className="mb-4">
                                    <label htmlFor={field.name} className="block text-sm font-medium text-slate-300 mb-1">{field.label}</label>
                                    <input type={field.type} name={field.name} id={field.name} defaultValue={data?.[field.name] || ''} required={field.name !== 'url'} autoComplete="off" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" />
                                </div>
                            )
                        })}
                        <div className="flex justify-end space-x-3 mt-8">
                            <button type="button" onClick={() => { setModal({ type: null, data: null }); setIsModalPasswordVisible(false); }} className="px-4 py-2 bg-slate-600 text-slate-100 rounded-md hover:bg-slate-500 transition-colors">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-500 transition-colors">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const renderConfirmDeleteModal = () => {
        if (!confirmDelete) return null;
        const { type, item } = confirmDelete;
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity">
                <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-700">
                    <h2 className="text-lg font-bold text-white">Confirm Deletion</h2>
                    <p className="mt-2 text-sm text-slate-300">Are you sure you want to delete <strong className="font-mono text-amber-400">{item.name || item.username}</strong>? This action is irreversible.</p>
                    <p className="mt-4 text-xs text-red-400 bg-red-500/10 p-2 rounded-md">Note: All nested items (roles, credentials, etc.) will also be permanently deleted.</p>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-slate-600 text-slate-100 rounded-md hover:bg-slate-500 transition-colors">Cancel</button>
                        <button onClick={() => handleDelete(type, item)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors">Delete</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderSearchResults = () => (
        <div className="p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Search Results for "{searchTerm}"</h2>
            {filteredData.length > 0 ? (
                <div className="space-y-4">
                    {filteredData.map(item => (
                         <div key={`${item.type}-${item.id}`} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.type === 'Project' ? 'bg-purple-500/20 text-purple-300' : item.type === 'Environment' ? 'bg-blue-500/20 text-blue-300' : item.type === 'Role' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{item.type}</span>
                                    <h3 className="text-lg font-semibold text-white mt-2">{item.name || item.username}</h3>
                                    {item.parent && <p className="text-sm text-slate-400">{item.parent}</p>}
                                </div>
                            </div>
                         </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-400">No results found.</p>
            )}
        </div>
    );
    
    if (loading) return <div className="h-screen w-screen flex justify-center items-center bg-slate-900"><p className="text-slate-400">Loading Vault...</p></div>;
    if (!user) return <AuthScreen auth={auth} />;

    const SidebarContent = () => (
        <>
            <div className="p-4 border-b border-slate-700/50">
                <h1 className="text-lg font-bold text-sky-400">Creds<span className="text-white">Vault</span></h1>
                <div className="flex items-center mt-3 space-x-3">
                    <UserIcon />
                    <span className="text-sm font-medium truncate text-slate-300" title={user.email}>{user.email}</span>
                </div>
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {projects.map(p => (
                    <button key={p.id} onClick={() => { setActiveProject(p); setSearchTerm(''); setIsSidebarOpen(false); }} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${activeProject?.id === p.id && !searchTerm ? 'bg-sky-500/10 text-sky-300' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}>
                        <ProjectIcon /><span className="flex-1 truncate">{p.name}</span>
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-700/50 space-y-2">
                <button onClick={() => setModal({ type: 'project', data: null })} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-500 transition-colors"><PlusIcon /> <span className="ml-2">New Project</span></button>
                <button onClick={handleSignOut} className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors"><SignOutIcon /> Sign Out</button>
            </div>
        </>
    );

    return (
        <div className="h-screen w-screen bg-slate-900 text-slate-200 flex font-sans overflow-hidden">
            <GlobalStyles />
            {renderModal()}
            {renderConfirmDeleteModal()}
            
            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 border-r border-slate-700/50 flex flex-col md:hidden transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>

            {/* Overlay for Mobile */}
            {isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="fixed inset-0 z-30 bg-black/60 md:hidden"
                ></div>
            )}

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-slate-800/50 border-r border-slate-700/50 flex-col md:flex hidden">
                <SidebarContent />
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-slate-800/50 shadow-sm p-4 flex justify-between items-center border-b border-slate-700/50 flex-wrap gap-4">
                    <div className="flex items-center">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden mr-4 text-slate-400 hover:text-white">
                            <MenuIcon />
                        </button>
                        {activeProject && (
                            <div>
                                <h2 className="text-xl font-bold text-white">{activeProject.name}</h2>
                                <div className="flex items-center space-x-2 mt-1">
                                    <button onClick={() => setModal({ type: 'project', data: activeProject })} className="text-xs text-slate-400 hover:text-sky-400 flex items-center transition-colors"><EditIcon /><span className="ml-1">Edit</span></button>
                                    <span className="text-slate-600">|</span>
                                    <button onClick={() => setConfirmDelete({ type: 'project', item: activeProject })} className="text-xs text-red-500 hover:text-red-400 flex items-center transition-colors"><TrashIcon /><span className="ml-1">Delete</span></button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="relative w-full md:w-auto md:max-w-xs">
                        <SearchIcon />
                        <input 
                            type="text"
                            placeholder="Search anything..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoComplete="off"
                            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white transition-all"
                        />
                    </div>
                </header>

                {searchTerm ? renderSearchResults() : (
                    <>
                    {activeProject ? (
                        <>
                            <div className="bg-slate-800/30 p-2 flex items-center space-x-2 flex-wrap gap-2 border-b border-slate-700/50">
                                {environments.map(env => (
                                    <button key={env.id} onClick={() => setActiveEnv(env)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeEnv?.id === env.id ? 'bg-sky-600 text-white shadow-md shadow-sky-900/50' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{env.name}</button>
                                ))}
                                <button onClick={() => setModal({ type: 'env', data: null })} className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors"><PlusIcon /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                                {activeEnv ? (
                                    <div>
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-slate-700 gap-4">
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="text-lg font-semibold text-white">{activeEnv.name} Environment</h3>
                                                    <button onClick={() => setModal({ type: 'env', data: activeEnv })} className="text-xs text-slate-400 hover:text-sky-400 transition-colors"><EditIcon /></button>
                                                    <button onClick={() => setConfirmDelete({ type: 'env', item: activeEnv })} className="text-xs text-red-500 hover:text-red-400 transition-colors"><TrashIcon /></button>
                                                </div>
                                                {activeEnv.url && <a href={activeEnv.url} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-400 hover:underline">{activeEnv.url}</a>}
                                            </div>
                                            <button onClick={() => setModal({ type: 'role', data: null })} className="flex-shrink-0 flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-500 transition-colors"><PlusIcon /> <span className="ml-2">Add Role</span></button>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {(roles[activeEnv.id] || []).map(role => (
                                                <div key={role.id} className="bg-slate-800 rounded-lg shadow-lg shadow-slate-950/20 p-4 border border-slate-700 flex flex-col">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-bold text-lg text-white">{role.name}</h4>
                                                            <button onClick={() => setModal({ type: 'role', data: role })} className="text-xs text-slate-400 hover:text-sky-400 transition-colors"><EditIcon /></button>
                                                            <button onClick={() => setConfirmDelete({ type: 'role', item: role })} className="text-xs text-red-500 hover:text-red-400 transition-colors"><TrashIcon /></button>
                                                        </div>
                                                        <button onClick={() => setModal({ type: 'cred', data: null, parentId: role.id })} className="ml-2 flex-shrink-0 flex items-center px-3 py-1 text-xs font-medium text-white bg-sky-600 rounded-md hover:bg-sky-500 transition-colors"><PlusIcon /> <span className="ml-1">Add Account</span></button>
                                                    </div>
                                                    <div className="space-y-3 flex-1">
                                                        {(credentials[role.id] || []).length > 0 ? (credentials[role.id] || []).map(cred => (
                                                            <div key={cred.id} className="bg-slate-700/50 rounded-md p-3 space-y-2">
                                                                <div className="flex items-center">
                                                                    <div className="flex-1 flex items-center bg-slate-800 rounded-md px-3 py-1 border border-slate-700">
                                                                        <span className="font-mono text-sm font-semibold flex-1 truncate text-white">{cred.username}</span>
                                                                        <div className="flex items-center space-x-1">
                                                                            <button onClick={() => handleCopy(cred.username, `${cred.id}-user`)} className="p-1 text-slate-400 hover:text-sky-400 transition-colors">{copied === `${cred.id}-user` ? <span className="text-xs text-green-400">Copied!</span> : <CopyIcon />}</button>
                                                                            <button onClick={() => setModal({ type: 'cred', data: cred, parentId: role.id })} className="p-1 text-slate-400 hover:text-sky-400 transition-colors"><EditIcon /></button>
                                                                            <button onClick={() => setConfirmDelete({ type: 'cred', item: { ...cred, roleId: role.id } })} className="p-1 text-slate-400 hover:text-red-400 transition-colors"><TrashIcon /></button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <div className="flex-1 flex items-center bg-slate-800 rounded-md px-3 py-1 border border-slate-700">
                                                                        <span className="font-mono text-sm flex-1">{showPassword[cred.id] ? cred.password : '••••••••••'}</span>
                                                                        <div className="flex items-center space-x-1">
                                                                            <button onClick={() => toggleShowPassword(cred.id)} className="p-1 text-slate-400 hover:text-sky-400 transition-colors"><EyeIcon off={!showPassword[cred.id]} /></button>
                                                                            <button onClick={() => handleCopy(cred.password, `${cred.id}-pass`)} className="p-1 text-slate-400 hover:text-sky-400 transition-colors">{copied === `${cred.id}-pass` ? <span className="text-xs text-green-400">Copied!</span> : <CopyIcon />}</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )) : <p className="text-sm text-slate-500 text-center py-4">No accounts for this role yet.</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : <div className="text-center py-12"><h3 className="text-lg font-medium text-slate-300">No Environment Selected</h3><p className="text-sm text-slate-500 mt-1">Create or select an environment to see its roles and credentials.</p></div>}
                            </div>
                        </>
                    ) : <div className="flex-1 flex flex-col justify-center items-center text-center p-8"><h2 className="text-2xl font-semibold text-white">Welcome!</h2><p className="mt-2 text-slate-400">Select a project from the sidebar or create a new one to begin.</p></div>}
                    </>
                )}
            </main>
        </div>
    );
}

export default App;