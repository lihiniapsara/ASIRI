import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import emailjs from "@emailjs/browser";

// Initialize EmailJS
try {
    emailjs.init('TABZRK7DGS_KJI5Ox');
} catch (error) {
    console.error('Failed to initialize EmailJS:', error);
}

import asiriLogo from '../assets/asiri-logo.png';

interface User {
    title: string;
    name: string;
    phone: string;
    email: string;
}

type Size = 'small' | 'medium' | 'large';

const HealthQuestionnaire = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [scores, setScores] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionCompleted, setSubmissionCompleted] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const [showAuthPopup, setShowAuthPopup] = useState(false);
    const [authKey, setAuthKey] = useState('');
    const [authError, setAuthError] = useState(false);

    // Remove auto-applied padding from main element when component mounts
    useEffect(() => {
        const main = document.querySelector('main');
        if (main) {
            const originalPaddingTop = main.style.paddingTop;
            main.style.paddingTop = '0px';
            main.style.padding = '0px'; // Ensure all padding is removed if needed

            return () => {
                main.style.paddingTop = originalPaddingTop;
                // Optionally restore full padding if needed
                // main.style.padding = originalPadding;
            };
        }
    }, []);

    const user: User | null = location.state?.user || null;

    const PRIMARY_DARK = '#07294bff';
    const LIGHT_BLUE = '#1591cbff';
    const VERY_LIGHT_BLUE = '#57bef6ff';
    const GREEN_BUTTON = '#00CC66';
    const GREEN_SHADOW = '#00994d';

    const questions = [
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

        console.log('Sending email to:', user.email);
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

    const handleExpertAccess = () => {
        if (authKey === 'asiriadmin') {
            setShowAuthPopup(false);
            setAuthKey('');
            setAuthError(false);
            navigate('/expert');
        } else {
            setAuthError(true);
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

    interface ChevronRightProps {
        size?: number;
        color?: string;
    }

    const ChevronRight = ({ size = 20, color = "white" }: ChevronRightProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="m9 18 6-6-6-6"/>
        </svg>
    );

    // Enhanced Logo Component with Image and Fallback
    const Logo = ({ size = 'medium' }: { size?: Size }) => {
        const sizes: Record<Size, { width: number; height: string }> = {
            small: { width: 120, height: 'auto' },
            medium: { width: 200, height: 'auto' },
            large: { width: 260, height: 'auto' }
        };

        const { width, height } = sizes[size] || sizes.medium;

        // If logo fails to load, show enhanced text version with white background
        if (logoError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: PRIMARY_DARK,
                    fontWeight: 'bold',
                    width: width,
                    margin: '0 auto 20px auto',
                    padding: '10px 0',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 8px 25px rgba(7, 41, 75, 0.15)',
                    border: '2px solid rgba(7, 41, 75, 0.1)'
                }}>
                    <div style={{
                        fontSize: size === 'small' ? '20px' : size === 'large' ? '32px' : '28px',
                        lineHeight: '1.1',
                        textAlign: 'center',
                        letterSpacing: '1.5px',
                        background: 'linear-gradient(135deg, #07294b, #1591cb)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        ASIRI
                    </div>
                    <div style={{
                        fontSize: size === 'small' ? '14px' : size === 'large' ? '20px' : '18px',
                        lineHeight: '1.2',
                        textAlign: 'center',
                        marginTop: '4px',
                        background: 'linear-gradient(135deg, #1591cb, #57bef6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        HEALTH
                    </div>
                    <div style={{
                        fontSize: size === 'small' ? '10px' : size === 'large' ? '14px' : '12px',
                        lineHeight: '1.2',
                        textAlign: 'center',
                        marginTop: '4px',
                        fontWeight: 'normal',
                        color: LIGHT_BLUE,
                        padding: '4px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(21, 145, 203, 0.1)'
                    }}>
                        Lifescore
                    </div>
                </div>
            );
        }

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 20px auto',
                padding: '10px 0',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(7, 41, 75, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease'
            }}>
                <img
                    src={asiriLogo}
                    alt="Asiri Health Lifescore"
                    style={{
                        width: width,
                        height: height,
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease'
                    }}
                    onError={() => setLogoError(true)}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                            parent.style.boxShadow = '0 15px 40px rgba(7, 41, 75, 0.3)';
                        }
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                            parent.style.boxShadow = '0 10px 30px rgba(7, 41, 75, 0.2)';
                        }
                    }}
                />
            </div>
        );
    };

    interface DonutChartProps {
        percentage: number;
        size?: number;
        strokeWidth?: number;
    }

    const DonutChart = ({ percentage, size = 120, strokeWidth = 12 }: DonutChartProps) => {
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
                padding: '0', // Remove all padding
                margin: '0', // Remove all margin
                background: `linear-gradient(135deg, ${LIGHT_BLUE}, ${VERY_LIGHT_BLUE})`,
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '380px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    textAlign: 'center',
                    margin: '0 auto' // Center the content
                }}>
                    {/* Logo with Image */}
                    <div style={{ marginBottom: '10px' }}>
                        <Logo size="small" />
                    </div>

                    {/* Header with User Information */}
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
                        <p style={{ fontSize: '32px', margin: '0 0 6px 0' }}>
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
                                <span style={{ fontWeight: '500', color: '#374151' }}>
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
                        <p style={{ fontSize: '12px', margin: '0 0 4px 0', opacity: 0.9 }}>
                            Total Score
                        </p>
                        <p style={{ fontSize: '24px', fontWeight: '800', margin: '0' }}>
                            {totalScore}<span style={{ fontSize: '14px', opacity: 0.8 }}>/{maxScore}</span>
                        </p>
                    </div>

                    {/* Submission Status */}
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
                            onClick={() => setShowAuthPopup(true)}
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

                {/* Auth Popup */}
                {showAuthPopup && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            maxWidth: '350px',
                            width: '100%',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
                        }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: PRIMARY_DARK,
                                margin: '0 0 8px 0',
                                textAlign: 'center'
                            }}>
                                Access Required
                            </h3>
                            <p style={{
                                fontSize: '13px',
                                color: '#6B7280',
                                margin: '0 0 20px 0',
                                textAlign: 'center'
                            }}>
                                Enter authorization key to continue
                            </p>

                            <input
                                type="password"
                                value={authKey}
                                onChange={(e) => {
                                    setAuthKey(e.target.value);
                                    setAuthError(false);
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleExpertAccess();
                                    }
                                }}
                                placeholder="Enter key"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: `2px solid ${authError ? '#ef4444' : '#e5e7eb'}`,
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box',
                                    marginBottom: '12px'
                                }}
                            />

                            {authError && (
                                <p style={{
                                    fontSize: '12px',
                                    color: '#ef4444',
                                    margin: '0 0 12px 0',
                                    textAlign: 'center'
                                }}>
                                    ❌ Incorrect key. Please try again.
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                <button
                                    onClick={() => {
                                        setShowAuthPopup(false);
                                        setAuthKey('');
                                        setAuthError(false);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '2px solid #e5e7eb',
                                        background: 'white',
                                        color: '#6B7280',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f9fafb';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExpertAccess}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: LIGHT_BLUE,
                                        color: 'white',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = PRIMARY_DARK;
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = LIGHT_BLUE;
                                    }}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
            padding: '0', // Remove all padding
            margin: '0', // Remove all margin
            background: `linear-gradient(135deg, ${LIGHT_BLUE}, ${VERY_LIGHT_BLUE})`,
        }}>
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                padding: '0 15px', // Add horizontal padding only to inner container
                boxSizing: 'border-box'
            }}>
                {/* Logo with Image */}
                <Logo />

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
                                <div style={{
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
                                }}>
                                    {selectedOption === index && (
                                        <div style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: 'white'
                                        }} />
                                    )}
                                </div>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    textAlign: 'left',
                                    color: selectedOption === index ? PRIMARY_DARK : 'white'
                                }}>
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleOK}
                        disabled={selectedOption === null}
                        style={{
                            padding: '12px 40px',
                            borderRadius: '20px',
                            fontWeight: '800',
                            fontSize: '14px',
                            color: 'white',
                            textTransform: 'uppercase',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                            transition: 'transform 0.2s',
                            backgroundColor: selectedOption === null ? '#ccc' : GREEN_BUTTON,
                            borderBottom: `3px solid ${selectedOption === null ? '#999' : GREEN_SHADOW}`,
                            border: 'none',
                            cursor: selectedOption === null ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            margin: '0 auto',
                            opacity: selectedOption === null ? 0.6 : 1
                        }}
                        onMouseOver={(e) => {
                            if (selectedOption !== null) {
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }
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