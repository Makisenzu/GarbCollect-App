<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected $apiKey;
    protected $apiUrl;
    protected $senderName;

    public function __construct()
    {
        $this->apiKey = config('services.semaphore.api_key');
        $this->apiUrl = config('services.semaphore.api_url', 'https://api.semaphore.co/api/v4/messages');
        $this->senderName = config('services.semaphore.sender_name', 'GarbCollect');
    }

    /**
     * Send SMS message
     *
     * @param string $phoneNumber
     * @param string $message
     * @return bool
     */
    public function sendSms(string $phoneNumber, string $message): bool
    {
        try {
            if (empty($this->apiKey)) {
                Log::warning('Semaphore API key not configured');
                return false;
            }

            $phoneNumber = $this->formatPhoneNumber($phoneNumber);

            $response = Http::post($this->apiUrl, [
                'apikey' => $this->apiKey,
                'number' => $phoneNumber,
                'message' => $message,
                'sendername' => $this->senderName
            ]);

            if ($response->successful()) {
                Log::info('SMS sent successfully to: ' . $phoneNumber);
                return true;
            }

            Log::error('Failed to send SMS: ' . $response->body());
            return false;

        } catch (\Exception $e) {
            Log::error('SMS sending exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Format phone number to Philippine format
     *
     * @param string $phoneNumber
     * @return string
     */
    protected function formatPhoneNumber(string $phoneNumber): string
    {
        $phoneNumber = preg_replace('/[^0-9]/', '', $phoneNumber);

        if (strlen($phoneNumber) === 10 && substr($phoneNumber, 0, 1) === '9') {
            $phoneNumber = '63' . $phoneNumber;
        } elseif (strlen($phoneNumber) === 11 && substr($phoneNumber, 0, 2) === '09') {
            $phoneNumber = '63' . substr($phoneNumber, 1);
        } elseif (strlen($phoneNumber) === 12 && substr($phoneNumber, 0, 2) !== '63') {
            $phoneNumber = substr($phoneNumber, -10);
            $phoneNumber = '63' . $phoneNumber;
        }

        return $phoneNumber;
    }

    /**
     * Send driver assignment SMS
     *
     * @param string $phoneNumber
     * @param string $driverName
     * @param string $barangay
     * @param string $collectionDate
     * @param string $collectionTime
     * @return bool
     */
    public function sendDriverAssignmentSms(
        string $phoneNumber,
        string $driverName,
        string $barangay,
        string $collectionDate,
        string $collectionTime
    ): bool {
        $message = "Hi {$driverName}!\n\n"
            . "You have been assigned a new garbage collection schedule:\n"
            . "Barangay: {$barangay}\n"
            . "Date: {$collectionDate}\n"
            . "Time: {$collectionTime}\n\n"
            . "Please check your email for more details.\n\n"
            . "- GarbCollect Team";

        return $this->sendSms($phoneNumber, $message);
    }
}
