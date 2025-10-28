import { useState, useEffect } from 'react';
import { getUsers } from '../services/userService';

// User interface definition
interface User {
    id: string;
    name: string;
    phone: string;
    email: string;
    createdAt?: any;
    title?: string;
}

const AdminUsersPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [users, setUsers] = useState<User[]>([]); // Add type here
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // Add type here
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(30);

    // Asiri Health colors
    const PRIMARY_BLUE = '#0071bc';
    const LIGHT_BLUE = '#2ea7e0';
    const VERY_LIGHT_BLUE = '#b3e5ff';

    const ADMIN_PASSWORD = '2025';

    // Check if user is already authenticated
    useEffect(() => {
        const savedAuth = localStorage.getItem('adminAuthenticated');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
            loadUsers();
        } else {
            setLoading(false);
        }
    }, []);

    // Load users
    const loadUsers = async () => {
        try {
            setLoading(true);
            const result = await getUsers();

            if (result.success) {
                setUsers(result.data);
                setError(null);
            } else {
                setError('Failed to load users');
            }
        } catch (err) {
            setError('Error occurred while loading users');
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle login
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            localStorage.setItem('adminAuthenticated', 'true');
            loadUsers();
        } else {
            alert('Invalid password!');
            setPassword('');
        }
    };

    // Handle logout
    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('adminAuthenticated');
        setPassword('');
    };

    // Search filter
    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
    );

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Page numbers for pagination
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
        }
        return pageNumbers;
    };

    // Refresh button
    const handleRefresh = () => {
        loadUsers();
        setCurrentPage(1);
    };

    // Format phone number
    const formatPhone = (phone: string) => {
        if (!phone) return '';
        if (phone.startsWith('07') && phone.length === 10) {
            return `+94${phone.substring(1)}`;
        }
        return phone;
    };

    // Calculate serial number for each user (1,2,3,...)
    const getSerialNumber = (index: number) => {
        return (currentPage - 1) * usersPerPage + index + 1;
    };

    // Login Form
    if (!isAuthenticated) {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(180deg, ${PRIMARY_BLUE} 0%, ${LIGHT_BLUE} 50%, ${VERY_LIGHT_BLUE} 100%)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '40px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: PRIMARY_BLUE,
                            margin: '0 0 10px 0'
                        }}>
                            Admin Access
                        </h1>
                        <p style={{ color: '#666', margin: '0' }}>
                            Enter password to continue
                        </p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="password"
                                placeholder="Enter admin password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `1px solid #ddd`,
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = PRIMARY_BLUE}
                                onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#ddd'}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                borderRadius: '6px',
                                backgroundColor: PRIMARY_BLUE,
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = LIGHT_BLUE}
                            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = PRIMARY_BLUE}
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                fontSize: '18px',
                color: PRIMARY_BLUE
            }}>
                Loading users...
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: `linear-gradient(180deg, ${PRIMARY_BLUE} 0%, ${LIGHT_BLUE} 50%, ${VERY_LIGHT_BLUE} 100%)`,
            padding: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: PRIMARY_BLUE,
                            margin: '0'
                        }}>
                            Users Management
                        </h1>
                        <p style={{ color: '#666', margin: '4px 0 0 0' }}>
                            Manage all registered users
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* Search Input */}
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                style={{
                                    padding: '8px 12px 8px 36px',
                                    border: `1px solid #ddd`,
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    width: '250px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = PRIMARY_BLUE}
                                onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#ddd'}
                            />
                            <span style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#999'
                            }}>
                                🔍
                            </span>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '6px',
                                backgroundColor: PRIMARY_BLUE,
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = LIGHT_BLUE}
                            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = PRIMARY_BLUE}
                        >
                            <span>🔄</span>
                            Refresh
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                border: `1px solid ${PRIMARY_BLUE}`,
                                borderRadius: '6px',
                                backgroundColor: 'transparent',
                                color: PRIMARY_BLUE,
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = PRIMARY_BLUE;
                                (e.target as HTMLButtonElement).style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                                (e.target as HTMLButtonElement).style.color = PRIMARY_BLUE;
                            }}
                        >
                            <span>🚪</span>
                            Logout
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        backgroundColor: '#fee',
                        border: '1px solid #fcc',
                        color: '#c33',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>{error}</span>
                        <button
                            onClick={() => setError(null)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#c33',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Users Table */}
                <div style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '20px'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '14px',
                            minWidth: '600px'
                        }}>
                            <thead>
                            <tr style={{
                                backgroundColor: '#f8f9fa',
                                borderBottom: '2px solid #e0e0e0'
                            }}>
                                <th style={{
                                    padding: '12px 16px',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    color: PRIMARY_BLUE,
                                    borderRight: '1px solid #e0e0e0',
                                    width: '80px'
                                }}>
                                    No.
                                </th>
                                <th style={{
                                    padding: '12px 16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: PRIMARY_BLUE,
                                    borderRight: '1px solid #e0e0e0',
                                    width: '250px'
                                }}>
                                    Name
                                </th>
                                <th style={{
                                    padding: '12px 16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: PRIMARY_BLUE,
                                    borderRight: '1px solid #e0e0e0',
                                    width: '150px'
                                }}>
                                    Phone
                                </th>
                                <th style={{
                                    padding: '12px 16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: PRIMARY_BLUE,
                                    borderRight: '1px solid #e0e0e0',
                                    width: '250px'
                                }}>
                                    Email
                                </th>
                                <th style={{
                                    padding: '12px 16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: PRIMARY_BLUE,
                                    width: '120px'
                                }}>
                                    Registered Date
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentUsers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        style={{
                                            padding: '40px',
                                            textAlign: 'center',
                                            color: '#666',
                                            fontSize: '16px'
                                        }}
                                    >
                                        {searchTerm ? 'No users found matching your search' : 'No users registered yet'}
                                    </td>
                                </tr>
                            ) : (
                                currentUsers.map((user, index) => (
                                    <tr
                                        key={user.id}
                                        style={{
                                            backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa',
                                            borderBottom: '1px solid #e0e0e0',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f0f7ff';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#fafafa';
                                        }}
                                    >
                                        <td style={{
                                            padding: '12px 16px',
                                            borderRight: '1px solid #e0e0e0',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            color: PRIMARY_BLUE
                                        }}>
                                            {getSerialNumber(index)}
                                        </td>
                                        <td style={{
                                            padding: '12px 16px',
                                            borderRight: '1px solid #e0e0e0',
                                            fontWeight: '500'
                                        }}>
                                            {user.name || 'N/A'}
                                        </td>
                                        <td style={{
                                            padding: '12px 16px',
                                            borderRight: '1px solid #e0e0e0',
                                            fontFamily: 'monospace'
                                        }}>
                                            {formatPhone(user.phone) || 'N/A'}
                                        </td>
                                        <td style={{
                                            padding: '12px 16px',
                                            borderRight: '1px solid #e0e0e0'
                                        }}>
                                            {user.email || 'N/A'}
                                        </td>
                                        <td style={{
                                            padding: '12px 16px',
                                            color: '#666',
                                            fontSize: '13px'
                                        }}>
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '20px',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            style={{
                                padding: '8px 12px',
                                border: `1px solid ${PRIMARY_BLUE}`,
                                borderRadius: '4px',
                                backgroundColor: currentPage === 1 ? '#f8f9fa' : 'white',
                                color: currentPage === 1 ? '#6c757d' : PRIMARY_BLUE,
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            First
                        </button>

                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '8px 12px',
                                border: `1px solid ${PRIMARY_BLUE}`,
                                borderRadius: '4px',
                                backgroundColor: currentPage === 1 ? '#f8f9fa' : 'white',
                                color: currentPage === 1 ? '#6c757d' : PRIMARY_BLUE,
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Previous
                        </button>

                        {getPageNumbers().map(number => (
                            <button
                                key={number}
                                onClick={() => setCurrentPage(number)}
                                style={{
                                    padding: '8px 12px',
                                    border: `1px solid ${PRIMARY_BLUE}`,
                                    borderRadius: '4px',
                                    backgroundColor: currentPage === number ? PRIMARY_BLUE : 'white',
                                    color: currentPage === number ? 'white' : PRIMARY_BLUE,
                                    cursor: 'pointer',
                                    fontWeight: currentPage === number ? 'bold' : 'normal',
                                    fontSize: '14px',
                                    minWidth: '40px'
                                }}
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '8px 12px',
                                border: `1px solid ${PRIMARY_BLUE}`,
                                borderRadius: '4px',
                                backgroundColor: currentPage === totalPages ? '#f8f9fa' : 'white',
                                color: currentPage === totalPages ? '#6c757d' : PRIMARY_BLUE,
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Next
                        </button>

                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '8px 12px',
                                border: `1px solid ${PRIMARY_BLUE}`,
                                borderRadius: '4px',
                                backgroundColor: currentPage === totalPages ? '#f8f9fa' : 'white',
                                color: currentPage === totalPages ? '#6c757d' : PRIMARY_BLUE,
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Last
                        </button>
                    </div>
                )}

                {/* Footer Stats */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    color: '#666',
                    fontSize: '14px',
                    borderTop: '1px solid #e0e0e0',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div>
                        Showing <strong>{currentUsers.length}</strong> users on page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                        {searchTerm ? (
                            <span> (Filtered from <strong>{users.length}</strong> total users)</span>
                        ) : (
                            <span> (Total: <strong>{users.length}</strong> users)</span>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span>
                            Users per page: <strong>30</strong>
                        </span>
                    <button
                        onClick={() => {
                            const csvContent = [
                                ['No.', 'Name', 'Phone', 'Email', 'Registered Date'],
                                ...filteredUsers.map((user, index) => [
                                    index + 1,
                                    user.name || '',
                                    formatPhone(user.phone) || '',
                                    user.email || '',
                                    user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''
                                ])
                            ].map(row => row.join(',')).join('\n');

                            const blob = new Blob([csvContent], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
                            a.click();
                            window.URL.revokeObjectURL(url);
                        }}
                        style={{
                            padding: '8px 16px',
                            border: `1px solid ${PRIMARY_BLUE}`,
                            borderRadius: '4px',
                            backgroundColor: 'transparent',
                            color: PRIMARY_BLUE,
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        📊 Export to CSV
                    </button>
                </div>
            </div>
        </div>
</div>
);
};

export default AdminUsersPage;