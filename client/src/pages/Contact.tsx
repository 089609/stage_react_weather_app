import React, { useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
        
        
import { Toast } from 'primereact/toast';
        
        
        

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Minimaal 2 tekens.').max(100, 'Maximaal 100 tekens.'),
  email: z.string().trim().email('Voer een geldig e-mailadres in.'),
  message: z.string().trim().min(5, 'Minimaal 5 tekens.').max(500, 'Maximaal 500 tekens.'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const Contact: React.FC = () => {
  const toastRef = useRef<Toast | null>(null);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting, isValid }, } = useForm<ContactFormValues>({
    defaultValues: { name: '', email: '', message: '' },
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    resolver: zodResolver(contactSchema),
    criteriaMode: 'firstError',
    delayError: 200,
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const response = await fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Verzenden mislukt');
      }
      toastRef.current?.show({ severity: 'success', summary: 'Verzonden', detail: 'Bedankt! Je bericht is verzonden.', life: 2500 });
      reset();
    } catch (error) {
      toastRef.current?.show({ severity: 'error', summary: 'Fout', detail: 'Er ging iets mis. Probeer het opnieuw.', life: 3000 });
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 14,
    transition: 'border-color .2s ease, box-shadow .2s ease, background-color .2s ease',
  };

  // legacy: labels are now handled by FloatLabel
  const fieldStyle: React.CSSProperties = { marginBottom: 20 };

  return (
    <section style={{
      padding: '2rem 1rem',
      maxWidth: 760,
      margin: '0 auto',
      background: 'var(--surface-ground)',
      borderRadius: 12,
      transition: 'background-color .2s ease, box-shadow .2s ease',
    }}>
      <Toast ref={toastRef} position="top-right" />
      <Card title="Contact" style={{
        boxShadow: '0 2px 14px rgba(0,0,0,0.08)',
        border: '1px solid var(--surface-border)',
        background: 'var(--surface-card)',
        transition: 'background-color .2s ease, border-color .2s ease, box-shadow .2s ease'
      }}>
        <p>Heb je vragen of feedback? Vul het formulier in en we nemen contact op.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={fieldStyle}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Naam</label>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon">
                <i className="pi pi-user" />
              </span>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <InputText
                    id="name"
                    type="text"
                    style={inputStyle}
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-help' : undefined}
                    invalid={!!errors.name}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>
            {errors.name && (
              <div id="name-help" className="p-error" style={{ marginTop: 6 }}>{errors.name.message}</div>
            )}
          </div>

          <div style={fieldStyle}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>E-mail</label>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon">
                <i className="pi pi-envelope" />
              </span>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <InputText
                    id="email"
                    type="email"
                    style={inputStyle}
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-help' : undefined}
                    invalid={!!errors.email}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.trim())}
                  />
                )}
              />
            </div>
            {errors.email && (
              <div id="email-help" className="p-error" style={{ marginTop: 6 }}>{errors.email.message}</div>
            )}
          </div>

          <div style={fieldStyle}>
            <label htmlFor="message" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Bericht</label>
            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <InputTextarea
                  id="message"
                  rows={6}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  aria-invalid={!!errors.message}
                  aria-describedby={`message-help message-count`}
                  maxLength={500}
                  invalid={!!errors.message}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
            {errors.message && (
              <div id="message-help" className="p-error" style={{ marginTop: 6 }}>{errors.message.message}</div>
            )}
            <div id="message-count" style={{ color: '#6b7280', marginTop: 6, fontSize: 12 }}>
              Max 500 tekens
            </div>
          </div>

          <Button type="submit" rounded disabled={!isValid || isSubmitting} loading={isSubmitting} icon="pi pi-send" iconPos="left" className="p-button-raised">
            Verstuur
          </Button>
        </form>
      </Card>
    </section>
  );
};

export default Contact;


