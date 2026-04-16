export default function CompanyOverview({ companyName, domain, location }) {
    return (
        <section className='company-info-overview'>
            <h2 className='company-info-section-title'>Company Information</h2>

            <div className='info-row'>
                <span className='label'>Company Name</span>
                <span className='value'>{companyName}</span>
            </div>
            <div className='info-row'>
                <span className='label'>Domain</span>
                <span className='value'>{domain}</span>
            </div>
            <div className='info-row'>
                <span className='label'>Location</span>
                <span className='value'>{location}</span>
            </div>
        </section>
    );
}
