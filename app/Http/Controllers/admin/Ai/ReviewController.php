<?php

namespace App\Http\Controllers\admin\Ai;

use App\Models\Review;
use App\Http\Requests\StoreReviewRequest;
use App\Services\OpenRouterModerationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class ReviewController extends Controller
{
    protected $moderationService;

    public function __construct(OpenRouterModerationService $moderationService){
        $this->moderationService = $moderationService;
    }

    public function store(StoreReviewRequest $request): JsonResponse{
        Log::info('Received review submission', ['data' => $request->all()]);
        
        $moderationResult = $this->moderationService->moderateWithFallback($request->review_content);
        
        Log::info('Moderation result: ' . json_encode($moderationResult));
    
        $status = 'pending';
        $moderationFlags = null;
    
        if (isset($moderationResult['error'])) {
            Log::warning('Moderation API failed. Review left for manual review.', ['error' => $moderationResult['error']]);
        } elseif (!$moderationResult['flagged']) {
            $status = 'approved';
            Log::info('Review approved by moderation');
        } else {
            $moderationFlags = json_encode($moderationResult['categories']);
            Log::info('Review flagged for moderation', ['flags' => $moderationResult['categories']]);
        }
    
        try {
            $review = Review::create([
                'fullname' => $request->fullname,
                'purok_id' => $request->purok_id,
                'category_id' => $request->category_id,
                'review_content' => $request->review_content,
                'suggestion_content' => $request->suggestion_content,
                'rate' => $request->rate,
                'status' => $status,
                'moderation_flags' => $moderationFlags,
            ]);
    
            Log::info('Review saved successfully', ['review_id' => $review->id]);
    
            return response()->json([
                'success' => true,
                'message' => $status === 'approved' 
                    ? 'Thank you for your review! It is now live.' 
                    : 'Thank you for your review! It will be visible after a quick check by our team.',
                'status' => $status,
                'review' => $review,
                'moderation_result' => $moderationResult
            ]);
    
        } catch (\Exception $e) {
            Log::error('Database error saving review: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error saving review: ' . $e->getMessage()
            ], 500);
        }
    }

    public function index(){
        $reviews = Review::where('status', 'approved')
                    ->with('reply')
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json($reviews);
    }

    public function pending(){
        $pendingReviews = Review::where('status', 'pending')
                          ->with('purok', 'category')
                          ->orderBy('created_at', 'desc')
                          ->get();

        return response()->json($pendingReviews);
    }

    public function updateStatus(Review $review, Request $request){
        $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        $review->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Review status updated successfully',
            'review' => $review
        ]);
    }
}