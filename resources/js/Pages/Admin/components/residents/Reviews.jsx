import React from "react";
import { Star, MessageCircle, User } from 'lucide-react';
export default function Reviews() {
    const reviews = [
        {
          id: 1,
          user: 'Maria Santos',
          role: 'Resident',
          barangay: 'San Isidro',
          rating: 4.8,
          comment: 'The resident management system has made our record-keeping so much more efficient. Highly recommended!',
          date: '2 days ago',
          avatar: null
        },
        {
          id: 2,
          user: 'Juan dela Cruz',
          role: 'Resident',
          barangay: 'Alegria',
          rating: 4.5,
          comment: 'Easy to use and has all the features we need for managing resident information.',
          date: '1 week ago',
          avatar: null
        },
        {
          id: 3,
          user: 'Ana Rodriguez',
          role: 'Barangay Secretary',
          barangay: 'Barangay 1',
          rating: 5.0,
          comment: 'The reporting features have saved us countless hours of manual work. Excellent system!',
          date: '3 days ago',
          avatar: null
        }
      ];
    
      return (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Reviews</h2>
              {/* <p className="text-gray-600">San Francisco u</p> */}
            </div>
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-800">4.8/5</span>
            </div>
          </div>
    
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      {review.avatar ? (
                        <img src={review.avatar} alt={review.user} className="w-12 h-12 rounded-full" />
                      ) : (
                        <User className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{review.user}</h4>
                      <p className="text-sm text-gray-600">{review.role}</p>
                      <p className="text-sm text-blue-600">{review.barangay}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-800">{review.rating}</span>
                  </div>
                </div>
    
                <p className="text-gray-700 mb-4">{review.comment}</p>
    
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{review.date}</span>
                  <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
    
          <div className="mt-8 text-center">
            <button className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              View All Reviews
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      );
}