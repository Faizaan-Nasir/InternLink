import { useState } from 'react';

export default function BlacklistList({ title, items, buttonLabel, onAdd }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const activeItem = items.includes(selectedItem) ? selectedItem : (items[0] ?? null);

    return (
        <div className='company-info-blacklist-column'>
            <div className='company-info-blacklist-head'>
                <h3 className='company-info-blacklist-title'>{title}</h3>
                <button type='button' className='company-info-add-btn' onClick={onAdd}>{buttonLabel}</button>
            </div>

            <div className='company-info-tabs-scroll'>
                {items.map((item) => (
                    <button
                        key={item}
                        type='button'
                        className={`panel-row applicants-row company-info-tab${activeItem === item ? ' panel-row-selected' : ''}`}
                        onClick={() => setSelectedItem(item)}
                    >
                        <span className='applicants-row-name'>{item}</span>
                        <span className='applicants-row-meta'>Blacklisted</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
