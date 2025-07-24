import React, {useEffect, useState} from 'react';
import {

    Search,
    Plus,
    Edit2,
    Trash2,
    Filter
} from 'lucide-react';
import {addReader, deleteReader, getAllReaders, updateReader} from "../services/readerService.ts";

interface Reader {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    status: 'active' | 'inactive' | 'suspended';
}

const ReaderManagePage = () => {
    const [readers, setReaders] = useState<Reader[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingReader, setEditingReader] = useState<Reader | null>(null);

    useEffect(() => {
        fetchReaders();
    }, []);

    const fetchReaders = async () => {
        try {
            const response = await getAllReaders();
            setReaders(response);
        } catch (error) {
            console.error('Error fetching readers:', error);
        }
    };

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        status: 'active' as 'active' | 'inactive' | 'suspended'
    });

    const filteredReaders = readers.filter(reader => {
        const matchesSearch =
            reader.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reader.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reader.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reader.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reader.address.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || reader.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingReader) {
          await updateReader(editingReader._id, formData);
          fetchReaders();
        } else {
           const newReader = await addReader(formData);
           fetchReaders();
           setReaders([...readers, newReader]);
        }

        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            status: 'active'
        });
        setShowModal(false);
        setEditingReader(null);
    };

    const handleEdit = (reader: Reader) => {
        setEditingReader(reader);
        setFormData({
            firstName: reader.firstName,
            lastName: reader.lastName,
            email: reader.email,
            phone: reader.phone,
            address: reader.address,
            status: reader.status
        });
        setShowModal(true);
    };

    const handleDelete = async (readerId: string) => {
        if (window.confirm('Are you sure you want to delete this reader?')) {
            await deleteReader(readerId);
            fetchReaders();
        }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            suspended: 'bg-red-100 text-red-800'
        };
        return colors[status as keyof typeof colors] || colors.active;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Reader Management</h1>

            {/* Action Bar */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search readers..."
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
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Reader
                </button>
            </div>

            {/* Readers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reader
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
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
                        {filteredReaders.map((reader) => (
                            <tr key={reader._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {reader.firstName} {reader.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">{reader.address}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{reader.email}</div>
                                    <div className="text-sm text-gray-500">{reader.phone}</div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                                                reader.status
                                            )}`}
                                        >
                                            {reader.status}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                    <button
                                        onClick={() => handleEdit(reader)}
                                        className="text-blue-600 hover:text-blue-900"
                                        aria-label="Edit"
                                    >
                                        <Edit2 />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(reader._id)}
                                        className="text-red-600 hover:text-red-900"
                                        aria-label="Delete"
                                    >
                                        <Trash2 />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Add/Edit Reader */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
                        <h2 className="text-xl font-bold mb-4">{editingReader ? 'Edit Reader' : 'Add New Reader'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex gap-4">
                                <input
                                    required
                                    type="text"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-1/2 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    required
                                    type="text"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-1/2 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <input
                                required
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                required
                                type="text"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                required
                                type="text"
                                placeholder="Address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        status: e.target.value as 'active' | 'inactive' | 'suspended',
                                    })
                                }
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>

                            <div className="flex justify-end gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingReader(null);
                                        setFormData({
                                            firstName: '',
                                            lastName: '',
                                            email: '',
                                            phone: '',
                                            address: '',
                                            status: 'active',
                                        });
                                    }}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    {editingReader ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReaderManagePage;
