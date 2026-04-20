import { useEffect, useState } from 'react';
import BlacklistSection from './BlacklistSection';
import CompanyOverview from './CompanyOverview';

export default function CompanyInfo({
    companyData,
    blacklistedUniversities,
    blacklistedStudents,
    onRemoveBlacklistedStudent,
    onRemoveBlacklistedUniversity
}) {
    const companyInfo = {
        companyName: companyData?.name || 'Google',
        domain: companyData?.sector || 'Software Development',
        location: companyData?.location || 'Bangalore, India',
    };

    const [universities, setUniversities] = useState([]);
    const [removeModal, setRemoveModal] = useState(null);
    const [isRemoving, setIsRemoving] = useState(false);
    const [removeError, setRemoveError] = useState('');

    useEffect(() => {
        setUniversities(blacklistedUniversities);
    }, [blacklistedUniversities]);

    function openRemoveModal(listType, name) {
        const itemName = (name ?? '').trim();
        if (!itemName || itemName === 'Loading...') {
            return;
        }

        setRemoveError('');
        setRemoveModal({ listType, name: itemName });
    }

    function closeRemoveModal() {
        if (isRemoving) {
            return;
        }

        setRemoveModal(null);
        setRemoveError('');
    }

    async function confirmRemoveFromBlacklist() {
        if (!removeModal) {
            return;
        }

        setIsRemoving(true);
        setRemoveError('');

        const { error } = removeModal.listType === 'student'
            ? await onRemoveBlacklistedStudent(removeModal.name)
            : await onRemoveBlacklistedUniversity(removeModal.name);

        if (error) {
            setRemoveError('Could not remove this blacklist entry. Please try again.');
            setIsRemoving(false);
            return;
        }

        setIsRemoving(false);
        setRemoveModal(null);
    }

    const selectedListLabel = removeModal?.listType === 'student' ? 'Student Blacklist' : 'University Blacklist';

    return (
        <section className='company-info-page'>
            <div className='company-info-scroll'>
                <CompanyOverview
                    companyName={companyInfo.companyName}
                    domain={companyInfo.domain}
                    location={companyInfo.location}
                />

                <BlacklistSection
                    students={blacklistedStudents}
                    universities={universities}
                    onBlacklistItemClick={openRemoveModal}
                />
            </div>

            {removeModal ? (
                <div
                    className='company-info-modal-overlay'
                    role='dialog'
                    aria-modal='true'
                    aria-labelledby='company-info-modal-title'
                >
                    <div className='company-info-modal'>
                        <h3 className='company-info-modal-title' id='company-info-modal-title'>
                            Manage Blacklist Entry
                        </h3>
                        <p className='company-info-modal-message'>
                            <strong>{removeModal.name}</strong> is in <strong>{selectedListLabel}</strong>.
                            Remove this blacklist entry?
                        </p>
                        {removeError ? (
                            <p className='company-info-modal-error' role='alert'>
                                {removeError}
                            </p>
                        ) : null}
                        <div className='company-info-modal-actions'>
                            <button
                                type='button'
                                className='company-info-modal-cancel'
                                onClick={closeRemoveModal}
                                disabled={isRemoving}
                            >
                                Retain Blacklist
                            </button>
                            <button
                                type='button'
                                className='company-info-modal-confirm'
                                onClick={confirmRemoveFromBlacklist}
                                disabled={isRemoving}
                            >
                                {isRemoving ? 'Removing...' : 'Remove Blacklist'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
