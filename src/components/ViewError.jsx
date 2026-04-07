export default function ViewError() {
  return (
    <section className='view-error'>
      <div className='view-error-card'>
        <h1 className='view-error-title'>Screen Size Not Supported</h1>
        <p className='view-error-message'>
          This web app is currently designed for a larger desktop viewport. Please resize your
          window or switch to a supported screen size to view the dashboard properly.
        </p>
      </div>
    </section>
  );
}
