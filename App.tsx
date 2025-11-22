import React, { useState } from 'react';
import { icons, MOCK_USERS, INITIAL_REQUESTS } from './constants';
import { Icon, Card, Button, Badge, Modal } from './components/Shared';
import { AnalyticsView } from './components/DashboardAnalytics';
import { QuoteRequestsTable, QuoteRequestForm, QuoteComparisonView, BrokerStats } from './components/BrokerPortal';
import { UnderwriterDashboard, InsurerQuotesView } from './components/InsurerPortal';
import { Request, InsurerStatus } from './types';

const Sidebar = ({ currentUser, onLogout, activeView, onNavigate }: any) => {
    const brokerNav = [
        { name: 'Dashboard', icon: icons.dashboard, roles: ['Sales RM', 'Team Member', 'Zonal Head', 'NSM', 'Admin'] },
        { name: 'All Quotes', icon: icons.quotes, roles: ['Zonal Head', 'NSM', 'Admin'] },
        { name: 'User Management', icon: icons.users, roles: ['Admin'] },
        { name: 'Analytics', icon: icons.analytics, roles: ['Zonal Head', 'NSM', 'Admin', 'Sales RM'] },
    ];
    const insurerNav = [
        { name: 'Dashboard', icon: icons.dashboard, roles: ['Underwriter', 'Insurer Sales RM'] },
        { name: 'My Quotes', icon: icons.quotes, roles: ['Underwriter', 'Insurer Sales RM'] },
        { name: 'Analytics', icon: icons.analytics, roles: ['Insurer Sales RM'] },
    ];

    const navItems = currentUser.entity === 'Broker' ? brokerNav : insurerNav;

    return (
        <div className="w-64 bg-gray-800 text-white flex flex-col hidden md:flex">
            <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-gray-700">
                InsureFlow
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
                {navItems.filter(item => item.roles.includes(currentUser.role)).map(item => {
                    const isActive = activeView === item.name;
                    return (
                        <button 
                            key={item.name} 
                            onClick={() => onNavigate(item.name)}
                            className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                        >
                            <Icon path={item.icon} className="w-6 h-6 mr-3" />
                            {item.name}
                        </button>
                    )
                })}
            </nav>
            <div className="px-2 py-4 border-t border-gray-700">
                <button onClick={onLogout} className="w-full flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
                    <Icon path={icons.logout} className="w-6 h-6 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};

const Header = ({ currentUser }: any) => (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 border-b border-gray-200">
        <div className="flex items-center">
             <h1 className="text-lg font-semibold text-gray-800">Quote Management</h1>
        </div>
        <div className="flex items-center space-x-4">
            <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role} • {currentUser.entity}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {currentUser.name.charAt(0)}
            </div>
        </div>
    </header>
);

const UserManagementView = () => (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <Card>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {Object.values(MOCK_USERS).map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.brokerage || user.insurer || user.entity}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge color={user.status === 'Active' ? 'green' : 'red'}>{user.status}</Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                                    <button className="text-red-600 hover:text-red-900">Deactivate</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
);

const DashboardContent = ({ currentUser, requests, onSelectRequest, onAddRequest, onQuoteSubmit, onQuoteReject, onQuoteAccept, onQuoteQuery }: any) => {
    switch(currentUser.role) {
        case 'Sales RM':
        case 'Team Member':
        case 'Zonal Head':
        case 'NSM':
        case 'Admin': 
            const brokerRequests = {
                'Sales RM': requests.filter((r: Request) => r.creatorId === currentUser.id),
                'Team Member': requests.filter((r: Request) => r.creatorId === currentUser.assignedRm),
                'Zonal Head': requests.filter((r: Request) => r.zone === currentUser.zone),
                'NSM': requests,
                'Admin': requests,
            }[currentUser.role as string] || requests;

            const showAddButton = ['Sales RM', 'Team Member'].includes(currentUser.role);
            
            const title = {
                'Sales RM': 'My Quote Requests',
                'Team Member': 'My Team\'s Requests',
                'Zonal Head': `Quote Requests - ${currentUser.zone} Zone`,
                'NSM': 'All Quote Requests (National View)',
                'Admin': 'All System Requests',
            }[currentUser.role as string] || 'Dashboard';

            return (
                <div className="space-y-6 animate-fade-in">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage and track all your commercial insurance quotes.</p>
                        </div>
                        {showAddButton && (
                            <Button onClick={onAddRequest} className="flex items-center gap-2 shadow-md">
                                <Icon path={icons.add} className="w-5 h-5" />
                                New Request
                            </Button>
                        )}
                     </div>
                     
                     <BrokerStats requests={brokerRequests} />

                     <Card>
                        <QuoteRequestsTable requests={brokerRequests} onSelectRequest={onSelectRequest} currentUser={currentUser} />
                     </Card>
                  </div>
            )
        case 'Underwriter':
        case 'Insurer Sales RM':
            return <UnderwriterDashboard currentUser={currentUser} requests={requests} onSelectRequest={onSelectRequest} onQuoteSubmit={onQuoteSubmit} onQuoteReject={onQuoteReject} onQuoteAccept={onQuoteAccept} onQuoteQuery={onQuoteQuery} />;
        default:
            return <div>Dashboard not available for this role.</div>;
    }
};

const LoginScreen = ({ onLogin }: any) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const userEntry = Object.values(MOCK_USERS).find((u: any) => u.username === username);
        
        if (userEntry) {
            if (password === 'Pass@123' || password === '631819') {
                onLogin(userEntry);
            } else {
                setError('Invalid credentials. Please use default password or OTP.');
            }
        } else {
            setError('User not found. Please check your login ID.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-800 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-blue-600 p-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-1">InsureFlow</h2>
                    <p className="text-blue-100 text-sm">Commercial Quote Management System</p>
                </div>
                <div className="p-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Login to Portal</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Login ID / Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Icon path={icons.users} className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                                    placeholder="Enter your username" 
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password / OTP</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Icon path={icons.lock} className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                                    placeholder="Pass@123 or 631819" 
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded">
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-colors"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs text-gray-600">
                        <p className="font-semibold mb-2 text-gray-800">Demo Credentials:</p>
                        <ul className="space-y-1 list-disc pl-4">
                            <li>Broker Admin: <span className="font-mono font-bold">admin</span></li>
                            <li>Sales RM: <span className="font-mono font-bold">ravi</span></li>
                            <li>Underwriter: <span className="font-mono font-bold">john</span></li>
                            <li className="mt-2">Password: <span className="font-mono font-bold">Pass@123</span> OR OTP: <span className="font-mono font-bold">631819</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MainLayout = ({ currentUser, onLogout, requests, onAddRequest, onQuoteSubmit, onQuoteReject, onQuoteAccept, onQuoteQuery, onQueryResolve, activeView, onNavigate }: any) => {
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

    const handleSelectRequest = (request: Request) => setSelectedRequest(request);
    const handleCloseDetails = () => setSelectedRequest(null);
    
    const renderContent = () => {
        if(selectedRequest) {
            return <QuoteComparisonView 
                        request={selectedRequest} 
                        onClose={handleCloseDetails} 
                        currentUser={currentUser} 
                        onQueryResolve={onQueryResolve}
                    />
        }

        switch(activeView) {
            case 'Dashboard':
                return <DashboardContent 
                            currentUser={currentUser} 
                            requests={requests} 
                            onSelectRequest={handleSelectRequest} 
                            onAddRequest={() => setIsNewRequestModalOpen(true)}
                            onQuoteSubmit={onQuoteSubmit}
                            onQuoteReject={onQuoteReject}
                            onQuoteAccept={onQuoteAccept}
                            onQuoteQuery={onQuoteQuery}
                        />;
            case 'My Quotes':
            case 'All Quotes':
                if (currentUser.entity === 'Insurer') {
                     return <InsurerQuotesView currentUser={currentUser} requests={requests} onSelectRequest={handleSelectRequest} />;
                }
                 return (
                    <div className="space-y-6 animate-fade-in">
                        <h1 className="text-2xl font-bold text-gray-800">All Quotes</h1>
                        <BrokerStats requests={requests} />
                        <Card><QuoteRequestsTable requests={requests} onSelectRequest={handleSelectRequest} currentUser={currentUser} /></Card>
                    </div>
                );
            case 'User Management':
                return <UserManagementView />;
            case 'Analytics':
                return <AnalyticsView requests={requests} currentUser={currentUser} />;
            default:
                return <div className="p-6">View not found</div>;
        }
    }
    
    return (
        <div className="h-screen w-full flex bg-gray-100 font-sans text-gray-900">
             <Modal isOpen={isNewRequestModalOpen} onClose={() => setIsNewRequestModalOpen(false)} title="New Quote Request">
                <QuoteRequestForm onClose={() => setIsNewRequestModalOpen(false)} onAddRequest={onAddRequest} currentUser={currentUser} />
            </Modal>
            <Sidebar currentUser={currentUser} onLogout={onLogout} activeView={activeView} onNavigate={onNavigate} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header currentUser={currentUser} />
                <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [quoteRequests, setQuoteRequests] = useState<Request[]>(INITIAL_REQUESTS);
    const [activeView, setActiveView] = useState('Dashboard');

    const handleLogin = (user: any) => {
        setCurrentUser(user);
        setActiveView('Dashboard'); // Reset to dashboard on login
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };
    
    const addRequest = (newRequest: Request) => {
        setQuoteRequests(prev => [newRequest, ...prev]);
    };
    
    const updateInsurerStatus = (requestId: string, insurerName: string, updates: Partial<InsurerStatus>) => {
        setQuoteRequests(prev => prev.map(req => {
            if (req.id !== requestId) return req;

            const updatedInsurers = req.insurers.map(insurer => {
                if (insurer.name !== insurerName) return insurer;
                return { ...insurer, ...updates };
            });
            
            const anyPending = updatedInsurers.some(i => i.status === 'Pending');
            const anyAccepted = updatedInsurers.some(i => i.status === 'Accepted');
            const allResponded = updatedInsurers.every(i => i.status === 'Quoted' || i.status === 'Rejected');
            
            let newStatus = req.status;
            if (allResponded) {
                newStatus = 'Quotes Received';
            } else if (anyPending || anyAccepted) {
                newStatus = 'Awaiting Quotes';
            }

            return { ...req, insurers: updatedInsurers, status: newStatus };
        }));
    };

    const handleQuoteAccept = (requestId: string, insurerName: string) => {
        updateInsurerStatus(requestId, insurerName, { status: 'Accepted' });
    };

    const handleQuoteSubmit = (requestId: string, insurerName: string, quoteDetails: any) => {
        updateInsurerStatus(requestId, insurerName, { 
            status: 'Quoted', 
            quote: quoteDetails, 
            submittedAt: new Date().toISOString() 
        });
    };
    
    const handleQuoteReject = (requestId: string, insurerName: string, reason: string) => {
        updateInsurerStatus(requestId, insurerName, {
            status: 'Rejected',
            reason: reason,
            quote: null,
            submittedAt: new Date().toISOString()
        });
    };

    const handleQuoteQuery = (requestId: string, insurerName: string, query: string, attachment: any) => {
        updateInsurerStatus(requestId, insurerName, {
            status: 'Query Raised',
            query: query,
            queryAttachment: attachment
        });
    };
    
    const handleQueryResolve = (requestId: string, insurerName: string, responseText: string, attachment: any) => {
        updateInsurerStatus(requestId, insurerName, {
            status: 'Accepted', // Move back to accepted so they can quote
            resolution: {
                text: responseText,
                attachment: attachment,
                resolvedAt: new Date().toISOString()
            }
        });
    };


    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return <MainLayout 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        requests={quoteRequests}
        onAddRequest={addRequest}
        onQuoteSubmit={handleQuoteSubmit}
        onQuoteReject={handleQuoteReject}
        onQuoteAccept={handleQuoteAccept}
        onQuoteQuery={handleQuoteQuery}
        onQueryResolve={handleQueryResolve}
        activeView={activeView}
        onNavigate={setActiveView}
    />;
}

export default App;