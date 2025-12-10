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
        
        // Moderate both review content and suggestions
        $reviewModerationResult = $this->moderationService->moderateWithFallback($request->review_content);
        
        Log::info('Review content moderation result: ' . json_encode($reviewModerationResult));
        
        // Check if there are suggestions to moderate
        $suggestionModerationResult = null;
        if (!empty($request->suggestion_content)) {
            $suggestionModerationResult = $this->moderationService->moderateWithFallback($request->suggestion_content);
            Log::info('Suggestion content moderation result: ' . json_encode($suggestionModerationResult));
        }
    
        // Check if review content is flagged
        if (!isset($reviewModerationResult['error']) && $reviewModerationResult['flagged']) {
            $flaggedCategories = $reviewModerationResult['categories'] ?? [];
            $categoryNames = array_keys(array_filter($flaggedCategories, fn($val) => $val === true));
            
            Log::warning('Review rejected due to inappropriate content in review', [
                'flags' => $categoryNames,
                'content' => substr($request->review_content, 0, 100)
            ]);
            
            return response()->json([
                'success' => true,
                'flagged' => true,
                'message' => 'Your review contains inappropriate content (' . implode(', ', $categoryNames) . '). Please remove offensive language and try again.',
                'categories' => $categoryNames,
                'field' => 'review_content'
            ], 200);
        }
        
        // Check if suggestions content is flagged
        if ($suggestionModerationResult && !isset($suggestionModerationResult['error']) && $suggestionModerationResult['flagged']) {
            $flaggedCategories = $suggestionModerationResult['categories'] ?? [];
            $categoryNames = array_keys(array_filter($flaggedCategories, fn($val) => $val === true));
            
            Log::warning('Review rejected due to inappropriate content in suggestions', [
                'flags' => $categoryNames,
                'content' => substr($request->suggestion_content, 0, 100)
            ]);
            
            return response()->json([
                'success' => true,
                'flagged' => true,
                'message' => 'Your additional suggestions contain inappropriate content (' . implode(', ', $categoryNames) . '). Please remove offensive language and try again.',
                'categories' => $categoryNames,
                'field' => 'suggestion_content'
            ], 200);
        }
    
        $status = 'pending';
        $moderationFlags = null;
    
        if (isset($reviewModerationResult['error']) || ($suggestionModerationResult && isset($suggestionModerationResult['error']))) {
            Log::warning('Moderation API failed. Review left for manual review.');
        } elseif (!$reviewModerationResult['flagged'] && (!$suggestionModerationResult || !$suggestionModerationResult['flagged'])) {
            $status = 'approved';
            Log::info('Review approved by moderation');
        }
    
        try {
            $review = Review::create([
                'fullname' => $request->fullname,
                'purok_id' => $request->purok_id,
                'category_id' => $request->category_id,
                'review_content' => $request->review_content,
                'suggestion_content' => $request->suggestion_content ?? '',
                'rate' => $request->rate,
                'status' => $status,
                'moderation_flags' => $moderationFlags,
            ]);
    
            Log::info('Review saved successfully', ['review_id' => $review->id]);
    
            return response()->json([
                'success' => true,
                'flagged' => false,
                'message' => $status === 'approved' 
                    ? 'Thank you for your review!' 
                    : 'Thank you for your review! It will be visible after a quick check by our team.',
                'status' => $status,
                'review' => $review,
                'moderation_result' => [
                    'review' => $reviewModerationResult,
                    'suggestion' => $suggestionModerationResult
                ]
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