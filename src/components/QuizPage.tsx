import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { QuizQuestion } from "../types/Quiz.ts";
import emailjs from '@emailjs/browser';

// Initialize EmailJS
try {
    emailjs.init('TABZRK7DGS_KJI5Ox');
} catch (error) {
    console.error('Failed to initialize EmailJS:', error);
}

interface User {
    title: string;
    name: string;
    phone: string;
    email: string;
}

const HealthQuestionnaire = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [scores, setScores] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionCompleted, setSubmissionCompleted] = useState(false);

    const user: User | null = location.state?.user || null;

    const PRIMARY_DARK = '#07294bff';
    const LIGHT_BLUE = '#1591cbff';
    const VERY_LIGHT_BLUE = '#57bef6ff';
    const GREEN_BUTTON = '#00CC66';
    const GREEN_SHADOW = '#00994d';

    const questions: QuizQuestion[] = [
        {
            title: 'Q1',
            question: 'How many liters of water do you drink daily?',
            options: [
                { label: 'Less than 500 ml', score: 0 },
                { label: '1 liter', score: 50 },
                { label: '2 liters', score: 100 },
                { label: 'More than 3 liters', score: 25 },
            ]
        },
        {
            title: 'Q2',
            question: 'Days with 10,000+ steps this week?',
            options: [
                { label: '0 days', score: 0 },
                { label: '2 days', score: 50 },
                { label: '3 days', score: 75 },
                { label: '5+ days', score: 100 },
            ]
        },
        {
            title: 'Q3',
            question: 'Days eating out this week?',
            subtext: '(restaurant, takeout, packaged meals)',
            options: [
                { label: '1 day', score: 100 },
                { label: '3 days', score: 75 },
                { label: '5 days', score: 50 },
                { label: '7 days', score: 0 },
            ]
        },
        {
            title: 'Q4',
            question: 'Your routine 1 hour before bedtime?',
            options: [
                { label: 'Reading/Relaxation', score: 100 },
                { label: 'Family time (no screens)', score: 100 },
                { label: 'Watching TV/mobile', score: 0 },
            ]
        }
    ];

    const calculateTotalScore = () => scores.reduce((sum, score) => sum + score, 0);

    const sendQuizResultsEmail = async (totalScore: number) => {
        if (!user?.email) {
            console.log('No user email found, skipping email sending');
            return;
        }

        const scorePercentage = Math.round((totalScore / (questions.length * 100)) * 100);

        const templateParams = {
            name: user?.name || 'User',
            email: user.email,
            title: user?.title || '',
            message: `Your health assessment results are ready!\n\n` +
                `Total Score: ${totalScore} (${scorePercentage}%)\n` +
                `Questions Answered: 4/4\n\n` +
                `Thank you for completing the assessment!`
        };

        try {
            await emailjs.send(
                'service_43k5omt',
                'template_su223cy',
                templateParams,
                'TABZRK7DGS_KJI5Ox'
            );
            console.log('Quiz results email sent successfully');
        } catch (error) {
            console.error('Failed to send quiz results email:', error);
        }
    };

    const handleOK = async () => {
        if (selectedOption === null) return;

        const newScores = [...scores, questions[currentQuestion].options[selectedOption].score];
        setScores(newScores);

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedOption(null);
        } else {
            setShowResults(true);
            setIsSubmitting(true);

            const totalScore = newScores.reduce((sum, score) => sum + score, 0);

            await sendQuizResultsEmail(totalScore);

            setIsSubmitting(false);
            setSubmissionCompleted(true);
        }
    };

    const maxScore = 400;
    const totalScore = calculateTotalScore();
    const percentage = Math.round((totalScore / maxScore) * 100);

    const getHealthMessage = () => {
        if (percentage >= 80) return {
            text: 'Excellent! Keep it up!',
            emoji: '🌟',
            range: '100-80',
            message: 'Maintain your healthy habits.'
        };
        if (percentage >= 60) return {
            text: 'Good job!',
            emoji: '👍',
            range: '80-60',
            message: 'Keep improving daily.'
        };
        if (percentage >= 40) return {
            text: 'Fair',
            emoji: '💪',
            range: '60-40',
            message: 'Develop healthier habits.'
        };
        return {
            text: 'Needs work',
            emoji: '🎯',
            range: '<40',
            message: 'Start healthy habits now.'
        };
    };

    const ChevronRight = ({ size = 20, color = "white" }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="m9 18 6-6-6-6"/>
        </svg>
    );

    const DonutChart = ({
                            percentage,
                            size = 120,
                            strokeWidth = 12,
                        }: {
        percentage: number;
        size?: number;
        strokeWidth?: number;
    }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference * (1 - percentage / 100);

        const getGradientColors = () => {
            if (percentage >= 80) return ['#ed1bab', '#5409a0'];
            if (percentage >= 60) return ['#ee460aff', '#0af745ff'];
            if (percentage >= 40) return ['#02ff56ff', '#4566e9ff'];
            return ['#8800ffff', '#ff5202ff'];
        };

        const [startColor, endColor] = getGradientColors();

        return (
            <div style={{ position: 'relative', width: size, height: size, margin: '10px auto' }}>
                <svg width={size} height={size}>
                    <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={startColor} />
                            <stop offset="100%" stopColor={endColor} />
                        </linearGradient>
                    </defs>

                    <circle
                        stroke="#e6e6e6"
                        fill="none"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                    />

                    <circle
                        stroke="url(#chartGradient)"
                        fill="none"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />

                    <text
                        x={size / 2}
                        y={size / 2 + 6}
                        fontSize="20"
                        fontWeight="bold"
                        fill={PRIMARY_DARK}
                        textAnchor="middle"
                        fontFamily="Arial, sans-serif"
                    >
                        {percentage}%
                    </text>
                </svg>
            </div>
        );
    };

    if (showResults) {
        const message = getHealthMessage();

        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '15px',
                margin: '0',
                background: `linear-gradient(135deg, ${LIGHT_BLUE}, ${VERY_LIGHT_BLUE})`,
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                overflow: 'auto',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '380px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    textAlign: 'center'
                }}>
                    <div style={{ marginBottom: '15px' }}>
                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: '800',
                            color: PRIMARY_DARK,
                            margin: '0 0 8px 0'
                        }}>
                            Health Score
                        </h1>
                        <p style={{
                            fontSize: '14px',
                            color: '#6B7280',
                            margin: '0'
                        }}>
                            {user ? `${user.title} ${user.name}` : 'User'}
                        </p>
                    </div>

                    <DonutChart percentage={percentage} size={100} strokeWidth={10} />

                    <div style={{
                        margin: '8px 0',
                        padding: '6px 12px',
                        backgroundColor: `${GREEN_BUTTON}15`,
                        borderRadius: '8px',
                        display: 'inline-block'
                    }}>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: PRIMARY_DARK,
                            margin: '0'
                        }}>
                            {message.range}
                        </p>
                    </div>

                    <div style={{
                        margin: '12px 0',
                        padding: '12px',
                        backgroundColor: `${GREEN_BUTTON}15`,
                        borderRadius: '10px'
                    }}>
                        <p style={{
                            fontSize: '32px',
                            margin: '0 0 6px 0'
                        }}>
                            {message.emoji}
                        </p>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: PRIMARY_DARK,
                            lineHeight: '1.3',
                            margin: '0'
                        }}>
                            {message.text}
                        </p>
                        <p style={{
                            fontSize: '12px',
                            color: '#6B7280',
                            margin: '4px 0 0 0',
                            lineHeight: '1.2'
                        }}>
                            {message.message}
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '6px',
                        margin: '15px 0'
                    }}>
                        {questions.map((q, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '6px 8px',
                                backgroundColor: '#F9FAFB',
                                borderRadius: '6px',
                                fontSize: '12px'
                            }}>
                                <span style={{
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>
                                    {q.title}
                                </span>
                                <span style={{
                                    fontWeight: '700',
                                    color: scores[idx] >= 75 ? GREEN_BUTTON : LIGHT_BLUE
                                }}>
                                    {scores[idx]}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        margin: '12px 0',
                        padding: '12px',
                        backgroundColor: PRIMARY_DARK,
                        borderRadius: '10px',
                        color: 'white'
                    }}>
                        <p style={{
                            fontSize: '12px',
                            margin: '0 0 4px 0',
                            opacity: 0.9
                        }}>
                            Total Score
                        </p>
                        <p style={{
                            fontSize: '24px',
                            fontWeight: '800',
                            margin: '0'
                        }}>
                            {totalScore}<span style={{ fontSize: '14px', opacity: 0.8 }}>/{maxScore}</span>
                        </p>
                    </div>

                    <div style={{
                        margin: '12px 0',
                        padding: '10px',
                        backgroundColor: submissionCompleted ? '#e8f5e8' : '#fff3cd',
                        borderRadius: '8px',
                        border: `1px solid ${submissionCompleted ? '#d4edda' : '#ffeaa7'}`
                    }}>
                        <p style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: submissionCompleted ? '#155724' : '#856404',
                            margin: '0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}>
                            {isSubmitting ? (
                                <>
                                    <span>📨 Sending results...</span>
                                </>
                            ) : submissionCompleted ? (
                                <>
                                    <span>✅ Results submitted successfully!</span>
                                </>
                            ) : (
                                <>
                                    <span>⏳ Preparing results...</span>
                                </>
                            )}
                        </p>
                        {user?.email && submissionCompleted && (
                            <p style={{
                                fontSize: '10px',
                                color: '#155724',
                                margin: '4px 0 0 0'
                            }}>
                                Email sent to: {user.email}
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        <button
                            onClick={() => navigate('/expert')}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '20px',
                                border: '2px solid #06b0ff',
                                background: 'transparent',
                                color: '#06b0ff',
                                fontSize: '14px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#06b0ff';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#06b0ff';
                            }}
                        >
                            Meet Health Experts
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '15px',
            margin: '0',
            background: `linear-gradient(135deg, ${LIGHT_BLUE}, ${VERY_LIGHT_BLUE})`,
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            overflow: 'auto',
            boxSizing: 'border-box'
        }}>
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    gap: '4px'
                }}>
                    {questions.map((_, idx) => (
                        <div
                            key={idx}
                            style={{
                                height: '4px',
                                borderRadius: '9999px',
                                transition: 'all 0.3s',
                                width: idx === currentQuestion ? '30px' : '20px',
                                backgroundColor: idx <= currentQuestion ? 'white' : 'rgba(255,255,255,0.3)'
                            }}
                        />
                    ))}
                </div>

                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    textAlign: 'center'
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '800',
                        marginBottom: '12px',
                        color: PRIMARY_DARK
                    }}>
                        {currentQ.title}
                    </h2>

                    <p style={{
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '500',
                        marginBottom: '6px',
                        lineHeight: '1.4'
                    }}>
                        {currentQ.question}
                    </p>

                    {currentQ.subtext && (
                        <p style={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '12px',
                            marginBottom: '20px',
                            fontStyle: 'italic'
                        }}>
                            {currentQ.subtext}
                        </p>
                    )}

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        marginBottom: '25px',
                        marginTop: '25px'
                    }}>
                        {currentQ.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedOption(index)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    transition: 'all 0.2s',
                                    transform: selectedOption === index ? 'scale(1.02)' : 'scale(1)',
                                    backgroundColor: selectedOption === index ? 'white' : 'rgba(255,255,255,0.2)',
                                    border: '2px solid white',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={(e) => {
                                    if (selectedOption !== index) {
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (selectedOption !== index) {
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                                    }
                                }}
                            >
                                <div
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        border: '2px solid',
                                        borderColor: selectedOption === index ? PRIMARY_DARK : 'white',
                                        backgroundColor: selectedOption === index ? PRIMARY_DARK : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '10px',
                                        flexShrink: 0
                                    }}
                                >
                                    {selectedOption === index && (
                                        <div style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: 'white'
                                        }} />
                                    )}
                                </div>
                                <span
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        textAlign: 'left',
                                        color: selectedOption === index ? PRIMARY_DARK : 'white'
                                    }}
                                >
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleOK}
                        style={{
                            padding: '12px 40px',
                            borderRadius: '20px',
                            fontWeight: '800',
                            fontSize: '14px',
                            color: 'white',
                            textTransform: 'uppercase',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                            transition: 'transform 0.2s',
                            backgroundColor: GREEN_BUTTON,
                            borderBottom: `3px solid ${GREEN_SHADOW}`,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            margin: '0 auto'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        OK
                        <ChevronRight size={16} color="white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HealthQuestionnaire;