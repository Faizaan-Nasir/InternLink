import SearchIcon from '../assets/search-icon.png';

export default function SearchBar({
  id,
  value,
  onChange,
  placeholder = 'smart search',
  className = 'opportunities-search',
  inputClassName = 'opportunities-search-input',
  iconClassName = 'opportunities-search-image',
}) {
  return (
    <label className={className} htmlFor={id}>
      <input
        id={id}
        className={inputClassName}
        type='text'
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <img className={iconClassName} src={SearchIcon} alt='' aria-hidden='true' />
    </label>
  );
}
