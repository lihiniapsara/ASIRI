export interface QuizOption {
    label: string;
    score: number;
}

export interface QuizQuestion {
    title: string;
    question: string;
    subtext?: string;
    options: QuizOption[];
}

export interface QuizResult {
    name: string;
    totalScore: number;
    scores: number[];
    percentage: number;
    email?: string; // Add optional email field

}
