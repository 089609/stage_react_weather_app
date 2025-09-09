import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    const hasAt = email.includes('@');
    const isValid = name.trim() && email.trim() && message.trim() && hasAt;
    if (!isValid) {
      setSubmitted(false);
      return;
    }
    // Geldig: reset velden en toon succesmelding
    setName('');
    setEmail('');
    setMessage('');
    setSubmitted(true);
    setAttemptedSubmit(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 14,
  };

  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 6, fontWeight: 600 };
  const fieldStyle: React.CSSProperties = { marginBottom: 14 };

  return (
    <section style={{ padding: '1rem', maxWidth: 700, margin: '0 auto' }}>
      <h1>Contact</h1>
      <p>Heb je vragen of feedback? Vul het formulier in en we nemen contact op.</p>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: 16 }}>
        <div style={fieldStyle}>
          <label htmlFor="name" style={labelStyle}>Naam</label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Jouw naam"
            style={inputStyle}
          />
          {attemptedSubmit && !name.trim() && (
            <div style={{ color: 'crimson', marginTop: 6 }}>Naam is verplicht.</div>
          )}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="email" style={labelStyle}>E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="jij@voorbeeld.nl"
            style={inputStyle}
          />
          {attemptedSubmit && !email.trim() && (
            <div style={{ color: 'crimson', marginTop: 6 }}>E-mail is verplicht.</div>
          )}
          {attemptedSubmit && email.trim() && !email.includes('@') && (
            <div style={{ color: 'crimson', marginTop: 6 }}>E-mail moet een '@' bevatten.</div>
          )}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="message" style={labelStyle}>Bericht</label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Schrijf hier je bericht..."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
          {attemptedSubmit && !message.trim() && (
            <div style={{ color: 'crimson', marginTop: 6 }}>Bericht is verplicht.</div>
          )}
        </div>

        <button type="submit" style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #222', background: '#222', color: '#fff', cursor: 'pointer' }}>
          Verstuur
        </button>
      </form>

      {submitted && (
        <div style={{ marginTop: 16, color: 'green' }}>Bedankt! Je bericht is verzonden.</div>
      )}
    </section>
  );
};

export default Contact;


