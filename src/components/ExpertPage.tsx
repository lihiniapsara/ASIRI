import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
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
        lifescore: 30,
    });
    const [bmiScore, setBmiScore] = useState('');
    const [rstScore, setRstScore] = useState('');
    const [bpScore, setBpScore] = useState('');
    const [logoError, setLogoError] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [autoDownloaded, setAutoDownloaded] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    // Auto download effect when all scores are entered
    useEffect(() => {
        if (bmiScore && rstScore && bpScore && !autoDownloaded && dataLoaded) {
            // Wait for 3 seconds then auto download
            const timer = setTimeout(() => {
                handleDownloadComprehensivePDF();
                setAutoDownloaded(true);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [bmiScore, rstScore, bpScore, autoDownloaded, dataLoaded]);

    const loadUserData = () => {
        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const userData = JSON.parse(savedUser);
                setUser({
                    ...user,
                    title: userData.title || 'Mr.',
                    name: userData.name || '',
                    email: userData.email || '',
                    lifescore: userData.lifescore || 30,
                });
                setDataLoaded(true);
            } else {
                setDataLoaded(true);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setDataLoaded(true);
        }
    };

    const refreshUserData = () => {
        loadUserData();
    };

    // Enhanced Comprehensive PDF Download Function with Better Design
    const handleDownloadComprehensivePDF = () => {
        if (isDownloading) return;

        setIsDownloading(true);

        setTimeout(() => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const questionnaireResults = JSON.parse(localStorage.getItem('questionnaireResults') || '{}');

                // Create new PDF document
                const pdf = new jsPDF();
                let yPosition = 20;
                const pageWidth = pdf.internal.pageSize.getWidth();
                const margin = 20;

                // Add gradient header
                pdf.setFillColor(21, 145, 203); // PRIMARY_BLUE
                pdf.rect(0, 0, pageWidth, 50, 'F');

                // Add decorative elements
                pdf.setFillColor(255, 255, 255, 0.3);
                pdf.circle(30, 25, 15, 'F');
                pdf.circle(pageWidth - 30, 35, 12, 'F');

                // Header content
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(24);
                pdf.setFont('helvetica', 'bold');
                pdf.text('🏥 ASIRI HEALTH', pageWidth / 2, 20, { align: 'center' });

                pdf.setFontSize(14);
                pdf.setFont('helvetica', 'normal');
                pdf.text('COMPREHENSIVE HEALTH REPORT', pageWidth / 2, 30, { align: 'center' });

                pdf.setFontSize(10);
                pdf.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, 40, { align: 'center' });

                yPosition = 65;

                // Patient Information Section with emoji
                pdf.setFillColor(245, 249, 255);
                pdf.roundedRect(margin - 5, yPosition - 10, pageWidth - (margin * 2), 35, 3, 3, 'F');

                pdf.setTextColor(21, 145, 203);
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text('👤 PATIENT INFORMATION', margin, yPosition);
                yPosition += 15;

                pdf.setTextColor(0, 0, 0);
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');

                const patientInfo = [
                    `🎯 Name: ${user.title || ''} ${user.name || 'Not provided'}`,
                    `📧 Email: ${user.email || 'Not provided'}`,
                    `📅 Report Date: ${new Date().toLocaleDateString()}`,
                    `⏰ Report Time: ${new Date().toLocaleTimeString()}`
                ];

                patientInfo.forEach(info => {
                    pdf.text(info, margin, yPosition);
                    yPosition += 6;
                });

                yPosition += 10;

                // Health Scores Summary with colorful boxes
                pdf.setTextColor(21, 145, 203);
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text('📊 HEALTH SCORES SUMMARY', margin, yPosition);
                yPosition += 15;

                const scores = [
                    { emoji: '💖', label: 'Overall Lifescore', value: `${user.lifescore || 30}%`, color: [21, 145, 203] },
                    { emoji: '📏', label: 'BMI Score', value: bmiScore || 'Not provided', color: [86, 188, 246] },
                    { emoji: '🩸', label: 'RBS Score', value: rstScore || 'Not provided', color: [135, 206, 250] },
                    { emoji: '❤️', label: 'BP Score', value: bpScore || 'Not provided', color: [173, 216, 230] }
                ];

                scores.forEach((score, index) => {
                    const x = margin + (index % 2) * 85;
                    const y = yPosition + Math.floor(index / 2) * 25;

                    pdf.setFillColor(score.color[0], score.color[1], score.color[2], 0.1);
                    pdf.roundedRect(x, y - 8, 80, 20, 3, 3, 'F');

                    pdf.setTextColor(0, 0, 0);
                    pdf.setFontSize(8);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`${score.emoji} ${score.label}`, x + 5, y);

                    pdf.setFontSize(9);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor(score.color[0], score.color[1], score.color[2]);
                    pdf.text(score.value, x + 5, y + 8);
                });

                yPosition += 35;

                // Health Assessment with status indicator
                pdf.setTextColor(21, 145, 203);
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text('🎯 HEALTH ASSESSMENT', margin, yPosition);
                yPosition += 15;

                const healthStatus = getHealthStatus();
                const statusColor = user.lifescore >= 60 ? [34, 197, 94] : user.lifescore >= 40 ? [234, 179, 8] : [239, 68, 68];

                pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2], 0.1);
                pdf.roundedRect(margin, yPosition - 8, pageWidth - (margin * 2), 25, 3, 3, 'F');

                pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.text(`📈 ${healthStatus.text}`, margin + 5, yPosition);

                pdf.setTextColor(0, 0, 0);
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');
                pdf.text(healthStatus.message, margin + 5, yPosition + 8);

                yPosition += 30;

                // Progress bar for lifescore
                const progressWidth = pageWidth - (margin * 2);
                const filledWidth = (progressWidth * (user.lifescore || 30)) / 100;

                pdf.setFillColor(229, 231, 235);
                pdf.rect(margin, yPosition, progressWidth, 8, 'F');

                pdf.setFillColor(21, 145, 203);
                pdf.rect(margin, yPosition, filledWidth, 8, 'F');

                pdf.setTextColor(0, 0, 0);
                pdf.setFontSize(8);
                pdf.text(`Lifescore Progress: ${user.lifescore || 30}%`, margin, yPosition - 3);

                yPosition += 15;

                // Detailed Health Analysis
                if (yPosition > 200) {
                    pdf.addPage();
                    yPosition = 30;
                }

                pdf.setTextColor(21, 145, 203);
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text('🔍 DETAILED HEALTH ANALYSIS', margin, yPosition);
                yPosition += 15;

                const analysis = getDetailedAnalysis();
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(0, 0, 0);

                analysis.forEach((item, index) => {
                    if (yPosition > 270) {
                        pdf.addPage();
                        yPosition = 30;
                    }

                    const emoji = item.includes('underweight') ? '⚠️' :
                        item.includes('healthy') ? '✅' :
                            item.includes('overweight') ? '📊' :
                                item.includes('obesity') ? '🔴' :
                                    item.includes('normal') ? '👍' :
                                        item.includes('pre-diabetes') ? '🟡' :
                                            item.includes('diabetes') ? '🔴' :
                                                item.includes('Blood Pressure') ? '❤️' :
                                                    item.includes('Lifescore') ? '💖' : '📝';

                    pdf.text(`${emoji} ${item}`, margin, yPosition);
                    yPosition += 6;
                });

                yPosition += 10;

                // Health Recommendations
                if (yPosition > 220) {
                    pdf.addPage();
                    yPosition = 30;
                }

                pdf.setTextColor(21, 145, 203);
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text('💡 HEALTH RECOMMENDATIONS', margin, yPosition);
                yPosition += 15;

                const recommendations = getHealthRecommendations();
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(0, 0, 0);

                recommendations.forEach((rec, index) => {
                    if (yPosition > 270) {
                        pdf.addPage();
                        yPosition = 30;
                    }

                    const emojis = ['🏥', '🥗', '🏃', '💧', '😴', '🧘', '🚫', '🚭', '📊', '👨‍⚕️'];
                    const emoji = emojis[index] || '✅';

                    pdf.text(`${emoji} ${rec}`, margin, yPosition);
                    yPosition += 6;
                });

                yPosition += 10;

                // Questionnaire Results (if available)
                if (questionnaireResults.scores && questionnaireResults.scores.length > 0) {
                    if (yPosition > 240) {
                        pdf.addPage();
                        yPosition = 30;
                    }

                    pdf.setTextColor(21, 145, 203);
                    pdf.setFontSize(16);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text('📝 QUESTIONNAIRE RESULTS', margin, yPosition);
                    yPosition += 15;

                    const totalScore = questionnaireResults.scores.reduce((sum: number, score: number) => sum + score, 0);
                    const percentage = Math.round((totalScore / 400) * 100);

                    pdf.setFillColor(245, 249, 255);
                    pdf.roundedRect(margin, yPosition - 5, pageWidth - (margin * 2), 15, 3, 3, 'F');

                    pdf.setTextColor(0, 0, 0);
                    pdf.setFontSize(10);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`📊 Total Questionnaire Score: ${totalScore}/400 (${percentage}%)`, margin + 5, yPosition);
                    yPosition += 12;

                    const questions = [
                        '💧 How many liters of water do you drink daily?',
                        '👣 Days with 10,000+ steps this week?',
                        '🍔 Days eating out this week?',
                        '🌙 Your routine 1 hour before bedtime?'
                    ];

                    questions.forEach((q, idx) => {
                        if (yPosition > 270) {
                            pdf.addPage();
                            yPosition = 30;
                        }

                        pdf.setTextColor(21, 145, 203);
                        pdf.setFontSize(9);
                        pdf.setFont('helvetica', 'bold');
                        pdf.text(`Q${idx + 1}:`, margin, yPosition);

                        pdf.setTextColor(0, 0, 0);
                        pdf.text(q.substring(4), margin + 15, yPosition);
                        yPosition += 5;

                        pdf.setTextColor(100, 100, 100);
                        pdf.setFontSize(8);
                        pdf.text(`🎯 Score: ${questionnaireResults.scores[idx]} points`, margin + 20, yPosition);
                        yPosition += 8;
                    });
                    yPosition += 10;
                }

                // Footer with decorative elements
                pdf.setFillColor(21, 145, 203, 0.1);
                pdf.rect(0, pdf.internal.pageSize.getHeight() - 30, pageWidth, 30, 'F');

                pdf.setTextColor(100, 100, 100);
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'normal');
                pdf.text('🏥 This comprehensive health report is generated by Asiri Health Lifescore System.', margin, pdf.internal.pageSize.getHeight() - 20);
                pdf.text('👨‍⚕️ For detailed medical advice, please consult with qualified healthcare professionals.', margin, pdf.internal.pageSize.getHeight() - 15);
                pdf.text(`📋 Report ID: ASR${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`, margin, pdf.internal.pageSize.getHeight() - 10);

                // Add page numbers
                const pageCount = pdf.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    pdf.setPage(i);
                    pdf.setTextColor(150, 150, 150);
                    pdf.setFontSize(8);
                    pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 25, pdf.internal.pageSize.getHeight() - 10);
                }

                // Save PDF
                const patientName = user.name ? user.name.replace(/\s+/g, '_') : 'Patient';
                pdf.save(`Asiri_Comprehensive_Health_Report_${patientName}_${new Date().toISOString().split('T')[0]}.pdf`);

                setIsDownloading(false);

            } catch (error) {
                console.error('PDF generation failed:', error);
                setIsDownloading(false);
                // Fallback to simple download
                handleDownloadSimpleReport();
            }
        }, 1500);
    };

    // Simple Text Report (Backup)
    const handleDownloadSimpleReport = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const questionnaireResults = JSON.parse(localStorage.getItem('questionnaireResults') || '{}');

        const reportContent = `
🏥 ASIRI HEALTH - COMPREHENSIVE HEALTH REPORT
===========================================

👤 PATIENT INFORMATION
----------------------
🎯 Name: ${user.title || ''} ${user.name || 'Not provided'}
📧 Email: ${user.email || 'Not provided'}
📅 Report Date: ${new Date().toLocaleDateString()}
⏰ Report Time: ${new Date().toLocaleTimeString()}

📊 HEALTH SCORES
----------------
💖 Overall Lifescore: ${user.lifescore || 30}%
📏 BMI Score: ${bmiScore || 'Not provided'}
🩸 RBS Score: ${rstScore || 'Not provided'}
❤️ BP Score: ${bpScore || 'Not provided'}

🎯 HEALTH ASSESSMENT
--------------------
${getHealthStatus().text}
${getHealthStatus().message}

${questionnaireResults.scores && questionnaireResults.scores.length > 0 ? `
📝 QUESTIONNAIRE RESULTS
------------------------
📊 Total Score: ${questionnaireResults.scores.reduce((sum: number, score: number) => sum + score, 0)}/400
` : ''}

🔍 DETAILED ANALYSIS
--------------------
${getDetailedAnalysis().join('\n')}

💡 HEALTH RECOMMENDATIONS
-------------------------
${getHealthRecommendations().join('\n')}

📋 IMPORTANT NOTES
------------------
🏥 This report combines your health scores and questionnaire results
✅ Results are for informational purposes only
🩺 Regular health checkups are recommended
👨‍⚕️ Consult healthcare professionals for medical advice

Generated by: Asiri Health Lifescore System
        `.trim();

        try {
            const blob = new Blob([reportContent], { type: 'text/plain; charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            const patientName = user.name ? user.name.replace(/\s+/g, '_') : 'Patient';
            a.download = `Asiri_Health_Report_${patientName}_${new Date().toISOString().split('T')[0]}.txt`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    // Helper functions
    const getHealthStatus = () => {
        const lifescore = user.lifescore || 30;

        if (lifescore >= 80) return {
            text: '🌟 EXCELLENT HEALTH STATUS',
            message: 'You maintain excellent overall health. Keep up the good habits!'
        };
        if (lifescore >= 60) return {
            text: '👍 GOOD HEALTH STATUS',
            message: 'You have good health with some areas for improvement.'
        };
        if (lifescore >= 40) return {
            text: '💪 FAIR HEALTH STATUS',
            message: 'Your health needs attention in some areas.'
        };
        return {
            text: '🎯 NEEDS IMPROVEMENT',
            message: 'Focus on developing healthier lifestyle habits.'
        };
    };

    const getDetailedAnalysis = () => {
        const analysis = [];

        if (bmiScore) {
            const bmi = parseFloat(bmiScore);
            if (bmi < 18.5) analysis.push('BMI indicates underweight - Consider nutritional consultation and balanced diet');
            else if (bmi >= 18.5 && bmi <= 24.9) analysis.push('BMI is in healthy range - Maintain current weight with regular exercise');
            else if (bmi >= 25 && bmi <= 29.9) analysis.push('BMI indicates overweight - Consider weight management program');
            else analysis.push('BMI indicates obesity - Medical consultation and lifestyle changes recommended');
        }

        if (rstScore) {
            const rbs = parseFloat(rstScore);
            if (rbs < 100) analysis.push('RBS levels are normal - Maintain healthy diet and regular monitoring');
            else if (rbs >= 100 && rbs <= 125) analysis.push('RBS indicates pre-diabetes - Monitor sugar intake and increase physical activity');
            else analysis.push('RBS indicates diabetes risk - Immediate medical consultation and dietary changes advised');
        }

        if (bpScore) {
            analysis.push(`Blood Pressure: ${bpScore} - Regular monitoring and lifestyle modifications recommended`);
        }

        const status = getHealthStatus();
        analysis.push(`Overall Lifescore ${user.lifescore}% - ${status.message}`);

        return analysis;
    };

    const getHealthRecommendations = () => {
        const recommendations = [
            'Maintain regular health checkups every 6 months',
            'Follow a balanced diet rich in fruits and vegetables',
            'Engage in 30 minutes of physical activity daily',
            'Drink 2-3 liters of water daily for proper hydration',
            'Get 7-8 hours of quality sleep each night',
            'Practice stress management techniques like meditation',
            'Limit processed foods and sugar intake',
            'Avoid smoking and limit alcohol consumption',
            'Monitor your health scores regularly',
            'Consult healthcare professionals for personalized advice'
        ];
        return recommendations;
    };

    const handleSendEmail = async () => {
        if (!user.email) {
            alert('Please set your email address first');
            return;
        }

        if (!rstScore || !bpScore || !bmiScore) {
            alert('Please enter all health scores (BMI, RBS, BP)');
            return;
        }

        try {
            console.log('Sending email to:', user.email);

            // Use environment variable or fallback
            const API_KEY = import.meta.env.VITE_BREVO_API_KEY;

            if (!API_KEY) {
                alert('Email service is not configured. Please download the PDF report instead.');
                return;
            }

            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': API_KEY,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: {
                        name: 'Asiri Health Lifescore',
                        email: 'ASIRILIFESCOPEBASE@GMAIL.COM'
                    },
                    to: [{
                        email: user.email,
                        name: `${user.title} ${user.name || 'User'}`
                    }],
                    subject: 'Your Comprehensive Health Report from Asiri Health',
                    htmlContent: `
                        <html>
                            <head>
                                <style>
                                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                    h2 { color: #1591cb; }
                                    p { margin-bottom: 10px; }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <h2>🏥 Comprehensive Health Report</h2>
                                    <p><strong>👤 Name:</strong> ${user.title} ${user.name}</p>
                                    <p><strong>📊 Your health scores:</strong></p>
                                    <ul>
                                        <li>💖 Lifescore: ${user.lifescore}%</li>
                                        <li>📏 BMI: ${bmiScore}</li>
                                        <li>🩸 RBS: ${rstScore}</li>
                                        <li>❤️ BP: ${bpScore}</li>
                                    </ul>
                                    <p><strong>🎯 Status:</strong> ${getHealthStatus().text}</p>
                                    <p>Thank you for using Asiri Health Lifescore! 🌟</p>
                                    <p>Best regards,<br>Asiri Health Team</p>
                                </div>
                            </body>
                        </html>
                    `
                })
            });

            if (response.ok) {
                console.log('Email sent successfully via Brevo');
                alert('Health report sent successfully to your email!');
                setRstScore('');
                setBpScore('');
                setBmiScore('');
                setAutoDownloaded(false);
            } else {
                console.error('Email sending failed via Brevo:', await response.text());
                alert('Failed to send email. Please try again later.');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('An error occurred while sending the email. Please download the PDF report instead.');
        }
    };

    const sendToWhatsApp = () => {
        if (!bmiScore || !rstScore || !bpScore) {
            alert('Please enter all health scores (BMI, RBS, BP)');
            return;
        }

        const message = `🏥 *ASIRI HEALTH - Comprehensive Health Report*

👤 *Patient Information:*
━━━━━━━━━━━━━━━━━━━━━━
🎯 *Name:* ${user.title} ${user.name}
📧 *Email:* ${user.email || 'Not provided'}
📅 *Report Date:* ${new Date().toLocaleDateString()}
⏰ *Report Time:* ${new Date().toLocaleTimeString()}

📊 *Health Scores Summary:*
━━━━━━━━━━━━━━━━━━━━━━
💖 *Lifescore:* ${user.lifescore}%
📏 *BMI Score:* ${bmiScore}
🩸 *RBS Score:* ${rstScore}
❤️ *BP Score:* ${bpScore}

🎯 *Health Assessment:*
━━━━━━━━━━━━━━━━━━━━━━
${getHealthStatus().text}
${getHealthStatus().message}

💡 *Key Recommendations:*
━━━━━━━━━━━━━━━━━━━━━━
• 🏥 Regular health checkups
• 🥗 Balanced diet
• 🏃 Daily exercise
• 💧 Proper hydration

_Thank you for choosing ASIRI HEALTH_ 🌟`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    };

    // Logo Component
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
                    {/* Auto Download Status */}
                    {isDownloading && (
                        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-blue-800 font-semibold text-sm">
                                    🏥 Generating Comprehensive Health Report...
                                </span>
                            </div>
                            <p className="text-blue-600 text-xs mt-1">
                                PDF will download automatically when ready
                            </p>
                        </div>
                    )}

                    {!isDownloading && bmiScore && rstScore && bpScore && autoDownloaded && (
                        <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center space-x-2">
                                <span className="text-green-600 text-lg">✅</span>
                                <span className="text-green-800 font-semibold text-sm">
                                    📄 Comprehensive Report Downloaded!
                                </span>
                            </div>
                            <p className="text-green-600 text-xs mt-1">
                                Check your downloads folder for the PDF
                            </p>
                        </div>
                    )}

                    {/* Refresh Button */}
                    <div className="text-center mb-2">
                        <button
                            onClick={refreshUserData}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-md flex items-center justify-center mx-auto"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" className="mr-2">
                                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                            </svg>
                            🔄 Refresh User Data
                        </button>
                        {user.name && (
                            <p className="text-xs text-gray-600 mt-1">
                                👤 Loaded: {user.title} {user.name}
                            </p>
                        )}
                        {!user.name && dataLoaded && (
                            <p className="text-xs text-yellow-600 mt-1">
                                ⚠️ No user data found. Please register first.
                            </p>
                        )}
                    </div>

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

                        <p className="text-xs text-gray-600 mt-2 italic">
                            {user.lifescore >= 60 ? '✅ Good health status' : '🎯 Focus on improving your health'}
                        </p>
                    </div>

                    {/* Health Scores */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <span>🏥</span>
                            <span>Health Scores {bmiScore && rstScore && bpScore && '✅'}</span>
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label htmlFor="bmi" className="text-xs font-semibold text-gray-800 mb-1 block">
                                    📏 BMI Score
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
                                    🩸 RBS Score
                                </label>
                                <input
                                    id="rst"
                                    type="text"
                                    placeholder="Enter RBS score"
                                    value={rstScore}
                                    onChange={(e) => setRstScore(e.target.value)}
                                    className="w-full h-10 border-2 border-blue-200 bg-white rounded-md px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="bp" className="text-xs font-semibold text-gray-800 mb-1 block">
                                    ❤️ BP Score
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

                        {/* Auto Download Info */}
                        {bmiScore && rstScore && bpScore && !autoDownloaded && (
                            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-center">
                                <p className="text-yellow-800 text-sm font-semibold">
                                    ⚡ Comprehensive report will download automatically in a few seconds...
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 mt-6">
                        <button
                            onClick={handleDownloadComprehensivePDF}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                            </svg>
                            📄 Download Comprehensive Report
                        </button>

                        <button
                            onClick={handleSendEmail}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            📧 Send Email Report
                        </button>

                        <button
                            onClick={sendToWhatsApp}
                            className="w-full h-12 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-md flex items-center justify-center"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="mr-2">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            💬 Share on WhatsApp
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