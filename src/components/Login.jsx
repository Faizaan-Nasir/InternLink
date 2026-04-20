import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.png';

async function tryLogin(supabase, email, password) {
  if (!supabase) {
    return false;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    console.error(error);
    return false;
  } else {
    console.log("Logged in", data.user);
    return true;
  }
}

export default function Login({ supabase, errorMessage }) {
  const navigate = useNavigate();
  const [loginFailed, setLoginFailed] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    const isSuccessful = await tryLogin(supabase, email, password);
    setLoginFailed(!isSuccessful);
  };

  return (
    <section className='login-page'>
      <div className='login-brand'>
        <img src={Logo} alt='InternLink logo' className='login-logo' />
        <p className='login-tagline'>Student opportunities, organized in one place.</p>
      </div>

      <div className='login-card'>
        <div className='login-card-header'>
          <h1 className='login-title'>Welcome back</h1>
          <p className='login-subtitle'>
            Sign in to continue tracking opportunities, applications, and responses.
          </p>
        </div>

        <form className='login-form' onSubmit={handleLogin}>

          <label className='login-field'>
            <span className='login-label'>Email</span>
            <input className='login-input' type='email' name="email" placeholder='name@college.edu' />
          </label>

          <label className='login-field'>
            <span className='login-label'>Password</span>
            <input className='login-input' type='password' name="password" placeholder='Enter your password' />
          </label>

          <div className='login-actions'>
            <button className='login-submit' type='submit'>
              Sign in
            </button>
            <button className='login-secondary' type='button' onClick={() => navigate('/register')}>
              Create account
            </button>
          </div>

          {loginFailed ? <p className='login-failure'>Email and password do not match.</p> : null}
          {errorMessage ? <p className='login-failure'>{errorMessage}</p> : null}
        </form>
      </div>
    </section>
  );
}
