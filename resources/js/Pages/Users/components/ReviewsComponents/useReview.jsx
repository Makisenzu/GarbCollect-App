import { useState, useEffect } from 'react';

const staticReviews = [
  {
    id: 1,
    fullname: 'Sarah Johnson',
    category_id: 1,
    review_content: 'The garbage collection service in our area has improved significantly. Regular and efficient.',
    additional_comments: 'Would be great if they could come a bit earlier in the morning.',
    rate: 5,
    barangay: 'Barangay 1',
    purok: 'Purok 1A',
    site_name: 'Collection Point A',
    created_at: '2024-01-15T10:30:00Z',
    category: { id: 1, category_name: 'General Waste Collection' },
    replies: null
  },
  {
    id: 2,
    fullname: 'Michael Chen',
    category_id: 2,
    review_content: 'Excellent recycling service. They properly sort all materials and the schedule is reliable.',
    additional_comments: 'More frequent collection during holidays would be helpful.',
    rate: 4,
    barangay: 'Barangay 2',
    purok: 'Purok 2A',
    site_name: 'Collection Point E',
    created_at: '2024-01-12T14:20:00Z',
    category: { id: 2, category_name: 'Recycling Service' },
    replies: {
      id: 1,
      review_id: 2,
      reply_content: 'Thank you for your feedback! We are working on improving holiday schedules.',
      created_at: '2024-01-12T16:45:00Z'
    }
  },
  {
    id: 3,
    fullname: 'Emily Rodriguez',
    category_id: 4,
    review_content: 'Scheduled a bulky item pickup but there was a delay. However, customer service was responsive.',
    additional_comments: 'Better communication about delays would be appreciated.',
    rate: 3,
    barangay: 'Barangay 3',
    purok: 'Purok 3B',
    site_name: 'Collection Point L',
    created_at: '2024-01-08T09:15:00Z',
    category: { id: 4, category_name: 'Bulky Item Pickup' },
    replies: null
  },
  {
    id: 4,
    fullname: 'John Smith',
    category_id: 3,
    review_content: 'Organic waste collection is very efficient. The compost produced is excellent for gardening.',
    additional_comments: 'Could you provide more compost bins for larger households?',
    rate: 5,
    barangay: 'Barangay 1',
    purok: 'Purok 1B',
    site_name: 'Collection Point D',
    created_at: '2024-01-05T08:45:00Z',
    category: { id: 3, category_name: 'Organic Waste' },
    replies: null
  },
  {
    id: 5,
    fullname: 'Maria Garcia',
    category_id: 6,
    review_content: 'Commercial waste collection for our restaurant has been very reliable. Always on time.',
    additional_comments: 'Please consider later pickup times for businesses that close late.',
    rate: 4,
    barangay: 'Barangay 2',
    purok: 'Purok 2B',
    site_name: 'Collection Point H',
    created_at: '2024-01-03T11:20:00Z',
    category: { id: 6, category_name: 'Commercial Collection' },
    replies: {
      id: 2,
      review_id: 5,
      reply_content: 'Thank you for the suggestion! We will review our commercial collection schedules.',
      created_at: '2024-01-04T09:30:00Z'
    }
  }
];

export const useReview = () => {
  // State management
  const [reviews, setReviews] = useState(staticReviews);
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

  // Statistics - calculated from ALL reviews data (not just paginated)
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rate, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(review => review.rate === stars).length,
    percentage: (reviews.filter(review => review.rate === stars).length / reviews.length) * 100
  }));

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

      console.log('Submitting review:', reviewData);

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
          site_name: 'Default Collection Point',
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

        // Show success message
        setSubmitResult({
          success: true,
          message: result.message,
          status: result.status,
          review: savedReview
        });

        // Auto-clear success message after 5 seconds
        setTimeout(() => {
          setSubmitResult(null);
        }, 5000);

      } else {
        throw new Error(result.message || 'Failed to submit review');
      }

    } catch (err) {
      console.error('Error submitting review:', err);
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
    
    averageRating,
    ratingDistribution,
    
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