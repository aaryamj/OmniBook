import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PatientFeedbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const apptId = searchParams.get('appt_id');
  const token = searchParams.get('token');

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apptId || !token) {
      setError('Invalid or missing feedback link.');
    }
  }, [apptId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/api/v1/public/booking/appointments/${apptId}/feedback`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating, review })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
      } else {
        setError(data.message || 'Failed to submit feedback. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center animate-[slideInUp_0.5s_ease-out]">
          <div className="w-20 h-20 bg-[#d1fae5] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="material-symbols-outlined text-[40px] text-[#059669]">check_circle</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a] mb-3">Thank You!</h1>
          <p className="text-[#475569] mb-8 leading-relaxed">
            Your feedback has been successfully submitted. We appreciate you taking the time to help us improve our services.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold py-3.5 rounded-xl transition shadow-md"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#003fb1] to-[#3b82f6]"></div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#e0e7ff] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[#003fb1] text-3xl">star_rate</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a] mb-2">Rate Your Visit</h1>
          <p className="text-[#64748b]">Please let us know how your recent appointment went.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#fee2e2] text-[#b91c1c] rounded-xl text-sm font-medium flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Star Rating */}
          <div className="flex flex-col items-center">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <span className={`material-symbols-outlined text-[48px] ${
                    star <= (hoverRating || rating) ? 'text-[#fbbf24]' : 'text-[#cbd5e1]'
                  } transition-colors duration-200`} style={{ fontVariationSettings: star <= (hoverRating || rating) ? "'FILL' 1" : "'FILL' 0" }}>
                    star
                  </span>
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-[#475569] mt-3">
              {rating === 1 && "Very Dissatisfied"}
              {rating === 2 && "Dissatisfied"}
              {rating === 3 && "Neutral"}
              {rating === 4 && "Satisfied"}
              {rating === 5 && "Very Satisfied"}
              {rating === 0 && "Select a rating"}
            </p>
          </div>

          {/* Text Review */}
          <div>
            <label className="block text-sm font-bold text-[#334155] mb-2">Additional Comments (Optional)</label>
            <textarea 
              rows={4}
              className="w-full px-4 py-3 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] text-[#0f172a] resize-none transition-shadow"
              placeholder="Tell us what you liked or how we can improve..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              disabled={isSubmitting || !apptId || !token}
            ></textarea>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting || !apptId || !token}
            className="w-full bg-[#006f4b] hover:bg-[#005438] disabled:bg-[#94a3b8] text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin">refresh</span>
            ) : (
              <>
                <span className="material-symbols-outlined">send</span>
                Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientFeedbackPage;
