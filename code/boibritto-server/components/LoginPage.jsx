import React from 'react';

const LoginPage = ({ action, errorMessage }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFFFF 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        margin: '0 20px',
        padding: '48px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(245, 158, 11, 0.15), 0 0 0 1px rgba(245, 158, 11, 0.1)',
        border: '1px solid #FDE68A'
      }}>
        {/* Header with BoiBritto Branding */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#F59E0B',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
          }}>
            <span style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#FFFFFF'
            }}>
              B
            </span>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#92400E',
            marginBottom: '8px',
            margin: 0
          }}>
            BoiBritto Admin
          </h1>
          <p style={{
            color: '#6B7280',
            fontSize: '16px',
            margin: '8px 0 0 0'
          }}>
            Secure admin portal for content management
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            color: '#DC2626',
            padding: '16px',
            marginBottom: '32px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '8px', fontSize: '16px' }}>⚠️</span>
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form action={action} method="POST">
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#F59E0B';
                e.target.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E7EB';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="admin1@example.com"
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#F59E0B';
                e.target.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E7EB';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#D97706',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#B45309';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 20px rgba(180, 83, 9, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#D97706';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(217, 119, 6, 0.3)';
            }}
          >
            Sign In to Admin Panel
          </button>
        </form>

        {/* Security Notice */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          padding: '20px',
          backgroundColor: '#FEF3C7',
          borderRadius: '12px',
          border: '1px solid #FDE68A'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#92400E',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ marginRight: '8px', fontSize: '16px' }}>🔒</span>
            Secure Firebase authentication for BoiBritto administrators
          </p>
        </div>

        {/* Version Info */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px'
        }}>
          <p style={{
            fontSize: '12px',
            color: '#9CA3AF',
            margin: 0
          }}>
            BoiBritto Admin Panel v1.0 | Powered by AdminJS
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
