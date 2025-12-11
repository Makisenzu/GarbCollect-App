<?php

namespace App\Http\Controllers\User;

use Exception;
use App\Models\Site;
use Inertia\Inertia;
use App\Models\Review;
use App\Models\Category;
use App\Models\Schedule;
use App\Models\Baranggay;
use Illuminate\Http\Request;

use function Termwind\render;
use function Pest\Laravel\get;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function applicantIndex() {
        return Inertia::render('Users/Applicant');
    }

    public function showBarangayRoutes(){
        return Inertia::render('Users/components/SitesComponents/BarangayRoutes', [
            'mapboxToken' => env('MAPBOX_ACCESS_TOKEN'),
        ]);
    }

    // public function getSite(){
    //     $sites = Site::with(['purok.baranggay'])->get();
    //     return response()->json([
    //         'sites' => $sites
    //     ]);
    // }

    public function showMyLocation() {
        $sites = Site::with(['purok.baranggay'])->get();
        return Inertia::render('Users/components/ThrowGarbageComponents/MyLocation', [
            'mapboxToken' => env('MAPBOX_ACCESS_TOKEN'),
            'sites' => $sites
        ]);
    }

    public function getBarangay() {
        try {
            $barangayData = Baranggay::all();
            return response()->json([
                'success' => true,
                'barangay_data' => $barangayData
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch barangay',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getActiveSite($barangayId) {
        try {
            $barangaySites = Site::whereHas('purok.baranggay', function($query) use ($barangayId) {
                $query->where('id', $barangayId);
            })
            ->where('status', 'active')
            ->with(['purok.baranggay'])
            ->get();

            $station = Site::where('type', 'station')
                ->where('status', 'active')
                ->with(['purok.baranggay'])
                ->first();

            $sites = $barangaySites;
            if ($station && !$sites->contains('id', $station->id)) {
                $sites = $sites->push($station);
            }
    
            return response()->json([
                'success' => true,
                'message' => 'Successfully get site data',
                'data' => $sites
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get site for this barangay',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getBarangaySchedule($id, Request $request) {
        try {
            $filter = $request->query('filter', 'week');
            
            $query = Schedule::with(['barangay', 'driver'])
                ->where('barangay_id', $id);
            
            switch ($filter) {
                case 'today':
                    $query->whereDate('collection_date', today())
                          ->whereNotIn('status', ['completed', 'reported', 'FAILED']);
                    break;
                case 'week':
                    $query->whereBetween('collection_date', [
                        today(),
                        today()->addDays(6)
                    ])
                    ->whereNotIn('status', ['completed', 'reported', 'FAILED']);
                    break;
                case 'monthly':
                    $query->whereYear('collection_date', today()->year)
                          ->whereMonth('collection_date', today()->month)
                          ->whereNotIn('status', ['FAILED']);
                    break;
                default:
                    $query->where('collection_date', '>=', today())
                          ->whereNotIn('status', ['completed', 'reported', 'FAILED']);
            }
            
            $barangaySchedule = $query->orderBy('collection_date', 'asc')
                ->orderBy('collection_time', 'asc')
                ->get();
                
            return response()->json([
                'success' => true,
                'message' => 'Successfully fetch barangay schedule',
                'barangaySchedule' => $barangaySchedule
            ]); 
        }catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get schedule for that barangay',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getBarangayData() {
        try {
            $barangays = Baranggay::with('puroks')->get();
            return response()->json([
                'success' => true,
                'message' => 'Fetch barangay data successfully',
                'barangays' => $barangays
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get barangay',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getCategory() {
        try {
            $categories = Category::all();
            return response()->json([
                'success' => true,
                'message' => 'Fetch categories successfully',
                'categories' => $categories
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve categories',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function renderReview(){
        $reviews = Review::with(['purok.baranggay', 'category', 'replies'])
            ->where('status', 'approved')
            ->orderBy('created_at', 'desc')
            ->get();

        $allReviews = Review::all();
        $averageRating = $allReviews->avg('rate') ?? 0;
        
        $ratingDistribution = [
            5 => $allReviews->where('rate', 5)->count(),
            4 => $allReviews->where('rate', 4)->count(),
            3 => $allReviews->where('rate', 3)->count(),
            2 => $allReviews->where('rate', 2)->count(),
            1 => $allReviews->where('rate', 1)->count(),
        ];
    
        $totalReviewsCount = $allReviews->count();
    
        $transformedReviews = $reviews->map(function ($review) {
            return [
                'id' => $review->id,
                'fullname' => $review->fullname,
                'category_id' => $review->category_id,
                'review_content' => $review->review_content,
                'additional_comments' => $review->suggestion_content,
                'rate' => $review->rate,
                'barangay' => $review->purok->baranggay->baranggay_name ?? 'Unknown Barangay',
                'purok' => $review->purok->purok_name ?? 'Unknown Purok',
                'created_at' => $review->created_at->toISOString(),
                'category' => [
                    'id' => $review->category->id,
                    'category_name' => $review->category->category_name
                ],
                'replies' => $review->replies ? [
                    'id' => $review->replies->id,
                    'review_id' => $review->replies->review_id,
                    'reply_content' => $review->replies->reply_content,
                    'created_at' => $review->replies->created_at->toISOString()
                ] : null,
                'status' => $review->status
            ];
        });
    
        return Inertia::render('Users/components/ReviewsComponents/ReviewDashboard', [
            'reviews' => $transformedReviews,
            'reviews_count' => $transformedReviews->count(),
            'total_reviews_count' => $totalReviewsCount,
            'average_rating' => round($averageRating, 1),
            'rating_distribution' => $ratingDistribution
        ]);
    }


    public function getReviews () {
        try {

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get reviews',
                'error' => $e->getMessage()
            ]);
        }
    }


    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
