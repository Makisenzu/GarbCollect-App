<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenRouterModerationService
{
    public function moderate(string $content): array
    {
        $apiKey = config('services.openrouter.key');
        $apiUrl = 'https://openrouter.ai/api/v1';

        if (!$apiKey) {
            Log::error('OpenRouter API key is not configured.');
            return ['flagged' => false, 'error' => 'API not configured'];
        }

        try {
            Log::info('Sending content to OpenRouter for moderation: ' . substr($content, 0, 100));

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
                'HTTP-Referer' => 'http://localhost:8000',
                'X-Title' => 'Review Moderation System',
            ])->timeout(30)
             ->post($apiUrl . '/chat/completions', [
                'model' => 'openai/gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a content moderation system. Analyze the text for toxicity, hate speech, harassment, or inappropriate content. Respond with JSON only: {"flagged": boolean, "reason": string, "categories": {"toxic": boolean, "hate": boolean, "harassment": boolean, "explicit": boolean}}'
                    ],
                    [
                        'role' => 'user',
                        'content' => "Analyze this text for moderation: " . $content
                    ]
                ],
                'response_format' => ['type' => 'json_object'],
                'max_tokens' => 100,
                'temperature' => 0.1
            ]);

            Log::info('OpenRouter API response status: ' . $response->status());

            if (!$response->successful()) {
                Log::error('OpenRouter API request failed.', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                return ['flagged' => false, 'error' => 'API request failed: ' . $response->status()];
            }

            $data = $response->json();
            
            Log::info('OpenRouter full response:', $data);
            
            if (!isset($data['choices'][0]['message']['content'])) {
                Log::error('OpenRouter API returned unexpected format', ['response' => $data]);
                return ['flagged' => false, 'error' => 'Unexpected API response format'];
            }
            
            $moderationResult = json_decode($data['choices'][0]['message']['content'], true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Failed to parse JSON response from OpenRouter', [
                    'content' => $data['choices'][0]['message']['content'],
                    'error' => json_last_error_msg()
                ]);
                return ['flagged' => false, 'error' => 'Failed to parse moderation result'];
            }
            
            Log::info('OpenRouter moderation result - Flagged: ' . ($moderationResult['flagged'] ? 'YES' : 'NO'));
            
            return [
                'flagged' => $moderationResult['flagged'] ?? false,
                'categories' => $moderationResult['categories'] ?? [],
                'reason' => $moderationResult['reason'] ?? '',
                'raw_response' => $data 
            ];

        } catch (\Exception $e) {
            Log::error('OpenRouter Moderation Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return ['flagged' => false, 'error' => $e->getMessage()];
        }
    }

    public function moderateWithFallback(string $content): array
    {
        $apiResult = $this->moderate($content);
        
        if (isset($apiResult['error'])) {
            Log::warning('OpenRouter API failed, using basic filter', ['error' => $apiResult['error']]);
            return $this->basicContentFilter($content);
        }
        
        return $apiResult;
    }

    private function basicContentFilter(string $content): array
    {
        $toxicWords = [
            'fuck', 'shit', 'asshole', 'bastard', 'bitch', 'cunt', 
            'nigger', 'retard', 'fag', 'faggot', 'kill', 'hate', 
            'stupid', 'idiot', 'terrorist', 'suicide', 'murder'
        ];
        
        $contentLower = strtolower($content);
        $flagged = false;
        $foundWords = [];
        $categories = [];

        foreach ($toxicWords as $word) {
            if (str_contains($contentLower, $word)) {
                $flagged = true;
                $foundWords[] = $word;

                if (in_array($word, ['fuck', 'shit', 'asshole', 'bastard', 'bitch', 'cunt'])) {
                    $categories['explicit'] = true;
                } elseif (in_array($word, ['nigger', 'retard', 'fag', 'faggot'])) {
                    $categories['hate'] = true;
                } elseif (in_array($word, ['kill', 'murder', 'terrorist', 'suicide'])) {
                    $categories['violent'] = true;
                } elseif (in_array($word, ['hate', 'stupid', 'idiot'])) {
                    $categories['harassment'] = true;
                }
            }
        }

        if ($flagged) {
            Log::info('Content flagged by basic filter', [
                'found_words' => $foundWords,
                'categories' => $categories
            ]);
            
            return [
                'flagged' => true,
                'categories' => $categories,
                'category_scores' => array_fill_keys(array_keys($categories), 0.9),
                'filter_type' => 'basic',
                'found_words' => $foundWords,
                'reason' => 'Contains inappropriate language: ' . implode(', ', $foundWords)
            ];
        }

        return [
            'flagged' => false,
            'categories' => [],
            'category_scores' => [],
            'filter_type' => 'basic',
            'reason' => 'Content appears appropriate'
        ];
    }

    public function getAvailableModels(): array
    {
        $apiKey = config('services.openrouter.key');
        $apiUrl = 'https://openrouter.ai/api/v1';

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
            ])->get($apiUrl . '/models');

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Error fetching OpenRouter models: ' . $e->getMessage());
            return [];
        }
    }
}