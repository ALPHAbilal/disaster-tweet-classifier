const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Update your handleSubmit function
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);
  setResult(null);

  try {
    const response = await fetch(`${API_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: tweet }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    setResult({
      isEmergency: data.prediction === 'Disaster',
      confidence: data.confidence,
      disasterType: data.prediction === 'Disaster' ? 'Unknown' : 'None',
      explanation: data.prediction === 'Disaster' 
        ? 'This tweet contains patterns typically associated with disaster situations.'
        : 'This tweet lacks urgent language and specific details typically found in emergency reports.',
    });
  } catch (err) {
    setError('An error occurred while processing your request. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
