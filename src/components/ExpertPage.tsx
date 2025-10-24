import React from 'react';

const HealthCardPage = () => {
    // Hardcoded user data from the image
    const user = {
        title: 'Mr.',
        name: 'Samantha',
        lifescore: 30, // percentage
    };

    // Donut chart variables
    const progress = user.lifescore / 100;
    const CIRCLE_SIZE = 120;
    const STROKE_WIDTH = 12;
    const radius = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    // Colors from theme
    const PRIMARY_BLUE = '#0071bc';
    const DARK_NAVY = '#040326';

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '350px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                padding: '24px',
                border: '1px solid #e0e0e0',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Top border curve simulation with gradient or just styling */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '40px',
                    backgroundColor: PRIMARY_BLUE,
                    borderRadius: '12px 12px 0 0'
                }}></div>

                {/* Main content starts below top bar */}
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    {/* Logo - assume imported or use placeholder */}
                    <div style={{
                        marginBottom: '16px',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: PRIMARY_BLUE,
                        letterSpacing: '2px'
                    }}>
                        ASIRI HEALTH
                    </div>

                    {/* User Name */}
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: PRIMARY_BLUE,
                        margin: '0 0 16px 0',
                        textAlign: 'center'
                    }}>
                        {user.title} {user.name}
                    </h2>

                    {/* Profile Photo Placeholder */}
                    <div style={{
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
                        color: '#999'
                    }}>
                        👤
                    </div>

                    {/* Lifescore Section */}
                    <div style={{ marginBottom: '24px' }}>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: DARK_NAVY,
                            margin: '0 0 12px 0',
                            textAlign: 'center'
                        }}>
                            Lifescore
                        </p>
                        <div style={{ position: 'relative' }}>
                            <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={{ display: 'block', margin: '0 auto' }}>
                                <defs>
                                    <linearGradient id="grad" x1="0%" y1="80%" x2="100%" y2="50%">
                                        <stop offset="0%" stopColor="#8800ff" />
                                        <stop offset="100%" stopColor="#ff5202" />
                                    </linearGradient>
                                </defs>
                                {/* Background circle */}
                                <circle
                                    cx={CIRCLE_SIZE / 2}
                                    cy={CIRCLE_SIZE / 2}
                                    r={radius}
                                    stroke="#e6e6e6"
                                    strokeWidth={STROKE_WIDTH}
                                    fill="none"
                                />
                                {/* Progress circle */}
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
                                {/* Percentage text */}
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
                    </div>

                    {/* Health Scores Inputs */}
                    <div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: DARK_NAVY,
                                marginBottom: '4px'
                            }}>
                                BMI Score
                            </label>
                            <input
                                type="text"
                                placeholder=""
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: DARK_NAVY,
                                marginBottom: '4px'
                            }}>
                                RST Score
                            </label>
                            <input
                                type="text"
                                placeholder=""
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '0' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: DARK_NAVY,
                                marginBottom: '4px'
                            }}>
                                BP Score
                            </label>
                            <input
                                type="text"
                                placeholder=""
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthCardPage;