import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export const useReview = (initialReviews = []) => {
  // State management - use initialReviews from Laravel controller
  const [reviews, setReviews] = useState(initialReviews);
  const [categories, setCategories] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  
  const [newReview, setNewReview] = useState({
    rate: 0,
    fullname: '',
    category_id: '',
    barangay: '',
    purok: '',
    review_content: '',
    additional_comments: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [hoverRating, setHoverRating] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [availablePuroks, setAvailablePuroks] = useState([]);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch('/categoryFetch');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories || []);
      } else {
        throw new Error(data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(prev => prev || `Categories: ${err.message}`);
    }
  };

  // Fetch barangay data from API
  const fetchBarangayData = async () => {
    try {
      const response = await fetch('/barangayFetch');
      
      if (!response.ok) {
        throw new Error('Failed to fetch barangay data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform the API response to match your expected format
        const transformedBarangays = data.barangays.map(barangay => ({
          id: barangay.id,
          name: barangay.baranggay_name,
          puroks: barangay.puroks ? barangay.puroks.map(purok => ({
            id: purok.id,
            name: purok.purok_name
          })) : []
        }));
        
        setBarangays(transformedBarangays);
      } else {
        throw new Error(data.message || 'Failed to fetch barangay data');
      }
    } catch (err) {
      console.error('Error fetching barangay data:', err);
      setError(prev => prev || `Barangays: ${err.message}`);
    }
  };

  // Fetch both categories and barangays on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both categories and barangays in parallel
        await Promise.all([
          fetchCategories(),
          fetchBarangayData()
        ]);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update available puroks when barangay changes
  useEffect(() => {
    if (newReview.barangay) {
      const selectedBarangay = barangays.find(b => b.name === newReview.barangay);
      setAvailablePuroks(selectedBarangay?.puroks || []);
      setNewReview(prev => ({ ...prev, purok: '' }));
    } else {
      setAvailablePuroks([]);
    }
  }, [newReview.barangay, barangays]);

  const steps = [
    { number: 1, title: 'Rating', description: 'How was your experience?' },
    { number: 2, title: 'Personal Info', description: 'Tell us about yourself' },
    { number: 3, title: 'Service Details', description: 'Service type and location' },
    { number: 4, title: 'Review Content', description: 'Share your experience' }
  ];

  // Updated handleSubmitReview to use API
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    // Validation
    if (newReview.rate === 0 || !newReview.review_content.trim() || !newReview.category_id) {
      setSubmitResult({
        success: false,
        message: 'Please fill in all required fields: rating, service type, and review content.'
      });
      return;
    }

    // Find purok_id from selected barangay and purok
    const selectedBarangay = barangays.find(b => b.name === newReview.barangay);
    const selectedPurok = selectedBarangay?.puroks.find(p => p.name === newReview.purok);
    
    if (!selectedPurok) {
      setSubmitResult({
        success: false,
        message: 'Please select a valid barangay and purok.'
      });
      return;
    }

    try {
      setSubmitting(true);
      setSubmitResult(null);

      // Prepare data for API
      const reviewData = {
        fullname: newReview.fullname || 'Anonymous User',
        purok_id: selectedPurok.id,
        category_id: parseInt(newReview.category_id),
        review_content: newReview.review_content,
        suggestion_content: newReview.additional_comments || '',
        rate: parseInt(newReview.rate)
      };


      const response = await fetch('/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned an invalid response. Please try again.');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Server error: ${response.status}`);
      }

      if (result.success) {
        // Check if review was flagged
        if (result.flagged) {
          const fieldName = result.field === 'suggestion_content' ? 'Additional Suggestions' : 'Review Content';
          
          // Show flagged content alert
          await Swal.fire({
            icon: 'error',
            title: 'Review Not Submitted',
            html: `
              <p class="text-gray-700 mb-4">Your <strong>${fieldName}</strong> contains inappropriate content and cannot be submitted.</p>
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <p class="text-sm font-semibold text-red-800 mb-2">Flagged Content:</p>
                <p class="text-sm text-red-700">${result.message || 'Please review your content and remove any inappropriate language.'}</p>
              </div>
              <p class="text-sm text-gray-600 mt-4">Please edit your ${fieldName.toLowerCase()} and resubmit.</p>
            `,
            confirmButtonText: 'Edit Review',
            confirmButtonColor: '#ef4444',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'px-6 py-3 rounded-xl'
            }
          });
          
          return; // Don't reset form, allow user to edit
        }

        // Success - update local state with the new review
        const savedReview = {
          id: result.review.id,
          fullname: result.review.fullname,
          category_id: result.review.category_id,
          review_content: result.review.review_content,
          additional_comments: result.review.suggestion_content,
          rate: result.review.rate,
          barangay: newReview.barangay,
          purok: newReview.purok,
          created_at: result.review.created_at,
          category: categories.find(cat => cat.id === result.review.category_id) || { 
            id: result.review.category_id, 
            category_name: 'Unknown Category' 
          },
          replies: null,
          status: result.review.status
        };

        // Add to local state (only if approved, or you can filter by status later)
        if (result.status === 'approved') {
          setReviews(prev => [savedReview, ...prev]);
        }

        // Reset form
        setNewReview({ 
          rate: 0,
          fullname: '',
          category_id: '',
          barangay: '',
          purok: '',
          review_content: '',
          additional_comments: ''
        });
        setCurrentStep(1);
        setCurrentPage(1);

        // Show success message with SweetAlert
        await Swal.fire({
          icon: 'success',
          title: 'Review Submitted!',
          html: `
            <p class="text-gray-700 mb-2">${result.message}</p>
            ${result.status === 'pending' ? '<p class="text-sm text-gray-600">Your review is pending admin approval.</p>' : ''}
          `,
          confirmButtonText: 'Great!',
          confirmButtonColor: '#10b981',
          timer: 3000,
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'px-6 py-3 rounded-xl'
          }
        });

      } else {
        throw new Error(result.message || 'Failed to submit review');
      }

    } catch (err) {
      console.error('Error submitting review:', err);
      
      // Show error message with SweetAlert
      await Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        html: `
          <p class="text-gray-700">${err.message || 'An error occurred while submitting your review. Please try again.'}</p>
        `,
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-6 py-3 rounded-xl'
        }
      });
      
      setSubmitResult({
        success: false,
        message: err.message || 'An error occurred while submitting your review. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleHelpful = (reviewId) => {
    console.log('Marked review as helpful:', reviewId);
  };

  // Filter and sort ALL reviews (only show approved reviews)
  const filteredAndSortedReviews = reviews
    .filter(review => {
      // Only show approved reviews or reviews without status (for backward compatibility)
      if (review.status && review.status !== 'approved') return false;
      
      if (activeFilter === 'all') return true;
      return review.rate === parseInt(activeFilter);
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'highest') return b.rate - a.rate;
      if (sortBy === 'lowest') return a.rate - b.rate;
      return 0;
    });

  // Pagination calculations
  const totalReviews = filteredAndSortedReviews.length;
  const totalPages = Math.ceil(totalReviews / itemsPerPage);
  
  // Get current page reviews
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = filteredAndSortedReviews.slice(startIndex, endIndex);

  // Pagination functions
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return newReview.rate > 0;
      case 2:
        return true;
      case 3:
        return newReview.category_id && newReview.barangay && newReview.purok;
      case 4:
        return newReview.review_content.trim().length > 0;
      default:
        return false;
    }
  };

  return {
    reviews: currentReviews,
    allReviews: filteredAndSortedReviews,
    categories,
    barangays,
    newReview,
    currentStep,
    hoverRating,
    activeFilter,
    sortBy,
    availablePuroks,
    loading,
    submitting,
    error,
    submitResult,
    
    pagination: {
      currentPage,
      totalPages,
      totalReviews,
      itemsPerPage,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalReviews)
    },
    
    steps,
    
    setNewReview,
    setCurrentStep,
    setHoverRating,
    setActiveFilter,
    setSortBy,
    handleSubmitReview,
    nextStep,
    prevStep,
    handleHelpful,
    isStepValid,
    
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage,
    clearSubmitResult: () => setSubmitResult(null)
  };
};