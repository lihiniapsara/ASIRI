export type Reader = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    status: 'active' | 'inactive' | 'suspended';
}

export type ReaderFormData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    membershipId: string;
    status: 'active' | 'inactive' | 'suspended';
}
