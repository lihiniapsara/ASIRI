export type Book = {
    _id: string
    name: string
    title: string
    author: string
    publicationYear: number
    totalCopies: number
    availableCopies: number
    status: 'available' | 'unavailable' | 'restricted'
}

export type BookFormData = Omit<Book, '_id'>