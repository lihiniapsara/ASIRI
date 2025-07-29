export type Books = {
    _id: string
    name: string
    title: string
    author: string
    publicationYear: number
    totalCopies: number
    availableCopies: number
    status: 'available' | 'unavailable' | 'restricted'
}

export type BookFormData = Omit<Books, '_id'>