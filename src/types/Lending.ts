
export interface Lending {
    _id: string;
    bookID: string;
    userID: string;
    lendingDate: string;
    returnDate: string;
    status: 'active' | 'returned' | 'overdue';
    bookName: string;
    userName: string;
    userEmail: string;
}

export type LendingFormData = Omit<Lending, '_id'>;