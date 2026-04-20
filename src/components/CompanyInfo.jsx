import { useEffect, useState } from 'react';
import BlacklistSection from './BlacklistSection';
import CompanyOverview from './CompanyOverview';

export default function CompanyInfo({ companyData, blacklistedUniversities, blacklistedStudents }) {
    const companyInfo = {
        companyName: companyData?.name || 'Google',
        domain: companyData?.sector || 'Software Development',
        location: companyData?.location || 'Bangalore, India',
    };

    const [universities, setUniversities] = useState([]);

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
                    students={blacklistedStudents}
                    universities={universities}
                />
            </div>
        </section>
    );
}
