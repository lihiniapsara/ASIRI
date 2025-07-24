import { useState } from 'react';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Filter,
    BookOpen,
    Calendar,
    User,
    AlertCircle
} from 'lucide-react';

interface Lending {
    _id: string;
    bookID: string;
    userId: string;
    lendingDate: string;
    returnDate: string;
    status: 'active' | 'returned' | 'overdue';
    bookName?: string;
    userName?: string;
}

const LendingNotify = () => {
    // Sample data with book and user names for display
    const [lendings, setLendings] = useState<Lending[]>([
        {
            _id: '1',
            bookID: 'BK001',
            userId: 'BC001',
            lendingDate: '2024-07-15',
            returnDate: '2024-07-29',
            status: 'active',
            bookName: 'Pride and Prejudice',
            userName: 'Kasun Perera'
        },
        {
            _id: '2',
            bookID: 'BK002',
            userId: 'BC002',
            lendingDate: '2024-07-10',
            returnDate: '2024-07-24',
            status: 'overdue',
            bookName: 'To Kill a Mockingbird',
            userName: 'Nimal Silva'
        },
        {
            _id: '3',
            bookID: 'BK003',
            userId: 'BC003',
            lendingDate: '2024-07-01',
            returnDate: '2024-07-15',
            status: 'returned',
            bookName: '1984',
            userName: 'Saman Fernando'
        },
        {
            _id: '4',
            bookID: 'BK001',
            userId: 'BC002',
            lendingDate: '2024-06-20',
            returnDate: '2024-07-04',
            status: 'returned',
            bookName: 'Pride and Prejudice',
            userName: 'Nimal Silva'
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingLending, setEditingLending] = useState<Lending | null>(null);

    const [formData, setFormData] = useState({
        bookID: '',
        userId: '',
        lendingDate: new Date().toISOString().split('T')[0],
        returnDate: '',
        status: 'active' as 'active' | 'returned' | 'overdue'
    });

    // Calculate default return date (2 weeks from lending date)
    const calculateReturnDate = (lendingDate: string) => {
        const date = new Date(lendingDate);
        date.setDate(date.getDate() + 14);
        return date.toISOString().split('T')[0];
    };

    const filteredLendings = lendings.filter(lending => {
        const matchesSearch =
            lending.bookID.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lending.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lending.bookName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lending.userName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || lending.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleSubmit = () => {
        if (!formData.bookID || !formData.userId || !formData.lendingDate || !formData.returnDate) {
            alert('Please fill in all required fields');
            return;
        }

        if (editingLending) {
            setLendings(lendings.map(lending =>
                lending._id === editingLending._id
                    ? { ...lending, ...formData }
                    : lending
            ));
        } else {
            const newLending: Lending = {
                _id: Date.now().toString(),
                ...formData,
                bookName: `Book ${formData.bookID}`, // In real app, fetch from books table
                userName: `User ${formData.userId}` // In real app, fetch from users table
            };
            setLendings([...lendings, newLending]);
        }

        setFormData({
            bookID: '',
            userId: '',
            lendingDate: new Date().toISOString().split('T')[0],
            returnDate: '',
            status: 'active'
        });
        setShowModal(false);
        setEditingLending(null);
    };

    const handleEdit = (lending: Lending) => {
        setEditingLending(lending);
        setFormData({
            bookID: lending.bookID,
            userId: lending.userId,
            lendingDate: lending.lendingDate,
            returnDate: lending.returnDate,
            status: lending.status
        });
        setShowModal(true);
    };

    const handleDelete = (lendingId: string) => {
        if (window.confirm('Are you sure you want to delete this lending record?')) {
            setLendings(lendings.filter(lending => lending._id !== lendingId));
        }
    };

    const handleReturn = (lendingId: string) => {
        setLendings(lendings.map(lending =>
            lending._id === lendingId
                ? { ...lending, status: 'returned' as 'returned', returnDate: new Date().toISOString().split('T')[0] }
                : lending
        ));
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            active: 'bg-blue-100 text-blue-800',
            returned: 'bg-green-100 text-green-800',
            overdue: 'bg-red-100 text-red-800'
        };
        return colors[status as keyof typeof colors] || colors.active;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <BookOpen className="h-4 w-4" />;
            case 'returned':
                return <Calendar className="h-4 w-4" />;
            case 'overdue':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <BookOpen className="h-4 w-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Book Lending Management</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <BookOpen className="h-8 w-8 text-blue-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Active Loans</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {lendings.filter(l => l.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-green-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Returned</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {lendings.filter(l => l.status === 'returned').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Overdue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {lendings.filter(l => l.status === 'overdue').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <User className="h-8 w-8 text-purple-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Records</p>
                            <p className="text-2xl font-bold text-gray-900">{lendings.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search by book ID, user ID, or names..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="returned">Returned</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Lending
                </button>
            </div>

            {/* Lendings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Book & User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Lending Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Return Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLendings.map((lending) => (
                            <tr key={lending._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            📚 {lending.bookName} ({lending.bookID})
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            👤 {lending.userName} ({lending.userId})
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{lending.lendingDate}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{lending.returnDate}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                                            lending.status
                                        )}`}
                                    >
                                        {getStatusIcon(lending.status)}
                                        {lending.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(lending)}
                                            className="text-blue-600 hover:text-blue-900"
                                            aria-label="Edit"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        {lending.status === 'active' && (
                                            <button
                                                onClick={() => handleReturn(lending._id)}
                                                className="text-green-600 hover:text-green-900"
                                                aria-label="Mark as Returned"
                                                title="Mark as Returned"
                                            >
                                                <Calendar className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(lending._id)}
                                            className="text-red-600 hover:text-red-900"
                                            aria-label="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Add/Edit Lending */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
                        <h2 className="text-xl font-bold mb-4">{editingLending ? 'Edit Lending' : 'New Book Lending'}</h2>

                        <div className="space-y-4">
                            <input
                                required
                                type="text"
                                placeholder="Book ID (e.g., BK001)"
                                value={formData.bookID}
                                onChange={(e) => setFormData({ ...formData, bookID: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <input
                                required
                                type="text"
                                placeholder="User ID (e.g., BC001)"
                                value={formData.userId}
                                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lending Date
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.lendingDate}
                                        onChange={(e) => {
                                            const newLendingDate = e.target.value;
                                            setFormData({
                                                ...formData,
                                                lendingDate: newLendingDate,
                                                returnDate: calculateReturnDate(newLendingDate)
                                            });
                                        }}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Return Date
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.returnDate}
                                        onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        status: e.target.value as 'active' | 'returned' | 'overdue',
                                    })
                                }
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="active">Active</option>
                                <option value="returned">Returned</option>
                                <option value="overdue">Overdue</option>
                            </select>

                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingLending(null);
                                        setFormData({
                                            bookID: '',
                                            userId: '',
                                            lendingDate: new Date().toISOString().split('T')[0],
                                            returnDate: '',
                                            status: 'active'
                                        });
                                    }}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    {editingLending ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LendingNotify;