export interface Game {
    game: string;
    questions: string[];
}

export interface Question {
    game: string;
    question: string;
    answer?: string;
}

