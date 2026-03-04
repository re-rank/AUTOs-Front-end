import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : '로그인 실패';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : '회원가입 실패';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
  }

  if (mode === 'register') {
    return (
      <div className="auth-screen">
        <div className="auth-box">
          <h2>회원가입</h2>
          <p className="subtitle">새 계정을 만드세요</p>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름 입력"
              />
            </div>
            <div className="form-group">
              <label>이메일 *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
              />
            </div>
            <div className="form-group">
              <label>비밀번호 *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="비밀번호 입력"
                minLength={6}
              />
            </div>
            {error && (
              <div style={{ color: '#d63031', fontSize: '13px', textAlign: 'center', marginBottom: '8px' }}>
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </form>
          <div className="switch-link">
            이미 계정이 있으신가요?{' '}
            <a onClick={() => switchMode('login')}>로그인</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <h2>자동주문 시스템</h2>
        <p className="subtitle">로그인하여 시작하세요</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
            />
          </div>
          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="비밀번호 입력"
            />
          </div>
          {error && (
            <div style={{ color: '#d63031', fontSize: '13px', textAlign: 'center', marginBottom: '8px' }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className="switch-link">
          계정이 없으신가요?{' '}
          <a onClick={() => switchMode('register')}>회원가입</a>
        </div>
      </div>
    </div>
  );
}
