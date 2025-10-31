import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import asiriLogo from '../assets/asiri-logo.png';

const PRIMARY_BLUE = '#1591cbff';
const LIGHT_BLUE = '#57bef6ff';
const VERY_LIGHT_BLUE = '#a8e0ffff';

type Size = 'small' | 'medium' | 'large';

const HealthCardPage = () => {
    const [user, setUser] = useState({
        title: 'Mr.',
        name: '',
        email: '',
        phone: '',
        lifescore: 30,
    });
    const [bmiScore, setBmiScore] = useState('');
    const [rstScore, setRstScore] = useState('');
    const [bpScore, setBpScore] = useState('');
    const [logoError, setLogoError] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        loadUserData();
        loadQuizScore();
    }, []);

    const handleAddNewUser = () => {
        navigate("/");
    };

    const loadUserData = () => {
        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const userData = JSON.parse(savedUser);
                console.log('Loaded user data:', userData);
                setUser({
                    ...user,
                    title: userData.title || 'Mr.',
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    lifescore: userData.lifescore || 30,
                });
                setDataLoaded(true);
            } else {
                console.log('No user data found in local storage');
                setDataLoaded(true);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setDataLoaded(true);
        }
    };

    const loadQuizScore = () => {
        try {
            const quizResults = localStorage.getItem('quizResults');
            if (quizResults) {
                const results = JSON.parse(quizResults);
                console.log('Loaded quiz results:', results);

                if (results.percentage) {
                    setUser(prev => ({
                        ...prev,
                        lifescore: results.percentage
                    }));

                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        const userData = JSON.parse(savedUser);
                        localStorage.setItem('user', JSON.stringify({
                            ...userData,
                            lifescore: results.percentage
                        }));
                    }
                }
            }
        } catch (error) {
            console.error('Error loading quiz score:', error);
        }
    };

    const handleSendEmail = () => {
        if (!user.email) {
          //  alert('Please enter user email first');
            return;
        }

        if (!rstScore || !bpScore || !bmiScore) {
            //alert('Please enter all health scores first');
            return;
        }

        console.log(user);

        const templateParams = {
            name: user.name || 'User',
            email: user.email,
            title: user.title,
            message: `Your scores are:\n\nRST: ${rstScore}\nBP: ${bpScore}\nBMI: ${bmiScore}\nLifescore: ${user.lifescore}%`
        };

        const SERVICE_ID = 'service_g9ud6tf';
        const TEMPLATE_ID = 'template_10anx1u';
        const PUBLIC_KEY = 'GT67rJ-Rr-55GEzmS';

        emailjs
            .send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
            .then(() => {
               // alert('Email sent successfully!');
                setRstScore('');
                setBpScore('');
                setBmiScore('');
            })
            .catch((error) => {
                console.error('Email sending failed:', error);
               // alert('Failed to send email. Please try again.');
            });
    };

    const sendToWhatsApp = () => {
        if (!bmiScore || !rstScore || !bpScore) {
            //alert('Please enter all health scores first');
            return;
        }

        const message = `🏥 ASIRI HEALTH - Health Card Report

👤 Patient: ${user.title} ${user.name}

📊 Health Scores:
━━━━━━━━━━━━━━━━
💪 Lifescore: ${user.lifescore}%
📏 BMI Score: ${bmiScore}
🫀 RST Score: ${rstScore}
🩺 BP Score: ${bpScore}
━━━━━━━━━━━━━━━━

✅ Report generated successfully
📅 ${new Date().toLocaleDateString()}

Thank you for choosing ASIRI HEALTH`;

        const encodedMessage = encodeURIComponent(message);

        // ✅ KeyOS compatible WhatsApp
        if (user.phone && user.phone.trim() !== '') {
            const cleanedPhone = user.phone.replace(/\D/g, '');

            let phoneWithCountryCode = cleanedPhone;
            if (phoneWithCountryCode.startsWith('0')) {
                phoneWithCountryCode = '94' + phoneWithCountryCode.substring(1);
            } else if (!phoneWithCountryCode.startsWith('94')) {
                phoneWithCountryCode = '94' + phoneWithCountryCode;
            }

            console.log('Formatted phone number:', phoneWithCountryCode);

            // ✅ KeyOS primary method - wa.me
            const whatsappUrl = `https://wa.me/${phoneWithCountryCode}?text=${encodedMessage}`;
            console.log('WhatsApp URL:', whatsappUrl);

            window.open(whatsappUrl, '_blank');

        } else {
            // ✅ Phone number na-thiyenam, share krayi
            const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    const Logo = ({ size = 'medium' }: { size?: Size }) => {
        const sizes: Record<Size, { width: number; height: string }> = {
            small: { width: 100, height: 'auto' },
            medium: { width: 140, height: 'auto' },
            large: { width: 180, height: 'auto' }
        };

        const { width, height } = sizes[size] || sizes.medium;

        if (logoError) {
            return (
                <div className="text-center text-white font-bold">
                    <div className="text-xl tracking-wide mb-1">ASIRI</div>
                    <div className="text-md">HEALTH</div>
                    <div className="text-xs font-normal opacity-90">Lifescore</div>
                </div>
            );
        }

        return (
            <div className="flex justify-center items-center mx-auto py-2">
                <img
                    src={asiriLogo}
                    alt="Asiri Health Lifescore"
                    style={{
                        width: width,
                        height: height,
                        objectFit: 'contain'
                    }}
                    onError={() => setLogoError(true)}
                />
            </div>
        );
    };

    const progress = user.lifescore / 100;
    const CIRCLE_SIZE = 100;
    const STROKE_WIDTH = 10;
    const radius = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    const getHealthMessage = () => {
        if (user.lifescore >= 80) return {
            text: 'Excellent! Keep it up!',
            emoji: '🌟'
        };
        if (user.lifescore >= 60) return {
            text: 'Good job!',
            emoji: '👍'
        };
        if (user.lifescore >= 40) return {
            text: 'Fair',
            emoji: '💪'
        };
        return {
            text: 'Needs work',
            emoji: '🎯'
        };
    };

    const healthMessage = getHealthMessage();

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            background: `linear-gradient(180deg, ${PRIMARY_BLUE} 0%, ${LIGHT_BLUE} 50%, ${VERY_LIGHT_BLUE} 100%)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0',
            margin: '0',
            boxSizing: 'border-box',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            overflow: 'auto'
        }}>
            <div className="w-full flex flex-col flex-1">
                {/* Header with Logo - White Background */}
                <div className="relative bg-white text-blue-800 p-4 flex-shrink-0">
                    <div className="absolute top-1 right-3 w-12 h-12 rounded-full bg-blue-100" />
                    <div className="absolute -bottom-3 left-1 w-16 h-16 rounded-full bg-blue-50" />

                    {/* Logo */}
                    <div className="relative z-10">
                        <Logo size="medium" />
                    </div>
                </div>

                {/* Main Content - Scrollable area */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto w-full max-w-md mx-auto">
                    {/* Add New User Button - Centered */}
                    <div className="text-center mb-2">
                        <button
                            onClick={handleAddNewUser}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors shadow-md flex items-center justify-center mx-auto"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="mr-2">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                            Add New User
                        </button>
                    </div>

                    {user.name && (
                        <div className="text-center">
                            <p className="text-xs text-gray-600">
                                Current User: {user.title} {user.name}
                            </p>
                            {user.phone && (
                                <p className="text-xs text-gray-600 mt-1">
                                    📱 {user.phone}
                                </p>
                            )}
                        </div>
                    )}
                    {!user.name && dataLoaded && (
                        <p className="text-xs text-yellow-600 text-center">
                            No user data found. Please register first.
                        </p>
                    )}

                    {/* User Info */}
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 bg-white rounded-full border-4 border-blue-400 flex items-center justify-center text-2xl shadow-lg">
                            👤
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {user.title} {user.name || 'No User Data'}
                        </h2>
                        <p className="text-xs text-gray-600">Health Card Member</p>
                    </div>

                    {/* Lifescore Section */}
                    <div className="bg-white border-2 border-blue-200 p-4 text-center rounded-lg shadow-md">
                        <p className="text-sm font-bold text-gray-800 mb-3 tracking-wide">
                            📊 YOUR LIFESCORE
                        </p>

                        <div className="inline-block">
                            <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                                <defs>
                                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8800ff" />
                                        <stop offset="100%" stopColor="#ff5202" />
                                    </linearGradient>
                                </defs>
                                <circle
                                    cx={CIRCLE_SIZE / 2}
                                    cy={CIRCLE_SIZE / 2}
                                    r={radius}
                                    stroke="#e5e7eb"
                                    strokeWidth={STROKE_WIDTH}
                                    fill="none"
                                />
                                <circle
                                    cx={CIRCLE_SIZE / 2}
                                    cy={CIRCLE_SIZE / 2}
                                    r={radius}
                                    stroke="url(#scoreGrad)"
                                    strokeWidth={STROKE_WIDTH}
                                    fill="none"
                                    strokeDasharray={`${circumference} ${circumference}`}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
                                    className="transition-all duration-1000"
                                />
                                <text
                                    x={CIRCLE_SIZE / 2}
                                    y={CIRCLE_SIZE / 2 + 5}
                                    fontSize="18"
                                    fontWeight="bold"
                                    fill="#1f2937"
                                    textAnchor="middle"
                                >
                                    {user.lifescore}%
                                </text>
                            </svg>
                        </div>

                        {/* Health Status Message */}
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-2xl mb-1">{healthMessage.emoji}</div>
                            <p className="text-sm font-semibold text-gray-800 mb-1">
                                {healthMessage.text}
                            </p>
                            <p className="text-xs text-gray-600">
                                {user.lifescore >= 60 ? 'Good health status' : 'Focus on improving your health'}
                            </p>
                        </div>

                        <p className="text-xs text-gray-500 mt-2 italic">
                            Based on your health assessment
                        </p>
                    </div>

                    {/* Health Scores */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <span>🏥</span>
                            <span>Additional Health Scores</span>
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label htmlFor="bmi" className="text-xs font-semibold text-gray-800 mb-1 block">
                                    💪 BMI Score
                                </label>
                                <input
                                    id="bmi"
                                    type="text"
                                    placeholder="Enter BMI score"
                                    value={bmiScore}
                                    onChange={(e) => setBmiScore(e.target.value)}
                                    className="w-full h-10 border-2 border-blue-200 bg-white rounded-md px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="rst" className="text-xs font-semibold text-gray-800 mb-1 block">
                                    🫀 RST Score
                                </label>
                                <input
                                    id="rst"
                                    type="text"
                                    placeholder="Enter RST score"
                                    value={rstScore}
                                    onChange={(e) => setRstScore(e.target.value)}
                                    className="w-full h-10 border-2 border-blue-200 bg-white rounded-md px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="bp" className="text-xs font-semibold text-gray-800 mb-1 block">
                                    🩺 BP Score
                                </label>
                                <input
                                    id="bp"
                                    type="text"
                                    placeholder="Enter BP score"
                                    value={bpScore}
                                    onChange={(e) => setBpScore(e.target.value)}
                                    className="w-full h-10 border-2 border-blue-200 bg-white rounded-md px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 mt-6">
                        <button
                            onClick={handleSendEmail}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md"
                        >
                            📧 Send Email Report
                        </button>

                        <button
                            onClick={sendToWhatsApp}
                            className="w-full h-12 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-md flex items-center justify-center"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="mr-2">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            {user.phone ? 'Send WhatsApp to User' : 'Share on WhatsApp'}
                        </button>
                    </div>

                    <p className="text-center text-xs text-gray-600 mt-2">
                        🔒 Your health data is secure and private
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HealthCardPage;