import ErrorMessage from '../ErrorMessage';

export default function ErrorMessageExample() {
  return (
    <div className="max-w-3xl">
      <ErrorMessage 
        message="The financial data service is temporarily unavailable. Please try again in a few moments."
        onRetry={() => console.log('Retry clicked')}
      />
    </div>
  );
}
