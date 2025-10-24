import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

interface UserData {
    email?: string;
    name?: string;
}

const HealthCardPage = () => {
    const [rstScore, setRstScore] = useState<string>('');
    const [bpScore, setBpScore] = useState<string>('');
    const [bmiScore, setBmiScore] = useState<string>('');
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            setUserData(JSON.parse(user));
        }
    }, []);

    const handleSendEmail = () => {
        if (!userData?.email) {
            alert('User email not found. Please log in again.');
            return;
        }

        if (!rstScore || !bpScore || !bmiScore) {
            alert('Please fill in all score fields');
            return;
        }

        console.log(userData)

        // EmailJS parameters
        const templateParams = {
            name: userData.name || 'User',
            email: userData.email,
            title: user.title,
            message: `Your scores are: RST - ${rstScore}, BP - ${bpScore}, BMI - ${bmiScore}.`
        };

        // Replace with your actual EmailJS credentials
        const SERVICE_ID = 'service_43k5omt';
        const TEMPLATE_ID = 'template_su223cy';
        const PUBLIC_KEY = 'TABzRK7DGS_KJI5Ox';

        emailjs
            .send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
            .then(() => {
                alert('Email sent successfully!');
                setRstScore('');
                setBpScore('');
                setBmiScore('');
            })
            .catch((error) => {
                console.error('Email sending failed:', error);
                alert('Failed to send email. Check console for details.');
            });
    };

    // Sample user data for display
    const user = {
        title: 'Mr.',
        name: 'Samantha',
        lifescore: 30,
    };

    const progress = user.lifescore / 100;
    const CIRCLE_SIZE = 120;
    const STROKE_WIDTH = 12;
    const radius = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    const PRIMARY_BLUE = '#0071bc';
    const DARK_NAVY = '#040326';

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '350px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                    padding: '24px',
                    border: '1px solid #e0e0e0',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '40px',
                        backgroundColor: PRIMARY_BLUE,
                        borderRadius: '12px 12px 0 0',
                    }}
                ></div>

                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <div
                        style={{
                            marginBottom: '16px',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: PRIMARY_BLUE,
                            letterSpacing: '2px',
                        }}
                    >
                        ASIRI HEALTH
                    </div>

                    <h2
                        style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: PRIMARY_BLUE,
                            margin: '0 0 16px 0',
                            textAlign: 'center',
                        }}
                    >
                        {user.title} {user.name}
                    </h2>

                    <div
                        style={{
                            width: '80px',
                            height: '80px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '50%',
                            border: `3px solid ${PRIMARY_BLUE}`,
                            margin: '0 auto 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            color: '#999',
                        }}
                    >
                        👤
                    </div>

                    {/* Lifescore circle */}
                    <div style={{ marginBottom: '24px' }}>
                        <p
                            style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: DARK_NAVY,
                                margin: '0 0 12px 0',
                                textAlign: 'center',
                            }}
                        >
                            Lifescore
                        </p>
                        <svg
                            width={CIRCLE_SIZE}
                            height={CIRCLE_SIZE}
                            style={{ display: 'block', margin: '0 auto' }}
                        >
                            <defs>
                                <linearGradient id="grad" x1="0%" y1="80%" x2="100%" y2="50%">
                                    <stop offset="0%" stopColor="#8800ff" />
                                    <stop offset="100%" stopColor="#ff5202" />
                                </linearGradient>
                            </defs>
                            <circle
                                cx={CIRCLE_SIZE / 2}
                                cy={CIRCLE_SIZE / 2}
                                r={radius}
                                stroke="#e6e6e6"
                                strokeWidth={STROKE_WIDTH}
                                fill="none"
                            />
                            <circle
                                cx={CIRCLE_SIZE / 2}
                                cy={CIRCLE_SIZE / 2}
                                r={radius}
                                stroke="url(#grad)"
                                strokeWidth={STROKE_WIDTH}
                                fill="none"
                                strokeDasharray={`${circumference} ${circumference}`}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
                            />
                            <text
                                x={CIRCLE_SIZE / 2}
                                y={CIRCLE_SIZE / 2 + 4}
                                fontSize="20"
                                fontWeight="bold"
                                fill={DARK_NAVY}
                                textAnchor="middle"
                            >
                                {user.lifescore}%
                            </text>
                        </svg>
                    </div>

                    {/* Input fields */}
                    <div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: DARK_NAVY }}>
                                BMI Score
                            </label>
                            <input
                                type="text"
                                value={bmiScore}
                                onChange={(e) => setBmiScore(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: DARK_NAVY }}>
                                RST Score
                            </label>
                            <input
                                type="text"
                                value={rstScore}
                                onChange={(e) => setRstScore(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: DARK_NAVY }}>
                                BP Score
                            </label>
                            <input
                                type="text"
                                value={bpScore}
                                onChange={(e) => setBpScore(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                }}
                            />
                        </div>

                        <button
                            style={{
                                marginTop: '16px',
                                width: '100%',
                                padding: '8px 12px',
                                background: PRIMARY_BLUE,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                cursor: 'pointer',
                            }}
                            onClick={handleSendEmail}
                        >
                            Send Email
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthCardPage;