import BlacklistList from './BlacklistList';

export default function BlacklistSection({ students, universities }) {
    return (
        <section className='company-info-blacklists'>
            <h2 className='company-info-section-title'>Blacklists</h2>

            <div className='company-info-blacklists-grid'>
                <BlacklistList
                    title='Students Blacklist'
                    items={students}
                />
                <BlacklistList
                    title='Universities Blacklist'
                    items={universities}
                />
            </div>
        </section>
    );
}
