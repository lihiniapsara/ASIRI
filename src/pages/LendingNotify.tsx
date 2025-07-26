import { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Filter,
    BookOpen,
    Calendar,
    AlertCircle,
    Bell,
    X,
    Clock,
    AlertTriangle,
    Mail,
    Send,
    CheckCircle,
    Loader
} from 'lucide-react';
import {getBooks} from "../services/bookService.ts";
import {getAllReaders} from "../services/readerService.ts";
import type {Book} from "../types/Book.ts";
import type {Reader} from "../types/Reader.ts";
import type {Lending} from "../types/Lending.ts";
import {addLending} from "../services/lendingService.ts";


interface Notification {
    id: string;
    type: 'overdue' | 'due_soon';
    lending: Lending;
    daysOverdue?: number;
    daysDue?: number;
}

interface EmailTemplate {
    type: 'reminder' | 'overdue' | 'return_confirmation' | 'custom';
    subject: string;
    body: string;
}

const LendingManagePage = () => {
    // Sample data with email addresses
    const [lendings, setLendings] = useState<Lending[]>([
        {
            _id: '1',
            bookID: 'BK001',
            userID: 'BC001',
            lendingDate: '2024-07-15',
            returnDate: '2024-07-29',
            status: 'active',
            bookName: 'Pride and Prejudice',
            userName: 'Kasun Perera',
            userEmail: 'kasun.perera@gmail.com'
        },
        {
            _id: '2',
            bookID: 'BK002',
            userID: 'BC002',
            lendingDate: '2024-07-10',
            returnDate: '2024-07-20',
            status: 'overdue',
            bookName: 'To Kill a Mockingbird',
            userName: 'Nimal Silva',
            userEmail: 'nimal.silva@yahoo.com'
        },
        {
            _id: '3',
            bookID: 'BK003',
            userID: 'BC003',
            lendingDate: '2024-07-01',
            returnDate: '2024-07-15',
            status: 'returned',
            bookName: '1984',
            userName: 'Saman Fernando',
            userEmail: 'saman.fernando@hotmail.com'
        },
        {
            _id: '4',
            bookID: 'BK001',
            userID: 'BC002',
            lendingDate: '2024-06-20',
            returnDate: '2024-07-04',
            status: 'returned',
            bookName: 'Pride and Prejudice',
            userName: 'Nimal Silva',
            userEmail: 'nimal.silva@yahoo.com'
        },
        {
            _id: '5',
            bookID: 'BK004',
            userID: 'BC004',
            lendingDate: '2024-07-20',
            returnDate: '2024-07-25',
            status: 'active',
            bookName: 'The Great Gatsby',
            userName: 'Amara Jayasinghe',
            userEmail: 'amara.jayasinghe@outlook.com'
        }
    ]);

    const [books, setBooks] = useState<Book[]>([]);
    const [readers, setReaders] = useState<Reader[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingLending, setEditingLending] = useState<Lending | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Email system state
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedLending, setSelectedLending] = useState<Lending | null>(null);
    const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>({
        type: 'reminder',
        subject: '',
        body: ''
    });
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        bookID: '',
        userID: '',
        lendingDate: new Date().toISOString().split('T')[0],
        returnDate: '',
        status: 'active' as 'active' | 'returned' | 'overdue',
        userEmail: '',
        userName: '',
        bookName: ''
    });

    useEffect(() => {
        fetchBooks();
        fetchReaders();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await getBooks();
            setBooks(response);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const fetchReaders = async () => {
        try {
            const response = await getAllReaders();
            setReaders(response);
        } catch (error) {
            console.error('Error fetching readers:', error);
        }
    };

    // Email templates
    const emailTemplates = {
        reminder: {
            subject: 'Book Return Reminder - {bookName}',
            body: `Dear {userName},

This is a friendly reminder that your borrowed book "{bookName}" (Book ID: {bookID}) is due for return on {returnDate}.

Book Details:
- Book: {bookName}
- Book ID: {bookID}
- Lending Date: {lendingDate}
- Return Date: {returnDate}

Please return the book to the library before the due date to avoid any late fees.

Thank you for using our library services.

Best regards,
Library Management Team`
        },
        overdue: {
            subject: 'URGENT: Overdue Book Return - {bookName}',
            body: `Dear {userName},

Your borrowed book "{bookName}" (Book ID: {bookID}) is now OVERDUE and should have been returned on {returnDate}.

Book Details:
- Book: {bookName}
- Book ID: {bookID}
- Lending Date: {lendingDate}
- Due Date: {returnDate}
- Days Overdue: {daysOverdue}

Please return the book immediately to avoid additional late fees. If you need to extend the borrowing period, please contact us.

Best regards,
Library Management Team`
        },
        return_confirmation: {
            subject: 'Book Return Confirmation - {bookName}',
            body: `Dear {userName},

Thank you for returning "{bookName}" (Book ID: {bookID}) to our library.

Return Details:
- Book: {bookName}
- Book ID: {bookID}
- Lending Date: {lendingDate}
- Return Date: {actualReturnDate}

We appreciate your prompt return and look forward to serving you again.

Best regards,
Library Management Team`
        }
    };

    // Calculate notifications
    useEffect(() => {
        const today = new Date();
        const newNotifications: Notification[] = [];

        lendings.forEach(lending => {
            if (lending.status === 'active') {
                const returnDate = new Date(lending.returnDate);
                const timeDiff = returnDate.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

                if (daysDiff < 0) {
                    newNotifications.push({
                        id: `overdue-${lending._id}`,
                        type: 'overdue',
                        lending,
                        daysOverdue: Math.abs(daysDiff)
                    });
                } else if (daysDiff <= 3) {
                    newNotifications.push({
                        id: `due-${lending._id}`,
                        type: 'due_soon',
                        lending,
                        daysDue: daysDiff
                    });
                }
            }
        });

        setNotifications(newNotifications);
    }, [lendings]);

    const calculateReturnDate = (lendingDate: string) => {
        const date = new Date(lendingDate);
        date.setDate(date.getDate() + 14);
        return date.toISOString().split('T')[0];
    };

    // Function to handle book selection
    const handleBookSelect = (bookId: string) => {
        const selectedBook = books.find(book => book._id === bookId);
        if (selectedBook) {
            setFormData(prev => ({
                ...prev,
                bookID: bookId,
                bookName: selectedBook.name
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                bookID: bookId,
                bookName: ''
            }));
        }
    };

    // Function to handle reader selection
    const handleReaderSelect = (userId: string) => {
        const selectedReader = readers.find(reader => reader._id === userId);
        if (selectedReader) {
            setFormData(prev => ({
                ...prev,
                userId: userId,
                userName: `${selectedReader.firstName} ${selectedReader.lastName}`,
                userEmail: selectedReader.email
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                userId: userId,
                userName: '',
                userEmail: ''
            }));
        }
    };

    const filteredLendings = lendings.filter(lending => {
        const matchesSearch =
            lending.bookID.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lending.userID.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lending.bookName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lending.userName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || lending.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Email functions
    const openEmailModal = (lending: Lending, templateType: 'reminder' | 'overdue' | 'return_confirmation' = 'reminder') => {
        setSelectedLending(lending);
        const template = emailTemplates[templateType];

        // Get overdue days if applicable
        const overdueDays = notifications.find(n => n.lending._id === lending._id && n.type === 'overdue')?.daysOverdue || 0;

        setEmailTemplate({
            type: templateType,
            subject: template.subject
                .replace('{bookName}', lending.bookName || '')
                .replace('{bookID}', lending.bookID),
            body: template.body
                .replace(/{userName}/g, lending.userName || '')
                .replace(/{bookName}/g, lending.bookName || '')
                .replace(/{bookID}/g, lending.bookID)
                .replace(/{lendingDate}/g, lending.lendingDate)
                .replace(/{returnDate}/g, lending.returnDate)
                .replace('{actualReturnDate}', new Date().toISOString().split('T')[0])
                .replace('{daysOverdue}', overdueDays.toString())
        });
        setShowEmailModal(true);
    };

    const sendEmail = async () => {
        if (!selectedLending) return;

        setSendingEmail(true);

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In real implementation, you would call your backend API here
            const emailData = {
                to: selectedLending.userEmail,
                subject: emailTemplate.subject,
                body: emailTemplate.body,
                lendingId: selectedLending._id
            };

            console.log('Sending email:', emailData);

            // Mark as sent
            setEmailSent([...emailSent, selectedLending._id]);
            setShowEmailModal(false);
            setSelectedLending(null);

            // Show success message
            alert('Email sent successfully!');

        } catch (error) {
            console.error('Failed to send email:', error);
            alert('Failed to send email. Please try again.');
        } finally {
            setSendingEmail(false);
        }
    };

    const resetFormData = () => {
        setFormData({
            bookID: '',
            userID: '',
            lendingDate: new Date().toISOString().split('T')[0],
            returnDate: '',
            status: 'active',
            userEmail: '',
            userName: '',
            bookName: ''
        });
    };

    const handleSubmit =  async () => {
        if (!formData.bookID || !formData.userID || !formData.lendingDate || !formData.returnDate) {
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
                ...formData
            };

            console.log(newLending);
            const response = await addLending(newLending);
            //getAll lendings
            setLendings([...lendings, response]);

        }

        resetFormData();
        setShowModal(false);
        setEditingLending(null);
    };

    const handleEdit = (lending: Lending) => {
        setEditingLending(lending);
        setFormData({
            bookID: lending.bookID,
            userID: lending.userID,
            lendingDate: lending.lendingDate,
            returnDate: lending.returnDate,
            status: lending.status,
            bookName: lending.bookName,
            userEmail: lending.userEmail,
            userName: lending.userName
        });
        setShowModal(true);
    };

    const handleDelete = (lendingId: string) => {
        if (window.confirm('Are you sure you want to delete this lending record?')) {
            setLendings(lendings.filter(lending => lending._id !== lendingId));
        }
    };

    const handleReturn = (lendingId: string) => {
        const lending = lendings.find(l => l._id === lendingId);
        if (lending) {
            setLendings(lendings.map(l =>
                l._id === lendingId
                    ? { ...l, status: 'returned' as 'returned', returnDate: new Date().toISOString().split('T')[0] }
                    : l
            ));

            // Automatically open return confirmation email
            openEmailModal(lending, 'return_confirmation');
        }
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
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Book Lending Management</h1>
                </div>

                {/* Notifications Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Bell className="h-6 w-6" />
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                        <p>No notifications</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {notifications.map(notification => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 hover:bg-gray-50 ${
                                                    notification.type === 'overdue' ? 'border-l-4 border-red-500' : 'border-l-4 border-yellow-500'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-full ${
                                                        notification.type === 'overdue' ? 'bg-red-100' : 'bg-yellow-100'
                                                    }`}>
                                                        {notification.type === 'overdue' ? (
                                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                                        ) : (
                                                            <Clock className="h-4 w-4 text-yellow-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {notification.lending.bookName}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Borrowed by: {notification.lending.userName}
                                                        </p>
                                                        <p className={`text-xs font-medium ${
                                                            notification.type === 'overdue' ? 'text-red-600' : 'text-yellow-600'
                                                        }`}>
                                                            {notification.type === 'overdue'
                                                                ? `${notification.daysOverdue} days overdue`
                                                                : notification.daysDue === 0
                                                                    ? 'Due today'
                                                                    : `Due in ${notification.daysDue} days`
                                                            }
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <button
                                                                onClick={() => {
                                                                    openEmailModal(
                                                                        notification.lending,
                                                                        notification.type === 'overdue' ? 'overdue' : 'reminder'
                                                                    );
                                                                    setShowNotifications(false);
                                                                }}
                                                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                                                            >
                                                                <Mail className="h-3 w-3" />
                                                                Send Email
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
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
                                {notifications.filter(n => n.type === 'overdue').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <Mail className="h-8 w-8 text-purple-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Emails Sent</p>
                            <p className="text-2xl font-bold text-gray-900">{emailSent.length}</p>
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
                                Contact
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
                        {filteredLendings.map((lending) => {
                            const isOverdue = notifications.find(n => n.lending._id === lending._id && n.type === 'overdue');
                            const isDueSoon = notifications.find(n => n.lending._id === lending._id && n.type === 'due_soon');
                            const hasEmailSent = emailSent.includes(lending._id);

                            return (
                                <tr key={lending._id} className={`hover:bg-gray-50 ${
                                    isOverdue ? 'bg-red-50' : isDueSoon ? 'bg-yellow-50' : ''
                                }`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                📚 {lending.bookName} ({lending.bookID})
                                                {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                                {isDueSoon && <Clock className="h-4 w-4 text-yellow-500" />}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                👤 {lending.userName} ({lending.userID})
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            {lending.userEmail}
                                            {hasEmailSent && <CheckCircle className="h-4 w-4 text-green-500" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{lending.lendingDate}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`text-sm ${
                                            isOverdue ? 'text-red-600 font-medium' :
                                                isDueSoon ? 'text-yellow-600 font-medium' : 'text-gray-900'
                                        }`}>
                                            {lending.returnDate}
                                            {isOverdue && <div className="text-xs text-red-600">
                                                (Overdue by {notifications.find(n => n.lending._id === lending._id)?.daysOverdue} days)
                                            </div>}
                                            {isDueSoon && <div className="text-xs text-yellow-600">
                                                (Due in {notifications.find(n => n.lending._id === lending._id)?.daysDue} days)
                                            </div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(lending.status)}`}>
                                            {getStatusIcon(lending.status)}
                                            <span className="ml-1 capitalize">{lending.status}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            {lending.status !== 'returned' && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(lending)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEmailModal(lending, isOverdue ? 'overdue' : 'reminder')}
                                                        className="text-purple-600 hover:text-purple-900"
                                                        title="Send Email"
                                                    >
                                                        <Send className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReturn(lending._id)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Mark as Returned"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(lending._id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Lending Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingLending ? 'Edit Lending' : 'New Lending'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingLending(null);
                                    resetFormData();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Book</label>
                                <select
                                    value={formData.bookID}
                                    onChange={(e) => handleBookSelect(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a book</option>
                                    {books.map(book => (
                                        <option key={book._id} value={book._id}>
                                            {book.name} ({book._id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reader</label>
                                <select
                                    value={formData.userID}
                                    onChange={(e) => handleReaderSelect(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a reader</option>
                                    {readers.map(reader => (
                                        <option key={reader._id} value={reader._id}>
                                            {reader.firstName} {reader.lastName} ({reader._id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lending Date</label>
                                <input
                                    type="date"
                                    value={formData.lendingDate}
                                    onChange={(e) => {
                                        const lendingDate = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            lendingDate,
                                            returnDate: calculateReturnDate(lendingDate)
                                        }));
                                    }}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Return Date</label>
                                <input
                                    type="date"
                                    value={formData.returnDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'returned' | 'overdue' }))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="returned">Returned</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingLending(null);
                                    resetFormData();
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                {editingLending ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Modal */}
            {showEmailModal && selectedLending && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Send Email</h2>
                            <button
                                onClick={() => {
                                    setShowEmailModal(false);
                                    setSelectedLending(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">To</label>
                                <input
                                    type="email"
                                    value={selectedLending.userEmail}
                                    disabled
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Template</label>
                                <select
                                    value={emailTemplate.type}
                                    onChange={(e) => {
                                        const type = e.target.value as 'reminder' | 'overdue' | 'return_confirmation' | 'custom';
                                        if (type !== 'custom') {
                                            const template = emailTemplates[type];
                                            setEmailTemplate({
                                                type,
                                                subject: template.subject
                                                    .replace('{bookName}', selectedLending.bookName || '')
                                                    .replace('{bookID}', selectedLending.bookID),
                                                body: template.body
                                                    .replace(/{userName}/g, selectedLending.userName || '')
                                                    .replace(/{bookName}/g, selectedLending.bookName || '')
                                                    .replace(/{bookID}/g, selectedLending.bookID)
                                                    .replace(/{lendingDate}/g, selectedLending.lendingDate)
                                                    .replace(/{returnDate}/g, selectedLending.returnDate)
                                                    .replace('{actualReturnDate}', new Date().toISOString().split('T')[0])
                                                    .replace('{daysOverdue}', (notifications.find(n => n.lending._id === selectedLending._id && n.type === 'overdue')?.daysOverdue || 0).toString())
                                            });
                                        } else {
                                            setEmailTemplate({ type: 'custom', subject: '', body: '' });
                                        }
                                    }}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="reminder">Reminder</option>
                                    <option value="overdue">Overdue Notice</option>
                                    <option value="return_confirmation">Return Confirmation</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subject</label>
                                <input
                                    type="text"
                                    value={emailTemplate.subject}
                                    onChange={(e) => setEmailTemplate(prev => ({ ...prev, subject: e.target.value }))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={emailTemplate.type !== 'custom'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea
                                    value={emailTemplate.body}
                                    onChange={(e) => setEmailTemplate(prev => ({ ...prev, body: e.target.value }))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 h-40"
                                    disabled={emailTemplate.type !== 'custom'}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowEmailModal(false);
                                    setSelectedLending(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendEmail}
                                disabled={sendingEmail}
                                className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
                                    sendingEmail ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {sendingEmail ? (
                                    <>
                                        <Loader className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Send Email
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LendingManagePage;