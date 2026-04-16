import { useState, useEffect } from 'react';
import BlacklistSection from './BlacklistSection';
import CompanyOverview from './CompanyOverview';

export default function CompanyInfo({ companyData, blacklistedUniversities }) {
    const companyInfo = {
        companyName: companyData?.name || 'Google',
        domain: companyData?.sector || 'Software Development',
        location: companyData?.location || 'Bangalore, India',
    };

    const [students, setStudents] = useState([
        'Aarav Sharma',
        'Riya Patel',
        'Karan Mehta',
        'Mehul Jain',
        'Ananya Rao',
        'Rahul Verma',
        'Ishita Kapoor',
        'Dev Malhotra',
        'Sana Khan',
        'Pranav Nair',
        'Tanya Gupta',
        'Arjun Sen',
    ]);

    const [universities, setUniversities] = useState([]);
    const [activeModal, setActiveModal] = useState(null);
    const [inputValue, setInputValue] = useState('');

    const openModal = () => {
        setActiveModal('student');
        setInputValue('');
    };

    const closeModal = () => {
        setActiveModal(null);
        setInputValue('');
    };

    const handleAddItem = () => {
        const value = inputValue.trim();
        if (!value) {
            return;
        }

        if (activeModal === 'student') {
            setStudents((previous) => [value, ...previous]);
        }

        closeModal();
    };

    useEffect(() => {
        setUniversities(blacklistedUniversities);
    }, [blacklistedUniversities]);
    return (
        <section className='company-info-page'>
            <div className='company-info-scroll'>
                <CompanyOverview
                    companyName={companyInfo.companyName}
                    domain={companyInfo.domain}
                    location={companyInfo.location}
                />

                <BlacklistSection
                    students={students}
                    universities={universities}
                    onAddStudent={openModal}
                />
            </div>

            {activeModal ? (
                <div className='company-info-modal-overlay' role='dialog' aria-modal='true' aria-labelledby='company-info-modal-title'>
                    <div className='company-info-modal'>
                        <h3 className='company-info-modal-title' id='company-info-modal-title'>
                            Add Student
                        </h3>
                        <input
                            className='company-info-modal-input'
                            type='text'
                            value={inputValue}
                            onChange={(event) => setInputValue(event.target.value)}
                            placeholder='Enter student name'
                        />
                        <div className='company-info-modal-actions'>
                            <button type='button' className='company-info-modal-cancel' onClick={closeModal}>Cancel</button>
                            <button type='button' className='company-info-modal-confirm' onClick={handleAddItem}>Add</button>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
