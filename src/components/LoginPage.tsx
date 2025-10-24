import  { useState } from 'react';
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

    // Asiri Health colors
    const PRIMARY_BLUE = '#0071bc';
    const LIGHT_BLUE = '#2ea7e0';
    const VERY_LIGHT_BLUE = '#b3e5ff';

    const handleSubmit = async () => {
        if (!name.trim() || !phone.trim() || !email.trim()) {
            alert('Please enter your name, phone number and email.');
            return;
        }

        const newUser: User = { title: selectedTitle, name, phone, email };

        try {
            await registerUser(newUser);
            alert('Registration successful!');
            navigate("/quiz",{state:{user:newUser}}); // Go to Quiz page
        } catch (err) {
            alert('Registration failed! Check console.');
        }
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
                    style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '-5px' }}
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
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '3px', display: 'block' }}>Name</label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setNameFocused(true)}
                        onBlur={() => setNameFocused(false)}
                        style={{
                            width: '100%',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '10px 10px',
                            border: `2px solid ${nameFocused ? PRIMARY_BLUE : 'transparent'}`,
                            fontSize: '15px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Phone Input */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '3px', display: 'block' }}>Phone No</label>
                    <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onFocus={() => setPhoneFocused(true)}
                        onBlur={() => setPhoneFocused(false)}
                        style={{
                            width: '100%',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '10px 10px',
                            border: `2px solid ${phoneFocused ? PRIMARY_BLUE : 'transparent'}`,
                            fontSize: '15px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Email Input */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '3px', display: 'block' }}>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        style={{
                            width: '100%',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '10px 10px',
                            border: `2px solid ${emailFocused ? PRIMARY_BLUE : 'transparent'}`,
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
