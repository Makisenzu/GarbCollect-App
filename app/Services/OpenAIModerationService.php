<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAIModerationService
{
    public function moderate(string $content): array
    {
        $apiKey = config('services.openai.key');

        if (!$apiKey) {
            Log::error('OpenAI API key is not configured.');
            return ['flagged' => false, 'error' => 'API not configured'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(15)
             ->post('https://api.openai.com/v1/moderations', [
                'input' => $content
            ]);

            if (!$response->successful()) {
                Log::error('OpenAI API request failed: ' . $response->body());
                return ['flagged' => false, 'error' => 'API request failed'];
            }

            $data = $response->json();
            $result = $data['results'][0];
            return [
                'flagged' => $result['flagged'],
                'categories' => $result['categories'],
                'category_scores' => $result['category_scores']
            ];

        } catch (\Exception $e) {
            Log::error('OpenAI Moderation Error: ' . $e->getMessage());
            return ['flagged' => false, 'error' => $e->getMessage()];
        }
    }
}