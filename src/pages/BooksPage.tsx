import {useEffect, useState} from 'react';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Filter,
    Book
} from 'lucide-react';
import {addBook, deleteBook, getBooks, updateBook} from "../services/bookService.ts";
import type {BookFormData} from "../types/Book.ts";

interface Book {
    _id: string;
    name: string;
    title: string;
    author: string;
    publicationYear: number;
    totalCopies: number;
    availableCopies: number;
    status: 'available' | 'unavailable' | 'restricted';
}

const BookManagePage = () => {
    const [books, setBooks] = useState<Book[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await getBooks();
            setBooks(response);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const [formData, setFormData] = useState({
        name: '',
        title: '',
        author: '',
        publicationYear: new Date().getFullYear(),
        totalCopies: 1,
        availableCopies: 1,
        status: 'available' as 'available' | 'unavailable' | 'restricted'
    });

    const filteredBooks = books.filter(book => {
        const matchesSearch =
            book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.publicationYear.toString().includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || book.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleSubmit = async () => {
        if (!formData.name || !formData.title || !formData.author) {
            alert('Please fill in all required fields');
            return;
        }

        if (editingBook) {
            await updateBook(editingBook._id, formData);
            fetchBooks();
        } else {
            const newBook: BookFormData = {
                ...formData,
            };
            console.log(newBook);
            const newBook1 = await addBook(newBook);
            //fetchBooks();
            setBooks([...books, newBook1]);
        }

        setFormData({
            name: '',
            title: '',
            author: '',
            publicationYear: new Date().getFullYear(),
            totalCopies: 1,
            availableCopies: 1,
            status: 'available'
        });
        setShowModal(false);
        setEditingBook(null);
    };

    const handleEdit = (book: Book) => {
        setEditingBook(book);
        setFormData({
            name: book.name,
            title: book.title,
            author: book.author,
            publicationYear: book.publicationYear,
            totalCopies: book.totalCopies,
            availableCopies: book.availableCopies,
            status: book.status
        });
        setShowModal(true);
    };

    const handleDelete =async (bookId: string) => {
            try {
                await deleteBook(bookId);
                fetchBooks();
            } catch (error) {
                console.error('Error deleting book:', error);
            }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            available: 'bg-green-100 text-green-800',
            unavailable: 'bg-red-100 text-red-800',
            restricted: 'bg-yellow-100 text-yellow-800'
        };
        return colors[status as keyof typeof colors] || colors.available;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex items-center gap-3 mb-6">
                <Book className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Book Management</h1>
            </div>

            {/* Action Bar */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search books..."
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
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                            <option value="restricted">Restricted</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Book
                </button>
            </div>

            {/* Books Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Book Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Author & Year
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Copies
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
                        {filteredBooks.map((book) => (
                            <tr key={book._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {book.name}
                                        </div>
                                        <div className="text-sm text-gray-500">{book.title}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{book.author}</div>
                                    <div className="text-sm text-gray-500">{book.publicationYear}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        Available: <span className="font-medium">{book.availableCopies}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Total: {book.totalCopies}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                                                book.status
                                            )}`}
                                        >
                                            {book.status}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                    <button
                                        onClick={() => handleEdit(book)}
                                        className="text-blue-600 hover:text-blue-900"
                                        aria-label="Edit"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(book._id)}
                                        className="text-red-600 hover:text-red-900"
                                        aria-label="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Add/Edit Book */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editingBook ? 'Edit Book' : 'Add New Book'}</h2>

                        <div className="space-y-4">
                            <input
                                required
                                type="text"
                                placeholder="Book Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <input
                                required
                                type="text"
                                placeholder="Book Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <input
                                required
                                type="text"
                                placeholder="Author"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <input
                                required
                                type="number"
                                placeholder="Publication Year"
                                value={formData.publicationYear}
                                onChange={(e) => setFormData({ ...formData, publicationYear: parseInt(e.target.value) || new Date().getFullYear() })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="1000"
                                max={new Date().getFullYear() + 10}
                            />

                            <div className="flex gap-4">
                                <input
                                    required
                                    type="number"
                                    placeholder="Total Copies"
                                    value={formData.totalCopies}
                                    onChange={(e) => {
                                        const total = parseInt(e.target.value) || 1;
                                        setFormData({
                                            ...formData,
                                            totalCopies: total,
                                            availableCopies: Math.min(formData.availableCopies, total)
                                        });
                                    }}
                                    className="w-1/2 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                />
                                <input
                                    required
                                    type="number"
                                    placeholder="Available Copies"
                                    value={formData.availableCopies}
                                    onChange={(e) => setFormData({ ...formData, availableCopies: parseInt(e.target.value) || 0 })}
                                    className="w-1/2 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    max={formData.totalCopies}
                                />
                            </div>

                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        status: e.target.value as 'available' | 'unavailable' | 'restricted',
                                    })
                                }
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                                <option value="restricted">Restricted</option>
                            </select>

                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingBook(null);
                                        setFormData({
                                            name: '',
                                            title: '',
                                            author: '',
                                            publicationYear: new Date().getFullYear(),
                                            totalCopies: 1,
                                            availableCopies: 1,
                                            status: 'available'
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
                                    {editingBook ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookManagePage;