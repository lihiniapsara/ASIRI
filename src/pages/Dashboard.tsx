import { useState, useEffect } from 'react';
import {
    Book,
    Users,
    AlertCircle,
    BookOpen,
    UserCheck,
    Clock,
    BarChart3,
    Activity,
    Star,
    ArrowUp,
    ArrowDown,
    Download,
    RefreshCw
} from 'lucide-react';

import type { Lending } from '../types/Lending'; // Adjust path as needed
import type { Reader } from '../types/Reader';
import {getBooks} from "../services/bookService.ts";
import {getAllReaders} from "../services/readerService.ts";
import {getLending} from "../services/lendingService.ts";
import type {Books} from "../types/Book.ts"; // Adjust path as needed

interface BorrowingTrend {
    month: string;
    borrowed: number;
    returned: number;
}

const LibraryDashboard = () => {
    const [books, setBooks] = useState<Books[]>([]);
    const [lending, setLending] = useState<Lending[]>([]);
    const [readers, setReaders] = useState<Reader[]>([]);
    const [borrowingTrends, setBorrowingTrends] = useState<BorrowingTrend[]>([]);
    const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data from APIs
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [booksData, lendingData, readersData] = await Promise.all([
                getBooks(),
                getLending(),
                getAllReaders()
            ]);
            setBooks(booksData);
            setLending(lendingData);
            setReaders(readersData);

            // Generate borrowing trends from lending data
            const trends = generateBorrowingTrends(lendingData);
            setBorrowingTrends(trends);
        } catch (err) {
            setError('Failed to fetch data. Please try again later.');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Generate borrowing trends from lending data
    const generateBorrowingTrends = (lendingData: Lending[]): BorrowingTrend[] => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trends: BorrowingTrend[] = [];
        const now = new Date();

        for (let i = 0; i < 6; i++) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = months[monthDate.getMonth()];
            const borrowed = lendingData.filter(l => {
                const borrowDate = new Date(l.lendingDate);
                return borrowDate.getMonth() === monthDate.getMonth() && borrowDate.getFullYear() === monthDate.getFullYear();
            }).length;
            const returned = lendingData.filter(l => {
                const returnDate = l.returnDate ? new Date(l.returnDate) : null;
                return returnDate &&
                    returnDate.getMonth() === monthDate.getMonth() &&
                    returnDate.getFullYear() === monthDate.getFullYear();
            }).length;
            trends.unshift({ month: monthName, borrowed, returned });
        }
        return trends;
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Calculate metrics
    const totalBooks = books.reduce((sum, book) => sum + (book.totalCopies || 0), 0);
    const totalBorrowed = books.reduce((sum, book) => sum + (book.availableCopies || 0), 0);
    const availableBooks = totalBooks - totalBorrowed;
    const utilizationRate = totalBooks > 0 ? ((totalBorrowed / totalBooks) * 100).toFixed(1) : '0.0';
    const overdueBooksCount = lending.filter(l => !l.returnDate && new Date(l.lendingDate) < new Date()).length;
    const activeMembers = readers.length;
    const newMembersThisMonth = readers.filter(r => {
        const regDate = new Date(r.phone);
        const now = new Date();
        return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
    }).length;

    const handleRefresh = () => {
        fetchData();
    };

    const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = "blue" }: {
        title: string;
        value: string | number;
        subtitle?: string;
        icon: React.ElementType;
        trend?: 'up' | 'down';
        trendValue?: string;
        color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    }) => {
        const colorClasses = {
            blue: "bg-blue-50 border-blue-200 text-blue-700",
            green: "bg-green-50 border-green-200 text-green-700",
            yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
            red: "bg-red-50 border-red-200 text-red-700",
            purple: "bg-purple-50 border-purple-200 text-purple-700"
        };

        return (
            <div className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${colorClasses[color]}`}>
                <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8" />
                    {trend && (
                        <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {trend === 'up' ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                            {trendValue}%
                        </div>
                    )}
                </div>
                <div className="text-3xl font-bold mb-2">{value}</div>
                <div className="text-sm font-medium">{title}</div>
                {subtitle && <div className="text-xs opacity-75 mt-1">{subtitle}</div>}
            </div>
        );
    };

    const BorrowingChart = () => {
        // Calculate max height for scaling bars
        const maxValue = Math.max(...borrowingTrends.flatMap(t => [t.borrowed, t.returned]), 1);
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Borrowing Trends</h3>
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value as 'weekly' | 'monthly' | 'yearly')}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
                {borrowingTrends.length > 0 ? (
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {borrowingTrends.map((item) => (
                            <div key={item.month} className="flex-1 flex flex-col items-center">
                                <div className="w-full flex space-x-1 items-end mb-2">
                                    <div
                                        className="bg-blue-500 rounded-t-sm flex-1 transition-all duration-500 hover:bg-blue-600"
                                        style={{ height: `${(item.borrowed / maxValue) * 200}px` }}
                                        title={`Borrowed: ${item.borrowed}`}
                                    ></div>
                                    <div
                                        className="bg-green-500 rounded-t-sm flex-1 transition-all duration-500 hover:bg-green-600"
                                        style={{ height: `${(item.returned / maxValue) * 200}px` }}
                                        title={`Returned: ${item.returned}`}
                                    ></div>
                                </div>
                                <span className="text-xs text-gray-600 font-medium">{item.month}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                        No borrowing data available
                    </div>
                )}
                <div className="flex justify-center mt-4 space-x-6">
                    <div className="flex items-center text-sm">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        Borrowed
                    </div>
                    <div className="flex items-center text-sm">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        Returned
                    </div>
                </div>
            </div>
        );
    };

    const PopularBooks = () => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Popular Books</h3>
            <div className="space-y-4">
                {books
                    .sort((a, b) => (b.totalCopies || 0) - (a.totalCopies || 0))
                    .slice(0, 5)
                    .map((book, index) => (
                        <div key={book._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                                    {index + 1}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 text-sm">{book.title}</div>
                                    <div className="text-xs text-gray-500">{book.author}</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center text-xs text-yellow-600">
                                    <Star className="h-3 w-3 fill-current mr-1" />
                                    {book.publicationYear?.toFixed(1) || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">{book.name || 0} borrowed</div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );

    const StatusDistribution = () => {
        const statusCounts = books.reduce((acc, book) => {
            acc[book.status] = (acc[book.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Book Status Distribution</h3>
                <div className="space-y-4">
                    {Object.entries(statusCounts).map(([status, count]) => {
                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
                        const colors = {
                            available: { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' },
                            unavailable: { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100' },
                            restricted: { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-100' }
                        };
                        const color = colors[status as keyof typeof colors] || colors.available;

                        return (
                            <div key={status} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-3 h-3 rounded-full ${color.bg}`}></div>
                                        <span className="text-sm font-medium capitalize text-gray-700">{status}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">{count}</span>
                                        <span className="text-xs text-gray-500">({percentage}%)</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`${color.bg} h-2 rounded-full transition-all duration-500`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Recent Activity with dynamic data
    const RecentActivity = () => {
        const activities = lending
            .slice(0, 5)
            .map(l => {
                const book = books.find(b => b._id === l.bookID);
                const reader = readers.find(r => r._id === l.userID);
                const action = l.returnDate ? 'Book returned' : 'Book borrowed';
                const type = l.returnDate ? 'return' : 'borrow';
                const time = formatTimeSince(new Date(l.bookID));
                return {
                    action,
                    item: book?.title || 'Unknown Book',
                    user: reader?.firstName || 'Unknown User',
                    time,
                    type
                };
            })
            .concat(
                readers
                    .slice(0, 2)
                    .map(r => ({
                        action: 'Member registered',
                        item: r.firstName,
                        user: 'System',
                        time: formatTimeSince(new Date(r.phone)),
                        type: 'user'
                    }))
            )
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 5);

        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                    {activities.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                activity.type === 'return' ? 'bg-green-100 text-green-700' :
                                    activity.type === 'borrow' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-purple-100 text-purple-700'
                            }`}>
                                <Activity className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">
                                    {activity.action}: <span className="text-blue-600">{activity.item}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    by {activity.user} • {activity.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Helper to format time since
    const formatTimeSince = (date: Date): string => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    <p>{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-600 p-3 rounded-xl">
                            <BarChart3 className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Library Dashboard</h1>
                            <p className="text-gray-600 mt-1">Monitor your library's performance and analytics</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="bg-white px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-medium">Refresh</span>
                        </button>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                            <Download className="h-4 w-4" />
                            <span className="text-sm font-medium">Export</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Books"
                    value={totalBooks.toLocaleString()}
                    subtitle="In collection"
                    icon={Book}
                    trend="up"
                    trendValue="12"
                    color="blue"
                />
                <MetricCard
                    title="Books Borrowed"
                    value={totalBorrowed}
                    subtitle={`${utilizationRate}% utilization`}
                    icon={BookOpen}
                    trend="up"
                    trendValue="8"
                    color="green"
                />
                <MetricCard
                    title="Active Members"
                    value={activeMembers}
                    subtitle={`+${newMembersThisMonth} this month`}
                    icon={Users}
                    trend="up"
                    trendValue="15"
                    color="purple"
                />
                <MetricCard
                    title="Overdue Books"
                    value={overdueBooksCount}
                    subtitle="Require attention"
                    icon={AlertCircle}
                    trend="down"
                    trendValue="5"
                    color="red"
                />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <UserCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{availableBooks}</div>
                            <div className="text-sm text-gray-600">Available Books</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">4.2</div>
                            <div className="text-sm text-gray-600">Avg. Days per Loan</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="bg-yellow-100 p-3 rounded-lg">
                            <Star className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {(books.reduce((sum, b) => sum + (b.publicationYear || 0), 0) / (books.length || 1)).toFixed(1) || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">Avg. Book Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <BorrowingChart />
                <StatusDistribution />
            </div>

            {/* Popular Books and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PopularBooks />
                <RecentActivity />
            </div>
        </div>
    );
};

export default LibraryDashboard;