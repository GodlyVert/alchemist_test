export type Game = {
    game: string;
    questions: Array<{ question: string, answer: string }>;
};


export type Question = {
    game: string;
    question: string;
    answer: string;
    correctAnswer: string;
};
