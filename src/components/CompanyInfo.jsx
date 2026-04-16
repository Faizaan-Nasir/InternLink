import { useState } from 'react';
import BlacklistSection from './BlacklistSection';
import CompanyOverview from './CompanyOverview';

export default function CompanyInfo({ companyData }) {
    console.log('Received company data:', companyData);
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

    const [universities, setUniversities] = useState([
        'IIT Delhi',
        'VIT Vellore',
        'NIT Trichy',
        'BITS Pilani',
        'IIT Bombay',
        'IIT Madras',
        'IIIT Hyderabad',
        'SRM University',
        'Delhi Technological University',
        'Manipal Institute of Technology',
        'PES University',
        'Anna University',
    ]);

    const [activeModal, setActiveModal] = useState(null);
    const [inputValue, setInputValue] = useState('');

    const openModal = (type) => {
        setActiveModal(type);
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

        if (activeModal === 'university') {
            setUniversities((previous) => [value, ...previous]);
        }

        closeModal();
    };

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
                    onAddStudent={() => openModal('student')}
                    onAddUniversity={() => openModal('university')}
                />
            </div>

            {activeModal ? (
                <div className='company-info-modal-overlay' role='dialog' aria-modal='true' aria-labelledby='company-info-modal-title'>
                    <div className='company-info-modal'>
                        <h3 className='company-info-modal-title' id='company-info-modal-title'>
                            {activeModal === 'student' ? 'Add Student' : 'Add University'}
                        </h3>
                        <input
                            className='company-info-modal-input'
                            type='text'
                            value={inputValue}
                            onChange={(event) => setInputValue(event.target.value)}
                            placeholder={activeModal === 'student' ? 'Enter student name' : 'Enter university name'}
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
