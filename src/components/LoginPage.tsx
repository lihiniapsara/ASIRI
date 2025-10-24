import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Logo from '../assets/asiri-logo.png';
import { registerUser } from '../services/userService';
import type {User} from "../types/User.ts";

const Welcome = () => {
    const navigate = useNavigate();

    const [selectedTitle, setSelectedTitle] = useState<'Mr.' | 'Mrs.' | 'Miss.'>('Mr.');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [nameFocused, setNameFocused] = useState(false);
    const [phoneFocused, setPhoneFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);

    // Validation states
    const [errors, setErrors] = useState({
        name: '',
        phone: '',
        email: ''
    });
    const [touched, setTouched] = useState({
        name: false,
        phone: false,
        email: false
    });

    // Asiri Health colors
    const PRIMARY_BLUE = '#0071bc';
    const LIGHT_BLUE = '#2ea7e0';
    const VERY_LIGHT_BLUE = '#b3e5ff';
    const ERROR_RED = '#dc3545';

    // Validation functions
    const validateName = (name: string) => {
        if (!name.trim()) {
            return 'Name is required';
        }
        if (name.trim().length < 2) {
            return 'Name must be at least 2 characters long';
        }
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            return 'Name can only contain letters and spaces';
        }
        return '';
    };

    const validatePhone = (phone: string) => {
        if (!phone.trim()) {
            return 'Phone number is required';
        }
        // Sri Lankan phone number format: 07XXXXXXXX or +947XXXXXXXX
        const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return 'Please enter a valid Sri Lankan phone number';
        }
        return '';
    };

    const validateEmail = (email: string) => {
        if (!email.trim()) {
            return 'Email is required';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    // Validate all fields
    const validateForm = () => {
        const nameError = validateName(name);
        const phoneError = validatePhone(phone);
        const emailError = validateEmail(email);

        setErrors({
            name: nameError,
            phone: phoneError,
            email: emailError
        });

        // Mark all fields as touched to show errors
        setTouched({
            name: true,
            phone: true,
            email: true
        });

        return !nameError && !phoneError && !emailError;
    };

    // Handle field blur events
    const handleNameBlur = () => {
        setNameFocused(false);
        setTouched(prev => ({ ...prev, name: true }));
        setErrors(prev => ({ ...prev, name: validateName(name) }));
    };

    const handlePhoneBlur = () => {
        setPhoneFocused(false);
        setTouched(prev => ({ ...prev, phone: true }));
        setErrors(prev => ({ ...prev, phone: validatePhone(phone) }));
    };

    const handleEmailBlur = () => {
        setEmailFocused(false);
        setTouched(prev => ({ ...prev, email: true }));
        setErrors(prev => ({ ...prev, email: validateEmail(email) }));
    };

    // Real-time validation on change (optional)
    const handleNameChange = (value: string) => {
        setName(value);
        if (touched.name) {
            setErrors(prev => ({ ...prev, name: validateName(value) }));
        }
    };

    const handlePhoneChange = (value: string) => {
        setPhone(value);
        if (touched.phone) {
            setErrors(prev => ({ ...prev, phone: validatePhone(value) }));
        }
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (touched.email) {
            setErrors(prev => ({ ...prev, email: validateEmail(value) }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            // Scroll to first error
            const firstErrorField = document.querySelector('[data-has-error="true"]');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const newUser: User = {
            title: selectedTitle,
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim()
        };

        try {
            await registerUser(newUser);

            // ✅ LOCAL STORAGE එකට SAVE කරන්න
            const userData = {
                title: selectedTitle,
                name: name.trim(),
                timestamp: Date.now()
            };
            localStorage.setItem('currentUser', JSON.stringify(userData));

            // ✅ STORAGE EVENT TRIGGER කරන්න
            window.dispatchEvent(new Event('storage'));


            navigate("/quiz", { state: { user: newUser } }); // Go to Quiz page
        } catch (err) {

            console.error(err);
        }
    };

    // Helper function to get input border color
    const getInputBorderColor = (focused: boolean, hasError: boolean, error: string) => {
        if (hasError && error) return ERROR_RED;
        return focused ? PRIMARY_BLUE : 'transparent';
    };

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
            {/* Top white curved section */}
            <div style={{
                width: '100%',
                background: 'white',
                borderBottomLeftRadius: '0 0',
                borderBottomRightRadius: '0 0',
                clipPath: 'ellipse(100% 100% at 50% 0%)',
                paddingBottom: '30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <img
                    src={Logo}
                    alt="Asiri Logo"
                    style={{ width: '300px', height: '190px', objectFit: 'contain', marginBottom: '-5px' }}
                />
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: PRIMARY_BLUE,
                    margin: '0',
                    textAlign: 'center'
                }}>
                    You are Welcome!
                </h1>
            </div>

            {/* Form section */}
            <div style={{ width: '100%', maxWidth: '400px', padding: '20px 20px', marginTop: '-10px' }}>
                <h2 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: '15px',
                    lineHeight: '1.5'
                }}>
                    To register enter<br />your Name, Phone no & Email
                </h2>

                {/* Title Selector */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '3px', display: 'block' }}>Title</label>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        {['Mr.', 'Mrs.', 'Miss.'].map((title) => (
                            <button
                                key={title}
                                onClick={() => setSelectedTitle(title as 'Mr.' | 'Mrs.' | 'Miss.')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '5px 15px',
                                    flex: '1',
                                    border: selectedTitle === title ? '2px solid white' : '1px solid rgba(255,255,255,0.5)',
                                    borderRadius: '8px',
                                    backgroundColor: selectedTitle === title ? 'rgba(255,255,255,0.2)' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    border: '2px solid white',
                                    borderRadius: '50%',
                                    marginRight: '6px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: selectedTitle === title ? 'white' : 'transparent'
                                }}>
                                    {selectedTitle === title && (
                                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: PRIMARY_BLUE }}>✓</span>
                                    )}
                                </div>
                                {title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Name Input */}
                <div
                    style={{ marginBottom: '16px' }}
                    data-has-error={touched.name && !!errors.name}
                >
                    <label style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '3px', display: 'block' }}>
                        Name
                        {touched.name && errors.name && (
                            <span style={{ color: ERROR_RED, fontSize: '12px', marginLeft: '8px' }}>
                                {errors.name}
                            </span>
                        )}
                    </label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onFocus={() => setNameFocused(true)}
                        onBlur={handleNameBlur}
                        style={{
                            width: '100%',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '10px 10px',
                            border: `2px solid ${getInputBorderColor(nameFocused, touched.name, errors.name)}`,
                            fontSize: '15px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Phone Input */}
                <div
                    style={{ marginBottom: '16px' }}
                    data-has-error={touched.phone && !!errors.phone}
                >
                    <label style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '3px', display: 'block' }}>
                        Phone No
                        {touched.phone && errors.phone && (
                            <span style={{ color: ERROR_RED, fontSize: '12px', marginLeft: '8px' }}>
                                {errors.phone}
                            </span>
                        )}
                    </label>
                    <input
                        type="tel"
                        placeholder="Enter your phone number (07XXXXXXXX)"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        onFocus={() => setPhoneFocused(true)}
                        onBlur={handlePhoneBlur}
                        style={{
                            width: '100%',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '10px 10px',
                            border: `2px solid ${getInputBorderColor(phoneFocused, touched.phone, errors.phone)}`,
                            fontSize: '15px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Email Input */}
                <div
                    style={{ marginBottom: '24px' }}
                    data-has-error={touched.email && !!errors.email}
                >
                    <label style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '3px', display: 'block' }}>
                        Email
                        {touched.email && errors.email && (
                            <span style={{ color: ERROR_RED, fontSize: '12px', marginLeft: '8px' }}>
                                {errors.email}
                            </span>
                        )}
                    </label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={handleEmailBlur}
                        style={{
                            width: '100%',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '10px 10px',
                            border: `2px solid ${getInputBorderColor(emailFocused, touched.email, errors.email)}`,
                            fontSize: '15px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    style={{
                        width: '50%',
                        height: '42px',
                        margin: '8px auto 0',
                        display: 'block',
                        borderRadius: '25px',
                        border: '2px solid #003d66',
                        background: `linear-gradient(135deg, ${PRIMARY_BLUE}, ${LIGHT_BLUE})`,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s',
                        outline: 'none'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(0) scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(-2px) scale(1)'}
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default Welcome;