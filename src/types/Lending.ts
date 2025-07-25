
export interface Lending {
    _id: string;
    bookID: string;
    userId: string;
    lendingDate: string;
    returnDate: string;
    status: 'active' | 'returned' | 'overdue';
    bookName: string;
    userName: string;
    userEmail: string;
}