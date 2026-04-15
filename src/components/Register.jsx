import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png';

const CATEGORY_OPTIONS = ['Student', 'University', 'Company'];

function getCategoryMeta(category) {
    if (category === 'Student') {
        return {
            title: 'Student details',
            fields: [
                { key: 'rollNumber', label: 'Roll Number', placeholder: 'e.g., 201810001' },
            ],
        };
    }

    if (category === 'University') {
        return {
            title: 'University details',
            fields: [
                { key: 'name', label: 'Name', placeholder: 'Manipal Bangalore' },
                { key: 'location', label: 'Location', placeholder: 'Bangalore' },
                {
                    key: 'subtitle',
                    label: 'Subtitle',
                    placeholder: 'Central Internship and Placement Dashboard',
                },
            ],
        };
    }

    if (category === 'Company') {
        return {
            title: 'Company details',
            fields: [
                { key: 'name', label: 'Name', placeholder: 'OpenAI Inc.' },
                { key: 'sector', label: 'Sector', placeholder: 'Technology' },
                { key: 'location', label: 'Location', placeholder: 'Bengaluru' },
            ],
        };
    }

    return { title: '', fields: [] };
}

export default function Register({ supabase }) {
    const navigate = useNavigate();
    const [category, setCategory] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const categoryMeta = getCategoryMeta(category);
    const isCategoryChosen = Boolean(category);

    function areCredentialsValid() {
        if (!email.trim() || !password || !confirmPassword) {
            setFormError('Fill email, password, and confirm password before continuing.');
            return false;
        }

        if (password !== confirmPassword) {
            setFormError('Password and confirm password do not match.');
            return false;
        }

        return true;
    }

    function handleCategoryChange(event) {
        const nextCategory = event.target.value;
        setCategory(nextCategory);
        setSubmitted(false);
        setFormError('');
    }

    function handleResetCategory() {
        setCategory('');
        setSubmitted(false);
        setFormError('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!isCategoryChosen) {
            setSubmitted(false);
            setFormError('Select a category to continue.');
            return;
        }

        if (!areCredentialsValid()) {
            setSubmitted(false);
            return;
        }

        if (category === 'Student') {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: email.trim(),
                password: password
            });
            if (signUpError) {
                console.error('Error during sign up:', signUpError);
                setFormError('An error occurred during account creation. Please try again.');
                return;
            }
            const { error: profileError } = await supabase.from('profiles').insert({
                id: signUpData.user.id,
                email: email.trim(),
                category: 'Student',
                sid: event.target.rollNumber.value.trim()
            });
            if (profileError) {
                console.error('Error creating profile:', profileError);
                setFormError('Your university has not yet registered you in the system. Please contact your university administration to get registered before creating an account.');
                await supabase.auth.admin.deleteUser(signUpData.user.id);
                return;
            }
        }
        // if (category === 'University') {
        //     const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        //         email: email.trim(),
        //         password: password
        //     });

        //     if (signUpError) {
        //         console.error(signUpError);
        //         setFormError(signUpError.message);
        //         return;
        //     }

        //     const { error: signInError } = await supabase.auth.signInWithPassword({
        //         email: email.trim(),
        //         password: password
        //     });

        //     if (signInError) {
        //         console.error(signInError);
        //         setFormError("Failed to establish session.");
        //         return;
        //     }

        //     const { data: userData } = await supabase.auth.getUser();
        //     const user = userData?.user;

        //     if (!user) {
        //         setFormError("User session not found.");
        //         return;
        //     }

        //     const { error: profileError } = await supabase
        //         .from('profiles')
        //         .insert({
        //             id: user.id,
        //             email: email.trim(),
        //             category: 'University'
        //         });

        //     if (profileError) {
        //         console.error(profileError);
        //         setFormError("Failed to create profile.");
        //         return;
        //     }

        //     const { data: uidData, error: uidError } = await supabase
        //         .from('profiles')
        //         .select('university_id')
        //         .eq('id', user.id)
        //         .maybeSingle();

        //     if (uidError || !uidData?.university_id) {
        //         console.error(uidError);
        //         setFormError("Failed to fetch university ID.");
        //         return;
        //     }

        //     const { error: universityError } = await supabase
        //         .from('Universities')
        //         .insert({
        //             university_id: uidData.university_id,
        //             name: event.target.name.value.trim(),
        //             location: event.target.location.value.trim(),
        //             subtitle: event.target.subtitle.value.trim()
        //         });

        //     if (universityError) {
        //         console.error(universityError);
        //         setFormError("Failed to create university.");
        //         return;
        //     }
        // }
        // } else if (category === 'University') {
        //     const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        //         email: email.trim(),
        //         password: password
        //     });
        //     if (signUpError) {
        //         console.error('Error during sign up:', signUpError);
        //         setFormError('An error occurred during account creation. Please try again.');
        //         return;
        //     }
        //     const { data: profileData, error: profileError } = await supabase.from('profiles').insert({
        //         id: signUpData.user.id,
        //         email: email.trim(),
        //         category: 'University',
        //         uid: 
        //     });
        //     if (profileError) {
        //         console.error('Error creating profile:', profileError);
        //         setFormError('An error occurred while creating your profile. Please try again.');
        //         return;
        //     }
        //     const { data: universityData, error: universityError } = await supabase.from('Universities').insert({
        //         name: event.target.name.value.trim(),
        //         location: event.target.location.value.trim(),
        //         subtitle: event.target.subtitle.value.trim(),
        //     }).select('university_id').single();
        //     if (universityError) {
        //         console.error('Error creating university:', universityError);
        //         setFormError('An error occurred while creating the university profile. Please try again.');
        //         return;
        //     }
        // } else if (category === 'Company') {
        //     const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        //         email: email.trim(),
        //         password: password
        //     });
        //     if (signUpError) {
        //         console.error('Error during sign up:', signUpError);
        //         setFormError('An error occurred during account creation. Please try again.');
        //         return;
        //     }
        //     const { data: companyData, error: companyError } = await supabase.from('Companies').insert({
        //         name: event.target.name.value.trim(),
        //         sector: event.target.sector.value.trim(),
        //         location: event.target.location.value.trim(),
        //     }).select('cid').single();
        //     if (companyError) {
        //         console.error('Error creating company:', companyError);
        //         setFormError('An error occurred while creating the company profile. Please try again.');
        //         return;
        //     }
        //     const { data: profileData, error: profileError } = await supabase.from('profiles').insert({
        //         id: signUpData.user.id,
        //         email: email.trim(),
        //         category: 'Company',
        //     });
        //     if (profileError) {
        //         console.error('Error creating profile:', profileError);
        //         setFormError('An error occurred while creating your profile. Please try again.');
        //         return;
        //     }
        // }

        setFormError('');
        setSubmitted(true);
    }

    return (
        <section className='login-page register-page'>
            <div className='login-brand'>
                <img src={Logo} alt='InternLink logo' className='login-logo' />
                <p className='login-tagline'>Internship opportunities, organized in one place.</p>
            </div>

            <div className='login-card register-card'>
                <div className='login-card-header'>
                    <h1 className='login-title'>Create account</h1>
                    <p className='login-subtitle'>
                        Set up your profile to start using InternLink.
                    </p>
                </div>

                <div className='register-form-shell'>
                    <form className='login-form register-form' onSubmit={handleSubmit}>
                        {!isCategoryChosen ? (
                            <>
                                <label className='login-field'>
                                    <span className='login-label'>Category</span>
                                    <select
                                        className='login-input register-select'
                                        name='category'
                                        value={category}
                                        onChange={handleCategoryChange}
                                    >
                                        <option value='' disabled>
                                            Select category
                                        </option>
                                        {CATEGORY_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <p className='register-step-copy'>
                                    Pick your account category to continue.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className='register-selection'>
                                    <p className='register-selection-value'>{category}</p>
                                    <button
                                        type='button'
                                        className='login-secondary register-edit-btn'
                                        onClick={handleResetCategory}
                                    >
                                        Change category
                                    </button>
                                </div>

                                <label className='login-field'>
                                    <span className='login-label'>Email</span>
                                    <input
                                        className='login-input'
                                        type='email'
                                        name='email'
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder='name@college.edu'
                                        required
                                    />
                                </label>

                                <div className='register-row'>
                                    <label className='login-field register-row-field'>
                                        <span className='login-label'>Password</span>
                                        <input
                                            className='login-input'
                                            type='password'
                                            name='password'
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            placeholder='Create a password'
                                            required
                                        />
                                    </label>

                                    <label className='login-field register-row-field'>
                                        <span className='login-label'>Confirm password</span>
                                        <input
                                            className='login-input'
                                            type='password'
                                            name='confirmPassword'
                                            value={confirmPassword}
                                            onChange={(event) => setConfirmPassword(event.target.value)}
                                            placeholder='Re-enter password'
                                            required
                                        />
                                    </label>
                                </div>

                                {categoryMeta.fields.length > 0 ? (
                                    <div className='register-extra-group'>
                                        <p className='register-extra-title'>{categoryMeta.title}</p>
                                        {categoryMeta.fields.map((field) => (
                                            <label key={field.key} className='login-field'>
                                                <span className='login-label'>{field.label}</span>
                                                <input
                                                    className='login-input'
                                                    type='text'
                                                    name={field.key}
                                                    placeholder={field.placeholder}
                                                    required
                                                />
                                            </label>
                                        ))}
                                    </div>
                                ) : null}

                                <div className='login-actions register-actions'>
                                    <button className='login-submit' type='submit'>
                                        Create account
                                    </button>
                                    <button
                                        className='login-secondary'
                                        type='button'
                                        onClick={() => navigate('/login')}
                                    >
                                        Back to sign in
                                    </button>
                                </div>
                            </>
                        )}

                        {formError ? <p className='register-error'>{formError}</p> : null}
                        {submitted ? (
                            <p className='register-success'>
                                Account form looks good. Submit handler can now be connected to auth.
                            </p>
                        ) : null}
                    </form>
                </div>
            </div>
        </section>
    );
}
