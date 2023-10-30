import React, { useState, useEffect } from 'react';
import gamesData from './games.json';
import { Game, Question } from './types';
import styles from './App.module.css';
function App() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [time, setTime] = useState<number>(17 * 60); // 17 минут в секундах
    const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
    const [isLocked, setIsLocked] = useState<boolean>(false);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>('');
    const [isTestStarted, setIsTestStarted] = useState<boolean>(false);
    const [testResults, setTestResults] = useState<any>(null);

    useEffect(() => {
        if (isTestStarted) {
            const selectedQuestions = gamesData.map((game: Game) => {
                const randomIndex = Math.floor(Math.random() * game.questions.length);
                return { game: game.game, question: game.questions[randomIndex], answer: '' };
            });
            setQuestions(selectedQuestions);
            setIsTimerRunning(true);
        }
    }, [isTestStarted]);

    useEffect(() => {
        if (!isTimerRunning) {
            return;
        }

        const timerId = setInterval(() => {
            setTime((prevTime) => {
                if (prevTime > 0) {
                    return prevTime - 1;
                } else {
                    setIsTimeUp(true);
                    setIsTimerRunning(false);
                    clearInterval(timerId);
                    return 0;
                }
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [isTimerRunning]);

    useEffect(() => {
        if (isTimeUp || isLocked) {
            const results = {
                userName,
                remainingTime: formatTime(),
                answers: questions
            };
            setTestResults(results);
            localStorage.setItem('testResults', JSON.stringify(results));
        }
    }, [isTimeUp, isLocked, userName, questions]);

    const formatTime = () => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const saveResultsAsHTML = () => {
        let styles = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400&display=swap');

        body {
            font-family: 'Arial', sans-serif;
            text-align: center;
            padding: 20px;
        }
        h1 {
            font-size: 2em;
            margin-bottom: 20px;
        }
        ul {
            list-style: none;
            padding: 0;
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
        }
        li {
            margin-bottom: 10px;
        }
        strong {
            color: #4CAF50;
        }
        p {
            font-family: 'Roboto Mono', monospace;
            margin: 10px 0;
        }
    `;

        let htmlContent = `
        <html>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Результаты Теста</title>
            <style>${styles}</style>
        </head>
        <body>
            <h1>Результаты Теста</h1>
            <p><strong>Имя:</strong> ${userName}</p>
            <p><strong>Оставшееся время:</strong> ${formatTime()}</p>
            <ul>
                ${questions.map(q => `
                    <li>
                        <strong>${q.game}:</strong> ${q.question}
                        <p>Ответ: ${q.answer}</p>
                    </li>
                `).join('')}
            </ul>
        </body>
        </html>
    `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Результаты_Теста_${userName}.html`;
        a.click();
    };


    const handleLock = () => {
        setIsLocked(true);
        setIsTimeUp(true);
        setIsTimerRunning(false);
        saveResultsAsHTML(); // Вызывать функцию при нажатии на кнопку "Зафиксировать"
    };

    const handleStartTest = () => {
        setIsTestStarted(true);
    };

    const handleAnswerChange = (index: number, answer: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].answer = answer;
        setQuestions(updatedQuestions);
    };


    return (
        <div className={styles.App}>
            {!isTestStarted ? (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <input
                            type="text"
                            placeholder="Введите ваше имя"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                        <button onClick={handleStartTest} disabled={!userName}>
                            Начать тест
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className={styles.timer}>
                        {formatTime()}
                    </div>
                    <h1>Testing App</h1>
                    <ul className={isTestStarted ? styles.questionsContainer : ''}>
                        {questions.map((q, index) => (
                            <li key={index} className={styles.questionContainer}>
                                <div className={styles.question}>
                                    <strong>{q.game}:</strong> {q.question}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Your answer..."
                                    disabled={isTimeUp}
                                    value={q.answer}
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                />
                            </li>
                        ))}
                    </ul>
                    <button className={styles.lockButton} onClick={handleLock} disabled={isLocked}>
                        Зафиксировать
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
